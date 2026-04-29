# Seguridad de la API Antares

## Tokens y transporte

- Los tokens JWT de acceso y refresco deben enviarse **solo por HTTPS** en entornos expuestos a Internet (oficina pública, LTE, Wi‑Fi ajeno).
- No configure la URL base del API (`antares_api_base` / `__ANTARES_API_BASE__`) apuntando a `http://` en producción salvo redes totalmente controladas.

## CORS y dominios conocidos

- El servidor solo acepta peticiones de navegador cuyo encabezado `Origin` coincida con uno de los valores de **`CORS_ORIGINS`** en `.env` (lista separada por comas, sin espacios tras las comas salvo que formen parte del valor).
- Cada dominio desde el que se sirva el portal debe estar listado de forma explícita (incluido `https://` y el puerto si no es 443).
- Tras cambiar `CORS_ORIGINS`, reinicie el proceso de la API.

## Credenciales en el servidor

- `DATABASE_URL`, `JWT_*_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` y similares solo en `.env` del servidor o variables del proveedor (Render, Fly, etc.).
- Nunca en el repositorio público ni en scripts del cliente (`config/*.public.js`).

## Cliente (portal)

- Depuración de sincronización (`portal-sync`): en producción los fallos de sync **no** imprimen detalle en consola. Para diagnosticar en local use `window.__ANTARES_DEBUG_SYNC__ = true` en la consola del navegador o trabaje en `localhost`.

## Row Level Security (Supabase)

- Si usa Postgres gestionado por Supabase, las políticas RLS son independientes de esta API. Revise que el rol usado en `DATABASE_URL` sea el adecuado para su modelo de amenazas (rol de aplicación vs service role).
