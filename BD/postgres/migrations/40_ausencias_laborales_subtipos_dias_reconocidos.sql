ALTER TABLE public.ausencias_laborales
  ADD COLUMN IF NOT EXISTS subtipo_ausencia VARCHAR(64);

ALTER TABLE public.ausencias_laborales
  ADD COLUMN IF NOT EXISTS dias_reconocidos NUMERIC(6,2);

ALTER TABLE public.ausencias_laborales
  ADD COLUMN IF NOT EXISTS unidad_dias_reconocidos VARCHAR(16);

UPDATE public.ausencias_laborales
SET subtipo_ausencia = 'votante'
WHERE tipo_ausencia = 'permiso_sufragio'
  AND (subtipo_ausencia IS NULL OR btrim(subtipo_ausencia) = '');

UPDATE public.ausencias_laborales
SET dias_reconocidos = CASE
  WHEN tipo_ausencia = 'permiso_sufragio' AND subtipo_ausencia = 'jurado' THEN 1.00
  WHEN tipo_ausencia = 'permiso_sufragio' THEN 0.50
  ELSE GREATEST(dias_calendario, 1)::numeric
END
WHERE dias_reconocidos IS NULL OR dias_reconocidos <= 0;

UPDATE public.ausencias_laborales
SET unidad_dias_reconocidos = CASE
  WHEN tipo_ausencia = 'permiso_sufragio' THEN 'jornada'
  WHEN tipo_ausencia IN ('vacaciones', 'licencia_luto', 'permiso_cita_medica', 'permiso_citacion_judicial') THEN 'habil'
  ELSE 'calendario'
END
WHERE unidad_dias_reconocidos IS NULL OR btrim(unidad_dias_reconocidos) = '';

ALTER TABLE public.ausencias_laborales
  ALTER COLUMN dias_reconocidos SET DEFAULT 1.00;

ALTER TABLE public.ausencias_laborales
  ALTER COLUMN unidad_dias_reconocidos SET DEFAULT 'calendario';

ALTER TABLE public.ausencias_laborales
  ALTER COLUMN dias_reconocidos SET NOT NULL;

ALTER TABLE public.ausencias_laborales
  ALTER COLUMN unidad_dias_reconocidos SET NOT NULL;

ALTER TABLE public.ausencias_laborales
  DROP CONSTRAINT IF EXISTS chk_ausencias_dias_reconocidos;

ALTER TABLE public.ausencias_laborales
  ADD CONSTRAINT chk_ausencias_dias_reconocidos
  CHECK (dias_reconocidos > 0);

ALTER TABLE public.ausencias_laborales
  DROP CONSTRAINT IF EXISTS chk_ausencias_unidad_dias_reconocidos;

ALTER TABLE public.ausencias_laborales
  ADD CONSTRAINT chk_ausencias_unidad_dias_reconocidos
  CHECK (unidad_dias_reconocidos IN ('calendario', 'habil', 'jornada'));

ALTER TABLE public.ausencias_laborales
  DROP CONSTRAINT IF EXISTS chk_ausencias_sufragio_subtipo;

ALTER TABLE public.ausencias_laborales
  ADD CONSTRAINT chk_ausencias_sufragio_subtipo
  CHECK (
    tipo_ausencia <> 'permiso_sufragio'
    OR subtipo_ausencia IN ('jurado', 'votante')
  );

CREATE INDEX IF NOT EXISTS idx_ausencias_tipo_periodo
  ON public.ausencias_laborales (tipo_ausencia, fecha_inicio, fecha_fin);

COMMENT ON COLUMN public.ausencias_laborales.subtipo_ausencia IS
  'Desagregación opcional del tipo de ausencia (ej. sufragio: jurado | votante).';

COMMENT ON COLUMN public.ausencias_laborales.dias_reconocidos IS
  'Días o fracción reconocida laboralmente para nómina/compensación; puede diferir de dias_calendario.';

COMMENT ON COLUMN public.ausencias_laborales.unidad_dias_reconocidos IS
  'calendario | habil | jornada según la naturaleza de la ausencia.';
