-- Antares BD — Políticas RLS para Supabase Storage (objetos en buckets)
-- Prerrequisito: en Supabase → Storage crear buckets con estos nombres exactos (privados):
--   documentos_contratos
--   documentos_adjuntos
--   documentos_rrhh
-- Ajustar rutas sugeridas al subir archivos:
--   documentos_contratos/{id_usuario}/{nombre_archivo}
--   documentos_adjuntos/{id_usuario}/{nombre_archivo}
--   documentos_rrhh/{id_usuario}/{nombre_archivo}
-- La API con service_role puede omitir estas políticas; el cliente usa anon/authenticated.

-- Eliminar políticas previas homónimas si re-ejecutas el script (idempotencia parcial)
DROP POLICY IF EXISTS storage_documentos_contratos_select ON storage.objects;
DROP POLICY IF EXISTS storage_documentos_contratos_insert ON storage.objects;
DROP POLICY IF EXISTS storage_documentos_contratos_update ON storage.objects;
DROP POLICY IF EXISTS storage_documentos_contratos_delete ON storage.objects;

DROP POLICY IF EXISTS storage_documentos_adjuntos_select ON storage.objects;
DROP POLICY IF EXISTS storage_documentos_adjuntos_insert ON storage.objects;
DROP POLICY IF EXISTS storage_documentos_adjuntos_update ON storage.objects;
DROP POLICY IF EXISTS storage_documentos_adjuntos_delete ON storage.objects;

DROP POLICY IF EXISTS storage_documentos_rrhh_select ON storage.objects;
DROP POLICY IF EXISTS storage_documentos_rrhh_insert ON storage.objects;
DROP POLICY IF EXISTS storage_documentos_rrhh_update ON storage.objects;
DROP POLICY IF EXISTS storage_documentos_rrhh_delete ON storage.objects;

-- Contratos y documentos legales: RRHH y administración; carpeta por usuario
CREATE POLICY storage_documentos_contratos_select
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documentos_contratos'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

CREATE POLICY storage_documentos_contratos_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documentos_contratos'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

CREATE POLICY storage_documentos_contratos_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documentos_contratos'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

CREATE POLICY storage_documentos_contratos_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documentos_contratos'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

-- Adjuntos (solicitudes, etc.)
CREATE POLICY storage_documentos_adjuntos_select
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documentos_adjuntos'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

CREATE POLICY storage_documentos_adjuntos_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documentos_adjuntos'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

CREATE POLICY storage_documentos_adjuntos_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documentos_adjuntos'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

CREATE POLICY storage_documentos_adjuntos_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documentos_adjuntos'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

-- Documentación RRHH (cédulas, exámenes, etc.)
CREATE POLICY storage_documentos_rrhh_select
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documentos_rrhh'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

CREATE POLICY storage_documentos_rrhh_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documentos_rrhh'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

CREATE POLICY storage_documentos_rrhh_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documentos_rrhh'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

CREATE POLICY storage_documentos_rrhh_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documentos_rrhh'
    AND (
      public.es_administrador_global()
      OR public.es_equipo_rrhh()
      OR name LIKE (auth.uid()::text || '/%')
    )
  );

