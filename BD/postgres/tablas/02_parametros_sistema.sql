-- Tabla: parametros_sistema
-- Parámetros legales por vigencia (varias filas por clave, una por año).
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt
-- Para bases antiguas con PK en clave, ejecutar también 35_alter_parametros_sistema_vigencia.sql

CREATE TABLE parametros_sistema (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave             VARCHAR(64) NOT NULL,
  valor_numerico    NUMERIC(18,4),
  valor_texto       TEXT,
  vigente_desde     DATE NOT NULL DEFAULT CURRENT_DATE,
  vigente_hasta     DATE,
  descripcion       TEXT,
  CONSTRAINT chk_parametros_sistema_vigencia
    CHECK (vigente_hasta IS NULL OR vigente_hasta >= vigente_desde)
);

CREATE UNIQUE INDEX uq_parametros_sistema_clave_vigencia
  ON parametros_sistema ((lower(trim(clave))), vigente_desde);

CREATE INDEX idx_parametros_sistema_lookup_vigencia
  ON parametros_sistema ((lower(trim(clave))), vigente_desde DESC, vigente_hasta DESC NULLS LAST);

COMMENT ON TABLE parametros_sistema IS 'SMMLV, auxilio transporte, UVT, aportes y horas legales por vigencia anual.';
