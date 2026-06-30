'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

export default function AsistenteChat({
  nombre,
  saludo,
  sugerencias,
}: {
  nombre: string
  saludo: string
  sugerencias: string[]
}) {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: saludo }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    const content = text.trim()
    if (!content || loading) return

    const next: Message[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setLoading(true)

    // Placeholder de la respuesta que se va llenando con el stream.
    setMessages((m) => [...m, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })

      if (!res.ok || !res.body) {
        const msg =
          res.status === 403
            ? 'El asistente es parte del plan premium. Activá tu suscripción para chatear conmigo 💗'
            : 'No pude responder ahora mismo. Probá de nuevo en un ratito.'
        setMessages((m) => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'assistant', content: msg }
          return copy
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((m) => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'assistant', content: acc }
          return copy
        })
      }
    } catch {
      setMessages((m) => {
        const copy = [...m]
        copy[copy.length - 1] = {
          role: 'assistant',
          content: 'Se cortó la conexión. ¿Lo intentamos otra vez?',
        }
        return copy
      })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const soloSaludo = messages.length === 1

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-13rem)]">
      <div className="pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
          Tu asistente
        </p>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#F4F1F5] mt-1 flex items-center gap-2">
          <Sparkles size={22} className="text-pink-500" />
          Hablá con Cíclica
        </h1>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-pink-500 text-white rounded-br-md'
                    : 'bg-white dark:bg-[#1F1822] text-gray-800 dark:text-[#E8E2EC] border border-pink-100 dark:border-[#3A2F3F] rounded-bl-md'
                }`}
              >
                {m.content || (
                  <span className="inline-flex gap-1 py-1">
                    <Dot delay={0} />
                    <Dot delay={0.15} />
                    <Dot delay={0.3} />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {soloSaludo && (
        <div className="flex flex-wrap gap-2 pt-3">
          {sugerencias.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-[13px] px-3 py-1.5 rounded-full border border-pink-200 dark:border-[#3A2F3F] text-pink-600 dark:text-pink-300 bg-pink-50/60 dark:bg-pink-500/10 hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-colors active:scale-[0.98]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-end gap-2 pt-3"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
          rows={1}
          placeholder={`Escribí acá, ${nombre}…`}
          className="flex-1 resize-none max-h-32 rounded-2xl border border-pink-200 dark:border-[#3A2F3F] bg-white dark:bg-[#1F1822] px-4 py-3 text-[15px] text-gray-800 dark:text-[#E8E2EC] placeholder:text-gray-400 dark:placeholder:text-[#8A8190] focus:outline-none focus:border-pink-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Enviar"
          className="shrink-0 w-12 h-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-pink-600 transition-colors active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>

      <p className="text-[10px] text-gray-400 dark:text-[#6F6678] text-center pt-2">
        Cíclica no reemplaza a tu médica. Ante cualquier duda, consultá a tu ginecóloga.
      </p>
    </div>
  )
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="w-1.5 h-1.5 rounded-full bg-pink-400"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ repeat: Infinity, duration: 1, delay }}
    />
  )
}
