-- Migración manual: elimina el curso de conducción defensiva (Res. 17220) de empleados y conductores.
-- Ejecutar en BD existente si no usa npm run db:init completo.
-- Idempotente: DROP COLUMN IF EXISTS.

ALTER TABLE public.empleados_nomina
  DROP COLUMN IF EXISTS curso_conduccion_defensiva;

ALTER TABLE public.conductores
  DROP COLUMN IF EXISTS curso_conduccion_defensiva;

ALTER TABLE public.conductores
  DROP COLUMN IF EXISTS fecha_vencimiento_curso_defensivo;
