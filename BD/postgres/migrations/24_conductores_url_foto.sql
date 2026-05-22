-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Fotografía opcional del conductor en el portal (URL pública, p. ej. R2/CDN).
-- Instalación nueva: columna ya en 04_transporte.sql (conductores.url_foto).

ALTER TABLE public.conductores
  ADD COLUMN IF NOT EXISTS url_foto TEXT;

COMMENT ON COLUMN public.conductores.url_foto IS 'Foto perfil conductor (HTTPS); KEYS.drivers[].photoUrl.';
