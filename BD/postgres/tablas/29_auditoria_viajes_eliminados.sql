-- Tabla: auditoria_viajes_eliminados
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

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

CREATE INDEX idx_aud_viajes_elim_en ON auditoria_viajes_eliminados (eliminado_en DESC);

