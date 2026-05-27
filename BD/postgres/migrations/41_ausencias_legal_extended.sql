-- Subtipos legales ampliados: maternidad, paternidad y topes por subtipo.

UPDATE public.ausencias_laborales
SET subtipo_ausencia = 'ordinaria'
WHERE tipo_ausencia = 'licencia_maternidad'
  AND (subtipo_ausencia IS NULL OR btrim(subtipo_ausencia) = '');

UPDATE public.ausencias_laborales
SET subtipo_ausencia = 'continua'
WHERE tipo_ausencia = 'licencia_paternidad'
  AND (subtipo_ausencia IS NULL OR btrim(subtipo_ausencia) = '');

UPDATE public.ausencias_laborales
SET dias_reconocidos = LEAST(GREATEST(COALESCE(dias_reconocidos, dias_calendario)::numeric, 1.00), 182.00),
    unidad_dias_reconocidos = 'calendario'
WHERE tipo_ausencia = 'licencia_maternidad';

UPDATE public.ausencias_laborales
SET dias_reconocidos = CASE
  WHEN subtipo_ausencia = 'parental_compartida' THEN LEAST(GREATEST(COALESCE(dias_reconocidos, dias_calendario)::numeric, 1.00), 7.00)
  ELSE LEAST(GREATEST(COALESCE(dias_reconocidos, dias_calendario)::numeric, 1.00), 14.00)
END,
    unidad_dias_reconocidos = 'calendario'
WHERE tipo_ausencia = 'licencia_paternidad';

ALTER TABLE public.ausencias_laborales
  DROP CONSTRAINT IF EXISTS chk_ausencias_maternidad_subtipo;

ALTER TABLE public.ausencias_laborales
  ADD CONSTRAINT chk_ausencias_maternidad_subtipo
  CHECK (
    tipo_ausencia <> 'licencia_maternidad'
    OR subtipo_ausencia IN ('ordinaria', 'parto_multiple', 'parto_prematuro', 'adopcion', 'extension_medica')
  );

ALTER TABLE public.ausencias_laborales
  DROP CONSTRAINT IF EXISTS chk_ausencias_paternidad_subtipo;

ALTER TABLE public.ausencias_laborales
  ADD CONSTRAINT chk_ausencias_paternidad_subtipo
  CHECK (
    tipo_ausencia <> 'licencia_paternidad'
    OR subtipo_ausencia IN ('continua', 'flexible', 'parental_compartida')
  );

ALTER TABLE public.ausencias_laborales
  DROP CONSTRAINT IF EXISTS chk_ausencias_maternidad_max_182;

ALTER TABLE public.ausencias_laborales
  ADD CONSTRAINT chk_ausencias_maternidad_max_182
  CHECK (
    tipo_ausencia <> 'licencia_maternidad'
    OR (unidad_dias_reconocidos = 'calendario' AND dias_reconocidos <= 182.00)
  );

ALTER TABLE public.ausencias_laborales
  DROP CONSTRAINT IF EXISTS chk_ausencias_paternidad_max_14;

ALTER TABLE public.ausencias_laborales
  ADD CONSTRAINT chk_ausencias_paternidad_max_14
  CHECK (
    tipo_ausencia <> 'licencia_paternidad'
    OR (
      unidad_dias_reconocidos = 'calendario'
      AND dias_reconocidos <= 14.00
      AND (
        subtipo_ausencia IS DISTINCT FROM 'parental_compartida'
        OR dias_reconocidos <= 7.00
      )
    )
  );

COMMENT ON COLUMN public.ausencias_laborales.subtipo_ausencia IS
  'Desagregación del tipo: sufragio (jurado|votante), maternidad (ordinaria|parto_multiple|parto_prematuro|adopcion|extension_medica), paternidad (continua|flexible|parental_compartida).';
