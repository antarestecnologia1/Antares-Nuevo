# `modules/domain/`

Módulos ES de **dominio puro** (sin HTML del portal): reglas de negocio, normalización y utilidades compartidas entre el bloque de arranque en `index.html` y `portal-runtime.js`.

| Archivo | Rol |
|---------|-----|
| `payroll-identifiers.domain.js` | `normalizeDocumentDigits`, `payrollEmployeeDocumentDedupKey` (nómina / documentos). |
| `payroll-catalog-sanitize.domain.js` | `CO_CATALOGS`, normalización de texto/teléfono/email, coincidencia de catálogo, plantilla de contrato, `sanitizePayrollEmployeeFieldsForPersist`. |
| `contracts.domain.js` | Dedupe de contratos en caché (`contractDedupKey`, `dedupContracts`, `purgeDuplicateContracts` al arranque). |
| `public-site.i18n.js` | Traducción ES→EN del sitio público (`translatePublicText`, diccionario). Expuesto en `window` antes de `portal-runtime.js`. |
| `solicitudes.domain.js` | Solicitudes de transporte: normalización de filas, lectura/escritura, alcance y filtros. |
| `viajes.domain.js` | Viajes, agenda, flota, cierre/facturación; importa `solicitudes.domain.js`. |

**Lint:** `npm run lint:portal` — ESLint 8 (`.eslintrc.cjs` en la raíz), alcance `modules/domain/**` (no incluye `portal-runtime.js`).
