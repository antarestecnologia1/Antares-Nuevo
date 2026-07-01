-- Tabla: conductores
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE conductores (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresa                UUID REFERENCES empresas (id) ON DELETE SET NULL,
  nombre_completo           VARCHAR(255) NOT NULL,
  tipo_documento            VARCHAR(8),
  numero_documento          VARCHAR(32) NOT NULL,
  telefono                  VARCHAR(32) NOT NULL,
  departamento              VARCHAR(120),
  ciudad                    VARCHAR(120),
  direccion                 TEXT,
  numero_licencia           VARCHAR(64),
  categoria_licencia        VARCHAR(8),
  fecha_vencimiento_licencia DATE,
  fecha_examen_ocupacional DATE,
  fecha_vencimiento_examen_ocupacional DATE,
  fecha_examen_instruvial DATE,
  fecha_vencimiento_examen_instruvial DATE,
  url_foto                      TEXT,
  curso_conduccion_defensiva VARCHAR(32),
  fecha_vencimiento_curso_defensivo DATE,
  tipo_sangre                 VARCHAR(8),
  eps                         VARCHAR(120),
  arl                         VARCHAR(120),
  comparendos_pendientes      INTEGER NOT NULL DEFAULT 0 CHECK (comparendos_pendientes >= 0 AND comparendos_pendientes <= 9999),
  anos_experiencia_conduccion  SMALLINT NOT NULL DEFAULT 0 CHECK (anos_experiencia_conduccion >= 0 AND anos_experiencia_conduccion <= 80),
  contacto_emergencia       VARCHAR(255),
  telefono_emergencia       VARCHAR(32),
  tipo_contrato             VARCHAR(80),
  salario_base              NUMERIC(14,2),
  fecha_inicio              DATE,
  disponible                BOOLEAN NOT NULL DEFAULT true,
  ocupado_por_sistema       BOOLEAN NOT NULL DEFAULT false,
  fecha_contratacion        TIMESTAMPTZ,
  tipos_vehiculo            VARCHAR(160),
  fecha_creacion            TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_conductores_documento UNIQUE (numero_documento)
);

COMMENT ON TABLE conductores IS 'KEYS.drivers; sincronizado con empleados conductor en RRHH.';

COMMENT ON COLUMN conductores.url_foto IS 'Foto perfil conductor (HTTPS); KEYS.drivers[].photoUrl.';

COMMENT ON COLUMN conductores.tipos_vehiculo IS
  'Tipos de vehículo de la flota (vehiculos.tipo_vehiculo) que el conductor está habilitado a conducir, separados por comas (ej.: Camion,Tractomula). KEYS.drivers[].vehicleTypes.';
