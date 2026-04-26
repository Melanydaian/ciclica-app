-- =============================================
-- Trigger 1: al actualizar fecha_inicio_ciclo,
-- registra el ciclo anterior en historial_ciclos
-- =============================================
CREATE OR REPLACE FUNCTION registrar_ciclo_anterior()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actúa si la fecha cambió y había una fecha previa
  IF OLD.fecha_inicio_ciclo IS NOT NULL
     AND NEW.fecha_inicio_ciclo IS NOT NULL
     AND OLD.fecha_inicio_ciclo IS DISTINCT FROM NEW.fecha_inicio_ciclo
     AND NEW.fecha_inicio_ciclo > OLD.fecha_inicio_ciclo THEN

    INSERT INTO historial_ciclos (telefono, fecha_inicio, duracion_dias)
    VALUES (
      OLD.telefono,
      OLD.fecha_inicio_ciclo,
      (NEW.fecha_inicio_ciclo - OLD.fecha_inicio_ciclo)
    )
    ON CONFLICT DO NOTHING;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_nuevo_ciclo ON usuarias;
CREATE TRIGGER trigger_nuevo_ciclo
  AFTER UPDATE OF fecha_inicio_ciclo ON usuarias
  FOR EACH ROW
  EXECUTE FUNCTION registrar_ciclo_anterior();


-- =============================================
-- Trigger 2: al insertar en historial_ciclos,
-- recalcula el promedio en usuarias
-- =============================================
CREATE OR REPLACE FUNCTION actualizar_promedio_ciclo()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE usuarias
  SET promedio_duracion_ciclo = (
    SELECT ROUND(AVG(duracion_dias))::int
    FROM historial_ciclos
    WHERE telefono = NEW.telefono
      AND duracion_dias IS NOT NULL
      AND duracion_dias BETWEEN 15 AND 60  -- filtra valores absurdos
  )
  WHERE telefono = NEW.telefono;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_actualizar_promedio ON historial_ciclos;
CREATE TRIGGER trigger_actualizar_promedio
  AFTER INSERT OR UPDATE OF duracion_dias ON historial_ciclos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_promedio_ciclo();
