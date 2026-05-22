# Migraciones legacy (ALTER / datos)

**No ejecutar en instalación nueva.** El esquema completo está en los scripts de creación del directorio padre:

| Orden | Script | Contenido |
|-------|--------|-----------|
| 1 | `../01_extensions.sql` | Extensiones |
| 2 | `../02_enums.sql` | Tipos ENUM |
| 3 | `../03_nucleo_empresa_usuarios.sql` | Empresas, usuarios, permisos |
| 4 | `../04_transporte.sql` | Flota, solicitudes, viajes, auditoría eliminaciones |
| 5 | `../05_rrhh.sql` | RRHH y nómina (columnas actuales) |
| 6 | `../06_sistema.sql` | Notificaciones, B2B, preferencias |
| 7 | `../07_indices.sql` | Índices |
| 8 | `../08_seed_tarifas_trayecto.sql` | Documentación seed |
| 9 | `../09_rls_tablas.sql` | RLS tablas (Supabase) |
| 10 | `../10_rls_storage_supabase.sql` | RLS Storage |

## Cuándo usar esta carpeta

Solo si la base se creó **antes** de unificar el esquema y faltan columnas, tablas o índices. Los scripts son **idempotentes** (`IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`).

## Orden sugerido (bases existentes)

Ejecutar en el SQL Editor en este orden (omitir los que ya aplicaste):

1. `11_alter_usuarios_campos_registro.sql` … `23_liquidaciones_nomina_periodo_extendido.sql` (núcleo, RRHH, nómina)
2. `24_conductores_url_foto.sql` … `38_registros_flota_constraints.sql` (transporte e índices)
3. `09_tarifas_trayecto_clientes.sql` (si aplica)
4. `26_solicitudes_refrigeracion_termoking.sql` (incluye UPDATE de datos legacy en `tipo_servicio`)
5. `33_empleados_examen_ocupacional_intravehicular.sql`, `34_intravehicular_a_instruvial.sql` (renombres psicosensométrico → ocupacional)
6. `36_drop_prospectos_b2b_volumen_mensual.sql`, `37_drop_solicitudes_adjuntos_nombres.sql` (columnas obsoletas)

Parches puntuales: `ejecutar_solo_preferencias_notificacion_*.sql`.

## Mapa migración → ya incluido en CREATE

| Migración | Absorbido en |
|-----------|----------------|
| 11–16, 12–15 | `03_nucleo_empresa_usuarios.sql` |
| 17–20 empresas, 19 url | `03_nucleo` |
| 19 empleados condición, 20–23 liquidaciones, 31 vacantes | `05_rrhh.sql` |
| 24–27, 32, 25 auditoría, 37 sin adjuntos | `04_transporte.sql` |
| 28–29 preferencias | `06_sistema.sql` + `09_rls_tablas.sql` |
| 30, 35, 38, 09 tarifas, 13–14 índices | `07_indices.sql` |
| 33–34 exámenes | `04` + `05` (CREATE); 33–34 solo renombran columnas viejas |
