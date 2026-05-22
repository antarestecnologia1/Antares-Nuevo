-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Empresa activa/inactiva en portal (altas y listados filtrables).

ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.empresas.activo IS 'Si es false, la empresa no se ofrece en altas (portal); usuarios ya asignados pueden conservar id_empresa.';
