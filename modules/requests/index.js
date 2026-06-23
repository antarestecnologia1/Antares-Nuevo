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

  /** Estados canónicos del portal (API / PostgreSQL). */
  const API_STATUS_TO_PORTAL = {
    pendiente: PORTAL_STATUS.PENDIENTE,
    "aprobada pendiente asignacion": PORTAL_STATUS.APROBADA_PENDIENTE_ASIGNACION,
    "viaje asignado": PORTAL_STATUS.VIAJE_ASIGNADO,
    "en transito": PORTAL_STATUS.EN_TRANSITO,
    "espera standby": PORTAL_STATUS.ESPERA_STANDBY,
    completada: PORTAL_STATUS.COMPLETADA,
    cerrada: PORTAL_STATUS.CERRADA,
    cancelada: PORTAL_STATUS.CANCELADA,
    rechazada: PORTAL_STATUS.RECHAZADA,
    aprobada: PORTAL_STATUS.APROBADA_PENDIENTE_ASIGNACION,
    "en_transito": PORTAL_STATUS.EN_TRANSITO
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
    ctx.write(ctx.KEYS.requests, arr, { skipSyncSchedule: true });
  }

  function mapApiStatus(s) {
    const raw = String(s || "").trim();
    if (!raw) return PORTAL_STATUS.PENDIENTE;
    const norm = raw
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (API_STATUS_TO_PORTAL[norm]) return API_STATUS_TO_PORTAL[norm];
    const values = Object.values(PORTAL_STATUS);
    const exact = values.find((v) => v.toLowerCase() === raw.toLowerCase());
    return exact || PORTAL_STATUS.PENDIENTE;
  }

  function mapApiRowToPortal(row, existing) {
    const pickupIso = row.pickupAt
      ? typeof row.pickupAt === "string"
        ? row.pickupAt
        : new Date(row.pickupAt).toISOString()
      : null;
    const etaIso = row.etaDelivery
      ? typeof row.etaDelivery === "string"
        ? row.etaDelivery
        : new Date(row.etaDelivery).toISOString()
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
      serviceType: row.serviceType != null ? row.serviceType : existing?.serviceType,
      refrigeracionTermoking:
        typeof row.refrigeracionTermoking === "boolean"
          ? row.refrigeracionTermoking
          : existing?.refrigeracionTermoking,
      weightKg: row.weightKg,
      fuelles: row.fuelles != null && row.fuelles !== "" ? Number(row.fuelles) : existing?.fuelles,
      pickupAt: pickupIso || existing?.pickupAt,
      etaDelivery: etaIso || existing?.etaDelivery || pickupIso,
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
    const etaRaw = portalPayload?.etaDelivery;
    let etaIso = null;
    if (etaRaw != null && String(etaRaw).trim() !== "") {
      const d = new Date(etaRaw);
      if (Number.isFinite(d.getTime())) etaIso = d.toISOString();
    }
    return {
      origin,
      destination,
      vehicleType: portalPayload.vehicleType,
      serviceType: portalPayload.serviceType,
      weightKg,
      pickupAt,
      ...(etaIso ? { etaDelivery: etaIso } : {})
    };
  }

  async function hydrateFromApiIfEnabled() {
    if (typeof window.applyPortalBootstrapFromApi === "function") {
      return window.applyPortalBootstrapFromApi();
    }
    return false;
  }

  async function createViaApi(portalRow, _pickupAtIso) {
    const api = window.AntaresApi;
    if (!api?.isConfigured?.()) throw new Error("API no configurada");
    /** apps/api persiste solicitudes solo vía POST /portal/sync-key (no hay POST /requests). */
    return { ...portalRow, apiSynced: false };
  }

  async function approveViaApi(requestId) {
    const api = window.AntaresApi;
    if (!api?.isConfigured?.()) return null;
    if (typeof window.applyPortalBootstrapFromApi === "function") {
      return null;
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
    portalToCreateDto,
    mapApiStatus
  };
})();
