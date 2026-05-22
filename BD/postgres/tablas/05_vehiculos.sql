-- Tabla: vehiculos
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE vehiculos (
  id                                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa                                   VARCHAR(8)  NOT NULL,
  marca                                   VARCHAR(120) NOT NULL,
  linea_modelo                            VARCHAR(120) NOT NULL,
  anio_modelo                             SMALLINT NOT NULL CHECK (anio_modelo >= 1990 AND anio_modelo <= 2100),
  color                                   VARCHAR(64) NOT NULL,
  tipo_vehiculo                           VARCHAR(40) NOT NULL,
  capacidad_kg                            NUMERIC(14,2) NOT NULL CHECK (capacidad_kg > 0),
  refrigerado_termoking                   BOOLEAN NOT NULL DEFAULT false,
  tipo_carroceria                         VARCHAR(120) NOT NULL,
  tipo_combustible                        VARCHAR(80) NOT NULL,
  configuracion_ejes                      VARCHAR(80) NOT NULL,
  numero_motor                            VARCHAR(80) NOT NULL,
  numero_chasis_vin                       VARCHAR(17) NOT NULL CHECK (length(numero_chasis_vin) >= 11 AND length(numero_chasis_vin) <= 17),
  numero_tarjeta_propiedad                VARCHAR(64) NOT NULL,
  fecha_expedicion_soat                   DATE NOT NULL,
  fecha_vencimiento_soat                  DATE NOT NULL,
  fecha_expedicion_tecnomecanica          DATE NOT NULL,
  fecha_vencimiento_tecnomecanica         DATE NOT NULL,
  numero_poliza_rc_contractual            VARCHAR(64),
  numero_poliza_rc_extracontractual       VARCHAR(64),
  fecha_vencimiento_polizas_rc            DATE,
  tiene_gps                               BOOLEAN NOT NULL DEFAULT false,
  proveedor_gps                           VARCHAR(120),
  usuario_proveedor_satelite              VARCHAR(255),
  password_proveedor_satelite             TEXT,
  disponible                              BOOLEAN NOT NULL DEFAULT true,
  ocupado_por_sistema                     BOOLEAN NOT NULL DEFAULT false,
  fecha_creacion                          TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion                     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_vehiculos_placa UNIQUE (placa)
);

COMMENT ON TABLE vehiculos IS 'Flota operativa; KEYS.vehicles. ocupado_por_sistema = autoBusy en app.';

COMMENT ON COLUMN vehiculos.refrigerado_termoking IS 'Equipo refrigeración (Termoking).';

COMMENT ON COLUMN vehiculos.usuario_proveedor_satelite IS 'Usuario en el portal del proveedor de rastreo satelital.';

COMMENT ON COLUMN vehiculos.password_proveedor_satelite IS 'Contraseña del portal del proveedor; almacenada como texto.';
