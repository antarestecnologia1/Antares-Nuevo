-- Tabla: contadores_secuencia
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE contadores_secuencia (
  prefijo       VARCHAR(32) PRIMARY KEY,
  ultimo_valor  BIGINT NOT NULL DEFAULT 0 CHECK (ultimo_valor >= 0)
);

COMMENT ON TABLE contadores_secuencia IS 'KEYS.counters; SOL-######, VJE-######, etc.';
