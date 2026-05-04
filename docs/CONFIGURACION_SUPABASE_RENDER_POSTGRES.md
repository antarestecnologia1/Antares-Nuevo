# Configuración PostgreSQL: Supabase + Render (API Antares)

Guía de la configuración que permite a **`apps/api`** conectar correctamente a Supabase desde **Render** (registro portal, login, etc.). No sustituye secretos reales: use variables de entorno y **no** suba contraseñas al repositorio.

## 1. Por qué Session pooler en Render

- La conexión **Direct** (`db.<ref>.supabase.co`, usuario `postgres`) puede aparecer en el panel como **«Not IPv4 compatible»**.
- Plataformas como **Render** suelen salir a Internet por **IPv4**.
- **Session pooler** en Supabase **proxifica a IPv4** (adecuado para esa red).

En el panel: **Project Settings → Database → Connection string → Connection Method: Session pooler → Type: URI**.

## 2. Formato correcto de `DATABASE_URL` (Session pooler)

Estructura típica:

```text
postgresql://postgres.<PROJECT_REF>:<PASSWORD_URL_ENCODED>@<POOLER_HOST>:5432/postgres
```

Ejemplo **con valores de ejemplo** (sustituya por los suyos):

```text
postgresql://postgres.abcdefghijklmnop:%2A%40secret@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

Puntos clave:

| Elemento | Regla |
|----------|--------|
| **Usuario** | Debe ser `postgres.<PROJECT_REF>`, **no** solo `postgres`, cuando el host es `*.pooler.supabase.com` (u homólogo `.co`). Si usa solo `postgres` con pooler, Supabase suele responder **«Tenant or user not found»** (a veces SQLSTATE `XX000`). |
| **Host** | El que indica el panel para Session pooler (p ej. `aws-1-us-east-1.pooler.supabase.com`). |
| **Puerto** | `5432` para Session pooler en el ejemplo actual del panel (verifique siempre la copia del propio proyecto). |
| **Base** | `postgres` salvo que use otra configuración explícita. |
| **Contraseña** | Pegada **dentro** de la URI y **codificada** si tiene caracteres reservados en URL (véase §3). |

## 3. Codificación de la contraseña en la URI

La contraseña va en el segmento `user:password@` de la URL. Caracteres que suelen romper el parseo o la conexión si van en claro:

| Carácter | Codificación |
|----------|----------------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `*` | `%2A` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| espacio | `%20` o `+` (según contexto; para password en URI suele usarse `%20`) |

En Node puede comprobar solo la parte contraseña: `encodeURIComponent('suContraseña')` y sustituir `[YOUR-PASSWORD]` de la plantilla del panel por ese resultado.

La API **no** necesita código extra por esto: lee `DATABASE_URL` del entorno; donde descompone la URI (`create-pg-pool.ts`) usa `decodeURIComponent` para usuario y contraseña antes de pasarlos a `pg`.

## 4. Render

1. Servicio Web de la API → **Environment**.
2. Variable **`DATABASE_URL`**: pegue la cadena **completa**, **sin comillas** simples ni dobles, **sin espacios** al inicio o al final.
3. Guarde y **vuelva a desplegar** o **reinicie** el servicio para cargar el valor.

Comando de arranque recomendado en el monorepo: `npm run start -w api` (el `start` del paquete `api` incluye preferencia DNS IPv4 en el proceso Node).

## 5. Variables relacionadas (API)

Además de `DATABASE_URL`, revise en Render / `.env` local (sin commitear):

- **`JWT_SECRET`**, **`JWT_REFRESH_SECRET`**, expiración JWT si aplica.
- **`SUPABASE_URL`**, **`SUPABASE_SERVICE_ROLE_KEY`** si usa sincronización con Auth (opcional para registro portal; la base de sesión principal del portal documentado es JWT + Postgres).
- **`CORS_ORIGINS`**: orígenes del portal que llaman a la API.
- **`PORT`**: lo inyecta Render; en local puede ser `4000`.

## 6. Comportamiento relevante en el código (referencia)

- **`src/bootstrap-dns.ts`**: importado primero en `main.ts`; orden DNS **IPv4 primero**.
- **`src/database/create-pg-pool.ts`**: para hosts Supabase, resolución **IPv4** explícita + TLS con **SNI** al nombre original cuando se conecta por IP.
- **`src/database/normalize-database-url.ts`**: normaliza espacios/comillas/BOM; constante **`SUPABASE_POOLER_TENANT_ERROR_HELP`** y detección **`supabasePoolerUrlUsesBarePostgresUser`** al arranque.
- **`src/auth/auth.service.ts`**: errores de pooler / `Tenant or user not found` se mapean con mensaje orientado a **URI**, no a “ejecutar scripts SQL”.

## 7. Conexión directa (alternativa)

Si en el futuro su proyecto tiene **IPv4 add-on** o red dual stack y el panel indica compatibilidad:

```text
postgresql://postgres:<PASSWORD_URL_ENCODED>@db.<PROJECT_REF>.supabase.co:5432/postgres
```

Aquí el usuario es solo **`postgres`**. No mezcle host **pooler** con usuario solo **`postgres`**.

## 8. Incidencias frecuentes

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| Tenant or user not found / XX000 | URI de **pooler** con usuario incorrecto | Session pooler con `postgres.<REF>` o directa `db...` con `postgres`. |
| ENETUNREACH / IPv6 | Ruta IPv6 desde el host | Ya mitigado en código; usar Session pooler si el panel marca Direct como no IPv4; opcional `NODE_OPTIONS=--dns-result-order=ipv4first`. |
| 28P01 / contraseña rechazada | URL mal formada o password sin codificar | Revisar `@` en password → `%40`, etc. |
| «Ejecute scripts SQL» en errores antiguos | Mensaje genérico para `XX000` | Despliegue versión actual de la API que distingue pooler / `detail`. |

## 9. Seguridad

- **No** incluya `DATABASE_URL` ni contraseñas en git; `.env` debe estar en `.gitignore`.
- Si una clave se expuso (chat, ticket, log), **rótela** en Supabase (**Database → Database password**) y actualice `DATABASE_URL`.
- El rol **`postgres`** en la URI de aplicación backend debe limitarse al uso previsto; para Supabase, seguir las recomendaciones del panel y RLS según su modelo.

---

*Última alineación con el flujo validado: registro portal OK con Session pooler, `DATABASE_URL` en Render y contraseña correctamente codificada en la URI.*
