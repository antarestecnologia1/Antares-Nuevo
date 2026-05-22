-- Tabla: prospectos_contacto_b2b
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE prospectos_contacto_b2b (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_contacto             VARCHAR(255) NOT NULL,
  nombre_empresa              VARCHAR(255) NOT NULL,
  nit                         VARCHAR(32) NOT NULL,
  cargo_contacto            VARCHAR(255) NOT NULL,
  telefono                    VARCHAR(32) NOT NULL,
  correo_electronico          VARCHAR(320) NOT NULL,
  tipo_servicio               VARCHAR(120) NOT NULL,
  tipo_operacion              VARCHAR(80) NOT NULL,
  frecuencia_operacion        VARCHAR(64) NOT NULL,
  ventana_inicio_servicio     VARCHAR(80) NOT NULL,
  mensaje                     TEXT NOT NULL,
  fecha_creacion              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE prospectos_contacto_b2b IS 'Formulario B2B index.html; KEYS.contacts.';

-- Índices

CREATE INDEX idx_prospectos_contacto_b2b_fecha_creacion_desc
  ON prospectos_contacto_b2b (fecha_creacion DESC);

CREATE INDEX idx_prospectos_contacto_b2b_correo
  ON prospectos_contacto_b2b (correo_electronico);

