/**
 * Capa de persistencia del portal: datos de negocio con tabla en PostgreSQL
 * viven en memoria (sesión) y se sincronizan vía GET /portal/bootstrap y POST /portal/sync-key.
 * No se vuelve a escribir JSON masivo en localStorage (evita cuota llena y lentitud).
 *
 * Solo queda en localStorage: sesión (antares_session_v2), preferencias de UI, y claves ajenas al portal.
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

  /** Entradas más recientes primero (unshift); slice conserva el trozo inicial = más nuevos. */
  var CAP_ARRAY_ROWS_BY_KEY = {
    antares_notifications_v2: 500,
    antares_emails_v2: 400
  };

  /** @type {Record<string, unknown>} */
  var serverBackedMemory = {};

  function trimArrayRowsIfNeeded(key, value) {
    var max = CAP_ARRAY_ROWS_BY_KEY[key];
    if (!max || !Array.isArray(value) || value.length <= max) return value;
    return value.slice(0, max);
  }

  /**
   * Una sola vez por clave: si había JSON viejo en localStorage, se sube a memoria y se borra del disco.
   */
  function liftLegacyLocalStorageOnce(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      var parsed = JSON.parse(raw);
      serverBackedMemory[key] = parsed;
      localStorage.removeItem(key);
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

    write(key, value) {
      if (SERVER_BACKED_STORAGE_KEYS.has(key)) {
        var stored = trimArrayRowsIfNeeded(key, value);
        serverBackedMemory[key] = stored;
        try {
          localStorage.removeItem(key);
        } catch (_e) {
          /* noop */
        }
        if (window.AntaresPortalSync && typeof window.AntaresPortalSync.schedule === "function") {
          window.AntaresPortalSync.schedule(key, stored);
        }
        return;
      }
      var plain = trimArrayRowsIfNeeded(key, value);
      localStorage.setItem(key, JSON.stringify(plain));
      if (window.AntaresPortalSync && typeof window.AntaresPortalSync.schedule === "function") {
        window.AntaresPortalSync.schedule(key, plain);
      }
    },

    remove(key) {
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
