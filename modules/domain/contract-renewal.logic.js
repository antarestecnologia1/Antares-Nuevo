/**
 * Lógica pura: renovación y aviso de no renovación (CST art. 46–47). Sin I/O ni DOM.
 */
import { colombiaTodayIsoDate } from "../core/utils.js";

export function normalizeContractRenewalYmd(raw) {
  if (raw == null || raw === "") return "";
  const m = String(raw).trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

export function addDaysToContractRenewalYmd(ymd, days) {
  const n = normalizeContractRenewalYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.trunc(days));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addYearsToContractRenewalYmd(ymd, years) {
  const n = normalizeContractRenewalYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + Math.trunc(years));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isFixedTermContractType(contractType) {
  return String(contractType || "").trim() === "Termino fijo";
}

function parseContractRenewalDuration(raw) {
  const text = String(
    raw?.contractDuration ?? raw?.contractDurationText ?? raw?.duracion_contrato_texto ?? ""
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
  return { unit: "anios", amount: 1 };
}

function addMonthsToContractRenewalYmd(ymd, months) {
  const n = normalizeContractRenewalYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + Math.trunc(months));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Fin del plazo contractual a partir del inicio del período y la duración guardada. */
export function resolveContractEndFromPlazoStartYmd(employee, plazoStartYmd) {
  const start = normalizeContractRenewalYmd(plazoStartYmd);
  if (!start) return "";
  const plazo = parseContractRenewalDuration(employee || {});
  if (plazo.unit === "meses") return addMonthsToContractRenewalYmd(start, plazo.amount);
  let cursor = start;
  for (let i = 0; i < plazo.amount; i += 1) {
    cursor = addYearsToContractRenewalYmd(cursor, 1);
    if (!cursor) return "";
  }
  return cursor;
}

/**
 * Sugiere el inicio del nuevo período: día siguiente al fin del período vigente.
 * Si el fin ya venció hace varios ciclos (renovaciones no registradas), avanza hasta el período actual.
 */
export function suggestRenewalPeriodStartYmd(employee) {
  const e = employee || {};
  const today = colombiaTodayIsoDate();
  const plazoStart =
    normalizeContractRenewalYmd(e.contractVigenteStartDate) || normalizeContractRenewalYmd(e.startDate);
  let end = normalizeContractRenewalYmd(e.contractEndDate);
  if (!end && plazoStart) {
    end = resolveContractEndFromPlazoStartYmd(e, plazoStart);
  }
  if (!end) return today;
  if (end >= today) return addDaysToContractRenewalYmd(end, 1);

  const nextStart = addDaysToContractRenewalYmd(end, 1);
  let nextEnd = resolveContractEndFromPlazoStartYmd(e, nextStart);
  if (!nextEnd) return nextStart;
  if (nextEnd >= today) return nextStart;

  let cursorEnd = nextEnd;
  let guard = 0;
  while (cursorEnd < today && guard < 40) {
    const cursorStart = addDaysToContractRenewalYmd(cursorEnd, 1);
    const advanced = resolveContractEndFromPlazoStartYmd(e, cursorStart);
    if (!advanced || advanced === cursorEnd) break;
    cursorEnd = advanced;
    guard += 1;
  }
  return addDaysToContractRenewalYmd(cursorEnd, 1);
}

export function validateContractRenewal(employee, fields) {
  const e = employee || {};
  if (!isFixedTermContractType(e.contractType)) {
    return { ok: false, message: "Solo aplica a contratos a término fijo." };
  }
  const renewalDate = normalizeContractRenewalYmd(fields.renewalDate);
  const periodStart = normalizeContractRenewalYmd(fields.contractVigenteStartDate);
  const contractEnd = normalizeContractRenewalYmd(fields.contractEndDate);
  if (!renewalDate) {
    return { ok: false, message: "Indique la fecha de renovación (firma o acta).", field: "renewalDate" };
  }
  if (!periodStart) {
    return { ok: false, message: "Indique el inicio del nuevo período contractual.", field: "contractVigenteStartDate" };
  }
  if (!contractEnd) {
    return { ok: false, message: "No se pudo calcular la fecha fin del contrato.", field: "contractEndDate" };
  }
  const hire = normalizeContractRenewalYmd(e.startDate);
  if (hire) {
    const maxEnd = addYearsToContractRenewalYmd(hire, 3);
    if (maxEnd && contractEnd > maxEnd) {
      return {
        ok: false,
        message: `El término fijo no puede superar 3 años desde el ingreso (máx. ${maxEnd}, CST art. 46).`,
        field: "contractEndDate"
      };
    }
  }
  const prevEnd = normalizeContractRenewalYmd(e.contractEndDate);
  if (prevEnd && periodStart <= prevEnd) {
    return {
      ok: false,
      message: `El nuevo período debe iniciar después del fin vigente (${prevEnd}).`,
      field: "contractVigenteStartDate"
    };
  }
  return { ok: true, renewalDate, periodStart, contractEnd };
}

export function buildRenewedEmployeePatch(employee, fields) {
  const validated = validateContractRenewal(employee, fields);
  if (!validated.ok) return validated;
  const duration = String(
    fields.contractDuration || employee.contractDuration || employee.contractDurationText || "1 año"
  ).trim();
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
    return { ok: false, message: "Indique la fecha del aviso.", field: "noticeDate" };
  }
  const meta = buildNonRenewalNoticeMeta(e, { todayYmd: noticeDate });
  if (!meta.endYmd) {
    return { ok: false, message: "No hay fecha de fin de contrato para calcular el aviso." };
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
  const lateHtml =
    meta.noticeDeadlineYmd && noticeDate > meta.noticeDeadlineYmd
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
    Este aviso se entrega con la anticipación exigida por la ley (mínimo treinta (30) días calendario antes del
    vencimiento; fecha límite orientativa: <strong>${escapeContractNoticeHtml(meta.deadlineLabel || "—")}</strong>).
  </p>
  ${lateHtml}
  <p>Cordialmente,</p>
  <div class="sign">
    <p>_______________________________________<br />
    Representante legal / Gestión humana<br />
    ${escapeContractNoticeHtml(companyName)}</p>
  </div>
  <p class="muted">Documento generado desde Antares. Revise y firme antes de entregar al colaborador. No sustituye asesoría jurídica.</p>
</body>
</html>`;
}
