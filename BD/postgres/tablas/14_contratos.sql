-- Tabla: contratos
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

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
  fecha_renovacion            DATE,
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
