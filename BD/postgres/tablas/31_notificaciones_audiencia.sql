-- Notificaciones compartidas por audiencia (una fila para todos los admins / RRHH).
-- Ejecutar después de 22_notificaciones.sql

ALTER TABLE notificaciones
  ADD COLUMN IF NOT EXISTS audiencia VARCHAR(32);

ALTER TABLE notificaciones
  ALTER COLUMN id_usuario DROP NOT NULL;

COMMENT ON COLUMN notificaciones.audiencia IS
  'NULL = personal (id_usuario). admins | hr = bandeja compartida para ese rol.';

CREATE INDEX IF NOT EXISTS idx_notificaciones_audiencia_fecha
  ON notificaciones (audiencia, fecha_creacion DESC)
  WHERE audiencia IS NOT NULL;
