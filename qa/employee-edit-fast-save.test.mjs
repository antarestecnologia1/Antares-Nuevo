/**
 * Editar empleado: el mensaje de éxito sale en cuanto se guarda la ficha; lo vinculado va en segundo plano,
 * solo se propaga si cambió algún campo copiado a otros módulos y los errores del modal ya no se pierden.
 * Ejecutar: node qa/employee-edit-fast-save.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { employeeLinkedFieldsChanged } from "../modules/domain/employee-linked-fields.domain.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

// 1) Cambios que NO se copian a otros módulos: no hay nada que propagar.
const base = {
  id: "e1",
  name: "Ana Pérez",
  idDoc: "123",
  position: "Auxiliar",
  positionId: "p1",
  companyId: "c1",
  baseSalary: 1750905,
  contractType: "Indefinido",
  workerRole: "administrativo",
  eps: "Sura",
  pensionFund: "Porvenir",
  arl: "Sura",
  workSchedule: "L-V",
  phone: "3001234567",
  address: "Calle 1",
  bankName: "Bancolombia",
  avatarUrl: "a.png",
  updatedAt: "2026-11-01"
};
const transport = (e) => (Number(e.baseSalary) <= 2 * 1423500 ? 200000 : 0);
assert.equal(employeeLinkedFieldsChanged(base, { ...base, address: "Cra 5", bankName: "Davivienda", updatedAt: "2026-11-25" }, transport), false);
assert.equal(employeeLinkedFieldsChanged(base, { ...base, avatarUrl: "b.png" }, transport), false);
// espacios y null no cuentan como cambio
assert.equal(employeeLinkedFieldsChanged(base, { ...base, eps: " Sura ", arl: "Sura" }, transport), false);

// 2) Cambios que sí se copian: hay que propagar.
for (const patch of [
  { name: "Ana P. Pérez" },
  { idDoc: "124" },
  { position: "Analista" },
  { companyId: "c2" },
  { baseSalary: 3000000 },
  { contractType: "Fijo" },
  { phone: "3010000000" },
  { eps: "Nueva EPS" }
]) {
  assert.equal(employeeLinkedFieldsChanged(base, { ...base, ...patch }, transport), true, JSON.stringify(patch));
}
// el auxilio de transporte calculado también cuenta
assert.equal(employeeLinkedFieldsChanged(base, { ...base, baseSalary: 5000000 }, transport), true);

// 3) Sin datos para comparar: se propaga (comportamiento seguro).
assert.equal(employeeLinkedFieldsChanged(null, base, transport), true);
assert.equal(employeeLinkedFieldsChanged(base, undefined, transport), true);

// 4) Cableado del flujo de edición.
const gh = read("modules/app/gestion-humana.js");
const editStart = Math.max(
  gh.indexOf("scheduleContractRenewalNotificationCheck();\r\n          const refreshed"),
  gh.indexOf("scheduleContractRenewalNotificationCheck();\n          const refreshed")
);
const editEnd = gh.indexOf("[data-action='renew-employee-contract']", editStart);
const edit = editStart >= 0 && editEnd > editStart ? gh.slice(editStart, editEnd) : "";
assert.ok(edit.length > 0, "bloque de edición localizado");
const successIdx = edit.indexOf('notify(userMessage("employeeUpdatedOk"), "success")');
const propagateIdx = edit.indexOf("await propagateEmployeeChanges(refreshed");
assert.ok(successIdx > 0 && propagateIdx > successIdx, "el éxito se avisa ANTES de propagar a otros módulos");
assert.match(edit, /previousEmployee: target/, "propagación con la ficha anterior para omitir si no hay cambios");
assert.equal((edit.match(/applyPortalBootstrapFromApi\(\)/g) || []).length, 0, "ya no hay descarga completa duplicada en la edición");
assert.match(edit, /void \(async \(\) => \{/, "lo vinculado corre en segundo plano");

const sst = read("modules/domain/sst.domain.js");
assert.match(sst, /Promise\.allSettled\(pendingWrites\)/, "envíos vinculados en paralelo");
assert.match(sst, /employeeLinkedFieldsChanged\(previousEmployee, employee/, "se omite la propagación sin cambios");

const modals = read("modules/ui/modals.js");
assert.match(modals, /devWarn\("openEditModal onSubmit", err\);\r?\n\s+notify\(/, "el modal avisa si onSubmit falla");

console.log("employee-edit-fast-save: OK");
