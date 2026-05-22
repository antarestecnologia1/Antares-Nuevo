-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Condición médica del colaborador (gestion humana)
-- Se utiliza al crear/editar un empleado para registrar si declara
-- alguna enfermedad o condición que el área de SST/RH deba conocer.

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS tiene_condicion_medica BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS descripcion_condicion_medica TEXT;

COMMENT ON COLUMN public.empleados_nomina.tiene_condicion_medica IS
  'true si el colaborador declaró sufrir alguna enfermedad o condición médica al momento de la contratación.';
COMMENT ON COLUMN public.empleados_nomina.descripcion_condicion_medica IS
  'Descripción libre escrita por el colaborador / RH cuando tiene_condicion_medica = true (alergias, condiciones crónicas, medicación regular, etc.). Tratar como dato sensible.';

-- Refuerzo de coherencia: la descripción solo debe existir cuando se declara condición.
ALTER TABLE public.empleados_nomina
  DROP CONSTRAINT IF EXISTS chk_empleados_condicion_medica;

ALTER TABLE public.empleados_nomina
  ADD CONSTRAINT chk_empleados_condicion_medica CHECK (
    tiene_condicion_medica = true
    OR descripcion_condicion_medica IS NULL
    OR length(btrim(descripcion_condicion_medica)) = 0
  );
