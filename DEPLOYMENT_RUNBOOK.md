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
    `npm install --workspaces && npm run build -w api`
    *(El workspace ya incluye `api`; no hay migraciones Prisma activas — esquema en `BD/postgres`.)*
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

Variables locales: `npm run setup` crea `apps/api/.env` para Postgres Docker; para dominio producción use las mismas claves que en Render (véase `apps/api/.env` en su máquina, gitignored).

**Mínimas para login y registro**

- `DATABASE_URL` — Postgres (URL interna de Render Postgres en el mismo región, o Supabase, o local). Aplicar scripts `BD/postgres/*.sql` en orden sobre una base vacía o según `BD/README.md`.
- `JWT_ACCESS_SECRET` — cadena larga aleatoria (mínimo ~32 caracteres).
- `JWT_REFRESH_SECRET` — otra cadena larga, distinta de la anterior.
- `JWT_ACCESS_EXPIRES_IN` = `15m` (recomendado).
- `JWT_REFRESH_EXPIRES_IN` = `7d` (recomendado).

**CORS (evita “Failed to fetch” desde el navegador)**

- `CORS_ORIGINS` — lista separada por comas de orígenes exactos desde los que se abre el portal (ej. `https://transportesantares.co,https://www.transportesantares.co`). Si solo usa los dominios ya incluidos en código (`transportesantares.co`, `app.transportesantares.co`, `*.vercel.app`), puede quedar vacío. Para previews Vercel (`*.vercel.app`) ya hay comodín; para dominios nuevos u otros ambientes, añada aquí.

**Correo de bienvenida (Resend)**

El registro por API dispara un correo HTML (`MailService.sendPortalRegistrationWelcome`) con bienvenida y **estado de la cuenta** (pendiente de aprobación o ya aprobada), según `estado_cuenta` en Postgres. Para que se envíe:

1. **Cuenta en Resend**  
   Entra en [https://resend.com](https://resend.com), crea cuenta y accede al dashboard.

2. **`RESEND_API_KEY`**  
   En el panel: **API Keys** → **Create API Key**. Copia el valor (empieza por `re_`) y pégalo en:
   - `apps/api/.env` en local, y
   - Variables de entorno del servicio en **Render** (o tu host), p. ej. `RESEND_API_KEY=re_xxxx`.

3. **`MAIL_FROM`**  
   Resend exige un remitente de **dominio verificado** (no basta un Gmail arbitrario).
   - En Resend: **Domains** → **Add domain** → sigue los registros DNS (SPF/DKIM) que te indiquen para tu dominio (ej. `transportesantares.co`).
   - Cuando el dominio esté **Verified**, usa una dirección de ese dominio, por ejemplo:
     - `Antares <notificaciones@transportesantares.co>`  
     o solo `notificaciones@transportesantares.co`  
     Ese string completo va en `MAIL_FROM`.
   - **Modo prueba:** sin dominio propio, Resend permite `MAIL_FROM=onboarding@resend.dev` solo para envíos de prueba muy limitados; para producción hay que verificar dominio.

4. **URL del enlace “Ir al portal” en el correo** (opcional pero recomendado)

- `PORTAL_PUBLIC_URL` o `PUBLIC_PORTAL_URL` — URL pública del portal (ej. `https://app.transportesantares.co`). Si no se define, el código usa un valor por defecto.

**Opcionales (otros)**

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — si quiere crear usuarios también en Supabase Auth. **Sin ellos, registro y login siguen funcionando** solo con Postgres y JWT de la API.

**Puerto**

- Render inyecta `PORT`; en local usar `PORT=4000` si hace falta.

## Variables de entorno Frontend (Vercel apps/web)

- `NEXT_PUBLIC_API_URL=https://antares-nuevo.onrender.com/api`

Debe incluir el sufijo **`/api`** porque el cliente Next (`AuthProvider`) llama a `${NEXT_PUBLIC_API_URL}/auth/login` (ruta final `.../api/auth/login`).

## Login y registro (portal estático + API)

| Pieza | Qué configurar |
|--------|----------------|
| **Portal estático** (`index.html`, Live Server, Vercel root `.`) | En `config/antares.public.js`, `window.__ANTARES_API_BASE__` = URL de la API **sin** `/api` (ej. `https://antares-nuevo.onrender.com`). El JS del portal usa `AntaresApi` y rutas `/api/auth/...`. |
| **Next.js** (`apps/web`) | `NEXT_PUBLIC_API_URL` = misma API **con** `/api` al final. |
| **API** | `DATABASE_URL`, JWT, y CORS si el dominio del sitio no está en la lista por defecto. |
| **Usuario nuevo** | Registro crea fila en `usuarios` con `estado_cuenta = pendiente`. El login por API solo permite `estado_cuenta = aprobado`; un administrador debe aprobar en base de datos (o flujo admin) antes de que pueda entrar. |

**Desarrollo local**

1. Postgres local o remoto; `DATABASE_URL` en `apps/api/.env`.
2. Generar secretos JWT y pegarlos en `.env`.
3. `npm run start:dev -w api` (o desde `apps/api`: `npm run start:dev`).
4. Abrir el portal desde un origen permitido por CORS (por defecto `http://localhost:5500`, `3000`, etc.).

## Cambios tecnicos aplicados para estabilizar deploy

1. API escucha `process.env.PORT` (requerido por Render):
   - Archivo: `apps/api/src/main.ts`

2. Supabase opcional:
   - `FilesService` ya no rompe arranque si no hay `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`.
   - Archivo: `apps/api/src/files/files.service.ts`

3. Registro portal / Postgres en Render: `apps/api/src/database/database.module.ts` habilita TLS para hostnames habituales (Render, Neon, etc.) para evitar fallos de conexión a Postgres gestionado.

## Checklist de validacion

1. Render API en estado `Live`.
2. Variables API: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`; `CORS_ORIGINS` si el origen del portal no está en la lista por defecto.
3. Portal estático: `config/antares.public.js` apunta a la misma API que Render (sin `/api`).
4. Endpoint base responde (ej. `GET` saludable o `POST /api/auth/login` con 401/400 esperable sin credenciales válidas).
5. Vercel static con dominio principal en verde.
6. Vercel app (`apps/web`) con env `NEXT_PUBLIC_API_URL` terminada en `/api`.
7. Login desde el navegador no muestra `Failed to fetch` (CORS + URL correcta).
8. Tras registro, usuario `pendiente`: para probar login, pasar `estado_cuenta` a `aprobado` en `usuarios` o usar flujo de aprobación.
9. Cloudflare SSL/TLS en `Full` o `Full (strict)`.

## Verificación automática (sin pasos manuales)

En la raíz del repo:

| Comando | Qué hace |
|---------|-----------|
| `npm install` | Dependencias del monorepo. |
| `npm run setup` | Crea `apps/api/.env` con JWT aleatorios y Postgres Docker si no existe (`setup:force` para regenerar). |
| `npm run verify` | Setup + build API + build Next.js + ESLint (`apps/web`) + tests estáticos del portal (`qa/portal-regression-tests.mjs`). **No requiere Docker.** |
| `npm run verify:stack` | Si **Docker Compose** está en PATH: borra volumen, levanta Postgres, aplica esquema `BD/postgres` (sin scripts 09/10 Supabase), ejecuta `verify` y **smoke** `POST /api/auth/login` → 401. Si Docker no está instalado, ejecuta solo `verify`. |

### Postgres local (Docker)

```bash
npm run setup
docker compose up -d
npm run db:ready
npm run db:init
npm run dev:api
```

## Notas operativas

- En planes free, Render puede dormir; primer request puede tardar.
- Si se cambia la URL de la API en Render, actualizar `NEXT_PUBLIC_API_URL` en Vercel (`apps/web`), `window.__ANTARES_API_BASE__` en `config/antares.public.js` del sitio estático, y redeploy ambos.

