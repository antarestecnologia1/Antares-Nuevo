# `modules/domain/`

Módulos ES de **dominio puro** (sin HTML del portal): reglas de negocio, normalización y utilidades compartidas entre el bloque de arranque en `index.html` y `portal-runtime.js`.

| Archivo | Rol |
|---------|-----|
| `public-site.i18n.js` | Traducción ES→EN del sitio público (`translatePublicText`, diccionario). Expuesto en `window` antes de `portal-runtime.js`. |
| `solicitudes.domain.js` | Solicitudes de transporte: normalización de filas, lectura/escritura, alcance y filtros. |
| `viajes.domain.js` | Viajes, agenda, flota, cierre/facturación; importa `solicitudes.domain.js`. |

**Lint:** `npm run lint:portal` (ESLint solo sobre esta carpeta).
