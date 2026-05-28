-- Rol operativo logística (solicitudes, autorización de transporte, viajes).
-- Instalaciones nuevas: ya incluido en ../02_enums.sql
-- Bases existentes: ejecutar una vez en el SQL Editor.

DO $m$
BEGIN
  ALTER TYPE public.rol_usuario ADD VALUE 'logistica';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$m$;

COMMENT ON TYPE public.rol_usuario IS 'Roles del portal; logistica = operación de transporte sin bandejas RRHH.';
