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

export function syncPayloadForEditedRow(fullList, editedIdOrRecord) {
  if (editedIdOrRecord == null) return undefined;
  if (typeof editedIdOrRecord === "object" && !Array.isArray(editedIdOrRecord)) {
    if (editedIdOrRecord.id != null && String(editedIdOrRecord.id).trim() !== "") {
      return [editedIdOrRecord];
    }
    return undefined;
  }
  const id = String(editedIdOrRecord).trim();
  if (!id || !Array.isArray(fullList)) return undefined;
  const row = fullList.find((r) => String(r?.id ?? "") === id);
  return row ? [row] : undefined;
}

/** Para mapas (p. ej. tarifas por trayecto): solo las claves tocadas en el guardado. */
export function syncPayloadForEditedObjectKeys(fullObject, keysOrKey) {
  if (!fullObject || typeof fullObject !== "object" || Array.isArray(fullObject)) return undefined;
  const keys = Array.isArray(keysOrKey) ? keysOrKey : [keysOrKey];
  const out = {};
  keys.forEach((rawKey) => {
    const key = String(rawKey ?? "").trim();
    if (key && Object.prototype.hasOwnProperty.call(fullObject, key)) {
      out[key] = fullObject[key];
    }
  });
  return Object.keys(out).length ? out : undefined;
}

/** Filas cuyo objeto cambió (misma referencia en listas antes/después del map). */
export function syncPayloadForChangedRows(beforeList, afterList) {
  if (!Array.isArray(beforeList) || !Array.isArray(afterList)) return undefined;
  const beforeById = new Map(beforeList.map((row) => [String(row?.id ?? ""), row]));
  const changed = afterList.filter((row) => {
    const prev = beforeById.get(String(row?.id ?? ""));
    return prev && prev !== row;
  });
  return changed.length ? changed : undefined;
}

/** Correo recién encolado por `sendEmail` (siempre al inicio del outbox). */
export function syncPayloadForLatestOutboxRow(outbox) {
  const row = Array.isArray(outbox) ? outbox[0] : null;
  return row ? [row] : undefined;
}

/** Sincroniza solo el último correo encolado en memoria. */
export async function writeAwaitServerLatestQueuedEmail(opts = {}) {
  const outbox = read(KEYS.emails, []);
  return writeAwaitServer(KEYS.emails, outbox, {
    ...opts,
    syncData: syncPayloadForLatestOutboxRow(outbox)
  });
}

/**
 * Persiste la lista completa en memoria pero sincroniza con el servidor solo la fila editada.
 * @param {string} storageKeyLike
 * @param {unknown[]} fullList
 * @param {string|object} editedIdOrRecord id o fila ya mergeada
 * @param {object} [opts]
 */
export async function writeAwaitServerEdit(storageKeyLike, fullList, editedIdOrRecord, opts = {}) {
  const syncData = syncPayloadForEditedRow(fullList, editedIdOrRecord);
  return writeAwaitServer(storageKeyLike, fullList, { ...opts, syncData });
}

/** Alias semántico: alta de un solo registro en listas del portal. */
export async function writeAwaitServerCreate(storageKeyLike, fullList, createdIdOrRecord, opts = {}) {
  return writeAwaitServerEdit(storageKeyLike, fullList, createdIdOrRecord, opts);
}

/**
 * Borrado en servidor sin re-enviar todo el catálogo: `deletedIds` + payload vacío.
 * La lista `nextList` sigue guardándose solo en memoria local.
 */
export async function writeAwaitServerDelete(storageKeyLike, nextList, deletedIds, opts = {}) {
  const ids = (Array.isArray(deletedIds) ? deletedIds : [deletedIds])
    .map((id) => String(id || "").trim())
    .filter(Boolean);
  return writeAwaitServer(storageKeyLike, nextList, {
    ...opts,
    syncData: [],
    deletedIds: ids.length ? ids : undefined
  });
}

/**
 * Igual que `writeAwaitServer` pero espera POST /portal/sync-key (PostgreSQL) cuando hay sesión API.
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
