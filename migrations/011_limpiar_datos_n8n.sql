-- =============================================
-- Migration 011: Limpieza de datos sucios de n8n
--   1. Normalizar prefijos basura (=, +) en telefono de historial_ciclos
--      y registros_ciclo
--   2. Borrar registros_ciclo duplicados (mismo telefono + created_at + sintoma)
--   3. Borrar historial_ciclos duplicados (mismo telefono + fecha_inicio,
--      conservando la fila con duracion_dias > 0)
--   4. Borrar historial_ciclos con duraciones imposibles (0, NULL, < 15 o > 60)
--   5. Trigger preventivo para que futuras inserciones con prefijo se limpien
-- =============================================

-- 1. Normalizar prefijos basura: '=5491...' o '+5491...' → '5491...'
UPDATE historial_ciclos SET telefono = LTRIM(telefono, '=+ ');
UPDATE registros_ciclo  SET telefono = LTRIM(telefono, '=+ ');
UPDATE usuarias         SET telefono = LTRIM(telefono, '=+ ') WHERE telefono LIKE '=%' OR telefono LIKE '+%';
UPDATE usuarias_web     SET telefono = LTRIM(telefono, '=+ ') WHERE telefono LIKE '=%' OR telefono LIKE '+%';

-- 2. Dedupe registros_ciclo (mismo created_at + sintoma + telefono).
--    Conservamos la fila con menor id (la más antigua).
DELETE FROM registros_ciclo a
USING registros_ciclo b
WHERE a.id > b.id
  AND a.telefono = b.telefono
  AND a.created_at = b.created_at
  AND COALESCE(a.sintoma, '') = COALESCE(b.sintoma, '');

-- 3. Dedupe historial_ciclos por (telefono, fecha_inicio).
--    Conservamos la fila con MAYOR duracion_dias.
DELETE FROM historial_ciclos a
USING historial_ciclos b
WHERE a.id <> b.id
  AND a.telefono = b.telefono
  AND a.fecha_inicio = b.fecha_inicio
  AND (
    COALESCE(a.duracion_dias, 0) < COALESCE(b.duracion_dias, 0)
    OR (COALESCE(a.duracion_dias, 0) = COALESCE(b.duracion_dias, 0) AND a.id > b.id)
  );

-- 4. Borrar ciclos con duración inválida (< 15 días o > 60 días)
DELETE FROM historial_ciclos
WHERE duracion_dias IS NULL
   OR duracion_dias < 15
   OR duracion_dias > 60;

-- 5. Trigger preventivo: si alguien inserta un teléfono con prefijo basura,
--    lo limpiamos antes de guardar.
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
