/**
 * URL del backend Antares (Nest en Render, etc.). Sin barra final; sin sufijo /api.
 *
 * El cliente concatena `/api/auth/login`, `/api/auth/register-portal`, etc.
 * Debe coincidir con el servicio donde está desplegada la API (ej. Render Web Service).
 *
 * Sitio estático en otro dominio: cambie esta URL si mueve la API; además agregue ese dominio del sitio
 * en CORS_ORIGINS en el servidor (o use los dominios ya permitidos en apps/api/src/main.ts).
 *
 * Seguridad:
 * - Use solo HTTPS en producción (el token Bearer y el refresh no deben viajar por HTTP abierto).
 * - El dominio del sitio donde corre esta página debe estar en CORS_ORIGINS del servidor (apps/api .env).
 * - La clave anon de Supabase en supabase.public.js es pública por diseño; no ponga service_role ni DATABASE_URL aquí.
 *
 * Depuración sincronización portal: solo con window.__ANTARES_DEBUG_SYNC__ === true y consola permitida (localhost).
 *
 * Consola del navegador: en producción (no localhost) los métodos de console.* quedan neutralizados por
 * modules/core/runtime-security.js para reducir fugas por DevTools; la validación y autorización reales
 * siguen en el servidor (Nest + PostgreSQL).
 *
 * Autenticación: con __ANTARES_API_BASE__ / antares_api_base el login y los datos van contra la API y PostgreSQL (Supabase).
 * Las claves en localStorage son caché del cliente y sincronización (portal/sync-key), no sustituyen la base de datos.
 */
(function () {
  "use strict";
  /**
   * URL RAÍZ del servidor Nest en producción. NO incluye el sufijo /api (lo añade el cliente).
   *
   * Producción 24/7 sin dependencia del PC del administrador:
   *  - API NestJS: desplegada en Render (Web Service). Render auto-despliega desde GitHub
   *    en cada push a `main` y entrega HTTPS automático. URL canónica:
   *    https://antares-nuevo.onrender.com  (esa misma URL es la que usan TODOS los frontends:
   *    Vercel en transportesantares.co, Cloudflare Pages en app.transportesantares.co y previews).
   *
   * Si más adelante quiere usar `https://api.transportesantares.co` con marca propia, basta con
   * crear en Cloudflare DNS un CNAME `api → antares-nuevo.onrender.com` (proxy DNS-only) y, una
   * vez verificado el dominio en Render, cambiar este default por la URL con marca. Mientras
   * tanto, la URL de Render funciona sola y NO requiere el Cloudflare Tunnel.
   *
   * localhost / 127.0.0.1: vacío para que el portal caiga al modo offline o pueda sobreescribirse
   * manualmente con `localStorage.antares_api_base`.
   */
  function resolveDefaultApiBase() {
    try {
      var host = String(location.hostname || "").toLowerCase();
      if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) {
        return "";
      }
    } catch (_e) {}
    return "https://antares-nuevo.onrender.com";
  }
  window.__ANTARES_API_BASE__ = resolveDefaultApiBase();
  /**
   * Origen público del portal (https://dominio, sin barra final). Debe coincidir con PORTAL_PUBLIC_URL en la API
   * y con una URL permitida en el proveedor de autenticación (redirects). Si no se define, el enlace de
   * recuperación de contraseña tomará el host de la página actual (puede ser localhost en desarrollo).
   */
  window.__PORTAL_PUBLIC_ORIGIN__ = "https://www.transportesantares.co";
})();
