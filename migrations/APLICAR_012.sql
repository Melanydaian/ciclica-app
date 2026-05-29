-- =============================================
-- APLICAR EN SUPABASE STUDIO → SQL Editor
-- Migración 012: journal + share tokens
-- Idempotente, podés correrlo varias veces.
-- =============================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono    text NOT NULL,
  fecha       date NOT NULL,
  fase        text,
  texto       text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_journal_telefono ON journal_entries(telefono);
CREATE INDEX IF NOT EXISTS idx_journal_fecha ON journal_entries(telefono, fecha DESC);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "journal_entries_own" ON journal_entries;
CREATE POLICY "journal_entries_own" ON journal_entries
  FOR ALL USING (
    telefono IN (SELECT telefono FROM usuarias_web WHERE email = auth.jwt() ->> 'email')
  );

CREATE TABLE IF NOT EXISTS medical_share_tokens (
  token       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono    text NOT NULL,
  email       text NOT NULL,
  expira      timestamptz NOT NULL,
  created_at  timestamptz DEFAULT now(),
  revocado    boolean DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_medical_share_email ON medical_share_tokens(email);
ALTER TABLE medical_share_tokens ENABLE ROW LEVEL SECURITY;

SELECT 'Migración 012 aplicada correctamente' AS status;
