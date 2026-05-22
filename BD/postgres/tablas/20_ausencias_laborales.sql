-- Tabla: ausencias_laborales
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE ausencias_laborales (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empleado             UUID NOT NULL REFERENCES empleados_nomina (id) ON DELETE CASCADE,
  nombre_empleado         VARCHAR(255) NOT NULL,
  tipo_ausencia           VARCHAR(64) NOT NULL,
  fecha_inicio            DATE NOT NULL,
  fecha_fin               DATE NOT NULL,
  dias_calendario         INTEGER NOT NULL CHECK (dias_calendario >= 1),
  numero_soporte        VARCHAR(64),
  entidad_eps             VARCHAR(120),
  observaciones           TEXT,
  aprobado_por            VARCHAR(255),
  fecha_aprobacion        TIMESTAMPTZ,
  fecha_registro          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_ausencias_fechas CHECK (fecha_fin >= fecha_inicio)
);

COMMENT ON TABLE ausencias_laborales IS 'KEYS.hrAbsences.';

-- Índices

CREATE INDEX idx_ausencias_empleado ON ausencias_laborales (id_empleado);

