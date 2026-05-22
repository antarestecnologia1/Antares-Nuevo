-- Tabla: viajes_transporte
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE viajes_transporte (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_solicitud                    UUID NOT NULL UNIQUE REFERENCES solicitudes_transporte (id) ON DELETE CASCADE,
  numero_viaje                    VARCHAR(32) NOT NULL,
  id_vehiculo                     UUID NOT NULL REFERENCES vehiculos (id) ON DELETE RESTRICT,
  id_conductor                    UUID NOT NULL REFERENCES conductores (id) ON DELETE RESTRICT,
  placa_vehiculo                  VARCHAR(8) NOT NULL,
  tipo_vehiculo_asignado          VARCHAR(40),
  nombre_conductor                VARCHAR(255) NOT NULL,
  telefono_conductor              VARCHAR(32),
  descripcion_ruta                TEXT,
  fecha_hora_recogida_programada TIMESTAMPTZ NOT NULL,
  fecha_hora_entrega_programada  TIMESTAMPTZ NOT NULL,
  asignado_por                    VARCHAR(255),
  fecha_hora_asignacion           TIMESTAMPTZ,
  estado_operativo_en_vivo        VARCHAR(64),
  datos_factura_json              JSONB,
  fecha_creacion                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_viajes_transporte_numero UNIQUE (numero_viaje)
);

COMMENT ON TABLE viajes_transporte IS 'Un viaje por solicitud cuando hay camión y conductor asignados.';

-- Índices

CREATE INDEX idx_viajes_id_vehiculo ON viajes_transporte (id_vehiculo);

CREATE INDEX idx_viajes_id_conductor ON viajes_transporte (id_conductor);

CREATE INDEX idx_viajes_transporte_recogida_programada ON viajes_transporte (fecha_hora_recogida_programada);

CREATE INDEX idx_viajes_transporte_entrega_programada ON viajes_transporte (fecha_hora_entrega_programada)
  WHERE fecha_hora_entrega_programada IS NOT NULL;

