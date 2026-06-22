-- Tabla: empleados_nomina
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE empleados_nomina (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresa                  UUID NOT NULL REFERENCES empresas (id) ON DELETE RESTRICT,
  id_cargo                    UUID REFERENCES cargos (id) ON DELETE SET NULL,
  nombre_completo             VARCHAR(255) NOT NULL,
  tipo_documento              VARCHAR(8) NOT NULL,
  numero_documento            VARCHAR(32) NOT NULL,
  fecha_nacimiento            DATE,
  genero                      VARCHAR(32),
  estado_civil                VARCHAR(64),
  tipo_sangre                 VARCHAR(8),
  nivel_educativo             VARCHAR(120),
  departamento                VARCHAR(120),
  ciudad                      VARCHAR(120) NOT NULL,
  direccion                   TEXT NOT NULL,
  telefono                    VARCHAR(32) NOT NULL,
  correo_personal             VARCHAR(320),
  contacto_emergencia         VARCHAR(255) NOT NULL,
  telefono_emergencia         VARCHAR(32) NOT NULL,
  parentesco_emergencia       VARCHAR(120),
  nombre_cargo_texto          VARCHAR(255) NOT NULL,
  tipo_contrato               VARCHAR(120) NOT NULL,
  duracion_contrato_texto     VARCHAR(120),
  fecha_ingreso               DATE NOT NULL,
  fecha_inicio_contrato_vigente DATE,
  fecha_renovacion            DATE,
  salario_base                NUMERIC(14,2) NOT NULL CHECK (salario_base >= 0),
  auxilio_transporte          NUMERIC(14,2),
  periodicidad_pago           VARCHAR(64),
  centro_costos               VARCHAR(64),
  tipo_cotizante              VARCHAR(64),
  nivel_riesgo_arl            VARCHAR(8),
  tipo_plantilla_contrato     VARCHAR(32),
  eps                         VARCHAR(120) NOT NULL,
  fondo_pension               VARCHAR(120) NOT NULL,
  arl                         VARCHAR(120) NOT NULL,
  fondo_cesantias             VARCHAR(120),
  caja_compensacion           VARCHAR(120),
  banco                       VARCHAR(120) NOT NULL,
  tipo_cuenta_bancaria        VARCHAR(32),
  numero_cuenta_bancaria      VARCHAR(64) NOT NULL,
  rol_trabajador              VARCHAR(32) NOT NULL DEFAULT 'empleado',
  numero_licencia             VARCHAR(64),
  categoria_licencia          VARCHAR(8),
  fecha_vencimiento_licencia  DATE,
  fecha_examen_ocupacional DATE,
  fecha_vencimiento_examen_ocupacional DATE,
  fecha_examen_instruvial DATE,
  fecha_vencimiento_examen_instruvial DATE,
  curso_conduccion_defensiva  VARCHAR(32),
  meses_prueba                SMALLINT,
  fecha_fin_contrato          DATE,
  jornada_laboral             VARCHAR(64),
  url_avatar                  TEXT,
  correo_corporativo          VARCHAR(320),
  tiene_condicion_medica      BOOLEAN NOT NULL DEFAULT false,
  descripcion_condicion_medica TEXT,
  fecha_creacion              TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_empleado_empresa_documento UNIQUE (id_empresa, numero_documento),
  CONSTRAINT chk_empleados_condicion_medica CHECK (
    tiene_condicion_medica = true
    OR descripcion_condicion_medica IS NULL
    OR length(btrim(descripcion_condicion_medica)) = 0
  )
);

COMMENT ON TABLE empleados_nomina IS 'KEYS.payrollEmployees.';

COMMENT ON COLUMN empleados_nomina.tiene_condicion_medica IS
  'true si el colaborador declaró enfermedad o condición médica al contratar.';
COMMENT ON COLUMN empleados_nomina.descripcion_condicion_medica IS
  'Descripción cuando tiene_condicion_medica = true. Dato sensible (SST/RH).';

COMMENT ON COLUMN empleados_nomina.fecha_inicio_contrato_vigente IS
  'Inicio del contrato fijo o renovación vigente; fecha fin = esta fecha + plazo. Antigüedad en fecha_ingreso.';
COMMENT ON COLUMN empleados_nomina.fecha_renovacion IS
  'Fecha en que RH formalizó la última renovación del contrato a término fijo (firma o acta). No modifica fecha_ingreso.';

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

-- Índices

CREATE INDEX idx_empleados_id_empresa ON empleados_nomina (id_empresa);

