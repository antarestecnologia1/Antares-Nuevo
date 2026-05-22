-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- =============================================================================
-- Ejecutar SOLO este script (BD ya existente con public.usuarios)
-- =============================================================================
-- No requiere correr 01–27 ni el resto de migraciones.
--
-- Requisitos:
--   - Tabla public.usuarios (FK id_usuario).
--   - Supabase / proyecto con rol authenticated y auth.uid() (política RLS).
--
-- Idempotencia: CREATE TABLE IF NOT EXISTS; política recreada con DROP IF EXISTS.
--
-- Si la tabla ya existía sin columna sonido: ejecutar además
--   ejecutar_solo_preferencias_notificacion_columna_sonido.sql
--
-- Contenido alineado a: 28_preferencias_notificacion_usuario.sql
-- =============================================================================

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
