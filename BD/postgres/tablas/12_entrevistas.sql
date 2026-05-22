-- Tabla: entrevistas
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE entrevistas (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_candidato              UUID NOT NULL REFERENCES candidatos (id) ON DELETE CASCADE,
  nombre_candidato_denorm   VARCHAR(255) NOT NULL,
  fecha_hora                TIMESTAMPTZ NOT NULL,
  entrevistador             VARCHAR(255) NOT NULL,
  modalidad                 VARCHAR(32),
  lugar_o_enlace            TEXT,
  notas                     TEXT,
  fecha_creacion            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE entrevistas IS 'KEYS.interviews; fecha_hora = campo when del formulario.';
