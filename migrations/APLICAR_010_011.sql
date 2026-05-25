-- =============================================================================
-- APLICAR EN SUPABASE STUDIO → SQL Editor (de tu Supabase self-hosted)
-- =============================================================================
-- Este archivo es la suma de migrations/010 + 011.
-- Es idempotente: podés correrlo más de una vez sin romper nada.
-- =============================================================================

-- =============================================
-- 010 · pastillas_log + toma_anticonceptivas + plan premium
-- =============================================

ALTER TABLE usuarias ADD COLUMN IF NOT EXISTS toma_anticonceptivas boolean DEFAULT false;

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

ALTER TABLE usuarias_web DROP CONSTRAINT IF EXISTS usuarias_web_suscripcion_plan_check;
ALTER TABLE usuarias_web
  ADD CONSTRAINT usuarias_web_suscripcion_plan_check
  CHECK (suscripcion_plan IN ('free', 'premium'));

UPDATE usuarias_web SET suscripcion_plan = 'premium' WHERE suscripcion_plan = 'fertilidad';

-- =============================================
-- 011 · Limpieza de datos sucios de n8n
-- =============================================

UPDATE historial_ciclos SET telefono = LTRIM(telefono, '=+ ');
UPDATE registros_ciclo  SET telefono = LTRIM(telefono, '=+ ');
UPDATE usuarias         SET telefono = LTRIM(telefono, '=+ ') WHERE telefono LIKE '=%' OR telefono LIKE '+%';
UPDATE usuarias_web     SET telefono = LTRIM(telefono, '=+ ') WHERE telefono LIKE '=%' OR telefono LIKE '+%';

DELETE FROM registros_ciclo a
USING registros_ciclo b
WHERE a.id > b.id
  AND a.telefono = b.telefono
  AND a.created_at = b.created_at
  AND COALESCE(a.sintoma, '') = COALESCE(b.sintoma, '');

DELETE FROM historial_ciclos a
USING historial_ciclos b
WHERE a.id <> b.id
  AND a.telefono = b.telefono
  AND a.fecha_inicio = b.fecha_inicio
  AND (
    COALESCE(a.duracion_dias, 0) < COALESCE(b.duracion_dias, 0)
    OR (COALESCE(a.duracion_dias, 0) = COALESCE(b.duracion_dias, 0) AND a.id > b.id)
  );

DELETE FROM historial_ciclos
WHERE duracion_dias IS NULL
   OR duracion_dias < 15
   OR duracion_dias > 60;

CREATE OR REPLACE FUNCTION normalizar_telefono()
RETURNS TRIGGER AS $$
BEGIN
  NEW.telefono := LTRIM(NEW.telefono, '=+ ');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalizar_tel_historial ON historial_ciclos;
CREATE TRIGGER trg_normalizar_tel_historial
  BEFORE INSERT OR UPDATE OF telefono ON historial_ciclos
  FOR EACH ROW EXECUTE FUNCTION normalizar_telefono();

DROP TRIGGER IF EXISTS trg_normalizar_tel_registros ON registros_ciclo;
CREATE TRIGGER trg_normalizar_tel_registros
  BEFORE INSERT OR UPDATE OF telefono ON registros_ciclo
  FOR EACH ROW EXECUTE FUNCTION normalizar_telefono();

DROP TRIGGER IF EXISTS trg_normalizar_tel_usuarias ON usuarias;
CREATE TRIGGER trg_normalizar_tel_usuarias
  BEFORE INSERT OR UPDATE OF telefono ON usuarias
  FOR EACH ROW EXECUTE FUNCTION normalizar_telefono();

DROP TRIGGER IF EXISTS trg_normalizar_tel_usuarias_web ON usuarias_web;
CREATE TRIGGER trg_normalizar_tel_usuarias_web
  BEFORE INSERT OR UPDATE OF telefono ON usuarias_web
  FOR EACH ROW EXECUTE FUNCTION normalizar_telefono();

-- =============================================
-- LISTO
-- =============================================
SELECT 'Migraciones 010 + 011 aplicadas correctamente' AS status;
