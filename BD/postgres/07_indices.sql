-- Índices (nombres en español) para consultas frecuentes del portal

CREATE INDEX idx_usuarios_id_empresa ON usuarios (id_empresa);
CREATE INDEX idx_usuarios_correo_lower ON usuarios (lower(correo_electronico));
CREATE INDEX idx_usuarios_rol_estado ON usuarios (rol, estado_cuenta);

CREATE INDEX idx_solicitudes_id_empresa_cliente ON solicitudes_transporte (id_empresa_cliente);
CREATE INDEX idx_solicitudes_id_usuario ON solicitudes_transporte (id_usuario_solicitante);
CREATE INDEX idx_solicitudes_estado ON solicitudes_transporte (estado);
CREATE INDEX idx_solicitudes_fecha_creacion ON solicitudes_transporte (fecha_creacion DESC);

CREATE INDEX idx_viajes_id_vehiculo ON viajes_transporte (id_vehiculo);
CREATE INDEX idx_viajes_id_conductor ON viajes_transporte (id_conductor);
CREATE INDEX idx_viajes_recogida ON viajes_transporte (fecha_hora_recogida_programada);

CREATE INDEX idx_notificaciones_usuario_no_leida ON notificaciones (id_usuario, fecha_lectura) WHERE fecha_lectura IS NULL;

CREATE INDEX idx_autorizaciones_estado_fecha ON solicitudes_autorizacion (estado, fecha_solicitud DESC);

CREATE INDEX idx_empleados_id_empresa ON empleados_nomina (id_empresa);
CREATE INDEX idx_liquidaciones_periodo ON liquidaciones_nomina (periodo_mes);
CREATE INDEX idx_liquidaciones_pendiente_pago ON liquidaciones_nomina (liquidacion_pagada) WHERE liquidacion_pagada = false;

CREATE INDEX idx_candidatos_id_vacante ON candidatos (id_vacante);
CREATE INDEX idx_candidatos_etapa ON candidatos (etapa_proceso);

CREATE INDEX idx_combustible_conductor_fecha ON registros_combustible (id_conductor, fecha);
CREATE INDEX idx_combustible_vehiculo_fecha ON registros_combustible (id_vehiculo, fecha);
CREATE INDEX idx_mantenimiento_vehiculo_fecha ON registros_mantenimiento_vehiculo (id_vehiculo, fecha);

CREATE INDEX idx_ausencias_empleado ON ausencias_laborales (id_empleado);
CREATE INDEX idx_sst_empleado ON registros_cumplimiento_sst (id_empleado);
CREATE INDEX idx_sst_vencimiento ON registros_cumplimiento_sst (fecha_vencimiento_control);
