-- Tabla: documentos_empleado (expediente digital por colaborador)
-- Ejecutar después de 13_empleados_nomina.sql

CREATE TABLE IF NOT EXISTS documentos_empleado (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empleado             UUID NOT NULL REFERENCES empleados_nomina (id) ON DELETE CASCADE,
  nombre_empleado         VARCHAR(255) NOT NULL,
  tipo_documento          VARCHAR(64) NOT NULL,
  nombre_archivo          VARCHAR(512) NOT NULL,
  mime_type               VARCHAR(128) NOT NULL DEFAULT 'application/octet-stream',
  tamano_bytes            BIGINT NOT NULL DEFAULT 0,
  storage_key             VARCHAR(1024) NOT NULL,
  fecha_emision           DATE,
  fecha_vencimiento       DATE,
  estado                  VARCHAR(64) NOT NULL DEFAULT 'Vigente',
  codigo_documental       VARCHAR(64),
  observaciones           TEXT,
  subido_por              VARCHAR(255) NOT NULL DEFAULT 'Sistema',
  fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE documentos_empleado IS 'KEYS.employeeDocuments; expediente digital RRHH (archivos en R2).';

CREATE INDEX IF NOT EXISTS idx_documentos_empleado_empleado ON documentos_empleado (id_empleado);
CREATE INDEX IF NOT EXISTS idx_documentos_empleado_vencimiento ON documentos_empleado (fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_documentos_empleado_tipo ON documentos_empleado (tipo_documento);
