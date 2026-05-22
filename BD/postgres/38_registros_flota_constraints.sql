-- Combustible y taller: restricciones alineadas con el portal (sync-key fuelLogs / vehicleTechnicalLogs).
-- Ejecutar después de 04_transporte.sql y 09_rls_tablas.sql.

ALTER TABLE public.registros_combustible
  DROP CONSTRAINT IF EXISTS chk_registros_combustible_pagado_por;

ALTER TABLE public.registros_combustible
  ADD CONSTRAINT chk_registros_combustible_pagado_por
  CHECK (pagado_por IN ('empresa', 'conductor'));

ALTER TABLE public.registros_mantenimiento_vehiculo
  DROP CONSTRAINT IF EXISTS chk_registros_mantenimiento_tipo;

ALTER TABLE public.registros_mantenimiento_vehiculo
  ADD CONSTRAINT chk_registros_mantenimiento_tipo
  CHECK (tipo_intervencion IN ('preventivo', 'correctivo', 'falla'));

COMMENT ON CONSTRAINT chk_registros_combustible_pagado_por ON public.registros_combustible IS
  'Portal: paidBy empresa | conductor (reembolso nómina).';

COMMENT ON CONSTRAINT chk_registros_mantenimiento_tipo ON public.registros_mantenimiento_vehiculo IS
  'Portal: interventionType / type preventivo | correctivo | falla.';
