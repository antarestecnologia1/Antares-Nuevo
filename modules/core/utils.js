/**
 * Utilidades puras (sin `state`, `nodes`, persistencia ni DOM).
 * Se exponen en `window` desde `index.html` junto con `config.js` para scripts clásicos.
 */
import { HR_VALID_HIRING_WS, HR_VALID_PAYROLL_WS } from "./config.js";

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
