-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Ventana pública en el sitio (Carreras): opcional "desde"; el cierre sigue siendo fecha_limite_postulacion.
ALTER TABLE public.vacantes
  ADD COLUMN IF NOT EXISTS fecha_publicacion_desde DATE;

COMMENT ON COLUMN public.vacantes.fecha_publicacion_desde IS
  'Primera fecha en que la vacante se lista en el sitio público y acepta postulaciones web; NULL = visible desde que esté Publicada (sin espera).';
