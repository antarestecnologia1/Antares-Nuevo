-- Tabla: liquidaciones_nomina
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE liquidaciones_nomina (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empleado                     UUID NOT NULL REFERENCES empleados_nomina (id) ON DELETE CASCADE,
  nombre_empleado                 VARCHAR(255) NOT NULL,
  periodo_mes                     VARCHAR(32) NOT NULL,
  devengado_total                 NUMERIC(18,2) NOT NULL,
  base_cotizacion_ibc             NUMERIC(18,2) NOT NULL,
  viaticos_periodo              NUMERIC(18,2) NOT NULL DEFAULT 0,
  reembolso_combustible           NUMERIC(18,2) NOT NULL DEFAULT 0,
  viaticos_automaticos            NUMERIC(18,2) NOT NULL DEFAULT 0,
  reembolso_combustible_automatico NUMERIC(18,2) NOT NULL DEFAULT 0,
  viaticos_manuales               NUMERIC(18,2) NOT NULL DEFAULT 0,
  reembolso_combustible_manual    NUMERIC(18,2) NOT NULL DEFAULT 0,
  horas_extras_cop                NUMERIC(18,2) NOT NULL DEFAULT 0,
  auxilios_nomina_formulario      NUMERIC(18,2) NOT NULL DEFAULT 0,
  bonificaciones_cop              NUMERIC(18,2) NOT NULL DEFAULT 0,
  cantidad_viajes_conductor       INTEGER NOT NULL DEFAULT 0,
  viajes_interdepartamentales     INTEGER NOT NULL DEFAULT 0,
  deduccion_salud                 NUMERIC(18,2) NOT NULL DEFAULT 0,
  deduccion_pension               NUMERIC(18,2) NOT NULL DEFAULT 0,
  fondo_solidaridad_pensional     NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_deducciones               NUMERIC(18,2) NOT NULL DEFAULT 0,
  neto_a_pagar                    NUMERIC(18,2) NOT NULL,
  liquidacion_pagada              BOOLEAN NOT NULL DEFAULT false,
  fecha_pago                      TIMESTAMPTZ,
  pago_aprobado_por               VARCHAR(255),
  tipo_registro                   VARCHAR(24) NOT NULL DEFAULT 'mensual',
  incluye_prima_servicios         BOOLEAN NOT NULL DEFAULT false,
  prima_servicios_cop             NUMERIC(18,2) NOT NULL DEFAULT 0,
  prima_dias_semestre             INTEGER,
  liquidacion_terminacion_json    JSONB,
  incluye_intereses_cesantias     BOOLEAN NOT NULL DEFAULT false,
  intereses_cesantias_cop         NUMERIC(18,2) NOT NULL DEFAULT 0,
  base_cesantias_interes_cop      NUMERIC(18,2),
  dias_interes_cesantias          INTEGER,
  origen_liquidacion              VARCHAR(32) NOT NULL DEFAULT 'manual',
  novedades_liquidacion_json      JSONB,
  fecha_creacion                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE liquidaciones_nomina IS 'KEYS.payrollRuns; desglose extras/aux/bonus del formulario liquidación.';

COMMENT ON COLUMN liquidaciones_nomina.periodo_mes IS
  'YYYY-MM (mensual) o YYYY-MM-Q1|Q2 (quincenal), YYYY-MM-C1|C2 (catorcenal), YYYY-MM-Sn (semanal).';
COMMENT ON COLUMN liquidaciones_nomina.horas_extras_cop IS 'Campo extras del formulario nómina.';

COMMENT ON COLUMN liquidaciones_nomina.auxilios_nomina_formulario IS 'Campo aux del formulario (no confundir solo con viáticos de ruta).';

COMMENT ON COLUMN liquidaciones_nomina.tipo_registro IS 'mensual | terminacion → app payrollKind';

COMMENT ON COLUMN liquidaciones_nomina.incluye_prima_servicios IS 'junio/diciembre: si se incluye prima en la liquidación';

COMMENT ON COLUMN liquidaciones_nomina.prima_servicios_cop IS 'Monto prima de servicios del semestre (editable en UI)';

COMMENT ON COLUMN liquidaciones_nomina.prima_dias_semestre IS 'Días laborados en el semestre para cálculo orientativo (/360)';

COMMENT ON COLUMN liquidaciones_nomina.liquidacion_terminacion_json IS 'Detalle liquidación contractual: cesantías, vacaciones, etc.';

COMMENT ON COLUMN liquidaciones_nomina.incluye_intereses_cesantias IS 'enero/febrero (+): inclusión ítem intereses cesantías en liquidación ordinaria';

COMMENT ON COLUMN liquidaciones_nomina.intereses_cesantias_cop IS 'Monto intereses cesantías (12% referencia anual o proporcional días)';

COMMENT ON COLUMN liquidaciones_nomina.base_cesantias_interes_cop IS 'Base cesantías / saldo usado para cálculo orientativo';

COMMENT ON COLUMN liquidaciones_nomina.dias_interes_cesantias IS 'Días sobre 360 para interés proporcional';

COMMENT ON COLUMN liquidaciones_nomina.origen_liquidacion IS 'manual | automatica · liquida quien disparó la fila.';

COMMENT ON COLUMN liquidaciones_nomina.novedades_liquidacion_json IS 'Resumen novedades (incap./vacaciones, proporcionalización, fecha ingreso).';

-- Índices

CREATE INDEX idx_liquidaciones_periodo ON liquidaciones_nomina (periodo_mes);

CREATE INDEX idx_liquidaciones_pendiente_pago ON liquidaciones_nomina (liquidacion_pagada) WHERE liquidacion_pagada = false;

-- FK sin índice: acelera borrado en cascada y consultas por empleado.
CREATE INDEX idx_liquidaciones_empleado ON liquidaciones_nomina (id_empleado);

-- Bootstrap ordena por fecha_creacion DESC.
CREATE INDEX idx_liquidaciones_fecha ON liquidaciones_nomina (fecha_creacion DESC);

