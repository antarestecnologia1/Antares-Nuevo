-- Lectura y ocultamiento por usuario para avisos de audiencia (admins / hr).
-- Ejecutar después de 32_notificaciones_metadata.sql

CREATE TABLE IF NOT EXISTS notificaciones_estado_usuario (
  id_notificacion UUID NOT NULL REFERENCES notificaciones (id) ON DELETE CASCADE,
  id_usuario      UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  fecha_lectura   TIMESTAMPTZ,
  oculto          BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id_notificacion, id_usuario)
);

COMMENT ON TABLE notificaciones_estado_usuario IS
  'Estado por usuario de una notificación: lectura y ocultar. Las filas personales siguen usando notificaciones.fecha_lectura; las de audiencia no se marcan ni borran de forma global.';

CREATE INDEX IF NOT EXISTS idx_notificaciones_estado_usuario_usuario
  ON notificaciones_estado_usuario (id_usuario);
