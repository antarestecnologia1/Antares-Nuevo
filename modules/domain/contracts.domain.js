/**
 * Contratos en almacén local: claves de deduplicación y compactación al cargar el portal.
 */
import { KEYS } from "../core/config.js";
import { read, write } from "../core/data-io.js";

export function contractDedupKey(row) {
  if (!row) return "";
  const empKey =
    String(row.employeeId || "").trim().toLowerCase() ||
    String(row.idDocSnapshot || "").trim().toLowerCase() ||
    String(row.candidateId || "").trim().toLowerCase();
  const tpl = String(row.contractTemplateKind || row.templateKind || "").trim().toLowerCase();
  const start = String(row.startDate || "").trim();
  if (!empKey) return "";
  return `${empKey}::${tpl}::${start}`;
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
