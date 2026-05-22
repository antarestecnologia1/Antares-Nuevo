-- Auditoría: usuario del portal que registró la carga / novedad de taller.
-- Ejecutar después de 04_transporte.sql y 38_registros_flota_constraints.sql.

ALTER TABLE public.registros_combustible
  ADD COLUMN IF NOT EXISTS id_usuario_registro UUID REFERENCES usuarios (id) ON DELETE SET NULL;

ALTER TABLE public.registros_mantenimiento_vehiculo
  ADD COLUMN IF NOT EXISTS id_usuario_registro UUID REFERENCES usuarios (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_combustible_usuario_registro
  ON public.registros_combustible (id_usuario_registro);

CREATE INDEX IF NOT EXISTS idx_mantenimiento_usuario_registro
  ON public.registros_mantenimiento_vehiculo (id_usuario_registro);

COMMENT ON COLUMN public.registros_combustible.id_usuario_registro IS
  'Usuario autenticado que registró la carga (POST /portal/fleet/fuel-logs).';

COMMENT ON COLUMN public.registros_mantenimiento_vehiculo.id_usuario_registro IS
  'Usuario autenticado que registró la novedad (POST /portal/fleet/maintenance-logs).';
