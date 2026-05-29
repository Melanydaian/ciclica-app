# Setup de servicios externos

Lo que vos tenés que configurar (no se puede automatizar desde el repo).

---

## 1. 📊 Plausible Analytics (privacy-first, sin cookies)

**Por qué:** saber cuántas usuarias entran, dónde se quedan, qué pestaña usan más. Sin cookies, sin tracking invasivo.

**Pasos:**
1. Crear cuenta en https://plausible.io/register (hay free trial de 30 días, después USD 9/mes).
2. Add a site → `app.ciclica.pro`.
3. En el dashboard del sitio, copiar el snippet `<script defer data-domain="app.ciclica.pro" src="..."></script>`
4. Pegarlo en `app/layout.tsx` dentro del `<head>` (o usar `next/script`).

**Alternativa gratis:** **Umami** self-hosted (en tu mismo VPS) o **Vercel Analytics** (gratis con plan hobby).

---

## 2. 🛟 Sentry (error tracking)

**Por qué:** si algo se rompe en producción, ver el stack trace + reproducir + arreglar antes de que la usuaria se frustre.

**Pasos:**
1. Crear cuenta en https://sentry.io/signup/ (free tier 5k events/mes).
2. Create project → Next.js → app.ciclica.pro.
3. Correr `npx @sentry/wizard@latest -i nextjs` en el repo local.
4. El wizard te crea `sentry.*.config.ts` y agrega `withSentryConfig` al `next.config.mjs`.
5. Guardar `SENTRY_DSN` y `SENTRY_AUTH_TOKEN` en Vercel → Project Settings → Env Vars.
6. Pushear. Errores nuevos aparecen en Sentry.

---

## 3. 🚀 Vercel deploy

Si todavía no deployaste:
1. https://vercel.com/new → Import `Melanydaian/ciclica-app`.
2. **Env vars** (Production):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://melsupabase.n8nflip.online
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<el anon>
   SUPABASE_SERVICE_KEY=<el service_role>
   NEXT_PUBLIC_APP_URL=https://app.ciclica.pro
   ```
3. Deploy → si pasa, cambiar DNS de `app.ciclica.pro` para que apunte al CNAME de Vercel.
4. SSL automático en 5 min.

---

## 4. 🗄️ Migraciones SQL

En **Supabase Studio → SQL Editor**, copiá y corré en orden si no lo hiciste:
- `migrations/APLICAR_010_011.sql` (pastillas, plan, limpieza n8n)
- `migrations/APLICAR_012.sql` (journal + share)

---

## 5. 📧 Template del email magic link

En **Supabase Studio → Authentication → Email Templates → Magic Link**:
1. Cambiar **Site URL** del proyecto a `https://app.ciclica.pro`.
2. Pegar el HTML que está en [app/api/email-templates/magic-link/route.ts](app/api/email-templates/magic-link/route.ts) (desde `<!DOCTYPE html>` a `</html>`).
3. Asegurar que el `href` del botón sea:
   ```
   https://app.ciclica.pro/auth/verify?token_hash={{ .TokenHash }}&type=magiclink&next=/dashboard
   ```

---

## 6. 🔑 Google OAuth (si querés mantener el login con Google)

En el VPS con SSH:
```bash
docker service update \
  --env-add GOTRUE_EXTERNAL_GOOGLE_ENABLED=true \
  --env-add 'GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID=<tu_client_id>' \
  --env-add 'GOTRUE_EXTERNAL_GOOGLE_SECRET=<tu_secret>' \
  --env-add 'GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI=https://melsupabase.n8nflip.online/auth/v1/callback' \
  supabase_auth
```

---

## 7. 🧪 Tests (cuando quieras)

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom playwright @playwright/test
```

- **Vitest** para unit tests de `lib/cycle-utils.ts` y `lib/cycle-forecast.ts`.
- **Playwright** para E2E del happy path (login → onboarding → dashboard renderiza con data).

Yo te dejo un test base si querés cuando configures vitest.

---

## 8. 🤖 n8n workflows nuevos

Para que el bot funcione con las features web:
- **`/api/sintomas`**: el bot ya inserta en `registros_ciclo` por su cuenta, no necesita el endpoint.
- **`/api/sex`**: ídem.
- **Botón "Mejor lo anoto por WhatsApp"** del modal abre `wa.link/fub503` con un mensaje pre-armado. n8n tiene que detectar el mensaje y responder guiando el registro como ya hace con otros.

---

## 9. 📲 PWA

Ya está configurada (`app/manifest.ts` + meta tags). Una vez deployada en `app.ciclica.pro`:
1. Desde Chrome mobile → ⋮ → "Instalar app"
2. Desde iOS Safari → Compartir → "Agregar a inicio"

El ícono va a usar `logoflor.png`. Si querés un ícono dedicado de mayor calidad, generá uno en https://realfavicongenerator.net y subilo a `/public/`.

---

## 10. 🩺 Compartir con ginecóloga

Ya funciona. Cuando una usuaria clickea en /perfil "Generar link para 7 días":
- Se crea un token en `medical_share_tokens` con expiración a 7 días.
- El link es `https://app.ciclica.pro/share/<uuid>`.
- La ginecóloga ve resumen READ-ONLY sin login.
- La usuaria puede revocar el link cuando quiera.
