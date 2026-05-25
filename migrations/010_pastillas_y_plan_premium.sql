-- =============================================
-- Migration 010:
--   1. Agregar toma_anticonceptivas a usuarias
--   2. Crear tabla pastillas_log (referenciada por /api/pastilla)
--   3. Alinear CHECK de suscripcion_plan con lo que escriben los webhooks ('premium')
-- =============================================

-- 1. Columna que indica si la usuaria toma pastillas anticonceptivas
ALTER TABLE usuarias ADD COLUMN IF NOT EXISTS toma_anticonceptivas boolean DEFAULT false;

-- 2. Log diario de toma de pastilla
CREATE TABLE IF NOT EXISTS pastillas_log (
  telefono   text NOT NULL,
  fecha      date NOT NULL,
  tomada     boolean DEFAULT false,
  hora       text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (telefono, fecha)
);

CREATE INDEX IF NOT EXISTS idx_pastillas_log_telefono ON pastillas_log(telefono);

ALTER TABLE pastillas_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pastillas_log_own" ON pastillas_log;
CREATE POLICY "pastillas_log_own" ON pastillas_log
  FOR ALL USING (
    telefono IN (SELECT telefono FROM usuarias_web WHERE email = auth.jwt() ->> 'email')
  );

-- 3. Alinear CHECK constraint del plan con lo que escriben Stripe y MP webhooks
ALTER TABLE usuarias_web DROP CONSTRAINT IF EXISTS usuarias_web_suscripcion_plan_check;
ALTER TABLE usuarias_web
  ADD CONSTRAINT usuarias_web_suscripcion_plan_check
  CHECK (suscripcion_plan IN ('free', 'premium'));

-- Migrar filas existentes con plan 'fertilidad' (de migración 008) a 'premium'
UPDATE usuarias_web SET suscripcion_plan = 'premium' WHERE suscripcion_plan = 'fertilidad';
