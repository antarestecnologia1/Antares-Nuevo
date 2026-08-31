-- Enlace al soporte archivado en Gestión documental (carpeta del colaborador).
-- Idempotente para instalaciones existentes.

ALTER TABLE public.ausencias_laborales
  ADD COLUMN IF NOT EXISTS id_documento_soporte UUID;

ALTER TABLE public.ausencias_laborales
  ADD COLUMN IF NOT EXISTS nombre_archivo_soporte VARCHAR(512);

COMMENT ON COLUMN public.ausencias_laborales.id_documento_soporte IS 'Documento corporativo (DMS) archivado en la carpeta del colaborador.';
COMMENT ON COLUMN public.ausencias_laborales.nombre_archivo_soporte IS 'Nombre del archivo de soporte archivado en Gestión documental.';
