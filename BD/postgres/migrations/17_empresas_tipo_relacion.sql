-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Clasificación de empresa: cliente del servicio, tercero o empresa propia (Antares).

DO $$
BEGIN
  CREATE TYPE public.tipo_relacion_empresa AS ENUM ('cliente', 'tercero', 'propia');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS tipo_relacion_empresa public.tipo_relacion_empresa NOT NULL DEFAULT 'cliente';

COMMENT ON COLUMN public.empresas.tipo_relacion_empresa IS 'cliente = contrata servicios; tercero = proveedor u otro; propia = operador Antares.';

-- Solo puede existir una empresa marcada como propia (operador).
CREATE UNIQUE INDEX IF NOT EXISTS uq_empresas_una_sola_propia
  ON public.empresas ((true))
  WHERE tipo_relacion_empresa = 'propia'::public.tipo_relacion_empresa;
