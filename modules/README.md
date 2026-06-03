# Módulos JavaScript del portal (estático)

Código cargado por `index.html` en el **sitio portal estático** (raíz del repo). No forma parte del bundle Next.js (`apps/web`), salvo que se importe explícitamente desde allí.

## Capas

| Carpeta | Contenido |
|---------|-----------|
| `core/` | Infraestructura: `persistence`, `api-client`, `portal-sync`, `portal-bootstrap-cache`, `portal-data-layer`, `validation`, `runtime-security`, `supabase-browser`, `feedback-messages`. |
| `auth/`, `users/`, `companies/`, … | Dominio: lectura/escritura vía `AntaresPersistence` + `AntaresPortalSync`. |
| `portal/` | Shell del portal: `architecture`, `application`, `core/` (router, renderer, access), **`views/`** (registro de `window.AppModules`). |
| `domain-bootstrap.js` | Orden de arranque de dominio. |

## Vistas por módulo UI

Los scripts en `portal/views/*.js` registran `window.AppModules.<id>` y delegan en `window.AppLegacyViews` (definido en `app.js`) donde aplica.

## App Next (`apps/web`)

La app en `apps/web/app/` es independiente (React/Next). Las vistas del portal clásico **no** viven bajo `apps/web/src/`.
