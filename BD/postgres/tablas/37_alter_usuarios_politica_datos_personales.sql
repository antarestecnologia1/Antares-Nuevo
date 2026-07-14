-- Aceptación explícita de la Política de Tratamiento de Datos Personales.
-- Ejecutar en bases existentes después de 06_usuarios.sql

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS fecha_aceptacion_politica_datos TIMESTAMPTZ;

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS version_politica_datos VARCHAR(64);

COMMENT ON COLUMN public.usuarios.fecha_aceptacion_politica_datos IS
  'Momento en que el titular aceptó la Política de Tratamiento de Datos Personales vigente.';

COMMENT ON COLUMN public.usuarios.version_politica_datos IS
  'Identificador de versión del documento de política aceptado (ej. 2025-v1).';

-- La aceptación explícita se registra solo con POST /portal/accept-data-policy (modal de ingreso).
-- No copiar fecha_aceptacion_terminos: son campos distintos en la tabla usuarios.
