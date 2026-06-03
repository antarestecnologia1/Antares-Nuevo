# Un script por tabla (30 tablas + funciones)

Cada archivo define **CREATE TABLE**, comentarios e **índices** de esa tabla.

## Orden de ejecución

Ver `orden_ejecucion.txt` (respeta claves foráneas).

1. `../01_extensions.sql`
2. `../02_enums.sql`
3. `00_funciones.sql` … `30_auditoria_solicitudes_eliminadas.sql`
4. `../08_seed_tarifas_trayecto.sql`
5. Producción Supabase: `../09_rls_tablas.sql`, `../10_rls_storage_supabase.sql`

Automático: `npm run db:init` o `npm run db:init:supabase` (usa `apps/api/scripts/apply-schema.mjs`).

## Listado de tablas

| # | Archivo | Tabla |
|---|---------|--------|
| — | `00_funciones.sql` | Función `trg_marcar_fecha_actualizacion()` |
| 01 | `01_empresas.sql` | `empresas` |
| 02 | `02_parametros_sistema.sql` | `parametros_sistema` |
| 03 | `03_reglas_viatico_interdepartamental.sql` | `reglas_viatico_interdepartamental` |
| 04 | `04_cargos.sql` | `cargos` |
| 05 | `05_vehiculos.sql` | `vehiculos` |
| 06 | `06_usuarios.sql` | `usuarios` |
| 07 | `07_permisos_usuario.sql` | `permisos_usuario` |
| 08 | `08_conductores.sql` | `conductores` |
| 09 | `09_tarifas_trayecto.sql` | `tarifas_trayecto` |
| 10 | `10_vacantes.sql` | `vacantes` |
| 11 | `11_candidatos.sql` | `candidatos` |
| 12 | `12_entrevistas.sql` | `entrevistas` |
| 13 | `13_empleados_nomina.sql` | `empleados_nomina` |
| 14 | `14_contratos.sql` | `contratos` |
| 15 | `15_solicitudes_transporte.sql` | `solicitudes_transporte` |
| 16 | `16_viajes_transporte.sql` | `viajes_transporte` |
| 17 | `17_registros_combustible.sql` | `registros_combustible` |
| 18 | `18_registros_mantenimiento_vehiculo.sql` | `registros_mantenimiento_vehiculo` |
| 19 | `19_liquidaciones_nomina.sql` | `liquidaciones_nomina` |
| 20 | `20_ausencias_laborales.sql` | `ausencias_laborales` |
| 21 | `21_registros_cumplimiento_sst.sql` | `registros_cumplimiento_sst` |
| 22 | `22_notificaciones.sql` | `notificaciones` |
| 23 | `23_correos_salida.sql` | `correos_salida` |
| 24 | `24_prospectos_contacto_b2b.sql` | `prospectos_contacto_b2b` |
| 25 | `25_contadores_secuencia.sql` | `contadores_secuencia` |
| 26 | `26_solicitudes_autorizacion.sql` | `solicitudes_autorizacion` |
| 27 | `27_sesiones_usuario.sql` | `sesiones_usuario` |
| 28 | `28_preferencias_notificacion_usuario.sql` | `preferencias_notificacion_usuario` |
| 29 | `29_auditoria_viajes_eliminados.sql` | `auditoria_viajes_eliminados` |
| 30 | `30_auditoria_solicitudes_eliminadas.sql` | `auditoria_solicitudes_eliminadas` |

## Mantenimiento

Editar directamente el `.sql` de la tabla en esta carpeta. El despliegue (`npm run db:init`) lee `orden_ejecucion.txt`. No duplicar cambios en `../migrations/` (esa carpeta ya no contiene `.sql`; el esquema canónico es solo aquí + autocura en la API).
