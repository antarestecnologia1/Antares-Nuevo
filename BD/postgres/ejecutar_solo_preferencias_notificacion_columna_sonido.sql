-- =============================================================================
-- Ejecutar SOLO si ya tiene la tabla preferencias_notificacion_usuario (script 28)
-- Añade la columna de sonido independiente de "avisos emergentes".
-- Idempotente: ADD COLUMN IF NOT EXISTS
-- =============================================================================

ALTER TABLE public.preferencias_notificacion_usuario
  ADD COLUMN IF NOT EXISTS sonido_notificaciones_habilitadas BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.preferencias_notificacion_usuario.sonido_notificaciones_habilitadas IS 'Si false, no se reproduce el timbre ante avisos nuevos (toasts pueden seguir si notificaciones_habilitadas es true).';
