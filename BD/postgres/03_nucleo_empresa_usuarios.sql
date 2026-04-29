-- Módulo: Núcleo — Empresas, usuarios del portal, permisos, parámetros y reglas de viáticos

CREATE TABLE empresas (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre                VARCHAR(255) NOT NULL,
  nit                   VARCHAR(32)  NOT NULL,
  telefono              VARCHAR(32),
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_empresas_nit UNIQUE (nit)
);

COMMENT ON TABLE empresas IS 'Clientes y empresa operadora; equivalente a KEYS.companies.';

CREATE TABLE usuarios (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresa                      UUID REFERENCES empresas (id) ON DELETE SET NULL,
  correo_electronico              VARCHAR(320) NOT NULL,
  hash_contrasena                 TEXT NOT NULL,
  nombre_completo                 VARCHAR(255) NOT NULL,
  rol                             rol_usuario NOT NULL DEFAULT 'client',
  estado_cuenta                   estado_cuenta_usuario NOT NULL DEFAULT 'pendiente',
  numero_identificacion           VARCHAR(32),
  telefono                        VARCHAR(32),
  tipo_documento                  VARCHAR(8),
  tipo_persona                    VARCHAR(32),
  fecha_expedicion_documento      DATE,
  departamento                    VARCHAR(120),
  ciudad                          VARCHAR(120),
  direccion                       TEXT,
  nombre_empresa_texto_legacy     VARCHAR(255),
  fecha_nacimiento                DATE,
  contacto_emergencia             VARCHAR(255),
  telefono_emergencia             VARCHAR(32),
  parentesco_emergencia           VARCHAR(120),
  url_avatar                      TEXT,
  autenticacion_dos_factores     BOOLEAN NOT NULL DEFAULT false,
  fecha_ingreso_portal            DATE,
  fecha_creacion                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_usuarios_correo UNIQUE (correo_electronico),
  CONSTRAINT chk_usuarios_correo CHECK (correo_electronico ~* '^[^@]+@[^@]+\.[^@]+$')
);

COMMENT ON TABLE usuarios IS 'Portal y sesión; equivalente a KEYS.users.';
COMMENT ON COLUMN usuarios.nombre_empresa_texto_legacy IS 'Denormalizado histórico; preferir id_empresa.';

CREATE TABLE permisos_usuario (
  id_usuario    UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  permiso       VARCHAR(64) NOT NULL,
  PRIMARY KEY (id_usuario, permiso)
);

COMMENT ON TABLE permisos_usuario IS 'Permisos granulares (PERMISSIONS en app); coherentes con rol.';

CREATE TABLE reglas_viatico_interdepartamental (
  id                                  SMALLINT PRIMARY KEY DEFAULT 1,
  valor_viaje_interdepartamental_cop  NUMERIC(14,2) NOT NULL DEFAULT 85000 CHECK (valor_viaje_interdepartamental_cop >= 0),
  fecha_actualizacion                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT regla_viatico_una_fila CHECK (id = 1)
);

INSERT INTO reglas_viatico_interdepartamental (id, valor_viaje_interdepartamental_cop) VALUES (1, 85000);

COMMENT ON TABLE reglas_viatico_interdepartamental IS 'Equivalente a KEYS.travelAllowanceRules (una fila).';

CREATE TABLE parametros_sistema (
  clave             VARCHAR(64) PRIMARY KEY,
  valor_numerico    NUMERIC(18,4),
  valor_texto       TEXT,
  vigente_desde     DATE NOT NULL DEFAULT CURRENT_DATE,
  vigente_hasta     DATE,
  descripcion       TEXT
);

COMMENT ON TABLE parametros_sistema IS 'SMMLV, auxilio transporte, UVT, topes; por vigencia.';

CREATE OR REPLACE FUNCTION trg_marcar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Opcional: CREATE TRIGGER ... BEFORE UPDATE ... EXECUTE FUNCTION trg_marcar_fecha_actualizacion();
