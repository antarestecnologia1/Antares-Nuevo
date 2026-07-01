# Manuales de usuario — Portal Transportes Antares S.A.S

Esta carpeta contiene el manual de usuario profesional del portal, dividido en un archivo Markdown por módulo, ilustrado con capturas de pantalla reales tomadas sobre el portal en ejecución (con datos de demostración).

## Cómo empezar

Comience por la **[Introducción general](./00-introduccion.md)**: explica cómo ingresar al portal, la estructura común de las pantallas, los roles disponibles y enlaza a todos los manuales de módulo.

## Índice de módulos

| # | Módulo | Manual |
|---|---|---|
| 0 | Introducción, acceso y navegación | [00-introduccion.md](./00-introduccion.md) |
| 1 | Dashboard | [01-dashboard.md](./01-dashboard.md) |
| 2 | Mis solicitudes | [02-solicitudes.md](./02-solicitudes.md) |
| 3 | Transporte · Viajes | [03-viajes.md](./03-viajes.md) |
| 4 | Transporte · Camiones | [04-camiones.md](./04-camiones.md) |
| 5 | Transporte · Conductores | [05-conductores.md](./05-conductores.md) |
| 6 | Transporte · Calendario | [06-calendario.md](./06-calendario.md) |
| 7 | Historial y trazabilidad | [07-historial.md](./07-historial.md) |
| 8 | Centro de reportería | [08-reporteria.md](./08-reporteria.md) |
| 9 | Gestión humana | [09-gestion-humana.md](./09-gestion-humana.md) |
| 10 | Contratación | [10-contratacion.md](./10-contratacion.md) |
| 11 | Cumplimiento laboral y SST | [11-cumplimiento-laboral.md](./11-cumplimiento-laboral.md) |
| 12 | Contacto web (B2B) | [12-contacto-b2b.md](./12-contacto-b2b.md) |
| 13 | Usuarios y permisos | [13-usuarios-permisos.md](./13-usuarios-permisos.md) |
| 14 | Centro de aprobaciones (Autorizaciones) | [14-autorizaciones.md](./14-autorizaciones.md) |
| 15 | Notificaciones | [15-notificaciones.md](./15-notificaciones.md) |
| 16 | Mi perfil | [16-mi-perfil.md](./16-mi-perfil.md) |

## Estructura de la carpeta

```
docs/manuales-usuario/
├── README.md                  (este índice)
├── 00-introduccion.md
├── 01-dashboard.md
├── ...
├── 16-mi-perfil.md
└── assets/
    ├── introduccion/
    ├── dashboard/
    ├── solicitudes/
    ├── viajes/
    ├── camiones/
    ├── conductores/
    ├── calendario/
    ├── historial/
    ├── reporteria/
    ├── gestion-humana/
    ├── contratacion/
    ├── cumplimiento-laboral/
    ├── contacto-b2b/
    ├── usuarios-permisos/
    ├── autorizaciones/
    ├── notificaciones/
    └── mi-perfil/
```

Cada subcarpeta de `assets/` contiene las capturas de pantalla numeradas que ilustran los pasos descritos en el manual correspondiente.

## Nota sobre las capturas

Las capturas se generaron con el script [`scripts/generate-manual-screenshots.mjs`](../../scripts/generate-manual-screenshots.mjs), que levanta el portal estático (`scripts/portal-static-server.mjs`), siembra datos de demostración en `localStorage` y navega automáticamente por cada módulo con Playwright. Los datos (empresas, usuarios, viajes, empleados, etc.) son ficticios y sirven únicamente para ilustrar la interfaz real del portal.

Para regenerar las capturas tras un cambio visual del portal:

```bash
node scripts/portal-static-server.mjs      # en una terminal
node scripts/generate-manual-screenshots.mjs   # en otra terminal
```

Puede limitar la regeneración a módulos puntuales con la variable de entorno `ONLY_SLUGS` (lista separada por comas con los nombres de carpeta de `assets/`), por ejemplo:

```bash
ONLY_SLUGS=dashboard,viajes node scripts/generate-manual-screenshots.mjs
```

## Documentos Word (.docx)

Los manuales también están disponibles en formato Word, con portada corporativa, estilos, tablas, listas e imágenes embebidas:

```
docs/manuales-usuario/word/
├── 00-introduccion.docx … 16-mi-perfil.docx   (un archivo por módulo)
├── Manual_Completo_Portal_Antares.docx        (todos los módulos en un solo documento)
└── Indice_Manuales.docx                       (índice general)
```

Para regenerarlos después de editar los `.md` o las capturas:

```bash
python docs/manuales-usuario/generar_manuales_word.py
```
