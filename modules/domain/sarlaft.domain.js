/**
 * Dominio SARLAFT / PTE: catálogos, normalización, filtros, KPIs y reportes.
 * Sin dependencias del DOM. Las evidencias se relacionan con Gestión Documental
 * vía entityType=tercero, process=sarlaft y entityId del tercero.
 */

export const SARLAFT_COMPANY_FOLDER = "08. SARLAFT / PTE";
export const SARLAFT_DOCUMENT_PROCESS = "sarlaft";
export const SARLAFT_REVIEW_SOON_DAYS = 30;

export const SARLAFT_PROGRAMS = Object.freeze([
  { value: "sarlaft", label: "SARLAFT" },
  { value: "pte", label: "PTE" },
  { value: "ambos", label: "SARLAFT y PTE" }
]);

export const SARLAFT_PERSON_KINDS = Object.freeze([
  { value: "persona_natural", label: "Persona natural" },
  { value: "persona_juridica", label: "Persona jurídica" }
]);

export const SARLAFT_PARTY_TYPES = Object.freeze([
  { value: "cliente", label: "Cliente" },
  { value: "proveedor", label: "Proveedor" },
  { value: "contratista", label: "Contratista" },
  { value: "empleado", label: "Empleado / colaborador" },
  { value: "conductor", label: "Conductor / tercero operativo" },
  { value: "accionista", label: "Accionista / socio" },
  { value: "pep", label: "PEP" },
  { value: "otro", label: "Otro" }
]);

export const SARLAFT_DOCUMENT_TYPES = Object.freeze([
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "PAS", label: "Pasaporte" },
  { value: "PPT", label: "Permiso por protección temporal" },
  { value: "OTRO", label: "Otro" }
]);

export const SARLAFT_KYC_STATUSES = Object.freeze([
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "aprobado", label: "Aprobado" },
  { value: "observado", label: "Observado" },
  { value: "rechazado", label: "Rechazado" }
]);

export const SARLAFT_DUE_DILIGENCE_LEVELS = Object.freeze([
  { value: "simplificada", label: "Simplificada" },
  { value: "normal", label: "Normal" },
  { value: "intensificada", label: "Intensificada" }
]);

export const SARLAFT_RISK_LEVELS = Object.freeze([
  { value: "bajo", label: "Bajo", color: "#16a34a" },
  { value: "medio", label: "Medio", color: "#ca8a04" },
  { value: "alto", label: "Alto", color: "#ea580c" },
  { value: "critico", label: "Crítico", color: "#dc2626" }
]);

export const SARLAFT_ALERT_KINDS = Object.freeze([
  { value: "alerta", label: "Alerta" },
  { value: "novedad", label: "Novedad" },
  { value: "hallazgo", label: "Hallazgo" },
  { value: "situacion", label: "Situación" }
]);

export const SARLAFT_ALERT_SEVERITIES = Object.freeze([
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" }
]);

export const SARLAFT_ALERT_STATUSES = Object.freeze([
  { value: "abierta", label: "Abierta" },
  { value: "en_gestion", label: "En gestión" },
  { value: "en_revision", label: "En revisión" },
  { value: "cerrada", label: "Cerrada" },
  { value: "desestimada", label: "Desestimada" }
]);

export const SARLAFT_REVIEW_KINDS = Object.freeze([
  { value: "revision", label: "Revisión periódica" },
  { value: "observacion", label: "Observación" },
  { value: "seguimiento", label: "Seguimiento" }
]);

export const SARLAFT_REVIEW_STATUSES = Object.freeze([
  { value: "pendiente", label: "Pendiente" },
  { value: "en_curso", label: "En curso" },
  { value: "cerrada", label: "Cerrada" }
]);

/** Perfiles iniciales alineados a una matriz típica SARLAFT/PTE (parametrizables). */
export const DEFAULT_SARLAFT_RISK_PROFILES = Object.freeze([
  {
    id: "a1b2c3d4-e5f6-4111-8111-000000000001",
    code: "BAJO",
    name: "Riesgo bajo",
    program: "ambos",
    level: "bajo",
    dueDiligenceLevel: "simplificada",
    reviewFrequencyDays: 365,
    criteria:
      "Tercero nacional, sin coincidencia en listas, sin condición PEP, actividad de bajo riesgo y operación habitual de bajo monto.",
    color: "#16a34a",
    active: true
  },
  {
    id: "a1b2c3d4-e5f6-4111-8111-000000000002",
    code: "MEDIO",
    name: "Riesgo medio",
    program: "ambos",
    level: "medio",
    dueDiligenceLevel: "normal",
    reviewFrequencyDays: 180,
    criteria:
      "Proveedor o cliente con operación recurrente, actividad intermedia, zona de atención especial o información incompleta pendiente de complementar.",
    color: "#ca8a04",
    active: true
  },
  {
    id: "a1b2c3d4-e5f6-4111-8111-000000000003",
    code: "ALTO",
    name: "Riesgo alto",
    program: "ambos",
    level: "alto",
    dueDiligenceLevel: "intensificada",
    reviewFrequencyDays: 90,
    criteria:
      "PEP, persona jurídica con beneficiarios opacos, coincidencia no concluyente en listas, o actividad sensible según la matriz del contratante.",
    color: "#ea580c",
    active: true
  },
  {
    id: "a1b2c3d4-e5f6-4111-8111-000000000004",
    code: "CRITICO",
    name: "Riesgo crítico",
    program: "ambos",
    level: "critico",
    dueDiligenceLevel: "intensificada",
    reviewFrequencyDays: 30,
    criteria:
      "Coincidencia confirmada en listas restrictivas, hallazgo de corrupción/soborno, o situación que exige escalamiento inmediato al oficial de cumplimiento.",
    color: "#dc2626",
    active: true
  }
]);

function catalogValue(list, raw, fallback) {
  const v = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  const found = list.find((item) => item.value === v);
  return found ? found.value : fallback;
}

export function sarlaftCatalogLabel(list, value, fallback = "—") {
  const found = (list || []).find((item) => item.value === String(value || "").trim());
  return found ? found.label : fallback;
}

export function sarlaftCatalogOptionsHtml(list, selected = "") {
  const sel = String(selected || "").trim();
  return (list || [])
    .map(
      (item) =>
        `<option value="${item.value}"${item.value === sel ? " selected" : ""}>${item.label}</option>`
    )
    .join("");
}

function cleanText(value, max = 255) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function cleanMultiline(value, max = 4000) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

function isoDateOnly(value) {
  const s = String(value ?? "").trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

function parseDocumentIds(raw) {
  if (Array.isArray(raw)) {
    return [...new Set(raw.map((id) => String(id || "").trim()).filter(Boolean))];
  }
  return String(raw ?? "")
    .split(/[,;\s]+/)
    .map((id) => id.trim())
    .filter(Boolean);
}

function daysUntil(ymd, todayYmd) {
  const due = isoDateOnly(ymd);
  const today = isoDateOnly(todayYmd);
  if (!due || !today) return null;
  const dueTs = new Date(`${due}T12:00:00`).getTime();
  const todayTs = new Date(`${today}T12:00:00`).getTime();
  if (!Number.isFinite(dueTs) || !Number.isFinite(todayTs)) return null;
  return Math.floor((dueTs - todayTs) / 86400000);
}

export function addDaysToIsoDate(ymd, days) {
  const base = isoDateOnly(ymd);
  const n = Number(days);
  if (!base || !Number.isFinite(n)) return "";
  const dt = new Date(`${base}T12:00:00`);
  if (!Number.isFinite(dt.getTime())) return "";
  dt.setDate(dt.getDate() + n);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function computeSarlaftNextReviewDate(profile, fromYmd) {
  const days = Math.max(1, Number(profile?.reviewFrequencyDays) || 180);
  return addDaysToIsoDate(fromYmd, days);
}

export function sarlaftReviewBucket(nextReviewDate, todayYmd, soonDays = SARLAFT_REVIEW_SOON_DAYS) {
  const due = isoDateOnly(nextReviewDate);
  if (!due) return "missing";
  const days = daysUntil(due, todayYmd);
  if (days == null) return "missing";
  if (days < 0) return "expired";
  if (days <= soonDays) return "warning";
  return "ok";
}

export function normalizeSarlaftRiskProfileRow(row = {}) {
  if (!row || typeof row !== "object") return null;
  const id = String(row.id || "").trim();
  if (!id) return null;
  const level = catalogValue(SARLAFT_RISK_LEVELS, row.level || row.nivel, "medio");
  const levelMeta = SARLAFT_RISK_LEVELS.find((item) => item.value === level);
  return {
    id,
    code: cleanText(row.code || row.codigo, 32).toUpperCase() || "PERFIL",
    name: cleanText(row.name || row.nombre, 120) || "Perfil de riesgo",
    program: catalogValue(SARLAFT_PROGRAMS, row.program || row.programa, "ambos"),
    level,
    dueDiligenceLevel: catalogValue(
      SARLAFT_DUE_DILIGENCE_LEVELS,
      row.dueDiligenceLevel || row.nivel_debida_diligencia,
      "normal"
    ),
    reviewFrequencyDays: Math.max(1, Math.min(1095, Number(row.reviewFrequencyDays ?? row.dias_revision) || 180)),
    criteria: cleanMultiline(row.criteria || row.criterios, 4000),
    color: cleanText(row.color, 16) || levelMeta?.color || "#64748b",
    active: row.active !== false && row.activo !== false,
    createdAt: String(row.createdAt || row.fecha_creacion || "").trim(),
    createdBy: cleanText(row.createdBy || row.creado_por, 255) || "Sistema",
    updatedAt: String(row.updatedAt || row.fecha_actualizacion || "").trim(),
    updatedBy: cleanText(row.updatedBy || row.actualizado_por, 255)
  };
}

export function normalizeSarlaftThirdPartyRow(row = {}) {
  if (!row || typeof row !== "object") return null;
  const id = String(row.id || "").trim();
  if (!id) return null;
  const name = cleanText(row.name || row.nombre, 255);
  if (!name) return null;
  const pepRaw = row.pepFlag ?? row.es_pep;
  return {
    id,
    code: cleanText(row.code || row.codigo, 32).toUpperCase(),
    kind: catalogValue(SARLAFT_PERSON_KINDS, row.kind || row.tipo_persona, "persona_natural"),
    partyType: catalogValue(SARLAFT_PARTY_TYPES, row.partyType || row.tipo_vinculo, "proveedor"),
    name,
    tradeName: cleanText(row.tradeName || row.nombre_comercial, 255),
    documentType: catalogValue(SARLAFT_DOCUMENT_TYPES, row.documentType || row.tipo_documento, "CC"),
    documentNumber: cleanText(row.documentNumber || row.numero_documento, 64),
    nit: cleanText(row.nit, 32),
    email: cleanText(row.email || row.correo, 255).toLowerCase(),
    phone: cleanText(row.phone || row.telefono, 64),
    city: cleanText(row.city || row.ciudad, 120),
    department: cleanText(row.department || row.departamento, 120),
    country: cleanText(row.country || row.pais, 80) || "Colombia",
    address: cleanText(row.address || row.direccion, 255),
    economicActivity: cleanText(row.economicActivity || row.actividad_economica, 255),
    program: catalogValue(SARLAFT_PROGRAMS, row.program || row.programa, "ambos"),
    riskProfileId: String(row.riskProfileId || row.id_perfil_riesgo || "").trim(),
    riskLevel: catalogValue(SARLAFT_RISK_LEVELS, row.riskLevel || row.nivel_riesgo, "medio"),
    kycStatus: catalogValue(SARLAFT_KYC_STATUSES, row.kycStatus || row.estado_kyc, "pendiente"),
    dueDiligenceLevel: catalogValue(
      SARLAFT_DUE_DILIGENCE_LEVELS,
      row.dueDiligenceLevel || row.nivel_debida_diligencia,
      "normal"
    ),
    pepFlag: pepRaw === true || pepRaw === "true" || pepRaw === 1 || pepRaw === "1" || pepRaw === "t",
    pepDetails: cleanMultiline(row.pepDetails || row.detalle_pep, 2000),
    nextReviewDate: isoDateOnly(row.nextReviewDate || row.fecha_proxima_revision),
    lastReviewDate: isoDateOnly(row.lastReviewDate || row.fecha_ultima_revision),
    responsibleUserId: String(row.responsibleUserId || row.id_responsable || "").trim(),
    responsibleName: cleanText(row.responsibleName || row.nombre_responsable, 255),
    notes: cleanMultiline(row.notes || row.observaciones, 4000),
    documentIds: parseDocumentIds(row.documentIds || row.ids_documentos),
    createdAt: String(row.createdAt || row.fecha_creacion || "").trim(),
    createdBy: cleanText(row.createdBy || row.creado_por, 255) || "Sistema",
    updatedAt: String(row.updatedAt || row.fecha_actualizacion || "").trim(),
    updatedBy: cleanText(row.updatedBy || row.actualizado_por, 255)
  };
}

export function normalizeSarlaftAlertRow(row = {}) {
  if (!row || typeof row !== "object") return null;
  const id = String(row.id || "").trim();
  if (!id) return null;
  const title = cleanText(row.title || row.titulo, 255);
  if (!title) return null;
  return {
    id,
    thirdPartyId: String(row.thirdPartyId || row.id_tercero || "").trim(),
    thirdPartyName: cleanText(row.thirdPartyName || row.nombre_tercero, 255),
    kind: catalogValue(SARLAFT_ALERT_KINDS, row.kind || row.tipo, "alerta"),
    program: catalogValue(SARLAFT_PROGRAMS, row.program || row.programa, "ambos"),
    severity: catalogValue(SARLAFT_ALERT_SEVERITIES, row.severity || row.severidad, "media"),
    title,
    description: cleanMultiline(row.description || row.descripcion, 4000),
    status: catalogValue(SARLAFT_ALERT_STATUSES, row.status || row.estado, "abierta"),
    responsibleUserId: String(row.responsibleUserId || row.id_responsable || "").trim(),
    responsibleName: cleanText(row.responsibleName || row.nombre_responsable, 255),
    dueDate: isoDateOnly(row.dueDate || row.fecha_limite),
    source: cleanText(row.source || row.origen, 120),
    createdAt: String(row.createdAt || row.fecha_creacion || "").trim(),
    createdBy: cleanText(row.createdBy || row.creado_por, 255) || "Sistema",
    updatedAt: String(row.updatedAt || row.fecha_actualizacion || "").trim(),
    updatedBy: cleanText(row.updatedBy || row.actualizado_por, 255),
    closedAt: String(row.closedAt || row.fecha_cierre || "").trim(),
    closedBy: cleanText(row.closedBy || row.cerrado_por, 255)
  };
}

export function normalizeSarlaftReviewRow(row = {}) {
  if (!row || typeof row !== "object") return null;
  const id = String(row.id || "").trim();
  if (!id) return null;
  return {
    id,
    thirdPartyId: String(row.thirdPartyId || row.id_tercero || "").trim(),
    thirdPartyName: cleanText(row.thirdPartyName || row.nombre_tercero, 255),
    alertId: String(row.alertId || row.id_alerta || "").trim(),
    kind: catalogValue(SARLAFT_REVIEW_KINDS, row.kind || row.tipo, "revision"),
    status: catalogValue(SARLAFT_REVIEW_STATUSES, row.status || row.estado, "pendiente"),
    observations: cleanMultiline(row.observations || row.observaciones, 4000),
    responsibleUserId: String(row.responsibleUserId || row.id_responsable || "").trim(),
    responsibleName: cleanText(row.responsibleName || row.nombre_responsable, 255),
    reviewedAt: isoDateOnly(row.reviewedAt || row.fecha_revision),
    createdAt: String(row.createdAt || row.fecha_creacion || "").trim(),
    createdBy: cleanText(row.createdBy || row.creado_por, 255) || "Sistema",
    updatedAt: String(row.updatedAt || row.fecha_actualizacion || "").trim(),
    updatedBy: cleanText(row.updatedBy || row.actualizado_por, 255)
  };
}

export function applySarlaftTextFilter(items, search, toHaystack) {
  const q = String(search || "")
    .trim()
    .toLowerCase();
  if (!q) return Array.isArray(items) ? items : [];
  return (items || []).filter((item) => String(toHaystack(item) || "").toLowerCase().includes(q));
}

export function paginateSarlaftItems(items, page = 1, pageSize = 10) {
  const list = Array.isArray(items) ? items : [];
  const size = Math.max(5, Number(pageSize) || 10);
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Number(page) || 1), pages);
  const start = (current - 1) * size;
  return { items: list.slice(start, start + size), page: current, pageSize: size, total, pages };
}

export function summarizeSarlaft({ parties = [], alerts = [], reviews = [], todayYmd = "" } = {}) {
  const openAlertStatuses = new Set(["abierta", "en_gestion", "en_revision"]);
  const openAlerts = alerts.filter((a) => openAlertStatuses.has(a.status));
  const criticalAlerts = openAlerts.filter((a) => a.severity === "critica" || a.severity === "alta");
  const pepCount = parties.filter((p) => p.pepFlag).length;
  const pendingKyc = parties.filter((p) => p.kycStatus === "pendiente" || p.kycStatus === "en_proceso").length;
  const highRisk = parties.filter((p) => p.riskLevel === "alto" || p.riskLevel === "critico").length;
  const dueReviews = parties.filter((p) => {
    const bucket = sarlaftReviewBucket(p.nextReviewDate, todayYmd);
    return bucket === "expired" || bucket === "warning";
  }).length;
  const openReviews = reviews.filter((r) => r.status !== "cerrada").length;
  return {
    parties: parties.length,
    pepCount,
    pendingKyc,
    highRisk,
    openAlerts: openAlerts.length,
    criticalAlerts: criticalAlerts.length,
    dueReviews,
    openReviews,
    approved: parties.filter((p) => p.kycStatus === "aprobado").length
  };
}

export function collectSarlaftDueParties(parties, todayYmd, soonDays = SARLAFT_REVIEW_SOON_DAYS) {
  return (parties || [])
    .map((party) => {
      const bucket = sarlaftReviewBucket(party.nextReviewDate, todayYmd, soonDays);
      const days = daysUntil(party.nextReviewDate, todayYmd);
      return { ...party, bucket, days };
    })
    .filter((item) => item.bucket === "expired" || item.bucket === "warning" || item.bucket === "missing")
    .sort((a, b) => {
      const order = { expired: 0, warning: 1, missing: 2 };
      return (order[a.bucket] ?? 9) - (order[b.bucket] ?? 9);
    });
}

export function documentsLinkedToSarlaftParty(docs, party) {
  const id = String(party?.id || "").trim();
  if (!id) return [];
  const linked = new Set((party.documentIds || []).map((x) => String(x)));
  return (docs || []).filter((doc) => {
    if (!doc || !doc.id) return false;
    if (linked.has(String(doc.id))) return true;
    if (String(doc.entityId || "").trim() === id) return true;
    return false;
  });
}

export function buildSarlaftPartyExportRows(parties = [], profiles = []) {
  const profileMap = new Map((profiles || []).map((p) => [String(p.id), p]));
  return parties.map((p) => ({
    codigo: p.code || "",
    tercero: p.name,
    tipo: sarlaftCatalogLabel(SARLAFT_PARTY_TYPES, p.partyType),
    persona: sarlaftCatalogLabel(SARLAFT_PERSON_KINDS, p.kind),
    documento: `${p.documentType} ${p.documentNumber}`.trim(),
    nit: p.nit,
    programa: sarlaftCatalogLabel(SARLAFT_PROGRAMS, p.program),
    perfil: profileMap.get(String(p.riskProfileId))?.name || sarlaftCatalogLabel(SARLAFT_RISK_LEVELS, p.riskLevel),
    riesgo: sarlaftCatalogLabel(SARLAFT_RISK_LEVELS, p.riskLevel),
    kyc: sarlaftCatalogLabel(SARLAFT_KYC_STATUSES, p.kycStatus),
    debida: sarlaftCatalogLabel(SARLAFT_DUE_DILIGENCE_LEVELS, p.dueDiligenceLevel),
    pep: p.pepFlag ? "Sí" : "No",
    proximaRevision: p.nextReviewDate || "",
    responsable: p.responsibleName || "",
    ciudad: p.city || "",
    estado: p.kycStatus
  }));
}

export function buildSarlaftAlertExportRows(alerts = []) {
  return alerts.map((a) => ({
    tipo: sarlaftCatalogLabel(SARLAFT_ALERT_KINDS, a.kind),
    titulo: a.title,
    tercero: a.thirdPartyName || "",
    programa: sarlaftCatalogLabel(SARLAFT_PROGRAMS, a.program),
    severidad: sarlaftCatalogLabel(SARLAFT_ALERT_SEVERITIES, a.severity),
    estado: sarlaftCatalogLabel(SARLAFT_ALERT_STATUSES, a.status),
    limite: a.dueDate || "",
    responsable: a.responsibleName || "",
    origen: a.source || "",
    creado: String(a.createdAt || "").slice(0, 10)
  }));
}

export const SARLAFT_PARTY_EXPORT_COLUMNS = [
  { key: "codigo", label: "Código" },
  { key: "tercero", label: "Tercero" },
  { key: "tipo", label: "Vínculo" },
  { key: "persona", label: "Tipo de persona" },
  { key: "documento", label: "Documento" },
  { key: "nit", label: "NIT" },
  { key: "programa", label: "Programa" },
  { key: "perfil", label: "Perfil de riesgo" },
  { key: "riesgo", label: "Nivel" },
  { key: "kyc", label: "Conocimiento" },
  { key: "debida", label: "Debida diligencia" },
  { key: "pep", label: "PEP" },
  { key: "proximaRevision", label: "Próxima revisión" },
  { key: "responsable", label: "Responsable" },
  { key: "ciudad", label: "Ciudad" }
];

export const SARLAFT_ALERT_EXPORT_COLUMNS = [
  { key: "tipo", label: "Tipo" },
  { key: "titulo", label: "Título" },
  { key: "tercero", label: "Tercero" },
  { key: "programa", label: "Programa" },
  { key: "severidad", label: "Severidad" },
  { key: "estado", label: "Estado" },
  { key: "limite", label: "Fecha límite" },
  { key: "responsable", label: "Responsable" },
  { key: "origen", label: "Origen" },
  { key: "creado", label: "Registrado" }
];

export function nextSarlaftPartyCode(existing = []) {
  const nums = (existing || [])
    .map((row) => String(row.code || "").replace(/\D/g, ""))
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n > 0);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `T-${String(next).padStart(4, "0")}`;
}
