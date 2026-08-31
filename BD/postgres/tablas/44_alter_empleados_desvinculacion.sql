-- Desvinculación de colaboradores: baja lógica (no borra ficha ni expediente).
-- Ejecutar después de 13_empleados_nomina.sql. Idempotente.

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS fecha_desvinculacion DATE;

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS categoria_desvinculacion VARCHAR(64);

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS motivo_desvinculacion TEXT;

ALTER TABLE public.empleados_nomina
  ADD COLUMN IF NOT EXISTS desvinculado_por VARCHAR(255);

COMMENT ON COLUMN empleados_nomina.activo IS
  'false = colaborador desvinculado. Conserva ficha, liquidaciones, ausencias y documentos.';
COMMENT ON COLUMN empleados_nomina.fecha_desvinculacion IS
  'Fecha de retiro / desvinculación (nómina y certificado laboral).';
COMMENT ON COLUMN empleados_nomina.categoria_desvinculacion IS
  'Causal de desvinculación (renuncia, despido, mutuo acuerdo, vencimiento, otro).';
COMMENT ON COLUMN empleados_nomina.motivo_desvinculacion IS
  'Nota libre de la desvinculación (opcional).';
COMMENT ON COLUMN empleados_nomina.desvinculado_por IS
  'Usuario que registró la desvinculación.';

-- Permite recontratar el mismo documento mientras el registro previo está desvinculado.
ALTER TABLE public.empleados_nomina
  DROP CONSTRAINT IF EXISTS uq_empleado_empresa_documento;

DROP INDEX IF EXISTS uq_empleado_empresa_documento;

CREATE UNIQUE INDEX IF NOT EXISTS uq_empleado_empresa_documento_activo
  ON public.empleados_nomina (id_empresa, numero_documento)
  WHERE activo = true;

-- Historial: la acción "unlink" (desvinculación) además de create/update/delete.
ALTER TABLE public.auditoria_eventos_portal
  DROP CONSTRAINT IF EXISTS chk_auditoria_eventos_accion;

ALTER TABLE public.auditoria_eventos_portal
  ADD CONSTRAINT chk_auditoria_eventos_accion CHECK (
    lower(trim(accion)) IN ('create', 'update', 'delete', 'unlink')
  );
