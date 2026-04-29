-- Módulo: Sistema — Notificaciones, correo, contactos B2B, contadores, autorizaciones, sesiones

CREATE TABLE notificaciones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario          UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  titulo              VARCHAR(255) NOT NULL,
  cuerpo              TEXT NOT NULL,
  fecha_lectura       TIMESTAMPTZ,
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notificaciones IS 'KEYS.notifications. In-app.';

CREATE TABLE correos_salida (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direccion_destino       VARCHAR(320) NOT NULL,
  asunto                  VARCHAR(500) NOT NULL,
  cuerpo                  TEXT NOT NULL,
  fecha_envio_real        TIMESTAMPTZ,
  error_envio             TEXT,
  fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE correos_salida IS 'KEYS.emails; cola simulada en prototipo.';

CREATE TABLE prospectos_contacto_b2b (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_contacto             VARCHAR(255) NOT NULL,
  nombre_empresa              VARCHAR(255) NOT NULL,
  nit                         VARCHAR(32) NOT NULL,
  cargo_contacto            VARCHAR(255) NOT NULL,
  telefono                    VARCHAR(32) NOT NULL,
  correo_electronico          VARCHAR(320) NOT NULL,
  tipo_servicio               VARCHAR(120) NOT NULL,
  tipo_operacion              VARCHAR(80) NOT NULL,
  frecuencia_operacion        VARCHAR(64) NOT NULL,
  ventana_inicio_servicio     VARCHAR(80) NOT NULL,
  volumen_mensual_aprox_kg    NUMERIC(14,2) NOT NULL CHECK (volumen_mensual_aprox_kg >= 0),
  mensaje                     TEXT NOT NULL,
  fecha_creacion              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE prospectos_contacto_b2b IS 'Formulario B2B index.html; KEYS.contacts.';

CREATE TABLE contadores_secuencia (
  prefijo       VARCHAR(32) PRIMARY KEY,
  ultimo_valor  BIGINT NOT NULL DEFAULT 0 CHECK (ultimo_valor >= 0)
);

COMMENT ON TABLE contadores_secuencia IS 'KEYS.counters; SOL-######, VJE-######, etc.';

CREATE TABLE solicitudes_autorizacion (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_solicitud              VARCHAR(64) NOT NULL,
  titulo                      VARCHAR(500) NOT NULL,
  datos_json                  JSONB NOT NULL DEFAULT '{}',
  estado                      estado_aprobacion NOT NULL DEFAULT 'pendiente',
  id_usuario_solicitante      UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  nombre_solicitante          VARCHAR(255),
  fecha_solicitud             TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_revision              TIMESTAMPTZ,
  revisado_por                VARCHAR(255),
  motivo_rechazo              TEXT
);

COMMENT ON TABLE solicitudes_autorizacion IS 'KEYS.approvals (crear conductor, ausencia, pago nómina, etc.).';

CREATE TABLE sesiones_usuario (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario          UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  hash_token          TEXT NOT NULL,
  fecha_expiracion    TIMESTAMPTZ NOT NULL,
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_sesiones_hash_token UNIQUE (hash_token)
);

COMMENT ON TABLE sesiones_usuario IS 'Opcional: reemplazar KEYS.session en API.';
