-- Tabla: candidatos
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE candidatos (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_vacante                UUID NOT NULL REFERENCES vacantes (id) ON DELETE CASCADE,
  nombre_completo           VARCHAR(255) NOT NULL,
  correo_electronico        VARCHAR(320) NOT NULL,
  telefono                  VARCHAR(32) NOT NULL,
  tipo_documento            VARCHAR(8) NOT NULL,
  numero_documento          VARCHAR(32) NOT NULL,
  fecha_nacimiento          DATE,
  nivel_educativo           VARCHAR(120),
  departamento              VARCHAR(120),
  ciudad                    VARCHAR(120) NOT NULL,
  direccion                 TEXT,
  anios_experiencia         NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (anios_experiencia >= 0),
  aspiracion_salarial       NUMERIC(14,2) NOT NULL CHECK (aspiracion_salarial >= 0),
  fecha_disponible_ingreso  DATE NOT NULL,
  titulo_vacante_denorm     VARCHAR(255),
  etapa_proceso             VARCHAR(64) NOT NULL DEFAULT 'Recibido',
  adjuntos_json             JSONB NOT NULL DEFAULT '[]',
  origen                    VARCHAR(64) DEFAULT 'Portal RRHH',
  fecha_contratacion        TIMESTAMPTZ,
  fecha_registro_contrato   TIMESTAMPTZ,
  fecha_creacion            TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_candidatos_etapa CHECK (etapa_proceso IN (
    'Recibido', 'Preseleccionado', 'Entrevistado', 'Oferta enviada', 'Contratado', 'Descartado'
  ))
);

COMMENT ON TABLE candidatos IS 'KEYS.candidates; etapa_proceso = pipeline.';

COMMENT ON COLUMN candidatos.fecha_registro_contrato IS 'hiredByContractAt en app.';

-- Índices

CREATE INDEX idx_candidatos_id_vacante ON candidatos (id_vacante);

CREATE INDEX idx_candidatos_etapa ON candidatos (etapa_proceso);

