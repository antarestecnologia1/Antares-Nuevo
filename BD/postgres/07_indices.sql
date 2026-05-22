-- Índices globales (opcional si ya aplicó tablas/*.sql — cada tabla incluye sus índices).
-- Instalación nueva vía tablas/: este archivo es redundante salvo re-ejecución idempotente.

CREATE INDEX idx_usuarios_id_empresa ON usuarios (id_empresa);
CREATE INDEX idx_usuarios_correo_lower ON usuarios (lower(correo_electronico));
CREATE INDEX idx_usuarios_rol_estado ON usuarios (rol, estado_cuenta);

CREATE UNIQUE INDEX uq_usuarios_documento_personal
  ON usuarios (lower(trim(numero_identificacion)))
  WHERE numero_identificacion IS NOT NULL AND btrim(numero_identificacion) <> '';

CREATE UNIQUE INDEX uq_empresas_una_sola_propia
  ON empresas ((true))
  WHERE tipo_relacion_empresa = 'propia'::tipo_relacion_empresa;

CREATE INDEX idx_prospectos_contacto_b2b_fecha_creacion_desc
  ON prospectos_contacto_b2b (fecha_creacion DESC);

CREATE INDEX idx_prospectos_contacto_b2b_correo
  ON prospectos_contacto_b2b (correo_electronico);

CREATE INDEX idx_solicitudes_id_empresa_cliente ON solicitudes_transporte (id_empresa_cliente);
CREATE INDEX idx_solicitudes_id_usuario ON solicitudes_transporte (id_usuario_solicitante);
CREATE INDEX idx_solicitudes_estado ON solicitudes_transporte (estado);
CREATE INDEX idx_solicitudes_fecha_creacion ON solicitudes_transporte (fecha_creacion DESC);
CREATE INDEX idx_tarifas_trayecto_origen_destino ON tarifas_trayecto (departamento_origen, ciudad_origen, departamento_destino, ciudad_destino) WHERE activo = true;
CREATE INDEX idx_tarifas_trayecto_ruta ON tarifas_trayecto (departamento_origen, ciudad_origen, departamento_destino, ciudad_destino);

CREATE INDEX idx_viajes_id_vehiculo ON viajes_transporte (id_vehiculo);
CREATE INDEX idx_viajes_id_conductor ON viajes_transporte (id_conductor);
CREATE INDEX idx_viajes_transporte_recogida_programada ON viajes_transporte (fecha_hora_recogida_programada);
CREATE INDEX idx_viajes_transporte_entrega_programada ON viajes_transporte (fecha_hora_entrega_programada)
  WHERE fecha_hora_entrega_programada IS NOT NULL;

CREATE INDEX idx_solicitudes_transporte_cobertura_publica
  ON solicitudes_transporte (fecha_creacion DESC)
  WHERE estado NOT IN ('Rechazada'::estado_solicitud_transporte, 'Cancelada'::estado_solicitud_transporte);

CREATE INDEX idx_notificaciones_usuario_no_leida ON notificaciones (id_usuario, fecha_lectura) WHERE fecha_lectura IS NULL;

CREATE INDEX idx_autorizaciones_estado_fecha ON solicitudes_autorizacion (estado, fecha_solicitud DESC);

CREATE INDEX idx_empleados_id_empresa ON empleados_nomina (id_empresa);
CREATE INDEX idx_liquidaciones_periodo ON liquidaciones_nomina (periodo_mes);
CREATE INDEX idx_liquidaciones_pendiente_pago ON liquidaciones_nomina (liquidacion_pagada) WHERE liquidacion_pagada = false;

CREATE INDEX idx_candidatos_id_vacante ON candidatos (id_vacante);
CREATE INDEX idx_candidatos_etapa ON candidatos (etapa_proceso);

CREATE INDEX idx_combustible_conductor_fecha ON registros_combustible (id_conductor, fecha);
CREATE INDEX idx_combustible_vehiculo_fecha ON registros_combustible (id_vehiculo, fecha);
CREATE INDEX idx_combustible_usuario_registro ON registros_combustible (id_usuario_registro);
CREATE INDEX idx_mantenimiento_vehiculo_fecha ON registros_mantenimiento_vehiculo (id_vehiculo, fecha);
CREATE INDEX idx_mantenimiento_usuario_registro ON registros_mantenimiento_vehiculo (id_usuario_registro);

CREATE INDEX idx_aud_viajes_elim_en ON auditoria_viajes_eliminados (eliminado_en DESC);
CREATE INDEX idx_aud_sol_elim_en ON auditoria_solicitudes_eliminadas (eliminado_en DESC);

CREATE INDEX idx_ausencias_empleado ON ausencias_laborales (id_empleado);
CREATE INDEX idx_sst_empleado ON registros_cumplimiento_sst (id_empleado);
CREATE INDEX idx_sst_vencimiento ON registros_cumplimiento_sst (fecha_vencimiento_control);
