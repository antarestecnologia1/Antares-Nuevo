-- Tabla: empresas
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE empresas (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre                VARCHAR(255) NOT NULL,
  nit                   VARCHAR(32)  NOT NULL,
  telefono              VARCHAR(32),
  correo_empresarial    VARCHAR(120),
  nombre_contacto       VARCHAR(255),
  departamento          VARCHAR(120),
  ciudad                VARCHAR(120),
  direccion_operativa   TEXT,
  url_logo              TEXT,
  tipo_relacion_empresa tipo_relacion_empresa NOT NULL DEFAULT 'cliente',
  activo                BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_empresas_nit UNIQUE (nit)
);

COMMENT ON TABLE empresas IS 'Clientes, terceros y empresa operadora; equivalente a KEYS.companies.';

COMMENT ON COLUMN empresas.tipo_relacion_empresa IS 'cliente = contrata servicios; tercero = proveedor u otro; propia = operador Antares.';

COMMENT ON COLUMN empresas.activo IS 'Si es false, la empresa no se ofrece en altas (portal); usuarios ya asignados pueden conservar id_empresa.';

COMMENT ON COLUMN empresas.url_logo IS 'URL pública del logo (p. ej. R2); vacío si no hay logo.';

COMMENT ON COLUMN empresas.correo_empresarial IS 'Correo de contacto operativo (panel admin / portal).';

COMMENT ON COLUMN empresas.nombre_contacto IS 'Persona de contacto principal.';

COMMENT ON COLUMN empresas.departamento IS 'Departamento sede u operación.';

COMMENT ON COLUMN empresas.ciudad IS 'Ciudad sede u operación.';

COMMENT ON COLUMN empresas.direccion_operativa IS 'Dirección operativa o sede.';

-- Índices

CREATE UNIQUE INDEX uq_empresas_una_sola_propia
  ON empresas ((true))
  WHERE tipo_relacion_empresa = 'propia'::tipo_relacion_empresa;

