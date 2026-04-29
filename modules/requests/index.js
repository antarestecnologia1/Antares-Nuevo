window.DomainModules = window.DomainModules || {};

(function registerRequestsModule() {
  /** @type {{ KEYS: object; read: Function; write: Function } | null} */
  let ctx = null;

  const PORTAL_STATUS = {
    PENDIENTE: "Pendiente",
    APROBADA_PENDIENTE_ASIGNACION: "Aprobada pendiente asignacion",
    VIAJE_ASIGNADO: "Viaje asignado",
    EN_TRANSITO: "En transito",
    ESPERA_STANDBY: "Espera standby",
    COMPLETADA: "Completada",
    CERRADA: "Cerrada",
    CANCELADA: "Cancelada",
    RECHAZADA: "Rechazada"
  };

  function attachStorage(deps) {
    if (!deps?.KEYS || typeof deps.read !== "function" || typeof deps.write !== "function") return;
    ctx = deps;
  }

  function readAllSync() {
    if (!ctx) return [];
    return ctx.read(ctx.KEYS.requests, []);
  }

  function writeAllSync(arr) {
    if (!ctx) return;
    ctx.write(ctx.KEYS.requests, arr);
  }

  function mapApiStatus(s) {
    const key = String(s || "").toUpperCase();
    const table = {
      PENDIENTE: PORTAL_STATUS.PENDIENTE,
      APROBADA: PORTAL_STATUS.APROBADA_PENDIENTE_ASIGNACION,
      EN_TRANSITO: PORTAL_STATUS.EN_TRANSITO,
      COMPLETADA: PORTAL_STATUS.COMPLETADA,
      CANCELADA: PORTAL_STATUS.CANCELADA,
      RECHAZADA: PORTAL_STATUS.RECHAZADA
    };
    return table[key] || PORTAL_STATUS.PENDIENTE;
  }

  function mapApiRowToPortal(row, existing) {
    const pickupIso = row.pickupAt
      ? typeof row.pickupAt === "string"
        ? row.pickupAt
        : new Date(row.pickupAt).toISOString()
      : null;
    const createdAt = row.createdAt
      ? typeof row.createdAt === "string"
        ? row.createdAt
        : new Date(row.createdAt).toISOString()
      : new Date().toISOString();

    return {
      ...(existing || {}),
      id: row.id,
      clientUserId: row.userId,
      apiSynced: true,
      originDepartment: existing?.originDepartment || "",
      originCity: existing?.originCity || row.origin || "",
      destinationDepartment: existing?.destinationDepartment || "",
      destinationCity: existing?.destinationCity || row.destination || "",
      vehicleType: row.vehicleType,
      weightKg: row.weightKg,
      pickupAt: pickupIso || existing?.pickupAt,
      etaDelivery: existing?.etaDelivery || pickupIso,
      status: mapApiStatus(row.status),
      createdAt: existing?.createdAt || createdAt,
      requestNumber: existing?.requestNumber || String(row.id || "").slice(0, 10)
    };
  }

  function portalToCreateDto(portalPayload, pickupAtIso) {
    const oDept = String(portalPayload.originDepartment || "").trim();
    const oCity = String(portalPayload.originCity || "").trim();
    const oAddr = String(portalPayload.originAddress || "").trim();
    const dDept = String(portalPayload.destinationDepartment || "").trim();
    const dCity = String(portalPayload.destinationCity || "").trim();
    const dAddr = String(portalPayload.destinationAddress || "").trim();
    const origin = [oDept && oCity ? `${oDept}, ${oCity}` : oCity || oDept, oAddr].filter(Boolean).join(" — ");
    const destination = [dDept && dCity ? `${dDept}, ${dCity}` : dCity || dDept, dAddr].filter(Boolean).join(" — ");
    const weightKg = Math.max(1, parseInt(String(portalPayload.weightKg ?? "1"), 10) || 1);
    const pickupAt = new Date(pickupAtIso).toISOString();
    return {
      origin,
      destination,
      vehicleType: portalPayload.vehicleType,
      weightKg,
      pickupAt
    };
  }

  async function hydrateFromApiIfEnabled() {
    if (typeof window.applyPortalBootstrapFromApi === "function") {
      return window.applyPortalBootstrapFromApi();
    }
    const api = window.AntaresApi;
    if (!api?.isConfigured?.()) return false;
    const rows = await api.getJson("/requests");
    if (!Array.isArray(rows)) return false;
    const local = readAllSync();
    const byId = new Map(local.map((r) => [String(r.id), r]));
    const merged = [];
    const seenApi = new Set();
    for (const row of rows) {
      const id = String(row.id);
      seenApi.add(id);
      const existing = byId.get(id);
      merged.push(mapApiRowToPortal(row, existing));
    }
    for (const r of local) {
      const id = String(r.id);
      if (seenApi.has(id)) continue;
      if (r.apiSynced) continue;
      merged.push(r);
    }
    merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    writeAllSync(merged);
    return true;
  }

  async function createViaApi(portalRow, pickupAtIso) {
    const api = window.AntaresApi;
    if (!api?.isConfigured?.()) throw new Error("API no configurada");
    if (typeof window.applyPortalBootstrapFromApi === "function") {
      return { ...portalRow, apiSynced: true };
    }
    const dto = portalToCreateDto(portalRow, pickupAtIso);
    const created = await api.postJson("/requests", dto);
    return mapApiRowToPortal(created, portalRow);
  }

  async function approveViaApi(requestId) {
    const api = window.AntaresApi;
    if (!api?.isConfigured?.()) return null;
    if (typeof window.applyPortalBootstrapFromApi === "function") {
      return { ok: true };
    }
    return api.postJson(`/requests/${encodeURIComponent(String(requestId))}/approve`, {});
  }

  window.DomainModules.requests = {
    attachStorage,
    readAllSync,
    writeAllSync,
    hydrateFromApiIfEnabled,
    createViaApi,
    approveViaApi,
    mapApiRowToPortal,
    portalToCreateDto
  };
})();
