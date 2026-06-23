-- =============================================================================
-- INSERT manual en public.solicitudes_transporte
-- Uso: Supabase SQL Editor, pgAdmin o psql.
--
-- 1) Ejecute las consultas del PASO 0 para obtener UUID de usuario y empresa.
-- 2) Edite los valores en params (PASO 1).
-- 3) Ejecute BEGIN … COMMIT (PASO 2).
--
-- Reglas:
--   - id_usuario_solicitante debe existir en usuarios(id).
--   - id_empresa_cliente debe existir en empresas(id) o ser NULL.
--   - fecha_hora_entrega_estimada > fecha_hora_recogida.
--   - tipo_servicio: 'Transporte nacional' | 'Transporte entre sedes del cliente'.
--   - tipo_vehiculo_solicitado: 'Turbo' | 'Camión' | 'Tractomula' | 'Por definir'.
--   - Turbo/Camión: indique numero_fuelles (>= 0); peso_kg puede ser 0.
--   - Tractomula: peso_kg > 0; numero_fuelles = NULL.
--   - numero_solicitud se genera como SOL-###### (contador request).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PASO 0 — Descubrir UUIDs (ejecutar por separado)
-- -----------------------------------------------------------------------------

-- Usuarios solicitantes
-- SELECT id, correo_electronico, nombre_completo, id_empresa
-- FROM usuarios
-- ORDER BY fecha_creacion DESC NULLS LAST
-- LIMIT 30;

-- Empresas cliente
-- SELECT id, nombre, nit
-- FROM empresas
-- ORDER BY nombre
-- LIMIT 30;

-- Último número SOL usado
-- SELECT prefijo, ultimo_valor FROM contadores_secuencia WHERE prefijo = 'request';
-- SELECT numero_solicitud FROM solicitudes_transporte ORDER BY fecha_creacion DESC LIMIT 10;

-- -----------------------------------------------------------------------------
-- PASO 1 y 2 — Insertar solicitud (una transacción)
-- -----------------------------------------------------------------------------

BEGIN;

WITH bumped AS (
  INSERT INTO contadores_secuencia (prefijo, ultimo_valor)
  VALUES ('request', 1)
  ON CONFLICT (prefijo) DO UPDATE
  SET ultimo_valor = contadores_secuencia.ultimo_valor + 1
  RETURNING ultimo_valor
),
params AS (
  SELECT
    /* --- Identificadores (OBLIGATORIO: reemplace los UUID) --- */
    gen_random_uuid() AS id,
    '00000000-0000-0000-0000-000000000001'::uuid AS id_usuario_solicitante,
    '00000000-0000-0000-0000-000000000002'::uuid AS id_empresa_cliente,

    /* --- Cliente / solicitante (texto libre) --- */
    'EMPRESA EJEMPLO S.A.S.'::varchar(255) AS nombre_cliente,
    'JUAN PEREZ'::varchar(255) AS nombre_quien_solicita,

    /* --- Ruta --- */
    'CUNDINAMARCA'::varchar(120) AS departamento_origen,
    'BOGOTA D.C.'::varchar(120) AS ciudad_origen,
    'CALLE 100 # 15-20 BODEGA 3'::text AS direccion_origen,
    'ANTIOQUIA'::varchar(120) AS departamento_destino,
    'MEDELLIN'::varchar(120) AS ciudad_destino,
    'ZONA INDUSTRIAL BELLO PARCELA 12'::text AS direccion_destino,

    /* --- Fechas (Colombia UTC-5; ajuste a futuro) --- */
    timestamptz '2026-06-25 09:00:00-05' AS fecha_hora_recogida,
    timestamptz '2026-06-25 18:00:00-05' AS fecha_hora_entrega_estimada,

    /* --- Carga y vehículo --- */
    'Tractomula'::varchar(64) AS tipo_vehiculo_solicitado,
    'CARGA GENERAL PALLETS'::text AS descripcion_carga,
    'Transporte nacional'::varchar(80) AS tipo_servicio,
    false AS refrigeracion_termoking,
    0 AS numero_cajas,
    18000.00::numeric(14, 2) AS peso_kg,
    NULL::integer AS numero_fuelles,

    /* --- Contacto en sitio (OBLIGATORIO) --- */
    'MARIA LOPEZ'::varchar(255) AS nombre_contacto_en_sitio,
    '3001234567'::varchar(32) AS telefono_contacto_en_sitio,

    /* --- Opcionales --- */
    'SOLICITUD CARGADA MANUALMENTE EN SQL'::text AS observaciones,
    'Pendiente'::estado_solicitud_transporte AS estado,
    0::numeric(18, 2) AS valor_tarifa_viaje,
    NULL::numeric(18, 2) AS valor_asegurado,
    0::numeric(18, 2) AS total_cargos_standby,
    '[]'::jsonb AS eventos_standby_json,
    NULL::text AS motivo_rechazo,
    NULL::timestamptz AS fecha_aprobacion,
    NULL::varchar(255) AS aprobado_por,
    false AS aprobacion_automatica,
    NULL::timestamptz AS fecha_entrega_efectiva,
    NULL::timestamptz AS fecha_cierre,
    NULL::numeric(14, 2) AS distancia_km,

    /* Número legible SOL-###### */
    (SELECT 'SOL-' || lpad(b.ultimo_valor::text, 6, '0') FROM bumped b) AS numero_solicitud
)
INSERT INTO solicitudes_transporte (
  id,
  numero_solicitud,
  id_usuario_solicitante,
  id_empresa_cliente,
  nombre_cliente,
  nombre_quien_solicita,
  departamento_origen,
  ciudad_origen,
  direccion_origen,
  departamento_destino,
  ciudad_destino,
  direccion_destino,
  fecha_hora_recogida,
  fecha_hora_entrega_estimada,
  tipo_vehiculo_solicitado,
  descripcion_carga,
  tipo_servicio,
  refrigeracion_termoking,
  numero_cajas,
  peso_kg,
  numero_fuelles,
  nombre_contacto_en_sitio,
  telefono_contacto_en_sitio,
  observaciones,
  estado,
  valor_tarifa_viaje,
  valor_asegurado,
  total_cargos_standby,
  eventos_standby_json,
  motivo_rechazo,
  fecha_aprobacion,
  aprobado_por,
  aprobacion_automatica,
  fecha_entrega_efectiva,
  fecha_cierre,
  distancia_km
)
SELECT
  p.id,
  p.numero_solicitud,
  p.id_usuario_solicitante,
  p.id_empresa_cliente,
  p.nombre_cliente,
  p.nombre_quien_solicita,
  p.departamento_origen,
  p.ciudad_origen,
  p.direccion_origen,
  p.departamento_destino,
  p.ciudad_destino,
  p.direccion_destino,
  p.fecha_hora_recogida,
  p.fecha_hora_entrega_estimada,
  p.tipo_vehiculo_solicitado,
  p.descripcion_carga,
  p.tipo_servicio,
  p.refrigeracion_termoking,
  p.numero_cajas,
  p.peso_kg,
  p.numero_fuelles,
  p.nombre_contacto_en_sitio,
  p.telefono_contacto_en_sitio,
  p.observaciones,
  p.estado,
  p.valor_tarifa_viaje,
  p.valor_asegurado,
  p.total_cargos_standby,
  p.eventos_standby_json,
  p.motivo_rechazo,
  p.fecha_aprobacion,
  p.aprobado_por,
  p.aprobacion_automatica,
  p.fecha_entrega_efectiva,
  p.fecha_cierre,
  p.distancia_km
FROM params p
WHERE EXISTS (
  SELECT 1 FROM usuarios u WHERE u.id = p.id_usuario_solicitante
)
AND (
  p.id_empresa_cliente IS NULL
  OR EXISTS (SELECT 1 FROM empresas e WHERE e.id = p.id_empresa_cliente)
)
AND p.fecha_hora_entrega_estimada > p.fecha_hora_recogida
RETURNING id, numero_solicitud, estado, ciudad_origen, ciudad_destino, fecha_creacion;

COMMIT;

-- -----------------------------------------------------------------------------
-- PASO 3 — Verificar y refrescar portal (opcional)
-- -----------------------------------------------------------------------------

-- SELECT id, numero_solicitud, id_usuario_solicitante, id_empresa_cliente, estado,
--        fecha_hora_recogida, fecha_hora_entrega_estimada
-- FROM solicitudes_transporte
-- ORDER BY fecha_creacion DESC
-- LIMIT 5;

-- En el navegador (consola del portal, con sesión iniciada):
--   await clearPortalRequestsLocalAndResyncFromServer();
--
-- Si al crear desde el formulario aparece error de UUID: la caché del navegador tenía
-- solicitudes viejas (ids tipo req-1). El INSERT manual en SQL está bien; el portal debe
-- refrescar caché y solo sincronizar la fila nueva (no todo el array local).

-- =============================================================================
-- EJEMPLO Turbo con fuelles (sustituya params si usa este caso):
--   tipo_vehiculo_solicitado = 'Turbo'
--   peso_kg = 0
--   numero_fuelles = 2
--   refrigeracion_termoking = true   -- Termoking
-- =============================================================================
