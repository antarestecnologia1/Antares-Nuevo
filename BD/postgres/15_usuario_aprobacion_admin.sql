-- Auditoría cuando un administrador aprueba un registro pendiente y asigna empresa.

ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS fecha_aprobacion_cuenta TIMESTAMPTZ;

ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cuenta_aprobada_por UUID REFERENCES public.usuarios (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.usuarios.fecha_aprobacion_cuenta IS 'Momento en que un administrador aprobó la cuenta (pendiente → aprobado).';
COMMENT ON COLUMN public.usuarios.cuenta_aprobada_por IS 'Usuario administrador que ejecutó la aprobación.';
