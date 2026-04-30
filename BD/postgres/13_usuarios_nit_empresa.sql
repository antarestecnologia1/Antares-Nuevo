-- NIT de empresa en registro (varios usuarios pueden compartirlo); documento personal sigue en numero_identificacion.
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS nit_empresa_registro VARCHAR(32);

COMMENT ON COLUMN public.usuarios.nit_empresa_registro IS 'NIT empresa cuando el registro es jurídico; puede repetirse entre usuarios.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_documento_personal
  ON public.usuarios (lower(trim(numero_identificacion)))
  WHERE numero_identificacion IS NOT NULL AND btrim(numero_identificacion) <> '';
