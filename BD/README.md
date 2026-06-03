# Base de datos — Antares (esquema de referencia en español)

Scripts SQL para PostgreSQL 15+ alineados con los módulos del portal. **Tablas y columnas en español** (sin tildes en identificadores SQL para compatibilidad).

## Esquema SQL (una sola capa)

| Qué | Ubicación | Uso |
|-----|-----------|-----|
| **Esquema completo** | `postgres/01_extensions.sql`, `02_enums.sql`, **`postgres/tablas/`** (un `.sql` por tabla), `08`–`10` | Instalación nueva o base vacía |

La carpeta `postgres/migrations/` ya **no** contiene `.sql`: el esquema canónico está solo en `tablas/` (y la API aplica `ALTER` idempotentes al arrancar sobre bases antiguas).

## Orden de ejecución — instalación nueva

1. `postgres/01_extensions.sql`
2. `postgres/02_enums.sql`
3. `postgres/tablas/` — **un `.sql` por tabla** (orden en `tablas/orden_ejecucion.txt` y `tablas/README.md`)
4. `postgres/08_seed_tarifas_trayecto.sql` — sin datos de prueba
5. `postgres/09_rls_tablas.sql` — RLS (Supabase)
6. `postgres/10_rls_storage_supabase.sql` — Storage (tras crear buckets en el panel)

### Comandos (raíz del monorepo)

| Comando | Cuándo |
|---------|--------|
| `npm run db:init` | Postgres vacío (Docker local, Render sin RLS) → `01`–`08` |
| `npm run db:init:supabase` | **Producción Supabase** (BD vacía) → `01`–`10` |
| `npm run db:migrate` | Compatibilidad: no hay `.sql` en `migrations/`; solo verifica tablas (usar autocura API o alinear a mano con `tablas/`) |
| `node apps/api/scripts/apply-schema.mjs --supabase --skip-storage` | RLS tablas sin Storage (buckets pendientes) |

La API (`PortalService.onModuleInit`) aplica ALTER idempotentes al arrancar si faltan columnas en un deploy sobre BD vieja.

## Bases ya existentes

Ver `postgres/migrations/README.md` (histórico / política).

**Manual de despliegue (Word):** `python BD/docs/generar_manual_antares.py` → `BD/docs/Manual_Despliegue_Supabase_Cloudflare.docx`

## Mapa módulo ↔ tablas ↔ `localStorage` (app.js)

En despliegue con Supabase, la base de datos es la fuente de verdad; `localStorage` en el cliente es caché y cola de sincronización cuando aplica el portal a la API.

**Arranque del portal:** con sesión JWT y URL de API configuradas, el cliente llama primero a `GET /api/portal/bootstrap` y vuelca ese resultado en las claves locales (sin re-enviar todo al servidor gracias al modo bootstrap del sync). Las escrituras posteriores siguen yendo a BD con `POST /api/portal/sync-key`.

| Módulo / área | Tabla(s) | Clave(s) `KEYS` |
|---------------|----------|-----------------|
| Empresas | `empresas` | `companies` |
| Usuarios y permisos | `usuarios`, `permisos_usuario` | `users` |
| Preferencias notificaciones | `preferencias_notificacion_usuario` | — |
| Viáticos interdepartamentales | `reglas_viatico_interdepartamental` | `travelAllowanceRules` |
| Parámetros legales (SMMLV, etc.) | `parametros_sistema` | — |
| Vehículos | `vehiculos` | `vehicles` |
| Conductores | `conductores` | `drivers` |
| Tarifas por trayecto | `tarifas_trayecto` | `tripRouteRates` |
| Solicitudes de viaje | `solicitudes_transporte` | `requests` |
| Viajes asignados | `viajes_transporte` | (objeto `trip` dentro de `requests`) |
| Combustible | `registros_combustible` | `fuelLogs` |
| Mantenimiento flota | `registros_mantenimiento_vehiculo` | `vehicleTechnicalLogs` |
| Cargos | `cargos` | `positions` |
| Vacantes | `vacantes` | `vacancies` |
| Candidatos | `candidatos` | `candidates` |
| Entrevistas | `entrevistas` | `interviews` |
| Contratos | `contratos` | `contracts` |
| Empleados nómina | `empleados_nomina` | `payrollEmployees` |
| Liquidaciones | `liquidaciones_nomina` | `payrollRuns` |
| Ausencias | `ausencias_laborales` | `hrAbsences` |
| SST / cumplimiento | `registros_cumplimiento_sst` | `sstCompliance` |
| Notificaciones | `notificaciones` | `notifications` |
| Correos (cola) | `correos_salida` | `emails` |
| Contacto B2B | `prospectos_contacto_b2b` | `contacts` |
| Contadores SOL/VJE | `contadores_secuencia` | `counters` |
| Autorizaciones | `solicitudes_autorizacion` | `approvals` |
| Sesión API (opcional) | `sesiones_usuario` | `session` |

## Formulario de registro ↔ columnas `usuarios`

| Campo HTML / JSON app | Columna SQL |
|----------------------|-------------|
| `firstName` … `secondLastName` | `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido` (y `nombre_completo` concatenado) |
| `personType` | `tipo_persona` |
| `documentType` | `tipo_documento` |
| `taxId` | `numero_identificacion` |
| `documentIssuedAt` | `fecha_expedicion_documento` |
| `birthDate` | `fecha_nacimiento` |
| `gender` | `genero` |
| `position` | `cargo_registro` |
| `workArea` | `area_trabajo` |
| `phone` | `telefono` |
| `department` / `city` / `address` | `departamento`, `ciudad`, `direccion` |
| `email` | `correo_electronico` |
| contraseña (hash) | `hash_contrasena` |
| `profileQualityChecklist` | `checklist_registro_json` |
| aceptación términos (`acceptedTermsAt`) | `fecha_aceptacion_terminos` |
| `registeredAt` | usar `fecha_creacion` (o columna dedicada si la API la añade) |

## Notas

- **Migración desde el prototipo**: los nombres JSON del front siguen en camelCase; al importar, mapear campo a columna española según este esquema.
- Función de trigger de ejemplo: `trg_marcar_fecha_actualizacion()` en `03_*`.

## Configuración con Supabase / Render / Vercel (bases ya creadas)

1. **PostgreSQL**: en el panel de Supabase → *Database* → copiar URI.
2. **API Nest (`apps/api`)**: `apps/api/.env` con `DATABASE_URL`. Esquema vía scripts numerados, no Prisma migrate.
3. **Portal estático**: `config/antares.public.js` con URL del backend.
4. **Variables Supabase**: service_role solo en servidor; anon en el navegador.

## Documentación de reglas

Ver `reglas_negocio.md`.

## Plantillas de correo Auth (Supabase)

Carpeta `email_templates/` y asuntos en `email_templates/plantilla_asuntos.txt`.

## Prueba de inserción REST

`node qa/supabase-rest-insert-test.mjs` (requiere `apps/api/.env` con Supabase).
