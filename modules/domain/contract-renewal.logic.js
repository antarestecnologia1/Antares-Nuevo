/**
 * Lógica pura: renovación y aviso de no renovación (CST art. 46–47). Sin I/O ni DOM.
 */
import { colombiaTodayIsoDate } from "../core/utils.js";

function parseContractRenewalYmdParts(raw) {
  if (raw == null || raw === "") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(raw).trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1) return null;
  if (d > new Date(Date.UTC(y, mo, 0)).getUTCDate()) return null;
  return { y, mo, d };
}

function formatContractRenewalYmdParts(y, mo, d) {
  return `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** `YYYY-MM-DD` válido (rechaza fechas imposibles como 2025-02-30). */
export function normalizeContractRenewalYmd(raw) {
  const p = parseContractRenewalYmdParts(raw);
  return p ? formatContractRenewalYmdParts(p.y, p.mo, p.d) : "";
}

export function addDaysToContractRenewalYmd(ymd, days) {
  const p = parseContractRenewalYmdParts(ymd);
  if (!p) return "";
  const d = new Date(Date.UTC(p.y, p.mo - 1, p.d + Math.trunc(Number(days) || 0)));
  return formatContractRenewalYmdParts(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** Suma meses calendario; si el día no existe en el mes destino, usa el último día (31-ene + 1 mes = 28/29-feb). */
export function addMonthsToContractRenewalYmd(ymd, months) {
  const p = parseContractRenewalYmdParts(ymd);
  if (!p) return "";
  const total = p.y * 12 + (p.mo - 1) + Math.trunc(Number(months) || 0);
  const y = Math.floor(total / 12);
  const mo = (total % 12) + 1;
  const lastDay = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return formatContractRenewalYmdParts(y, mo, Math.min(p.d, lastDay));
}

export function addYearsToContractRenewalYmd(ymd, years) {
  return addMonthsToContractRenewalYmd(ymd, Math.trunc(Number(years) || 0) * 12);
}

export function isFixedTermContractType(contractType) {
  return String(contractType || "").trim() === "Termino fijo";
}

/** Interpreta "N meses" / "N años"; `null` si el texto no es un plazo reconocible. */
export function parseContractRenewalDurationText(raw) {
  const text = String(raw ?? "").trim();
  const mMes = text.match(/^(\d+)\s*mes(es)?\s*$/i);
  if (mMes) {
    const n = parseInt(mMes[1], 10);
    if (Number.isFinite(n) && n >= 1) return { unit: "meses", amount: n, months: n };
  }
  const mAn = text.match(/^(\d+)\s*(años|anos|año|ano)\s*$/i);
  if (mAn) {
    const n = parseInt(mAn[1], 10);
    if (Number.isFinite(n) && n >= 1) return { unit: "anios", amount: n, months: n * 12 };
  }
  return null;
}

function parseContractRenewalDuration(raw) {
  const text = raw?.contractDuration ?? raw?.contractDurationText ?? raw?.duracion_contrato_texto ?? "";
  return parseContractRenewalDurationText(text) || { unit: "anios", amount: 1, months: 12 };
}

function addPlazoToContractRenewalYmd(startYmd, plazo) {
  if (!plazo) return "";
  return addMonthsToContractRenewalYmd(startYmd, plazo.months);
}

/** Fin del plazo contractual a partir del inicio del período y la duración guardada. */
export function resolveContractEndFromPlazoStartYmd(employee, plazoStartYmd) {
  const start = normalizeContractRenewalYmd(plazoStartYmd);
  if (!start) return "";
  return addPlazoToContractRenewalYmd(start, parseContractRenewalDuration(employee || {}));
}

/**
 * Sugiere el inicio del nuevo período. Convención del portal: fin = inicio + plazo y el período
 * siguiente inicia el mismo día del vencimiento.
 * Si venció hace varios ciclos (prórrogas automáticas no registradas, CST art. 46), encadena
 * períodos con el mismo plazo hasta el que contiene la fecha de hoy.
 */
export function suggestRenewalPeriodStartYmd(employee, { todayYmd } = {}) {
  const e = employee || {};
  const today = normalizeContractRenewalYmd(todayYmd) || colombiaTodayIsoDate();
  const plazoStart =
    normalizeContractRenewalYmd(e.contractVigenteStartDate) || normalizeContractRenewalYmd(e.startDate);
  let end = normalizeContractRenewalYmd(e.contractEndDate);
  if (!end && plazoStart) {
    end = resolveContractEndFromPlazoStartYmd(e, plazoStart);
  }
  if (!end) return today;
  if (end >= today) return end;

  let cursorStart = end;
  for (let guard = 0; guard < 400; guard += 1) {
    const cursorEnd = resolveContractEndFromPlazoStartYmd(e, cursorStart);
    if (!cursorEnd || cursorEnd <= cursorStart) break;
    if (cursorEnd > today) return cursorStart;
    cursorStart = cursorEnd;
  }
  return cursorStart;
}

/** Máximo legal por período de término fijo (CST art. 46: hasta 3 años, renovable indefinidamente). */
const FIXED_TERM_MAX_MONTHS = 36;
/** Prórrogas inferiores a 1 año permitidas antes de exigir renovación mínima de 1 año (CST art. 46 par.). */
const FIXED_TERM_MAX_SHORT_RENEWALS = 3;

/** Cuenta renovaciones previas con plazo inferior a 1 año en el historial de `contracts`. */
export function countShortFixedTermRenewals(contractHistory = []) {
  if (!Array.isArray(contractHistory)) return 0;
  return contractHistory.filter((row) => {
    if (!/renovaci/i.test(String(row?.sourceTag || ""))) return false;
    const start = normalizeContractRenewalYmd(row.startDate);
    const end = normalizeContractRenewalYmd(row.endDate);
    if (!start || !end) return false;
    return end < addYearsToContractRenewalYmd(start, 1);
  }).length;
}

/**
 * @param {object} employee  colaborador con fechas normalizadas (`ensureEmployeeContractFields`).
 * @param {object} fields    renewalDate, contractVigenteStartDate, contractDuration, contractEndDate (opcional).
 * @param {{ todayYmd?: string, contractHistory?: object[] }} [opts]
 */
export function validateContractRenewal(employee, fields = {}, opts = {}) {
  const e = employee || {};
  if (!isFixedTermContractType(e.contractType)) {
    return { ok: false, message: "Solo aplica a contratos a término fijo." };
  }
  const today = normalizeContractRenewalYmd(opts.todayYmd) || colombiaTodayIsoDate();
  const renewalDate = normalizeContractRenewalYmd(fields.renewalDate);
  const periodStart = normalizeContractRenewalYmd(fields.contractVigenteStartDate);
  if (!renewalDate) {
    return { ok: false, message: "Indique una fecha de renovación válida (firma o acta).", field: "renewalDate" };
  }
  if (!periodStart) {
    return {
      ok: false,
      message: "Indique una fecha válida de inicio del nuevo período contractual.",
      field: "contractVigenteStartDate"
    };
  }
  const durationText = String(
    fields.contractDuration || e.contractDuration || e.contractDurationText || "1 año"
  ).trim();
  const plazo = parseContractRenewalDurationText(durationText);
  if (!plazo) {
    return {
      ok: false,
      message: "Duración no reconocida. Use, por ejemplo, «6 meses», «12 meses» o «1 año».",
      field: "contractDuration"
    };
  }
  if (plazo.months > FIXED_TERM_MAX_MONTHS) {
    return {
      ok: false,
      message: "Cada período a término fijo no puede superar 3 años (CST art. 46).",
      field: "contractDuration"
    };
  }
  const contractEnd = addPlazoToContractRenewalYmd(periodStart, plazo);
  if (!contractEnd || contractEnd <= periodStart) {
    return { ok: false, message: "No se pudo calcular la fecha fin del contrato.", field: "contractEndDate" };
  }

  const hire = normalizeContractRenewalYmd(e.startDate);
  if (hire && periodStart < hire) {
    return {
      ok: false,
      message: `El nuevo período no puede iniciar antes de la fecha de ingreso (${hire}).`,
      field: "contractVigenteStartDate"
    };
  }
  if (hire && renewalDate < hire) {
    return {
      ok: false,
      message: `La fecha de renovación no puede ser anterior a la fecha de ingreso (${hire}).`,
      field: "renewalDate"
    };
  }
  if (renewalDate > today) {
    return {
      ok: false,
      message: "La fecha de renovación (firma o acta) no puede ser futura.",
      field: "renewalDate"
    };
  }
  const prevEnd = normalizeContractRenewalYmd(e.contractEndDate);
  if (prevEnd && periodStart < prevEnd) {
    return {
      ok: false,
      message: `El nuevo período debe iniciar el día del vencimiento vigente o después (${prevEnd}).`,
      field: "contractVigenteStartDate"
    };
  }
  if (plazo.months < 12 && countShortFixedTermRenewals(opts.contractHistory) >= FIXED_TERM_MAX_SHORT_RENEWALS) {
    return {
      ok: false,
      message:
        "Ya hubo 3 prórrogas inferiores a 1 año: la siguiente renovación debe ser de mínimo 1 año (CST art. 46).",
      field: "contractDuration"
    };
  }
  return { ok: true, renewalDate, periodStart, contractEnd, duration: durationText };
}

export function buildRenewedEmployeePatch(employee, fields, opts = {}) {
  const validated = validateContractRenewal(employee, fields, opts);
  if (!validated.ok) return validated;
  const duration = validated.duration;
  const salaryRaw = fields.baseSalary;
  const baseSalary =
    salaryRaw != null && String(salaryRaw).trim() !== "" ? Number(salaryRaw) : Number(employee.baseSalary);
  return {
    ok: true,
    employee: {
      ...employee,
      startDate: employee.startDate,
      renewalDate: validated.renewalDate,
      nonRenewalNoticeDate: "",
      contractVigenteStartDate: validated.periodStart,
      contractEndDate: validated.contractEnd,
      contractDuration: duration,
      contractDurationText: duration,
      baseSalary: Number.isFinite(baseSalary) ? baseSalary : employee.baseSalary
    }
  };
}

const MONTHS_ES_NOTICE = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];

export function formatContractNoticeDateEs(ymd) {
  const n = normalizeContractRenewalYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return n;
  const day = Number(p[3]);
  const month = MONTHS_ES_NOTICE[Number(p[2]) - 1];
  if (!month || !Number.isFinite(day)) return n;
  return `${day} de ${month} de ${p[1]}`;
}

export function buildNonRenewalNoticeMeta(employee, { todayYmd = colombiaTodayIsoDate() } = {}) {
  const e = employee || {};
  const endYmd = normalizeContractRenewalYmd(e.contractEndDate);
  const noticeDeadlineYmd = endYmd ? addDaysToContractRenewalYmd(endYmd, -30) : "";
  const noticeDateYmd = normalizeContractRenewalYmd(todayYmd) || colombiaTodayIsoDate();
  const lateNotice = Boolean(
    noticeDeadlineYmd && noticeDateYmd > noticeDeadlineYmd
  );
  return {
    endYmd,
    noticeDeadlineYmd,
    noticeDateYmd,
    lateNotice,
    endLabel: formatContractNoticeDateEs(endYmd) || endYmd,
    deadlineLabel: formatContractNoticeDateEs(noticeDeadlineYmd) || noticeDeadlineYmd,
    noticeLabel: formatContractNoticeDateEs(noticeDateYmd) || noticeDateYmd
  };
}

export function validateNonRenewalNotice(employee, fields = {}) {
  const e = employee || {};
  if (!isFixedTermContractType(e.contractType)) {
    return { ok: false, message: "El aviso de no renovación solo aplica a contratos a término fijo." };
  }
  const noticeDate = normalizeContractRenewalYmd(fields.noticeDate || colombiaTodayIsoDate());
  if (!noticeDate) {
    return { ok: false, message: "Indique una fecha de aviso válida.", field: "noticeDate" };
  }
  const meta = buildNonRenewalNoticeMeta(e, { todayYmd: noticeDate });
  if (!meta.endYmd) {
    return { ok: false, message: "No hay fecha de fin de contrato para calcular el aviso." };
  }
  if (noticeDate >= meta.endYmd) {
    return {
      ok: false,
      message: `El aviso debe darse antes del vencimiento (${meta.endYmd}). Sin aviso previo el contrato se prorroga por un período igual (CST art. 46).`,
      field: "noticeDate"
    };
  }
  const periodStart =
    normalizeContractRenewalYmd(e.contractVigenteStartDate) || normalizeContractRenewalYmd(e.startDate);
  if (periodStart && noticeDate < periodStart) {
    return {
      ok: false,
      message: `La fecha del aviso no puede ser anterior al inicio del período vigente (${periodStart}).`,
      field: "noticeDate"
    };
  }
  return {
    ok: true,
    noticeDate,
    lateNotice: Boolean(meta.noticeDeadlineYmd && noticeDate > meta.noticeDeadlineYmd),
    meta
  };
}

export function escapeContractNoticeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildNonRenewalNoticeLetterHtml(employee, opts = {}) {
  const e = employee || {};
  const companyName = String(opts.companyName || "La empresa").trim();
  const city = String(opts.city || e.city || "la ciudad").trim();
  const meta = buildNonRenewalNoticeMeta(e, { todayYmd: opts.noticeDate });
  const noticeDate = normalizeContractRenewalYmd(opts.noticeDate || meta.noticeDateYmd);
  const noticeLabel = formatContractNoticeDateEs(noticeDate) || noticeDate;
  const name = String(e.name || "el(la) trabajador(a)").trim();
  const docType = String(e.documentType || "CC").trim();
  const idDoc = String(e.idDoc || "").trim();
  const position = String(e.position || "su cargo").trim();
  const isLate = Boolean(meta.noticeDeadlineYmd && noticeDate > meta.noticeDeadlineYmd);
  const anticipationHtml = isLate
    ? `La ley exige un aviso mínimo de treinta (30) días calendario antes del vencimiento (fecha límite:
    <strong>${escapeContractNoticeHtml(meta.deadlineLabel || "—")}</strong>).`
    : `Este aviso se entrega con la anticipación exigida por la ley (mínimo treinta (30) días calendario antes del
    vencimiento; fecha límite orientativa: <strong>${escapeContractNoticeHtml(meta.deadlineLabel || "—")}</strong>).`;
  const lateHtml =
    isLate
      ? `<p style="margin:1rem 0;padding:0.75rem 1rem;background:#fef3c7;border-left:4px solid #d97706;font-size:0.9rem"><strong>Atención:</strong> este aviso se genera después del plazo recomendado de 30 días de anticipación (CST art. 47). Revise con asesoría laboral antes de enviarlo.</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Aviso no renovación · ${name}</title>
  <style>
    body { font-family: "Times New Roman", Georgia, serif; max-width: 720px; margin: 2rem auto; color: #111; line-height: 1.55; font-size: 12pt; }
    h1 { font-size: 14pt; text-align: center; text-transform: uppercase; letter-spacing: 0.04em; }
    .meta { margin: 1.5rem 0; }
    .sign { margin-top: 3rem; }
    .muted { color: #444; font-size: 10pt; margin-top: 2rem; }
    @media print { body { margin: 1.2cm; } }
  </style>
</head>
<body>
  <h1>Comunicación de no renovación de contrato a término fijo</h1>
  <p class="meta">${escapeContractNoticeHtml(city)}, ${escapeContractNoticeHtml(noticeLabel)}</p>
  <p>Señor(a)<br /><strong>${escapeContractNoticeHtml(name)}</strong><br />${escapeContractNoticeHtml(docType)} ${escapeContractNoticeHtml(idDoc)}</p>
  <p>Asunto: <strong>Aviso de no renovación de contrato laboral a término fijo</strong></p>
  <p>
    Por medio de la presente, <strong>${escapeContractNoticeHtml(companyName)}</strong> le comunica de manera expresa que
    <strong>no procederá a renovar</strong> su contrato de trabajo a término fijo, el cual vence el
    <strong>${escapeContractNoticeHtml(meta.endLabel)}</strong>, conforme a lo previsto en el artículo 47 del Código Sustantivo del Trabajo.
  </p>
  <p>
    Usted fue vinculado(a) en el cargo de <strong>${escapeContractNoticeHtml(position)}</strong>.
    La terminación del vínculo se producirá al vencimiento del plazo contractual indicado, sin perjuicio de las
    obligaciones legales de liquidación y entrega de certificados que correspondan.
  </p>
  <p>
    ${anticipationHtml}
  </p>
  ${lateHtml}
  <p>Cordialmente,</p>
  <div class="sign">
    <p>_______________________________________<br />
    Representante legal / Gestión humana<br />
    ${escapeContractNoticeHtml(companyName)}</p>
  </div>
  <p class="muted">Documento generado desde Transportes Antares. Revise y firme antes de entregar al colaborador. No sustituye asesoría jurídica.</p>
</body>
</html>`;
}
