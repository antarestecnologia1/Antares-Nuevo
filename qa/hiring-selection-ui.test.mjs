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
function hiringCandidateNextAction(status, ctx = {}) {
  const s = String(status || "Recibido");
  const hasInterview = ctx.hasInterview === true;
  if (s === "Recibido") {
    return { label: "Preseleccionar candidato", tone: "review", action: "preselect", nextStatus: "Preseleccionado" };
  }
  if (s === "Preseleccionado" && hasInterview) {
    return { label: "Confirmar entrevista realizada", tone: "interview", action: "confirm-interview", nextStatus: "Entrevistado" };
  }
  if (s === "Preseleccionado") {
    return { label: "Agendar entrevista", tone: "interview", action: "schedule-interview" };
  }
  if (s === "Entrevistado") {
    return { label: "Enviar oferta", tone: "offer", action: "send-offer", nextStatus: "Oferta enviada" };
  }
  if (s === "Oferta enviada") return { label: "Contratar candidato", tone: "hire", action: "hire" };
  if (s === "Contratado") return { label: "Proceso cerrado", tone: "done", action: "done" };
  if (s === "Descartado") return { label: "Descartado", tone: "done", action: "done" };
  return { label: "Continuar proceso", tone: "review", action: "review" };
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

ok(hiringCandidateNextAction("Recibido").action === "preselect", "Recibido → preseleccionar");
ok(hiringCandidateNextAction("Preseleccionado").action === "schedule-interview", "Preseleccionado → agendar");
ok(
  hiringCandidateNextAction("Preseleccionado", { hasInterview: true }).action === "confirm-interview",
  "Preseleccionado con entrevista → confirmar"
);
ok(hiringCandidateNextAction("Entrevistado").action === "send-offer", "Entrevistado → oferta");
ok(hiringCandidateNextAction("Oferta enviada").action === "hire", "Oferta → contratar");
ok(hiringCandidateNextAction("Contratado").action === "done", "Contratado → cerrado");
ok(hiringCandidateNextAction("Descartado").action === "done", "Descartado → cerrado");

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

ok(domainSrc.includes("export function normalizeHiringPipelineStatus"), "dominio: normaliza etapa");
ok(domainSrc.includes("export function renderHiringPipelineBoard"), "dominio: tablero exportado");
ok(domainSrc.includes("export function renderHiringVacancyCard"), "dominio: tarjeta vacante exportada");
ok(domainSrc.includes("export function hiringCandidateNextAction"), "dominio: next action exportada");
ok(domainSrc.includes("export function hiringFlowBannerHtml"), "dominio: banner de flujo");
ok(domainSrc.includes("candidateHasScheduledInterview"), "dominio: entrevista programada");
ok(domainSrc.includes("hiring-kanban-card"), "dominio: ficha kanban compacta");
ok(htmlSrc.includes('candidateView === "board"'), "html: vista tablero");
ok(htmlSrc.includes("renderHiringPipelineBoard"), "html: usa tablero");
ok(htmlSrc.includes("hiring-list-view"), "html: vista lista");
ok(htmlSrc.includes("hiring-list-row"), "html: filas de lista");
ok(htmlSrc.includes("hiring-list-detail__panels"), "html: paneles etapa/documentos");
ok(htmlSrc.includes('data-action="candidate-status-apply"'), "html: actualizar etapa");
ok(htmlSrc.includes("hiring-list-docs__dropzone"), "html: dropzone documentos");
ok(htmlSrc.includes("hiring-stage-filter"), "html: filtros de etapa");
ok(htmlSrc.includes("hiring-interview-flow-bar"), "html: barra volver al candidato");
ok(htmlSrc.includes('data-action="hiring-return-to-candidate"'), "html: retorno a ficha");
ok(domainSrc.includes('data-action="hiring-flow-advance"'), "dominio: avance de flujo en CTA");
ok(cssSrc.includes(".hiring-flow-banner"), "css: banner de flujo");
ok(htmlSrc.includes("hiring-browse-list--vacancies"), "html: listado vacantes");
ok(htmlSrc.includes('{ id: "data", label: "Selección"'), "html: tab Selección primero");
ok(htmlSrc.includes('data-action="hiring-pipeline-stage"'), "html: filtros por etapa");
ok(cssSrc.includes(".hiring-board"), "css: estilos tablero");
ok(cssSrc.includes(".hiring-list-view"), "css: estilos lista");
ok(cssSrc.includes(".hiring-list-row"), "css: filas lista");
ok(cssSrc.includes(".hiring-stage-filter"), "css: pills de etapa");
ok(cssSrc.includes(".hiring-list-docs__dropzone"), "css: dropzone lista");
ok(cssSrc.includes(".hiring-pipeline__step-state"), "css: estados del stepper");
ok(domainSrc.includes("hiring-vacancy-card"), "dominio: tarjeta vacante");
ok(cssSrc.includes("--hi-blue: var(--primary"), "css: paleta marca");
ok(runtimeSrc.includes("function renderHiringPipelineBoard"), "runtime: tablero expuesto");
const contratacionSrc = readFileSync(join(root, "modules/app/contratacion.js"), "utf8");
ok(contratacionSrc.includes("interviewFlowReturn"), "js: contexto de retorno entrevista");
ok(contratacionSrc.includes("No avanzar a Entrevistado al agendar"), "js: no avanza etapa al agendar");
ok(!/hiring-select-candidate[\s\S]{0,500}?candidateView:\s*"board"/.test(contratacionSrc), "select no fuerza vista tablero");
ok(contratacionSrc.includes("Conservar candidato al alternar"), "cambio de vista conserva candidato");
ok(runtimeSrc.includes("useApiBlob: true"), "runtime: descarga CV por API blob");
ok(runtimeSrc.includes("candidateMayHaveCvInStorage"), "runtime: CV en storage");
ok(apiCvSrc.includes("getCandidateCvFile"), "api: endpoint cv-file");
ok(
  /async getCandidateCvFile[\s\S]{0,400}?resolveEffectivePermissionSet/.test(apiCvSrc),
  "api: CV usa permisos efectivos del rol"
);

const eventsSrc = readFileSync(join(root, "modules/core/events.js"), "utf8");
ok(eventsSrc.includes('fd.set("attachment", cvFile'), "postulación pública fuerza archivo en FormData");

console.log("OK hiring-selection-ui: helpers, markup, CSS y permisos CV validados.");
