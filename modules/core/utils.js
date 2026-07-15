/**
 * Utilidades puras (sin `state`, `nodes`, persistencia ni DOM).
 * Se exponen en `window` desde `index.html` junto con `config.js` para scripts clásicos.
 */
import {
  CO_TIMEZONE,
  HIRING_OPERATE_CREATE_PANEL_IDS,
  HIRING_OPERATE_SECTION_PANEL,
  HR_VALID_HIRING_WS,
  HR_VALID_PAYROLL_WS,
  HR_VALID_DOCUMENTS_WS,
  HR_VALID_REQUESTS_WS,
  HR_VALID_SST_WS,
  PAYROLL_OPERATE_CREATE_PANEL_IDS,
  PAYROLL_OPERATE_SECTION_PANEL,
  TRANSPORT_TRIPS_OPERATE_CREATE_PANEL_IDS,
  TRANSPORT_TRIPS_OPERATE_SECTION_PANEL,
  VEHICLES_OPERATE_CREATE_PANEL_IDS,
  VEHICLES_OPERATE_SECTION_PANEL
} from "./config.js";
import {
  extractColombianPhoneNationalDigits,
  normalizeLatinForDb,
  normalizePortalPhoneForStorage
} from "../domain/payroll-catalog-sanitize.domain.js";

/** Evita XSS cuando texto de usuario o BD se interpola en HTML. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Valores en atributos HTML entre comillas dobles. */
export function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;");
}

export function isAntaresDebugEnabled() {
  try {
    if (typeof window !== "undefined" && window.__ANTARES_DEBUG__ === true) return true;
    if (typeof window !== "undefined" && window.__ANTARES_ALLOW_DEV_CONSOLE__ === true) return true;
  } catch {
    return false;
  }
  return false;
}

export function devWarn() {
  if (!isAntaresDebugEnabled() || typeof console === "undefined" || !console.warn) return;
  console.warn.apply(console, arguments);
}

export function devError() {
  if (!isAntaresDebugEnabled() || typeof console === "undefined" || !console.error) return;
  console.error.apply(console, arguments);
}

const PAYROLL_DATA_SECTIONS = new Set(["employees", "absences", "runs", "driverPayments", "legal"]);
const PAYROLL_OPERATE_SECTIONS = new Set(["employee", "payroll", "driverPay", "settlement", "absence"]);
const HIRING_OPERATE_SECTIONS = new Set(["position", "vacancy", "candidate", "interview", "contract"]);
const HIRING_DATA_SECTIONS = new Set(["candidates", "vacancies", "interviews", "contracts", "positions"]);
const VEHICLE_SECTIONS = new Set(["fleet", "create", "fuel", "technical"]);
const VEHICLE_WORKSPACES = new Set(["operate", "data"]);
const TRANSPORT_TRIPS_SECTIONS = new Set(["trips", "routes"]);
const TRANSPORT_TRIPS_WORKSPACES = new Set(["operate", "data"]);
const TRANSPORT_TRIPS_LAYOUTS = new Set(["cards", "list"]);
const TRANSPORT_TRIPS_SORTS = new Set(["pickup_asc", "pickup_desc", "value_desc", "value_asc", "status"]);
const ADMIN_USERS_SECTIONS = new Set(["actions", "pending", "users", "companies", "sessions"]);
const HISTORY_WORKSPACES = new Set(["explore", "fleet", "audit"]);

export function normalizePayrollDataSection(value) {
  const v = String(value || "employees");
  return PAYROLL_DATA_SECTIONS.has(v) ? v : "employees";
}

export function normalizePayrollOperateSection(value) {
  const v = String(value || "employee");
  return PAYROLL_OPERATE_SECTIONS.has(v) ? v : "employee";
}

/** Estado de paneles de creación. Por defecto respeta `createPanels`; use `expandActive: true` al cambiar de trámite. */
export function buildModuleCreatePanelsState(panelIds, activePanelId, createPanels = {}, { expandActive = false } = {}) {
  const ids = Array.isArray(panelIds) ? panelIds : [];
  const active = String(activePanelId || "").trim();
  const source = createPanels && typeof createPanels === "object" ? createPanels : {};
  const next = { ...source };
  ids.forEach((rawId) => {
    const id = String(rawId || "").trim();
    if (!id) return;
    if (expandActive) {
      next[id] = id === active;
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(source, id)) {
      next[id] = false;
    }
  });
  return next;
}

export function buildPayrollCreatePanelsState(activeSection, createPanels = {}, { expandActive = false } = {}) {
  const section = normalizePayrollOperateSection(activeSection);
  const activePanel = PAYROLL_OPERATE_SECTION_PANEL[section];
  return buildModuleCreatePanelsState(PAYROLL_OPERATE_CREATE_PANEL_IDS, activePanel, createPanels, { expandActive });
}

export function buildHiringCreatePanelsState(activeSection, createPanels = {}, { expandActive = false } = {}) {
  const section = normalizeHiringOperateSection(activeSection);
  const activePanel = HIRING_OPERATE_SECTION_PANEL[section];
  return buildModuleCreatePanelsState(HIRING_OPERATE_CREATE_PANEL_IDS, activePanel, createPanels, { expandActive });
}

export function buildVehiclesCreatePanelsState(activeSection, createPanels = {}, { expandActive = false } = {}) {
  const section = normalizeVehicleSection(activeSection);
  const activePanel = VEHICLES_OPERATE_SECTION_PANEL[section] || "create-vehicle";
  return buildModuleCreatePanelsState(VEHICLES_OPERATE_CREATE_PANEL_IDS, activePanel, createPanels, { expandActive });
}

export function buildTransportTripsCreatePanelsState(activeSection, createPanels = {}, { expandActive = false } = {}) {
  const section = normalizeTransportTripsSection(activeSection);
  const activePanel = TRANSPORT_TRIPS_OPERATE_SECTION_PANEL[section];
  return buildModuleCreatePanelsState(TRANSPORT_TRIPS_OPERATE_CREATE_PANEL_IDS, activePanel, createPanels, {
    expandActive
  });
}

export function payrollCreatePanelForSection(sectionLike) {
  const section = normalizePayrollOperateSection(sectionLike);
  return PAYROLL_OPERATE_SECTION_PANEL[section] || "create-employee";
}

export function payrollOperateSectionForCreatePanel(panelId) {
  const id = String(panelId || "").trim();
  const hit = Object.entries(PAYROLL_OPERATE_SECTION_PANEL).find(([, panel]) => panel === id);
  return hit ? normalizePayrollOperateSection(hit[0]) : "employee";
}

export function hiringCreatePanelForSection(sectionLike) {
  const section = normalizeHiringOperateSection(sectionLike);
  return HIRING_OPERATE_SECTION_PANEL[section] || "create-position";
}

export function hiringOperateSectionForCreatePanel(panelId) {
  const id = String(panelId || "").trim();
  const hit = Object.entries(HIRING_OPERATE_SECTION_PANEL).find(([, panel]) => panel === id);
  return hit ? normalizeHiringOperateSection(hit[0]) : "position";
}

export function vehiclesCreatePanelForSection(sectionLike) {
  const section = normalizeVehicleSection(sectionLike);
  return VEHICLES_OPERATE_SECTION_PANEL[section] || "create-vehicle";
}

export function vehiclesOperateSectionForCreatePanel(panelId) {
  const id = String(panelId || "").trim();
  const hit = Object.entries(VEHICLES_OPERATE_SECTION_PANEL).find(([, panel]) => panel === id);
  return hit ? normalizeVehicleSection(hit[0]) : "create";
}

export function transportTripsCreatePanelForSection(sectionLike) {
  const section = normalizeTransportTripsSection(sectionLike);
  return TRANSPORT_TRIPS_OPERATE_SECTION_PANEL[section] || "create-trip";
}

export function transportTripsOperateSectionForCreatePanel(panelId) {
  const id = String(panelId || "").trim();
  const hit = Object.entries(TRANSPORT_TRIPS_OPERATE_SECTION_PANEL).find(([, panel]) => panel === id);
  return hit ? normalizeTransportTripsSection(hit[0]) : "trips";
}

export function normalizeHiringOperateSection(value) {
  const v = String(value || "position");
  return HIRING_OPERATE_SECTIONS.has(v) ? v : "position";
}

export function normalizeHiringDataSection(value) {
  const v = String(value || "candidates");
  return HIRING_DATA_SECTIONS.has(v) ? v : "candidates";
}

export function normalizeVehicleSection(value) {
  const v = String(value || "fleet");
  return VEHICLE_SECTIONS.has(v) ? v : "fleet";
}

/** Pantalla principal del módulo Camiones: Registrar (`operate`) | Consultar (`data`). */
export function normalizeVehicleWorkspace(value) {
  const v = String(value || "data");
  if (v === "fleet") return "data";
  if (v === "create" || v === "fuel" || v === "technical") return "operate";
  return VEHICLE_WORKSPACES.has(v) ? v : "data";
}

/** Resuelve la subsección Flota | Alta | Combustible | Taller, incluyendo estado legacy. */
export function resolveVehicleSection(ui) {
  const raw = ui && typeof ui === "object" ? ui : {};
  const legacy = String(raw.workspace || "");
  if (legacy === "fleet" || legacy === "create" || legacy === "fuel" || legacy === "technical") {
    return legacy === "fleet" ? "fleet" : legacy;
  }
  return normalizeVehicleSection(raw.section);
}

/** @deprecated Use `normalizeVehicleSection` — conservado para llamadas legacy. */
export function normalizeVehicleWorkspaceSection(value) {
  return normalizeVehicleSection(value);
}

export function normalizeTransportTripsSection(value) {
  const v = String(value || "trips");
  return TRANSPORT_TRIPS_SECTIONS.has(v) ? v : "trips";
}

/** Pantalla principal del módulo Viajes: Registrar (`operate`) | Consultar (`data`). */
export function normalizeTransportTripsWorkspace(value) {
  const v = String(value || "operate");
  if (v === "trips" || v === "routes") return "operate";
  return TRANSPORT_TRIPS_WORKSPACES.has(v) ? v : "operate";
}

/** Resuelve la subsección Viajes | Trayectos, incluyendo estado legacy donde `workspace` era trips|routes. */
export function resolveTransportTripsSection(ui) {
  const raw = ui && typeof ui === "object" ? ui : {};
  const legacy = String(raw.workspace || "");
  if (legacy === "trips" || legacy === "routes") return legacy;
  return normalizeTransportTripsSection(raw.section);
}

export function normalizeTransportTripsLayout(value) {
  const v = String(value || "cards").trim().toLowerCase();
  if (v === "compact") return "cards";
  return TRANSPORT_TRIPS_LAYOUTS.has(v) ? v : "cards";
}

export function normalizeTransportTripsSort(value) {
  const v = String(value || "pickup_asc");
  return TRANSPORT_TRIPS_SORTS.has(v) ? v : "pickup_asc";
}

export function normalizeAdminUsersSection(value, hasPending = false) {
  const v = String(value || (hasPending ? "pending" : "users"));
  if (!ADMIN_USERS_SECTIONS.has(v)) return hasPending ? "pending" : "users";
  if (v === "pending" && !hasPending) return "users";
  return v;
}

export function normalizeHistoryWorkspace(value) {
  const v = String(value || "explore");
  if (v === "driver") return "explore";
  return HISTORY_WORKSPACES.has(v) ? v : "explore";
}

/** Alineado con apps/api/src/payroll/payroll-frequency.ts */
export function normalizePayrollFrequencyJs(raw) {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s || s.includes("mensual")) return "mensual";
  if (s.includes("quincen")) return "quincenal";
  if (s.includes("catorcen")) return "catorcenal";
  if (s.includes("seman")) return "semanal";
  return "mensual";
}

export function payrollPeriodCalendarYm(periodKey) {
  const key = String(periodKey || "").trim();
  const m = key.match(/^(\d{4}-\d{2})/);
  return m ? m[1] : key.slice(0, 7);
}

/** Rango calendario del mes YYYY-MM o prefijo YYYY-MM-… (puro; usado por nómina y reportes). */
export function monthRange(month) {
  const m = String(month || "").trim();
  if (/^\d{4}-\d{2}$/.test(m)) {
    const [year, monthNum] = m.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return { start, end };
  }
  const ext = /^(\d{4})-(\d{2})(-.+)?$/.exec(m);
  if (ext) {
    const year = Number(ext[1]);
    const monthNum = Number(ext[2]);
    const start = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return { start, end };
  }
  return null;
}

/** Fecha civil de cierre (YYYY-MM-DD) inferida desde `periodo_mes`. */
export function payrollPeriodClosingDateYmd(periodKey) {
  const key = String(periodKey || "").trim();
  const ym = payrollPeriodCalendarYm(key);
  if (!/^\d{4}-\d{2}$/.test(ym)) return "";
  const [y, m] = ym.split("-").map(Number);
  const ld = new Date(y, m, 0).getDate();
  if (/-Q1$/i.test(key)) return `${ym}-15`;
  if (/-Q2$/i.test(key)) return `${ym}-${pad2(ld)}`;
  if (/-C1$/i.test(key)) return `${ym}-14`;
  if (/-C2$/i.test(key)) return `${ym}-${pad2(ld)}`;
  const sm = key.match(/-S(\d+)$/i);
  if (sm) {
    const seg = Number(sm[1]);
    const end = Math.min((seg - 1) * 7 + 7, ld);
    return `${ym}-${pad2(end)}`;
  }
  return `${ym}-${pad2(ld)}`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function payrollCalendarDateUtcNoonFromYmd(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || "").trim());
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0));
}

/** Etiquetas de nómina en tarjetas y tablas: mayúsculas con reglas es-CO. */
export function payrollDisplayLabelUpper(text) {
  return String(text || "").trim().toLocaleUpperCase("es-CO");
}

export function formatPayrollPeriodLabel(periodKey) {
  const key = String(periodKey || "").trim();
  if (!key) return "—";
  const ym = payrollPeriodCalendarYm(key);
  let monthTitle = ym;
  if (monthRange(ym)) {
    const [y, m] = ym.split("-").map(Number);
    monthTitle = new Date(Date.UTC(y, m - 1, 15, 12, 0, 0, 0)).toLocaleDateString("es-CO", {
      month: "long",
      year: "numeric",
      timeZone: CO_TIMEZONE
    });
  }
  const closeYmd = payrollPeriodClosingDateYmd(key);
  const closeDate = closeYmd ? payrollCalendarDateUtcNoonFromYmd(closeYmd) : null;
  const closeLabel =
    closeDate && !Number.isNaN(closeDate.getTime())
      ? closeDate.toLocaleDateString("es-CO", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: CO_TIMEZONE
        })
      : "";
  const closeSuffix = closeLabel ? ` · cierre ${closeLabel}` : "";
  let label = monthTitle;
  if (/-Q1$/i.test(key)) label = `${monthTitle} · 1ª quincena${closeSuffix}`;
  else if (/-Q2$/i.test(key)) label = `${monthTitle} · 2ª quincena${closeSuffix}`;
  else if (/-C1$/i.test(key)) label = `${monthTitle} · 1.er catorcenio${closeSuffix}`;
  else if (/-C2$/i.test(key)) label = `${monthTitle} · 2.º catorcenio${closeSuffix}`;
  else {
    const sm = key.match(/-S(\d+)$/i);
    label = sm ? `${monthTitle} · semana ${sm[1]}${closeSuffix}` : `${monthTitle}${closeSuffix}`;
  }
  return payrollDisplayLabelUpper(label);
}

export function normalizeHrWorkspace(moduleId, workspace) {
  const ws = String(workspace || "");
  if (ws === "overview") return "operate";
  if (moduleId === "payroll") return HR_VALID_PAYROLL_WS.has(ws) ? ws : "operate";
  if (moduleId === "hiring") {
    if (ws === "track") return "data";
    return HR_VALID_HIRING_WS.has(ws) ? ws : "operate";
  }
  if (moduleId === "requests") return HR_VALID_REQUESTS_WS.has(ws) ? ws : "operate";
  if (moduleId === "sst") return HR_VALID_SST_WS.has(ws) ? ws : "operate";
  if (moduleId === "documents") {
    const w = ws.toLowerCase();
    if (w === "operate" || w === "subir" || w === "upload") return "upload";
    if (w === "browse" || w === "consult" || w === "consultar") return "consult";
    if (w === "dossier" || w === "expediente") return "dossier";
    return HR_VALID_DOCUMENTS_WS.has(ws) ? ws : "upload";
  }
  return ws;
}

export function normalizeDocumentsDataSection(section) {
  const s = String(section || "").trim().toLowerCase();
  if (s === "expired" || s === "vencidos") return "expired";
  if (s === "due_soon" || s === "por_vencer" || s === "warning") return "due_soon";
  if (s === "employees" || s === "expedientes" || s === "colaborador") return "all";
  if (s === "gaps" || s === "pendientes" || s === "incompletos") return "gaps";
  return "all";
}

export function normalizeDocumentsOperateSection(section) {
  const s = String(section || "").trim().toLowerCase();
  if (s === "dossier" || s === "expediente") return "dossier";
  if (s === "browse" || s === "consult" || s === "consultar" || s === "carpetas") return "browse";
  return "upload";
}

/** Migra workspace legacy (operate + operateSection) al modelo upload | consult | dossier | data. */
export function resolveDocumentsWorkspace(rawUi) {
  const ui = rawUi || {};
  const ws = String(ui.workspace || "").trim().toLowerCase();
  if (ws === "operate") {
    const sec = normalizeDocumentsOperateSection(ui.operateSection || "upload");
    if (sec === "browse") return "consult";
    if (sec === "dossier") return "dossier";
    return "upload";
  }
  const normalized = normalizeHrWorkspace("documents", ws);
  if (normalized === "operate") {
    const sec = normalizeDocumentsOperateSection(ui.operateSection || "upload");
    if (sec === "browse") return "consult";
    if (sec === "dossier") return "dossier";
    return "upload";
  }
  return normalized;
}

export function normalizeSstDataSection(section) {
  const s = String(section || "").trim().toLowerCase();
  if (s === "audit" || s === "auditoria" || s === "records") return "audit";
  if (s === "reconcile" || s === "reconciliar" || s === "sync") return "reconcile";
  return "due";
}

export function normalizeSstOperateSection(section) {
  const s = String(section || "").trim().toLowerCase();
  if (s === "guide" || s === "guia" || s === "checklist") return "guide";
  return "create";
}

/** Formato fijo: +57 y máximo 10 dígitos nacionales (sin depender de slice(-10) que provocaba dígitos erróneos al editar). */
export function formatColombianPhone(value) {
  let d = String(value || "").replace(/\D/g, "");
  if (d.startsWith("57")) d = d.slice(2);
  d = d.slice(0, 10);
  if (!d) return "";
  const segs = [];
  segs.push(d.slice(0, Math.min(3, d.length)));
  if (d.length > 3) segs.push(d.slice(3, Math.min(6, d.length)));
  if (d.length > 6) segs.push(d.slice(6, Math.min(8, d.length)));
  if (d.length > 8) segs.push(d.slice(8, 10));
  return `+57 ${segs.join(" ")}`.trim();
}

/** 10 dígitos nacionales para inputs de formulario (sin +57). */
export function portalPhoneNationalDigitsForForm(raw) {
  return extractColombianPhoneNationalDigits(raw);
}

/** Solo parte nacional (10 dígitos), mismos grupos que formatColombianPhone sin +57. */
export function formatColombianNationalDisplay(value) {
  let d = portalPhoneNationalDigitsForForm(value);
  if (!d) return "";
  const segs = [];
  segs.push(d.slice(0, Math.min(3, d.length)));
  if (d.length > 3) segs.push(d.slice(3, Math.min(6, d.length)));
  if (d.length > 6) segs.push(d.slice(6, Math.min(8, d.length)));
  if (d.length > 8) segs.push(d.slice(8, 10));
  return segs.join(" ");
}

export function formatGenericNationalDisplay(value, maxLen) {
  let d = String(value || "").replace(/\D/g, "").slice(0, maxLen);
  if (!d) return "";
  const parts = [];
  for (let i = 0; i < d.length; i += 3) {
    parts.push(d.slice(i, i + 3));
  }
  return parts.join(" ");
}

/** Para inputs `type="date"` y datos desde API/pg (DATE, ISO con hora). Opcional DMY vía `AntaresValidation` en globalThis. */
export function normalizePortalDateYmd(raw) {
  if (raw == null || raw === "") return "";
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.toISOString().slice(0, 10);
  const s = String(raw).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const V = typeof globalThis !== "undefined" ? globalThis.AntaresValidation : undefined;
  const dmy = V?.parseDmyToIsoDate?.(s);
  if (dmy) return dmy;
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return "";
}

export function fmtDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CO", { timeZone: CO_TIMEZONE });
}

export function fmtDateOr(value, fallback = "—") {
  const ymd = normalizePortalDateYmd(value);
  if (!ymd) return fallback;
  const V = typeof globalThis !== "undefined" ? globalThis.AntaresValidation : undefined;
  const dmy = V?.formatIsoDateToDmy?.(ymd);
  return dmy || ymd;
}

export function formatColombiaLongDate(dateValue = new Date()) {
  try {
    const raw = new Date(dateValue).toLocaleDateString("es-CO", {
      timeZone: CO_TIMEZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  } catch (_e) {
    return "";
  }
}

export function fmtTimeOnly(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleTimeString("es-CO", {
      timeZone: CO_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (_e) {
    return "—";
  }
}

export function fmtFleetLogDate(value) {
  const s = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return fmtDate(value);
  const [y, m, d] = s.split("-").map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export function getColombiaDateParts(dateValue = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: CO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(dateValue);
  const pick = (type) => parts.find((part) => part.type === type)?.value || "00";
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
    second: pick("second")
  };
}

export function colombiaNowIso() {
  const p = getColombiaDateParts(new Date());
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}-05:00`;
}

export function colombiaTodayIsoDate() {
  const p = getColombiaDateParts(new Date());
  return `${p.year}-${p.month}-${p.day}`;
}

/** Saludo según hora en America/Bogota: mañana antes de mediodía, tarde hasta las 19:00, noche después. */
export function colombiaTimeOfDayGreeting(dateValue = new Date()) {
  const hour = parseInt(getColombiaDateParts(dateValue).hour, 10);
  if (!Number.isFinite(hour) || hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

/** Año calendario después de una fecha `YYYY-MM-DD` (p. ej. vencimiento SOAT un año tras expedición). */
export function addCalendarYearsIsoDate(isoDateStr, years = 1) {
  const raw = String(isoDateStr || "").trim();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  const dt = new Date(y, mo - 1, d);
  if (Number.isNaN(dt.getTime())) return "";
  const n = Number(years);
  const deltaYears = Number.isFinite(n) && n !== 0 ? n : 1;
  dt.setFullYear(dt.getFullYear() + deltaYears);
  const oy = dt.getFullYear();
  const om = String(dt.getMonth() + 1).padStart(2, "0");
  const od = String(dt.getDate()).padStart(2, "0");
  return `${oy}-${om}-${od}`;
}

/** Valor para `input type="datetime-local"` (sin offset): misma pared de reloj que America/Bogota. */
export function colombiaDatetimeLocalString(dateValue = new Date()) {
  const p = getColombiaDateParts(dateValue);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function nowLocalIso() {
  return colombiaNowIso().slice(0, 19);
}

export function nowIso() {
  return colombiaNowIso();
}

export function stampCreatedRecord(record, ts = nowIso()) {
  const audit = portalRecordAuditActorFields("create");
  return {
    ...record,
    createdAt: record?.createdAt || ts,
    updatedAt: record?.updatedAt || ts,
    ...(record?.createdBy || record?.createdByEmail ? {} : audit)
  };
}

export function stampUpdatedRecord(record, ts = nowIso()) {
  return {
    ...record,
    updatedAt: ts,
    ...portalRecordAuditActorFields("update")
  };
}

function portalRecordAuditActorFields(action = "update") {
  const resolveUser =
    typeof globalThis.currentUser === "function"
      ? globalThis.currentUser
      : typeof globalThis.window?.currentUser === "function"
        ? globalThis.window.currentUser
        : null;
  const resolveDisplayName =
    typeof globalThis.getPortalUserDisplayName === "function"
      ? globalThis.getPortalUserDisplayName
      : typeof globalThis.window?.getPortalUserDisplayName === "function"
        ? globalThis.window.getPortalUserDisplayName
        : null;
  const user = resolveUser ? resolveUser() : null;
  if (!user) return {};
  const email = String(user.email || "").trim();
  const rawName = String(user.name || "").trim();
  const display =
    resolveDisplayName && user
      ? String(resolveDisplayName(user) || "").trim()
      : "";
  const name =
    rawName && !rawName.includes("@")
      ? rawName
      : display && display !== "Usuario"
        ? display
        : rawName;
  const label = email || name;
  if (!label) return {};
  if (action === "create") {
    return {
      createdBy: name || email,
      createdByEmail: email,
      createdByUserId: String(user.id || "").trim(),
      updatedBy: name || email,
      updatedByEmail: email,
      updatedByUserId: String(user.id || "").trim()
    };
  }
  return {
    updatedBy: name || email,
    updatedByEmail: email,
    updatedByUserId: String(user.id || "").trim()
  };
}

/** IDs cortos locales (no usar para filas que sincronizan a PostgreSQL con `::uuid`; usar `newUuidV4`). */
export function uid() {
  return Math.random().toString(36).slice(2, 11);
}

/** UUID v4 para entidades que persisten en PostgreSQL (empresas, etc.). */
export function newUuidV4() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidString(value) {
  return typeof value === "string" && UUID_V4_RE.test(value.trim());
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function normalizeLatinUpperForDb(value) {
  return normalizeLatinForDb(value).toUpperCase();
}

export function formatPortalPhoneForDisplay(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const normalized = normalizePortalPhoneForStorage(s);
  return normalized && /\d/.test(normalized) ? normalized : s;
}

/** tipo_persona siempre "Natural" | "Juridica": una sola forma al persistir; las consultas usan = sin LOWER(). */
export function normalizePersonTypeForDb(value) {
  const k = normalizeLatinForDb(value).toLowerCase();
  if (k === "juridica") return "Juridica";
  return "Natural";
}

/** tipo_vinculo_registro / registrationKind: siempre "cliente" | "empleado_interno". */
export function normalizeRegistrationKindForDb(value) {
  const k = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (
    k === "empleado_interno" ||
    k === "empleadointerno" ||
    k === "interno" ||
    k === "usuario_interno"
  ) {
    return "empleado_interno";
  }
  return "cliente";
}

/**
 * Lee el vínculo del formulario de registro/admin sin depender solo de FormData
 * (los radios a veces no llegan bien tras normalización o re-pintado).
 */
export function readRegistrationKindFromForm(formEl, fallback) {
  if (formEl && typeof formEl.querySelector === "function") {
    const checked = formEl.querySelector('input[name="registrationKind"]:checked');
    if (checked && checked.value != null && String(checked.value).trim() !== "") {
      return normalizeRegistrationKindForDb(checked.value);
    }
    const select = formEl.querySelector('select[name="registrationKind"]');
    if (select && select.value != null && String(select.value).trim() !== "") {
      return normalizeRegistrationKindForDb(select.value);
    }
    const hidden = formEl.querySelector('input[type="hidden"][name="registrationKind"]');
    if (hidden && hidden.value != null && String(hidden.value).trim() !== "") {
      return normalizeRegistrationKindForDb(hidden.value);
    }
  }
  return normalizeRegistrationKindForDb(fallback);
}

/** empresas.tipo_relacion_empresa / companyKind: cliente | tercero | propia */
export function normalizeCompanyKindForDb(value) {
  const k = String(value || "")
    .trim()
    .toLowerCase();
  if (k === "tercero") return "tercero";
  if (k === "propia") return "propia";
  return "cliente";
}

export function companyKindLabel(kind) {
  const k = normalizeCompanyKindForDb(kind);
  if (k === "propia") return "Empresa propia (Antares)";
  if (k === "tercero") return "Tercero";
  return "Cliente";
}

/** Normaliza strings en objetos de formulario/autorización (delegado en AntaresValidation cuando existe). */
export function normalizePayloadTextFields(payload) {
  const fn = globalThis.AntaresValidation?.normalizePayloadTextFields;
  if (typeof fn === "function") return fn(payload);
  return payload;
}

export function emptyState(text) {
  return `<div class="empty-state"><svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg><p>${escapeHtml(text)}</p></div>`;
}

export function fieldLabel(icon, text, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const mark = o.required
    ? '<span class="field-required-mark" aria-hidden="true" title="Obligatorio">*</span>'
    : "";
  const help =
    o.help
      ? `<span class="field-help" tabindex="0" role="note" title="${escapeAttr(String(o.help))}" aria-label="${escapeAttr(String(o.help))}">?</span>`
      : "";
  return `<span class="field-label">${icon}<span>${text}</span>${mark}${help}</span>`;
}

export function snapPick(obj, ...keys) {
  if (!obj) return "";
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

export function pickFirstNonEmpty(...vals) {
  for (const v of vals) {
    if (v != null && String(v).trim() !== "") return v;
  }
  return "";
}
