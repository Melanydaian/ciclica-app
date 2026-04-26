-- Migration 009: campos para features premium

-- Hora del recordatorio de pastilla (formato HH:MM, ej: "08:00")
ALTER TABLE usuarias ADD COLUMN IF NOT EXISTS recordatorio_pastilla_hora text;
-- Si la usuaria quiere recordatorio de pastilla activado
ALTER TABLE usuarias ADD COLUMN IF NOT EXISTS recordatorio_pastilla_activo boolean DEFAULT false;

-- Mercado Pago subscription ID
ALTER TABLE usuarias_web ADD COLUMN IF NOT EXISTS mp_subscription_id text;
ALTER TABLE usuarias_web ADD COLUMN IF NOT EXISTS mp_payer_id text;

-- Proveedor de pago ('stripe' | 'mercadopago')
ALTER TABLE usuarias_web ADD COLUMN IF NOT EXISTS proveedor_pago text;
