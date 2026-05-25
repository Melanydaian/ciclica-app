#!/bin/bash
# =============================================================================
# Cíclica — Script de deploy a app.ciclica.pro
# Para correr en el VPS (94.72.120.15) como root.
#
# Uso:
#   bash deploy.sh
#
# Lo que hace:
#   1. Verifica que DNS de app.ciclica.pro apunte al VPS
#   2. Clona/actualiza /opt/ciclica-app desde GitHub
#   3. Crea/preserva /opt/ciclica-app/.env con valores de producción
#   4. Build de la imagen Docker
#   5. Deploy via docker stack (compatible con tu Swarm actual)
#   6. Verificación end-to-end
# =============================================================================
set -euo pipefail

REPO_URL="https://github.com/Melanydaian/ciclica-app.git"
APP_DIR="/opt/ciclica-app"
DOMAIN="app.ciclica.pro"
VPS_IP="94.72.120.15"
STACK_NAME="ciclica"

cyan()  { printf "\033[1;36m%s\033[0m\n" "$*"; }
green() { printf "\033[1;32m%s\033[0m\n" "$*"; }
red()   { printf "\033[1;31m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[1;33m%s\033[0m\n" "$*"; }

# -----------------------------------------------------------------------------
# Paso 1: DNS
# -----------------------------------------------------------------------------
cyan "=== 1/6 · Verificando DNS de $DOMAIN ==="
RESOLVED=$(dig +short "$DOMAIN" @1.1.1.1 | tail -1)
if [ -z "$RESOLVED" ]; then
  red "✗ $DOMAIN no resuelve a nada."
  yellow "  → Andá al panel de DNS de tu dominio (Hostinger/Namecheap/Cloudflare/...)"
  yellow "  → Creá un registro tipo A:  nombre 'app'  →  valor '$VPS_IP'"
  yellow "  → Esperá 1-5 min y volvé a correr este script."
  exit 1
elif [ "$RESOLVED" != "$VPS_IP" ]; then
  red "✗ $DOMAIN resuelve a '$RESOLVED' pero el VPS es '$VPS_IP'."
  yellow "  → Corregí el registro DNS y volvé a correr este script."
  exit 1
else
  green "✓ $DOMAIN → $RESOLVED"
fi

# -----------------------------------------------------------------------------
# Paso 2: código en /opt/ciclica-app
# -----------------------------------------------------------------------------
cyan "=== 2/6 · Sincronizando código desde GitHub ==="
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin main
  git reset --hard origin/main
  green "✓ Código actualizado (HEAD: $(git rev-parse --short HEAD))"
else
  # Si /opt/ciclica-app existe pero no es repo git, salvamos su .env primero
  if [ -d "$APP_DIR" ]; then
    yellow "  ⚠ $APP_DIR existe pero no es un repo git — backup a $APP_DIR.bak.$(date +%s)"
    if [ -f "$APP_DIR/.env" ]; then
      cp "$APP_DIR/.env" "/tmp/ciclica-env-backup-$(date +%s).env"
      green "  ✓ .env preservado en /tmp/"
    fi
    mv "$APP_DIR" "$APP_DIR.bak.$(date +%s)"
  fi
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
  green "✓ Repo clonado (HEAD: $(git rev-parse --short HEAD))"
fi

# Restaurar .env si quedó en /tmp
LATEST_ENV_BACKUP=$(ls -t /tmp/ciclica-env-backup-*.env 2>/dev/null | head -1 || true)
if [ -n "$LATEST_ENV_BACKUP" ] && [ ! -f "$APP_DIR/.env" ]; then
  cp "$LATEST_ENV_BACKUP" "$APP_DIR/.env"
  green "  ✓ .env restaurado desde backup"
fi

# -----------------------------------------------------------------------------
# Paso 3: .env de producción
# -----------------------------------------------------------------------------
cyan "=== 3/6 · Verificando .env de producción ==="
ENV_FILE="$APP_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  yellow "  ⚠ No hay .env todavía. Creando plantilla..."
  cat > "$ENV_FILE" <<'EOF'
# Supabase (self-hosted en este mismo VPS)
NEXT_PUBLIC_SUPABASE_URL=https://melsupabase.n8nflip.online
NEXT_PUBLIC_SUPABASE_ANON_KEY=__PEGAR_AQUI__
SUPABASE_SERVICE_KEY=__PEGAR_AQUI__

# App
NEXT_PUBLIC_APP_URL=https://app.ciclica.pro

# Stripe (opcional — sin esto, los endpoints devuelven 503 limpio)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=

# Mercado Pago (opcional)
MP_ACCESS_TOKEN=
MP_PLAN_AMOUNT=4.99
MP_CURRENCY=USD
MP_WEBHOOK_SECRET=
EOF
  chmod 600 "$ENV_FILE"
  red "✗ Tenés que editar $ENV_FILE y pegar las dos keys de Supabase antes de seguir."
  yellow "  → Las podés sacar del servicio Kong o del docker-compose del stack supabase."
  yellow "  → Probá:  docker service inspect supabase_kong --format '{{range .Spec.TaskTemplate.ContainerSpec.Env}}{{println .}}{{end}}' | grep -iE 'ANON_KEY|SERVICE_ROLE_KEY'"
  yellow "  → Editá con:  nano $ENV_FILE"
  yellow "  → Volvé a correr:  bash $APP_DIR/deploy.sh"
  exit 1
fi

# Verificar que no haya placeholders sin reemplazar
if grep -q "__PEGAR_AQUI__" "$ENV_FILE"; then
  red "✗ Hay placeholders __PEGAR_AQUI__ sin reemplazar en $ENV_FILE"
  yellow "  → Editalo:  nano $ENV_FILE"
  yellow "  → Y volvé a correr este script."
  exit 1
fi

# Validar que tenga las vars críticas
REQUIRED_VARS="NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_KEY NEXT_PUBLIC_APP_URL"
for VAR in $REQUIRED_VARS; do
  if ! grep -q "^${VAR}=" "$ENV_FILE" || [ -z "$(grep "^${VAR}=" "$ENV_FILE" | cut -d= -f2-)" ]; then
    red "✗ $VAR está vacía o falta en $ENV_FILE"
    exit 1
  fi
done

# Verificar que apunte al dominio correcto
if ! grep -q "^NEXT_PUBLIC_APP_URL=https://app.ciclica.pro" "$ENV_FILE"; then
  yellow "  ⚠ NEXT_PUBLIC_APP_URL no es 'https://app.ciclica.pro' — corrigiendo..."
  sed -i 's|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://app.ciclica.pro|' "$ENV_FILE"
fi

green "✓ .env OK"

# -----------------------------------------------------------------------------
# Paso 4: build de la imagen
# -----------------------------------------------------------------------------
cyan "=== 4/6 · Build de imagen Docker ==="
set -a
. "$ENV_FILE"
set +a

# Buildeamos con los build-args de NEXT_PUBLIC_* (necesarios en build time)
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --build-arg NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
  -t ciclica-web:latest \
  "$APP_DIR"

green "✓ Imagen ciclica-web:latest construida"

# -----------------------------------------------------------------------------
# Paso 5: deploy en el stack
# -----------------------------------------------------------------------------
cyan "=== 5/6 · Deploy del stack ==="

# Si existe un router viejo en Traefik apuntando a ciclica.pro (sin app.), lo apagamos
OLD_CONTAINERS=$(docker ps -q --filter "label=traefik.http.routers.ciclica.rule" 2>/dev/null || true)
if [ -n "$OLD_CONTAINERS" ]; then
  yellow "  ⚠ Hay containers viejos con la regla ciclica.pro (sin app.) — pueden estar pisando al landing"
fi

# Deploy con docker stack (que es lo que ya usás para el resto)
docker stack deploy -c "$APP_DIR/docker-compose.yml" "$STACK_NAME" --resolve-image=never

green "✓ Stack '$STACK_NAME' deployado"

# -----------------------------------------------------------------------------
# Paso 6: verificación
# -----------------------------------------------------------------------------
cyan "=== 6/6 · Verificación ==="

yellow "  Esperando 20s a que el container arranque + Traefik emita cert..."
sleep 20

echo ""
echo "--- Servicios del stack ---"
docker stack services "$STACK_NAME"

echo ""
echo "--- Estado del task ---"
docker stack ps "$STACK_NAME" --no-trunc | head -10

echo ""
echo "--- Probando endpoint interno (red Docker) ---"
CONTAINER=$(docker ps --filter "name=${STACK_NAME}_ciclica-web" --format '{{.Names}}' | head -1)
if [ -n "$CONTAINER" ]; then
  docker exec "$CONTAINER" wget -qO- http://localhost:3000/api/health 2>&1 | head -3 || red "✗ Health check interno falló"
else
  red "✗ No encontré el container ${STACK_NAME}_ciclica-web"
fi

echo ""
echo "--- Probando endpoint externo (https://$DOMAIN) ---"
EXTERNAL_HEALTH=$(curl -sk -m 15 -w "\n%{http_code}" "https://$DOMAIN/api/health" || echo "FAIL")
echo "$EXTERNAL_HEALTH"

echo ""
green "==============================================================="
green " Deploy terminado."
green " Probá: https://$DOMAIN/"
green "==============================================================="
echo ""
yellow "Si el cert SSL todavía no está emitido, Traefik puede tardar"
yellow "hasta 60s extra. Refrescá la URL en 1 min."
echo ""
yellow "Próximos pasos manuales:"
yellow "  1. Correr migraciones SQL en Supabase (010 + 011):"
yellow "     cat $APP_DIR/migrations/010_pastillas_y_plan_premium.sql"
yellow "     cat $APP_DIR/migrations/011_limpiar_datos_n8n.sql"
yellow "  2. En Supabase Studio → Authentication → Email Templates → Magic Link,"
yellow "     pegar el HTML de: $APP_DIR/app/api/email-templates/magic-link/route.ts"
