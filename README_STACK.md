# Stack objetivo implementado

## Frontend
- Next.js 14+
- TypeScript
- TailwindCSS
- shadcn/ui (base)

## Backend
- NestJS
- PostgreSQL
- Prisma ORM
- JWT + Refresh tokens

## Jobs y servicios
- Bull + Redis (auto-aprobacion a 10 minutos)
- Resend (emails)
- Supabase (archivos)
- React-PDF (desprendibles)

## Deploy y seguridad
- Vercel (frontend)
- Railway/Render (backend)
- RBAC por middleware/guard
- Rate limiting + logs de auditoria

## Estructura
- `apps/web`: frontend Next.js
- `apps/api`: backend NestJS + Prisma
