-- Tabla: solicitudes_transporte
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE solicitudes_transporte (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_solicitud                VARCHAR(32) NOT NULL,
  id_usuario_solicitante          UUID NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
  id_empresa_cliente              UUID REFERENCES empresas (id) ON DELETE SET NULL,
  nombre_cliente                  VARCHAR(255),
  nombre_quien_solicita           VARCHAR(255),
  departamento_origen             VARCHAR(120),
  ciudad_origen                   VARCHAR(120) NOT NULL,
  direccion_origen                TEXT NOT NULL,
  departamento_destino            VARCHAR(120),
  ciudad_destino                  VARCHAR(120) NOT NULL,
  direccion_destino               TEXT NOT NULL,
  fecha_hora_recogida             TIMESTAMPTZ NOT NULL,
  fecha_hora_entrega_estimada     TIMESTAMPTZ NOT NULL,
  tipo_vehiculo_solicitado        VARCHAR(64) NOT NULL,
  descripcion_carga               TEXT NOT NULL,
  tipo_servicio                   VARCHAR(80) NOT NULL,
  refrigeracion_termoking         BOOLEAN NOT NULL DEFAULT false,
  numero_cajas                    INTEGER NOT NULL CHECK (numero_cajas >= 0),
  peso_kg                         NUMERIC(14,2) NOT NULL CHECK (peso_kg >= 0),
  numero_fuelles                  INTEGER CHECK (numero_fuelles IS NULL OR numero_fuelles >= 0),
  nombre_contacto_en_sitio        VARCHAR(255) NOT NULL,
  telefono_contacto_en_sitio      VARCHAR(32) NOT NULL,
  observaciones                   TEXT,
  estado                          estado_solicitud_transporte NOT NULL DEFAULT 'Pendiente',
  valor_tarifa_viaje             NUMERIC(18,2) NOT NULL DEFAULT 0,
  valor_asegurado                 NUMERIC(18,2),
  total_cargos_standby            NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (total_cargos_standby >= 0),
  eventos_standby_json            JSONB NOT NULL DEFAULT '[]',
  motivo_rechazo                  TEXT,
  fecha_aprobacion                TIMESTAMPTZ,
  aprobado_por                    VARCHAR(255),
  aprobacion_automatica           BOOLEAN NOT NULL DEFAULT false,
  fecha_entrega_efectiva          TIMESTAMPTZ,
  fecha_cierre                    TIMESTAMPTZ,
  distancia_km                    NUMERIC(14,2),
  fecha_creacion                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_solicitudes_transporte_numero UNIQUE (numero_solicitud),
  CONSTRAINT chk_solicitudes_entrega_después_recogida CHECK (fecha_hora_entrega_estimada > fecha_hora_recogida)
);

COMMENT ON TABLE solicitudes_transporte IS 'KEYS.requests; viaje asignado en tabla viajes_transporte.';

COMMENT ON COLUMN solicitudes_transporte.tipo_servicio IS 'Modo: Transporte nacional | Transporte entre sedes del cliente.';

COMMENT ON COLUMN solicitudes_transporte.refrigeracion_termoking IS 'Requiere Termoking; ver portal refrigeracionTermoking.';

COMMENT ON COLUMN solicitudes_transporte.tipo_vehiculo_solicitado IS 'Tipo de camión requerido por el cliente (Turbo, Camión, Tractomula) u operativo (Por definir).';

COMMENT ON COLUMN solicitudes_transporte.numero_fuelles IS 'Cantidad de fuelles (Turbo/Camión); NULL si no aplica o Tractomula.';

COMMENT ON COLUMN solicitudes_transporte.valor_tarifa_viaje IS 'Tarifa operativa; no la fija el cliente en el prototipo.';

COMMENT ON COLUMN solicitudes_transporte.eventos_standby_json IS 'Historial standby (horas, tarifa, actor).';

-- Índices

CREATE INDEX idx_solicitudes_id_empresa_cliente ON solicitudes_transporte (id_empresa_cliente);

CREATE INDEX idx_solicitudes_id_usuario ON solicitudes_transporte (id_usuario_solicitante);

CREATE INDEX idx_solicitudes_estado ON solicitudes_transporte (estado);

CREATE INDEX idx_solicitudes_fecha_creacion ON solicitudes_transporte (fecha_creacion DESC);

CREATE INDEX idx_solicitudes_transporte_cobertura_publica
  ON solicitudes_transporte (fecha_creacion DESC)
  WHERE estado NOT IN ('Rechazada'::estado_solicitud_transporte, 'Cancelada'::estado_solicitud_transporte);

