# Deployment Runbook (Vercel + Render)

Estado: exitoso.
Fecha: 2026-04-29.

## Arquitectura final

- Sitio publico (estatico): `transportesantares.co` / `www.transportesantares.co`
  - Proyecto Vercel: `antares-static`
  - Root Directory: repo root (`.`)
  - Framework Preset: `Other`
  - Build Command: vacio
  - Output Directory: `.`

- App Next.js: `app.transportesantares.co` (recomendado)
  - Proyecto Vercel: apps/web
  - Root Directory: `apps/web`
  - Framework Preset: `Next.js`
  - Output Directory: default (vacio)
  - Env: `NEXT_PUBLIC_API_URL=https://antares-nuevo.onrender.com/api`

- API NestJS: `https://antares-nuevo.onrender.com`
  - Plataforma: Render (Web Service)
  - Root Directory: `apps/api`
  - Build Command:
    `npm install --workspaces && npm run prisma:generate -w api && npm run build -w api`
  - Start Command:
    `npm run start -w api`

## DNS en Cloudflare (dominio principal)

Configurar en modo `DNS only` (nube gris):

1. Registro A
   - Name: `@`
   - Value: `216.198.79.1`
   - TTL: Auto

2. Registro CNAME
   - Name: `www`
   - Value: `c11d5d917250e16a.vercel-dns-017.com`
   - TTL: Auto

3. TXT `_vercel` (opcional si Vercel lo pide para validacion).

## Variables de entorno API (Render)

Minimas:

- `DATABASE_URL` = Internal Database URL de Render Postgres
- `JWT_ACCESS_SECRET` = secreto largo
- `JWT_REFRESH_SECRET` = secreto largo distinto
- `JWT_ACCESS_EXPIRES_IN` = `15m`
- `JWT_REFRESH_EXPIRES_IN` = `7d`
- `REDIS_HOST` = host de Render Key Value (solo host, sin `rediss://`)
- `REDIS_PORT` = `6379` (o puerto entregado)

Opcionales:

- `RESEND_API_KEY`
- `MAIL_FROM`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Variables de entorno Frontend (Vercel apps/web)

- `NEXT_PUBLIC_API_URL=https://antares-nuevo.onrender.com/api`

## Cambios tecnicos aplicados para estabilizar deploy

1. API escucha `process.env.PORT` (requerido por Render):
   - Archivo: `apps/api/src/main.ts`

2. Prisma:
   - Se removio `beforeExit` hook con tipado incompatible.
   - Archivo: `apps/api/src/prisma/prisma.service.ts`

3. Supabase opcional:
   - `FilesService` ya no rompe arranque si no hay `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`.
   - Archivo: `apps/api/src/files/files.service.ts`

## Checklist de validacion

1. Render API en estado `Live`.
2. Endpoint base responde en `https://antares-nuevo.onrender.com`.
3. Vercel static con dominio principal en verde.
4. Vercel app (`apps/web`) con env `NEXT_PUBLIC_API_URL` aplicada.
5. Login ya no muestra `Failed to fetch`.
6. Cloudflare SSL/TLS en `Full` o `Full (strict)`.

## Notas operativas

- En planes free, Render puede dormir; primer request puede tardar.
- Si se cambia la URL de Render, actualizar `NEXT_PUBLIC_API_URL` y redeploy en Vercel.

