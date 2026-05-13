-- Auditoría: viajes quitados manualmente y solicitudes eliminadas (motivo + instantánea JSON).

CREATE TABLE IF NOT EXISTS auditoria_viajes_eliminados (
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

CREATE INDEX IF NOT EXISTS idx_aud_viajes_elim_en ON auditoria_viajes_eliminados (eliminado_en DESC);

COMMENT ON TABLE auditoria_viajes_eliminados IS 'Registro cuando operaciones elimina la asignación (fila viajes_transporte).';

CREATE TABLE IF NOT EXISTS auditoria_solicitudes_eliminadas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_solicitud      UUID NOT NULL,
  numero_solicitud  VARCHAR(32),
  motivo            TEXT NOT NULL,
  datos_json        JSONB NOT NULL DEFAULT '{}'::jsonb,
  eliminado_por     UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  eliminado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aud_sol_elim_en ON auditoria_solicitudes_eliminadas (eliminado_en DESC);

COMMENT ON TABLE auditoria_solicitudes_eliminadas IS 'Registro antes de borrar solicitudes_transporte (definitivo).';
