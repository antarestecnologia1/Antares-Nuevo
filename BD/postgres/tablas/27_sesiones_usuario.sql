-- Tabla: sesiones_usuario
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE sesiones_usuario (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario          UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  hash_token          TEXT NOT NULL,
  fecha_expiracion    TIMESTAMPTZ NOT NULL,
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_sesiones_hash_token UNIQUE (hash_token)
);

COMMENT ON TABLE sesiones_usuario IS 'Opcional: reemplazar KEYS.session en API.';
