# Modularización del portal (HTML + `app.js`)

## Objetivo

Reducir el monolito `app.js` (~40k líneas) moviendo **vistas y lógica por dominio** a `modules/`, sin romper el despliegue estático (sin bundler obligatorio para la raíz del sitio).

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

## Mapa sugerido (fases)

| Fase | Área | Carpeta / archivo |
|------|------|-------------------|
| 0 | Puente legacy + docs | `legacy-views-bridge.js`, este documento |
| 1 | Nómina — sync empleados | `modules/payroll/portal-employee-list-sync.js` |
| 2 | Nómina — HTML y formularios | `modules/payroll/` o `modules/portal/views/rrhh-impl.js` |
| 3 | Transporte | `modules/portal/views/transporte-impl.js` (paralelo a `transporte.js`) |
| 4 | Solicitudes | ampliar `modules/portal/views/solicitudes.js` |
| 5 | Estado global mínimo | `window.AntaresPortalState` inyectado desde un solo módulo (opcional, largo plazo) |

## Referencias en código

- Fachada: `modules/portal/application.js` → `AntaresApp.layers`.
- Registro legacy: `registerLegacyPortalViews` en `modules/portal/legacy-views-bridge.js`.
- Rehidratación empleados: `window.PayrollEmployeeListSync.refreshFromApi` en `modules/payroll/portal-employee-list-sync.js`.
