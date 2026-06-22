/**
 * Renovación de contratos a término fijo (Colombia CST art. 46–47).
 * Mantiene fecha de ingreso; actualiza período vigente y fecha de renovación.
 */
import { KEYS } from "../core/config.js";
import { read, writeAwaitServerEdit } from "../core/data-io.js";
import { colombiaTodayIsoDate, stampUpdatedRecord } from "../core/utils.js";
import { upsertContractRecordForEmployee } from "./contracts.domain.js";

function normalizeYmd(raw) {
  if (raw == null || raw === "") return "";
  const m = String(raw).trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

function addDaysToYmd(ymd, days) {
  const n = normalizeYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.trunc(days));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addYearsToYmd(ymd, years) {
  const n = normalizeYmd(ymd);
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

/** Día siguiente al fin del contrato vigente (o +1 año desde inicio vigente). */
export function suggestRenewalPeriodStartYmd(employee) {
  const e = employee || {};
  const end = normalizeYmd(e.contractEndDate);
  if (end) return addDaysToYmd(end, 1);
  const vigente = normalizeYmd(e.contractVigenteStartDate || e.startDate);
  if (!vigente) return colombiaTodayIsoDate();
  return addYearsToYmd(vigente, 1);
}

export function validateContractRenewal(employee, fields) {
  const e = employee || {};
  if (!isFixedTermContractType(e.contractType)) {
    return { ok: false, message: "Solo aplica a contratos a término fijo." };
  }
  const renewalDate = normalizeYmd(fields.renewalDate);
  const periodStart = normalizeYmd(fields.contractVigenteStartDate);
  const contractEnd = normalizeYmd(fields.contractEndDate);
  if (!renewalDate) {
    return { ok: false, message: "Indique la fecha de renovación (firma o acta).", field: "renewalDate" };
  }
  if (!periodStart) {
    return { ok: false, message: "Indique el inicio del nuevo período contractual.", field: "contractVigenteStartDate" };
  }
  if (!contractEnd) {
    return { ok: false, message: "No se pudo calcular la fecha fin del contrato.", field: "contractEndDate" };
  }
  const hire = normalizeYmd(e.startDate);
  if (hire) {
    const maxEnd = addYearsToYmd(hire, 3);
    if (maxEnd && contractEnd > maxEnd) {
      return {
        ok: false,
        message: `El término fijo no puede superar 3 años desde el ingreso (máx. ${maxEnd}, CST art. 46).`,
        field: "contractEndDate"
      };
    }
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
      contractVigenteStartDate: validated.periodStart,
      contractEndDate: validated.contractEnd,
      contractDuration: duration,
      contractDurationText: duration,
      baseSalary: Number.isFinite(baseSalary) ? baseSalary : employee.baseSalary
    }
  };
}

/**
 * Persiste renovación: empleado (sin tocar ingreso), nuevo registro en contratos y Word opcional.
 */
export async function executeEmployeeContractRenewal(employee, fields, opts = {}) {
  const built = buildRenewedEmployeePatch(employee, fields);
  if (!built.ok) return built;
  const renewed = built.employee;
  const all = read(KEYS.payrollEmployees, []);
  const idx = all.findIndex((row) => String(row.id) === String(employee.id));
  if (idx < 0) return { ok: false, message: "Colaborador no encontrado." };

  const saved = stampUpdatedRecord({ ...all[idx], ...renewed, id: all[idx].id });
  const nextList = all.map((row, i) => (i === idx ? saved : row));
  try {
    await writeAwaitServerEdit(KEYS.payrollEmployees, nextList, saved);
  } catch (err) {
    return { ok: false, message: String(err?.message || "No se pudo guardar la renovación.") };
  }

  const contractResult = await upsertContractRecordForEmployee(saved, {
    signDate: renewed.contractVigenteStartDate,
    renewalDate: renewed.renewalDate,
    endDate: renewed.contractEndDate,
    sourceTag: "Renovación contrato término fijo",
    notifyOnFailure: false
  });

  if (opts.generateWord && typeof globalThis.generateOfficialWordContract === "function") {
    try {
      const payload =
        typeof globalThis.buildEmployeeContractDocxPayload === "function"
          ? globalThis.buildEmployeeContractDocxPayload(saved, {
              signDate: renewed.renewalDate
            })
          : null;
      if (payload) await globalThis.generateOfficialWordContract(payload);
    } catch (_err) {
      /* Word no bloquea la renovación */
    }
  }

  if (typeof globalThis.propagateEmployeeChanges === "function") {
    await globalThis.propagateEmployeeChanges(saved);
  }
  if (typeof globalThis.scheduleContractRenewalNotificationCheck === "function") {
    globalThis.scheduleContractRenewalNotificationCheck();
  }

  return {
    ok: true,
    employee: saved,
    contract: contractResult.ok ? contractResult.contract : null
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
  const n = normalizeYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return n;
  const day = Number(p[3]);
  const month = MONTHS_ES_NOTICE[Number(p[2]) - 1];
  if (!month || !Number.isFinite(day)) return n;
  return `${day} de ${month} de ${p[1]}`;
}

/** Meta de aviso CST art. 47 desde el empleado normalizado. */
export function buildNonRenewalNoticeMeta(employee) {
  const e = employee || {};
  const endYmd = normalizeYmd(
    e.contractEndDate ||
      (typeof globalThis.computeEmployeeContractRenewalMeta === "function"
        ? globalThis.computeEmployeeContractRenewalMeta(e).endYmd
        : "")
  );
  const noticeDeadlineYmd = endYmd ? addDaysToYmd(endYmd, -30) : "";
  const noticeDateYmd = colombiaTodayIsoDate();
  const daysToEnd = endYmd
    ? (typeof globalThis.daysUntilSafe === "function"
        ? globalThis.daysUntilSafe(endYmd)
        : null)
    : null;
  const lateNotice =
    noticeDeadlineYmd && noticeDateYmd > noticeDeadlineYmd && daysToEnd != null && daysToEnd >= 0;
  return {
    endYmd,
    noticeDeadlineYmd,
    noticeDateYmd,
    daysToEnd,
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
  const noticeDate = normalizeYmd(fields.noticeDate || colombiaTodayIsoDate());
  if (!noticeDate) {
    return { ok: false, message: "Indique la fecha del aviso.", field: "noticeDate" };
  }
  const meta = buildNonRenewalNoticeMeta(e);
  if (!meta.endYmd) {
    return { ok: false, message: "No hay fecha de fin de contrato para calcular el aviso." };
  }
  return {
    ok: true,
    noticeDate,
    lateNotice: noticeDate > meta.noticeDeadlineYmd,
    meta
  };
}

export function buildNonRenewalNoticeLetterHtml(employee, opts = {}) {
  const e = employee || {};
  const companies = read(KEYS.companies, []);
  const company =
    companies.find((row) => String(row.id) === String(e.companyId || "")) || {};
  const companyName = String(opts.companyName || company.name || "La empresa").trim();
  const city = String(opts.city || company.city || e.city || "la ciudad").trim();
  const meta = buildNonRenewalNoticeMeta(e);
  const noticeDate = normalizeYmd(opts.noticeDate || meta.noticeDateYmd);
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
  <p class="meta">${escapeHtml(city)}, ${escapeHtml(noticeLabel)}</p>
  <p>Señor(a)<br /><strong>${escapeHtml(name)}</strong><br />${escapeHtml(docType)} ${escapeHtml(idDoc)}</p>
  <p>Asunto: <strong>Aviso de no renovación de contrato laboral a término fijo</strong></p>
  <p>
    Por medio de la presente, <strong>${escapeHtml(companyName)}</strong> le comunica de manera expresa que
    <strong>no procederá a renovar</strong> su contrato de trabajo a término fijo, el cual vence el
    <strong>${escapeHtml(meta.endLabel)}</strong>, conforme a lo previsto en el artículo 47 del Código Sustantivo del Trabajo.
  </p>
  <p>
    Usted fue vinculado(a) en el cargo de <strong>${escapeHtml(position)}</strong>.
    La terminación del vínculo se producirá al vencimiento del plazo contractual indicado, sin perjuicio de las
    obligaciones legales de liquidación y entrega de certificados que correspondan.
  </p>
  <p>
    Este aviso se entrega con la anticipación exigida por la ley (mínimo treinta (30) días calendario antes del
    vencimiento; fecha límite orientativa: <strong>${escapeHtml(meta.deadlineLabel || "—")}</strong>).
  </p>
  ${lateHtml}
  <p>Cordialmente,</p>
  <div class="sign">
    <p>_______________________________________<br />
    Representante legal / Gestión humana<br />
    ${escapeHtml(companyName)}</p>
  </div>
  <p class="muted">Documento generado desde Antares. Revise y firme antes de entregar al colaborador. No sustituye asesoría jurídica.</p>
</body>
</html>`;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Abre ventana imprimible con la carta de no renovación. */
export function openNonRenewalNoticeLetter(employee, opts = {}) {
  const html = buildNonRenewalNoticeLetterHtml(employee, opts);
  const popup = window.open("", "_blank", "width=820,height=900");
  if (!popup) {
    return { ok: false, message: "El navegador bloqueó la ventana. Permita ventanas emergentes e intente de nuevo." };
  }
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  return { ok: true };
}

/**
 * Registra aviso de no renovación: fecha en empleado, historial en contratos y carta imprimible.
 */
export async function executeEmployeeContractNonRenewalNotice(employee, fields = {}, opts = {}) {
  const validated = validateNonRenewalNotice(employee, fields);
  if (!validated.ok) return validated;
  const noticeDate = validated.noticeDate;
  const all = read(KEYS.payrollEmployees, []);
  const idx = all.findIndex((row) => String(row.id) === String(employee.id));
  if (idx < 0) return { ok: false, message: "Colaborador no encontrado." };

  const patched = stampUpdatedRecord({
    ...all[idx],
    nonRenewalNoticeDate: noticeDate,
    id: all[idx].id
  });
  const nextList = all.map((row, i) => (i === idx ? patched : row));
  try {
    await writeAwaitServerEdit(KEYS.payrollEmployees, nextList, patched);
  } catch (err) {
    return { ok: false, message: String(err?.message || "No se pudo registrar el aviso.") };
  }

  const contractResult = await upsertContractRecordForEmployee(patched, {
    signDate: noticeDate,
    renewalDate: noticeDate,
    endDate: patched.contractEndDate,
    sourceTag: "Aviso no renovación CST art. 47",
    content:
      `AVISO NO RENOVACIÓN\n` +
      `Colaborador: ${String(patched.name || "").trim()}\n` +
      `Documento: ${String(patched.idDoc || "").trim()}\n` +
      `Fin contrato: ${String(patched.contractEndDate || "").trim()}\n` +
      `Fecha aviso: ${noticeDate}\n`,
    notifyOnFailure: false
  });

  if (opts.openLetter !== false) {
    openNonRenewalNoticeLetter(patched, { noticeDate });
  }

  if (typeof globalThis.propagateEmployeeChanges === "function") {
    await globalThis.propagateEmployeeChanges(patched);
  }

  return {
    ok: true,
    employee: patched,
    contract: contractResult.ok ? contractResult.contract : null,
    lateNotice: validated.lateNotice
  };
}
