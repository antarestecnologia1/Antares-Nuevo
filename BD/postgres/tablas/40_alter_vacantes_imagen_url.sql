-- Imagen opcional de la vacante (foto/ilustración del cargo) para el portal de Carreras.
-- Ejecutar en bases existentes después de 10_vacantes.sql.
-- Idempotente: la API también aplica este esquema en ensureVacantesSchema().

ALTER TABLE public.vacantes
  ADD COLUMN IF NOT EXISTS imagen_url TEXT;

COMMENT ON COLUMN public.vacantes.imagen_url IS
  'URL pública de la imagen del cargo/vacante (portal Carreras).';
