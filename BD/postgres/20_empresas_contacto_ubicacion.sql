-- Contacto y ubicación operativa en empresas (alineado con formulario admin del portal).

ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS correo_empresarial VARCHAR(120),
  ADD COLUMN IF NOT EXISTS nombre_contacto VARCHAR(255),
  ADD COLUMN IF NOT EXISTS departamento VARCHAR(120),
  ADD COLUMN IF NOT EXISTS ciudad VARCHAR(120),
  ADD COLUMN IF NOT EXISTS direccion_operativa TEXT;

COMMENT ON COLUMN public.empresas.correo_empresarial IS 'Correo de contacto operativo (panel admin / portal).';
COMMENT ON COLUMN public.empresas.nombre_contacto IS 'Persona de contacto principal.';
COMMENT ON COLUMN public.empresas.departamento IS 'Departamento sede u operación.';
COMMENT ON COLUMN public.empresas.ciudad IS 'Ciudad sede u operación.';
COMMENT ON COLUMN public.empresas.direccion_operativa IS 'Dirección operativa o sede.';
