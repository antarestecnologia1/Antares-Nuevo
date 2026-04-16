# Modulos front (fase 1)

Esta carpeta inicia la migracion del monolito `app.js` a una arquitectura por dominios.

## Estado actual

- Modulos conectados en `index.html`:
  - `dashboard/view.js`
  - `solicitudes/view.js`
  - `transporte/view.js`
  - `rrhh/view.js`
  - `usuarios/view.js`
  - `autorizaciones/view.js`
  - `perfil/view.js`
  - `notificaciones/view.js`
- `app.js` delega render a `window.AppModules.*` con fallback en `window.AppLegacyViews`.

## Siguiente fase recomendada

1. Extraer `events.js` por cada modulo (hoy siguen en `bindDynamicEvents`).
2. Extraer `service.js` por dominio (asignacion, nomina, validaciones).
3. Mantener `app.js` solo como orquestador/routing.

