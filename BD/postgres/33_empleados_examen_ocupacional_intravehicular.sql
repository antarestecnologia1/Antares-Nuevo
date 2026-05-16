-- Examen ocupacional + examen instruvial (conductores alineados con RRHH).
-- Reemplaza columnas psicosensométricas; las fechas de vencimiento se calculan +1 año desde cada examen en aplicación.

DO $$
DECLARE
  has_psico_fecha boolean;
  has_ocup_fecha boolean;
  has_psico_venc boolean;
  has_ocup_venc boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'empleados_nomina'
      AND column_name = 'fecha_examen_psicosensometrico'
  ) INTO has_psico_fecha;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'empleados_nomina'
      AND column_name = 'fecha_examen_ocupacional'
  ) INTO has_ocup_fecha;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'empleados_nomina'
      AND column_name = 'fecha_vencimiento_psicosensometrico'
  ) INTO has_psico_venc;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'empleados_nomina'
      AND column_name = 'fecha_vencimiento_examen_ocupacional'
  ) INTO has_ocup_venc;

  IF has_psico_fecha AND NOT has_ocup_fecha THEN
    ALTER TABLE public.empleados_nomina
      RENAME COLUMN fecha_examen_psicosensometrico TO fecha_examen_ocupacional;
  ELSIF has_psico_fecha AND has_ocup_fecha THEN
    UPDATE public.empleados_nomina
    SET fecha_examen_ocupacional = COALESCE(fecha_examen_ocupacional, fecha_examen_psicosensometrico);
    ALTER TABLE public.empleados_nomina DROP COLUMN fecha_examen_psicosensometrico;
  END IF;

  IF has_psico_venc AND NOT has_ocup_venc THEN
    ALTER TABLE public.empleados_nomina
      RENAME COLUMN fecha_vencimiento_psicosensometrico TO fecha_vencimiento_examen_ocupacional;
  ELSIF has_psico_venc AND has_ocup_venc THEN
    UPDATE public.empleados_nomina
    SET fecha_vencimiento_examen_ocupacional =
      COALESCE(fecha_vencimiento_examen_ocupacional, fecha_vencimiento_psicosensometrico);
    ALTER TABLE public.empleados_nomina DROP COLUMN fecha_vencimiento_psicosensometrico;
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
DECLARE
  has_psico_fecha boolean;
  has_ocup_fecha boolean;
  has_psico_venc boolean;
  has_ocup_venc boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conductores'
      AND column_name = 'fecha_examen_psicosensometrico'
  ) INTO has_psico_fecha;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conductores'
      AND column_name = 'fecha_examen_ocupacional'
  ) INTO has_ocup_fecha;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conductores'
      AND column_name = 'fecha_vencimiento_psicosensometrico'
  ) INTO has_psico_venc;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conductores'
      AND column_name = 'fecha_vencimiento_examen_ocupacional'
  ) INTO has_ocup_venc;

  IF has_psico_fecha AND NOT has_ocup_fecha THEN
    ALTER TABLE public.conductores
      RENAME COLUMN fecha_examen_psicosensometrico TO fecha_examen_ocupacional;
  ELSIF has_psico_fecha AND has_ocup_fecha THEN
    UPDATE public.conductores
    SET fecha_examen_ocupacional = COALESCE(fecha_examen_ocupacional, fecha_examen_psicosensometrico);
    ALTER TABLE public.conductores DROP COLUMN fecha_examen_psicosensometrico;
  END IF;

  IF has_psico_venc AND NOT has_ocup_venc THEN
    ALTER TABLE public.conductores
      RENAME COLUMN fecha_vencimiento_psicosensometrico TO fecha_vencimiento_examen_ocupacional;
  ELSIF has_psico_venc AND has_ocup_venc THEN
    UPDATE public.conductores
    SET fecha_vencimiento_examen_ocupacional =
      COALESCE(fecha_vencimiento_examen_ocupacional, fecha_vencimiento_psicosensometrico);
    ALTER TABLE public.conductores DROP COLUMN fecha_vencimiento_psicosensometrico;
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
