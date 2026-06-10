-- Tabla: notificaciones
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE notificaciones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario          UUID REFERENCES usuarios (id) ON DELETE CASCADE,
  titulo              VARCHAR(255) NOT NULL,
  cuerpo              TEXT NOT NULL,
  audiencia           VARCHAR(32),
  fecha_lectura       TIMESTAMPTZ,
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notificaciones IS 'KEYS.notifications. In-app.';
COMMENT ON COLUMN notificaciones.audiencia IS
  'NULL = personal (id_usuario). admins | hr = bandeja compartida para ese rol.';

-- Índices

CREATE INDEX idx_notificaciones_usuario_no_leida ON notificaciones (id_usuario, fecha_lectura) WHERE fecha_lectura IS NULL;

-- Lectura ordenada por fecha (bootstrap admin global y endpoint liviano por usuario).
CREATE INDEX idx_notificaciones_usuario_fecha ON notificaciones (id_usuario, fecha_creacion DESC);

CREATE INDEX idx_notificaciones_fecha ON notificaciones (fecha_creacion DESC);

CREATE INDEX idx_notificaciones_audiencia_fecha
  ON notificaciones (audiencia, fecha_creacion DESC)
  WHERE audiencia IS NOT NULL;

