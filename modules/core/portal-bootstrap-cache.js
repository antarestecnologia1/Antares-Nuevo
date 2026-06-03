/**
 * Snapshot del último bootstrap exitoso en sessionStorage (por userId).
 * Tras F5 repone la proyección en RAM al instante; el bootstrap en segundo plano refresca desde PostgreSQL.
 */
(function registerPortalBootstrapCache() {
  var SNAPSHOT_VERSION = 1;
  var SNAPSHOT_KEY_PREFIX = "antares_portal_snapshot_v";
  /** Evita restaurar snapshots de otra pestaña muy antiguos si la sesión quedó abierta días. */
  var MAX_SNAPSHOT_AGE_MS = 12 * 60 * 60 * 1000;

  /** Si sessionStorage se llena, guardar al menos estas claves (orden de prioridad UX). */
  var ESSENTIAL_STORAGE_KEYS = [
    "antares_users_v2",
    "antares_companies_v2",
    "antares_requests_v2",
    "antares_vehicles_v2",
    "antares_drivers_v2",
    "antares_notifications_v2",
    "antares_counters_v2",
    "antares_payroll_employees_v2",
    "antares_payroll_runs_v2",
    "antares_approvals_v2",
    "antares_positions_v2"
  ];

  var lastRestoredExtras = null;

  function snapshotStorageKey(userId) {
    return SNAPSHOT_KEY_PREFIX + SNAPSHOT_VERSION + "_" + String(userId || "").trim();
  }

  function collectDataFromMemory(storageKeys) {
    var P = window.AntaresPersistence;
    if (!P || typeof P.read !== "function") return null;
    var keys = storageKeys;
    if (!keys) {
      keys = P.SERVER_BACKED_STORAGE_KEYS ? Array.from(P.SERVER_BACKED_STORAGE_KEYS) : ESSENTIAL_STORAGE_KEYS;
    }
    var data = {};
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (P.SERVER_BACKED_STORAGE_KEYS && !P.SERVER_BACKED_STORAGE_KEYS.has(key)) continue;
      var val = P.read(key, null);
      if (val !== undefined && val !== null) {
        data[key] = val;
      }
    }
    return data;
  }

  function buildEnvelope(userId, data, extras) {
    return {
      version: SNAPSHOT_VERSION,
      userId: String(userId || "").trim(),
      savedAt: Date.now(),
      data: data && typeof data === "object" ? data : {},
      extras: extras && typeof extras === "object" ? extras : null
    };
  }

  function tryPersistEnvelope(userId, envelope) {
    var key = snapshotStorageKey(userId);
    try {
      sessionStorage.setItem(key, JSON.stringify(envelope));
      return true;
    } catch (err) {
      return false;
    }
  }

  function save(userId, extras) {
    var uid = String(userId || "").trim();
    if (!uid) return false;
    var P = window.AntaresPersistence;
    if (!P) return false;

    var allKeys = P.SERVER_BACKED_STORAGE_KEYS ? Array.from(P.SERVER_BACKED_STORAGE_KEYS) : ESSENTIAL_STORAGE_KEYS;
    var fullData = collectDataFromMemory(allKeys);
    if (!fullData || !Object.keys(fullData).length) return false;

    var envelope = buildEnvelope(uid, fullData, extras);
    if (tryPersistEnvelope(uid, envelope)) return true;

    var essentialData = collectDataFromMemory(ESSENTIAL_STORAGE_KEYS);
    if (!essentialData || !Object.keys(essentialData).length) return false;
    return tryPersistEnvelope(uid, buildEnvelope(uid, essentialData, extras));
  }

  function clear(userId) {
    var uid = String(userId || "").trim();
    if (!uid) return;
    try {
      sessionStorage.removeItem(snapshotStorageKey(uid));
    } catch (_e) {
      /* noop */
    }
    lastRestoredExtras = null;
  }

  function applyDataToMemory(data) {
    var P = window.AntaresPersistence;
    var PS = window.AntaresPortalSync;
    if (!P || typeof P.write !== "function" || !data || typeof data !== "object") return false;
    if (PS && typeof PS.beginBootstrap === "function") PS.beginBootstrap();
    try {
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i += 1) {
        var storageKey = keys[i];
        if (P.SERVER_BACKED_STORAGE_KEYS && !P.SERVER_BACKED_STORAGE_KEYS.has(storageKey)) continue;
        P.write(storageKey, data[storageKey], { skipSyncSchedule: true });
      }
      return keys.length > 0;
    } finally {
      if (PS && typeof PS.endBootstrap === "function") PS.endBootstrap();
    }
  }

  /**
   * Restaura snapshot si coincide userId y no está caducado.
   * @returns {boolean}
   */
  function tryRestore(userId) {
    var uid = String(userId || "").trim();
    if (!uid) return false;
    lastRestoredExtras = null;
    var raw;
    try {
      raw = sessionStorage.getItem(snapshotStorageKey(uid));
    } catch (_read) {
      return false;
    }
    if (!raw) return false;
    var envelope;
    try {
      envelope = JSON.parse(raw);
    } catch (_parse) {
      clear(uid);
      return false;
    }
    if (!envelope || envelope.version !== SNAPSHOT_VERSION || String(envelope.userId || "") !== uid) {
      clear(uid);
      return false;
    }
    var savedAt = Number(envelope.savedAt) || 0;
    if (savedAt > 0 && Date.now() - savedAt > MAX_SNAPSHOT_AGE_MS) {
      clear(uid);
      return false;
    }
    if (!applyDataToMemory(envelope.data)) return false;
    lastRestoredExtras = envelope.extras && typeof envelope.extras === "object" ? envelope.extras : null;
    return true;
  }

  function consumeRestoredExtras() {
    var extras = lastRestoredExtras;
    lastRestoredExtras = null;
    return extras;
  }

  window.PortalBootstrapCache = {
    save: save,
    clear: clear,
    tryRestore: tryRestore,
    consumeRestoredExtras: consumeRestoredExtras
  };
})();
