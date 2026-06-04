# Vistas legacy del portal (`legacy-views/`)

HTML y helpers que vivían en `app.js` y se cargan **después** de `app.js` con `defer`, en el mismo orden global. Cada archivo termina con `registerLegacyPortalViews({ ... })` para fusionar en `AppLegacyViews`.

Orden (según producto):

| # | Módulo | Archivo |
|---|--------|---------|
| 1 | Dashboard | `../dashboard.js` |
| 2 | Mis solicitudes (helpers + listeners; HTML en `modules/portal/views/solicitudes.js`) | `../mis-solicitudes.js` |
| 3 | Viajes (HTML + `RENDER_WINDOW_SIZE` + listeners; stub en `modules/portal/views/transporte.js`) | `../viajes.js` |
| 4 | Camiones (HTML + listeners; stub en `modules/portal/views/transporte.js`) | `../camiones.js` |
| 5 | Conductores (HTML + listeners; stub en `modules/portal/views/transporte.js`) | `../conductores.js` |
| 6 | Calendario (HTML + listeners; stub en `modules/portal/views/transporte.js`) | `../calendario.js` |
| 7 | Historial | `07-historial-html.js` |
| 8 | Reportería | `08-reporteria-html.js` |
| 9 | Gestión humana | `09-gestion-humana-html.js` |
| 10 | Contratación | `10-contratacion-html.js` |
| 11 | Cumplimiento laboral y SST | `11-cumplimiento-laboral-sst-html.js` |
| 12 | Contacto web (B2B) | `12-contacto-b2b-html.js` |
| 13 | Usuarios y permisos | `13-usuarios-permisos-html.js` |
| 14 | Autorizaciones | `14-autorizaciones-html.js` |
| 15 | Mi perfil | `15-mi-perfil-html.js` |
| 16–18 | Notificaciones, avisos emergentes y timbre | `16-18-notificaciones-timbre-avisos-html.js` |

Los puntos 16–18 comparten una sola vista de bandeja (`notificationsHtml`); los toggles de avisos y timbre están en esa pantalla.

**Regenerar** los archivos legacy numerados (historial en adelante) a partir de `app.js` (solo si se vuelve a un monolito con los mismos rangos): `python tools/extract_legacy_views.py`
