/**
 * Genera modules/domain/nomina.domain.js desde rangos de portal-runtime.js (Fase 9).
 * Ejecutar: node scripts/build-nomina-domain.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const prPath = path.join(root, "modules", "core", "portal-runtime.js");
const outPath = path.join(root, "modules", "domain", "nomina.domain.js");

const pr = fs.readFileSync(prPath, "utf8").split(/\r?\n/);

function joinLines(start, end) {
  return pr.slice(start - 1, end).join("\n");
}

function exportify(src) {
  return src.replace(/^function /gm, "export function ");
}

const header = `/**
 * Dominio nómina Colombia: periodos, cálculos legales orientativos, ausencias,
 * filtros de liquidaciones y aplicación de parámetros del sistema laboral.
 * Extraído desde \`portal-runtime.js\` (Fase 9).
 */
import {
  KEYS,
  CO_PAYROLL,
  CO_HR_RULES,
  CO_CESANTIAS_INTERES_ANUAL_PCT,
  PAYROLL_ABSENCE_LEGAL_LIMITS
} from "../core/config.js";
import { read } from "../core/data-io.js";
import { state } from "../core/store.js";
import {
  escapeAttr,
  escapeHtml,
  formatPayrollPeriodLabel,
  monthRange,
  normalizePayrollFrequencyJs,
  payrollPeriodCalendarYm
} from "../core/utils.js";
import { notify, userMessage } from "../ui/modals.js";

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

`;

const body = [exportify(joinLines(20, 173)), exportify(joinLines(1046, 2075)), exportify(joinLines(2314, 2328))].join(
  "\n\n"
);

fs.writeFileSync(outPath, `${header}\n${body}\n`, "utf8");
console.log("Wrote", outPath);
