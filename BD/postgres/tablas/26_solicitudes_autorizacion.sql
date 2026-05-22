-- Tabla: solicitudes_autorizacion
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE solicitudes_autorizacion (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_solicitud              VARCHAR(64) NOT NULL,
  titulo                      VARCHAR(500) NOT NULL,
  datos_json                  JSONB NOT NULL DEFAULT '{}',
  estado                      estado_aprobacion NOT NULL DEFAULT 'pendiente',
  id_usuario_solicitante      UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  nombre_solicitante          VARCHAR(255),
  fecha_solicitud             TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_revision              TIMESTAMPTZ,
  revisado_por                VARCHAR(255),
  motivo_rechazo              TEXT
);

COMMENT ON TABLE solicitudes_autorizacion IS 'KEYS.approvals (crear conductor, ausencia, pago nómina, etc.).';

-- Índices

CREATE INDEX idx_autorizaciones_estado_fecha ON solicitudes_autorizacion (estado, fecha_solicitud DESC);

