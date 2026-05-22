-- Tabla: notificaciones
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE notificaciones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario          UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  titulo              VARCHAR(255) NOT NULL,
  cuerpo              TEXT NOT NULL,
  fecha_lectura       TIMESTAMPTZ,
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notificaciones IS 'KEYS.notifications. In-app.';

-- Índices

CREATE INDEX idx_notificaciones_usuario_no_leida ON notificaciones (id_usuario, fecha_lectura) WHERE fecha_lectura IS NULL;

