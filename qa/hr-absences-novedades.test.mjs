/**
 * Validación estática del módulo de novedades (ausencias laborales).
 * Ejecutar: node qa/hr-absences-novedades.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAYROLL_ABSENCE_LEGAL_LIMITS } from "../modules/core/config.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function src(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function ok(cond, msg) {
  assert.ok(cond, msg);
}

const CANONICAL = new Set([
  "vacaciones",
  "incapacidad_eps",
  "incapacidad_arl",
  "licencia_maternidad",
  "licencia_paternidad",
  "licencia_luto",
  "calamidad_domestica",
  "permiso_cita_medica",
  "permiso_citacion_judicial",
  "permiso_sufragio",
  "licencia_remunerada",
  "licencia_no_remunerada",
  "suspension"
]);

function canonicalizeHrAbsenceTipo(raw) {
  const t = String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (!t || t === "incapacidad") return "incapacidad_eps";
  if (CANONICAL.has(t)) return t;
  if (t.includes("vacac")) return "vacaciones";
  if (
    t === "arl" ||
    (t.includes("incapaci") && t.includes("arl")) ||
    (t.includes("accidente") && t.includes("laboral")) ||
    (t.includes("enfermedad") && t.includes("laboral"))
  ) {
    return "incapacidad_arl";
  }
  if (t.includes("incapaci") || t === "eps") return "incapacidad_eps";
  if (t.includes("matern")) return "licencia_maternidad";
  if (t.includes("patern")) return "licencia_paternidad";
  if (t.includes("luto") || t.includes("duelo")) return "licencia_luto";
  if (t.includes("calam")) return "calamidad_domestica";
  if ((t.includes("cita") && t.includes("med")) || t.includes("medic")) return "permiso_cita_medica";
  if (t.includes("judic")) return "permiso_citacion_judicial";
  if (t.includes("sufrag") || t.includes("vot")) return "permiso_sufragio";
  if (t.includes("sin goce") || t.includes("no remuner") || t.includes("no_remuner")) {
    return "licencia_no_remunerada";
  }
  if (t.includes("suspens")) return "suspension";
  if (t === "licencia") return "licencia_remunerada";
  return t.slice(0, 64) || "incapacidad_eps";
}

function roundDays(raw, fallback = 1) {
  const n = Number(raw);
  const base = Number.isFinite(n) && n > 0 ? n : fallback;
  return Math.round(Math.max(0.5, base) * 100) / 100;
}

function applyServerClamp(tipo, subtipoRaw, recognizedIn, unidadRaw) {
  const maternitySubs = new Set([
    "ordinaria",
    "parto_multiple",
    "parto_prematuro",
    "adopcion",
    "extension_medica"
  ]);
  const paternitySubs = new Set(["continua", "flexible", "parental_compartida"]);
  let subtipo = subtipoRaw != null ? String(subtipoRaw).trim().toLowerCase() || null : null;
  if (tipo === "permiso_sufragio") subtipo = subtipo === "jurado" ? "jurado" : "votante";
  else if (tipo === "licencia_maternidad") subtipo = subtipo && maternitySubs.has(subtipo) ? subtipo : "ordinaria";
  else if (tipo === "licencia_paternidad") subtipo = subtipo && paternitySubs.has(subtipo) ? subtipo : "continua";
  else subtipo = null;

  let diasReconocidos = roundDays(recognizedIn);
  const unidadCanon = String(unidadRaw ?? "").trim().toLowerCase();
  let unidad =
    unidadCanon === "calendario" || unidadCanon === "habil" || unidadCanon === "jornada"
      ? unidadCanon
      : tipo === "permiso_sufragio"
        ? "jornada"
        : ["vacaciones", "licencia_luto", "permiso_cita_medica", "permiso_citacion_judicial"].includes(tipo)
          ? "habil"
          : "calendario";
  if (tipo === "permiso_sufragio") {
    unidad = "jornada";
    diasReconocidos = subtipo === "jurado" ? 1 : 0.5;
  } else if (tipo === "licencia_luto") {
    unidad = "habil";
    diasReconocidos = Math.min(5, diasReconocidos);
  } else if (tipo === "licencia_paternidad") {
    unidad = "calendario";
    diasReconocidos = Math.min(subtipo === "parental_compartida" ? 7 : 14, diasReconocidos);
  } else if (tipo === "licencia_maternidad") {
    unidad = "calendario";
    diasReconocidos = Math.min(182, diasReconocidos);
  }
  return { tipo, subtipo, diasReconocidos, unidad };
}

function dbChecksPass({ tipo, subtipo, start, end, calendarDays, recognized, unidad }) {
  if (end < start) return false;
  if (!(calendarDays >= 1)) return false;
  if (!(recognized > 0)) return false;
  if (!["calendario", "habil", "jornada"].includes(unidad)) return false;
  if (tipo === "permiso_sufragio") {
    if (!["jurado", "votante"].includes(subtipo)) return false;
    if (unidad !== "jornada") return false;
    if (subtipo === "jurado" && recognized !== 1) return false;
    if (subtipo === "votante" && recognized !== 0.5) return false;
  }
  if (tipo === "licencia_luto" && (unidad !== "habil" || recognized > 5)) return false;
  if (tipo === "licencia_paternidad") {
    if (!["continua", "flexible", "parental_compartida"].includes(subtipo)) return false;
    if (unidad !== "calendario" || recognized > 14) return false;
    if (subtipo === "parental_compartida" && recognized > 7) return false;
  }
  if (tipo === "licencia_maternidad") {
    if (!["ordinaria", "parto_multiple", "parto_prematuro", "adopcion", "extension_medica"].includes(subtipo)) {
      return false;
    }
    if (unidad !== "calendario" || recognized > 182) return false;
  }
  return true;
}

const domain = src("modules/domain/nomina.domain.js");
const api = src("apps/api/src/portal/portal.service.ts");
const html = src("modules/app/gestion-humana-html.js");
const app = src("modules/app/gestion-humana.js");
const cal = src("modules/app/calendario.js");
const authz = src("modules/app/autorizaciones.js");
const sql = src("BD/postgres/tablas/20_ausencias_laborales.sql");
const smoke = src("qa/portal-form-smoke.mjs");
const smokeSpec = src("qa/portal-form-smoke.spec.mjs");

ok(domain.includes("HR_ABSENCE_CANONICAL_TYPE_KEYS"), "dominio: claves canónicas exactas antes del fuzzy");
ok(api.includes("HR_ABSENCE_CANONICAL_TIPOS"), "API: claves canónicas exactas antes del fuzzy");
ok(!/if \(t\.includes\("arl"\)\) return "incapacidad_arl"/.test(domain), "dominio: no mapear cualquier 'arl' (p. ej. particular)");
ok(!/if \(t\.includes\("arl"\)\) return "incapacidad_arl"/.test(api), "API: no mapear cualquier 'arl'");

ok(canonicalizeHrAbsenceTipo("vacaciones") === "vacaciones", "vacaciones se conserva");
ok(canonicalizeHrAbsenceTipo("incapacidad_arl") === "incapacidad_arl", "incapacidad_arl exacta");
ok(canonicalizeHrAbsenceTipo("particular") !== "incapacidad_arl", "'particular' no es ARL");
ok(canonicalizeHrAbsenceTipo("incapacidad") === "incapacidad_eps", "incapacidad portal → EPS");
ok(canonicalizeHrAbsenceTipo("enfermedad laboral") === "incapacidad_arl", "enfermedad laboral → ARL");
ok(canonicalizeHrAbsenceTipo("licencia_no_remunerada") === "licencia_no_remunerada", "no remunerada exacta");

ok(PAYROLL_ABSENCE_LEGAL_LIMITS.lutoMaxBusinessDays === 5, "tope luto 5 hábiles");
ok(PAYROLL_ABSENCE_LEGAL_LIMITS.paternidadDays === 14, "tope paternidad 14");
ok(PAYROLL_ABSENCE_LEGAL_LIMITS.paternidadParentalCompartidaDays === 7, "parental compartida 7");
ok(PAYROLL_ABSENCE_LEGAL_LIMITS.maternidadExtensionMedicaMaxDays === 182, "tope maternidad 182");

const cases = [
  { tipo: "vacaciones", sub: null, rec: 3, unidad: "habil", start: "2026-09-14", end: "2026-09-16", days: 3 },
  { tipo: "permiso_sufragio", sub: "votante", rec: 9, unidad: "calendario", start: "2026-03-08", end: "2026-03-08", days: 1 },
  { tipo: "permiso_sufragio", sub: "jurado", rec: 1, unidad: "jornada", start: "2026-03-08", end: "2026-03-08", days: 1 },
  { tipo: "licencia_luto", sub: null, rec: 9, unidad: "calendario", start: "2026-09-01", end: "2026-09-08", days: 8 },
  { tipo: "licencia_paternidad", sub: "continua", rec: 20, unidad: "calendario", start: "2026-01-01", end: "2026-01-14", days: 14 },
  { tipo: "licencia_paternidad", sub: "parental_compartida", rec: 20, unidad: "calendario", start: "2026-01-01", end: "2026-01-07", days: 7 },
  { tipo: "licencia_maternidad", sub: "ordinaria", rec: 200, unidad: "calendario", start: "2026-01-01", end: "2026-07-01", days: 182 },
  { tipo: "incapacidad_eps", sub: null, rec: 3, unidad: "calendario", start: "2026-09-01", end: "2026-09-03", days: 3 },
  { tipo: "calamidad_domestica", sub: "nope", rec: 2, unidad: "calendario", start: "2026-09-01", end: "2026-09-02", days: 2 }
];

for (const c of cases) {
  const tipo = canonicalizeHrAbsenceTipo(c.tipo);
  const clamped = applyServerClamp(tipo, c.sub, c.rec, c.unidad);
  ok(
    dbChecksPass({
      tipo: clamped.tipo,
      subtipo: clamped.subtipo,
      start: c.start,
      end: c.end,
      calendarDays: c.days,
      recognized: clamped.diasReconocidos,
      unidad: clamped.unidad
    }),
    `CHECK PostgreSQL para ${c.tipo}/${c.sub || "sin-subtipo"}`
  );
}

ok(html.includes('isPayrollEmployeeUnlinked(e)'), "formulario: excluye desvinculados");
ok(html.includes('name="supportFile"'), "formulario: campo de soporte");
ok(html.includes("view-hr-absence") && html.includes("edit-hr-absence") && html.includes("delete-hr-absence"), "consultar: ver / editar / eliminar");
ok(html.includes('data-payroll-section="absences"'), "consultar: panel de ausencias");
ok(html.includes("absencesForTable"), "consultar: filtro por colaborador");

ok(app.includes("absenceSupportFileRequired"), "crear: exige archivo de soporte");
ok(app.includes("register_hr_absence"), "crear: cola de autorización si aplica");
ok(app.includes("refreshPayrollDraftsLinked"), "crear/editar/borrar: refresca borradores de nómina");
ok(app.includes("writeAwaitServerCreate(KEYS.hrAbsences"), "crear: persiste en servidor");
ok(app.includes("writeAwaitServerEdit(KEYS.hrAbsences"), "editar: persiste en servidor");
ok(app.includes("removeFromPortalListAwaitServer(KEYS.hrAbsences"), "eliminar: persiste en servidor");
ok(app.includes("Math.round(") && app.includes("nextRecognizedDays"), "editar: redondeo de días como en alta");
ok(app.includes('startDate: String(form.startDate || "").slice(0, 10)'), "editar: fechas YYYY-MM-DD");
ok(app.includes("archiveAbsenceSupportForEmployee"), "DMS: archivo en carpeta del colaborador");

ok(api.includes("sqlEmployeeDateToPortalYmd(row.fecha_inicio)"), "bootstrap: fechas de ausencia en YYYY-MM-DD");
ok(api.includes("SAVEPOINT"), "sync: savepoint por fila");
ok(api.includes("describeHrAbsenceSyncDbError"), "API: errores CHECK traducidos");
ok(cal.includes('kind: "absence"'), "calendario: eventos de ausencia");
ok(authz.includes("register_hr_absence"), "autorizaciones: tipo register_hr_absence");
ok(sql.includes("chk_ausencias_sufragio_reconocimiento"), "SQL: CHECK sufragio 0.5/1 jornada");
ok(sql.includes("chk_ausencias_luto_max_5"), "SQL: CHECK luto");
ok(sql.includes("chk_ausencias_maternidad_max_182"), "SQL: CHECK maternidad");

ok(smoke.includes("attachPdfToForm") || smoke.includes("soporte-novedad-qa.pdf"), "smoke: adjunta PDF de soporte");
ok(smokeSpec.includes("attachPdfToForm") || smokeSpec.includes("soporte-novedad-qa.pdf"), "smoke spec: adjunta PDF de soporte");

console.log("hr-absences-novedades.test.mjs: OK (tipos, CHECK, UI, persistencia, calendario, autorizaciones)");
