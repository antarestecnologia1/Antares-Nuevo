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
 * Autenticación: con __ANTARES_API_BASE__ / antares_api_base el login y los datos van contra la API y PostgreSQL (Supabase).
 * Las claves en localStorage son caché del cliente y sincronización (portal/sync-key), no sustituyen la base de datos.
 */
(function () {
  "use strict";
  // Producción (Render API). Debe ser base sin sufijo /api.
  window.__ANTARES_API_BASE__ = "https://antares-nuevo.onrender.com";
})();
