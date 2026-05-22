-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Sonido vs avisos emergentes son independientes de `notificaciones_habilitadas`.
-- - notificaciones_habilitadas = false → no toast ni sonido por avisos nuevos (la bandeja sigue usable).
-- - sonido_notificaciones_habilitadas = false → sin timbre; pueden seguir los toasts si los avisos están activos.

ALTER TABLE public.preferencias_notificacion_usuario
  ADD COLUMN IF NOT EXISTS sonido_notificaciones_habilitadas BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.preferencias_notificacion_usuario.sonido_notificaciones_habilitadas IS 'Si false, no se reproduce el timbre ante avisos nuevos (toasts pueden seguir si notificaciones_habilitadas es true).';
