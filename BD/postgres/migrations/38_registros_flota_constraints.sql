-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Historial flota (combustible / taller): migración idempotente para bases creadas antes de 04_transporte unificado.
-- Instalaciones nuevas: no ejecutar (CHECK, id_usuario_registro e índices ya en 04_transporte.sql y 07_indices.sql).
-- Sustituye el antiguo 39_registros_flota_usuario_registro.sql (contenido absorbido aquí y en 04/07).

ALTER TABLE public.registros_combustible
  ADD COLUMN IF NOT EXISTS id_usuario_registro UUID REFERENCES usuarios (id) ON DELETE SET NULL;

ALTER TABLE public.registros_mantenimiento_vehiculo
  ADD COLUMN IF NOT EXISTS id_usuario_registro UUID REFERENCES usuarios (id) ON DELETE SET NULL;

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

CREATE INDEX IF NOT EXISTS idx_combustible_usuario_registro
  ON public.registros_combustible (id_usuario_registro);

CREATE INDEX IF NOT EXISTS idx_mantenimiento_usuario_registro
  ON public.registros_mantenimiento_vehiculo (id_usuario_registro);

COMMENT ON COLUMN public.registros_combustible.id_usuario_registro IS
  'Usuario autenticado que registró la carga (POST /portal/fleet/fuel-logs).';

COMMENT ON COLUMN public.registros_mantenimiento_vehiculo.id_usuario_registro IS
  'Usuario autenticado que registró la novedad (POST /portal/fleet/maintenance-logs).';

COMMENT ON CONSTRAINT chk_registros_combustible_pagado_por ON public.registros_combustible IS
  'Portal: paidBy empresa | conductor (reembolso nómina).';

COMMENT ON CONSTRAINT chk_registros_mantenimiento_tipo ON public.registros_mantenimiento_vehiculo IS
  'Portal: interventionType / type preventivo | correctivo | falla.';
