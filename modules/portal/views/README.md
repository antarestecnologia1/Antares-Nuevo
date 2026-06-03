# Vistas del portal (`window.AppModules`)

Cada archivo es un IIFE que registra entradas en `window.AppModules` usadas por `modules/portal/application.js` y `app.js`.

| Archivo | `AppModules` |
|---------|----------------|
| `dashboard.js` | `dashboard` |
| `solicitudes.js` | `solicitudes` |
| `transporte.js` | `transporte` |
| `rrhh.js` | `rrhh` |
| `usuarios.js` | `usuarios` |
| `autorizaciones.js` | `autorizaciones` |
| `perfil.js` | `perfil` |
| `notificaciones.js` | `notificaciones` |
| `contacto-b2b.js` | `contacto-b2b` |

Orden de carga: ver comentario en `index.html` (después de `core/` y antes de `modules/auth`…).
