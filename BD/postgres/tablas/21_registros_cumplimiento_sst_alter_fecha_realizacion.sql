-- Columna opcional: fecha en que se realizó / renovó el control SST.
-- Ejecutar en bases existentes después de 21_registros_cumplimiento_sst.sql

ALTER TABLE public.registros_cumplimiento_sst
  ADD COLUMN IF NOT EXISTS fecha_realizacion DATE;

COMMENT ON COLUMN public.registros_cumplimiento_sst.fecha_realizacion IS
  'Fecha en que se realizó el examen, afiliación o capacitación (renovación).';
