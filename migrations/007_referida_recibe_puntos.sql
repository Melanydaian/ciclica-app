-- Migration 007: la usuaria referida también recibe +10 pts al unirse
CREATE OR REPLACE FUNCTION puntuar_referido()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT NEW.puntos_otorgados THEN
    -- +50 pts al referidor
    UPDATE usuarias SET puntos = COALESCE(puntos, 0) + 50
    WHERE telefono = NEW.telefono_referidor;

    INSERT INTO puntos_log (telefono, puntos, concepto, descripcion)
    VALUES (NEW.telefono_referidor, 50, 'referido', 'Referiste a una amiga 🌸');

    -- +10 pts a la referida (bienvenida)
    UPDATE usuarias SET puntos = COALESCE(puntos, 0) + 10
    WHERE telefono = NEW.telefono_referida;

    INSERT INTO puntos_log (telefono, puntos, concepto, descripcion)
    VALUES (NEW.telefono_referida, 10, 'referido', 'Te uniste con el código de una amiga 🌸');

    UPDATE referidos SET puntos_otorgados = true WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
