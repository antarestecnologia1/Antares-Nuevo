-- URL del logo de empresa (portal admin); alineado con company.logoUrl en app.js / KEYS.companies.

ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS url_logo TEXT;

COMMENT ON COLUMN public.empresas.url_logo IS 'URL pública del logo (p. ej. R2); vacío si no hay logo.';
