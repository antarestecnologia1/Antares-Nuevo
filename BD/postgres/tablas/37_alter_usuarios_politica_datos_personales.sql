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

-- Usuarios que ya aceptaron términos/Habeas en el registro web heredan la aceptación.
UPDATE public.usuarios
SET
  fecha_aceptacion_politica_datos = fecha_aceptacion_terminos,
  version_politica_datos = COALESCE(version_politica_datos, '2025-v1')
WHERE fecha_aceptacion_politica_datos IS NULL
  AND fecha_aceptacion_terminos IS NOT NULL
  AND COALESCE((checklist_registro_json->>'habeasDataAcknowledged')::boolean, false) = true;
