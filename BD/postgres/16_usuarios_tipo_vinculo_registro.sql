-- Registro público: vínculo declarado (cliente externo vs empleado interno).
DO $$
BEGIN
  CREATE TYPE public.tipo_vinculo_registro AS ENUM ('cliente', 'empleado_interno');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS tipo_vinculo_registro public.tipo_vinculo_registro NOT NULL DEFAULT 'cliente';

COMMENT ON COLUMN public.usuarios.tipo_vinculo_registro IS 'Registro web: cliente externo o empleado interno (declaración del solicitante).';
