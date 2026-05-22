-- Tabla: tarifas_trayecto
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE tarifas_trayecto (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departamento_origen        VARCHAR(120) NOT NULL,
  ciudad_origen              VARCHAR(120) NOT NULL,
  departamento_destino       VARCHAR(120) NOT NULL,
  ciudad_destino             VARCHAR(120) NOT NULL,
  valor_tarifa_cop           NUMERIC(18,2) NOT NULL CHECK (valor_tarifa_cop > 0),
  ids_empresas               UUID[],
  activo                     BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE tarifas_trayecto IS 'Tarifas base por trayecto para autocompletar valor de viaje (KEYS.tripRouteRates).';

COMMENT ON COLUMN tarifas_trayecto.valor_tarifa_cop IS 'Tarifa COP sugerida para asignación operativa.';

COMMENT ON COLUMN tarifas_trayecto.ids_empresas IS
  'Clientes a los que aplica la tarifa; NULL o {} = todos. Permite varias filas misma ruta con distintos clientes/precios.';

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

-- Índices

CREATE INDEX idx_tarifas_trayecto_origen_destino ON tarifas_trayecto (departamento_origen, ciudad_origen, departamento_destino, ciudad_destino) WHERE activo = true;

CREATE INDEX idx_tarifas_trayecto_ruta ON tarifas_trayecto (departamento_origen, ciudad_origen, departamento_destino, ciudad_destino);

