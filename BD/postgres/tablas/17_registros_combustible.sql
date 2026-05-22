-- Tabla: registros_combustible
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE registros_combustible (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha                 DATE NOT NULL,
  id_vehiculo           UUID NOT NULL REFERENCES vehiculos (id) ON DELETE CASCADE,
  placa_vehiculo        VARCHAR(8) NOT NULL,
  id_conductor          UUID NOT NULL REFERENCES conductores (id) ON DELETE CASCADE,
  nombre_conductor      VARCHAR(255) NOT NULL,
  numero_viaje          VARCHAR(32),
  litros                NUMERIC(14,3) NOT NULL CHECK (litros > 0),
  costo_total           NUMERIC(18,2) NOT NULL CHECK (costo_total >= 0),
  costo_por_litro       NUMERIC(18,4),
  kilometraje_odometro  NUMERIC(14,2),
  estacion              VARCHAR(255),
  pagado_por            VARCHAR(32) NOT NULL DEFAULT 'empresa',
  id_usuario_registro   UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  fecha_registro        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_registros_combustible_pagado_por
    CHECK (pagado_por IN ('empresa', 'conductor'))
);

COMMENT ON TABLE registros_combustible IS 'KEYS.fuelLogs; alta POST /api/portal/fleet/fuel-logs.';

COMMENT ON COLUMN registros_combustible.pagado_por IS 'Portal paidBy: empresa | conductor (reembolso nómina).';

COMMENT ON COLUMN registros_combustible.id_usuario_registro IS
  'Usuario autenticado que registró la carga (POST /portal/fleet/fuel-logs).';
COMMENT ON CONSTRAINT chk_registros_combustible_pagado_por ON registros_combustible IS
  'Portal: paidBy empresa | conductor (reembolso nómina).';

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

-- Índices

CREATE INDEX idx_combustible_conductor_fecha ON registros_combustible (id_conductor, fecha);

CREATE INDEX idx_combustible_vehiculo_fecha ON registros_combustible (id_vehiculo, fecha);

CREATE INDEX idx_combustible_usuario_registro ON registros_combustible (id_usuario_registro);

