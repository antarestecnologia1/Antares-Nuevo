/**
 * URL del backend Antares (Nest en Render, etc.). Sin barra final; sin sufijo /api.
 *
 * Seguridad:
 * - Use solo HTTPS en producción (el token Bearer y el refresh no deben viajar por HTTP abierto).
 * - El dominio del sitio donde corre esta página debe estar en CORS_ORIGINS del servidor (apps/api .env).
 * - La clave anon de Supabase en supabase.public.js es pública por diseño; no ponga service_role ni DATABASE_URL aquí.
 *
 * Depuración sincronización portal (solo desarrollo): window.__ANTARES_DEBUG_SYNC__ = true en consola.
 *
 * Autenticación: si define __ANTARES_API_BASE__ o antares_api_base, el login es solo contra la API/BD
 * (no se acepta la lista de usuarios demo en el navegador). Sin URL de API, el portal sigue pudiendo
 * usar cuentas locales de demostración (ver ensureEnterpriseScaleData en app.js).
 */
(function () {
  "use strict";
  // window.__ANTARES_API_BASE__ = "https://su-servicio.onrender.com";
})();
