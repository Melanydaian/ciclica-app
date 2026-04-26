-- =============================================
-- Sistema de puntos y referidos
-- =============================================

-- Columnas en usuarias
ALTER TABLE usuarias ADD COLUMN IF NOT EXISTS puntos int DEFAULT 0;
ALTER TABLE usuarias ADD COLUMN IF NOT EXISTS codigo_referido text;

-- Código único por usuaria (primeros 8 chars del UUID generado)
UPDATE usuarias
SET codigo_referido = UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))
WHERE codigo_referido IS NULL;

ALTER TABLE usuarias ADD CONSTRAINT IF NOT EXISTS usuarias_codigo_referido_unique UNIQUE (codigo_referido);

-- Log de puntos (historial completo)
CREATE TABLE IF NOT EXISTS puntos_log (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono    text NOT NULL,
  puntos      int NOT NULL,
  concepto    text NOT NULL, -- 'registro_sintoma' | 'nuevo_ciclo' | 'referido'
  descripcion text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_puntos_log_telefono ON puntos_log(telefono);

-- Tabla de referidos
CREATE TABLE IF NOT EXISTS referidos (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono_referidor  text NOT NULL,
  telefono_referida   text NOT NULL,
  puntos_otorgados    boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  UNIQUE(telefono_referida)  -- cada usuaria solo puede ser referida una vez
);

-- RLS
ALTER TABLE puntos_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE referidos  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "puntos_log_own" ON puntos_log
  FOR SELECT USING (
    telefono IN (SELECT telefono FROM usuarias_web WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "referidos_own" ON referidos
  FOR SELECT USING (
    telefono_referidor IN (SELECT telefono FROM usuarias_web WHERE email = auth.jwt() ->> 'email')
  );

-- =============================================
-- Trigger: registro de síntoma → +5 puntos
-- =============================================
CREATE OR REPLACE FUNCTION puntuar_registro_sintoma()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sintoma IS NOT NULL AND NEW.sintoma != '' THEN
    -- Sumar puntos
    UPDATE usuarias SET puntos = COALESCE(puntos, 0) + 5
    WHERE telefono = NEW.telefono;

    INSERT INTO puntos_log (telefono, puntos, concepto, descripcion)
    VALUES (NEW.telefono, 5, 'registro_sintoma', 'Registraste: ' || NEW.sintoma);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_puntos_sintoma ON registros_ciclo;
CREATE TRIGGER trigger_puntos_sintoma
  AFTER INSERT ON registros_ciclo
  FOR EACH ROW
  EXECUTE FUNCTION puntuar_registro_sintoma();

-- =============================================
-- Trigger: nuevo ciclo → +10 puntos
-- (se agrega a la función existente de registrar_ciclo_anterior)
-- =============================================
CREATE OR REPLACE FUNCTION registrar_ciclo_anterior()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.fecha_inicio_ciclo IS NOT NULL
     AND NEW.fecha_inicio_ciclo IS NOT NULL
     AND OLD.fecha_inicio_ciclo IS DISTINCT FROM NEW.fecha_inicio_ciclo
     AND NEW.fecha_inicio_ciclo > OLD.fecha_inicio_ciclo THEN

    -- Registrar ciclo anterior en historial
    INSERT INTO historial_ciclos (telefono, fecha_inicio, duracion_dias)
    VALUES (
      OLD.telefono,
      OLD.fecha_inicio_ciclo,
      (NEW.fecha_inicio_ciclo - OLD.fecha_inicio_ciclo)
    )
    ON CONFLICT DO NOTHING;

    -- Sumar puntos por nuevo ciclo registrado
    UPDATE usuarias SET puntos = COALESCE(puntos, 0) + 10
    WHERE telefono = NEW.telefono;

    INSERT INTO puntos_log (telefono, puntos, concepto, descripcion)
    VALUES (NEW.telefono, 10, 'nuevo_ciclo', 'Nuevo ciclo registrado');

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Trigger: referido exitoso → +50 puntos al referidor
-- =============================================
CREATE OR REPLACE FUNCTION puntuar_referido()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT NEW.puntos_otorgados THEN
    -- Sumar puntos al referidor
    UPDATE usuarias SET puntos = COALESCE(puntos, 0) + 50
    WHERE telefono = NEW.telefono_referidor;

    INSERT INTO puntos_log (telefono, puntos, concepto, descripcion)
    VALUES (NEW.telefono_referidor, 50, 'referido', 'Referiste a una amiga 🌸');

    -- Marcar como otorgados
    UPDATE referidos SET puntos_otorgados = true WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_puntos_referido ON referidos;
CREATE TRIGGER trigger_puntos_referido
  AFTER INSERT ON referidos
  FOR EACH ROW
  EXECUTE FUNCTION puntuar_referido();
