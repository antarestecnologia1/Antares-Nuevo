/**
 * Cliente Supabase en el navegador si existen window.__SUPABASE_URL__ y window.__SUPABASE_ANON_KEY__.
 * Carga esm.sh de forma dinámica para createClient.
 */
(function () {
  function boot() {
    var url = typeof window.__SUPABASE_URL__ === "string" ? window.__SUPABASE_URL__.trim() : "";
    var anon = typeof window.__SUPABASE_ANON_KEY__ === "string" ? window.__SUPABASE_ANON_KEY__.trim() : "";
    if (!url || !anon) return;

    import("https://esm.sh/@supabase/supabase-js@2.49.1")
      .then(function (mod) {
        var createClient = mod.createClient;
        if (typeof createClient !== "function") return;
        window.antaresSupabase = createClient(url, anon, {
          auth: { persistSession: true, autoRefreshToken: true }
        });
      })
      .catch(function () {
        /* sin red o bloqueo CDN: portal sigue en modo localStorage */
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
