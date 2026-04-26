-- =============================================
-- Migration 005: Remove Supabase triggers that conflict with n8n
-- n8n owns historial_ciclos insertion and promedio calculation
-- =============================================

-- Drop triggers from migration 003 (n8n handles this logic)
DROP TRIGGER IF EXISTS trigger_nuevo_ciclo ON usuarias;
DROP TRIGGER IF EXISTS trigger_actualizar_promedio ON historial_ciclos;
DROP FUNCTION IF EXISTS registrar_ciclo_anterior();
DROP FUNCTION IF EXISTS actualizar_promedio_ciclo();


-- =============================================
-- Auto-generate codigo_referido on new usuaria
-- n8n onboarding doesn't set this, so Supabase does
-- =============================================
CREATE OR REPLACE FUNCTION generar_codigo_referido()
RETURNS TRIGGER AS $$
DECLARE
  nuevo_codigo TEXT;
  intento INT := 0;
BEGIN
  -- Only generate if not already set
  IF NEW.codigo_referido IS NOT NULL THEN
    RETURN NEW;
  END IF;

  LOOP
    -- 6-char alphanumeric code from phone tail + random
    nuevo_codigo := UPPER(
      SUBSTRING(
        REPLACE(REPLACE(encode(gen_random_bytes(4), 'base64'), '+', ''), '/', ''),
        1, 6
      )
    );

    -- Check uniqueness
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM usuarias WHERE codigo_referido = nuevo_codigo
    );

    intento := intento + 1;
    IF intento > 10 THEN
      nuevo_codigo := UPPER(SUBSTRING(MD5(NEW.telefono || NOW()::text), 1, 6));
      EXIT;
    END IF;
  END LOOP;

  NEW.codigo_referido := nuevo_codigo;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_generar_codigo_referido ON usuarias;
CREATE TRIGGER trigger_generar_codigo_referido
  BEFORE INSERT ON usuarias
  FOR EACH ROW
  EXECUTE FUNCTION generar_codigo_referido();
