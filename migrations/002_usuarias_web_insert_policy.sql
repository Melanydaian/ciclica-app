-- Permite que un usuario autenticado inserte su propia fila en usuarias_web
-- (necesario para el onboarding desde la web cuando no vino por WhatsApp)
CREATE POLICY "usuarias_web_insert_own" ON usuarias_web
  FOR INSERT WITH CHECK (email = auth.jwt() ->> 'email');
