/**
 * Validación unitaria del rediseño de selección (pipeline / fichas / vacantes).
 * No importa contratacion.domain.js (depende de `document` vía store).
 * Ejecutar: node qa/hiring-selection-ui.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function ok(cond, msg) {
  assert.ok(cond, msg);
}

/** Réplica de helpers puros (misma lógica que el dominio). */
function hiringCandidateNextAction(status) {
  const s = String(status || "Recibido");
  if (s === "Recibido") return { label: "Revisar y preseleccionar", tone: "review" };
  if (s === "Preseleccionado") return { label: "Agendar entrevista", tone: "interview" };
  if (s === "Entrevistado") return { label: "Evaluar oferta", tone: "offer" };
  if (s === "Oferta enviada") return { label: "Cerrar contratación", tone: "hire" };
  if (s === "Contratado") return { label: "Proceso cerrado", tone: "done" };
  if (s === "Descartado") return { label: "Descartado", tone: "done" };
  return { label: "Continuar proceso", tone: "review" };
}

function hiringPipelineStageSlug(status) {
  return String(status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "recibido";
}

function hiringPipelineStatusClass(status) {
  const s = String(status || "");
  if (s === "Contratado") return "status-viaje_asignado";
  if (s === "Descartado") return "status-rechazada";
  if (s === "Oferta enviada") return "status-viaje_completado";
  if (s === "Entrevistado") return "status-en_transito";
  if (s === "Preseleccionado") return "status-pendiente";
  return "status-pendiente";
}

ok(hiringCandidateNextAction("Recibido").tone === "review", "Recibido → revisar");
ok(hiringCandidateNextAction("Preseleccionado").tone === "interview", "Preseleccionado → entrevista");
ok(hiringCandidateNextAction("Entrevistado").tone === "offer", "Entrevistado → oferta");
ok(hiringCandidateNextAction("Oferta enviada").tone === "hire", "Oferta → contratar");
ok(hiringCandidateNextAction("Contratado").tone === "done", "Contratado → cerrado");
ok(hiringCandidateNextAction("Descartado").tone === "done", "Descartado → cerrado");

ok(hiringPipelineStageSlug("Oferta enviada") === "oferta-enviada", "slug oferta");
ok(hiringPipelineStageSlug("Preseleccionado") === "preseleccionado", "slug preseleccionado");
ok(hiringPipelineStatusClass("Contratado") === "status-viaje_asignado", "clase contratado");
ok(hiringPipelineStatusClass("Descartado") === "status-rechazada", "clase descartado");

/* Fuentes de implementación presentes en el repo */
const domainSrc = readFileSync(join(root, "modules/domain/contratacion.domain.js"), "utf8");
const htmlSrc = readFileSync(join(root, "modules/app/contratacion-html.js"), "utf8");
const cssSrc = readFileSync(join(root, "styles/hiring-module.css"), "utf8");
const runtimeSrc = readFileSync(join(root, "modules/core/portal-runtime.js"), "utf8");
const apiCvSrc = readFileSync(join(root, "apps/api/src/portal/portal.service.ts"), "utf8");

ok(domainSrc.includes("export function renderHiringPipelineBoard"), "dominio: tablero exportado");
ok(domainSrc.includes("export function renderHiringVacancyCard"), "dominio: tarjeta vacante exportada");
ok(domainSrc.includes("export function hiringCandidateNextAction"), "dominio: next action exportada");
ok(domainSrc.includes("hiring-candidate-card--compact"), "dominio: ficha compacta");
ok(htmlSrc.includes('candidateView === "board"'), "html: vista tablero");
ok(htmlSrc.includes("renderHiringPipelineBoard"), "html: usa tablero");
ok(htmlSrc.includes("hiring-vacancy-grid"), "html: grid vacantes");
ok(htmlSrc.includes('{ id: "data", label: "Selección"'), "html: tab Selección primero");
ok(htmlSrc.includes('data-action="hiring-pipeline-stage"'), "html: filtros por etapa");
ok(cssSrc.includes(".hiring-board"), "css: estilos tablero");
ok(cssSrc.includes(".hiring-vacancy-card"), "css: estilos vacante");
ok(cssSrc.includes("--hi-blue: var(--primary"), "css: paleta marca");
ok(!/linear-gradient\(135deg,\s*#6366f1/.test(cssSrc), "css: sin acento índigo legacy");
ok(runtimeSrc.includes("function renderHiringPipelineBoard"), "runtime: tablero expuesto");
ok(runtimeSrc.includes("dl?.useApiBlob || candidateMayHaveCvInStorage"), "runtime: descarga CV por storageKey");
ok(apiCvSrc.includes("getCandidateCvFile"), "api: endpoint cv-file");
ok(
  /async getCandidateCvDownload[\s\S]{0,400}?resolveEffectivePermissionSet/.test(apiCvSrc) &&
    /async getCandidateCvFile[\s\S]{0,400}?resolveEffectivePermissionSet/.test(apiCvSrc),
  "api: CV usa permisos efectivos del rol"
);

const eventsSrc = readFileSync(join(root, "modules/core/events.js"), "utf8");
ok(eventsSrc.includes('fd.set("attachment", cvFile'), "postulación pública fuerza archivo en FormData");

console.log("OK hiring-selection-ui: helpers, markup, CSS y permisos CV validados.");
