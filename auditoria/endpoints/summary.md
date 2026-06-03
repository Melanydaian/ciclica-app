# Resultados de endpoints (dev server en localhost:3010)

Fecha: 2026-05-22 · Auth no enviada (cliente anónimo).

| Endpoint | Método | Status | Observación |
|---|---|---|---|
| `/` | GET | 200 | Login renderiza OK |
| `/dashboard` | GET (sin sesión) | 200 (tras redirect a `/`) | Middleware redirige a login |
| `/onboarding` | GET | 200 | Página accesible sin sesión (no debería) |
| `/api/email-templates/magic-link` | GET | 200 | Devuelve HTML del template |
| `/api/pastilla` | GET | 401 `{"data":null}` | Auth check OK, pero el status code 401 lo emite el handler con body `{data:null}` (inconsistente) |
| `/api/mp/checkout` | POST | 401 `{"error":"No autenticada"}` | Auth check OK |
| `/api/stripe/checkout` | POST | **500** | 🚨 Crashea al cargar el módulo si `STRIPE_SECRET_KEY` está vacío. Stripe SDK se instancia en top-level y tira `"Neither apiKey nor config.authenticator provided"`. La auth check nunca llega a ejecutarse. |
| `/api/stripe/webhook` | POST | **500** | 🚨 Mismo problema: Stripe se instancia top-level y explota sin la key. |

## Raw outputs guardados
- `magic-link-template.html` — template HTML del email
- `stripe-checkout-noauth.json` — stack trace completo
- `stripe-webhook-nosig.json` — stack trace completo
- `mp-checkout-noauth.json` — `{"error":"No autenticada"}`
- `pastilla-get-noauth.json` — `{"data":null}`

## Notas
- `/onboarding` no está protegido por el middleware (`matcher: ['/dashboard/:path*']`). Si un usuario abre la URL sin estar logueado, la página intenta `supabase.auth.getUser()` y muestra el error "Sesión inválida" sólo al submit. Debería redirigir.
- Endpoints de Mercado Pago no fueron testeados con `MP_ACCESS_TOKEN` vacío más allá del 401; podrían fallar de forma similar al cargar `MercadoPagoConfig` si la lib valida el token al instanciar.
