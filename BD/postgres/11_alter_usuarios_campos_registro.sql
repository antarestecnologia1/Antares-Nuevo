-- Migración incremental: campos del formulario de registro (#form-register en app.js).
-- Ejecutar solo si la base ya existía sin las columnas nuevas de `03_nucleo_empresa_usuarios.sql`.

ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(120);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(120);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(120);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(120);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS genero VARCHAR(40);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cargo_registro VARCHAR(255);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS area_trabajo VARCHAR(120);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS fecha_aceptacion_terminos TIMESTAMPTZ;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS checklist_registro_json JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.usuarios.primer_nombre IS 'Formulario registro: firstName.';
COMMENT ON COLUMN public.usuarios.segundo_nombre IS 'Formulario registro: middleName.';
COMMENT ON COLUMN public.usuarios.primer_apellido IS 'Formulario registro: lastName.';
COMMENT ON COLUMN public.usuarios.segundo_apellido IS 'Formulario registro: secondLastName.';
COMMENT ON COLUMN public.usuarios.genero IS 'Formulario registro: gender.';
COMMENT ON COLUMN public.usuarios.cargo_registro IS 'Formulario registro: position (cargo).';
COMMENT ON COLUMN public.usuarios.area_trabajo IS 'Formulario registro: workArea.';
COMMENT ON COLUMN public.usuarios.fecha_aceptacion_terminos IS 'Momento de aceptación Habeas Data / términos.';
COMMENT ON COLUMN public.usuarios.checklist_registro_json IS 'Equivalente a profileQualityChecklist en app.';
