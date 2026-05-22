-- Tabla: registros_mantenimiento_vehiculo
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE registros_mantenimiento_vehiculo (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha                 DATE NOT NULL,
  id_vehiculo           UUID NOT NULL REFERENCES vehiculos (id) ON DELETE CASCADE,
  placa_vehiculo        VARCHAR(8) NOT NULL,
  tipo_intervencion     VARCHAR(64) NOT NULL DEFAULT 'preventivo',
  descripcion           TEXT NOT NULL,
  costo                 NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (costo >= 0),
  horas_inactividad     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (horas_inactividad >= 0),
  estado_seguimiento    VARCHAR(64) NOT NULL DEFAULT 'Pendiente',
  id_usuario_registro   UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  fecha_registro        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_registros_mantenimiento_tipo
    CHECK (tipo_intervencion IN ('preventivo', 'correctivo', 'falla'))
);

COMMENT ON TABLE registros_mantenimiento_vehiculo IS 'KEYS.vehicleTechnicalLogs; alta POST /api/portal/fleet/maintenance-logs.';

COMMENT ON COLUMN registros_mantenimiento_vehiculo.tipo_intervencion IS
  'Portal interventionType: preventivo | correctivo | falla.';
COMMENT ON COLUMN registros_mantenimiento_vehiculo.id_usuario_registro IS
  'Usuario autenticado que registró la novedad (POST /portal/fleet/maintenance-logs).';
COMMENT ON CONSTRAINT chk_registros_mantenimiento_tipo ON registros_mantenimiento_vehiculo IS
  'Portal: interventionType / type preventivo | correctivo | falla.';

-- Auditoría de eliminaciones (antes en 25_transporte_auditoria_eliminados.sql)
CREATE TABLE auditoria_viajes_eliminados (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_solicitud      UUID NOT NULL,
  id_viaje          UUID,
  numero_solicitud  VARCHAR(32),
  numero_viaje      VARCHAR(32),
  motivo            TEXT NOT NULL,
  datos_json        JSONB NOT NULL DEFAULT '{}'::jsonb,
  eliminado_por     UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  eliminado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE auditoria_viajes_eliminados IS 'Registro cuando operaciones elimina la asignación (fila viajes_transporte).';

-- Índices

CREATE INDEX idx_mantenimiento_vehiculo_fecha ON registros_mantenimiento_vehiculo (id_vehiculo, fecha);

CREATE INDEX idx_mantenimiento_usuario_registro ON registros_mantenimiento_vehiculo (id_usuario_registro);

