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

/** Textos de interfaz según el programa activo. */
export const SARLAFT_PROGRAM_COPY = Object.freeze({
  sarlaft: {
    kicker: "Prevención LA/FT",
    title: "SARLAFT",
    subtitle:
      "Sistema de Administración del Riesgo de Lavado de Activos y de la Financiación del Terrorismo: conocimiento del tercero, debida diligencia y señales de alerta.",
    kycLabel: "Estado de conocimiento",
    ddLabel: "Debida diligencia",
    operateRail: "Trámite SARLAFT",
    partyNoun: "tercero",
    alertNoun: "alerta LA/FT",
    reviewNoun: "revisión KYC",
    partyTitle: "Registrar tercero (KYC)",
    partyHint: "Conocimiento, consulta de listas y clasificación de riesgo LA/FT",
    alertTitle: "Registrar señal de alerta LA/FT",
    alertHint: "Listas restrictivas, PEP, origen de fondos u operación inusual",
    reviewTitle: "Registrar revisión de debida diligencia",
    reviewHint: "Actualización de conocimiento, listas y decisión de vinculación",
    profileTitle: "Parametrizar matriz SARLAFT",
    profileHint: "Criterios LA/FT, nivel de riesgo y periodicidad de revisión",
    operateParty: { label: "Tercero", hint: "Conocimiento y listas", norm: "KYC" },
    operateAlert: { label: "Alerta LA/FT", hint: "Señal de alerta", norm: "SARLAFT" },
    operateReview: { label: "Revisión KYC", hint: "Debida diligencia", norm: "Gestión" },
    operateProfile: { label: "Matriz", hint: "Perfiles de riesgo", norm: "Metodología" },
    kpiParties: "Terceros en conocimiento",
    kpiAlerts: "Alertas LA/FT abiertas",
    kpiDue: "Revisiones KYC por vencer",
    kpiRisk: "Riesgo alto / crítico",
    consultParties: "Terceros",
    consultAlerts: "Alertas LA/FT",
    consultDue: "Vencimientos KYC",
    consultReviews: "Revisiones",
    emptyParties: "No hay terceros sujetos a SARLAFT en este filtro.",
    emptyAlerts: "No hay señales de alerta LA/FT registradas.",
    emptyDue: "No hay vencimientos de debida diligencia en la ventana de 30 días.",
    emptyReviews: "No hay revisiones de conocimiento registradas.",
    evidenceHint: "Formulario de conocimiento, consulta de listas, origen de fondos o declaración PEP.",
    evidenceDefault: "form_conocimiento_tercero",
    searchPlaceholder: "Buscar tercero, documento, alerta LA/FT o responsable..."
  },
  pte: {
    kicker: "Transparencia y ética",
    title: "PTE",
    subtitle:
      "Programa de Transparencia y Ética Empresarial: conflictos de interés, anticorrupción, código de ética y canal de denuncias.",
    kycLabel: "Estado de vinculación",
    ddLabel: "Seguimiento ético",
    operateRail: "Trámite PTE",
    partyNoun: "contraparte",
    alertNoun: "incidente ético",
    reviewNoun: "seguimiento",
    partyTitle: "Registrar contraparte ética",
    partyHint: "Vinculación sujeta a código de ética, conflictos y transparencia",
    alertTitle: "Registrar incidente ético",
    alertHint: "Conflicto de intereses, soborno, dádiva o denuncia del canal ético",
    reviewTitle: "Registrar seguimiento ético",
    reviewHint: "Observaciones, decisión y cierre del incidente o declaración",
    profileTitle: "Parametrizar matriz PTE",
    profileHint: "Criterios de corrupción, conflicto y periodicidad de revisión",
    operateParty: { label: "Contraparte", hint: "Ética y transparencia", norm: "PTE" },
    operateAlert: { label: "Incidente", hint: "Canal ético / corrupción", norm: "PTE" },
    operateReview: { label: "Seguimiento", hint: "Cierre y observaciones", norm: "Gestión" },
    operateProfile: { label: "Matriz", hint: "Perfiles de riesgo", norm: "Metodología" },
    kpiParties: "Contrapartes PTE",
    kpiAlerts: "Incidentes éticos abiertos",
    kpiDue: "Seguimientos por vencer",
    kpiRisk: "Riesgo alto / crítico",
    consultParties: "Contrapartes",
    consultAlerts: "Incidentes éticos",
    consultDue: "Vencimientos",
    consultReviews: "Seguimientos",
    emptyParties: "No hay contrapartes sujetas a PTE en este filtro.",
    emptyAlerts: "No hay incidentes éticos registrados.",
    emptyDue: "No hay vencimientos de seguimiento ético en la ventana de 30 días.",
    emptyReviews: "No hay seguimientos éticos registrados.",
    evidenceHint: "Código de ética, declaración de conflicto de intereses u otro soporte PTE.",
    evidenceDefault: "codigo_etica_pte",
    searchPlaceholder: "Buscar contraparte, incidente ético o responsable..."
  },
  ambos: {
    kicker: "Cumplimiento",
    title: "SARLAFT / PTE",
    subtitle:
      "Conocimiento de terceros (LA/FT) y Programa de Transparencia y Ética Empresarial: un solo expediente, dos programas.",
    kycLabel: "Estado de conocimiento",
    ddLabel: "Debida diligencia",
    operateRail: "Tipo de trámite",
    partyNoun: "tercero",
    alertNoun: "alerta",
    reviewNoun: "revisión",
    partyTitle: "Registrar tercero",
    partyHint: "Conocimiento KYC, ética empresarial y clasificación de riesgo",
    alertTitle: "Registrar alerta o incidente",
    alertHint: "Señal LA/FT o incidente ético que requiere gestión interna",
    reviewTitle: "Registrar revisión",
    reviewHint: "Debida diligencia, seguimiento ético, responsables y estado",
    profileTitle: "Parametrizar perfil de riesgo",
    profileHint: "Matriz, criterios y periodicidad de revisión SARLAFT/PTE",
    operateParty: { label: "Tercero", hint: "Conocimiento y verificación", norm: "KYC" },
    operateAlert: { label: "Alerta", hint: "LA/FT o incidente ético", norm: "Seguimiento" },
    operateReview: { label: "Revisión", hint: "Observaciones y cierre", norm: "Gestión" },
    operateProfile: { label: "Perfil de riesgo", hint: "Matriz y parametrización", norm: "Metodología" },
    kpiParties: "Terceros",
    kpiAlerts: "Alertas abiertas",
    kpiDue: "Revisiones por vencer",
    kpiRisk: "Riesgo alto / crítico",
    consultParties: "Terceros",
    consultAlerts: "Alertas",
    consultDue: "Vencimientos",
    consultReviews: "Revisiones",
    emptyParties: "No hay terceros registrados.",
    emptyAlerts: "No hay alertas registradas.",
    emptyDue: "No hay vencimientos de revisión en la ventana de 30 días.",
    emptyReviews: "No hay revisiones registradas.",
    evidenceHint: "Soportes KYC (listas, fondos, PEP) o PTE (ética, conflicto de intereses).",
    evidenceDefault: "form_conocimiento_tercero",
    searchPlaceholder: "Buscar tercero, documento, alerta, incidente o responsable..."
  }
});

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
  { value: "listas", label: "Coincidencia en listas restrictivas", program: "sarlaft" },
  { value: "pep", label: "PEP no declarado o cambio de condición PEP", program: "sarlaft" },
  { value: "fondos", label: "Origen de fondos / operación inusual", program: "sarlaft" },
  { value: "laft", label: "Señal de alerta LA/FT", program: "sarlaft" },
  { value: "conflicto", label: "Conflicto de intereses", program: "pte" },
  { value: "soborno", label: "Soborno, dádiva o corrupción", program: "pte" },
  { value: "etica", label: "Incumplimiento del código de ética", program: "pte" },
  { value: "denuncia", label: "Denuncia del canal ético", program: "pte" },
  { value: "alerta", label: "Alerta general", program: "ambos" },
  { value: "novedad", label: "Novedad", program: "ambos" },
  { value: "hallazgo", label: "Hallazgo", program: "ambos" },
  { value: "situacion", label: "Situación", program: "ambos" }
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
  { value: "revision_kyc", label: "Revisión de debida diligencia", program: "sarlaft" },
  { value: "actualizacion_listas", label: "Actualización de listas", program: "sarlaft" },
  { value: "revision_etica", label: "Revisión ética / PTE", program: "pte" },
  { value: "seguimiento_conflicto", label: "Seguimiento de conflicto de intereses", program: "pte" },
  { value: "revision", label: "Revisión periódica", program: "ambos" },
  { value: "observacion", label: "Observación", program: "ambos" },
  { value: "seguimiento", label: "Seguimiento", program: "ambos" }
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

export function normalizeSarlaftProgram(value, fallback = "ambos") {
  return catalogValue(SARLAFT_PROGRAMS, value, fallback);
}

export function sarlaftProgramCopy(program) {
  const key = normalizeSarlaftProgram(program, "ambos");
  return SARLAFT_PROGRAM_COPY[key] || SARLAFT_PROGRAM_COPY.ambos;
}

export function matchesSarlaftProgram(itemProgram, filter) {
  const f = normalizeSarlaftProgram(filter, "ambos");
  if (f === "ambos") return true;
  const p = normalizeSarlaftProgram(itemProgram, "ambos");
  return p === f || p === "ambos";
}

export function sarlaftCatalogForProgram(list, program) {
  const f = normalizeSarlaftProgram(program, "ambos");
  return (list || []).filter((item) => {
    const p = item.program || "ambos";
    if (f === "ambos") return true;
    return p === f || p === "ambos";
  });
}

export function filterSarlaftByProgram(items, program, getProgram) {
  const pick = typeof getProgram === "function" ? getProgram : (row) => row?.program;
  return (items || []).filter((row) => matchesSarlaftProgram(pick(row), program));
}

export function inferSarlaftProgramFromKind(list, kind, fallback = "ambos") {
  const found = (list || []).find((item) => item.value === String(kind || "").trim());
  return normalizeSarlaftProgram(found?.program || fallback, fallback);
}

export function sarlaftReviewAdvancesSchedule(kind) {
  const k = String(kind || "").trim();
  return (
    k === "revision" ||
    k === "revision_kyc" ||
    k === "actualizacion_listas" ||
    k === "revision_etica" ||
    k === "seguimiento"
  );
}

function asBool(value) {
  const v = String(value ?? "").trim().toLowerCase();
  return value === true || v === "true" || v === "1" || v === "t" || v === "si" || v === "sí" || v === "on";
}

function parseCompliance(row = {}) {
  let extra = {};
  const raw = row.cumplimientoJson || row.cumplimiento_json || row.compliance;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) extra = raw;
  else if (typeof raw === "string" && raw.trim().startsWith("{")) {
    try {
      extra = JSON.parse(raw);
    } catch (_err) {
      extra = {};
    }
  }
  return {
    listsChecked: asBool(row.listsChecked ?? extra.listsChecked),
    fundsDeclared: asBool(row.fundsDeclared ?? extra.fundsDeclared),
    beneficialOwner: cleanText(row.beneficialOwner ?? extra.beneficialOwner, 255),
    conflictDeclared: asBool(row.conflictDeclared ?? extra.conflictDeclared),
    ethicsAccepted: asBool(row.ethicsAccepted ?? extra.ethicsAccepted)
  };
}

export function serializeSarlaftCompliance(row = {}) {
  return JSON.stringify({
    listsChecked: Boolean(row.listsChecked),
    fundsDeclared: Boolean(row.fundsDeclared),
    beneficialOwner: cleanText(row.beneficialOwner, 255),
    conflictDeclared: Boolean(row.conflictDeclared),
    ethicsAccepted: Boolean(row.ethicsAccepted)
  });
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
  const compliance = parseCompliance(row);
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
    ...compliance,
    cumplimientoJson: serializeSarlaftCompliance(compliance),
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
  const name = String(party?.name || "")
    .replace(/[\\/]+/g, " ")
    .trim()
    .toLowerCase();
  return (docs || []).filter((doc) => {
    if (!doc || !doc.id) return false;
    if (linked.has(String(doc.id))) return true;
    if (String(doc.entityId || "").trim() === id) return true;
    const folder = String(doc.folder || "").toLowerCase();
    if (name && folder.includes("sarlaft") && folder.includes(name)) return true;
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
    listas: p.listsChecked ? "Sí" : "No",
    fondos: p.fundsDeclared ? "Sí" : "No",
    conflicto: p.conflictDeclared ? "Sí" : "No",
    etica: p.ethicsAccepted ? "Sí" : "No",
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
  { key: "listas", label: "Consulta listas" },
  { key: "fondos", label: "Origen de fondos" },
  { key: "conflicto", label: "Conflicto de intereses" },
  { key: "etica", label: "Código de ética" },
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
