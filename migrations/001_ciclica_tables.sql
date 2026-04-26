-- =============================================
-- Cíclica — Migración completa
-- Ejecutar en SQL Editor del Supabase local
-- =============================================

CREATE TABLE IF NOT EXISTS usuarias (
  id                      uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono                text UNIQUE NOT NULL,
  nombre                  text,
  edad                    int4,
  desea_embarazo          text,
  fecha_inicio_ciclo      date,
  anticonceptivo          text,
  duracion_ciclo          int4 DEFAULT 28,
  promedio_duracion_ciclo int4,
  created_at              timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarias_web (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email                 text UNIQUE NOT NULL,
  telefono              text,
  nombre                text,
  usuaria_whatsapp_id   int4,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS historial_ciclos (
  id           int4 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  telefono     varchar NOT NULL,
  fecha_inicio date,
  duracion_dias int4,
  created_at   timestamp DEFAULT now(),
  updated_at   timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registros_ciclo (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono    text NOT NULL,
  fase_actual text,
  sintoma     text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recordatorios_enviados (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono          text,
  tipo_recordatorio text,
  fecha_envio       date,
  mensaje           text,
  created_at        timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sex_registros (
  id               int8 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          text,
  fecha            date,
  fase             text,
  hubo_proteccion  text,
  proteccion       text,
  nota_adicional   text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarias_web_email    ON usuarias_web(email);
CREATE INDEX IF NOT EXISTS idx_usuarias_web_telefono ON usuarias_web(telefono);
CREATE INDEX IF NOT EXISTS idx_registros_telefono    ON registros_ciclo(telefono);
CREATE INDEX IF NOT EXISTS idx_registros_created     ON registros_ciclo(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historial_telefono    ON historial_ciclos(telefono);

-- RLS
ALTER TABLE usuarias           ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarias_web       ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_ciclos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_ciclo    ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordatorios_enviados ENABLE ROW LEVEL SECURITY;
ALTER TABLE sex_registros      ENABLE ROW LEVEL SECURITY;

-- Políticas (la web lee por email → busca telefono → accede a datos)
CREATE POLICY "usuarias_web_own" ON usuarias_web
  FOR ALL USING (email = auth.jwt() ->> 'email');

-- Las demás tablas: acceso via telefono linkado en usuarias_web
CREATE POLICY "usuarias_own" ON usuarias
  FOR SELECT USING (
    telefono IN (SELECT telefono FROM usuarias_web WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "historial_own" ON historial_ciclos
  FOR SELECT USING (
    telefono IN (SELECT telefono FROM usuarias_web WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "registros_own" ON registros_ciclo
  FOR SELECT USING (
    telefono IN (SELECT telefono FROM usuarias_web WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "sex_registros_own" ON sex_registros
  FOR SELECT USING (
    user_id IN (SELECT telefono FROM usuarias_web WHERE email = auth.jwt() ->> 'email')
  );

-- =============================================
-- Datos de ejemplo para testing
-- =============================================
INSERT INTO usuarias (telefono, nombre, edad, fecha_inicio_ciclo, duracion_ciclo, promedio_duracion_ciclo)
VALUES ('5491122879463@s.whatsapp.net', 'Meli', 26, '2026-04-18', 28, 28)
ON CONFLICT (telefono) DO NOTHING;

INSERT INTO usuarias_web (email, telefono, nombre)
VALUES ('dev.melanydaiana@gmail.com', '5491122879463@s.whatsapp.net', 'Meli')
ON CONFLICT (email) DO NOTHING;

INSERT INTO historial_ciclos (telefono, fecha_inicio, duracion_dias) VALUES
  ('5491122879463@s.whatsapp.net', '2026-03-21', 28),
  ('5491122879463@s.whatsapp.net', '2026-02-21', 28),
  ('5491122879463@s.whatsapp.net', '2026-01-24', 28)
ON CONFLICT DO NOTHING;

INSERT INTO registros_ciclo (telefono, fase_actual, sintoma, created_at) VALUES
  ('5491122879463@s.whatsapp.net', 'menstrual',  'cólicos fuertes', '2026-04-21'),
  ('5491122879463@s.whatsapp.net', 'menstrual',  'cansancio',       '2026-04-20'),
  ('5491122879463@s.whatsapp.net', 'lutea',      'ansiedad',        '2026-04-15'),
  ('5491122879463@s.whatsapp.net', 'lutea',      'hinchazón',       '2026-04-14'),
  ('5491122879463@s.whatsapp.net', 'ovulatoria', 'dolor leve',      '2026-04-10'),
  ('5491122879463@s.whatsapp.net', 'folicular',  'energía alta',    '2026-04-05')
ON CONFLICT DO NOTHING;
