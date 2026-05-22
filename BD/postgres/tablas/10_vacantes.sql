-- Tabla: vacantes
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE vacantes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cargo                  UUID NOT NULL REFERENCES cargos (id) ON DELETE RESTRICT,
  titulo                    VARCHAR(255) NOT NULL,
  departamento              VARCHAR(120),
  ciudad                    VARCHAR(120) NOT NULL,
  modalidad                 VARCHAR(32),
  jornada_vacante           VARCHAR(64),
  fecha_limite_postulacion  DATE NOT NULL,
  fecha_publicacion_desde   DATE,
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

COMMENT ON TABLE vacantes IS 'KEYS.vacancies. fecha_publicacion_desde = primera fecha listado público Carreras (NULL = sin espera).';
