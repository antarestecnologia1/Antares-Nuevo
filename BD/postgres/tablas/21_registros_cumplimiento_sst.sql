-- Tabla: registros_cumplimiento_sst
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE registros_cumplimiento_sst (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empleado             UUID NOT NULL REFERENCES empleados_nomina (id) ON DELETE CASCADE,
  nombre_empleado         VARCHAR(255) NOT NULL,
  tipo_registro           VARCHAR(120) NOT NULL,
  proveedor_entidad       VARCHAR(255) NOT NULL,
  fecha_vencimiento_control DATE NOT NULL,
  fecha_realizacion       DATE,
  estado                  VARCHAR(64) NOT NULL DEFAULT 'Pendiente',
  codigo_documento        VARCHAR(64),
  observaciones           TEXT,
  fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT now(),
  creado_por              VARCHAR(255) NOT NULL DEFAULT 'Sistema'
);

COMMENT ON TABLE registros_cumplimiento_sst IS 'KEYS.sstCompliance.';

-- Índices

CREATE INDEX idx_sst_empleado ON registros_cumplimiento_sst (id_empleado);

CREATE INDEX idx_sst_vencimiento ON registros_cumplimiento_sst (fecha_vencimiento_control);

