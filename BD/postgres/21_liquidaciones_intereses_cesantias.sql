-- Intereses sobre cesantías (Ley 52/1975): el UI contempla inclusión típica en planilla mes 01 u 02 (enero/febrero).

ALTER TABLE liquidaciones_nomina ADD COLUMN IF NOT EXISTS incluye_intereses_cesantias BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE liquidaciones_nomina ADD COLUMN IF NOT EXISTS intereses_cesantias_cop NUMERIC(18,2) NOT NULL DEFAULT 0;
ALTER TABLE liquidaciones_nomina ADD COLUMN IF NOT EXISTS base_cesantias_interes_cop NUMERIC(18,2);
ALTER TABLE liquidaciones_nomina ADD COLUMN IF NOT EXISTS dias_interes_cesantias INTEGER;

COMMENT ON COLUMN liquidaciones_nomina.incluye_intereses_cesantias IS 'enero/febrero (+): inclusión ítem intereses cesantías en liquidación ordinaria';
COMMENT ON COLUMN liquidaciones_nomina.intereses_cesantias_cop IS 'Monto intereses cesantías (12% referencia anual o proporcional días)';
COMMENT ON COLUMN liquidaciones_nomina.base_cesantias_interes_cop IS 'Base cesantías / saldo usado para cálculo orientativo';
COMMENT ON COLUMN liquidaciones_nomina.dias_interes_cesantias IS 'Días sobre 360 para interés proporcional (360 = año corrido nominales)';
