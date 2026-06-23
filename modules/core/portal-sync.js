/**
 * POST /api/portal/sync-key tras cada cambio en la proyección en memoria (AntaresPersistence).
 *
 * Contrato operativo:
 * - Los datos de dominio autoritativos viven en PostgreSQL (Nest + sync-key).
 * - El navegador mantiene copia en memoria (RAM) para la vista; ya no usa localStorage masivo para negocio.
 * - Esta capa despacha cada mutación sin retardo perceptible (`DEBOUNCE_MS = 0`) y expone `flushStorageKeyNow`
 *   para esperar la confirmación del servidor en flujos críticos (modales guardar/borrar).
 */
(function registerPortalSync() {
  /**
   * En producción no escribimos detalles del error en consola (evita filtrar pistas).
   * Activar depuración: window.__ANTARES_DEBUG_SYNC__ = true o localhost.
   * Con true: errores en consola y, tras cada POST exitoso, sync-key OK (p. ej. recuento si key=notifications).
   */
  function logPortalSyncFailure(entity, err) {
    try {
      if (window.__ANTARES_DEBUG_SYNC__ !== true && window.__ANTARES_ALLOW_DEV_CONSOLE__ !== true) return;
      const status =
        err && typeof err === "object" && typeof err.status === "number" ? err.status : "";
      console.warn("[Antares] portal sync-key", entity, status ? `HTTP ${status}` : "", err);
    } catch (_e) {
      /* noop */
    }
  }

  /** Debounce mínimo: las mutaciones llegan casi ya a PostgreSQL; evita esperas de 450 ms del UX antiguo. */
  const DEBOUNCE_MS = 0;
  const timers = {};
  const pending = {};
  /** Evita que un `setTimeout(0)` antiguo dispare sync tras `flushStorageKeyNow`. */
  const scheduleGeneration = {};
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
    const gen = (scheduleGeneration[storageKey] || 0) + 1;
    scheduleGeneration[storageKey] = gen;
    timers[storageKey] = setTimeout(() => {
      if (scheduleGeneration[storageKey] !== gen) return;
      const stalePending = pending[storageKey];
      delete pending[storageKey];
      delete timers[storageKey];
      const data = resolveSyncPayloadForStorageKey(storageKey, stalePending);
      if (data === undefined || data === null) return;
      void flush(entity, data, { notifyOnFailure: true }).catch((err) => {
        logPortalSyncFailure(entity, err);
      });
    }, DEBOUNCE_MS);
  }

  var syncFailureNotifyTimer = null;
  var lastSyncFailureWallMs = 0;

  /**
   * Claves respaldadas por PostgreSQL: la fuente de verdad tras `AntaresPersistence.write`
   * es la memoria (`serverBackedMemory`). `pending` solo refleja el último `schedule()` y
   * puede quedar obsoleto si hubo un `write(..., { skipSyncSchedule: true })` (p. ej. borrar
   * notificación + `flushStorageKeyNow`): enviar `pending` viejo rehace UPSERT y revive filas.
   */
  function resolveSyncPayloadForStorageKey(storageKey, stalePending) {
    const P = window.AntaresPersistence;
    if (P && typeof P.read === "function" && P.SERVER_BACKED_STORAGE_KEYS && P.SERVER_BACKED_STORAGE_KEYS.has(storageKey)) {
      return P.read(storageKey, stalePending !== undefined ? stalePending : null);
    }
    if (stalePending !== undefined) return stalePending;
    if (P && typeof P.read === "function") return P.read(storageKey, null);
    return undefined;
  }

  function notifySyncFailureDebounced() {
    try {
      var now = Date.now();
      if (now - lastSyncFailureWallMs < 12000) return;
      lastSyncFailureWallMs = now;
      clearTimeout(syncFailureNotifyTimer);
      syncFailureNotifyTimer = setTimeout(function () {
        if (typeof window.notify === "function") {
          window.notify(
            "No se pudo guardar en el servidor. Verifique la conexion o vuelva a iniciar sesion.",
            "error"
          );
        }
      }, 400);
    } catch (_e) {
      /* noop */
    }
  }

  async function flush(entity, data, opts) {
    opts = opts && typeof opts === "object" ? opts : {};
    const notifyOnFailure = opts.notifyOnFailure !== false;
    const api = window.AntaresApi;
    if (!api?.isConfigured?.()) return;
    var lastErr = null;
    for (var attempt = 0; attempt < 3; attempt += 1) {
      if (attempt > 0) {
        await new Promise(function (r) {
          setTimeout(r, 320 * attempt);
        });
      }
      try {
        const body = { key: entity, data };
        if (opts.deletedIds && Array.isArray(opts.deletedIds) && opts.deletedIds.length > 0) {
          body.deletedIds = opts.deletedIds.map(function (id) {
            return String(id || "").trim();
          }).filter(Boolean);
        }
        await api.postJson("/portal/sync-key", body);
        try {
          if (window.AntaresPortalAuditSync && typeof window.AntaresPortalAuditSync.refreshModuleAuditLogsFromApi === "function") {
            void window.AntaresPortalAuditSync.refreshModuleAuditLogsFromApi({ limit: 800 });
          }
        } catch (_auditRefresh) {
          /* noop */
        }
        if (window.__ANTARES_DEBUG_SYNC__ === true) {
          try {
            var okHint = "";
            if (entity === "notifications" && Array.isArray(data)) {
              okHint = " (" + data.length + " filas en payload)";
            }
            console.info("[Antares] portal sync-key OK:" + okHint, entity);
          } catch (_log) {
            /* noop */
          }
        }
        return;
      } catch (err) {
        lastErr = err;
      }
    }
    logPortalSyncFailure(entity, lastErr);
    try {
      window.dispatchEvent(
        new CustomEvent("antares-portal-sync-failed", { detail: { entity: entity } })
      );
    } catch (_e2) {
      /* noop */
    }
    var errStatus =
      lastErr && typeof lastErr === "object" && typeof lastErr.status === "number" ? lastErr.status : 0;
    /** 403 en segundo plano (p. ej. emails solo admin) no es fallo de red. */
    if (errStatus !== 403 && notifyOnFailure) {
      const apiMsg =
        lastErr && typeof lastErr === "object" && lastErr.message
          ? String(lastErr.message).trim()
          : "";
      if (apiMsg && !/^internal server error$/i.test(apiMsg)) {
        try {
          if (typeof window.notify === "function") {
            window.notify(apiMsg, "error");
          }
        } catch (_e3) {
          /* noop */
        }
      } else {
        notifySyncFailureDebounced();
      }
    }
    const msg =
      lastErr &&
      typeof lastErr === "object" &&
      (lastErr.message || lastErr.errors)
        ? String(lastErr.message || lastErr.errors)
        : "sync-key rechazado";
    throw typeof lastErr === "object" && lastErr instanceof Error ? lastErr : new Error(msg);
  }

  /**
   * Cancela cualquier disparo aplazado de esta clave y envía YA el contenido desde memoria
   * (`AntaresPersistence` o último pendiente). Usar tras `write()` cuando el flujo debe
   * confirmar escritura antes de cerrar modal o refrescar vistas.
   * @throws {Error} si fallan los reintentos al servidor y la sesión API está configurada.
   */
  async function flushStorageKeyNow(storageKey, opts) {
    if (bootstrapDepth > 0) return;
    if (EXCLUDED_STORAGE_KEYS.has(storageKey)) return;
    const entity = STORAGE_TO_ENTITY[storageKey];
    if (!entity) return;

    clearTimeout(timers[storageKey]);
    delete timers[storageKey];
    scheduleGeneration[storageKey] = (scheduleGeneration[storageKey] || 0) + 1;

    var stalePending = pending[storageKey];
    delete pending[storageKey];

    var data =
      opts && opts.syncData !== undefined && opts.syncData !== null
        ? opts.syncData
        : resolveSyncPayloadForStorageKey(storageKey, stalePending);
    if (data === undefined || data === null) return;

    await flush(entity, data, opts);
  }

  /** Envía un payload explícito (p. ej. filas ya mapeadas para PostgreSQL) sin leer de memoria. */
  async function flushEntityNow(entity, data) {
    if (bootstrapDepth > 0) return;
    if (!entity || data === undefined || data === null) return;
    const storageKey = Object.keys(STORAGE_TO_ENTITY).find((k) => STORAGE_TO_ENTITY[k] === entity);
    if (storageKey) {
      clearTimeout(timers[storageKey]);
      delete timers[storageKey];
      delete pending[storageKey];
      scheduleGeneration[storageKey] = (scheduleGeneration[storageKey] || 0) + 1;
    }
    await flush(entity, data);
  }

  window.AntaresPortalSync = {
    schedule,
    STORAGE_TO_ENTITY,
    EXCLUDED_STORAGE_KEYS,
    flushStorageKeyNow,
    flushEntityNow,
    beginBootstrap() {
      bootstrapDepth += 1;
    },
    endBootstrap() {
      bootstrapDepth = Math.max(0, bootstrapDepth - 1);
    }
  };
})();
