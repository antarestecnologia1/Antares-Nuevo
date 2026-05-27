CREATE TABLE IF NOT EXISTS public.parametros_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave VARCHAR(64) NOT NULL,
  valor_numerico NUMERIC(18,4),
  valor_texto TEXT,
  vigente_desde DATE NOT NULL DEFAULT CURRENT_DATE,
  vigente_hasta DATE,
  descripcion TEXT
);

ALTER TABLE public.parametros_sistema ADD COLUMN IF NOT EXISTS id UUID;
UPDATE public.parametros_sistema SET id = gen_random_uuid() WHERE id IS NULL;
ALTER TABLE public.parametros_sistema ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.parametros_sistema ALTER COLUMN id SET NOT NULL;

DO $$
DECLARE
  pk_name text;
  pk_cols text[];
BEGIN
  SELECT c.conname, array_agg(a.attname ORDER BY u.ord)
    INTO pk_name, pk_cols
  FROM pg_constraint c
  JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS u(attnum, ord) ON true
  JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = u.attnum
  WHERE c.conrelid = 'public.parametros_sistema'::regclass
    AND c.contype = 'p'
  GROUP BY c.conname;

  IF pk_name IS NOT NULL AND (array_length(pk_cols, 1) <> 1 OR pk_cols[1] <> 'id') THEN
    EXECUTE format('ALTER TABLE public.parametros_sistema DROP CONSTRAINT %I', pk_name);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.parametros_sistema'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.parametros_sistema ADD CONSTRAINT parametros_sistema_pkey PRIMARY KEY (id);
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_parametros_sistema_clave_vigencia
  ON public.parametros_sistema ((lower(trim(clave))), vigente_desde);

CREATE INDEX IF NOT EXISTS idx_parametros_sistema_lookup_vigencia
  ON public.parametros_sistema ((lower(trim(clave))), vigente_desde DESC, vigente_hasta DESC NULLS LAST);

ALTER TABLE public.parametros_sistema
  DROP CONSTRAINT IF EXISTS chk_parametros_sistema_vigencia;

ALTER TABLE public.parametros_sistema
  ADD CONSTRAINT chk_parametros_sistema_vigencia
  CHECK (vigente_hasta IS NULL OR vigente_hasta >= vigente_desde);
