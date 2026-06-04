# Modularización del portal (HTML + `app.js`)

## Objetivo

Reducir el monolito `app.js` (~40k líneas) moviendo **vistas y lógica por dominio** a `modules/`, sin romper el despliegue estático (sin bundler obligatorio para la raíz del sitio).

### Carpeta `modules/app/` (corte transversal)

Fragmentos de `app.js` sin dependencia de `state` al parsear, cargados **antes** de `app.js` en `index.html`:

- `portal-icons.js` — `const IC` (iconos SVG).
- `portal-html-utils.js` — `escapeHtml`, `escapeAttr`.

Convención: scripts globales encadenados con `defer` en el mismo orden que hoy; no usar `type="module"` en la raíz sin revisar CSP y dependencias.

Las **vistas HTML del portal** (orden 1–18): parte en `modules/app/*.js` post-`app.js` (`dashboard.js`, `viajes.js`, `mis-solicitudes.js`, `camiones.js`, `conductores.js`, `calendario.js`, …) y el resto en `modules/app/legacy-views/*.js`; ver `modules/app/legacy-views/README.md` y `tools/extract_legacy_views.py`.

Detalle y cola de trabajo: `modules/app/README.md`.

## Capas actuales (orden real en `index.html`)

1. **Core**: persistencia, API, validación, caché bootstrap, sync.
2. **Portal**: `modules/portal/architecture.js`, `access`, `router`, `renderer`, `application.js`.
3. **Vistas por carpeta**: `modules/portal/views/*.js` registran **`window.AppModules.<dominio>`**.
4. **Transición legacy**: `app.js` registra implementaciones en **`window.AppLegacyViews`** vía **`registerLegacyPortalViews`** (`modules/portal/legacy-views-bridge.js`). Las vistas del paso 3 reenvían a legacy hasta que el HTML se mueva al módulo.

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

## Runtime para vistas extraídas (`window.AntaresPortalRuntime`)

Para mover HTML generado fuera de `app.js` sin bundler, `app.js` asigna (justo antes del primer `registerLegacyPortalViews`) un objeto con las dependencias que la vista necesita (`read`, `KEYS`, `IC`, helpers de formulario, etc.). Los scripts en `modules/payroll/*-html.js` cargados **después** de `app.js` implementan la vista y llaman a `registerLegacyPortalViews({ ... })` para fusionar en `AppLegacyViews`.

**Hecho:** `modules/app/legacy-views/11-cumplimiento-laboral-sst-html.js` — vista «Cumplimiento laboral» (SST).

**Pendiente (mismo patrón):** `hiringHtml`, `payrollHtml` (mayor acoplamiento; ampliar `AntaresPortalRuntime` según uso).

## Mapa sugerido (fases)

| Fase | Área | Carpeta / archivo |
|------|------|-------------------|
| 0 | Puente legacy + docs | `legacy-views-bridge.js`, este documento |
| 0b | Iconos + escape HTML (desde `app.js`) | `modules/app/portal-icons.js`, `modules/app/portal-html-utils.js` |
| 1 | Nómina — sync empleados | `modules/payroll/portal-employee-list-sync.js` |
| 2 | Nómina — HTML y formularios | `modules/payroll/` o `modules/portal/views/rrhh-impl.js` |
| 2b | RRHH — cumplimiento laboral (SST) | `modules/app/legacy-views/11-cumplimiento-laboral-sst-html.js` + `AntaresPortalRuntime` |
| 3 | Transporte | `modules/portal/views/transporte-impl.js` (paralelo a `transporte.js`) |
| 4 | Solicitudes | ampliar `modules/portal/views/solicitudes.js` |
| 5 | Estado global mínimo | `window.AntaresPortalState` inyectado desde un solo módulo (opcional, largo plazo) |

## Referencias en código

- Fachada: `modules/portal/application.js` → `AntaresApp.layers`.
- Registro legacy: `registerLegacyPortalViews` en `modules/portal/legacy-views-bridge.js`.
- Rehidratación empleados: `window.PayrollEmployeeListSync.refreshFromApi` en `modules/payroll/portal-employee-list-sync.js`.
- Vista SST / cumplimiento laboral: `modules/app/legacy-views/11-cumplimiento-laboral-sst-html.js`.
