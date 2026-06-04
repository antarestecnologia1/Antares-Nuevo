# `modules/app` — trozos del monolito `app.js`

Scripts **clásicos** (sin bundler) que comparten el mismo entorno global que `app.js`. El orden de carga está en `index.html`: utilidades (`portal-icons.js`, …) **antes** de `app.js`; módulos de vista del portal (`dashboard.js`, `viajes.js`, `mis-solicitudes.js`, `camiones.js`, `conductores.js`, `calendario.js`, `legacy-views/*`) **después** de `app.js`.

| Archivo | Contenido |
|---------|-----------|
| `portal-icons.js` | `const IC` — SVG embebidos para botones y tarjetas. |
| `portal-html-utils.js` | `escapeHtml`, `escapeAttr` — mitigación XSS en plantillas. |
| `dashboard.js` | Vista y listeners del dashboard; registra `AppLegacyViews.viewDashboard` y `__portalModuleAfterRender.dashboard`. |
| `viajes.js` | Vista `transportTripsHtml`, ventana de render (`RENDER_WINDOW_SIZE`, `renderWindowMoreBar`), auditorías eliminadas; `__portalModuleAfterRender["transport-trips"]`. |
| `mis-solicitudes.js` | `buildRequestCompanySelectHtml` (global para `solicitudes.js`), filtros/listado y formulario de nueva solicitud; `__portalModuleAfterRender.requests`. |
| `camiones.js` | Vista `vehiclesHtml` (combustible/taller vía helpers en `app.js`); `__portalModuleAfterRender["transport-vehicles"]`. |
| `conductores.js` | Vista `driversHtml`; `__portalModuleAfterRender["transport-drivers"]` (alta `form-driver` si existe en DOM). |
| `calendario.js` | Vista `transportCalendarHtml`; `__portalModuleAfterRender["transport-calendar"]`. |

Las vistas grandes del portal restantes están en **`legacy-views/`** (cadena tras `app.js`; ver `legacy-views/README.md`). El orden empieza en **07 (historial)**.

## Próximas extracciones (prioridad sugerida)

1. Constantes y conjuntos (`Set` / `Map`) sin referencia a `state` (p. ej. secciones de módulos, etiquetas de panel).
2. Funciones puras de dominio nómina/transporte que solo lean argumentos (mover junto con tests manuales: login + vista).
3. Bloque `let state` + `AntaresDataAccess` → `modules/app/portal-state.js` solo cuando el arranque (`init*`, `renderPortal`) esté acotado o reciba `state` por `window`.

Ver `docs/MODULARIZACION_PORTAL.md` para el plan completo del portal y vistas legacy.
