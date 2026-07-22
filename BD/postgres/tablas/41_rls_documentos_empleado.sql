-- RLS para expediente documental RRHH (tablas 38/39).
-- Corrige alerta Supabase: "RLS Disabled in Public" en carpetas_documento_empleado
-- (y documentos_empleado, misma omisión).
-- Idempotente. service_role / dueño de tabla siguen sin RLS; la API no se ve afectada.
-- Ejecutar en Supabase SQL Editor si la alerta ya está activa.

ALTER TABLE public.documentos_empleado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carpetas_documento_empleado ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS documentos_empleado_select ON public.documentos_empleado;
DROP POLICY IF EXISTS documentos_empleado_escritura ON public.documentos_empleado;
DROP POLICY IF EXISTS carpetas_documento_empleado_select ON public.carpetas_documento_empleado;
DROP POLICY IF EXISTS carpetas_documento_empleado_escritura ON public.carpetas_documento_empleado;

-- Lectura: RRHH/admin o misma empresa del empleado
CREATE POLICY documentos_empleado_select
  ON public.documentos_empleado FOR SELECT TO authenticated
  USING (
    public.es_equipo_rrhh()
    OR public.es_administrador_global()
    OR EXISTS (
      SELECT 1
      FROM public.empleados_nomina e
      WHERE e.id = documentos_empleado.id_empleado
        AND public.misma_empresa_o_admin(e.id_empresa)
    )
  );

CREATE POLICY documentos_empleado_escritura
  ON public.documentos_empleado FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY carpetas_documento_empleado_select
  ON public.carpetas_documento_empleado FOR SELECT TO authenticated
  USING (
    public.es_equipo_rrhh()
    OR public.es_administrador_global()
    OR EXISTS (
      SELECT 1
      FROM public.empleados_nomina e
      WHERE e.id = carpetas_documento_empleado.id_empleado
        AND public.misma_empresa_o_admin(e.id_empresa)
    )
  );

CREATE POLICY carpetas_documento_empleado_escritura
  ON public.carpetas_documento_empleado FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());
