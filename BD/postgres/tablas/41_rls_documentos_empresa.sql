-- RLS para el gestor documental corporativo (tabla 41).
-- Corrige alerta Supabase: "RLS Disabled in Public" en documentos_empresa
-- y carpetas_documento_empresa.
-- Idempotente. service_role / dueño de tabla siguen sin RLS; la API no se ve afectada.
-- La segregación de perfiles por carpeta (roles_ver/roles_subir/roles_eliminar) la aplica
-- la API; estas políticas son la barrera de acceso directo por Supabase (fallback seguro).
-- Ejecutar en Supabase SQL Editor si la alerta ya está activa.

ALTER TABLE public.documentos_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carpetas_documento_empresa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS documentos_empresa_select ON public.documentos_empresa;
DROP POLICY IF EXISTS documentos_empresa_escritura ON public.documentos_empresa;
DROP POLICY IF EXISTS carpetas_documento_empresa_select ON public.carpetas_documento_empresa;
DROP POLICY IF EXISTS carpetas_documento_empresa_escritura ON public.carpetas_documento_empresa;

-- Lectura: equipo RRHH/administrativo, admin global, o misma empresa (documentos globales solo staff).
CREATE POLICY documentos_empresa_select
  ON public.documentos_empresa FOR SELECT TO authenticated
  USING (
    public.es_equipo_rrhh()
    OR public.es_administrador_global()
    OR (documentos_empresa.id_empresa IS NOT NULL AND public.misma_empresa_o_admin(documentos_empresa.id_empresa))
  );

-- Escritura: solo equipo RRHH/administrativo o admin global (la API refina por carpeta/rol).
CREATE POLICY documentos_empresa_escritura
  ON public.documentos_empresa FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY carpetas_documento_empresa_select
  ON public.carpetas_documento_empresa FOR SELECT TO authenticated
  USING (
    public.es_equipo_rrhh()
    OR public.es_administrador_global()
    OR (carpetas_documento_empresa.id_empresa IS NOT NULL AND public.misma_empresa_o_admin(carpetas_documento_empresa.id_empresa))
  );

-- Permisos de carpeta (roles_*) los asigna solo el administrador vía API; escritura directa
-- restringida a admin global para evitar cambios de permisos fuera de la aplicación.
CREATE POLICY carpetas_documento_empresa_escritura
  ON public.carpetas_documento_empresa FOR ALL TO authenticated
  USING (public.es_administrador_global())
  WITH CHECK (public.es_administrador_global());
