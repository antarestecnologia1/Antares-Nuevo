# Vistas legacy del portal (`legacy-views/`)

HTML y helpers que vivieron en `app.js`. La carga en producción usa los módulos en `modules/app/*.js` (ver tabla). Esta carpeta puede quedar **vacía** en el repo: solo contiene este README salvo que ejecutes `python tools/extract_legacy_views.py`, que vuelve a escribir aquí copias numeradas (`11-*.js` … `16-18-*.js`) si el monolito `app.js` sigue teniendo los rangos configurados en el script.

Orden (según producto):

| # | Módulo | Archivo |
|---|--------|---------|
| 1 | Dashboard | `../dashboard.js` |
| 2 | Mis solicitudes (helpers + listeners; HTML en `modules/portal/views/solicitudes.js`) | `../mis-solicitudes.js` |
| 3 | Viajes (HTML + `RENDER_WINDOW_SIZE` + listeners; stub en `modules/portal/views/transporte.js`) | `../viajes.js` |
| 4 | Camiones (HTML + listeners; stub en `modules/portal/views/transporte.js`) | `../camiones.js` |
| 5 | Conductores (HTML + listeners; stub en `modules/portal/views/transporte.js`) | `../conductores.js` |
| 6 | Calendario (HTML + listeners; stub en `modules/portal/views/transporte.js`) | `../calendario.js` |
| 7 | Historial (HTML + listeners; stub en `modules/portal/views/transporte.js`) | `../historial.js` |
| 8 | Reportería (HTML + listeners; stub en `modules/portal/views/transporte.js`) | `../reporteria.js` |
| 9 | Gestión humana / nómina | `../gestion-humana.js` + `../rrhh-candidate-attachments.js` |
| 10 | Contratación | `../contratacion.js` |
| 11 | Cumplimiento laboral y SST | `../cumplimiento-laboral.js` |
| 12 | Contacto web (B2B) | `../contacto-b2b.js` |
| 13 | Usuarios y permisos | `../usuarios-permisos.js` |
| 14 | Autorizaciones | `../autorizaciones.js` |
| 15 | Mi perfil | `../mi-perfil.js` |
| 16–18 | Notificaciones, avisos emergentes y timbre | `../notificaciones.js` |

Los puntos 16–18 comparten una sola vista de bandeja (`notificationsHtml`); los toggles de avisos y timbre están en esa pantalla.

**Regenerar** copias en esta carpeta a partir de `app.js` (rangos en `tools/extract_legacy_views.py`; solo si el monolito vuelve a contener esos bloques): `python tools/extract_legacy_views.py`
