# 🤖 Mejoras del workflow "padre ciclic" en n8n

Auditoría del workflow actual y propuesta de cambios para que el bot esté 100% alineado con la app web.

---

## 🐛 BUGS CRÍTICOS A ARREGLAR YA

### 1. System prompt en encoding corrupto

Todo el system message está en latin1 mal decodificado (mojibake):
- `CÃCLICA` → debe ser `CÍCLICA`
- `Â¿` → `¿`
- `HablÃ¡s` → `Hablás`
- `RespondÃ©s` → `Respondés`
- Y cientos más.

**Fix**: reemplazar todo el system message por el de [`system-prompt-v2.md`](./system-prompt-v2.md). Es más conciso, sin encoding raro y con los nombres correctos de tools.

### 2. Nombres de tools mal en el prompt

El prompt le pide al LLM usar nombres que NO EXISTEN como tools. Por eso el bot a veces "no encuentra" la tool y cae en respuestas genéricas.

| Prompt viejo | Tool real (no tocar) |
|---|---|
| `get_data` | `Get DATA` ✓ |
| `registrar_sintoma` | `registrar_sintomas` ✓ |
| `fase_ciclo` | `fase_dia1` ✓ |
| `borrar_datos_usuaria` | `borrar datos usuaria` ✓ |
| `registrar_sexo` | `registrar_Sexo` ✓ |

**Fix**: ya está corregido en el prompt v2.

### 3. Nodo `mensaje valido` con `combinator: "or"` debería ser `and`

Archivo: el IF tiene dos condiciones (`message_type === incoming` y `sender.identifier !== ''`). Con `or`, alcanza con que UNA sea cierta — eso permite procesar mensajes outgoing si tienen sender.

**Fix**: en n8n, editar el nodo `mensaje valido` y cambiar el combinator a **AND**.

### 4. El `Switch` tiene fallback `Otro` sin conexión

Cuando un mensaje no es audio, imagen ni texto, va al output "Otro" → **no se conecta a nada** → se descarta silenciosamente.

**Fix opcional**: conectar el output `Otro` a un nodo `noOp` con log para que sepas qué tipos llegan. O dejarlo así si es intencional.

---

## 🔌 INTEGRACIÓN CON APP WEB — TABLAS QUE EL BOT NO MANEJA

La app web introdujo 3 tablas nuevas:

### a) `journal_entries` (diario libre)
La usuaria escribe notas largas en `/dashboard/journal`. El bot debería poder:
- **Guardar** notas cuando alguien escribe varias líneas reflexivas y dice "guardalo" o "anotá esto" o el mensaje es claramente un journal entry.
- **Leer** las últimas notas si pide "qué escribí la semana pasada".

### b) `pastillas_log` (toma diaria de pastilla)
Si `usuarias.toma_anticonceptivas = true`:
- A las X horas (las que configuró en `usuarias.recordatorio_pastilla_hora`), el bot debería recordarle.
- Si responde "tomada", registrar en `pastillas_log`.

### c) `sex_registros` con `nota_adicional`
El bot ya registra sexo, pero podría aprovechar el campo `nota_adicional` cuando la usuaria dice cosas como "me sentí súper conectada hoy".

---

## ➕ TOOLS NUEVOS PROPUESTOS

### Tool: `registrar_journal`

Agregar un nodo nuevo `@n8n/n8n-nodes-langchain.toolWorkflow` con:

```json
{
  "description": "Guardar una nota libre de la usuaria en su diario. Usar cuando la usuaria escriba reflexiones largas, pida 'anotá esto', 'guardá esta nota' o el mensaje sea claramente un journal entry emocional.",
  "workflowInputs": {
    "value": {
      "telefono": "={{ $json.telefono }}",
      "texto": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('texto', 'el contenido textual de la nota', 'string') }}"
    }
  }
}
```

Y crear un subworkflow nuevo `journal_save` que:
1. Reciba `telefono` + `texto`
2. Llame Supabase `INSERT INTO journal_entries (telefono, fecha, texto)` con fecha actual
3. Calcule la fase actual via función y la guarde en `fase`
4. Devuelva `{ ok: true }`

### Tool: `leer_journal`

```json
{
  "description": "Leer las últimas notas del diario de la usuaria. Usar cuando pregunte 'qué escribí ayer', 'mostrame mis notas', 'qué anoté la semana pasada'.",
  "workflowInputs": {
    "value": {
      "telefono": "={{ $json.telefono }}",
      "limit": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('limit', 'cantidad de notas a leer, default 5', 'number') }}"
    }
  }
}
```

Subworkflow `journal_read`:
1. `SELECT fecha, texto, fase FROM journal_entries WHERE telefono = ? ORDER BY fecha DESC LIMIT ?`
2. Devuelve array de notas.

### Tool: `registrar_pastilla`

```json
{
  "description": "Registrar que la usuaria tomó su pastilla anticonceptiva hoy. Solo usar si toma_anticonceptivas = true.",
  "workflowInputs": {
    "value": {
      "telefono": "={{ $json.telefono }}",
      "hora": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('hora', 'hora en formato HH:MM, default ahora', 'string') }}"
    }
  }
}
```

Subworkflow:
1. `INSERT INTO pastillas_log (telefono, fecha, tomada, hora) VALUES (?, today, true, ?)` con `ON CONFLICT (telefono, fecha) DO UPDATE`.

---

## 🧹 OTRAS MEJORAS

### El system prompt es ENORME (~8k chars)

Cada mensaje gasta ~2000 tokens solo en system. Para volumen alto eso es caro. Opciones:
- **Mover el "conocimiento de referencia" a una tool** que el LLM llame cuando quiera consultar sobre anticonceptivos, dismenorrea, embarazo, etc.
- Recortar partes que casi nunca se usan (ej. el bloque entero de "Derechos en Argentina" — moverlo a una tool `consultar_derechos`).

El prompt v2 ya bajó a ~3500 chars sin perder funcionalidad clave.

### `Postgres Chat Memory` solo guarda 7 mensajes de contexto

```json
"contextWindowLength": 7
```

Para conversaciones reflexivas largas (journal, onboarding), 7 puede ser poco. Subí a **15-20**.

### Debouncing de 3s con Redis puede fallar

Si alguien escribe 4 mensajes muy rápido, todos se unen. Si escribe 3 + pausa + 2 más, se procesan en dos batches. Riesgo: si la usuaria está en onboarding y manda "edad: 30 / sí busco embarazo" en mensajes consecutivos, el bot puede procesar los datos en orden raro.

Sugerencia: subí el Wait a **5s** para más margen.

### Audio: usa `gpt-4o` para transcripción, pero podría ser `whisper-1`

Whisper es más barato y más rápido para transcripción. Ya está en OpenAI node — solo cambiar a `audio` operation con modelo `whisper-1`.

(Actualmente ya usa transcribe, está bien.)

### Falta logging de errores

Si una tool falla (Supabase down, GPT timeout), no hay nodo que lo capture. Sugerencia: agregar un `Catch Error` workflow que loguee en una tabla `bot_errors` o que mande un mensaje a un canal admin de Slack/Telegram.

### El Webhook tiene `pinData` con datos de prueba

Eso está OK para dev pero asegurate de que en producción el webhook recibe data fresca, no la pinneada.

---

## 📋 ORDEN DE APLICACIÓN

**Hoy (15 min)** — Bugs críticos:
1. Reemplazar el system message en nodo `Ciclica` con [`system-prompt-v2.md`](./system-prompt-v2.md).
2. Cambiar `mensaje valido` combinator de `or` a `and`.
3. Verificar que las tools del LLM tengan los nombres exactos del prompt.

**Esta semana** — Integración con app:
4. Crear subworkflow `journal_save` y agregar tool `registrar_journal` al agente.
5. Crear subworkflow `journal_read` y agregar tool `leer_journal`.
6. (Opcional) Tool `registrar_pastilla`.

**Cuando tengas tiempo** — Refinamiento:
7. Subir `contextWindowLength` a 15-20 en Postgres Memory.
8. Subir Wait a 5s para debouncing.
9. Agregar manejo de errores con Catch Error workflow.
10. Mover bloque "Conocimiento de referencia" a una tool `consultar_info` para reducir tokens.

---

## 🧪 CÓMO TESTEAR DESPUÉS DEL CAMBIO

Casos a probar via WhatsApp con el bot:

1. **Onboarding**: "hola" desde un número nuevo → debe iniciar flujo.
2. **Síntoma simple**: "tengo cólicos" → llamar `registrar_sintomas`, no `registrar_Sexo`.
3. **Sexo + síntoma juntos**: "tuve relaciones ayer y hoy me duele la cabeza" → debe llamar AMBAS tools.
4. **Fecha futura**: "me vino el 35 de junio" → debe rechazar y repreguntar.
5. **Saludo a usuaria existente**: "buenos días" → "Hola [nombre], ¿qué registramos hoy?".
6. **Pregunta sobre app web**: "¿hay una app?" → debe linkear a https://app.ciclica.pro.
7. **Borrar cuenta**: "borrá mis datos" → debe confirmar primero, después llamar `borrar datos usuaria`.

Si algo no anda como esperás, mandame el mensaje exacto y el output, y vemos.
