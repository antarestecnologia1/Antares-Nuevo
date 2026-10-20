-- Antares BD — Habilitar RLS en todas las tablas public de aplicación (idempotente).
-- Corrige alerta Supabase: "Table publicly accessible" / "RLS Disabled in Public".
--
-- Ejecutar en Supabase SQL Editor si la alerta ya está activa, o vía:
--   node apps/api/scripts/apply-schema.mjs --supabase --skip-storage
--
-- ENABLE no falla si ya estaba activo. El rol service_role / dueño de tabla
-- (URI de la API) ignora RLS; anon/authenticated quedan bloqueados sin políticas.
-- Políticas: 09_rls_tablas.sql + tablas/41_rls_*.sql + tablas/42_rls_sarlaft_pte.sql

ALTER TABLE IF EXISTS public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.permisos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reglas_viatico_interdepartamental ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parametros_sistema ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tarifas_trayecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.solicitudes_transporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.viajes_transporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registros_combustible ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registros_mantenimiento_vehiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.auditoria_viajes_eliminados ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.auditoria_solicitudes_eliminadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.auditoria_eventos_portal ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vacantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.entrevistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.empleados_nomina ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.liquidaciones_nomina ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ausencias_laborales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registros_cumplimiento_sst ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documentos_empleado ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carpetas_documento_empleado ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documentos_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carpetas_documento_empresa ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.perfiles_riesgo_sarlaft ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.terceros_sarlaft ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.alertas_sarlaft ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.revisiones_sarlaft ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notificaciones_estado_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.correos_salida ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prospectos_contacto_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contadores_secuencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.solicitudes_autorizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sesiones_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.preferencias_notificacion_usuario ENABLE ROW LEVEL SECURITY;
