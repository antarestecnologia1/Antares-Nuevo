-- Tabla: documentos_empresa (gestor documental corporativo — DMS general)
-- Ejecutar después de 01_empresas.sql (referencia opcional a empresas).
-- KEYS.companyDocuments / KEYS.companyDocumentFolders. Archivos binarios en R2.

CREATE TABLE IF NOT EXISTS documentos_empresa (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresa              UUID REFERENCES empresas (id) ON DELETE CASCADE,
  nombre_archivo          VARCHAR(512) NOT NULL,
  tipo                    VARCHAR(32) NOT NULL DEFAULT 'ARCHIVO',
  carpeta                 VARCHAR(200) NOT NULL DEFAULT 'General',
  mime_type               VARCHAR(128) NOT NULL DEFAULT 'application/octet-stream',
  tamano_bytes            BIGINT NOT NULL DEFAULT 0,
  storage_key             VARCHAR(1024) NOT NULL,
  descripcion             TEXT,
  etiquetas               TEXT,
  subido_por              VARCHAR(255) NOT NULL DEFAULT 'Sistema',
  fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE documentos_empresa IS 'KEYS.companyDocuments; gestor documental corporativo (archivos en R2).';

CREATE INDEX IF NOT EXISTS idx_documentos_empresa_empresa ON documentos_empresa (id_empresa);
CREATE INDEX IF NOT EXISTS idx_documentos_empresa_carpeta ON documentos_empresa (carpeta);
CREATE INDEX IF NOT EXISTS idx_documentos_empresa_fecha ON documentos_empresa (fecha_actualizacion DESC);

CREATE TABLE IF NOT EXISTS carpetas_documento_empresa (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresa          UUID REFERENCES empresas (id) ON DELETE CASCADE,
  nombre_carpeta      VARCHAR(200) NOT NULL,
  descripcion         TEXT,
  creado_por          VARCHAR(255) NOT NULL DEFAULT 'Sistema',
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Permisos por carpeta: listas de slugs de rol separadas por comas. Vacío/NULL = sin restricción.
  roles_ver           TEXT,
  roles_subir         TEXT,
  roles_eliminar      TEXT
);

COMMENT ON TABLE carpetas_documento_empresa IS 'KEYS.companyDocumentFolders; carpetas del gestor documental corporativo (rutas con " / "). roles_* restringen ver/subir/eliminar por rol.';

CREATE INDEX IF NOT EXISTS idx_carpetas_documento_empresa_empresa ON carpetas_documento_empresa (id_empresa);
CREATE UNIQUE INDEX IF NOT EXISTS uq_carpeta_empresa_nombre
  ON carpetas_documento_empresa (COALESCE(id_empresa, '00000000-0000-0000-0000-000000000000'::uuid), nombre_carpeta);

-- Idempotente para instalaciones existentes.
ALTER TABLE carpetas_documento_empresa
  ADD COLUMN IF NOT EXISTS roles_ver TEXT,
  ADD COLUMN IF NOT EXISTS roles_subir TEXT,
  ADD COLUMN IF NOT EXISTS roles_eliminar TEXT;
