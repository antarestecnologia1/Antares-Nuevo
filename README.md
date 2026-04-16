# Antares Plataforma - Monorepo fullstack

Base de proyecto alineada al stack solicitado:

- Frontend: Next.js 14+, TypeScript, TailwindCSS, base shadcn/ui.
- Backend: NestJS, PostgreSQL, Prisma ORM, JWT + Refresh tokens.
- Jobs/servicios: Bull + Redis, Resend, Supabase.
- Seguridad: RBAC por guard, rate limiting, logs de auditoría.

## Estructura

- `apps/web`: frontend Next.js.
- `apps/api`: backend NestJS + Prisma.
- `docs`: plan, arquitectura y wireframes.
- `index.html`, `styles.css`, `app.js`: MVP web previo (se conserva como referencia funcional).

## Requisitos locales

- Node.js 20+
- PostgreSQL
- Redis

## Instalación

```bash
npm install --workspaces
```

## Variables de entorno

Crear `apps/api/.env` a partir de `apps/api/.env.example`.

## Desarrollo

```bash
npm run dev:web
npm run dev:api
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000/api`

## Build

```bash
npm run build:web
npm run build:api
```

## Endpoints base implementados

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/requests` (CLIENT)
- `GET /api/requests` (CLIENT/ADMIN)
- `POST /api/requests/:id/approve` (ADMIN)
- `POST /api/payroll/slip` (ADMIN/RRHH)

## Notas

- La cola Bull programa auto-aprobación a 10 minutos para solicitudes pendientes.
- Resend y Supabase están preparados por servicio; se activan al definir llaves en `.env`.
- Para generar cliente Prisma:

```bash
npm run prisma:generate -w api
```
