# Vistas del portal (`window.AppModules`)

Cada archivo es un IIFE que registra entradas en `window.AppModules` usadas por `modules/portal/application.js` y `app.js`.

| Archivo | `AppModules` |
|---------|----------------|
| `../../app/dashboard.js` (carga tras `app.js`) | `dashboard` |
| `../../app/viajes.js` (carga tras `app.js`; HTML en `AppLegacyViews`) | (vía `transporte` → `transportTripsHtml`) |
| `../../app/camiones.js` (carga tras `app.js`; HTML en `AppLegacyViews`) | (vía `transporte` → `vehiclesHtml`) |
| `../../app/conductores.js` (carga tras `app.js`; HTML en `AppLegacyViews`) | (vía `transporte` → `driversHtml`) |
| `../../app/calendario.js` (carga tras `app.js`; HTML en `AppLegacyViews`) | (vía `transporte` → `transportCalendarHtml`) |
| `../../app/historial.js` (carga tras `app.js`; HTML en `AppLegacyViews`) | (vía `transporte` → `historyHtml`) |
| `../../app/reporteria.js` (carga tras `app.js`; HTML en `AppLegacyViews`) | (vía `transporte` → `reportsHtml`) |
| `../../app/mis-solicitudes.js` (carga tras `app.js`) | (vía `solicitudes` + hooks) |
| `transporte.js` | `transporte` |
| `rrhh.js` | `rrhh` |
| `usuarios.js` | `usuarios` |
| `autorizaciones.js` | `autorizaciones` |
| `perfil.js` | `perfil` |
| `notificaciones.js` | `notificaciones` |
| `contacto-b2b.js` | `contacto-b2b` |

Orden de carga: ver comentario en `index.html` (después de `core/` y antes de `modules/auth`…).
