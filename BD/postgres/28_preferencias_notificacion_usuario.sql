-- Preferencias de notificaciones por usuario: dos columnas independientes.
-- Escenarios (portal):
--   notificaciones_habilitadas | sonido_* | Comportamiento
--   true                       | true     | Toasts + timbre; servidor puede insertar filas en `notificaciones`.
--   true                       | false    | Toasts sin timbre.
--   false                      | *        | Sin toasts ni timbre por avisos nuevos; servidor no inserta (portal.service);
--                                         bandeja conserva historial ya sincronizado.
-- Tabla distinta de public.notificaciones (cada aviso in-app).
-- Para aplicar solo este cambio en una BD ya creada: ejecutar_solo_preferencias_notificacion_usuario.sql
-- Columna sonido (BD existentes antes de may-2026): ejecutar_solo_preferencias_notificacion_columna_sonido.sql

CREATE TABLE IF NOT EXISTS public.preferencias_notificacion_usuario (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario                UUID NOT NULL UNIQUE REFERENCES public.usuarios (id) ON DELETE CASCADE,
  notificaciones_habilitadas BOOLEAN NOT NULL DEFAULT true,
  sonido_notificaciones_habilitadas BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion            TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.preferencias_notificacion_usuario IS 'Preferencias por cuenta: avisos emergentes (toast) y sonido son independientes; persistir tras recargar sesión.';
COMMENT ON COLUMN public.preferencias_notificacion_usuario.notificaciones_habilitadas IS 'Si false, no mostrar toasts ni sonido por avisos nuevos; el servidor no debería insertar notificaciones para este usuario salvo obligatorias.';
COMMENT ON COLUMN public.preferencias_notificacion_usuario.sonido_notificaciones_habilitadas IS 'Si false, no reproducir timbre; los toasts pueden seguir si notificaciones_habilitadas es true.';
COMMENT ON COLUMN public.preferencias_notificacion_usuario.fecha_actualizacion IS 'Actualizar en cada cambio de preferencias (API).';

ALTER TABLE public.preferencias_notificacion_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS preferencias_notificacion_propias ON public.preferencias_notificacion_usuario;
CREATE POLICY preferencias_notificacion_propias
  ON public.preferencias_notificacion_usuario FOR ALL TO authenticated
  USING (id_usuario = auth.uid())
  WITH CHECK (id_usuario = auth.uid());
