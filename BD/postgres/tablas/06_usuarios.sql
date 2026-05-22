-- Tabla: usuarios
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE usuarios (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresa                      UUID REFERENCES empresas (id) ON DELETE SET NULL,
  correo_electronico              VARCHAR(320) NOT NULL,
  hash_contrasena                 TEXT NOT NULL,
  nombre_completo                 VARCHAR(255) NOT NULL,
  primer_nombre                   VARCHAR(120),
  segundo_nombre                  VARCHAR(120),
  primer_apellido                 VARCHAR(120),
  segundo_apellido                VARCHAR(120),
  rol                             rol_usuario NOT NULL DEFAULT 'client',
  tipo_vinculo_registro           tipo_vinculo_registro NOT NULL DEFAULT 'cliente',
  estado_cuenta                   estado_cuenta_usuario NOT NULL DEFAULT 'pendiente',
  numero_identificacion           VARCHAR(32),
  telefono                        VARCHAR(32),
  tipo_documento                  VARCHAR(8),
  tipo_persona                    VARCHAR(32),
  nit_empresa_registro           VARCHAR(32),
  fecha_expedicion_documento      DATE,
  genero                          VARCHAR(40),
  cargo_registro                  VARCHAR(255),
  area_trabajo                    VARCHAR(120),
  departamento                    VARCHAR(120),
  ciudad                          VARCHAR(120),
  direccion                       TEXT,
  nombre_empresa_texto_legacy     VARCHAR(255),
  fecha_nacimiento                DATE,
  fecha_aceptacion_terminos       TIMESTAMPTZ,
  checklist_registro_json         JSONB NOT NULL DEFAULT '{}',
  contacto_emergencia             VARCHAR(255),
  telefono_emergencia             VARCHAR(32),
  parentesco_emergencia           VARCHAR(120),
  url_avatar                      TEXT,
  refresh_token_hash              TEXT,
  fecha_aprobacion_cuenta         TIMESTAMPTZ,
  cuenta_aprobada_por             UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  autenticacion_dos_factores     BOOLEAN NOT NULL DEFAULT false,
  fecha_ingreso_portal            DATE,
  fecha_creacion                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_usuarios_correo UNIQUE (correo_electronico),
  CONSTRAINT chk_usuarios_correo CHECK (correo_electronico ~* '^[^@]+@[^@]+\.[^@]+$')
);

COMMENT ON TABLE usuarios IS 'Portal y sesión; equivalente a KEYS.users.';

COMMENT ON COLUMN usuarios.nombre_empresa_texto_legacy IS 'Denormalizado histórico; preferir id_empresa.';

COMMENT ON COLUMN usuarios.primer_nombre IS 'Formulario registro: firstName.';

COMMENT ON COLUMN usuarios.segundo_nombre IS 'Formulario registro: middleName.';

COMMENT ON COLUMN usuarios.primer_apellido IS 'Formulario registro: lastName.';

COMMENT ON COLUMN usuarios.segundo_apellido IS 'Formulario registro: secondLastName.';

COMMENT ON COLUMN usuarios.genero IS 'Formulario registro: gender.';

COMMENT ON COLUMN usuarios.cargo_registro IS 'Formulario registro: position (cargo).';

COMMENT ON COLUMN usuarios.area_trabajo IS 'Formulario registro: workArea.';

COMMENT ON COLUMN usuarios.nit_empresa_registro IS 'NIT empresa cuando el registro es jurídico; puede repetirse entre usuarios.';

COMMENT ON COLUMN usuarios.fecha_aceptacion_terminos IS 'Momento de aceptación Habeas Data / términos (acceptTerms).';

COMMENT ON COLUMN usuarios.checklist_registro_json IS 'Equivalente a profileQualityChecklist en app (idVerified, acceptedTermsAt, etc.).';

COMMENT ON COLUMN usuarios.tipo_vinculo_registro IS 'Registro web: cliente externo o empleado interno (declaración del solicitante).';

COMMENT ON COLUMN usuarios.refresh_token_hash IS 'Hash bcrypt del último refresh JWT emitido por apps/api (rotación).';

COMMENT ON COLUMN usuarios.fecha_aprobacion_cuenta IS 'Momento en que un administrador aprobó la cuenta (pendiente → aprobado).';

COMMENT ON COLUMN usuarios.cuenta_aprobada_por IS 'Usuario administrador que ejecutó la aprobación.';

-- Índices

CREATE INDEX idx_usuarios_id_empresa ON usuarios (id_empresa);

CREATE INDEX idx_usuarios_correo_lower ON usuarios (lower(correo_electronico));

CREATE INDEX idx_usuarios_rol_estado ON usuarios (rol, estado_cuenta);

CREATE UNIQUE INDEX uq_usuarios_documento_personal
  ON usuarios (lower(trim(numero_identificacion)))
  WHERE numero_identificacion IS NOT NULL AND btrim(numero_identificacion) <> '';

