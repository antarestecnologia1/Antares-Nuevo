-- Tablas SARLAFT / PTE
-- Ejecutar después de 01_empresas.sql y 06_usuarios.sql.
-- KEYS.sarlaftThirdParties / sarlaftRiskProfiles / sarlaftAlerts / sarlaftReviews.

CREATE TABLE IF NOT EXISTS perfiles_riesgo_sarlaft (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo                     VARCHAR(32) NOT NULL,
  nombre                     VARCHAR(120) NOT NULL,
  programa                   VARCHAR(32) NOT NULL DEFAULT 'ambos',
  nivel                      VARCHAR(32) NOT NULL DEFAULT 'medio',
  nivel_debida_diligencia    VARCHAR(32) NOT NULL DEFAULT 'normal',
  dias_revision              INTEGER NOT NULL DEFAULT 180,
  criterios                  TEXT,
  color                      VARCHAR(16),
  activo                     BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  creado_por                 VARCHAR(255) NOT NULL DEFAULT 'Sistema',
  fecha_actualizacion        TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_por            VARCHAR(255)
);

COMMENT ON TABLE perfiles_riesgo_sarlaft IS 'KEYS.sarlaftRiskProfiles; matrices y perfiles de riesgo SARLAFT/PTE.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_perfiles_riesgo_sarlaft_codigo ON perfiles_riesgo_sarlaft (codigo);
CREATE INDEX IF NOT EXISTS idx_perfiles_riesgo_sarlaft_nivel ON perfiles_riesgo_sarlaft (nivel);

CREATE TABLE IF NOT EXISTS terceros_sarlaft (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo                     VARCHAR(32),
  tipo_persona               VARCHAR(32) NOT NULL DEFAULT 'persona_natural',
  tipo_vinculo               VARCHAR(32) NOT NULL DEFAULT 'proveedor',
  nombre                     VARCHAR(255) NOT NULL,
  nombre_comercial           VARCHAR(255),
  tipo_documento             VARCHAR(32) NOT NULL DEFAULT 'CC',
  numero_documento           VARCHAR(64),
  nit                        VARCHAR(32),
  correo                     VARCHAR(255),
  telefono                   VARCHAR(64),
  ciudad                     VARCHAR(120),
  departamento               VARCHAR(120),
  pais                       VARCHAR(80) DEFAULT 'Colombia',
  direccion                  TEXT,
  actividad_economica        VARCHAR(255),
  programa                   VARCHAR(32) NOT NULL DEFAULT 'ambos',
  id_perfil_riesgo           UUID REFERENCES perfiles_riesgo_sarlaft (id) ON DELETE SET NULL,
  nivel_riesgo               VARCHAR(32) NOT NULL DEFAULT 'medio',
  estado_kyc                 VARCHAR(32) NOT NULL DEFAULT 'pendiente',
  nivel_debida_diligencia    VARCHAR(32) NOT NULL DEFAULT 'normal',
  es_pep                     BOOLEAN NOT NULL DEFAULT false,
  detalle_pep                TEXT,
  fecha_proxima_revision     DATE,
  fecha_ultima_revision      DATE,
  id_responsable             UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  nombre_responsable         VARCHAR(255),
  observaciones              TEXT,
  ids_documentos             TEXT,
  cumplimiento_json          TEXT,
  fecha_creacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  creado_por                 VARCHAR(255) NOT NULL DEFAULT 'Sistema',
  fecha_actualizacion        TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_por            VARCHAR(255)
);

COMMENT ON TABLE terceros_sarlaft IS 'KEYS.sarlaftThirdParties; terceros sujetos a conocimiento y verificación SARLAFT/PTE.';

CREATE INDEX IF NOT EXISTS idx_terceros_sarlaft_documento ON terceros_sarlaft (numero_documento);
CREATE INDEX IF NOT EXISTS idx_terceros_sarlaft_estado ON terceros_sarlaft (estado_kyc);
CREATE INDEX IF NOT EXISTS idx_terceros_sarlaft_riesgo ON terceros_sarlaft (nivel_riesgo);
CREATE INDEX IF NOT EXISTS idx_terceros_sarlaft_revision ON terceros_sarlaft (fecha_proxima_revision);

CREATE TABLE IF NOT EXISTS alertas_sarlaft (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tercero                 UUID REFERENCES terceros_sarlaft (id) ON DELETE SET NULL,
  nombre_tercero             VARCHAR(255),
  tipo                       VARCHAR(32) NOT NULL DEFAULT 'alerta',
  programa                   VARCHAR(32) NOT NULL DEFAULT 'ambos',
  severidad                  VARCHAR(32) NOT NULL DEFAULT 'media',
  titulo                     VARCHAR(255) NOT NULL,
  descripcion                TEXT,
  estado                     VARCHAR(32) NOT NULL DEFAULT 'abierta',
  id_responsable             UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  nombre_responsable         VARCHAR(255),
  fecha_limite               DATE,
  origen                     VARCHAR(120),
  fecha_creacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  creado_por                 VARCHAR(255) NOT NULL DEFAULT 'Sistema',
  fecha_actualizacion        TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_por            VARCHAR(255),
  fecha_cierre               TIMESTAMPTZ,
  cerrado_por                VARCHAR(255)
);

COMMENT ON TABLE alertas_sarlaft IS 'KEYS.sarlaftAlerts; alertas, novedades, hallazgos y situaciones SARLAFT/PTE.';

CREATE INDEX IF NOT EXISTS idx_alertas_sarlaft_tercero ON alertas_sarlaft (id_tercero);
CREATE INDEX IF NOT EXISTS idx_alertas_sarlaft_estado ON alertas_sarlaft (estado);
CREATE INDEX IF NOT EXISTS idx_alertas_sarlaft_severidad ON alertas_sarlaft (severidad);

CREATE TABLE IF NOT EXISTS revisiones_sarlaft (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tercero                 UUID REFERENCES terceros_sarlaft (id) ON DELETE SET NULL,
  nombre_tercero             VARCHAR(255),
  id_alerta                  UUID REFERENCES alertas_sarlaft (id) ON DELETE SET NULL,
  tipo                       VARCHAR(32) NOT NULL DEFAULT 'revision',
  estado                     VARCHAR(32) NOT NULL DEFAULT 'pendiente',
  observaciones              TEXT,
  id_responsable             UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  nombre_responsable         VARCHAR(255),
  fecha_revision             DATE,
  fecha_creacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  creado_por                 VARCHAR(255) NOT NULL DEFAULT 'Sistema',
  fecha_actualizacion        TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_por            VARCHAR(255)
);

COMMENT ON TABLE revisiones_sarlaft IS 'KEYS.sarlaftReviews; revisiones, observaciones y seguimiento SARLAFT/PTE.';

CREATE INDEX IF NOT EXISTS idx_revisiones_sarlaft_tercero ON revisiones_sarlaft (id_tercero);
CREATE INDEX IF NOT EXISTS idx_revisiones_sarlaft_estado ON revisiones_sarlaft (estado);
