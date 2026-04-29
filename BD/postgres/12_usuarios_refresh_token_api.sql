-- Columna para rotación de refresh JWT de la API Nest (hash bcrypt del refresh token).
-- Ejecutar en Supabase SQL Editor después de los scripts anteriores.

ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT;

COMMENT ON COLUMN public.usuarios.refresh_token_hash IS 'Hash bcrypt del último refresh JWT emitido por apps/api (rotación).';
