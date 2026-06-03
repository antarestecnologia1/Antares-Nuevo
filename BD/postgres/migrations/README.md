# Migraciones SQL — carpeta vacía (esquema unificado)

**Ya no hay scripts `.sql` aquí.** El esquema completo vive solo en:

| Orden | Ubicación |
|-------|-----------|
| 1 | `../01_extensions.sql` |
| 2 | `../02_enums.sql` |
| 3 | `../tablas/` — un archivo por tabla (`orden_ejecucion.txt`) |
| 4 | `../08_seed_tarifas_trayecto.sql` |
| 5 | Supabase | `../09_rls_tablas.sql`, `../10_rls_storage_supabase.sql` |

- **Instalación nueva:** `npm run db:init` o `npm run db:init:supabase`.
- **Base ya desplegada y desactualizada:** arrancar la API (`PortalService.onModuleInit`) aplica `ADD COLUMN IF NOT EXISTS` / índices idempotentes; o ejecutar a mano los `ALTER` que falten comparando con `tablas/*.sql`.

`npm run db:migrate` sigue existiendo por compatibilidad: si esta carpeta no tiene `.sql`, no aplica nada y solo verifica que existan las tablas esperadas.

Los antiguos `NN_*.sql` incrementales estaban duplicados respecto a `tablas/` y a la autocura en código; se eliminaron para una sola fuente de verdad SQL.
