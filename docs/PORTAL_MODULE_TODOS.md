# Revision UI y to-dos del portal

Fecha: 2026-06-30

## Alcance revisado

- Modulos legacy del portal en `modules/app/*.js`.
- Mapa de vistas en `modules/portal/architecture.js`.
- Capa visual final en `styles/portal-responsive.css`.
- Validaciones estaticas: `npm run lint:portal` y `npm run test:qa-static`.

## Hallazgos corregidos

- `Historial`: `normalizeHistoryLayout()` no aceptaba `list`, por lo que el boton "Tabla" siempre volvia a linea de tiempo.
- UI transversal: se agrego una capa final de congruencia visual para espaciado, bordes, sombras, estados vacios, toolbars y modo oscuro en los studios principales.
- Cache CSS: `index.html` ahora carga `portal-responsive.css?v=20260630-module-ui-cohesion`.
- `Notificaciones / Timbre / Avisos`: el dominio ya tenia logica y columnas separadas (`sonidoNotificacionesHabilitadas`, `notificacionesHabilitadas`) y funciones `toggleNotificationSoundMuted` / `toggleNotificationAlertsEnabled`, pero la UI solo exponia un unico interruptor maestro que apagaba ambos a la vez (codigo muerto). Ahora la cabecera del modulo muestra dos controles independientes (Avisos y Timbre) tipo switch, con estado, iconos y modo oscuro congruentes. El Timbre se deshabilita cuando Avisos esta apagado (el sonido no puede sonar sin avisos).
- `Auditoria`: `scripts/audit-all-modules.mjs` corregido — el boton de Mi perfil es `[data-view="profile"]` (no `.side-link`), y Timbre/Avisos se validan ahora sobre los controles reales del modulo (`data-action="notif-toggle-sound|alerts"`). Resultado: 18/18 OK.
- Cache CSS: `index.html` ahora carga `notifications-module.css?v=20260630-ntf-pref-split`.

## To-dos por modulo

### Mis solicitudes

- Validar flujo cliente y admin: crear solicitud, filtrar por empresa, alternar tarjetas/lista y conservar foco de busqueda.
- Revisar estados vacios cuando no hay empresas o el cliente no tiene empresa asociada.
- Unificar copy de "Bandeja operativa" con el resto de modulos de transporte.

### Viajes

- Probar asignacion con solicitud pendiente, viaje activo, standby y viaje cerrado.
- Revisar botones destructivos y de auditoria para que siempre pidan motivo y muestren confirmacion clara.
- Evaluar paginacion/ventana de render en listas grandes con datos reales.

### Camiones

- Validar tarjetas y tabla con placas largas, VIN/motor ausentes, SOAT/tecnomecanica vencidos y vehiculos sin GPS.
- Probar permisos separados: consultar, registrar, editar, disponibilidad y eliminar.
- Mejorar microcopy de disponibilidad cuando hay cruces horarios con viajes.

### Conductores

- Validar licencias vencidas, seguridad social incompleta y comparendos.
- Probar disponibilidad con viajes simultaneos o proximos.
- Revisar acciones de estado para que el boton principal sea consistente con Camiones.

### Calendario

- Probar calendario por conductor, camion y modo automatico.
- Validar lectura de eventos pequenos en timeline y fallback cuando no hay programacion.
- Revisar scroll horizontal en dias con muchos recursos.

### Historial

- Confirmar manualmente el cambio entre "Linea de tiempo" y "Tabla".
- Agregar prueba estatica para `normalizeHistoryLayout("list")`.
- Revisar filtros por modulo/accion con auditorias reales y datos eliminados.

### Reporteria

- Probar permisos por reporte y visibilidad del catalogo para roles no admin.
- Validar exportacion PDF/Excel con filtros de periodo y modulo.
- Revisar estado de error cuando no cargan graficas BI.

### Gestion humana

- Probar alta/edicion de empleados, borrador de sesion y selects buscables.
- Validar liquidacion individual, masiva y pagos de conductores por viajes.
- Revisar alertas y filtros en listas grandes de empleados/liquidaciones.

### Contratacion

- Probar vacantes, cargos, candidatos, entrevistas y contratos.
- Validar adjuntos de hoja de vida: URL remota, storage key, data URL y archivo faltante.
- Reducir acoplamiento residual con helpers globales de `portal-runtime.js`.

### Cumplimiento laboral y SST

- Probar registros con vencimiento pasado, proximo y cumplido.
- Validar permisos de crear/editar/eliminar para roles RRHH/admin.
- Normalizar acentos en opciones visibles ("Afiliacion" -> "Afiliación", "Codigo" -> "Código") si no afecta datos persistidos.

### Contacto web (B2B)

- Probar bandeja con API activa, sin conexion y lista vacia.
- Agregar filtros por servicio/fecha cuando haya volumen de prospectos.
- Revisar contraste de chips y enlaces mail/tel en modo oscuro.

### Usuarios y permisos

- Probar altas pendientes, aprobacion, rechazo, reactivacion y permisos granulares.
- Revisar tarjetas con usuarios sin empresa, sin documento o con muchos permisos.
- Validar que el usuario actual no pueda degradarse accidentalmente sin confirmacion.

### Autorizaciones

- Probar colas por seccion: nuevas cuentas, solicitudes, flota, RRHH, pagos y miscelaneas.
- Revisar busqueda con payloads grandes para evitar textos demasiado extensos.
- Unificar encabezados de seccion con el patron visual de bandejas operativas.

### Mi perfil

- Probar subida de avatar, vista previa y guardado con datos parciales.
- Validar porcentaje de completitud con documento/NIT y contacto de emergencia.
- Revisar copy de privacidad y datos sensibles para usuarios cliente.

### Timbre

- Esta funcionalidad vive dentro de `Notificaciones` (cabecera del modulo). [Implementado]
- Control independiente tipo switch que solo afecta el sonido (`sonidoNotificacionesHabilitadas`).
- Se deshabilita visualmente cuando `Avisos` esta apagado (el timbre no suena sin avisos).
- Pendiente: probar persistencia de la preferencia tras recargar (POST /portal/notification-preferences) con API activa.

### Avisos

- Esta funcionalidad vive dentro de `Notificaciones` (cabecera del modulo). [Implementado]
- Control independiente que activa/desactiva las ventanas emergentes (`notificacionesHabilitadas`); la bandeja conserva el historial al apagarlo.
- Pendiente: probar avisos emergentes por categoria (solicitudes, autorizaciones, RRHH, sistema) y sus deep links con datos reales.

### Notificaciones

- [Hecho] Cabecera con controles independientes Avisos + Timbre (antes un unico interruptor maestro).
- Probar filtros, marcar una/todas como leidas, eliminar una/todas y deep links.
- Validar agrupacion por fecha y lectura en modo oscuro.
- Revisar desempeno con bandejas grandes y considerar ventana de render si crece el volumen.
