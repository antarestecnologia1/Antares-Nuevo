-- Prima de servicios (semestral) y soporte liquidación contractual (terminación)
-- KEYS.payrollRuns: payrollKind, payPrimaServicios, primaServiciosCop/primaServiciosDays, settlementDetail

ALTER TABLE liquidaciones_nomina ADD COLUMN IF NOT EXISTS tipo_registro VARCHAR(24) NOT NULL DEFAULT 'mensual';
ALTER TABLE liquidaciones_nomina ADD COLUMN IF NOT EXISTS incluye_prima_servicios BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE liquidaciones_nomina ADD COLUMN IF NOT EXISTS prima_servicios_cop NUMERIC(18,2) NOT NULL DEFAULT 0;
ALTER TABLE liquidaciones_nomina ADD COLUMN IF NOT EXISTS prima_dias_semestre INTEGER;
ALTER TABLE liquidaciones_nomina ADD COLUMN IF NOT EXISTS liquidacion_terminacion_json JSONB;

COMMENT ON COLUMN liquidaciones_nomina.tipo_registro IS 'mensual | terminacion → app payrollKind';
COMMENT ON COLUMN liquidaciones_nomina.incluye_prima_servicios IS 'junio/diciembre: si se incluye prima en la liquidación';
COMMENT ON COLUMN liquidaciones_nomina.prima_servicios_cop IS 'Monto prima de servicios del semestre (editable en UI)';
COMMENT ON COLUMN liquidaciones_nomina.prima_dias_semestre IS 'Días laborados en el semestre para cálculo orientativo (/360)';
COMMENT ON COLUMN liquidaciones_nomina.liquidacion_terminacion_json IS 'Detalle liquidación contractual: cesantías, vacaciones, etc.';
