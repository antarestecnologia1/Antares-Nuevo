-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Si se ejecutó una versión anterior de la migr. 33 con sufijo *_intravehicular_*,
-- renombrar columnas a *_instruvial_* (sin duplicar si ya existen instruvial).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'empleados_nomina'
      AND column_name = 'fecha_examen_intravehicular'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'empleados_nomina'
      AND column_name = 'fecha_examen_instruvial'
  ) THEN
    ALTER TABLE public.empleados_nomina
      RENAME COLUMN fecha_examen_intravehicular TO fecha_examen_instruvial;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'empleados_nomina'
      AND column_name = 'fecha_vencimiento_examen_intravehicular'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'empleados_nomina'
      AND column_name = 'fecha_vencimiento_examen_instruvial'
  ) THEN
    ALTER TABLE public.empleados_nomina
      RENAME COLUMN fecha_vencimiento_examen_intravehicular TO fecha_vencimiento_examen_instruvial;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conductores'
      AND column_name = 'fecha_examen_intravehicular'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conductores'
      AND column_name = 'fecha_examen_instruvial'
  ) THEN
    ALTER TABLE public.conductores
      RENAME COLUMN fecha_examen_intravehicular TO fecha_examen_instruvial;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conductores'
      AND column_name = 'fecha_vencimiento_examen_intravehicular'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conductores'
      AND column_name = 'fecha_vencimiento_examen_instruvial'
  ) THEN
    ALTER TABLE public.conductores
      RENAME COLUMN fecha_vencimiento_examen_intravehicular TO fecha_vencimiento_examen_instruvial;
  END IF;
END $$;
