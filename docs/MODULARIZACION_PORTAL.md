# Modularización del portal (HTML + `app.js`)

## Objetivo

Reducir el monolito `app.js` (~40k líneas) moviendo **vistas y lógica por dominio** a `modules/`, sin romper el despliegue estático (sin bundler obligatorio para la raíz del sitio).

### Carpeta `modules/app/` (corte transversal)

Fragmentos de `app.js` sin dependencia de `state` al parsear, cargados **antes** de `app.js` en `index.html`:

- `portal-icons.js` — `const IC` (iconos SVG).
- `portal-html-utils.js` — `escapeHtml`, `escapeAttr`.

Convención: scripts globales encadenados con `defer` en el mismo orden que hoy; no usar `type="module"` en la raíz sin revisar CSP y dependencias.

Las **vistas HTML del portal** (orden 1–18): en `modules/app/*.js` post-`app.js` (`dashboard.js` … `notificaciones.js`). `modules/app/legacy-views/` puede usarse solo como salida de `tools/extract_legacy_views.py`; ver `modules/app/legacy-views/README.md`.

Detalle y cola de trabajo: `modules/app/README.md`.

## Capas actuales (orden real en `index.html`)

1. **Core**: persistencia, API, validación, caché bootstrap, sync.
2. **Portal**: `modules/portal/architecture.js`, `access`, `router`, `renderer`, `application.js`.
3. **Vistas por carpeta**: `modules/portal/views/*.js` registran **`window.AppModules.<dominio>`**.
4. **Transición legacy**: las vistas en `modules/app/*.js` fusionan HTML en **`window.AppLegacyViews`** vía **`registerLegacyPortalViews`** (`modules/portal/legacy-views-bridge.js`). El bridge importa y registra la barra de alcance de datos cliente (`modules/core/client-data-scope-ui.js`). Las fachadas `AppModules.*` reenvían a legacy.

## Patrón de migración (por módulo)

1. **Elegir dominio** (ej. nómina, transporte, solicitudes).
2. **Crear** `modules/portal/views/<dominio>-impl.js` o `modules/<dominio>/...` con funciones puras o con dependencias explícitas (`deps.read`, etc.) cuando sea posible.
3. **Sustituir** en `app.js` el cuerpo de las funciones exportadas a legacy por delegación fina o mover el bloque completo y dejar en `app.js` solo `registerLegacyPortalViews({ payrollHtml })` apuntando al módulo.
4. **Actualizar** `modules/portal/views/<vista>.js` para llamar al módulo en lugar de `AppLegacyViews`.
5. **Probar**: login, vista, F5, permisos (rol sin acceso no debe ver el módulo).

## Convenciones

- **No** duplicar constantes de `localStorage`: usar las mismas claves que `KEYS` en `app.js` o las expuestas en `AntaresPersistence`.
- **API**: preferir endpoints dedicados livianos (ej. lista de empleados) además del bootstrap cuando la caché pueda quedar desfasada.
- **Scripts nuevos**: insertar en `index.html` **antes** de `app.js` si solo definen `window.*` que se usan tras la carga; si necesitan funciones definidas en `app.js`, deben ir **después** o solo invocar `window.*` en tiempo de ejecución (evento / navegación).

## Runtime para vistas extraídas (sin `window.AntaresPortalRuntime`)

Las vistas en `modules/app/*.js` usan imports ES (`data-io`, `config`, `utils`, …) y, para helpers aún no extraídos de `portal-runtime.js`, referencias vía **`globalThis`** en tiempo de ejecución. **Ya no** se expone el objeto `window.AntaresPortalRuntime`.

**Hecho:** `modules/app/cumplimiento-laboral.js` — vista «Cumplimiento laboral» (SST). `modules/app/gestion-humana.js` — vista `payrollHtml` y listeners (`__portalModuleAfterRender.payroll`); adjuntos de candidatos en `modules/app/rrhh-candidate-attachments.js`. Contacto B2B, usuarios/permisos, autorizaciones, perfil y notificaciones viven en `contacto-b2b.js`, `usuarios-permisos.js`, `autorizaciones.js`, `mi-perfil.js`, `notificaciones.js`.

**Pendiente (mismo patrón):** reducir acoplamiento residual en `hiringHtml` / contratación si aún depende de helpers solo en `app.js`.

## Mapa sugerido (fases)

| Fase | Área | Carpeta / archivo |
|------|------|-------------------|
| 0 | Puente legacy + docs | `legacy-views-bridge.js`, este documento |
| 0b | Iconos + escape HTML (desde `app.js`) | `modules/app/portal-icons.js`, `modules/app/portal-html-utils.js` |
| 1 | Nómina — sync empleados | `modules/payroll/portal-employee-list-sync.js` |
| 2 | Nómina — HTML y formularios | `modules/app/gestion-humana.js` + `rrhh-candidate-attachments.js` (listeners `__portalModuleAfterRender.payroll`) |
| 2b | RRHH — cumplimiento laboral (SST) | `modules/app/cumplimiento-laboral.js` (imports + `globalThis` hacia runtime) |
| 3 | Transporte | `modules/portal/views/transporte-impl.js` (paralelo a `transporte.js`) |
| 4 | Solicitudes | ampliar `modules/portal/views/solicitudes.js` |
| 5 | Estado global mínimo | `window.AntaresPortalState` inyectado desde un solo módulo (opcional, largo plazo) |
| 7 | Dominio viajes / transporte | `modules/domain/viajes.domain.js` (carga en `index.html` antes de `portal-runtime.js`) |
| 8 | Dominio solicitudes | `modules/domain/solicitudes.domain.js` (antes de `viajes.domain.js` en el módulo de `index.html`) |
| 9 | Eventos + `app.js` mínimo | `modules/core/events.js`, `app.js`, orden con `portal-runtime.js` |
| 10 | i18n sitio público | `modules/domain/public-site.i18n.js` (diccionario ES→EN + `translatePublicText`; mismo bloque ES que dominios; **antes** de `portal-runtime.js`) |
| 11 | Contratos (dedupe en caché) | `modules/domain/contracts.domain.js` (`dedupContracts`, `purgeDuplicateContracts` al arranque) |
| 12 | Identificadores documento (nómina) | `modules/domain/payroll-identifiers.domain.js` |
| 13 | Catálogos CO + saneo empleado nómina | `modules/domain/payroll-catalog-sanitize.domain.js` |

## FASE 7 — Dominio viajes (`modules/domain/viajes.domain.js`)

- **Carga:** módulo ES en `index.html` **antes** de `modules/core/portal-runtime.js`; se asigna `window.AntaresViajesDomain` y se reexportan los símbolos en `window` para scripts clásicos y vistas (`getActiveTrips`, conflictos de agenda, etc.).
- **Responsabilidad:** estados persistidos (`VIAJES_STATUS`), ventanas horarias y solapes (`parseTripWindowRange`, `findActiveTripScheduleConflict`, …), ocupación de flota (`recalculateResourceAvailability`), cierre y factura (`buildTripInvoice`, `closeCompletedTripsAndGenerateInvoices`), permisos de edición con viaje (`canEditTransportRequestWithAssignedTrip`), caché de ocupación para la API `transport-schedule-busy`, autoaprobación delegada (`runPendingTransportAutoApprove`).
- **Fuente única:** constantes `REQUEST_EDIT_FINAL_STATUSES` / `REQUEST_EDIT_WITH_TRIP_PERMISSIONS` y helpers de fecha/ISO (`buildColombiaOffsetDateTime`, `requestPickupIsoForEdit`, `requestDeliveryIsoForEdit`, `requestSchedulingPickupIso`, `requestSchedulingDeliveryIso`) viven aquí; `portal-runtime.js` no los duplica.

## FASE 8 — Dominio solicitudes (`modules/domain/solicitudes.domain.js`)

- **Carga:** mismo bloque ES en `index.html` que el dominio viajes; **`solicitudes.domain.js` se importa antes que `viajes.domain.js`** (este último importa lectura/escritura de solicitudes desde aquí).
- **Responsabilidad:** normalización de filas portal (`normalizePortalTransportRequestRow`), tipo de camión requerido (`normalizeRequestRequiredTruckType`, `requestRequiredTruckTypeShowsFuelles`), lectura/escritura unificada (`reqRead`, `reqWrite`, `reqWriteAwait`, `readPortalTransportRequests`), búsqueda por id (`findTransportRequestById`), **alcance y filtros** (`transportRequestBelongsToUserScope`, `filterVisibleTransportRequests`, `filterPendingRequestsForTripAssignment`, `transportRequestEligibleForViajesAssignment`) con inyección de permisos globales desde el runtime.
- **Integración:** `modules/domain/viajes.domain.js` reutiliza `readPortalTransportRequests` / `reqWrite` / `reqWriteAwait`; `portal-runtime.js` delega alcance y filtros de asignación en `AntaresSolicitudesDomain` inyectando `getClientDataScope`, `canViewAllTransportRequests` y `canApproveTransportRequests`, y ya no duplica normalización de filas ni helpers de tipo de camión.

## FASE 9 — Eventos del portal y `app.js` mínimo

- **`modules/core/portal-runtime.js`**: script clásico `defer` con el cuerpo principal que antes vivía en la raíz `app.js` (helpers, vistas, dominio embebido, `window.*`).
- **`modules/core/events.js`**: módulo ES con `bindDynamicEvents` y los hooks post-render (`mountUniversalModuleFilters`, `bindExtendedViewEditHandlers`, delegación vehículo/solicitud/conductor, estándares de formulario Colombia, animaciones, selects admin/logo, catálogo de cargos). Registra `registerBindEventsCallback(bindDynamicEvents)` y expone en `window` las funciones que `router.js` sigue invocando vía `callApp(...)`.
- **`app.js`**: `type="module"` — importa `events.js` y ejecuta solo el arranque (init + `renderPortal` + bootstrap async).
- **`index.html`**: `portal-runtime.js` inmediatamente antes del `app.js` en módulo, para que existan las dependencias globales antes de registrar eventos.

## FASE 10 — i18n del sitio público (`modules/domain/public-site.i18n.js`)

- **Carga:** import en el `<script type="module">` de `index.html` junto a config/store/auth y dominios; `Object.assign(window, AntaresPublicI18n)` expone `translatePublicText`, `normalizePublicKey`, `PUBLIC_ES_EN_DICT`, etc., **antes** de `portal-runtime.js`.
- **Responsabilidad:** solo texto (sin DOM): normalización de claves, diccionario de frases, sustitución por frases/palabras. **`portal-runtime.js`** conserva `capturePublicTextNodes`, `PUBLIC_TEXT_OVERRIDES`, `applyPublicLanguage` y `tPublic` (usan `window.translatePublicText`).
- **Mantenimiento:** el diccionario y la lógica de sustitución viven solo en `public-site.i18n.js`; no duplicar en `portal-runtime.js`.

## FASE 11 — Contratos en caché (`modules/domain/contracts.domain.js`)

- **Carga:** import en el mismo bloque ES de `index.html`; `Object.assign(window, AntaresContractsDomain)` expone `contractDedupKey`, `dedupContracts`, `purgeDuplicateContracts`.
- **Arranque:** al inicio de `portal-runtime.js` se invoca `window.purgeDuplicateContracts()` (best-effort). `modules/app/contratacion.js` usa `window.dedupContracts` tras operaciones de contrato.

## FASE 12 — Identificadores de documento (nómina)

- **Carga:** import en el bloque ES de `index.html`; `Object.assign(window, AntaresPayrollIdentifiers)` expone `normalizeDocumentDigits` y `payrollEmployeeDocumentDedupKey` antes de `portal-runtime.js`.
- **Uso:** `portal-runtime.js` resuelve estos helpers vía `window` (script clásico sin `import`).

## FASE 13 — Catálogos CO y saneo de empleado (`modules/domain/payroll-catalog-sanitize.domain.js`)

- **Carga:** mismo bloque ES en `index.html` que los demás dominios; `Object.assign(window, AntaresPayrollCatalogSanitize)` expone `CO_CATALOGS`, `normalizeEmail`, `normalizeLatinForDb`, `normalizePortalPhoneForStorage`, `normalizeLatinUpperForDb`, `matchCatalogOptionValue`, `normalizeContractTemplateKind`, `sanitizePayrollEmployeeFieldsForPersist` **antes** de `portal-runtime.js`.
- **Uso:** selects de catálogo (`selectOptionsFromCatalog`, `editModalCatalogSelectOptions`), `formatPortalPhoneForDisplay` / `normalizePersonTypeForDb` y persistencia de empleados consumen estos símbolos vía `window`; el runtime no los duplica.

## Datos solo en cliente (no `sync-key`)

- `KEYS.moduleAuditLogs` (`antares_module_audit_logs_v1`), `KEYS.systemParameters`, `KEYS.deletedTransportTripLogs` / `KEYS.deletedTransportRequestLogs` (resumen en bootstrap; detalle vía GET dedicados), preferencias de UI, etc. **No** están en `AntaresPersistence.SERVER_BACKED_STORAGE_KEYS` ni en `STORAGE_TO_ENTITY` (`portal-sync.js`). El historial de trazabilidad en «Historial» se arma en cliente a partir de esas fuentes y de catálogos ya sincronizados; no usar `writeAwaitServer` para `moduleAuditLogs` (no hay entidad en `PORTAL_SYNC_KEYS` del API).

## Referencias en código

- Mapa **vista → permiso base del portal:** `export const VIEW_PERMISSIONS` en `modules/core/auth.js` (única fuente; expuesto en `window` con el bundle de auth). `canAccessView` aplica reglas especiales antes de usar ese mapa (`transport-vehicles`, `authorizations`, `requests`). El fallback `PortalArch` en `portal-runtime.js` usa `window.VIEW_PERMISSIONS` para `isKnownView` si no cargó `PortalArchitecture`.
- Fachada: `modules/portal/application.js` → `AntaresApp.layers`.
- Registro legacy: `registerLegacyPortalViews` en `modules/portal/legacy-views-bridge.js`.
- Rehidratación empleados: `window.PayrollEmployeeListSync.refreshFromApi` en `modules/payroll/portal-employee-list-sync.js`.
- Vista SST / cumplimiento laboral: `modules/app/cumplimiento-laboral.js`.

## FASE 14 — Notificaciones (bandeja + sidebar)

- **UI:** `modules/app/notificaciones.js` (studio `ntf-*`, filtros, agrupación por fecha).
- **Dominio:** `modules/domain/notificaciones.domain.js` (`resolveNotificationCategory`, `resolveNotificationDeepLink`, `bindNotificationSidebarPrefs`).
- **CSS:** `styles/notifications-module.css` (alcance `.notifications-studio` + `.sidebar-notif-group`).
- **Sidebar:** prefs Timbre/Avisos fuera del botón de bandeja (`index.html`); handler en dominio, no en `events.js`.

## FASE 15 — Dominios de soporte (vehículos, conductores, calendario, usuarios, autorizaciones, dashboard)

- **Archivos:** `modules/domain/{vehicles,drivers,calendar,users,authorizations,dashboard}.domain.js`.
- **Barrels:** `modules/{vehicles,drivers,trips,notifications,users,payroll}/index.js` delegan a dominios ES.
- **HTML partido:** `gestion-humana-html.js`, `contratacion-html.js`, `solicitudes-html.js` (listeners en archivos hermanos).
