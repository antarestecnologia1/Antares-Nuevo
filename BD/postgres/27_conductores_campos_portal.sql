-- Campos adicionales del portal (modal conductor / KEYS.drivers) persistidos en conductores.

ALTER TABLE public.conductores
  ADD COLUMN IF NOT EXISTS fecha_vencimiento_curso_defensivo DATE,
  ADD COLUMN IF NOT EXISTS tipo_sangre VARCHAR(8),
  ADD COLUMN IF NOT EXISTS eps VARCHAR(120),
  ADD COLUMN IF NOT EXISTS arl VARCHAR(120),
  ADD COLUMN IF NOT EXISTS comparendos_pendientes INTEGER NOT NULL DEFAULT 0
    CHECK (comparendos_pendientes >= 0 AND comparendos_pendientes <= 9999),
  ADD COLUMN IF NOT EXISTS anos_experiencia_conduccion SMALLINT NOT NULL DEFAULT 0
    CHECK (anos_experiencia_conduccion >= 0 AND anos_experiencia_conduccion <= 80);

COMMENT ON COLUMN public.conductores.fecha_vencimiento_curso_defensivo IS 'Vence curso defensivo; KEYS.drivers[].defensiveCourseExpiry.';
COMMENT ON COLUMN public.conductores.tipo_sangre IS 'RH; KEYS.drivers[].bloodType.';
COMMENT ON COLUMN public.conductores.eps IS 'KEYS.drivers[].eps.';
COMMENT ON COLUMN public.conductores.arl IS 'KEYS.drivers[].arl.';
COMMENT ON COLUMN public.conductores.comparendos_pendientes IS 'SIMIT; KEYS.drivers[].comparendos.';
COMMENT ON COLUMN public.conductores.anos_experiencia_conduccion IS 'KEYS.drivers[].experienceYears.';
