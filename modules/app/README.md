# `modules/app` — trozos del monolito `app.js`

Scripts **clásicos** (sin bundler) que comparten el mismo entorno global que `app.js`. El orden de carga está en `index.html`: iconos (`portal-icons.js`) y el módulo `modules/core/utils.js` (inyectado en `window` junto con `config.js`) **antes** de `app.js`; módulos de vista del portal (`dashboard.js`, …, `notificaciones.js`) **después** de `app.js`. La traducción ES→EN del **sitio público** vive en `modules/domain/public-site.i18n.js` (módulo ES, antes de `portal-runtime.js`). La carpeta `legacy-views/` no se enlaza en `index.html`; solo la usa de forma opcional `tools/extract_legacy_views.py`.

| Archivo | Contenido |
|---------|-----------|
| `portal-icons.js` | `const IC` — SVG embebidos para botones y tarjetas. |
| `portal-html-utils.js` | *(Deprecado; ver `modules/core/utils.js`.)* Solo comentario de migración. |
| `dashboard.js` | Vista y listeners del dashboard; registra `AppLegacyViews.viewDashboard` y `__portalModuleAfterRender.dashboard`. |
| `viajes.js` | Vista `transportTripsHtml`, ventana de render (`RENDER_WINDOW_SIZE`, `renderWindowMoreBar`), auditorías eliminadas; `__portalModuleAfterRender["transport-trips"]`. |
| `mis-solicitudes.js` | `buildRequestCompanySelectHtml` (global para `solicitudes.js`), filtros/listado y formulario de nueva solicitud; `__portalModuleAfterRender.requests`. |
| `camiones.js` | Vista `vehiclesHtml` (combustible/taller vía helpers en `app.js`); `__portalModuleAfterRender["transport-vehicles"]`. |
| `conductores.js` | Vista `driversHtml`; `__portalModuleAfterRender["transport-drivers"]` (alta `form-driver` si existe en DOM). |
| `calendario.js` | Vista `transportCalendarHtml`; `__portalModuleAfterRender["transport-calendar"]`. |
| `historial.js` | Vista `historyHtml`; `__portalModuleAfterRender.history`. |
| `reporteria.js` | Vista `reportsHtml`; `bindReportsWorkspaceControls` vía `__portalModuleAfterRender.reports`. |
| `gestion-humana.js` | Vista `payrollHtml`, filtros/liquidaciones/export y modales Ver/Editar ausencias; `__portalModuleAfterRender.payroll`. |
| `rrhh-candidate-attachments.js` | `readCandidateHrAttachmentsFromInput` (CV inline para contratación; sin registro de vista). |
| `contratacion.js` | Vista `hiringHtml`, formularios y tabla (vacante/cargo/candidato/entrevista/contrato) + `parseCandidateAttachmentsForView`; `__portalModuleAfterRender.hiring`. |
| `cumplimiento-laboral.js` | HTML SST (`laborComplianceHtml`), formulario y tabla; `__portalModuleAfterRender["labor-compliance"]`. |
| `contacto-b2b.js` | Bandeja de prospectos web; `contactLeadsHtml` vía `registerLegacyPortalViews`. |
| `usuarios-permisos.js` | Administración de usuarios y permisos; `adminUsersHtml`. |
| `autorizaciones.js` | HTML de aprobaciones + pestañas; `__portalModuleAfterRender.authorizations`. |
| `mi-perfil.js` | Formulario de perfil; `__portalModuleAfterRender.profile`. |
| `notificaciones.js` | Bandeja, avisos y timbre (`notificationsHtml`); `__portalModuleAfterRender.notifications`. |

La carpeta **`legacy-views/`** solo sirve como destino opcional de `tools/extract_legacy_views.py` (copias numeradas); no forma parte de la cadena de carga del portal.

## Próximas extracciones (prioridad sugerida)

1. Constantes y conjuntos (`Set` / `Map`) sin referencia a `state` (p. ej. secciones de módulos, etiquetas de panel).
2. Funciones puras de dominio nómina/transporte que solo lean argumentos (mover junto con tests manuales: login + vista).
3. Bloque `let state` + `AntaresDataAccess` → `modules/app/portal-state.js` solo cuando el arranque (`init*`, `renderPortal`) esté acotado o reciba `state` por `window`.

Ver `docs/MODULARIZACION_PORTAL.md` para el plan completo del portal y vistas legacy.
