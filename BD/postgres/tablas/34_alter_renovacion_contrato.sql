-- Migración manual: renovación y aviso de no renovación (contratos a término fijo)
-- Ejecutar en BD existente si no usa npm run db:init completo.
-- Idempotente: ADD COLUMN IF NOT EXISTS.

-- empleados_nomina: inicio del período vigente (renovación), fecha de renovación y aviso CST art. 47
ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS fecha_inicio_contrato_vigente DATE;

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS fecha_renovacion DATE;

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS fecha_aviso_no_renovacion DATE;

COMMENT ON COLUMN public.empleados_nomina.fecha_inicio_contrato_vigente IS
  'Inicio del contrato fijo o renovación vigente; fecha fin = esta fecha + plazo. Antigüedad en fecha_ingreso.';

COMMENT ON COLUMN public.empleados_nomina.fecha_renovacion IS
  'Fecha en que RH formalizó la última renovación del contrato a término fijo (firma o acta). No modifica fecha_ingreso.';

COMMENT ON COLUMN public.empleados_nomina.fecha_aviso_no_renovacion IS
  'Fecha del aviso escrito de no renovación al trabajador (CST art. 47; mínimo 30 días antes del vencimiento).';

-- contratos: fechas del documento (incluye avisos y renovaciones)
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS fecha_fin DATE;

ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS fecha_renovacion DATE;

COMMENT ON COLUMN public.contratos.fecha_renovacion IS
  'Fecha de firma o formalización cuando el registro corresponde a renovación o aviso de no renovación.';
