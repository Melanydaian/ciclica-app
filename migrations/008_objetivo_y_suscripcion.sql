-- Migration 008: objetivo tipado + suscripción Stripe

-- Columna objetivo en usuarias (derivada de desea_embarazo)
ALTER TABLE usuarias ADD COLUMN IF NOT EXISTS objetivo text DEFAULT 'evitar_embarazo'
  CHECK (objetivo IN ('buscar_embarazo', 'evitar_embarazo'));

-- Poblar objetivo para usuarias existentes
UPDATE usuarias
SET objetivo = CASE
  WHEN desea_embarazo = 'true' OR desea_embarazo = 'si' OR desea_embarazo = 'sí' THEN 'buscar_embarazo'
  ELSE 'evitar_embarazo'
END
WHERE objetivo IS NULL OR objetivo = 'evitar_embarazo';

-- Columnas de suscripción en usuarias_web (el plan se compra por email/web)
ALTER TABLE usuarias_web ADD COLUMN IF NOT EXISTS suscripcion_activa boolean DEFAULT false;
ALTER TABLE usuarias_web ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE usuarias_web ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE usuarias_web ADD COLUMN IF NOT EXISTS suscripcion_plan text DEFAULT 'free'
  CHECK (suscripcion_plan IN ('free', 'fertilidad'));
