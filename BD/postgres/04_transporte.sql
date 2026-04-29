-- Módulo: Transporte — Flota, conductores, solicitudes, viajes, combustible, mantenimiento técnico

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
  nombre_propietario                      VARCHAR(255),
  nit_cedula_propietario                  VARCHAR(32),
  disponible                              BOOLEAN NOT NULL DEFAULT true,
  ocupado_por_sistema                     BOOLEAN NOT NULL DEFAULT false,
  fecha_creacion                          TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion                     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_vehiculos_placa UNIQUE (placa)
);

COMMENT ON TABLE vehiculos IS 'Flota operativa; KEYS.vehicles. ocupado_por_sistema = autoBusy en app.';
COMMENT ON COLUMN vehiculos.refrigerado_termoking IS 'Equipo refrigeración (Termoking).';

CREATE TABLE conductores (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresa                UUID REFERENCES empresas (id) ON DELETE SET NULL,
  nombre_completo           VARCHAR(255) NOT NULL,
  tipo_documento            VARCHAR(8),
  numero_documento          VARCHAR(32) NOT NULL,
  telefono                  VARCHAR(32) NOT NULL,
  departamento              VARCHAR(120),
  ciudad                    VARCHAR(120),
  direccion                 TEXT,
  numero_licencia           VARCHAR(64),
  categoria_licencia        VARCHAR(8),
  fecha_vencimiento_licencia DATE,
  fecha_examen_psicosensometrico DATE,
  fecha_vencimiento_psicosensometrico DATE,
  curso_conduccion_defensiva VARCHAR(32),
  contacto_emergencia       VARCHAR(255),
  telefono_emergencia       VARCHAR(32),
  tipo_contrato             VARCHAR(80),
  salario_base              NUMERIC(14,2),
  fecha_inicio              DATE,
  disponible                BOOLEAN NOT NULL DEFAULT true,
  ocupado_por_sistema       BOOLEAN NOT NULL DEFAULT false,
  fecha_contratacion        TIMESTAMPTZ,
  fecha_creacion            TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_conductores_documento UNIQUE (numero_documento)
);

COMMENT ON TABLE conductores IS 'KEYS.drivers; sincronizado con empleados conductor en RRHH.';

CREATE TABLE tarifas_trayecto (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departamento_origen        VARCHAR(120) NOT NULL,
  ciudad_origen              VARCHAR(120) NOT NULL,
  departamento_destino       VARCHAR(120) NOT NULL,
  ciudad_destino             VARCHAR(120) NOT NULL,
  valor_tarifa_cop           NUMERIC(18,2) NOT NULL CHECK (valor_tarifa_cop > 0),
  activo                     BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_tarifas_trayecto_ruta UNIQUE (
    departamento_origen,
    ciudad_origen,
    departamento_destino,
    ciudad_destino
  )
);

COMMENT ON TABLE tarifas_trayecto IS 'Tarifas base por trayecto para autocompletar valor de viaje (KEYS.tripRouteRates).';
COMMENT ON COLUMN tarifas_trayecto.valor_tarifa_cop IS 'Tarifa COP sugerida para asignación operativa.';

CREATE TABLE solicitudes_transporte (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_solicitud                VARCHAR(32) NOT NULL,
  id_usuario_solicitante          UUID NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
  id_empresa_cliente              UUID REFERENCES empresas (id) ON DELETE SET NULL,
  nombre_cliente                  VARCHAR(255),
  nombre_quien_solicita           VARCHAR(255),
  departamento_origen             VARCHAR(120),
  ciudad_origen                   VARCHAR(120) NOT NULL,
  direccion_origen                TEXT NOT NULL,
  departamento_destino            VARCHAR(120),
  ciudad_destino                  VARCHAR(120) NOT NULL,
  direccion_destino               TEXT NOT NULL,
  fecha_hora_recogida             TIMESTAMPTZ NOT NULL,
  fecha_hora_entrega_estimada     TIMESTAMPTZ NOT NULL,
  tipo_vehiculo_solicitado        VARCHAR(40) NOT NULL,
  descripcion_carga               TEXT NOT NULL,
  tipo_servicio                   VARCHAR(80) NOT NULL,
  numero_cajas                    INTEGER NOT NULL CHECK (numero_cajas >= 0),
  peso_kg                         NUMERIC(14,2) NOT NULL CHECK (peso_kg >= 0),
  nombre_contacto_en_sitio        VARCHAR(255) NOT NULL,
  telefono_contacto_en_sitio      VARCHAR(32) NOT NULL,
  observaciones                   TEXT,
  adjuntos_nombres_json           JSONB NOT NULL DEFAULT '[]',
  estado                          estado_solicitud_transporte NOT NULL DEFAULT 'Pendiente',
  valor_tarifa_viaje             NUMERIC(18,2) NOT NULL DEFAULT 0,
  valor_asegurado                 NUMERIC(18,2),
  total_cargos_standby            NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (total_cargos_standby >= 0),
  eventos_standby_json            JSONB NOT NULL DEFAULT '[]',
  motivo_rechazo                  TEXT,
  fecha_aprobacion                TIMESTAMPTZ,
  aprobado_por                    VARCHAR(255),
  aprobacion_automatica           BOOLEAN NOT NULL DEFAULT false,
  fecha_entrega_efectiva          TIMESTAMPTZ,
  fecha_cierre                    TIMESTAMPTZ,
  distancia_km                    NUMERIC(14,2),
  fecha_creacion                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_solicitudes_transporte_numero UNIQUE (numero_solicitud),
  CONSTRAINT chk_solicitudes_entrega_después_recogida CHECK (fecha_hora_entrega_estimada > fecha_hora_recogida)
);

COMMENT ON TABLE solicitudes_transporte IS 'KEYS.requests; viaje asignado en tabla viajes_transporte.';
COMMENT ON COLUMN solicitudes_transporte.valor_tarifa_viaje IS 'Tarifa operativa; no la fija el cliente en el prototipo.';
COMMENT ON COLUMN solicitudes_transporte.eventos_standby_json IS 'Historial standby (horas, tarifa, actor).';

CREATE TABLE viajes_transporte (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_solicitud                    UUID NOT NULL UNIQUE REFERENCES solicitudes_transporte (id) ON DELETE CASCADE,
  numero_viaje                    VARCHAR(32) NOT NULL,
  id_vehiculo                     UUID NOT NULL REFERENCES vehiculos (id) ON DELETE RESTRICT,
  id_conductor                    UUID NOT NULL REFERENCES conductores (id) ON DELETE RESTRICT,
  placa_vehiculo                  VARCHAR(8) NOT NULL,
  tipo_vehiculo_asignado          VARCHAR(40),
  nombre_conductor                VARCHAR(255) NOT NULL,
  telefono_conductor              VARCHAR(32),
  descripcion_ruta                TEXT,
  fecha_hora_recogida_programada TIMESTAMPTZ NOT NULL,
  fecha_hora_entrega_programada  TIMESTAMPTZ NOT NULL,
  asignado_por                    VARCHAR(255),
  fecha_hora_asignacion           TIMESTAMPTZ,
  estado_operativo_en_vivo        VARCHAR(64),
  datos_factura_json              JSONB,
  fecha_creacion                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_viajes_transporte_numero UNIQUE (numero_viaje)
);

COMMENT ON TABLE viajes_transporte IS 'Un viaje por solicitud cuando hay camión y conductor asignados.';

CREATE TABLE registros_combustible (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha                 DATE NOT NULL,
  id_vehiculo           UUID NOT NULL REFERENCES vehiculos (id) ON DELETE CASCADE,
  placa_vehiculo        VARCHAR(8) NOT NULL,
  id_conductor          UUID NOT NULL REFERENCES conductores (id) ON DELETE CASCADE,
  nombre_conductor      VARCHAR(255) NOT NULL,
  numero_viaje          VARCHAR(32),
  litros                NUMERIC(14,3) NOT NULL CHECK (litros > 0),
  costo_total           NUMERIC(18,2) NOT NULL CHECK (costo_total >= 0),
  costo_por_litro       NUMERIC(18,4),
  kilometraje_odometro  NUMERIC(14,2),
  estacion              VARCHAR(255),
  pagado_por            VARCHAR(32) NOT NULL DEFAULT 'empresa',
  fecha_registro        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE registros_combustible IS 'KEYS.fuelLogs; pagado_por: empresa | conductor.';
COMMENT ON COLUMN registros_combustible.pagado_por IS 'Si conductor, puede incluirse en reembolso de nómina.';

CREATE TABLE registros_mantenimiento_vehiculo (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha                 DATE NOT NULL,
  id_vehiculo           UUID NOT NULL REFERENCES vehiculos (id) ON DELETE CASCADE,
  placa_vehiculo        VARCHAR(8) NOT NULL,
  tipo_intervencion     VARCHAR(64) NOT NULL DEFAULT 'preventivo',
  descripcion           TEXT NOT NULL,
  costo                 NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (costo >= 0),
  horas_inactividad     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (horas_inactividad >= 0),
  estado_seguimiento    VARCHAR(64) NOT NULL DEFAULT 'Pendiente',
  fecha_registro        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE registros_mantenimiento_vehiculo IS 'KEYS.vehicleTechnicalLogs.';
