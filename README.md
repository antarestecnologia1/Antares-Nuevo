# Antares — Monorepo

## Contenido

- **`index.html`**, **`app.js`**, **`styles.css`**, **`modules/`**: portal y sitio público (stack principal operativo).
- **`apps/api`**: API NestJS, PostgreSQL vía `pg`, JWT, Supabase (Auth/archivos según `.env`).
- **`apps/web`**: aplicación Next.js (login de demostración / despliegue opcional).
- **`BD/postgres`**: scripts SQL del esquema.
- **`docs/`**: notas de despliegue y **[contexto completo del proyecto](docs/CONTEXTO_PROYECTO.md)**.
- **`DEPLOYMENT_RUNBOOK.md`**: checklist de producción (incluye Resend / correo en Render).

## Requisitos

- Node.js 20+
- PostgreSQL (local con Docker Compose o gestionado)

## Instalación

```bash
npm install --workspaces
```

## Variables de entorno

- **`apps/api/.env`**: `DATABASE_URL`, claves Supabase según el servicio (no versionar).
- **Portal estático**: `config/antares.public.js` (URL de la API sin `/api`) y `config/supabase.public.js` (URL + anon de Supabase).
- **`apps/web`**: `NEXT_PUBLIC_API_URL` si se usa el front Next.

## Desarrollo

```bash
npm run dev:api    # http://localhost:4000/api
npm run dev:web    # http://localhost:3000
```

## Build

```bash
npm run build:api
npm run build:web
```

## Base de datos local

```bash
npm run db:up
npm run db:ready
npm run db:init
```

Ver **`BD/README.md`** para mapeo de tablas y despliegue.
