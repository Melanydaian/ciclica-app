import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { getCurrentPhase, calcularPromedioCiclo } from '@/lib/cycle-utils'
import {
  ASISTENTE_OPENAI_MODEL,
  ASISTENTE_ANTHROPIC_MODEL,
  buildSystemPrompt,
  type AsistenteContext,
} from '@/lib/asistente'

export const runtime = 'nodejs'
export const maxDuration = 60

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const HAS_OPENAI = !!process.env.OPENAI_API_KEY
const HAS_ANTHROPIC = !!process.env.ANTHROPIC_API_KEY

// Generador de texto vía OpenAI (proveedor principal).
async function* openaiTextStream(system: string, messages: ChatMessage[]) {
  const openai = new OpenAI()
  const stream = await openai.chat.completions.create({
    model: ASISTENTE_OPENAI_MODEL,
    max_tokens: 1500,
    stream: true,
    messages: [{ role: 'system', content: system }, ...messages],
  })
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}

// Generador de texto vía Anthropic Sonnet (respaldo).
async function* anthropicTextStream(system: string, messages: ChatMessage[]) {
  const anthropic = new Anthropic()
  const stream = anthropic.messages.stream({
    model: ASISTENTE_ANTHROPIC_MODEL,
    max_tokens: 1500,
    thinking: { type: 'disabled' },
    system,
    messages,
  })
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'No autenticada' }, { status: 401 })

  if (!HAS_OPENAI && !HAS_ANTHROPIC) {
    return NextResponse.json({ error: 'El asistente no está configurado' }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  const raw: unknown = body?.messages
  const safeMessages: ChatMessage[] = (Array.isArray(raw) ? raw : [])
    .filter(
      (m): m is ChatMessage =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))

  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
  }

  const admin = createAdminSupabase()
  const { data: webUser } = await admin
    .from('usuarias_web')
    .select('telefono, nombre, suscripcion_activa')
    .eq('email', user.email)
    .maybeSingle()

  if (!webUser?.telefono) {
    return NextResponse.json({ error: 'Sin teléfono vinculado' }, { status: 400 })
  }
  if (!webUser.suscripcion_activa) {
    return NextResponse.json({ error: 'Función premium' }, { status: 403 })
  }

  // Contexto del ciclo para personalizar las recomendaciones (solo lectura).
  const { data: usuaria } = await admin
    .from('usuarias')
    .select('nombre, fecha_inicio_ciclo, duracion_ciclo, promedio_duracion_ciclo, objetivo, toma_anticonceptivas')
    .eq('telefono', webUser.telefono)
    .maybeSingle()

  const telefonoVariants = [
    webUser.telefono,
    `=${webUser.telefono}`,
    `+${webUser.telefono}`,
    `${webUser.telefono}@s.whatsapp.net`,
  ]

  const [{ data: regs }, { data: ciclos }] = await Promise.all([
    admin
      .from('registros_ciclo')
      .select('sintoma, created_at')
      .in('telefono', telefonoVariants)
      .order('created_at', { ascending: false })
      .limit(40),
    admin
      .from('historial_ciclos')
      .select('duracion_dias')
      .in('telefono', telefonoVariants)
      .order('fecha_inicio', { ascending: false })
      .limit(6),
  ])

  const pastCycles = (ciclos ?? [])
    .map((c) => ({ length: c.duracion_dias ?? 28 }))
    .filter((c) => c.length >= 15 && c.length <= 60)
  const cycleLength =
    usuaria?.promedio_duracion_ciclo ??
    usuaria?.duracion_ciclo ??
    calcularPromedioCiclo(pastCycles)

  const lastPeriod = usuaria?.fecha_inicio_ciclo ? new Date(usuaria.fecha_inicio_ciclo) : null
  const phaseData = lastPeriod ? getCurrentPhase(lastPeriod, cycleLength, 5) : null

  const sintomasRecientes = Array.from(
    new Set(
      (regs ?? [])
        .map((r) => (r.sintoma ?? '').toLowerCase().trim())
        .filter(Boolean)
    )
  ).slice(0, 6)

  const ctx: AsistenteContext = {
    nombre: usuaria?.nombre ?? webUser.nombre ?? 'vos',
    fase: phaseData?.phase ?? null,
    dayOfCycle: phaseData?.dayOfCycle ?? null,
    daysUntilNextPeriod: phaseData?.daysUntilNextPeriod ?? null,
    objetivo: usuaria?.objetivo ?? null,
    tomaAnticonceptivas: usuaria?.toma_anticonceptivas ?? false,
    sintomasRecientes,
  }
  const system = buildSystemPrompt(ctx)

  const encoder = new TextEncoder()
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let emitted = 0
      const pump = async (gen: AsyncIterable<string>) => {
        for await (const text of gen) {
          emitted++
          controller.enqueue(encoder.encode(text))
        }
      }

      try {
        if (HAS_OPENAI) {
          try {
            await pump(openaiTextStream(system, safeMessages))
          } catch (err) {
            // Si OpenAI falló antes de emitir nada, caemos a Anthropic Sonnet.
            console.error('asistente openai error:', err)
            if (emitted === 0 && HAS_ANTHROPIC) {
              await pump(anthropicTextStream(system, safeMessages))
            } else {
              throw err
            }
          }
        } else {
          await pump(anthropicTextStream(system, safeMessages))
        }
      } catch (err) {
        console.error('asistente stream error:', err)
        controller.enqueue(
          encoder.encode('\n\nUy, se me cruzaron los cables. ¿Probamos de nuevo? 💗')
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
