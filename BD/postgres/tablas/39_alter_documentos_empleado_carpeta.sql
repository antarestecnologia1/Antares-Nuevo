-- Carpetas y campo carpeta en expediente documental (ejecutar después de 38_documentos_empleado.sql)

ALTER TABLE documentos_empleado
  ADD COLUMN IF NOT EXISTS carpeta VARCHAR(128) NOT NULL DEFAULT 'General';

CREATE INDEX IF NOT EXISTS idx_documentos_empleado_carpeta ON documentos_empleado (id_empleado, carpeta);

CREATE TABLE IF NOT EXISTS carpetas_documento_empleado (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empleado         UUID NOT NULL REFERENCES empleados_nomina (id) ON DELETE CASCADE,
  nombre_empleado     VARCHAR(255) NOT NULL,
  nombre_carpeta      VARCHAR(128) NOT NULL,
  creado_por          VARCHAR(255) NOT NULL DEFAULT 'Sistema',
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_carpeta_empleado_nombre UNIQUE (id_empleado, nombre_carpeta)
);

COMMENT ON TABLE carpetas_documento_empleado IS 'KEYS.employeeDocumentFolders; carpetas vacías o explícitas del expediente.';

CREATE INDEX IF NOT EXISTS idx_carpetas_documento_empleado ON carpetas_documento_empleado (id_empleado);
