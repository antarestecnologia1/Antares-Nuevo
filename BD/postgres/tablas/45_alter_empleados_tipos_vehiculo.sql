-- Categoría operativa de vehículo que maneja el colaborador (Gestión humana).
-- Ejecutar después de 13_empleados_nomina.sql y 08_conductores.sql. Idempotente.

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS tipos_vehiculo VARCHAR(160);

COMMENT ON COLUMN empleados_nomina.tipos_vehiculo IS
  'Tipos de vehículo que el colaborador (conductor) está habilitado a manejar, separados por comas (Camion,Turbo,Tractomula). Alineado con conductores.tipos_vehiculo.';

-- Traspaso desde flota cuando la ficha de nómina aún no tiene categoría.
UPDATE public.empleados_nomina e
SET tipos_vehiculo = c.tipos_vehiculo
FROM public.conductores c
WHERE regexp_replace(trim(coalesce(e.numero_documento, '')), '[^0-9A-Za-z]', '', 'g')
    = regexp_replace(trim(coalesce(c.numero_documento, '')), '[^0-9A-Za-z]', '', 'g')
  AND length(regexp_replace(trim(coalesce(e.numero_documento, '')), '[^0-9A-Za-z]', '', 'g')) > 0
  AND (e.tipos_vehiculo IS NULL OR length(btrim(e.tipos_vehiculo)) = 0)
  AND c.tipos_vehiculo IS NOT NULL
  AND length(btrim(c.tipos_vehiculo)) > 0;
