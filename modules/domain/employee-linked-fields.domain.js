/**
 * Campos del colaborador que se copian a contratos, liquidaciones, ausencias, SST, viajes y combustible.
 * Si al editar la ficha no cambió ninguno, no hay nada que propagar (evita reenviar decenas de registros).
 */

const LINKED_KEYS = [
  "name",
  "idDoc",
  "position",
  "positionId",
  "companyId",
  "baseSalary",
  "contractType",
  "workerRole",
  "eps",
  "pensionFund",
  "arl",
  "workSchedule",
  "phone"
];

function norm(value) {
  return value == null ? "" : String(value).trim();
}

/**
 * @param {object} employee
 * @param {(employee: object) => number} [readTransportAllowance]
 */
export function employeeLinkedSnapshot(employee, readTransportAllowance) {
  const row = employee && typeof employee === "object" ? employee : {};
  const values = LINKED_KEYS.map((key) => norm(row[key]));
  let transport = "";
  if (typeof readTransportAllowance === "function") {
    try {
      transport = norm(readTransportAllowance(row));
    } catch (_e) {
      transport = "?";
    }
  }
  values.push(transport);
  return JSON.stringify(values);
}

/** true si cambió algún campo copiado a otros módulos (o si no se puede comparar). */
export function employeeLinkedFieldsChanged(previous, next, readTransportAllowance) {
  if (!previous || !next || typeof previous !== "object" || typeof next !== "object") return true;
  return employeeLinkedSnapshot(previous, readTransportAllowance) !== employeeLinkedSnapshot(next, readTransportAllowance);
}
