# Estado del proyecto: Cíclica (dashboard web)

**Fecha de auditoría:** 2026-05-22
**Stack detectado:** Next.js 14.2.35 (App Router) · TypeScript · Tailwind + shadcn (mínimo) · Framer Motion · Supabase (Auth + Postgres self-hosted en `melsupabase.n8nflip.online`) · Stripe + Mercado Pago (PreApproval) · Docker + Traefik · n8n (en otro repo, no auditado).

**Estado general:** Hay un MVP visible y desplegado en `ciclica.pro` con la cáscara completa de 4 pantallas, integraciones de pago codeadas y migraciones SQL versionadas. Pero **no es production-ready**. Sólo el Dashboard consume Supabase real; Historial, Síntomas y Perfil son 100% mock. Las rutas de Stripe revientan en runtime si la env no está completa (probado, ver §3). La tabla `pastillas_log` y la columna `usuarias.toma_anticonceptivas` se usan en código pero no existen en migraciones (la feature de pastilla rompe contra DB real). El plan `'premium'` que escriben los webhooks viola el `CHECK` constraint que sólo permite `'free'|'fertilidad'`. No hay tests, ni CI, ni logging, ni rate limiting; y `next.config.mjs` ignora errores de TS y ESLint en build. Para llegar a producción con clientes reales falta un sprint de limpieza + endurecimiento.

> **Cómo se hizo esta auditoría:** lectura de todos los archivos en `app/`, `components/`, `lib/`, `migrations/`, `middleware.ts`, `Dockerfile`, `docker-compose.yml`, `next.config.mjs`, `.env*`, `package.json`. Dev server levantado en `localhost:3010` para hitear endpoints (ver [auditoria/endpoints/summary.md](auditoria/endpoints/summary.md)). Screenshots actualizadas no se pudieron generar porque Playwright no tiene sesión Supabase (todas las páginas autenticadas redirigen al login); las screenshots de [auditoria/screenshots/](auditoria/screenshots/) son del commit anterior (`ss-pg-*.png` versioneados en repo, capturadas el 2026-04-20 con datos mock).

---

## 1. Qué está hecho y funciona

### Funciona end-to-end (verificado con `curl` y/o lectura cruzada)
- **Login con magic link** — [app/page.tsx](app/page.tsx) + `signInWithOtp` de Supabase Auth. UI maneja loading, error y estado "enviado". Devuelve 200 OK.
- **Callback de auth** — [app/auth/callback/route.ts](app/auth/callback/route.ts) intercambia `code` por sesión y redirige a `/dashboard`. Maneja `error=link_expirado`.
- **Middleware protege `/dashboard/*`** — [middleware.ts](middleware.ts) redirige a `/` si no hay user. Verificado en `curl`.
- **Onboarding de vinculación WhatsApp** — [app/onboarding/page.tsx](app/onboarding/page.tsx) toma teléfono y upserta en `usuarias_web`.
- **Dashboard server-rendered con Supabase real** — [app/dashboard/page.tsx](app/dashboard/page.tsx) hace 5 queries paralelas (`usuarias`, `registros_ciclo`, `historial_ciclos`, `puntos_log`, `pastillas_log`) usando admin client. Si falla, cae a MOCK.
- **Cálculo de fase del ciclo** — [lib/cycle-utils.ts](lib/cycle-utils.ts:42-77). Requiere mínimo 3 ciclos para calcular promedio personalizado, si no usa 28 (commit `1b5bd0f`).
- **Migraciones SQL versionadas** — `migrations/001`–`009`. Crean 9 tablas, índices, RLS por email→teléfono, sistema de puntos/referidos, columnas de suscripción.
- **Email template magic link** — [app/api/email-templates/magic-link/route.ts](app/api/email-templates/magic-link/route.ts) devuelve HTML 200. (No hay constancia de que esté instalado en Supabase Dashboard.)
- **Dockerfile multi-stage con `output: standalone` + healthcheck** — [Dockerfile](Dockerfile), [next.config.mjs:3](next.config.mjs#L3).
- **docker-compose con Traefik labels para `ciclica.pro`** — [docker-compose.yml](docker-compose.yml).

### Existe el código pero no está verificado / depende de config externa
- **Stripe Checkout + Webhook** — [app/api/stripe/checkout/route.ts](app/api/stripe/checkout/route.ts), [app/api/stripe/webhook/route.ts](app/api/stripe/webhook/route.ts). Crashea en runtime si las env vars están vacías (ver §3.1).
- **Mercado Pago PreApproval + Webhook** — [app/api/mp/checkout/route.ts](app/api/mp/checkout/route.ts), [app/api/mp/webhook/route.ts](app/api/mp/webhook/route.ts). No verifica firma del webhook.
- **API pastilla anticonceptiva (GET/POST)** — [app/api/pastilla/route.ts](app/api/pastilla/route.ts). **Apunta a una tabla que no existe en migraciones** (ver §3.2).
- **PDF para ginecóloga** — [components/cycle/ExportarPDFButton.tsx](components/cycle/ExportarPDFButton.tsx). Funciona, pero con datos hardcoded.
- **Sistema de puntos + referidos** — Tabla `puntos_log`, `referidos`, triggers en migración 004/006/007. UI en [components/cycle/PuntosCard.tsx](components/cycle/PuntosCard.tsx) renderiza puntos reales si vienen de DB.

---

## 2. Fortalezas

- **RLS bien planteada por email→teléfono** ([migrations/001_ciclica_tables.sql:75-105](migrations/001_ciclica_tables.sql#L75-L105)). La web sólo puede leer datos del JWT email; el bridge a `telefono` está aislado en `usuarias_web`.
- **Service key sólo en server** — `createAdminSupabase()` se instancia exclusivamente desde código de servidor ([lib/supabase-server.ts:23](lib/supabase-server.ts#L23)); el cliente browser usa anon key.
- **Migraciones SQL planas en repo, idempotentes** (`CREATE TABLE IF NOT EXISTS`, `DROP TRIGGER IF EXISTS`) — fáciles de revisar y reaplicar.
- **Componentes de UI pequeños, reusables y type-safe** — 15 componentes en `components/cycle/`, todos con interfaces tipadas.
- **Dashboard usa SSR con `Promise.all`** para queries paralelas ([app/dashboard/page.tsx:61-90](app/dashboard/page.tsx#L61-L90)) — buena performance.
- **Healthcheck en Dockerfile** ([Dockerfile:33-34](Dockerfile#L33-L34)) y `restart_policy: on-failure` en compose.
- **Diseño coherente con el design system del CLAUDE.md** — paleta rosa/ciruela, radios generosos (rounded-2xl), mobile-first con bottom nav y top bar adaptativos ([components/layout/NavBar.tsx](components/layout/NavBar.tsx)).
- **Próxima fase calculada correctamente** — la lútea fija en 14 días, ovulación = cycleLength - 14 ([lib/cycle-utils.ts:65-66](lib/cycle-utils.ts#L65-L66)).
- **Sistema de niveles gamificado** — Semilla → Brote → Flor → Jardín en PuntosCard ya funciona y la lógica de puntos vive en triggers de Postgres (no en el código de la web), lo que la deja consistente entre WhatsApp y web.

---

## 3. Debilidades

### 3.1 🚨 Bugs bloqueantes
- 🚨 **Stripe SDK se instancia top-level y crashea si la env está vacía.** [app/api/stripe/checkout/route.ts:5](app/api/stripe/checkout/route.ts#L5) y [app/api/stripe/webhook/route.ts:5](app/api/stripe/webhook/route.ts#L5) hacen `new Stripe(process.env.STRIPE_SECRET_KEY!)` fuera del handler. Reproducido en `curl POST /api/stripe/checkout` → **500** con `"Neither apiKey nor config.authenticator provided"` (auth check del usuario nunca se ejecuta). El `.env.local` actual tiene `STRIPE_SECRET_KEY=` vacío. Misma trampa con Mercado Pago en [app/api/mp/checkout/route.ts:5](app/api/mp/checkout/route.ts#L5) y [app/api/mp/webhook/route.ts:5](app/api/mp/webhook/route.ts#L5) (no probado pero idéntico patrón).
- 🚨 **`pastillas_log` y `usuarias.toma_anticonceptivas` no existen en migraciones.** Usadas en [app/dashboard/page.tsx:69, 84-89](app/dashboard/page.tsx#L69) y [app/api/pastilla/route.ts:27, 45](app/api/pastilla/route.ts#L27). La migración 009 sólo agregó `recordatorio_pastilla_hora` y `recordatorio_pastilla_activo`. Esto significa que apenas la rama de "toma_anticonceptivas=true" se dispare contra DB real, la query revienta. (Por ahora no se dispara porque la columna no existe → SELECT devuelve `undefined` y el ternario va al else.)
- 🚨 **Mismatch del CHECK constraint del plan.** [migrations/008:20](migrations/008_objetivo_y_suscripcion.sql#L20) permite sólo `('free', 'fertilidad')`, pero los webhooks de Stripe y MP escriben `'premium'` ([stripe/webhook/route.ts:32](app/api/stripe/webhook/route.ts#L32), [mp/webhook/route.ts:33](app/api/mp/webhook/route.ts#L33)). El `UPDATE` va a fallar con violación de constraint y el usuario va a pagar sin que su suscripción se active.
- 🚨 **`SUPABASE_SERVICE_KEY` en `.env.local`.** Aunque `.env*.local` está gitignored ([`.gitignore:29`](.gitignore#L29)) y no está commiteado, vive en el filesystem en claro y se inyecta como ENV en Docker. Operacionalmente correcto, pero **rotalo cuando sea posible** porque cualquier proceso con read access lo lee.

### 3.2 Datos MOCK en páginas que deberían leer DB
- **`/dashboard/sintomas`** ([app/dashboard/sintomas/page.tsx](app/dashboard/sintomas/page.tsx)) — 100% mock. `MOCK_SINTOMAS`, `MOCK_ANIMO`, "Patrones detectados" hardcoded. **Ningún fetch a Supabase.**
- **`/dashboard/historial`** ([app/dashboard/historial/page.tsx](app/dashboard/historial/page.tsx)) — 100% mock. `today = new Date('2025-04-19')` hardcoded ([línea 44](app/dashboard/historial/page.tsx#L44)) — el calendario se queda anclado a abril 2025 mientras hoy es mayo 2026.
- **`/dashboard/perfil`** ([app/dashboard/perfil/page.tsx](app/dashboard/perfil/page.tsx)) — Email "meli@email.com" y teléfono "+54 9 11 ···· 4892" hardcoded. Los sliders no persisten. Botón "Cerrar sesión" sin handler.
- **`PDF export`** ([components/cycle/ExportarPDFButton.tsx](components/cycle/ExportarPDFButton.tsx)) — 3 ciclos y síntomas hardcoded ([líneas 41-58](components/cycle/ExportarPDFButton.tsx#L41-L58)). Un médico recibe datos falsos.
- **`FeedMensajesCard`** ([components/cycle/FeedMensajesCard.tsx](components/cycle/FeedMensajesCard.tsx)) — 100% mock; no lo importa nadie ahora, pero el archivo está en repo y los textos parecen reales.

### 3.3 Bugs / fragilidad de menor severidad
- **URL hardcoded en callback de auth.** [app/auth/callback/route.ts:4](app/auth/callback/route.ts#L4) `const APP_URL = 'https://app.ciclica.pro'` — debería ser `process.env.NEXT_PUBLIC_APP_URL`. Y además `app.ciclica.pro` no es el dominio que sirve Traefik ([docker-compose.yml:32](docker-compose.yml#L32)), que es `ciclica.pro`. Si el callback se ejecuta hoy redirige a un host que tal vez no esté apuntado.
- **Webhook de MP sin verificación de firma.** [app/api/mp/webhook/route.ts](app/api/mp/webhook/route.ts) ni siquiera lee `x-signature` ni usa `MP_WEBHOOK_SECRET` (declarado en `.env.example` pero no consumido). Cualquiera puede POSTear con `{type:'preapproval', data:{id:'X'}}` y forzar el SDK a buscar esa pre-aprobación. Si la fuerza bruta encuentra IDs válidos, activa suscripciones falsas.
- **TypeScript y ESLint ignorados en build.** [next.config.mjs:4-5](next.config.mjs#L4-L5). Commit `7e3c0cb` lo hace explícito. Cualquier error de tipos o lint pasa a producción.
- **`/onboarding` fuera del matcher del middleware.** [middleware.ts:36](middleware.ts#L36) sólo cubre `/dashboard/:path*`. Cualquiera abre `/onboarding` sin sesión; el form intenta `auth.getUser()` y muestra "Sesión inválida" sólo al submit.
- **`/api/pastilla` GET devuelve `{"data":null}` con status 401** — inconsistente; la UI no maneja 401 explícitamente ([components/cycle/PastillaCard.tsx](components/cycle/PastillaCard.tsx) hace `fetch` sin chequear `res.ok`).
- **Errores técnicos expuestos al usuario.** [app/page.tsx:35](app/page.tsx#L35) hace `setError(`Error: ${error.message}`)` con el mensaje crudo de Supabase.
- **`getCurrentPhase` no valida fechas en el futuro.** [lib/cycle-utils.ts:53-77](lib/cycle-utils.ts#L53-L77). Si el usuario manda `fecha_inicio_ciclo` futura (typo desde WhatsApp), `dayOfCycle` sale negativo y `daysUntilNextPeriod` queda raro.
- **`stripe_subscription_id`/`mp_subscription_id` no se renuevan en eventos posteriores.** Sólo se setean en `checkout.session.completed`; si Stripe genera una sub nueva o cambia el customer no se sincroniza.
- **`@supabase/ssr` y `@supabase/supabase-js` como deps separadas.** Con `ssr` alcanza; el segundo se usa para el admin client pero se podría unificar.
- **`shadcn` como prod dep** ([package.json:18](package.json#L18)) — es un CLI, va en devDeps.
- **Sólo `components/ui/button.tsx`** existe, aunque `components.json` declara la config completa de shadcn. La UI usa Tailwind directo todo el tiempo.
- **`updated_at` columns existen pero no hay trigger** que las actualice automáticamente; quedan estancadas en el valor de creación.
- **`navigator.share`/`clipboard` sin fallback fuerte** ([PuntosCard.tsx:124-129](components/cycle/PuntosCard.tsx#L124-L129)).
- **Hardcoded `executablePath` de Chrome** en [ss-pages.js:3](ss-pages.js#L3) — útil para Mela en este equipo, inútil en CI.
- **Cantidad de archivos sueltos en raíz** (`ss-*.png`, `ss-*.js`, `tsconfig.tsbuildinfo`) — debería estar en `/auditoria` o `/scripts` y `.tsbuildinfo` debería estar en gitignore (no lo está; sí está `next-env.d.ts` pero ese se autogenera).

### 3.4 Lo que falta de plano (no es bug, es ausencia)
- **0 tests** — ni unit, ni integration, ni E2E. No hay `jest`, `vitest`, `playwright` (sólo `playwright-core` para screenshots).
- **0 logging estructurado / 0 observabilidad** — `console.error` y se pierden. No hay Sentry ni equivalente.
- **0 rate limiting** en login, webhooks o `/api/pastilla`.
- **0 CI/CD** — no hay `.github/workflows/`. El deploy es manual (`git push` + `docker compose up -d` en VPS, presumiblemente).
- **0 documentación de runbook** — qué hacer si el dominio cae, cómo restaurar DB, cómo rotar las service keys.
- **README es el template default de `create-next-app`.**

---

## 4. Qué falta para production-ready

Ordenado de bloqueante a nice-to-have.

### Bloqueantes (sin esto el producto se rompe contra usuarios reales)
- [ ] **Mover `new Stripe(...)` y `new MercadoPagoConfig(...)` adentro de los handlers** para que la ausencia de env no tire 500 al cargar el módulo — y poder devolver 503 graceful cuando falta config. ([checkout](app/api/stripe/checkout/route.ts#L5), [webhook stripe](app/api/stripe/webhook/route.ts#L5), [checkout MP](app/api/mp/checkout/route.ts#L5), [webhook MP](app/api/mp/webhook/route.ts#L5)).
- [ ] **Crear migración 010** que (a) agregue `usuarias.toma_anticonceptivas boolean DEFAULT false`; (b) cree `pastillas_log (telefono text, fecha date, tomada bool, hora text, PRIMARY KEY (telefono, fecha))`; (c) RLS por `telefono` linkado a `usuarias_web`.
- [ ] **Arreglar el CHECK del plan.** O bien `ALTER TABLE usuarias_web DROP CONSTRAINT ... CHECK (suscripcion_plan IN ('free','fertilidad','premium'))`, o bien que los webhooks escriban `'fertilidad'` (acordar nombre del plan único).
- [ ] **Implementar verificación HMAC en webhook MP** — sin esto cualquiera activa suscripciones gratis.
- [ ] **Cablear `/dashboard/historial` a Supabase real** (la página entera es mock con fecha congelada en 2025-04-19).
- [ ] **Cablear `/dashboard/sintomas` a Supabase real** — leer de `registros_ciclo` agrupado por fase.
- [ ] **Cablear `/dashboard/perfil` a Supabase real** — email/teléfono reales, guardar `duracion_ciclo` y `duracion_periodo` con upsert, implementar logout, mostrar `codigo_referido`.
- [ ] **Fix `APP_URL` hardcoded en callback** ([app/auth/callback/route.ts:4](app/auth/callback/route.ts#L4)).
- [ ] **Reactivar `typescript.ignoreBuildErrors` y `eslint.ignoreDuringBuilds`** o al menos resolver lo que enmascaran. Hoy hay errores ocultos.
- [ ] **`/onboarding` debe redirigir a `/` si no hay sesión** — agregar la ruta al matcher del middleware.

### Críticos (no rompen, pero comprometen la seguridad / la calidad operacional)
- [ ] **Rate limiting** en `signInWithOtp` (login), `POST /api/pastilla`, y los dos webhooks. Usar Upstash Redis o middleware sencillo.
- [ ] **Verificar y configurar el template de email magic link** en Supabase Dashboard apuntando a `/api/email-templates/magic-link` o copiando el HTML.
- [ ] **No exponer error messages crudos de Supabase al usuario** ([app/page.tsx:35](app/page.tsx#L35)).
- [ ] **Validar input del onboarding** — formato de teléfono (regex E.164), longitud mínima 10 ya está pero podría ser más robusto.
- [ ] **Validar `fecha_inicio_ciclo` no esté en el futuro** en cycle-utils.
- [ ] **Logging estructurado + Sentry** (o equivalente) — al menos para webhooks y handlers de pago.
- [ ] **CI en GitHub Actions** — al menos `npm run lint && npm run build` en cada PR.
- [ ] **Healthcheck endpoint propio** (e.g. `/api/health` que devuelve `{ok:true, db: 'up'}`) en vez de pegarle a `/` con wget — más fiable.
- [ ] **Backups automatizados de Supabase self-hosted** — pg_dump diario a S3/Wasabi.
- [ ] **Renovar suscripción en eventos `customer.subscription.updated`** (Stripe) y `payment.created` (MP) — hoy no se sincroniza.
- [ ] **Stripe webhook: agregar `export const runtime = 'nodejs'` y confirmar que el raw body se preserva** — App Router lo respeta, pero conviene explicitarlo.

### Importantes (UX y mantenibilidad)
- [ ] **Sacar `FeedMensajesCard.tsx`** o cablearlo a la conversación real desde n8n (si hay tabla `mensajes_whatsapp`).
- [ ] **PDF real** — `ExportarPDFButton` con datos del SSR, no hardcoded.
- [ ] **Tests E2E con Playwright** del happy path: login → onboarding → dashboard se renderiza con datos.
- [ ] **Tests unitarios** de `cycle-utils.ts` (cálculo de fase, edge cases).
- [ ] **Limpieza de archivos sueltos en raíz** (`ss-*.png`, `ss-*.js`, `tsconfig.tsbuildinfo`).
- [ ] **Documentar deploy** — README real con pasos: clonar, env vars, migraciones, `docker compose up -d`, troubleshooting.
- [ ] **Documentar onboarding de clientes** — qué les decimos en WhatsApp, qué esperar del dashboard, cómo cancelar suscripción.
- [ ] **Mover `SUPABASE_SERVICE_KEY` a un secrets manager** (Docker secrets, age, Bitwarden CLI) — hoy vive en `.env.local` en disco y como `environment` en compose.

### Nice-to-have
- [ ] Sacar `shadcn` de prod deps a devDeps.
- [ ] Unificar `@supabase/ssr` y `@supabase/supabase-js`.
- [ ] Agregar trigger Postgres para actualizar `updated_at` en `usuarias_web`.
- [ ] Convertir `MOCK_USER` fallback en `app/dashboard/layout.tsx` en un error explícito (sólo se activa si falta env, lo que no debería pasar en prod).

---

## 5. Posibles mejoras (no bloqueantes)

- **Animaciones con Framer Motion** — declarado en deps pero **no se importa en ningún archivo**. Vale la pena animar las transiciones entre tabs de la nav, el cambio de fase del PhaseCard y el progreso en PuntosCard.
- **Memoizar `MOCK_REGISTROS` y default cycle data fuera del component** (ya están como const top-level, ok).
- **Mover utilitarios de fecha a `lib/date.ts`** — hoy hay `toISOString().split('T')[0]` repetido en 4 archivos.
- **Componentizar el patrón "card con borde rosa"** — `<div className="bg-white rounded-2xl border border-pink-100 p-6">` aparece en 10+ lugares; un `<Card>` evitaría drift visual.
- **`shadcn` real**: instalar `Button`, `Input`, `Card`, `Dialog`, `Toast` y usar consistentemente. Ya hay `components/ui/button.tsx` solitario.
- **Hooks dedicados**: `useUsuaria()`, `useRegistros()` para reutilizar fetches entre páginas (cuando dejen de ser mock).
- **Skeletons / loading states** mientras el SSR carga (Next.js Suspense boundaries por sección).
- **Theme switcher** — el CLAUDE.md global dice "diseño oscuro por defecto", pero el proyecto está pintado en rosa/blanco. Dejar consistente con el design system de Cíclica (la pinta dulce ya elegida) y eliminar el conflicto en la convención global.
- **Cache de queries en `/dashboard`** con `revalidate: 60` o tag-based revalidation, para no pegarle a la DB en cada navegación.
- **`React.lazy` para componentes pesados** (PDF export sólo cuando se hace click).

---

## 6. Ideas no implementadas que aparecieron en el código

Tal cual aparecen, con ubicación:

- **Plan Fertilidad / Método sintotérmico** — registro de temperatura basal cada mañana, seguimiento de moco cervical, gráfico con curva de ovulación, ventana fértil confirmada, días de riesgo marcados. [components/cycle/FertilidadPaywall.tsx:31-43](components/cycle/FertilidadPaywall.tsx#L31-L43). **No hay tablas de DB para esto.**
- **Análisis de patrones con IA** — listado en [PremiumCard.tsx:10](components/cycle/PremiumCard.tsx#L10) y [ProximamenteCard.tsx:6](components/cycle/ProximamenteCard.tsx#L6).
- **Alertas proactivas por fase del ciclo** — listado en PremiumCard/ProximamenteCard. (n8n probablemente las envía vía WhatsApp; en la web no hay nada.)
- **Recordatorio diario de pastilla a tu hora** — listado en PremiumCard. Migración 009 ya creó las columnas (`recordatorio_pastilla_hora`, `recordatorio_pastilla_activo`), pero el handler de pastilla y la UI viven de `pastillas_log` que **no existe** (ver §3.1).
- **Check-in semanal** — toggle "Todos los lunes" en [PerfilPage:91](app/dashboard/perfil/page.tsx#L91), sin lógica detrás.
- **Aviso antes del período (3 días antes)** y **Mensajes de fase (al cambiar de fase)** — toggles en perfil, sólo cosméticos.
- **Cerrar sesión desde Perfil** — botón en [PerfilPage:108-110](app/dashboard/perfil/page.tsx#L108-L110), sin `onClick`.
- **Historial ilimitado de ciclos** — listado en plan premium, pero la página historial es 100% mock con 3 ciclos hardcoded.
- **Editar duración del ciclo y período desde Perfil** — sliders rendereados, no persisten.
- **Comentario en `CorrelacionesCard.tsx:8-9`:** "En realidad los registros vienen de registros_ciclo que tiene fase_actual pero no lo mapeamos aún" — confesión explícita de feature a medias.
- **`ComparacionSemanalCard.tsx`** existe en `components/cycle/` pero **no se importa en ningún lugar**. Las screenshots viejas la muestran en el dashboard, el código actual no.

---

## 7. Bloqueantes externos

No se resuelven sólo con código:

- **Credenciales productivas de Stripe** — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`. Hoy `.env.local` los tiene vacíos. Definir si va Stripe, MP, o los dos.
- **Credenciales productivas de Mercado Pago** — `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`. Idem vacíos.
- **Decisión de negocio: nombre del plan único** — `'premium'` (lo que escriben los webhooks) vs `'fertilidad'` (lo que permite el CHECK). Resolverlo + alinear la columna `suscripcion_plan`.
- **Configurar webhook URL en Stripe y MP** apuntando a `https://ciclica.pro/api/stripe/webhook` y `/api/mp/webhook`, y agregarlas a las allowlist de cada dashboard.
- **Custom email template en Supabase Dashboard** — instalar el HTML de `/api/email-templates/magic-link` como template "Magic Link" en Authentication → Email Templates.
- **Apuntar DNS de `ciclica.pro` (y `app.ciclica.pro`?) al VPS de Contabo** — y validar que Let's Encrypt resuelva los certs. (No verificable desde código.)
- **Backups del Supabase self-hosted** — definir frecuencia, destino, retención.
- **GDPR / política de privacidad / términos** — Cíclica trabaja con datos de salud menstrual, sensible. Hay `privacidad.html` en `ciclica-web` (landing) pero no auditado.
- **n8n workflows** — no están en este repo. La consistencia ciclo↔web depende de ellos. Pedir export como JSON.
- **Estructura comercial de los referidos** — el sistema otorga puntos pero los puntos no se canjean por nada hoy. Decidir qué se desbloquea con `Brote`/`Flor`/`Jardín`.

---

## 8. Definition of Done (production-ready)

Cuando todos estos puntos sean verificables en verde, el proyecto se considera terminado.

### Infra y deploy
- [ ] `GET https://ciclica.pro/` responde 200 con el form de login.
- [ ] `GET https://ciclica.pro/api/health` responde `{"ok":true,"db":"up"}` (endpoint nuevo, ver §4).
- [ ] El healthcheck Docker (`wget -qO- http://localhost:3000`) pasa por más de 60s.
- [ ] `docker compose up -d` arranca sin errores en VPS fresh; logs limpios los primeros 5 min.
- [ ] Cert SSL de Let's Encrypt activo, A+ en SSL Labs.
- [ ] Backup automático de Supabase (cron diario) deja archivo `.sql.gz` < 24h en almacenamiento externo.
- [ ] CI corre `npm run lint && npm run build && npm test` en cada PR a `main`.

### Funcionales
- [ ] Una usuaria nueva puede: pedir magic link → abrir email → entrar al dashboard → completar onboarding con teléfono → ver datos reales de su ciclo. End-to-end probado.
- [ ] Las 4 pantallas (Dashboard, Historial, Síntomas, Perfil) leen 100% de Supabase. `grep -r "MOCK_" app/ components/` devuelve cero matches.
- [ ] Editar `duracion_ciclo`/`duracion_periodo` desde Perfil persiste en DB y se ve reflejado en el cálculo de fase al recargar.
- [ ] Botón "Cerrar sesión" en Perfil ejecuta `supabase.auth.signOut()` y redirige a `/`.
- [ ] Recordatorio de pastilla: marcar como tomada persiste en `pastillas_log` (tabla nueva que existe en DB).
- [ ] PDF exportado contiene los datos reales de la usuaria autenticada.

### Pagos
- [ ] Test purchase real (modo test) en Stripe + MP completa el flujo y la fila en `usuarias_web` queda con `suscripcion_activa=true, suscripcion_plan='premium'` (o lo que se decida) sin violar CHECK.
- [ ] Webhook MP rechaza con 401 si `x-signature` no valida.
- [ ] Webhook Stripe rechaza con 400 si firma no valida (ya lo hace).
- [ ] Cancelación de suscripción en Stripe/MP llega como evento al webhook y deja `suscripcion_activa=false`.

### Seguridad
- [ ] Rate limit: `signInWithOtp` máximo 5 requests/15 min por IP.
- [ ] `npm audit --production` no muestra vulnerabilidades critical/high.
- [ ] RLS verificada: con un JWT de usuaria A, querys a `registros_ciclo` con `telefono` de usuaria B devuelven 0 filas.
- [ ] `SUPABASE_SERVICE_KEY` fuera de `.env.local` plano (en secrets manager o al menos `chmod 600`).
- [ ] `MP_WEBHOOK_SECRET` y `STRIPE_WEBHOOK_SECRET` seteados y activos.
- [ ] `next.config.mjs` no ignora errores de TS/ESLint, y el build pasa limpio.

### Observabilidad
- [ ] Errores 500 en cualquier `/api/*` aparecen en Sentry/equivalente con stack trace.
- [ ] Logs estructurados (JSON) en stdout del container, recolectables por Grafana Loki o equivalente.
- [ ] Alerta automática si el healthcheck falla más de 3 veces seguidas.

### Documentación
- [ ] README explica: `git clone` → `cp .env.example .env.local` → `npm install` → `npm run dev` para correr local; y `docker compose up -d` para producción.
- [ ] `RUNBOOK.md` con: cómo restaurar DB, cómo rotar service key, cómo agregar una migración nueva, qué hacer si Traefik no levanta.
- [ ] Documento de onboarding para usuarias finales (puede ser parte del bot de WhatsApp): qué ven en el dashboard, cómo dar de baja, cómo contactar soporte.

### Tests
- [ ] Coverage de `lib/cycle-utils.ts` > 80% (es la pieza con lógica más densa).
- [ ] Test E2E del happy path arriba en CI, corriendo contra un Supabase de staging.

---

## Apéndice — Cómo reproducir el entorno

Para correr el proyecto localmente y reproducir lo que se auditó:

```bash
# Clonar
git clone https://github.com/melanydaian/ciclica-app.git
cd ciclica-app

# Env
cp .env.example .env.local
# Editar .env.local con:
#   NEXT_PUBLIC_SUPABASE_URL=https://melsupabase.n8nflip.online
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key del Supabase self-hosted>
#   SUPABASE_SERVICE_KEY=<service key>
#   NEXT_PUBLIC_APP_URL=http://localhost:3000
# (Stripe y MP pueden quedar vacíos — pero como nota, ojo que rompen al pegarle a los endpoints; ver §3.1)

# Dependencias
npm install

# Migrar la DB (correr cada SQL en /migrations/ en orden contra Supabase)
# Las migrations son idempotentes — se pueden re-correr.

# Levantar
npm run dev
# → http://localhost:3000
```

Lo que falló durante la auditoría:
- **No pude capturar screenshots autenticadas frescas** — Playwright sin cookies de sesión Supabase redirige siempre al login. Las imágenes en `auditoria/screenshots/` son las versionadas en el repo (capturadas el 2026-04-20). Para refrescarlas habría que loguear el browser de Playwright con un magic link real, que no se puede simular sin acceso al email.
- **No pude probar el flow Stripe/MP completo** — sin keys productivas, los handlers crashean al cargar el módulo (ver §3.1).
- **No probé el handshake con n8n** — el workflow vive en otro repo / instancia (no auditado).

Outputs de los endpoints están en [auditoria/endpoints/summary.md](auditoria/endpoints/summary.md). Screenshots en [auditoria/screenshots/](auditoria/screenshots/).
