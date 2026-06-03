/**
 * Snapshot del bootstrap en sessionStorage (por userId), almacenamiento fragmentado v2.
 *
 * Tras F5 repone la proyección en RAM de forma síncrona; el bootstrap en red refresca PostgreSQL.
 *
 * v2: una entrada por clave de AntaresPersistence — parches O(tamaño de la clave), sin
 * JSON.parse/stringify del dataset entero en cada lectura de notificación o debounce.
 */
(function registerPortalBootstrapCache() {
  var SNAPSHOT_VERSION = 2;
  var LEGACY_SNAPSHOT_VERSION = 1;
  var LEGACY_KEY_PREFIX = "antares_portal_snapshot_v";
  var META_KEY_PREFIX = "antares_portal_meta_v";
  var SHARD_KEY_PREFIX = "antares_portal_shard_v";
  var EXTRAS_KEY_PREFIX = "antares_portal_extras_v";
  var MAX_SNAPSHOT_AGE_MS = 12 * 60 * 60 * 1000;
  var SAVE_DEBOUNCE_MS = 500;
  var SAVE_IDLE_TIMEOUT_MS = 2000;

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
  var pendingUserId = null;
  var pendingExtras = undefined;
  var pendingExtrasSet = false;
  /** @type {Set<string>|null} */
  var pendingDirtyKeys = null;
  var pendingFullSave = false;
  var debounceTimer = null;
  var idleHandle = null;
  /** @type {Record<string, string>} */
  var lastShardFingerprints = {};

  function snapshotStorageKey(userId) {
    return LEGACY_KEY_PREFIX + LEGACY_SNAPSHOT_VERSION + "_" + String(userId || "").trim();
  }

  function metaStorageKey(userId) {
    return META_KEY_PREFIX + SNAPSHOT_VERSION + "_" + String(userId || "").trim();
  }

  function shardStorageKey(userId, storageKey) {
    return SHARD_KEY_PREFIX + SNAPSHOT_VERSION + "_" + String(userId || "").trim() + "_" + String(storageKey || "");
  }

  function extrasStorageKey(userId) {
    return EXTRAS_KEY_PREFIX + SNAPSHOT_VERSION + "_" + String(userId || "").trim();
  }

  function allServerBackedKeys() {
    var P = window.AntaresPersistence;
    if (P && P.SERVER_BACKED_STORAGE_KEYS) return Array.from(P.SERVER_BACKED_STORAGE_KEYS);
    return ESSENTIAL_STORAGE_KEYS.slice();
  }

  function isServerBackedKey(key) {
    var P = window.AntaresPersistence;
    if (P && P.SERVER_BACKED_STORAGE_KEYS) return P.SERVER_BACKED_STORAGE_KEYS.has(key);
    return ESSENTIAL_STORAGE_KEYS.indexOf(key) >= 0;
  }

  function collectDataFromMemory(storageKeys) {
    var P = window.AntaresPersistence;
    if (!P || typeof P.read !== "function") return null;
    var keys = storageKeys;
    if (!keys) keys = allServerBackedKeys();
    var data = {};
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (!isServerBackedKey(key)) continue;
      var val = P.read(key, null);
      if (val !== undefined && val !== null) data[key] = val;
    }
    return data;
  }

  function valueFingerprint(val) {
    if (val == null) return "";
    if (Array.isArray(val)) {
      var n = val.length;
      if (!n) return "a:0";
      var first = val[0];
      var last = val[n - 1];
      var f =
        first && typeof first === "object"
          ? String(first.id || first.uuid || first.code || "")
          : String(first || "");
      var l =
        last && typeof last === "object"
          ? String(last.id || last.uuid || last.code || "")
          : String(last || "");
      return "a:" + n + ":" + f + ":" + l;
    }
    if (typeof val === "object") {
      var keys = Object.keys(val);
      return "o:" + keys.length;
    }
    return "s:1";
  }

  function dataFingerprint(data) {
    if (!data || typeof data !== "object") return "";
    var keys = Object.keys(data).sort();
    var parts = [];
    for (var i = 0; i < keys.length; i += 1) {
      parts.push(keys[i] + "=" + valueFingerprint(data[keys[i]]));
    }
    return parts.join("|");
  }

  function readMeta(userId) {
    var uid = String(userId || "").trim();
    if (!uid) return null;
    var raw;
    try {
      raw = sessionStorage.getItem(metaStorageKey(uid));
    } catch (_read) {
      return null;
    }
    if (!raw) return null;
    try {
      var meta = JSON.parse(raw);
      if (!meta || meta.version !== SNAPSHOT_VERSION || String(meta.userId || "") !== uid) return null;
      var savedAt = Number(meta.savedAt) || 0;
      if (savedAt > 0 && Date.now() - savedAt > MAX_SNAPSHOT_AGE_MS) return null;
      return meta;
    } catch (_parse) {
      return null;
    }
  }

  function writeMeta(userId, meta) {
    try {
      sessionStorage.setItem(metaStorageKey(userId), JSON.stringify(meta));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function readShardRaw(userId, storageKey) {
    try {
      return sessionStorage.getItem(shardStorageKey(userId, storageKey));
    } catch (_e) {
      return null;
    }
  }

  function writeShard(userId, storageKey, value) {
    try {
      sessionStorage.setItem(shardStorageKey(userId, storageKey), JSON.stringify(value));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function removeShard(userId, storageKey) {
    try {
      sessionStorage.removeItem(shardStorageKey(userId, storageKey));
    } catch (_e) {
      /* noop */
    }
  }

  function readExtras(userId) {
    var uid = String(userId || "").trim();
    if (!uid) return null;
    var raw;
    try {
      raw = sessionStorage.getItem(extrasStorageKey(uid));
    } catch (_e) {
      return null;
    }
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_parse) {
      return null;
    }
  }

  function writeExtras(userId, extras) {
    if (!extras || typeof extras !== "object") {
      try {
        sessionStorage.removeItem(extrasStorageKey(userId));
      } catch (_rm) {
        /* noop */
      }
      return true;
    }
    try {
      sessionStorage.setItem(extrasStorageKey(userId), JSON.stringify(extras));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function mergeExtras(existing, incoming) {
    if (!incoming || typeof incoming !== "object") return existing || null;
    var base = existing && typeof existing === "object" ? existing : {};
    var out = {};
    var keys = Object.keys(base);
    for (var i = 0; i < keys.length; i += 1) out[keys[i]] = base[keys[i]];
    var inKeys = Object.keys(incoming);
    for (var j = 0; j < inKeys.length; j += 1) out[inKeys[j]] = incoming[inKeys[j]];
    return out;
  }

  function readLegacyEnvelope(userId) {
    var uid = String(userId || "").trim();
    if (!uid) return null;
    var raw;
    try {
      raw = sessionStorage.getItem(snapshotStorageKey(uid));
    } catch (_read) {
      return null;
    }
    if (!raw) return null;
    try {
      var envelope = JSON.parse(raw);
      if (!envelope || envelope.version !== LEGACY_SNAPSHOT_VERSION || String(envelope.userId || "") !== uid) {
        return null;
      }
      var savedAt = Number(envelope.savedAt) || 0;
      if (savedAt > 0 && Date.now() - savedAt > MAX_SNAPSHOT_AGE_MS) return null;
      return envelope;
    } catch (_parse) {
      return null;
    }
  }

  function removeLegacyEnvelope(userId) {
    try {
      sessionStorage.removeItem(snapshotStorageKey(userId));
    } catch (_e) {
      /* noop */
    }
  }

  function loadShardedData(userId, meta) {
    var data = {};
    var keyList = meta && Array.isArray(meta.keys) && meta.keys.length ? meta.keys : allServerBackedKeys();
    for (var i = 0; i < keyList.length; i += 1) {
      var storageKey = keyList[i];
      if (!isServerBackedKey(storageKey)) continue;
      var raw = readShardRaw(userId, storageKey);
      if (!raw) continue;
      try {
        data[storageKey] = JSON.parse(raw);
      } catch (_parse) {
        /* omit corrupt shard */
      }
    }
    return data;
  }

  function persistShards(userId, data, extras, opts) {
    opts = opts && typeof opts === "object" ? opts : {};
    var uid = String(userId || "").trim();
    if (!uid || !data || typeof data !== "object") return false;

    var keys = Object.keys(data).filter(isServerBackedKey);
    if (!keys.length) return false;

    var meta = readMeta(uid) || {
      version: SNAPSHOT_VERSION,
      userId: uid,
      savedAt: 0,
      keys: [],
      fingerprints: {}
    };
    var fps = meta.fingerprints && typeof meta.fingerprints === "object" ? meta.fingerprints : {};
    var keySet = new Set(Array.isArray(meta.keys) ? meta.keys : []);
    var wroteAny = false;
    var onlyKeys = opts.onlyKeys;

    for (var i = 0; i < keys.length; i += 1) {
      var k = keys[i];
      if (onlyKeys && onlyKeys.indexOf(k) < 0) continue;
      var fp = valueFingerprint(data[k]);
      if (!opts.force && fp && fp === fps[k] && fp === lastShardFingerprints[k]) continue;
      if (!writeShard(uid, k, data[k])) return false;
      fps[k] = fp;
      lastShardFingerprints[k] = fp;
      keySet.add(k);
      wroteAny = true;
    }

    if (!wroteAny && !extras) return true;

    meta.keys = Array.from(keySet).sort();
    meta.fingerprints = fps;
    meta.savedAt = Date.now();
    meta.userId = uid;
    meta.version = SNAPSHOT_VERSION;
    if (!writeMeta(uid, meta)) return false;

    if (extras !== undefined) {
      var merged = mergeExtras(readExtras(uid), extras);
      if (!writeExtras(uid, merged)) return false;
    }
    return true;
  }

  function migrateLegacyToShards(userId, envelope) {
    if (!envelope || !envelope.data) return false;
    var ok = persistShards(userId, envelope.data, envelope.extras, { force: true });
    if (ok) removeLegacyEnvelope(userId);
    return ok;
  }

  function saveNow(userId, extras) {
    var uid = String(userId || "").trim();
    if (!uid) return false;
    if (!window.AntaresPersistence) return false;

    var allKeys = allServerBackedKeys();
    var fullData = collectDataFromMemory(allKeys);
    if (!fullData || !Object.keys(fullData).length) return false;

    if (persistShards(uid, fullData, extras)) return true;

    var essentialData = collectDataFromMemory(ESSENTIAL_STORAGE_KEYS);
    if (!essentialData || !Object.keys(essentialData).length) return false;
    return persistShards(uid, essentialData, extras, { force: true });
  }

  function patchEnvelopeKeys(userId, dirtyKeyList, extras) {
    var uid = String(userId || "").trim();
    if (!uid || !dirtyKeyList || !dirtyKeyList.length) return false;

    var patchData = collectDataFromMemory(dirtyKeyList);
    if (!patchData || !Object.keys(patchData).length) return false;

    if (!readMeta(uid) && readLegacyEnvelope(uid)) {
      return saveNow(uid, extras);
    }

    return persistShards(uid, patchData, extras, { onlyKeys: dirtyKeyList });
  }

  function cancelScheduledSave() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (idleHandle != null) {
      var cancel = window.cancelIdleCallback;
      if (typeof cancel === "function") cancel(idleHandle);
      idleHandle = null;
    }
  }

  function flushPendingSave() {
    var uid = pendingUserId;
    var extras = pendingExtrasSet ? pendingExtras : undefined;
    var dirty = pendingDirtyKeys;
    var full = pendingFullSave;
    pendingUserId = null;
    pendingExtras = undefined;
    pendingExtrasSet = false;
    pendingDirtyKeys = null;
    pendingFullSave = false;
    cancelScheduledSave();
    if (!uid) return false;
    if (!full && dirty && dirty.size > 0) {
      return patchEnvelopeKeys(uid, Array.from(dirty), extras);
    }
    return saveNow(uid, extras);
  }

  /**
   * @param {string} userId
   * @param {object|null|undefined} extras
   * @param {{ full?: boolean, dirtyKeys?: string[] }} [opts]
   */
  function scheduleSave(userId, extras, opts) {
    opts = opts && typeof opts === "object" ? opts : {};
    var uid = String(userId || "").trim();
    if (!uid) return;
    pendingUserId = uid;
    if (extras !== undefined) {
      pendingExtras = extras;
      pendingExtrasSet = true;
    }
    if (opts.full) {
      pendingFullSave = true;
      pendingDirtyKeys = null;
    } else if (!pendingFullSave && opts.dirtyKeys && opts.dirtyKeys.length) {
      if (!pendingDirtyKeys) pendingDirtyKeys = new Set();
      for (var i = 0; i < opts.dirtyKeys.length; i += 1) {
        var k = String(opts.dirtyKeys[i] || "").trim();
        if (k) pendingDirtyKeys.add(k);
      }
    }
    cancelScheduledSave();
    debounceTimer = setTimeout(function runIdleSave() {
      debounceTimer = null;
      var ric = window.requestIdleCallback;
      if (typeof ric === "function") {
        idleHandle = ric(
          function () {
            idleHandle = null;
            flushPendingSave();
          },
          { timeout: SAVE_IDLE_TIMEOUT_MS }
        );
      } else {
        flushPendingSave();
      }
    }, SAVE_DEBOUNCE_MS);
  }

  function save(userId, extras) {
    cancelScheduledSave();
    return saveNow(userId, extras);
  }

  function clear(userId) {
    var uid = String(userId || "").trim();
    cancelScheduledSave();
    pendingFullSave = false;
    lastShardFingerprints = {};
    if (!uid) return;
    var meta = readMeta(uid);
    var keys = meta && Array.isArray(meta.keys) ? meta.keys : allServerBackedKeys();
    for (var i = 0; i < keys.length; i += 1) removeShard(uid, keys[i]);
    try {
      sessionStorage.removeItem(metaStorageKey(uid));
      sessionStorage.removeItem(extrasStorageKey(uid));
      removeLegacyEnvelope(uid);
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
        if (!isServerBackedKey(storageKey)) continue;
        P.write(storageKey, data[storageKey], { skipSyncSchedule: true });
      }
      return keys.length > 0;
    } finally {
      if (PS && typeof PS.endBootstrap === "function") PS.endBootstrap();
    }
  }

  function tryRestore(userId) {
    var uid = String(userId || "").trim();
    if (!uid) return false;
    lastRestoredExtras = null;
    lastShardFingerprints = {};

    var meta = readMeta(uid);
    var data = null;
    var extras = null;

    if (meta) {
      data = loadShardedData(uid, meta);
      extras = readExtras(uid);
      if (meta.fingerprints && typeof meta.fingerprints === "object") {
        lastShardFingerprints = Object.assign({}, meta.fingerprints);
      }
    } else {
      var legacy = readLegacyEnvelope(uid);
      if (!legacy) {
        if (sessionStorage.getItem(snapshotStorageKey(uid)) || sessionStorage.getItem(metaStorageKey(uid))) {
          clear(uid);
        }
        return false;
      }
      data = legacy.data && typeof legacy.data === "object" ? legacy.data : {};
      extras = legacy.extras;
      migrateLegacyToShards(uid, legacy);
    }

    if (!data || !Object.keys(data).length) return false;
    if (!applyDataToMemory(data)) return false;
    lastRestoredExtras = extras && typeof extras === "object" ? extras : null;
    return true;
  }

  function consumeRestoredExtras() {
    var extras = lastRestoredExtras;
    lastRestoredExtras = null;
    return extras;
  }

  /** Edad del snapshot en ms (sharded o legacy); 0 si no hay. */
  function snapshotAgeMs(userId) {
    var uid = String(userId || "").trim();
    if (!uid) return 0;
    var meta = readMeta(uid);
    if (meta && meta.savedAt) return Math.max(0, Date.now() - Number(meta.savedAt));
    var legacy = readLegacyEnvelope(uid);
    if (legacy && legacy.savedAt) return Math.max(0, Date.now() - Number(legacy.savedAt));
    return 0;
  }

  if (typeof window !== "undefined") {
    window.addEventListener(
      "pagehide",
      function () {
        flushPendingSave();
      },
      { capture: true }
    );
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") flushPendingSave();
    });
  }

  window.PortalBootstrapCache = {
    save: save,
    scheduleSave: scheduleSave,
    flush: flushPendingSave,
    clear: clear,
    tryRestore: tryRestore,
    consumeRestoredExtras: consumeRestoredExtras,
    snapshotAgeMs: snapshotAgeMs
  };
})();
