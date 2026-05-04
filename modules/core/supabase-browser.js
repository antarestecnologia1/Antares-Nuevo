/**
 * Cliente Supabase en el navegador si existen window.__SUPABASE_URL__ y window.__SUPABASE_ANON_KEY__.
 * Carga esm.sh de forma dinámica para createClient.
 */
(function () {
  var resolveReady;
  window.antaresSupabaseReady = new Promise(function (resolve) {
    resolveReady = resolve;
  });

  function boot() {
    var url = typeof window.__SUPABASE_URL__ === "string" ? window.__SUPABASE_URL__.trim() : "";
    var anon = typeof window.__SUPABASE_ANON_KEY__ === "string" ? window.__SUPABASE_ANON_KEY__.trim() : "";
    if (!url || !anon) {
      resolveReady(null);
      return;
    }

    import("https://esm.sh/@supabase/supabase-js@2.49.1")
      .then(function (mod) {
        var createClient = mod.createClient;
        if (typeof createClient !== "function") {
          resolveReady(null);
          return;
        }
        var client = createClient(url, anon, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
        window.antaresSupabase = client;
        try {
          client.auth.onAuthStateChange(function (event, _session) {
            if (event === "PASSWORD_RECOVERY") {
              window.dispatchEvent(new CustomEvent("antares:supabase-password-recovery"));
            }
          });
        } catch (_e) {
          /* sin listener */
        }
        resolveReady(client);
      })
      .catch(function () {
        resolveReady(null);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
