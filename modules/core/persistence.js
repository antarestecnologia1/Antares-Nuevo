/**
 * Capa de persistencia (adapter pattern).
 * Hoy: localStorage JSON. Mañana: sustituir por cliente HTTP contra apps/api + PostgreSQL.
 */
(function registerPersistenceLayer() {
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
      localStorage.setItem(key, JSON.stringify(value));
      if (window.AntaresPortalSync && typeof window.AntaresPortalSync.schedule === "function") {
        window.AntaresPortalSync.schedule(key, value);
      }
    },

    remove(key) {
      localStorage.removeItem(key);
    }
  };
})();
