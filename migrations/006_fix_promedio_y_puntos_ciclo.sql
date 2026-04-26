-- =============================================
-- Migration 006: Restaurar promedio y puntos de ciclo
-- Ahora disparan en historial_ciclos INSERT (lo que inserta n8n)
-- en vez de en usuarias UPDATE (que era el conflicto)
-- =============================================

-- Recalcular promedio_duracion_ciclo cuando n8n inserta en historial_ciclos
CREATE OR REPLACE FUNCTION actualizar_promedio_ciclo()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE usuarias
  SET promedio_duracion_ciclo = (
    SELECT ROUND(AVG(duracion_dias))::int
    FROM historial_ciclos
    WHERE telefono = NEW.telefono
      AND duracion_dias IS NOT NULL
      AND duracion_dias BETWEEN 15 AND 60
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


-- +10 puntos cuando n8n registra un nuevo ciclo en historial_ciclos
CREATE OR REPLACE FUNCTION puntuar_nuevo_ciclo()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE usuarias
  SET puntos = COALESCE(puntos, 0) + 10
  WHERE telefono = NEW.telefono;

  INSERT INTO puntos_log (telefono, puntos, concepto, descripcion)
  VALUES (NEW.telefono, 10, 'nuevo_ciclo', 'Nuevo ciclo registrado');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_puntos_nuevo_ciclo ON historial_ciclos;
CREATE TRIGGER trigger_puntos_nuevo_ciclo
  AFTER INSERT ON historial_ciclos
  FOR EACH ROW
  EXECUTE FUNCTION puntuar_nuevo_ciclo();
