/**
 * Lectura/escritura de almacenamiento portal (delega en `window.AntaresPersistence` de `persistence.js`).
 */
import { KEYS } from "./config.js";
import { getSession } from "./auth.js";

function capStoredArrayRows(key, value) {
  const caps = { [KEYS.notifications]: 500, [KEYS.emails]: 400 };
  const max = caps[key];
  if (!max || !Array.isArray(value) || value.length <= max) return value;
  return value.slice(0, max);
}

export function read(key, fallback = []) {
  const P = window.AntaresPersistence;
  const normalizeShape = (value) => {
    if (Array.isArray(fallback)) return Array.isArray(value) ? value : fallback;
    if (fallback && typeof fallback === "object") {
      return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
    }
    return value ?? fallback;
  };
  if (P && typeof P.read === "function") return normalizeShape(P.read(key, fallback));
  try {
    return normalizeShape(JSON.parse(localStorage.getItem(key)));
  } catch (_error) {
    return fallback;
  }
}

export function readArray(key) {
  const value = read(key, []);
  return Array.isArray(value) ? value : [];
}

export function write(key, value, opts = {}) {
  const skipSyncSchedule = opts?.skipSyncSchedule === true;
  const P = window.AntaresPersistence;
  if (P && typeof P.write === "function") {
    P.write(key, value, opts);
  } else {
    const stored = capStoredArrayRows(key, value);
    localStorage.setItem(key, JSON.stringify(stored));
    if (!skipSyncSchedule && window.AntaresPortalSync && typeof window.AntaresPortalSync.schedule === "function") {
      window.AntaresPortalSync.schedule(key, stored);
    }
  }
  if (key === KEYS.notifications) {
    try {
      const sess = typeof window.getSession === "function" ? window.getSession() : null;
      if (sess && typeof window.updateNotificationBadge === "function") window.updateNotificationBadge();
    } catch (_e) {
      /* DOM aún sin portal o función no inicializada */
    }
  }
}

/**
 * Igual que `write` pero espera POST /portal/sync-key (PostgreSQL) cuando hay sesión API.
 * En modo sólo navegador (sin URL de API/token) sólo persiste la proyección en memoria.
 * @throws Las mismas errores que `AntaresPortalSync.flushStorageKeyNow` cuando el servidor rechaza tras reintentos.
 */
export async function writeAwaitServer(storageKeyLike, value, opts = {}) {
  write(storageKeyLike, value, { skipSyncSchedule: true });
  const api = window.AntaresApi;
  const sync = window.AntaresPortalSync;
  if (!sync || typeof sync.flushStorageKeyNow !== "function") return;
  const hasApiBase = api && typeof api.getBase === "function" && Boolean(api.getBase());
  if (!hasApiBase) return;
  if (!api.isConfigured?.()) {
    throw new Error("Sesión sin autenticación API. Vuelva a iniciar sesión para guardar en el servidor.");
  }
  const flushOpts = { notifyOnFailure: opts.notifyOnFailure !== false };
  if (opts.syncData !== undefined && opts.syncData !== null) {
    flushOpts.syncData = opts.syncData;
  }
  if (opts.deletedIds && Array.isArray(opts.deletedIds) && opts.deletedIds.length > 0) {
    flushOpts.deletedIds = opts.deletedIds.map((id) => String(id || "").trim()).filter(Boolean);
  }
  await sync.flushStorageKeyNow(storageKeyLike, flushOpts);
}
