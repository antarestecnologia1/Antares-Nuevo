-- Módulo: RRHH — Cargos, vacantes, candidatos, entrevistas, contratos, nómina, ausencias, SST

CREATE TABLE cargos (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre                    VARCHAR(255) NOT NULL,
  rol_trabajador            VARCHAR(32) NOT NULL DEFAULT 'empleado',
  salario_base_mensual      NUMERIC(14,2) NOT NULL CHECK (salario_base_mensual >= 0),
  tipo_contrato_sugerido    VARCHAR(120) NOT NULL,
  fundamento_legal          TEXT NOT NULL DEFAULT 'CST art. 45-46 y normatividad laboral vigente',
  activo                    BOOLEAN NOT NULL DEFAULT true,
  jornada_referencia        VARCHAR(64),
  nivel_riesgo_arl          VARCHAR(8),
  salario_integral          BOOLEAN,
  fecha_creacion            TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE cargos IS 'KEYS.positions; catálogo para vacantes y empleados.';
COMMENT ON COLUMN cargos.jornada_referencia IS 'Formulario cargo (Diurna, Nocturna, etc.).';
COMMENT ON COLUMN cargos.nivel_riesgo_arl IS 'I–V según catálogo Colombia.';

CREATE TABLE vacantes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cargo                  UUID NOT NULL REFERENCES cargos (id) ON DELETE RESTRICT,
  titulo                    VARCHAR(255) NOT NULL,
  departamento              VARCHAR(120),
  ciudad                    VARCHAR(120) NOT NULL,
  modalidad                 VARCHAR(32),
  jornada_vacante           VARCHAR(64),
  fecha_limite_postulacion  DATE NOT NULL,
  cupos                     INTEGER NOT NULL DEFAULT 1 CHECK (cupos >= 1),
  salario_oferta            NUMERIC(14,2) NOT NULL DEFAULT 0,
  nombre_cargo_denorm       VARCHAR(255),
  rol_trabajador            VARCHAR(32) DEFAULT 'empleado',
  tipo_contrato_predeterminado VARCHAR(120),
  requisitos                TEXT,
  estado                    estado_vacante NOT NULL DEFAULT 'Publicada',
  fecha_creacion            TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE vacantes IS 'KEYS.vacancies.';

CREATE TABLE candidatos (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_vacante                UUID NOT NULL REFERENCES vacantes (id) ON DELETE CASCADE,
  nombre_completo           VARCHAR(255) NOT NULL,
  correo_electronico        VARCHAR(320) NOT NULL,
  telefono                  VARCHAR(32) NOT NULL,
  tipo_documento            VARCHAR(8) NOT NULL,
  numero_documento          VARCHAR(32) NOT NULL,
  fecha_nacimiento          DATE,
  nivel_educativo           VARCHAR(120),
  departamento              VARCHAR(120),
  ciudad                    VARCHAR(120) NOT NULL,
  direccion                 TEXT,
  anios_experiencia         NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (anios_experiencia >= 0),
  aspiracion_salarial       NUMERIC(14,2) NOT NULL CHECK (aspiracion_salarial >= 0),
  fecha_disponible_ingreso  DATE NOT NULL,
  titulo_vacante_denorm     VARCHAR(255),
  etapa_proceso             VARCHAR(64) NOT NULL DEFAULT 'Recibido',
  adjuntos_json             JSONB NOT NULL DEFAULT '[]',
  origen                    VARCHAR(64) DEFAULT 'Portal RRHH',
  fecha_contratacion        TIMESTAMPTZ,
  fecha_registro_contrato   TIMESTAMPTZ,
  fecha_creacion            TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_candidatos_etapa CHECK (etapa_proceso IN (
    'Recibido', 'Preseleccionado', 'Entrevistado', 'Oferta enviada', 'Contratado', 'Descartado'
  ))
);

COMMENT ON TABLE candidatos IS 'KEYS.candidates; etapa_proceso = pipeline.';
COMMENT ON COLUMN candidatos.fecha_registro_contrato IS 'hiredByContractAt en app.';

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

CREATE TABLE contratos (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etiqueta_origen             VARCHAR(64),
  tipo_persona_origen         VARCHAR(32) NOT NULL,
  id_candidato                UUID,
  nombre_candidato_denorm     VARCHAR(255),
  id_empleado                 UUID,
  nombre_empleado_denorm      VARCHAR(255),
  rol_trabajador              VARCHAR(32) NOT NULL,
  id_cargo                    UUID NOT NULL REFERENCES cargos (id) ON DELETE RESTRICT,
  nombre_cargo_denorm         VARCHAR(255) NOT NULL,
  salario_pactado             NUMERIC(14,2) NOT NULL CHECK (salario_pactado >= 0),
  fecha_inicio                DATE NOT NULL,
  fecha_fin                   DATE,
  id_empresa                  UUID NOT NULL REFERENCES empresas (id) ON DELETE RESTRICT,
  nombre_empresa_denorm       VARCHAR(255) NOT NULL,
  tipo_contrato               VARCHAR(120) NOT NULL,
  tipo_plantilla_word         VARCHAR(32) NOT NULL,
  documento_identidad_snapshot VARCHAR(32),
  meses_periodo_prueba        SMALLINT NOT NULL DEFAULT 0 CHECK (meses_periodo_prueba >= 0 AND meses_periodo_prueba <= 2),
  jornada_turno               VARCHAR(64) NOT NULL DEFAULT 'Diurna',
  lugar_trabajo               VARCHAR(255),
  causal_terminacion_prevista VARCHAR(255),
  salario_integral            BOOLEAN,
  periodicidad_pago           VARCHAR(64),
  auxilio_transporte          NUMERIC(14,2),
  dotacion_uniforme           VARCHAR(120),
  retencion_fuente            VARCHAR(32),
  eps                         VARCHAR(120) NOT NULL,
  fondo_pension               VARCHAR(120) NOT NULL,
  arl                         VARCHAR(120) NOT NULL,
  numero_licencia             VARCHAR(64),
  categoria_licencia          VARCHAR(8),
  fecha_vencimiento_licencia  DATE,
  texto_contenido_resumen     TEXT,
  fecha_creacion              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE contratos IS 'KEYS.contracts; metadatos + texto resumen; archivo Word aparte.';

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
  fecha_examen_psicosensometrico DATE,
  fecha_vencimiento_psicosensometrico DATE,
  curso_conduccion_defensiva  VARCHAR(32),
  meses_prueba                SMALLINT,
  fecha_fin_contrato          DATE,
  jornada_laboral             VARCHAR(64),
  url_avatar                  TEXT,
  correo_corporativo          VARCHAR(320),
  fecha_creacion              TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_empleado_empresa_documento UNIQUE (id_empresa, numero_documento)
);

COMMENT ON TABLE empleados_nomina IS 'KEYS.payrollEmployees.';

CREATE TABLE liquidaciones_nomina (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empleado                     UUID NOT NULL REFERENCES empleados_nomina (id) ON DELETE CASCADE,
  nombre_empleado                 VARCHAR(255) NOT NULL,
  periodo_mes                     VARCHAR(7) NOT NULL,
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
  fecha_creacion                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE liquidaciones_nomina IS 'KEYS.payrollRuns; desglose extras/aux/bonus del formulario liquidación.';
COMMENT ON COLUMN liquidaciones_nomina.horas_extras_cop IS 'Campo extras del formulario nómina.';
COMMENT ON COLUMN liquidaciones_nomina.auxilios_nomina_formulario IS 'Campo aux del formulario (no confundir solo con viáticos de ruta).';

CREATE TABLE ausencias_laborales (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empleado             UUID NOT NULL REFERENCES empleados_nomina (id) ON DELETE CASCADE,
  nombre_empleado         VARCHAR(255) NOT NULL,
  tipo_ausencia           VARCHAR(64) NOT NULL,
  fecha_inicio            DATE NOT NULL,
  fecha_fin               DATE NOT NULL,
  dias_calendario         INTEGER NOT NULL CHECK (dias_calendario >= 1),
  numero_soporte        VARCHAR(64),
  entidad_eps             VARCHAR(120),
  observaciones           TEXT,
  aprobado_por            VARCHAR(255),
  fecha_aprobacion        TIMESTAMPTZ,
  fecha_registro          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_ausencias_fechas CHECK (fecha_fin >= fecha_inicio)
);

COMMENT ON TABLE ausencias_laborales IS 'KEYS.hrAbsences.';

CREATE TABLE registros_cumplimiento_sst (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empleado             UUID NOT NULL REFERENCES empleados_nomina (id) ON DELETE CASCADE,
  nombre_empleado         VARCHAR(255) NOT NULL,
  tipo_registro           VARCHAR(120) NOT NULL,
  proveedor_entidad       VARCHAR(255) NOT NULL,
  fecha_vencimiento_control DATE NOT NULL,
  estado                  VARCHAR(64) NOT NULL DEFAULT 'Pendiente',
  codigo_documento        VARCHAR(64),
  observaciones           TEXT,
  fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT now(),
  creado_por              VARCHAR(255) NOT NULL DEFAULT 'Sistema'
);

COMMENT ON TABLE registros_cumplimiento_sst IS 'KEYS.sstCompliance.';
