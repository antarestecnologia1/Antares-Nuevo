-- Tabla: auditoria_solicitudes_eliminadas
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE auditoria_solicitudes_eliminadas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_solicitud      UUID NOT NULL,
  numero_solicitud  VARCHAR(32),
  motivo            TEXT NOT NULL,
  datos_json        JSONB NOT NULL DEFAULT '{}'::jsonb,
  eliminado_por     UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  eliminado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE auditoria_solicitudes_eliminadas IS 'Registro antes de borrar solicitudes_transporte (definitivo).';

-- Índices

CREATE INDEX idx_aud_sol_elim_en ON auditoria_solicitudes_eliminadas (eliminado_en DESC);

