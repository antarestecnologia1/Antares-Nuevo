-- Tabla: cargos
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

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
