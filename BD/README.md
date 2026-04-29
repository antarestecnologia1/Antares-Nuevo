# Base de datos — Antares (esquema de referencia en español)

Scripts SQL para PostgreSQL 15+ alineados con los módulos del portal. **Tablas y columnas en español** (sin tildes en identificadores SQL para compatibilidad).

## Orden de ejecución

1. `postgres/01_extensions.sql`
2. `postgres/02_enums.sql` — `rol_usuario`, `estado_cuenta_usuario`, `estado_solicitud_transporte`, `estado_aprobacion`, `estado_vacante`
3. `postgres/03_nucleo_empresa_usuarios.sql`
4. `postgres/04_transporte.sql`
5. `postgres/05_rrhh.sql`
6. `postgres/06_sistema.sql`
7. `postgres/07_indices.sql`
8. *(Opcional)* `postgres/08_seed_tarifas_trayecto.sql` — datos demo de tarifas por trayecto
9. `postgres/09_rls_tablas.sql` — RLS (tablas públicas) para roles `anon` / `authenticated` de Supabase
10. `postgres/10_rls_storage_supabase.sql` — RLS de Storage (tras crear en el panel los buckets indicados en el script)
11. *(Solo bases ya creadas sin campos de registro)* `postgres/11_alter_usuarios_campos_registro.sql`

**Manual de despliegue (Word):** generar con `python BD/docs/generar_manual_antares.py` → `BD/docs/Manual_Despliegue_Supabase_Cloudflare.docx`

## Mapa módulo ↔ tablas ↔ `localStorage` (app.js)

| Módulo / área | Tabla(s) | Clave(s) `KEYS` |
|---------------|----------|-----------------|
| Empresas | `empresas` | `companies` |
| Usuarios y permisos | `usuarios`, `permisos_usuario` | `users` |
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
- Campos extra en BD respecto al JSON actual: p. ej. `liquidaciones_nomina.horas_extras_cop` guarda el desglose del formulario cuando la API persista `extras`/`aux`/`bonus` (hoy el front solo almacena totales agregados en `gross`).
- Función de trigger de ejemplo: `trg_marcar_fecha_actualizacion()` en `03_*`.

## Configuración con Supabase / Render / Vercel (bases ya creadas)

1. **PostgreSQL**: en el panel de Supabase → *Database* → copiar URI (directa o pooler según el cliente).
2. **API Nest (`apps/api`)**: crear `apps/api/.env` desde `apps/api/.env.example` y pegar `DATABASE_URL`. No ejecutar `prisma migrate` sobre la base donde ya corrieron los scripts de esta carpeta si pretende conservar solo el esquema español (ver comentario en `apps/api/prisma/schema.prisma`).
3. **Portal estático**: editar `config/antares.public.js` con la URL del backend (`window.__ANTARES_API_BASE__`, sin `/api`).
4. **Next opcional (`apps/web`)**: `NEXT_PUBLIC_API_URL` apuntando al mismo backend.
5. **Variables Supabase**: en `apps/api/.env` → `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (solo servidor). En el portal estático, completar `config/supabase.public.js` con URL del proyecto y **anon** (no usar service_role en el navegador). Tras filtrar claves, rotarlas en el panel de Supabase.

## Documentación de reglas

Ver `reglas_negocio.md`.

## Plantillas de correo Auth (Supabase)

Archivos listos para pegar en **Authentication → Email Templates**: carpeta `email_templates/` (`01_` … `06_`) y asuntos en `email_templates/plantilla_asuntos.txt`.

## Prueba de inserción REST

Desde la raíz del repo (requiere `apps/api/.env` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`):

`node qa/supabase-rest-insert-test.mjs`
