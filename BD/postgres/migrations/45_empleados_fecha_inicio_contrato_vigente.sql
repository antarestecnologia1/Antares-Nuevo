-- Inicio del contrato fijo o renovación vigente (distinto de fecha_ingreso / antigüedad).
-- Instalación nueva: ../tablas/13_empleados_nomina.sql ya incluye la columna.

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS fecha_inicio_contrato_vigente DATE;

COMMENT ON COLUMN public.empleados_nomina.fecha_inicio_contrato_vigente IS
  'Inicio del contrato a término fijo o renovación vigente. La fecha fin se calcula desde aquí + duracion_contrato_texto. La antigüedad laboral sigue en fecha_ingreso.';

-- Histórico: alinear inicio de contrato con ingreso cuando no había columna (mejor que NULL).
UPDATE public.empleados_nomina
SET fecha_inicio_contrato_vigente = fecha_ingreso
WHERE fecha_inicio_contrato_vigente IS NULL
  AND lower(trim(coalesce(tipo_contrato, ''))) LIKE '%termino fijo%';
