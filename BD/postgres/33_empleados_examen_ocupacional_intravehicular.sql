-- Examen ocupacional + examen instruvial (conductores alineados con RRHH).
-- Reemplaza columnas psicosensométricas; las fechas de vencimiento se calculan +1 año desde cada examen en aplicación.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'empleados_nomina'
      AND column_name = 'fecha_examen_psicosensometrico'
  ) THEN
    ALTER TABLE public.empleados_nomina
      RENAME COLUMN fecha_examen_psicosensometrico TO fecha_examen_ocupacional;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'empleados_nomina'
      AND column_name = 'fecha_vencimiento_psicosensometrico'
  ) THEN
    ALTER TABLE public.empleados_nomina
      RENAME COLUMN fecha_vencimiento_psicosensometrico TO fecha_vencimiento_examen_ocupacional;
  END IF;
END $$;

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS fecha_examen_instruvial DATE;

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS fecha_vencimiento_examen_instruvial DATE;

COMMENT ON COLUMN public.empleados_nomina.fecha_examen_ocupacional IS 'Fecha del examen ocupacional; vigencia habitual +1 año.';
COMMENT ON COLUMN public.empleados_nomina.fecha_vencimiento_examen_ocupacional IS 'Vencimiento examen ocupacional (calculado +1 año desde fecha de examen).';
COMMENT ON COLUMN public.empleados_nomina.fecha_examen_instruvial IS 'Fecha del examen instruvial; vigencia habitual +1 año.';
COMMENT ON COLUMN public.empleados_nomina.fecha_vencimiento_examen_instruvial IS 'Vencimiento examen instruvial (+1 año desde fecha de examen).';

-- Conductores (transporte): mismos nombres de columna.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conductores'
      AND column_name = 'fecha_examen_psicosensometrico'
  ) THEN
    ALTER TABLE public.conductores
      RENAME COLUMN fecha_examen_psicosensometrico TO fecha_examen_ocupacional;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conductores'
      AND column_name = 'fecha_vencimiento_psicosensometrico'
  ) THEN
    ALTER TABLE public.conductores
      RENAME COLUMN fecha_vencimiento_psicosensometrico TO fecha_vencimiento_examen_ocupacional;
  END IF;
END $$;

ALTER TABLE public.conductores
  ADD COLUMN IF NOT EXISTS fecha_examen_instruvial DATE;

ALTER TABLE public.conductores
  ADD COLUMN IF NOT EXISTS fecha_vencimiento_examen_instruvial DATE;

COMMENT ON COLUMN public.conductores.fecha_examen_ocupacional IS 'Fecha examen ocupacional; vencimiento +1 año.';
COMMENT ON COLUMN public.conductores.fecha_vencimiento_examen_ocupacional IS 'Vencimiento examen ocupacional (+1 año).';
COMMENT ON COLUMN public.conductores.fecha_examen_instruvial IS 'Fecha examen instruvial; vencimiento +1 año.';
COMMENT ON COLUMN public.conductores.fecha_vencimiento_examen_instruvial IS 'Vencimiento examen instruvial (+1 año).';
