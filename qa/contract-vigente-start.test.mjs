/**
 * Verificación estática de lógica: inicio contrato vigente vs fecha ingreso.
 * Ejecutar: node qa/contract-vigente-start.test.mjs
 */
import assert from "node:assert/strict";
import {
  resolveContractPlazoStartYmd,
  resolveContractEndYmd,
  isFixedTermContractType
} from "../apps/api/dist/portal/employee-contract-renewal.js";

function ok(cond, msg) {
  assert.ok(cond, msg);
}

ok(isFixedTermContractType("Termino fijo"), "término fijo reconocido");
ok(!isFixedTermContractType("Termino indefinido"), "indefinido no es fijo");

const hireOnly = {
  contractType: "Termino fijo",
  startDate: "2020-01-15",
  contractDuration: "1 año"
};
ok(resolveContractPlazoStartYmd(hireOnly) === "2020-01-15", "sin vigente → ingreso");
ok(resolveContractEndYmd(hireOnly) === "2021-01-15", "fin desde ingreso 1 año");

const renewed = {
  contractType: "Termino fijo",
  startDate: "2020-01-15",
  contractVigenteStartDate: "2025-06-01",
  contractDuration: "1 año"
};
ok(resolveContractPlazoStartYmd(renewed) === "2025-06-01", "vigente prioriza sobre ingreso");
ok(
  resolveContractEndYmd(renewed) === "2026-06-01",
  "fin desde vigente 2025-06-01 + 1 año"
);

const months = {
  contractType: "Termino fijo",
  startDate: "2020-01-01",
  contractVigenteStartDate: "2025-03-10",
  contractDuration: "6 meses"
};
ok(resolveContractEndYmd(months) === "2025-09-10", "6 meses desde vigente");

const indef = {
  contractType: "Termino indefinido",
  startDate: "2020-01-01",
  contractEndDate: "2099-12-31"
};
ok(resolveContractEndYmd(indef) === "2099-12-31", "indefinido conserva fin explícito");

console.log("contract-vigente-start.test.mjs: OK (5 casos)");
