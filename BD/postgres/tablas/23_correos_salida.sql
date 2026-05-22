-- Tabla: correos_salida
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE correos_salida (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direccion_destino       VARCHAR(320) NOT NULL,
  asunto                  VARCHAR(500) NOT NULL,
  cuerpo                  TEXT NOT NULL,
  fecha_envio_real        TIMESTAMPTZ,
  error_envio             TEXT,
  fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE correos_salida IS 'KEYS.emails; cola simulada en prototipo.';
