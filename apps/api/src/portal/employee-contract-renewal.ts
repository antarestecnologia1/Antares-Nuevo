/** Lógica compartida: contrato a término fijo, fin a 1 año y aviso de no renovación (30 días, CST). */

import { bogotaDaysUntilYmd } from "../common/colombia-time";

export type ContractRenewalStatusSlug = "na" | "unknown" | "active" | "notice_window" | "expired";

export type ContractRenewalMeta = {
  applies: boolean;
  statusSlug: ContractRenewalStatusSlug;
  endYmd: string;
  noticeDeadlineYmd: string;
  daysToEnd: number | null;
  headline: string;
  detail: string;
  pillLabel: string;
};

export function normalizePortalYmd(raw: unknown): string {
  if (raw == null || raw === "") return "";
  const s = String(raw).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  return "";
}

export function isFixedTermContractType(contractType: unknown): boolean {
  return String(contractType || "").trim() === "Termino fijo";
}

export function addCalendarYearsYmd(ymd: string, years = 1): string {
  const n = normalizePortalYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + years);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDaysToYmd(ymd: string, deltaDays: number): string {
  const n = normalizePortalYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.trunc(deltaDays));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysUntilYmd(ymd: string): number {
  const n = normalizePortalYmd(ymd);
  if (!n) return -9999;
  return bogotaDaysUntilYmd(n);
}

export function addCalendarMonthsYmd(ymd: string, months: number): string {
  const n = normalizePortalYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + Math.trunc(months));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseContractDurationPlazo(raw: {
  contractDuration?: unknown;
  contractDurationText?: unknown;
  duracion_contrato_texto?: unknown;
}): { unit: "meses" | "anios"; amount: number } | null {
  const text = String(
    raw.contractDuration ?? raw.contractDurationText ?? raw.duracion_contrato_texto ?? ""
  ).trim();
  const mMes = text.match(/^(\d+)\s*mes(es)?\s*$/i);
  if (mMes) {
    const n = parseInt(mMes[1], 10);
    if (Number.isFinite(n) && n >= 1) return { unit: "meses", amount: n };
  }
  const mAn = text.match(/^(\d+)\s*(años|anos|año|ano)\s*$/i);
  if (mAn) {
    const n = parseInt(mAn[1], 10);
    if (Number.isFinite(n) && n >= 1) return { unit: "anios", amount: n };
  }
  return null;
}

export function resolveContractEndYmd(emp: {
  contractType?: unknown;
  startDate?: unknown;
  contractEndDate?: unknown;
  contractDuration?: unknown;
  contractDurationText?: unknown;
  duracion_contrato_texto?: unknown;
}): string {
  const ct = String(emp.contractType || "").trim();
  if (!isFixedTermContractType(ct)) return normalizePortalYmd(emp.contractEndDate);
  const start = normalizePortalYmd(emp.startDate);
  if (!start) return normalizePortalYmd(emp.contractEndDate);
  const plazo = parseContractDurationPlazo(emp);
  if (plazo?.unit === "meses") return addCalendarMonthsYmd(start, plazo.amount);
  if (plazo?.unit === "anios") {
    let cursor = start;
    for (let i = 0; i < plazo.amount; i += 1) {
      cursor = addCalendarYearsYmd(cursor, 1);
      if (!cursor) return "";
    }
    return cursor;
  }
  const stored = normalizePortalYmd(emp.contractEndDate);
  if (stored) return stored;
  return addCalendarYearsYmd(start, 1);
}

export function computeEmployeeContractRenewalMeta(emp: {
  contractType?: unknown;
  startDate?: unknown;
  contractEndDate?: unknown;
}): ContractRenewalMeta {
  if (!isFixedTermContractType(emp.contractType)) {
    return {
      applies: false,
      statusSlug: "na",
      endYmd: "",
      noticeDeadlineYmd: "",
      daysToEnd: null,
      headline: "",
      detail: "",
      pillLabel: ""
    };
  }
  const endYmd = resolveContractEndYmd(emp);
  if (!endYmd) {
    return {
      applies: true,
      statusSlug: "unknown",
      endYmd: "",
      noticeDeadlineYmd: "",
      daysToEnd: null,
      headline: "Término fijo sin fecha fin",
      detail: "Complete la fecha de ingreso para calcular el plazo de un año.",
      pillLabel: "Sin fecha fin"
    };
  }
  const daysToEnd = daysUntilYmd(endYmd);
  const noticeDeadlineYmd = addDaysToYmd(endYmd, -30);
  let statusSlug: ContractRenewalStatusSlug = "active";
  let headline = `Vence el ${endYmd}`;
  let detail = `Si no renovará el contrato, notifique por escrito al trabajador a más tardar el ${noticeDeadlineYmd} (30 días de anticipación, CST).`;
  let pillLabel = "Vigente";
  if (daysToEnd < 0) {
    statusSlug = "expired";
    headline = "Contrato vencido";
    detail = `El contrato finalizó el ${endYmd}. Revise renovación o terminación laboral.`;
    pillLabel = "Vencido";
  } else if (daysToEnd <= 30) {
    statusSlug = "notice_window";
    headline = `Vence en ${daysToEnd} día${daysToEnd === 1 ? "" : "s"}`;
    detail = `Ventana de aviso: notifique la no renovación antes del ${noticeDeadlineYmd} si no prorrogará el contrato.`;
    pillLabel = "Aviso urgente";
  }
  return {
    applies: true,
    statusSlug,
    endYmd,
    noticeDeadlineYmd,
    daysToEnd,
    headline,
    detail,
    pillLabel
  };
}

export function contractNoticeRefToken(
  employeeId: string,
  endYmd: string,
  statusSlug: string
): string {
  return `[ref:CONTRACT_NOTICE:${String(employeeId).trim()}:${endYmd}:${statusSlug}]`;
}
