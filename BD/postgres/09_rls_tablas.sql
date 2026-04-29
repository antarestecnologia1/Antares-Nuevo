-- Antares BD — Row Level Security (RLS) para Supabase
-- Requisito: usuarios del portal con id = auth.users.id (mismo UUID) si se usa Supabase Auth.
-- El rol service_role de la API (Render) ignora RLS.
-- Ejecutar después de 01–07 (y 08 opcional).

-- ---------------------------------------------------------------------------
-- Funciones auxiliares (esquema public; search_path fijo por seguridad)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.id_empresa_usuario_actual()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id_empresa
  FROM public.usuarios u
  WHERE u.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.es_administrador_global()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios u
    WHERE u.id = auth.uid()
      AND u.rol::text IN ('admin', 'lider_administrativo')
  );
$$;

CREATE OR REPLACE FUNCTION public.es_equipo_rrhh()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios u
    WHERE u.id = auth.uid()
      AND u.rol::text IN (
        'admin',
        'lider_administrativo',
        'rrhh',
        'administracion',
        'auxiliar_administrativo'
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.misma_empresa_o_admin(p_id_empresa UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.es_administrador_global()
    OR (
      p_id_empresa IS NOT NULL
      AND p_id_empresa = public.id_empresa_usuario_actual()
    );
$$;

COMMENT ON FUNCTION public.id_empresa_usuario_actual() IS 'Empresa (UUID) del usuario autenticado en el portal.';
COMMENT ON FUNCTION public.es_administrador_global() IS 'Rol admin o lider_administrativo.';
COMMENT ON FUNCTION public.es_equipo_rrhh() IS 'Roles con acceso módulo RRHH/administración.';
COMMENT ON FUNCTION public.misma_empresa_o_admin(UUID) IS 'Misma empresa que el usuario o administrador global.';

-- ---------------------------------------------------------------------------
-- Habilitar RLS en todas las tablas de aplicación
-- ---------------------------------------------------------------------------
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reglas_viatico_interdepartamental ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parametros_sistema ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarifas_trayecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_transporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viajes_transporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_combustible ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_mantenimiento_vehiculo ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrevistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empleados_nomina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidaciones_nomina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ausencias_laborales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_cumplimiento_sst ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correos_salida ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospectos_contacto_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contadores_secuencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_autorizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_usuario ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- empresas
-- ---------------------------------------------------------------------------
CREATE POLICY empresas_select_portal
  ON public.empresas FOR SELECT TO authenticated
  USING (
    public.es_administrador_global()
    OR id = public.id_empresa_usuario_actual()
  );

CREATE POLICY empresas_insert_admin
  ON public.empresas FOR INSERT TO authenticated
  WITH CHECK (public.es_administrador_global());

CREATE POLICY empresas_update_admin
  ON public.empresas FOR UPDATE TO authenticated
  USING (public.es_administrador_global())
  WITH CHECK (public.es_administrador_global());

CREATE POLICY empresas_delete_admin
  ON public.empresas FOR DELETE TO authenticated
  USING (public.es_administrador_global());

-- ---------------------------------------------------------------------------
-- usuarios
-- ---------------------------------------------------------------------------
CREATE POLICY usuarios_select
  ON public.usuarios FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.es_administrador_global()
    OR (
      id_empresa IS NOT NULL
      AND id_empresa = public.id_empresa_usuario_actual()
      AND public.es_equipo_rrhh()
    )
  );

CREATE POLICY usuarios_insert_admin
  ON public.usuarios FOR INSERT TO authenticated
  WITH CHECK (public.es_administrador_global() OR public.es_equipo_rrhh());

CREATE POLICY usuarios_update
  ON public.usuarios FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR public.es_administrador_global()
    OR (
      id_empresa IS NOT NULL
      AND id_empresa = public.id_empresa_usuario_actual()
      AND public.es_equipo_rrhh()
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR public.es_administrador_global()
    OR (
      id_empresa IS NOT NULL
      AND id_empresa = public.id_empresa_usuario_actual()
      AND public.es_equipo_rrhh()
    )
  );

CREATE POLICY usuarios_delete_admin
  ON public.usuarios FOR DELETE TO authenticated
  USING (public.es_administrador_global());

-- ---------------------------------------------------------------------------
-- permisos_usuario
-- ---------------------------------------------------------------------------
CREATE POLICY permisos_select
  ON public.permisos_usuario FOR SELECT TO authenticated
  USING (
    id_usuario = auth.uid()
    OR public.es_administrador_global()
    OR public.es_equipo_rrhh()
  );

CREATE POLICY permisos_mantenimiento
  ON public.permisos_usuario FOR ALL TO authenticated
  USING (public.es_administrador_global() OR public.es_equipo_rrhh())
  WITH CHECK (public.es_administrador_global() OR public.es_equipo_rrhh());

-- ---------------------------------------------------------------------------
-- reglas_viatico y parametros_sistema (lectura amplia; escritura solo admin)
-- ---------------------------------------------------------------------------
CREATE POLICY reglas_viatico_select
  ON public.reglas_viatico_interdepartamental FOR SELECT TO authenticated
  USING (true);

CREATE POLICY reglas_viatico_admin
  ON public.reglas_viatico_interdepartamental FOR ALL TO authenticated
  USING (public.es_administrador_global())
  WITH CHECK (public.es_administrador_global());

CREATE POLICY parametros_select
  ON public.parametros_sistema FOR SELECT TO authenticated
  USING (true);

CREATE POLICY parametros_admin
  ON public.parametros_sistema FOR ALL TO authenticated
  USING (public.es_administrador_global())
  WITH CHECK (public.es_administrador_global());

-- ---------------------------------------------------------------------------
-- Transporte — flota global en esquema actual (sin id_empresa en vehículos)
-- ---------------------------------------------------------------------------
CREATE POLICY vehiculos_select_auth
  ON public.vehiculos FOR SELECT TO authenticated
  USING (true);

CREATE POLICY vehiculos_escritura_operaciones
  ON public.vehiculos FOR ALL TO authenticated
  USING (public.es_administrador_global() OR public.es_equipo_rrhh())
  WITH CHECK (public.es_administrador_global() OR public.es_equipo_rrhh());

CREATE POLICY conductores_select
  ON public.conductores FOR SELECT TO authenticated
  USING (
    public.es_administrador_global()
    OR public.es_equipo_rrhh()
    OR id_empresa IS NULL
    OR public.misma_empresa_o_admin(id_empresa)
  );

CREATE POLICY conductores_escritura
  ON public.conductores FOR ALL TO authenticated
  USING (public.es_administrador_global() OR public.es_equipo_rrhh())
  WITH CHECK (public.es_administrador_global() OR public.es_equipo_rrhh());

CREATE POLICY tarifas_select
  ON public.tarifas_trayecto FOR SELECT TO authenticated
  USING (true);

CREATE POLICY tarifas_escritura
  ON public.tarifas_trayecto FOR ALL TO authenticated
  USING (public.es_administrador_global() OR public.es_equipo_rrhh())
  WITH CHECK (public.es_administrador_global() OR public.es_equipo_rrhh());

-- solicitudes: solicitante, empresa cliente o administración
CREATE POLICY solicitudes_select
  ON public.solicitudes_transporte FOR SELECT TO authenticated
  USING (
    public.es_administrador_global()
    OR public.es_equipo_rrhh()
    OR id_usuario_solicitante = auth.uid()
    OR (
      id_empresa_cliente IS NOT NULL
      AND id_empresa_cliente = public.id_empresa_usuario_actual()
    )
  );

CREATE POLICY solicitudes_insert
  ON public.solicitudes_transporte FOR INSERT TO authenticated
  WITH CHECK (
    id_usuario_solicitante = auth.uid()
    OR public.es_administrador_global()
    OR public.es_equipo_rrhh()
  );

CREATE POLICY solicitudes_update
  ON public.solicitudes_transporte FOR UPDATE TO authenticated
  USING (
    public.es_administrador_global()
    OR public.es_equipo_rrhh()
    OR id_usuario_solicitante = auth.uid()
    OR (
      id_empresa_cliente IS NOT NULL
      AND id_empresa_cliente = public.id_empresa_usuario_actual()
    )
  )
  WITH CHECK (
    public.es_administrador_global()
    OR public.es_equipo_rrhh()
    OR id_usuario_solicitante = auth.uid()
  );

CREATE POLICY solicitudes_delete
  ON public.solicitudes_transporte FOR DELETE TO authenticated
  USING (public.es_administrador_global() OR public.es_equipo_rrhh());

-- viajes
CREATE POLICY viajes_select
  ON public.viajes_transporte FOR SELECT TO authenticated
  USING (
    public.es_administrador_global()
    OR public.es_equipo_rrhh()
    OR EXISTS (
      SELECT 1
      FROM public.solicitudes_transporte s
      WHERE s.id = viajes_transporte.id_solicitud
        AND (
          s.id_usuario_solicitante = auth.uid()
          OR (
            s.id_empresa_cliente IS NOT NULL
            AND s.id_empresa_cliente = public.id_empresa_usuario_actual()
          )
        )
    )
  );

CREATE POLICY viajes_escritura
  ON public.viajes_transporte FOR ALL TO authenticated
  USING (public.es_administrador_global() OR public.es_equipo_rrhh())
  WITH CHECK (public.es_administrador_global() OR public.es_equipo_rrhh());

CREATE POLICY combustible_select
  ON public.registros_combustible FOR SELECT TO authenticated
  USING (public.es_administrador_global() OR public.es_equipo_rrhh());

CREATE POLICY combustible_escritura
  ON public.registros_combustible FOR ALL TO authenticated
  USING (public.es_administrador_global() OR public.es_equipo_rrhh())
  WITH CHECK (public.es_administrador_global() OR public.es_equipo_rrhh());

CREATE POLICY mantenimiento_select
  ON public.registros_mantenimiento_vehiculo FOR SELECT TO authenticated
  USING (public.es_administrador_global() OR public.es_equipo_rrhh());

CREATE POLICY mantenimiento_escritura
  ON public.registros_mantenimiento_vehiculo FOR ALL TO authenticated
  USING (public.es_administrador_global() OR public.es_equipo_rrhh())
  WITH CHECK (public.es_administrador_global() OR public.es_equipo_rrhh());

-- ---------------------------------------------------------------------------
-- RRHH
-- ---------------------------------------------------------------------------
CREATE POLICY cargos_todos_rrhh
  ON public.cargos FOR SELECT TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY cargos_escritura
  ON public.cargos FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY vacantes_todos_rrhh
  ON public.vacantes FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY candidatos_todos_rrhh
  ON public.candidatos FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY entrevistas_todos_rrhh
  ON public.entrevistas FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY contratos_todos_rrhh
  ON public.contratos FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY empleados_select
  ON public.empleados_nomina FOR SELECT TO authenticated
  USING (
    public.es_equipo_rrhh()
    OR public.es_administrador_global()
    OR public.misma_empresa_o_admin(id_empresa)
  );

CREATE POLICY empleados_escritura
  ON public.empleados_nomina FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY liquidaciones_select
  ON public.liquidaciones_nomina FOR SELECT TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY liquidaciones_escritura
  ON public.liquidaciones_nomina FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY ausencias_select
  ON public.ausencias_laborales FOR SELECT TO authenticated
  USING (
    public.es_equipo_rrhh()
    OR public.es_administrador_global()
    OR EXISTS (
      SELECT 1
      FROM public.empleados_nomina e
      WHERE e.id = ausencias_laborales.id_empleado
        AND public.misma_empresa_o_admin(e.id_empresa)
    )
  );

CREATE POLICY ausencias_escritura
  ON public.ausencias_laborales FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY sst_select
  ON public.registros_cumplimiento_sst FOR SELECT TO authenticated
  USING (
    public.es_equipo_rrhh()
    OR public.es_administrador_global()
    OR EXISTS (
      SELECT 1
      FROM public.empleados_nomina e
      WHERE e.id = registros_cumplimiento_sst.id_empleado
        AND public.misma_empresa_o_admin(e.id_empresa)
    )
  );

CREATE POLICY sst_escritura
  ON public.registros_cumplimiento_sst FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

-- ---------------------------------------------------------------------------
-- Sistema
-- ---------------------------------------------------------------------------
CREATE POLICY notificaciones_propias
  ON public.notificaciones FOR ALL TO authenticated
  USING (id_usuario = auth.uid())
  WITH CHECK (id_usuario = auth.uid());

CREATE POLICY correos_admin
  ON public.correos_salida FOR ALL TO authenticated
  USING (public.es_administrador_global())
  WITH CHECK (public.es_administrador_global());

-- Formulario B2B público: insertar sin sesión
CREATE POLICY prospectos_insert_anon
  ON public.prospectos_contacto_b2b FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY prospectos_select_autenticados
  ON public.prospectos_contacto_b2b FOR SELECT TO authenticated
  USING (public.es_administrador_global() OR public.es_equipo_rrhh());

CREATE POLICY contadores_admin
  ON public.contadores_secuencia FOR ALL TO authenticated
  USING (public.es_administrador_global())
  WITH CHECK (public.es_administrador_global());

CREATE POLICY autorizaciones_select
  ON public.solicitudes_autorizacion FOR SELECT TO authenticated
  USING (
    public.es_administrador_global()
    OR public.es_equipo_rrhh()
    OR id_usuario_solicitante = auth.uid()
  );

CREATE POLICY autorizaciones_insert
  ON public.solicitudes_autorizacion FOR INSERT TO authenticated
  WITH CHECK (
    id_usuario_solicitante = auth.uid()
    OR public.es_administrador_global()
  );

CREATE POLICY autorizaciones_update
  ON public.solicitudes_autorizacion FOR UPDATE TO authenticated
  USING (
    public.es_administrador_global()
    OR public.es_equipo_rrhh()
    OR id_usuario_solicitante = auth.uid()
  )
  WITH CHECK (
    public.es_administrador_global()
    OR public.es_equipo_rrhh()
    OR id_usuario_solicitante = auth.uid()
  );

CREATE POLICY sesiones_propias
  ON public.sesiones_usuario FOR ALL TO authenticated
  USING (id_usuario = auth.uid() OR public.es_administrador_global())
  WITH CHECK (id_usuario = auth.uid() OR public.es_administrador_global());
