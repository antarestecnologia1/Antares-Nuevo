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

## Notas

- **Migración desde el prototipo**: los nombres JSON del front siguen en camelCase; al importar, mapear campo a columna española según este esquema.
- Campos extra en BD respecto al JSON actual: p. ej. `liquidaciones_nomina.horas_extras_cop` guarda el desglose del formulario cuando la API persista `extras`/`aux`/`bonus` (hoy el front solo almacena totales agregados en `gross`).
- Función de trigger de ejemplo: `trg_marcar_fecha_actualizacion()` en `03_*`.

## Documentación de reglas

Ver `reglas_negocio.md`.
