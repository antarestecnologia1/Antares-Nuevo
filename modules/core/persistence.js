/**
 * Capa de persistencia del portal: datos de negocio con tabla en PostgreSQL
 * viven en memoria (sesión) y se sincronizan vía GET /portal/bootstrap y POST /portal/sync-key.
 * No se vuelve a escribir JSON masivo en localStorage (evita cuota llena y lentitud).
 *
 * Solo queda en localStorage: metadatos de sesión (antares_session_v2, sin JWT), preferencias de UI, y claves ajenas al portal.
 */
(function registerPersistenceLayer() {
  /** Claves cuyo contrato es apps/api (bootstrap + sync-key). Misma lista que en app.js KEYS (sin session). */
  var SERVER_BACKED_STORAGE_KEYS = new Set([
    "antares_users_v2",
    "antares_companies_v2",
    "antares_counters_v2",
    "antares_contacts_v2",
    "antares_requests_v2",
    "antares_vehicles_v2",
    "antares_drivers_v2",
    "antares_notifications_v2",
    "antares_emails_v2",
    "antares_payroll_employees_v2",
    "antares_payroll_runs_v2",
    "antares_fuel_logs_v2",
    "antares_vehicle_technical_logs_v2",
    "antares_travel_allowance_rules_v2",
    "antares_vacancies_v2",
    "antares_candidates_v2",
    "antares_positions_v2",
    "antares_interviews_v2",
    "antares_contracts_v2",
    "antares_hr_absences_v2",
    "antares_sst_compliance_v2",
    "antares_trip_route_rates_v2",
    "antares_approvals_v2"
  ]);

  /**
   * Caché solo en RAM (sesión): hidratación vía bootstrap / GET audit-events, sin localStorage.
   * Evita que datos legacy en disco tapen `auditoria_eventos_portal`.
   */
  var SESSION_MEMORY_ONLY_KEYS = new Set(["antares_module_audit_logs_v1"]);

  /** Entradas más recientes primero (unshift); slice conserva el trozo inicial = más nuevos. */
  var CAP_ARRAY_ROWS_BY_KEY = {
    antares_notifications_v2: 500,
    antares_emails_v2: 400,
    antares_module_audit_logs_v1: 600
  };

  /** @type {Record<string, unknown>} */
  var serverBackedMemory = {};

  /** @type {Record<string, unknown>} */
  var sessionMemoryOnly = {};

  function purgeSessionMemoryKeyFromDisk(key) {
    if (!SESSION_MEMORY_ONLY_KEYS.has(key)) return;
    try {
      localStorage.removeItem(key);
    } catch (_e) {
      /* noop */
    }
  }

  function trimArrayRowsIfNeeded(key, value) {
    var max = CAP_ARRAY_ROWS_BY_KEY[key];
    if (!max || !Array.isArray(value) || value.length <= max) return value;
    return value.slice(0, max);
  }

  /**
   * Una sola vez por clave: si había JSON viejo en localStorage, se sube a memoria y se borra del disco.
   */
  function scheduleLiftedKeySync(key) {
    try {
      var api = window.AntaresApi;
      var sync = window.AntaresPortalSync;
      if (!api || typeof api.isConfigured !== "function" || !api.isConfigured()) return;
      if (!sync || typeof sync.flushStorageKeyNow !== "function") return;
      var flushLifted = function () {
        try {
          void sync.flushStorageKeyNow(key, { notifyOnFailure: false });
        } catch (_flush) {
          /* noop */
        }
      };
      /** Evita empujar JSON legacy al servidor mientras el bootstrap inicial está en curso. */
      var boot = window.__portalBootstrapInFlight;
      if (boot && typeof boot.then === "function") {
        void boot.finally(flushLifted);
        return;
      }
      flushLifted();
    } catch (_liftSync) {
      /* noop */
    }
  }

  function liftLegacyLocalStorageOnce(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      var parsed = JSON.parse(raw);
      serverBackedMemory[key] = parsed;
      localStorage.removeItem(key);
      scheduleLiftedKeySync(key);
      return parsed !== undefined && parsed !== null ? parsed : fallback;
    } catch (_err) {
      try {
        localStorage.removeItem(key);
      } catch (_e2) {
        /* noop */
      }
      return fallback;
    }
  }

  function purgeServerBackedFromDisk() {
    SERVER_BACKED_STORAGE_KEYS.forEach(function (k) {
      try {
        localStorage.removeItem(k);
      } catch (_e) {
        /* noop */
      }
    });
  }

  function clearServerBackedMemory() {
    SERVER_BACKED_STORAGE_KEYS.forEach(function (k) {
      delete serverBackedMemory[k];
    });
  }

  window.AntaresPersistence = {
    read(key, fallback) {
      if (SESSION_MEMORY_ONLY_KEYS.has(key)) {
        purgeSessionMemoryKeyFromDisk(key);
        if (Object.prototype.hasOwnProperty.call(sessionMemoryOnly, key)) {
          return sessionMemoryOnly[key];
        }
        return fallback;
      }
      if (SERVER_BACKED_STORAGE_KEYS.has(key)) {
        if (Object.prototype.hasOwnProperty.call(serverBackedMemory, key)) {
          return serverBackedMemory[key];
        }
        return liftLegacyLocalStorageOnce(key, fallback);
      }
      try {
        var raw = localStorage.getItem(key);
        if (raw === null || raw === undefined) return fallback;
        return JSON.parse(raw) ?? fallback;
      } catch (_err) {
        return fallback;
      }
    },

    write(key, value, opts) {
      opts = opts && typeof opts === "object" ? opts : {};
      var skipSyncSchedule = opts.skipSyncSchedule === true;
      if (SESSION_MEMORY_ONLY_KEYS.has(key)) {
        sessionMemoryOnly[key] = trimArrayRowsIfNeeded(key, value);
        purgeSessionMemoryKeyFromDisk(key);
        return;
      }
      if (SERVER_BACKED_STORAGE_KEYS.has(key)) {
        var stored = trimArrayRowsIfNeeded(key, value);
        serverBackedMemory[key] = stored;
        try {
          localStorage.removeItem(key);
        } catch (_e) {
          /* noop */
        }
        if (!skipSyncSchedule && window.AntaresPortalSync && typeof window.AntaresPortalSync.schedule === "function") {
          window.AntaresPortalSync.schedule(key, stored);
        }
        return;
      }
      var plain = trimArrayRowsIfNeeded(key, value);
      try {
        localStorage.setItem(key, JSON.stringify(plain));
      } catch (_quota) {
        /* QuotaExceededError: preferencia UI; no bloquear la app */
      }
      if (!skipSyncSchedule && window.AntaresPortalSync && typeof window.AntaresPortalSync.schedule === "function") {
        window.AntaresPortalSync.schedule(key, plain);
      }
    },

    remove(key) {
      if (SESSION_MEMORY_ONLY_KEYS.has(key)) {
        delete sessionMemoryOnly[key];
        purgeSessionMemoryKeyFromDisk(key);
        return;
      }
      if (SERVER_BACKED_STORAGE_KEYS.has(key)) {
        delete serverBackedMemory[key];
        try {
          localStorage.removeItem(key);
        } catch (_e) {
          /* noop */
        }
        return;
      }
      localStorage.removeItem(key);
    },

    purgeServerBackedFromDisk,
    clearServerBackedMemory,
    /** @readonly */
    SERVER_BACKED_STORAGE_KEYS
  };
})();
