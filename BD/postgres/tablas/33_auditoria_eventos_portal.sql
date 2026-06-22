-- Tabla: auditoria_eventos_portal
-- Bitácora append-only del portal (crear / editar / eliminar por módulo).
-- Retención: sin poda automática — respaldar PostgreSQL para auditorías a largo plazo (5+ años).
-- Ejecutar después de 06_usuarios.sql

CREATE TABLE auditoria_eventos_portal (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_evento_cliente   UUID,
  accion              VARCHAR(32) NOT NULL,
  modulo_id           VARCHAR(64) NOT NULL,
  modulo_etiqueta     VARCHAR(120) NOT NULL,
  entidad_id          VARCHAR(64),
  entidad_etiqueta    TEXT,
  resumen             TEXT,
  id_usuario          UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  usuario_email       VARCHAR(255),
  usuario_etiqueta    TEXT,
  detalle_accion      VARCHAR(64),
  detalle_id          VARCHAR(64),
  metadata_json       JSONB NOT NULL DEFAULT '{}'::jsonb,
  registrado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_auditoria_evento_cliente UNIQUE (id_evento_cliente),
  CONSTRAINT chk_auditoria_eventos_accion CHECK (
    lower(trim(accion)) IN ('create', 'update', 'delete')
  )
);

COMMENT ON TABLE auditoria_eventos_portal IS
  'Trazabilidad centralizada del portal. Solo INSERT desde la API; no actualizar ni borrar filas salvo política DBA.';

COMMENT ON COLUMN auditoria_eventos_portal.id_evento_cliente IS
  'UUID generado en el cliente para deduplicar reintentos de red.';

CREATE INDEX idx_aud_portal_registrado_en ON auditoria_eventos_portal (registrado_en DESC);
CREATE INDEX idx_aud_portal_modulo_en ON auditoria_eventos_portal (modulo_id, registrado_en DESC);
CREATE INDEX idx_aud_portal_usuario_en ON auditoria_eventos_portal (id_usuario, registrado_en DESC);
CREATE INDEX idx_aud_portal_entidad ON auditoria_eventos_portal (entidad_id) WHERE entidad_id IS NOT NULL;
