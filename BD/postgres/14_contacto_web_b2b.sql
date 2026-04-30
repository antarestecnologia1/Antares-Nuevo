-- Módulo: Contacto web B2B (idempotente)
-- Objetivo: asegurar persistencia en PostgreSQL para leads del formulario público.

CREATE TABLE IF NOT EXISTS prospectos_contacto_b2b (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_contacto             VARCHAR(255) NOT NULL,
  nombre_empresa              VARCHAR(255) NOT NULL,
  nit                         VARCHAR(32) NOT NULL,
  cargo_contacto              VARCHAR(255) NOT NULL,
  telefono                    VARCHAR(32) NOT NULL,
  correo_electronico          VARCHAR(320) NOT NULL,
  tipo_servicio               VARCHAR(120) NOT NULL,
  tipo_operacion              VARCHAR(80) NOT NULL,
  frecuencia_operacion        VARCHAR(64) NOT NULL,
  ventana_inicio_servicio     VARCHAR(80) NOT NULL,
  volumen_mensual_aprox_kg    NUMERIC(14,2) NOT NULL CHECK (volumen_mensual_aprox_kg >= 0),
  mensaje                     TEXT NOT NULL,
  fecha_creacion              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE prospectos_contacto_b2b IS 'Leads del formulario web B2B (index.html). Fuente de verdad en PostgreSQL.';

-- Índices operativos para bandeja administrativa (reciente primero y búsqueda por correo)
CREATE INDEX IF NOT EXISTS idx_prospectos_contacto_b2b_fecha_creacion_desc
  ON prospectos_contacto_b2b (fecha_creacion DESC);

CREATE INDEX IF NOT EXISTS idx_prospectos_contacto_b2b_correo
  ON prospectos_contacto_b2b (correo_electronico);
