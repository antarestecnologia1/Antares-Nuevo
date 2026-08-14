-- RLS para SARLAFT / PTE (tabla 42).
-- Idempotente. service_role / dueño de tabla siguen sin RLS; la API no se ve afectada.

ALTER TABLE public.perfiles_riesgo_sarlaft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terceros_sarlaft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_sarlaft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisiones_sarlaft ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS perfiles_riesgo_sarlaft_select ON public.perfiles_riesgo_sarlaft;
DROP POLICY IF EXISTS perfiles_riesgo_sarlaft_escritura ON public.perfiles_riesgo_sarlaft;
DROP POLICY IF EXISTS terceros_sarlaft_select ON public.terceros_sarlaft;
DROP POLICY IF EXISTS terceros_sarlaft_escritura ON public.terceros_sarlaft;
DROP POLICY IF EXISTS alertas_sarlaft_select ON public.alertas_sarlaft;
DROP POLICY IF EXISTS alertas_sarlaft_escritura ON public.alertas_sarlaft;
DROP POLICY IF EXISTS revisiones_sarlaft_select ON public.revisiones_sarlaft;
DROP POLICY IF EXISTS revisiones_sarlaft_escritura ON public.revisiones_sarlaft;

CREATE POLICY perfiles_riesgo_sarlaft_select
  ON public.perfiles_riesgo_sarlaft FOR SELECT TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY perfiles_riesgo_sarlaft_escritura
  ON public.perfiles_riesgo_sarlaft FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY terceros_sarlaft_select
  ON public.terceros_sarlaft FOR SELECT TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY terceros_sarlaft_escritura
  ON public.terceros_sarlaft FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY alertas_sarlaft_select
  ON public.alertas_sarlaft FOR SELECT TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY alertas_sarlaft_escritura
  ON public.alertas_sarlaft FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY revisiones_sarlaft_select
  ON public.revisiones_sarlaft FOR SELECT TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global());

CREATE POLICY revisiones_sarlaft_escritura
  ON public.revisiones_sarlaft FOR ALL TO authenticated
  USING (public.es_equipo_rrhh() OR public.es_administrador_global())
  WITH CHECK (public.es_equipo_rrhh() OR public.es_administrador_global());
