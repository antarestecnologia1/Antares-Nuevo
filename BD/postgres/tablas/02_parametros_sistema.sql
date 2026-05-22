-- Tabla: parametros_sistema
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE parametros_sistema (
  clave             VARCHAR(64) PRIMARY KEY,
  valor_numerico    NUMERIC(18,4),
  valor_texto       TEXT,
  vigente_desde     DATE NOT NULL DEFAULT CURRENT_DATE,
  vigente_hasta     DATE,
  descripcion       TEXT
);

COMMENT ON TABLE parametros_sistema IS 'SMMLV, auxilio transporte, UVT, topes; por vigencia.';
