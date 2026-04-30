/**
 * Capa de persistencia del navegador (adapter). Cache JSON para el portal; la fuente de verdad es PostgreSQL (Supabase) vía API y bootstrap/sync.
 *
 * Defensa frente al crecimiento sin límite: listas “append-only” (notificaciones, correo saliente)
 * se recortan en cada escritura para que el parsing JSON no degrade el hilo con los años de uso.
 */
(function registerPersistenceLayer() {
  /** Entradas más recientes primero (unshift); slice conserva el trozo inicial = más nuevos. */
  var CAP_ARRAY_ROWS_BY_KEY = {
    antares_notifications_v2: 500,
    antares_emails_v2: 400
  };

  function trimArrayRowsIfNeeded(key, value) {
    var max = CAP_ARRAY_ROWS_BY_KEY[key];
    if (!max || !Array.isArray(value) || value.length <= max) return value;
    return value.slice(0, max);
  }

  window.AntaresPersistence = {
    read(key, fallback = []) {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null || raw === undefined) return fallback;
        return JSON.parse(raw) ?? fallback;
      } catch (_err) {
        return fallback;
      }
    },

    write(key, value) {
      var stored = trimArrayRowsIfNeeded(key, value);
      localStorage.setItem(key, JSON.stringify(stored));
      if (window.AntaresPortalSync && typeof window.AntaresPortalSync.schedule === "function") {
        window.AntaresPortalSync.schedule(key, stored);
      }
    },

    remove(key) {
      localStorage.removeItem(key);
    }
  };
})();
