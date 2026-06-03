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
    *Si Render sigue usando `npm run prisma:generate -w api` en el build, está bien: el script es un no-op.*
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

- `DATABASE_URL` — Postgres (Render Postgres, Supabase o local). **Primera vez (BD vacía):** desde la raíz del repo, con `DATABASE_URL` en `apps/api/.env` (o variable en CI), ejecutar `npm run db:init:supabase` (crea tablas `01`–`10` + RLS). **Render sin Supabase:** `npm run db:init` (solo `01`–`08`). Tras crear buckets en Supabase Storage, si omitió el script 10: `node apps/api/scripts/apply-schema.mjs --supabase` o aplicar `BD/postgres/10_rls_storage_supabase.sql` en el SQL Editor. **BD ya en producción con esquema viejo:** `npm run db:migrate` o confiar en la autocura al arrancar la API (`PortalService.onModuleInit`). Ver `BD/README.md`.
- `JWT_ACCESS_SECRET` — cadena larga aleatoria (mínimo ~32 caracteres).
- `JWT_REFRESH_SECRET` — otra cadena larga, distinta de la anterior.
- `JWT_ACCESS_EXPIRES_IN` = `15m` (recomendado).
- `JWT_REFRESH_EXPIRES_IN` = `7d` (recomendado).

**CORS (evita “Failed to fetch” desde el navegador)**

- `CORS_ORIGINS` — lista separada por comas de orígenes exactos desde los que se abre el portal (ej. `https://transportesantares.co,https://www.transportesantares.co`). Si solo usa los dominios ya incluidos en código (`transportesantares.co`, `app.transportesantares.co`, `*.vercel.app`), puede quedar vacío. Para previews Vercel (`*.vercel.app`) ya hay comodín; para dominios nuevos u otros ambientes, añada aquí.

**Correo de bienvenida (Resend)**

El registro por API dispara un correo HTML (`MailService.sendPortalRegistrationWelcome`) con bienvenida y **estado de la cuenta** (pendiente de aprobación o ya aprobada), según `estado_cuenta` en Postgres. Implementación: `apps/api/src/mail/mail.service.ts`.

1. **Cuenta en Resend**  
   [https://resend.com](https://resend.com) → dashboard.

2. **`RESEND_API_KEY`** (Render y `apps/api/.env`, valor `re_...`).

3. **`MAIL_FROM`** — **una sola línea**, sin Enter al pegar en Render:

   ```text
   Transportes Antares <antarestecnologia1@gmail.com>
   ```

   O solo: `antarestecnologia1@gmail.com`

   La API **normaliza** saltos de línea y espacios extra (error frecuente: `antarestecnologia1@` + salto de línea → Resend rechaza el envío).

4. **Gmail / Hotmail / Yahoo no pueden ser el remitente real en Resend**  
   Resend no verifica `gmail.com`. Si `MAIL_FROM` usa uno de esos dominios, la API:
   - envía con **`RESEND_VERIFIED_FROM`** si está definido, o con `onboarding@resend.dev` (solo pruebas limitadas);
   - pone el correo de `MAIL_FROM` en **Reply-To** (las respuestas llegan a ese buzón).

5. **Producción (correos a clientes corporativos)** — verificar dominio en Resend y definir:

   ```text
   RESEND_VERIFIED_FROM=Transportes Antares <notificaciones@transportesantares.co>
   ```

   Pasos en Resend: **Domains** → **Add domain** → DNS SPF/DKIM → estado **Verified**.

   | Variable | Ejemplo Render (copiar tal cual, una línea) |
   |----------|---------------------------------------------|
   | `MAIL_FROM` | `Transportes Antares <antarestecnologia1@gmail.com>` |
   | `RESEND_VERIFIED_FROM` | `Transportes Antares <notificaciones@transportesantares.co>` |
   | `RESEND_API_KEY` | `re_...` (desde panel Resend) |

   Tras cambiar variables en Render: **guardar** y **redeploy** del Web Service.

6. **URL del botón “Acceder al portal” en el correo**

   - `PORTAL_PUBLIC_URL` o `PUBLIC_PORTAL_URL` — ej. `https://www.transportesantares.co`
   - Debe alinearse con `window.__PORTAL_PUBLIC_ORIGIN__` en `config/antares.public.js`.

**Errores Resend habituales**

| Mensaje | Causa | Acción |
|---------|--------|--------|
| `Domain not verified: Verify gmail.com` | `MAIL_FROM` es Gmail o quedó truncado con salto de línea | Corregir `MAIL_FROM` en una línea; usar `RESEND_VERIFIED_FROM` con dominio verificado |
| `from` incompleto en el log (`antarestecnologia1@`) | Variable partida en Render | Repegar valor completo sin Enter |
| Correo no llega a terceros con `onboarding@resend.dev` | Modo prueba Resend | Verificar dominio y `RESEND_VERIFIED_FROM` |

Documentación ampliada: `docs/CONTEXTO_PROYECTO.md` (sección Correo).

**Opcionales (otros)**

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — necesarios para crear usuarios en Supabase Auth al registrarse por el portal **y** para que el correo de “olvidé mi contraseña” funcione (Supabase envía el enlace; la API sincroniza la nueva clave en `usuarios.hash_contrasena`). **Sin ellos, registro/login con solo Postgres siguen operando**, pero no habrá recuperación por correo vía Supabase ni usuario en Auth.

**Supabase → recuperación de contraseña (portal estático)**

1. En Authentication → URL configuration del proyecto, configure **Site URL** con la URL del portal (ej. `https://www.transportesantares.co`).
2. En **Redirect URLs**, incluya las URLs exactas a las que Supabase puede redirigir tras el enlace del correo (la misma página de entrada del portal), por ejemplo: `https://www.transportesantares.co/`, `https://transportesantares.co/`, y las de entornos de prueba (`http://localhost:5500/`, etc.). El cliente usa la URL actual del navegador sin fragmento `#`; si falta la entrada permitida, el flujo de recuperación fallará.
3. Revise Authentication → Providers → Email (plantillas y entrega); compruebe la carpeta de spam si no llega el mensaje.

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

## Base de datos — checklist producción

1. **BD vacía:** `npm run setup` (local) o variables en Render; `npm run db:init:supabase` una sola vez contra esa `DATABASE_URL`.
2. **Supabase Storage:** buckets `documentos_contratos`, `documentos_adjuntos`, `documentos_rrhh` (privados); luego script `10_rls_storage_supabase.sql` si no corrió en el paso 1.
3. **BD con datos antiguos:** desplegar API nueva (autocura columnas al iniciar) y/o `npm run db:migrate`.
4. Logs API al arranque: mensajes `*: esquema verificado` sin errores fatales.

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
| `npm run verify:stack` | Si **Docker Compose** está en PATH: borra volumen, levanta Postgres, `npm run db:init` (`01`–`08`), ejecuta `verify` y smoke API. Si Docker no está instalado, ejecuta solo `verify`. |
| `npm run db:init:supabase` | Esquema completo `01`–`10` contra `DATABASE_URL` (producción Supabase o Render + RLS opcional). |
| `npm run db:migrate` | Verifica tablas; `migrations/` ya no contiene `.sql` (esquema en `tablas/` + autocura API). |

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

