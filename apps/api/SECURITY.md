# Seguridad de la API Antares

## Tokens y transporte

- Los JWT de acceso y refresco se emiten como **cookies HttpOnly** (`antares_at`, `antares_rt`), no en `localStorage`.
- En producción las cookies usan **`Secure`** y **`SameSite=None`** (portal y API en dominios distintos). En desarrollo local suele usarse `SameSite=Lax`.
- Las mutaciones autenticadas exigen el encabezado **`X-CSRF-Token`** coincidente con la cookie legible `antares_csrf` (doble envío).
- Los tokens JWT deben viajar **solo por HTTPS** en entornos expuestos a Internet.
- No configure la URL base del API (`antares_api_base` / `__ANTARES_API_BASE__`) apuntando a `http://` en producción salvo redes totalmente controladas.

### Variables opcionales (`.env` del servidor)

| Variable | Descripción |
|----------|-------------|
| `AUTH_COOKIE_SAME_SITE` | `none`, `lax` o `strict` (por defecto: `none` en producción, `lax` en desarrollo) |
| `AUTH_COOKIE_SECURE` | `true` / `false` para forzar cookie `Secure` |

## CORS y dominios conocidos

- El servidor solo acepta peticiones de navegador cuyo encabezado `Origin` coincida con uno de los valores de **`CORS_ORIGINS`** en `.env` (lista separada por comas, sin espacios tras las comas salvo que formen parte del valor).
- CORS está habilitado con **`credentials: true`**; el cliente debe usar `fetch(..., { credentials: "include" })`.
- Cada dominio desde el que se sirva el portal debe estar listado de forma explícita (incluido `https://` y el puerto si no es 443).
- Tras cambiar `CORS_ORIGINS`, reinicie el proceso de la API.

## Credenciales en el servidor

- `DATABASE_URL`, `JWT_*_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` y similares solo en `.env` del servidor o variables del proveedor (Render, Fly, etc.).
- Nunca en el repositorio público ni en scripts del cliente (`config/*.public.js`).

## Cliente (portal)

- **No** guardar `accessToken` ni `refreshToken` en `localStorage`. La sesión del portal (`antares_session_v2`) solo conserva metadatos (`userId`, `role`, `profileSnapshot`, etc.).
- En **iPhone** (Safari y Chrome usan WebKit) las cookies cross-site hacia `onrender.com` pueden no persistir. El login devuelve además `accessToken` y `refreshToken` en el JSON de respuesta; el cliente los guarda en **sessionStorage** y envía `Authorization: Bearer` como respaldo. El refresh token en cuerpo POST sustituye la cookie `antares_rt` cuando haga falta.
- Depuración de sincronización (`portal-sync`): en producción los fallos de sync **no** imprimen detalle en consola. Para diagnosticar en local use `window.__ANTARES_DEBUG_SYNC__ = true` en la consola del navegador o trabaje en `localhost`.

## Row Level Security (Supabase)

- Si usa Postgres gestionado por Supabase, las políticas RLS son independientes de esta API. Revise que el rol usado en `DATABASE_URL` sea el adecuado para su modelo de amenazas (rol de aplicación vs service role).
