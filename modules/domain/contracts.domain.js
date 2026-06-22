/**
 * Contratos en almacén local: claves de deduplicación, compactación al cargar el portal
 * y registro automático al contratar empleados.
 */
import { KEYS } from "../core/config.js";
import { read, write, writeAwaitServerCreate } from "../core/data-io.js";
import {
  colombiaTodayIsoDate,
  newUuidV4,
  stampCreatedRecord,
  stampUpdatedRecord
} from "../core/utils.js";
import { buildEmployeeContractDocxPayload, readEmployeeTransportAllowanceCop } from "./contratacion.domain.js";

export function contractDedupKey(row) {
  if (!row) return "";
  const empKey =
    String(row.employeeId || "").trim().toLowerCase() ||
    String(row.idDocSnapshot || "").trim().toLowerCase() ||
    String(row.candidateId || "").trim().toLowerCase();
  const tpl = String(row.contractTemplateKind || row.templateKind || "").trim().toLowerCase();
  const start = String(row.startDate || "").trim();
  const tag = String(row.sourceTag || "").trim().toLowerCase();
  const movement = /renovaci/.test(tag)
    ? "renovacion"
    : /aviso no renov/.test(tag)
      ? "aviso_no_renovacion"
      : "";
  if (!empKey) return "";
  return movement ? `${empKey}::${tpl}::${start}::${movement}` : `${empKey}::${tpl}::${start}`;
}

export function dedupContracts(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Map();
  const result = [];
  for (const row of list) {
    if (!row) continue;
    const key = contractDedupKey(row);
    if (!key) {
      result.push(row);
      continue;
    }
    if (!seen.has(key)) {
      seen.set(key, result.length);
      result.push(row);
      continue;
    }
    const idx = seen.get(key);
    const prev = result[idx];
    const prevTs = new Date(prev?.updatedAt || prev?.createdAt || 0).getTime() || 0;
    const curTs = new Date(row.updatedAt || row.createdAt || 0).getTime() || 0;
    result[idx] = curTs > prevTs ? { ...prev, ...row, id: prev.id || row.id } : { ...row, ...prev, id: prev.id || row.id };
  }
  return result;
}

export function purgeDuplicateContracts() {
  const before = read(KEYS.contracts, []);
  const after = dedupContracts(before);
  if (after.length !== before.length) {
    write(KEYS.contracts, after);
  }
}

function buildContractSummaryText(employee, docPayload, signDate) {
  return (
    `CONTRATO LABORAL\n` +
    `Empleado: ${String(employee.name || "").trim()}\n` +
    `Cedula: ${String(employee.idDoc || "").trim()}\n` +
    `Cargo: ${String(docPayload.cargo_empleado || employee.position || "").trim()}\n` +
    `Tipo: ${String(docPayload.contractType || employee.contractType || "").trim()}\n` +
    `Plantilla: ${String(docPayload.contractTemplateKind || "").trim()}\n` +
    `Salario: ${docPayload.salario ?? employee.baseSalary ?? ""}\n` +
    `Firma constancia: ${signDate}\n`
  );
}

/**
 * Arma el objeto de contrato (sin id) a partir de un empleado en nómina.
 * Requiere `positionId`, `companyId` y fecha de inicio para persistir en PostgreSQL.
 */
export function buildContractRecordFromEmployee(employee, opts = {}) {
  if (!employee?.id) return null;
  const signDate = String(
    opts.signDate || employee.contractVigenteStartDate || employee.startDate || colombiaTodayIsoDate()
  ).trim();
  const renewalDate = opts.renewalDate ? String(opts.renewalDate).trim() : "";
  const endDate = String(
    opts.endDate || employee.contractEndDate || ""
  ).trim();
  const companies = read(KEYS.companies, []);
  const positions = read(KEYS.positions, []);
  let positionId = String(employee.positionId || opts.positionId || "").trim();
  if (!positionId && employee.position) {
    const posName = String(employee.position).trim().toUpperCase();
    const byName = positions.find((row) => String(row.name || "").trim().toUpperCase() === posName);
    if (byName?.id) positionId = String(byName.id).trim();
  }
  const companyId = String(employee.companyId || opts.companyId || "").trim();
  if (!signDate || !positionId || !companyId) return null;

  const employeeCompany = companies.find((row) => String(row.id) === companyId);
  const employeePosition = positions.find((row) => String(row.id) === positionId);

  let docPayload;
  try {
    docPayload = buildEmployeeContractDocxPayload(employee, {
      contractTemplateKind: opts.contractTemplateKind || employee.contractTemplateKind,
      signDate
    });
  } catch (_err) {
    return null;
  }

  const empDoc = String(employee.idDoc || "").trim();
  const candidateId = opts.candidateId ? String(opts.candidateId).trim() : "";
  const candidateName = opts.candidateName ? String(opts.candidateName).trim() : "";

  return {
    employeeId: employee.id,
    employeeName: String(employee.name || "").trim(),
    candidateId,
    candidateName,
    personType: candidateId ? "Candidato" : "Empleado",
    sourceTag: opts.sourceTag || (candidateId ? "Generado al contratar desde candidato" : "Generado al contratar empleado"),
    positionId,
    position: String(docPayload.cargo_empleado || employee.position || "").trim(),
    positionName: String(docPayload.cargo_empleado || employee.position || "").trim(),
    companyId,
    companyName: String(employeeCompany?.name || opts.companyName || "").trim(),
    salary: docPayload.salario ?? employee.baseSalary,
    transportAllowance: readEmployeeTransportAllowanceCop(employee),
    startDate: signDate,
    endDate: endDate || undefined,
    renewalDate: renewalDate || undefined,
    contractType: docPayload.contractType || employee.contractType || "Termino indefinido",
    contractTemplateKind: docPayload.contractTemplateKind,
    templateKind: docPayload.contractTemplateKind,
    idDocSnapshot: empDoc,
    workerRole: docPayload.workerRole || employee.workerRole || "empleado",
    eps: String(employee.eps || "Sura").trim(),
    pensionFund: String(employee.pensionFund || "Porvenir").trim(),
    arl: String(employee.arl || "Sura").trim(),
    schedule: String(
      employee.workSchedule || employeePosition?.workSchedule || employeePosition?.schedule || "Diurna"
    ).trim(),
    source: candidateId ? "Candidato" : "Empleado",
    content: opts.content || buildContractSummaryText(employee, docPayload, signDate),
    licenseNumber: employee.license ? String(employee.license).trim() : "",
    licenseCategory: employee.licenseCategory ? String(employee.licenseCategory).trim() : "",
    licenseExpiry: employee.licenseExpiry ? String(employee.licenseExpiry).trim() : ""
  };
}

function contractMovementSlug(row) {
  const tag = String(row?.sourceTag || "").trim().toLowerCase();
  if (/renovaci/.test(tag)) return "renovacion";
  if (/aviso no renov/.test(tag)) return "aviso_no_renovacion";
  return "";
}

function findMatchingContractIndex(list, employee, partial) {
  const empId = String(employee.id || "").trim();
  const empDoc = String(employee.idDoc || "").trim();
  const tplKind = String(partial.contractTemplateKind || partial.templateKind || "").trim().toLowerCase();
  const signDate = String(partial.startDate || "").trim();
  const partialMovement = contractMovementSlug(partial);
  return list.findIndex((row) => {
    if (!row) return false;
    const sameEmployee =
      (empId && String(row.employeeId || "") === empId) ||
      (empDoc && String(row.idDocSnapshot || "").trim() === empDoc);
    if (!sameEmployee) return false;
    if (contractMovementSlug(row) !== partialMovement) return false;
    const sameTemplate =
      String(row.contractTemplateKind || row.templateKind || "").trim().toLowerCase() === tplKind;
    const sameStart = String(row.startDate || "").trim() === signDate;
    return sameTemplate && sameStart;
  });
}

/**
 * Crea o actualiza el registro de contrato al contratar un empleado y lo sincroniza con PostgreSQL.
 */
export async function upsertContractRecordForEmployee(employee, opts = {}) {
  const partial = buildContractRecordFromEmployee(employee, opts);
  if (!partial) {
    return { ok: false, skipped: true, reason: "incomplete_data" };
  }

  const all = read(KEYS.contracts, []);
  const existingIdx = findMatchingContractIndex(all, employee, partial);
  let savedContract;
  if (existingIdx >= 0) {
    savedContract = stampUpdatedRecord({
      ...all[existingIdx],
      ...partial,
      id: all[existingIdx].id
    });
    all.splice(existingIdx, 1, savedContract);
  } else {
    savedContract = stampCreatedRecord({
      id: newUuidV4(),
      ...partial
    });
    all.unshift(savedContract);
  }

  const deduped = dedupContracts(all);
  try {
    await writeAwaitServerCreate(KEYS.contracts, deduped, savedContract, {
      notifyOnFailure: opts.notifyOnFailure !== false
    });
    return { ok: true, contract: savedContract, created: existingIdx < 0 };
  } catch (err) {
    return {
      ok: false,
      message: String(err?.message || "No fue posible guardar el contrato en el servidor.")
    };
  }
}
