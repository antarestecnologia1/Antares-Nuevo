-- Tabla: reglas_viatico_interdepartamental
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE reglas_viatico_interdepartamental (
  id                                  SMALLINT PRIMARY KEY DEFAULT 1,
  valor_viaje_interdepartamental_cop  NUMERIC(14,2) NOT NULL DEFAULT 85000 CHECK (valor_viaje_interdepartamental_cop >= 0),
  fecha_actualizacion                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT regla_viatico_una_fila CHECK (id = 1)
);

COMMENT ON TABLE reglas_viatico_interdepartamental IS 'Equivalente a KEYS.travelAllowanceRules (una fila).';

INSERT INTO reglas_viatico_interdepartamental (id, valor_viaje_interdepartamental_cop) VALUES (1, 85000);
