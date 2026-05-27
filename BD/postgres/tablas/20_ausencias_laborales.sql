-- Tabla: ausencias_laborales
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE ausencias_laborales (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empleado             UUID NOT NULL REFERENCES empleados_nomina (id) ON DELETE CASCADE,
  nombre_empleado         VARCHAR(255) NOT NULL,
  tipo_ausencia           VARCHAR(64) NOT NULL,
  subtipo_ausencia        VARCHAR(64),
  fecha_inicio            DATE NOT NULL,
  fecha_fin               DATE NOT NULL,
  dias_calendario         INTEGER NOT NULL CHECK (dias_calendario >= 1),
  dias_reconocidos        NUMERIC(6,2) NOT NULL DEFAULT 1.00,
  unidad_dias_reconocidos VARCHAR(16) NOT NULL DEFAULT 'calendario',
  numero_soporte        VARCHAR(64),
  entidad_eps             VARCHAR(120),
  observaciones           TEXT,
  aprobado_por            VARCHAR(255),
  fecha_aprobacion        TIMESTAMPTZ,
  fecha_registro          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_ausencias_fechas CHECK (fecha_fin >= fecha_inicio),
  CONSTRAINT chk_ausencias_dias_reconocidos CHECK (dias_reconocidos > 0),
  CONSTRAINT chk_ausencias_unidad_dias_reconocidos CHECK (unidad_dias_reconocidos IN ('calendario', 'habil', 'jornada')),
  CONSTRAINT chk_ausencias_sufragio_subtipo CHECK (
    tipo_ausencia <> 'permiso_sufragio'
    OR subtipo_ausencia IN ('jurado', 'votante')
  ),
  CONSTRAINT chk_ausencias_sufragio_reconocimiento CHECK (
    tipo_ausencia <> 'permiso_sufragio'
    OR (
      unidad_dias_reconocidos = 'jornada'
      AND (
        (subtipo_ausencia = 'jurado' AND dias_reconocidos = 1.00)
        OR (subtipo_ausencia = 'votante' AND dias_reconocidos = 0.50)
      )
    )
  ),
  CONSTRAINT chk_ausencias_luto_max_5 CHECK (
    tipo_ausencia <> 'licencia_luto'
    OR (unidad_dias_reconocidos = 'habil' AND dias_reconocidos <= 5.00)
  ),
  CONSTRAINT chk_ausencias_paternidad_max_14 CHECK (
    tipo_ausencia <> 'licencia_paternidad'
    OR (
      unidad_dias_reconocidos = 'calendario'
      AND dias_reconocidos <= 14.00
      AND (
        subtipo_ausencia IS DISTINCT FROM 'parental_compartida'
        OR dias_reconocidos <= 7.00
      )
    )
  ),
  CONSTRAINT chk_ausencias_maternidad_subtipo CHECK (
    tipo_ausencia <> 'licencia_maternidad'
    OR subtipo_ausencia IN ('ordinaria', 'parto_multiple', 'parto_prematuro', 'adopcion', 'extension_medica')
  ),
  CONSTRAINT chk_ausencias_paternidad_subtipo CHECK (
    tipo_ausencia <> 'licencia_paternidad'
    OR subtipo_ausencia IN ('continua', 'flexible', 'parental_compartida')
  ),
  CONSTRAINT chk_ausencias_maternidad_max_182 CHECK (
    tipo_ausencia <> 'licencia_maternidad'
    OR (unidad_dias_reconocidos = 'calendario' AND dias_reconocidos <= 182.00)
  )
);

COMMENT ON TABLE ausencias_laborales IS 'KEYS.hrAbsences.';
COMMENT ON COLUMN ausencias_laborales.subtipo_ausencia IS 'Desagregación del tipo: sufragio (jurado|votante), maternidad (ordinaria|parto_multiple|parto_prematuro|adopcion|extension_medica), paternidad (continua|flexible|parental_compartida).';
COMMENT ON COLUMN ausencias_laborales.dias_reconocidos IS 'Días o fracción reconocida laboralmente para nómina/compensación; puede diferir de dias_calendario.';
COMMENT ON COLUMN ausencias_laborales.unidad_dias_reconocidos IS 'calendario | habil | jornada según la naturaleza de la ausencia.';

-- Índices

CREATE INDEX idx_ausencias_empleado ON ausencias_laborales (id_empleado);
CREATE INDEX idx_ausencias_tipo_periodo ON ausencias_laborales (tipo_ausencia, fecha_inicio, fecha_fin);

