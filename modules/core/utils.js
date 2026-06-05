/**
 * Utilidades puras (sin `state`, `nodes`, persistencia ni DOM).
 * Se exponen en `window` desde `index.html` junto con `config.js` para scripts clásicos.
 */
import { CO_TIMEZONE, HR_VALID_HIRING_WS, HR_VALID_PAYROLL_WS } from "./config.js";
import { normalizeLatinForDb, normalizePortalPhoneForStorage } from "../domain/payroll-catalog-sanitize.domain.js";

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
const VEHICLE_MODULE_SECTIONS = new Set(["fleet", "create", "fuel", "technical"]);
const TRANSPORT_TRIPS_WORKSPACES = new Set(["trips", "routes"]);
const TRANSPORT_TRIPS_LAYOUTS = new Set(["cards", "compact"]);
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

export function normalizeHiringOperateSection(value) {
  const v = String(value || "position");
  return HIRING_OPERATE_SECTIONS.has(v) ? v : "position";
}

export function normalizeHiringDataSection(value) {
  const v = String(value || "candidates");
  return HIRING_DATA_SECTIONS.has(v) ? v : "candidates";
}

export function normalizeVehicleWorkspaceSection(value) {
  const v = String(value || "fleet");
  return VEHICLE_MODULE_SECTIONS.has(v) ? v : "fleet";
}

export function normalizeTransportTripsWorkspace(value) {
  const v = String(value || "trips");
  return TRANSPORT_TRIPS_WORKSPACES.has(v) ? v : "trips";
}

export function normalizeTransportTripsLayout(value) {
  const v = String(value || "cards");
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

export function formatPayrollPeriodLabel(periodKey) {
  const key = String(periodKey || "").trim();
  if (!key) return "—";
  const ym = payrollPeriodCalendarYm(key);
  let monthTitle = ym;
  if (monthRange(ym)) {
    const [y, m] = ym.split("-").map(Number);
    monthTitle = new Date(y, m - 1, 15).toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  }
  if (/-Q1$/i.test(key)) return `${monthTitle} · 1ª quincena`;
  if (/-Q2$/i.test(key)) return `${monthTitle} · 2ª quincena`;
  if (/-C1$/i.test(key)) return `${monthTitle} · 1.er catorcenio`;
  if (/-C2$/i.test(key)) return `${monthTitle} · 2.º catorcenio`;
  const sm = key.match(/-S(\d+)$/i);
  if (sm) return `${monthTitle} · semana ${sm[1]}`;
  return key;
}

export function normalizeHrWorkspace(moduleId, workspace) {
  const ws = String(workspace || "");
  if (ws === "overview") return "operate";
  if (moduleId === "payroll") return HR_VALID_PAYROLL_WS.has(ws) ? ws : "operate";
  if (moduleId === "hiring") {
    if (ws === "track") return "data";
    return HR_VALID_HIRING_WS.has(ws) ? ws : "operate";
  }
  return ws;
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

/** Solo parte nacional (10 dígitos), mismos grupos que formatColombianPhone sin +57. */
export function formatColombianNationalDisplay(value) {
  let d = String(value || "").replace(/\D/g, "").slice(0, 10);
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
  return {
    ...record,
    createdAt: record?.createdAt || ts,
    updatedAt: record?.updatedAt || ts
  };
}

export function stampUpdatedRecord(record, ts = nowIso()) {
  return {
    ...record,
    updatedAt: ts
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
    .toLowerCase();
  return k === "empleado_interno" ? "empleado_interno" : "cliente";
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
  return `<span class="field-label">${icon}<span>${text}</span>${mark}</span>`;
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
