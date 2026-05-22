# Migraciones legacy (ALTER / datos)

**No ejecutar en instalación nueva.** El esquema completo está en:

| Orden | Script | Contenido |
|-------|--------|-----------|
| 1 | `../01_extensions.sql` | Extensiones |
| 2 | `../02_enums.sql` | Tipos ENUM |
| 3 | `../tablas/` | 30 tablas (`orden_ejecucion.txt`) |
| 4 | `../08_seed_tarifas_trayecto.sql` | Documentación seed |
| 5 | `../09_rls_tablas.sql` | RLS tablas (Supabase) |
| 6 | `../10_rls_storage_supabase.sql` | RLS Storage |

Automático: `npm run db:init` o `npm run db:init:supabase`.

## Cuándo usar esta carpeta

Solo si la base se creó **antes** de unificar el esquema y faltan columnas. Scripts idempotentes (`IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`).

## Orden sugerido (bases existentes)

Ejecutar en el SQL Editor los que aún no aplicó (omitir los ya corridos):

1. `11` … `23` — núcleo, RRHH, nómina  
2. `24` … `38` — transporte, preferencias, índices  
3. `09_tarifas_trayecto_clientes.sql` si aplica  
4. `26_solicitudes_refrigeracion_termoking.sql` (incluye UPDATE legacy en `tipo_servicio`)  
5. `33`, `34` — renombre psicosensométrico → ocupacional  
6. `36`, `37` — columnas obsoletas

## Mapa migración → ya en `tablas/`

| Migración | Absorbido en |
|-----------|----------------|
| 11–16, 12–15 | `tablas/06_usuarios.sql`, `07_permisos_usuario.sql`, … |
| 17–20 empresas | `tablas/01_empresas.sql` |
| 19 empleados, 20–23 liquidaciones | `tablas/13_empleados_nomina.sql`, `19_liquidaciones_nomina.sql` |
| 24–27, 32, 25 auditoría | `tablas/` transporte |
| 28–29 preferencias | `tablas/28_preferencias_notificacion_usuario.sql` |
| 30, 35, 38, 09 tarifas | índices en cada `tablas/*.sql` |
