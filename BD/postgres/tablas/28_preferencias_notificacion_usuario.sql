-- Tabla: preferencias_notificacion_usuario
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE preferencias_notificacion_usuario (
  id                                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario                        UUID NOT NULL UNIQUE REFERENCES usuarios (id) ON DELETE CASCADE,
  notificaciones_habilitadas        BOOLEAN NOT NULL DEFAULT true,
  sonido_notificaciones_habilitadas BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion               TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE preferencias_notificacion_usuario IS 'Preferencias por cuenta: toasts y sonido independientes; persistir tras recargar sesión.';

COMMENT ON COLUMN preferencias_notificacion_usuario.notificaciones_habilitadas IS 'Si false, no toasts ni sonido por avisos nuevos; servidor no inserta notificaciones salvo obligatorias.';

COMMENT ON COLUMN preferencias_notificacion_usuario.sonido_notificaciones_habilitadas IS 'Si false, sin timbre; toasts pueden seguir si notificaciones_habilitadas es true.';

COMMENT ON COLUMN preferencias_notificacion_usuario.fecha_actualizacion IS 'Actualizar en cada cambio de preferencias (API).';
