/**
 * Sincronización debounced hacia apps/api: POST /api/portal/sync-key
 * Tras cada write() en localStorage (excepto sesión).
 */
(function registerPortalSync() {
  /**
   * En producción no escribimos detalles del error en consola (evita filtrar pistas).
   * Activar depuración: window.__ANTARES_DEBUG_SYNC__ = true o localhost.
   */
  function logPortalSyncFailure(entity, err) {
    try {
      var debug =
        window.__ANTARES_DEBUG_SYNC__ === true ||
        (typeof window.location !== "undefined" &&
          window.location.hostname &&
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"));
      if (!debug) return;
      console.warn("[Antares] portal sync-key", entity, err);
    } catch (_e) {
      /* noop */
    }
  }

  const DEBOUNCE_MS = 450;
  const timers = {};
  const pending = {};
  let bootstrapDepth = 0;

  const EXCLUDED_STORAGE_KEYS = new Set(["antares_session_v2"]);

  const STORAGE_TO_ENTITY = {
    antares_users_v2: "users",
    antares_companies_v2: "companies",
    antares_counters_v2: "counters",
    antares_contacts_v2: "contacts",
    antares_requests_v2: "requests",
    antares_vehicles_v2: "vehicles",
    antares_drivers_v2: "drivers",
    antares_notifications_v2: "notifications",
    antares_emails_v2: "emails",
    antares_payroll_employees_v2: "payrollEmployees",
    antares_payroll_runs_v2: "payrollRuns",
    antares_fuel_logs_v2: "fuelLogs",
    antares_vehicle_technical_logs_v2: "vehicleTechnicalLogs",
    antares_travel_allowance_rules_v2: "travelAllowanceRules",
    antares_vacancies_v2: "vacancies",
    antares_candidates_v2: "candidates",
    antares_positions_v2: "positions",
    antares_interviews_v2: "interviews",
    antares_contracts_v2: "contracts",
    antares_hr_absences_v2: "hrAbsences",
    antares_sst_compliance_v2: "sstCompliance",
    antares_trip_route_rates_v2: "tripRouteRates",
    antares_approvals_v2: "approvals"
  };

  function schedule(storageKey, value) {
    if (bootstrapDepth > 0) return;
    if (EXCLUDED_STORAGE_KEYS.has(storageKey)) return;
    const entity = STORAGE_TO_ENTITY[storageKey];
    if (!entity) return;
    const api = window.AntaresApi;
    if (!api?.isConfigured?.()) return;

    pending[storageKey] = value;
    clearTimeout(timers[storageKey]);
    timers[storageKey] = setTimeout(() => {
      const data = pending[storageKey];
      delete pending[storageKey];
      void flush(entity, data);
    }, DEBOUNCE_MS);
  }

  async function flush(entity, data) {
    const api = window.AntaresApi;
    if (!api?.isConfigured?.()) return;
    try {
      await api.postJson("/portal/sync-key", { key: entity, data });
    } catch (err) {
      logPortalSyncFailure(entity, err);
    }
  }

  window.AntaresPortalSync = {
    schedule,
    STORAGE_TO_ENTITY,
    EXCLUDED_STORAGE_KEYS,
    beginBootstrap() {
      bootstrapDepth += 1;
    },
    endBootstrap() {
      bootstrapDepth = Math.max(0, bootstrapDepth - 1);
    }
  };
})();
