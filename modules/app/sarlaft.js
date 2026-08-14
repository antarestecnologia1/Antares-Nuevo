/**
 * SARLAFT / PTE: conocimiento de terceros, debida diligencia, perfiles de riesgo,
 * alertas, revisiones, trazabilidad y reportes. Evidencias vía Gestión Documental.
 */
import { state, nodes, persistHrWorkspace } from "../core/store.js";
import { read, writeAwaitServer, writeAwaitServerCreate, writeAwaitServerEdit } from "../core/data-io.js";
import { KEYS, HR_VALID_SARLAFT_WS } from "../core/config.js";
import {
  escapeHtml,
  escapeAttr,
  buildModuleCreatePanelsState,
  normalizeHrWorkspace,
  normalizeSarlaftDataSection,
  normalizeSarlaftOperateSection,
  colombiaTodayIsoDate,
  stampCreatedRecord,
  stampUpdatedRecord,
  newUuidV4
} from "../core/utils.js";
import {
  canAccessSarlaftView,
  canDeleteSarlaftRecords,
  canMutateSarlaftAlerts,
  canMutateSarlaftParties,
  canMutateSarlaftProfiles,
  canMutateSarlaftReviews,
  currentUser
} from "../core/auth.js";
import {
  renderHrWorkspaceTabs,
  renderHrWorkspaceHeader,
  renderHrAlertCards,
  switchHrWorkspacePanels,
  switchModuleTabPanels,
  createHrActionCard
} from "../ui/components.js";
import { downloadCsv } from "../domain/reporteria.domain.js";
import {
  SARLAFT_COMPANY_FOLDER,
  SARLAFT_DOCUMENT_PROCESS,
  SARLAFT_PROGRAMS,
  SARLAFT_PERSON_KINDS,
  SARLAFT_PARTY_TYPES,
  SARLAFT_DOCUMENT_TYPES,
  SARLAFT_KYC_STATUSES,
  SARLAFT_DUE_DILIGENCE_LEVELS,
  SARLAFT_RISK_LEVELS,
  SARLAFT_ALERT_KINDS,
  SARLAFT_ALERT_SEVERITIES,
  SARLAFT_ALERT_STATUSES,
  SARLAFT_REVIEW_KINDS,
  SARLAFT_REVIEW_STATUSES,
  DEFAULT_SARLAFT_RISK_PROFILES,
  sarlaftCatalogLabel,
  sarlaftCatalogOptionsHtml,
  normalizeSarlaftThirdPartyRow,
  normalizeSarlaftRiskProfileRow,
  normalizeSarlaftAlertRow,
  normalizeSarlaftReviewRow,
  applySarlaftTextFilter,
  paginateSarlaftItems,
  summarizeSarlaft,
  collectSarlaftDueParties,
  documentsLinkedToSarlaftParty,
  buildSarlaftPartyExportRows,
  buildSarlaftAlertExportRows,
  SARLAFT_PARTY_EXPORT_COLUMNS,
  SARLAFT_ALERT_EXPORT_COLUMNS,
  nextSarlaftPartyCode,
  computeSarlaftNextReviewDate
} from "../domain/sarlaft.domain.js";
import {
  normalizeCompanyDocumentRow,
  formatCompanyDocumentDisplayName
} from "../domain/company-documents.domain.js";

const G = globalThis;
const PAGE_SIZE = 10;

if (typeof window !== "undefined") {
  window.normalizeSarlaftThirdPartyRow = normalizeSarlaftThirdPartyRow;
  window.normalizeSarlaftRiskProfileRow = normalizeSarlaftRiskProfileRow;
  window.normalizeSarlaftAlertRow = normalizeSarlaftAlertRow;
  window.normalizeSarlaftReviewRow = normalizeSarlaftReviewRow;
}

function actorLabel() {
  const user = currentUser();
  return String(user?.name || user?.email || "Portal").trim() || "Portal";
}

function readParties() {
  return read(KEYS.sarlaftThirdParties, []).map(normalizeSarlaftThirdPartyRow).filter(Boolean);
}

function readProfiles() {
  return read(KEYS.sarlaftRiskProfiles, []).map(normalizeSarlaftRiskProfileRow).filter(Boolean);
}

function readAlerts() {
  return read(KEYS.sarlaftAlerts, []).map(normalizeSarlaftAlertRow).filter(Boolean);
}

function readReviews() {
  return read(KEYS.sarlaftReviews, []).map(normalizeSarlaftReviewRow).filter(Boolean);
}

function readCompanyDocs() {
  return read(KEYS.companyDocuments, []).map(normalizeCompanyDocumentRow).filter((d) => d && d.id);
}

function getUi() {
  if (!state.sarlaftUi || typeof state.sarlaftUi !== "object") {
    state.sarlaftUi = {
      workspace: "operate",
      operateSection: "party",
      dataSection: "parties",
      listSearch: "",
      listPage: 1,
      pageSize: PAGE_SIZE,
      selectedPartyId: ""
    };
  }
  return state.sarlaftUi;
}

function patchUi(partial) {
  state.sarlaftUi = { ...getUi(), ...partial };
}

function userOptionsHtml(selectedId = "") {
  const users = read(KEYS.users, []);
  const sel = String(selectedId || "");
  return users
    .map((u) => {
      const id = String(u.id || "");
      const label = String(u.name || u.email || id).trim();
      if (!id || !label) return "";
      return `<option value="${escapeAttr(id)}"${id === sel ? " selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .filter(Boolean)
    .join("");
}

function partyOptionsHtml(selectedId = "") {
  return readParties()
    .map((p) => {
      const id = String(p.id);
      return `<option value="${escapeAttr(id)}"${id === String(selectedId) ? " selected" : ""}>${escapeHtml(p.name)} · ${escapeHtml(p.documentNumber || p.code || "")}</option>`;
    })
    .join("");
}

function profileOptionsHtml(selectedId = "") {
  return readProfiles()
    .filter((p) => p.active)
    .map((p) => {
      const id = String(p.id);
      return `<option value="${escapeAttr(id)}" data-level="${escapeAttr(p.level)}" data-dd="${escapeAttr(p.dueDiligenceLevel)}" data-days="${escapeAttr(String(p.reviewFrequencyDays))}"${id === String(selectedId) ? " selected" : ""}>${escapeHtml(p.name)} · ${escapeHtml(sarlaftCatalogLabel(SARLAFT_RISK_LEVELS, p.level))}</option>`;
    })
    .join("");
}

function riskChip(level) {
  const label = sarlaftCatalogLabel(SARLAFT_RISK_LEVELS, level);
  return `<span class="sarlaft-risk-chip sarlaft-risk-chip--${escapeAttr(level || "medio")}">${escapeHtml(label)}</span>`;
}

function kycPill(status) {
  const map = {
    aprobado: "ok",
    en_proceso: "warning",
    observado: "warning",
    rechazado: "expired",
    pendiente: "missing"
  };
  const tone = map[status] || "missing";
  return `<span class="sst-status-pill sst-status-pill--${tone}">${escapeHtml(sarlaftCatalogLabel(SARLAFT_KYC_STATUSES, status))}</span>`;
}

function alertStatusPill(status) {
  const map = {
    abierta: "expired",
    en_gestion: "warning",
    en_revision: "warning",
    cerrada: "ok",
    desestimada: "total"
  };
  return `<span class="sst-status-pill sst-status-pill--${map[status] || "missing"}">${escapeHtml(sarlaftCatalogLabel(SARLAFT_ALERT_STATUSES, status))}</span>`;
}

function dueBucketPill(bucket) {
  const labels = { expired: "Vencida", warning: "Por vencer", missing: "Sin fecha", ok: "Al día" };
  const tones = { expired: "expired", warning: "warning", missing: "missing", ok: "ok" };
  return `<span class="sst-status-pill sst-status-pill--${tones[bucket] || "missing"}">${escapeHtml(labels[bucket] || bucket)}</span>`;
}

function auditSarlaft(action, entityId, entityLabel, summary) {
  G.logPortalAuditEvent?.("sarlaft", action, {
    entityId,
    entityLabel,
    summary,
    at: G.nowIso?.() || new Date().toISOString()
  });
}

function findUserName(userId) {
  const id = String(userId || "");
  if (!id) return "";
  const u = read(KEYS.users, []).find((row) => String(row.id) === id);
  return String(u?.name || u?.email || "").trim();
}

async function ensureDefaultRiskProfiles() {
  if (!canMutateSarlaftProfiles()) return;
  const existing = readProfiles();
  if (existing.length) return;
  const now = new Date().toISOString();
  const seeded = DEFAULT_SARLAFT_RISK_PROFILES.map((row) =>
    normalizeSarlaftRiskProfileRow({
      ...row,
      createdAt: now,
      createdBy: "Sistema",
      updatedAt: now
    })
  );
  try {
    await writeAwaitServer(KEYS.sarlaftRiskProfiles, seeded, { notifyOnFailure: false });
  } catch (_err) {
    /* El módulo sigue usable con la lista en memoria si el sync falla. */
  }
}

function openSarlaftDocumentsInDms(party) {
  if (!state.companyDocsUi || typeof state.companyDocsUi !== "object") {
    state.companyDocsUi = {};
  }
  state.companyDocsUi.folderFilter = SARLAFT_COMPANY_FOLDER;
  state.companyDocsUi.search = String(party?.name || "").trim();
  state.companyDocsUi.entityTypeFilter = "tercero";
  state.companyDocsUi.processFilter = SARLAFT_DOCUMENT_PROCESS;
  state.companyDocsUi.showFilters = true;
  state.companyDocsUi.page = 1;
  state.currentView = "document-management";
  try {
    history.replaceState(null, "", "#portal/document-management");
  } catch (_e) {
    /* noop */
  }
  G.renderPortalView?.();
}

function firstAllowedSarlaftOperateSection(caps) {
  if (caps?.canParties) return "party";
  if (caps?.canAlerts) return "alert";
  if (caps?.canReviews) return "review";
  if (caps?.canProfiles) return "profile";
  return "party";
}

function renderOperateNav(activeId, caps = {}) {
  const tabs = [
    { id: "party", label: "Tercero", hint: "Conocimiento y verificación", norm: "KYC", icon: "user", allowed: Boolean(caps.canParties) },
    { id: "alert", label: "Alerta", hint: "Novedad, hallazgo o situación", norm: "Seguimiento", icon: "alert", allowed: Boolean(caps.canAlerts) },
    { id: "review", label: "Revisión", hint: "Observaciones y responsables", norm: "Gestión", icon: "file", allowed: Boolean(caps.canReviews) },
    { id: "profile", label: "Perfil de riesgo", hint: "Matriz y parametrización", norm: "Metodología", icon: "shield", allowed: Boolean(caps.canProfiles) }
  ].filter((t) => t.allowed);
  const active = tabs.some((t) => t.id === activeId)
    ? activeId
    : firstAllowedSarlaftOperateSection(caps);
  const IC = G.IC || {};
  return `<nav class="sst-operate-nav" role="tablist" aria-label="Registro SARLAFT / PTE">
    ${tabs
      .map((t) => {
        const isActive = active === t.id;
        const iconHtml = IC[t.icon] ? `<span class="sst-operate-nav-ico" aria-hidden="true">${IC[t.icon]}</span>` : "";
        return `<button type="button" role="tab" class="sst-operate-nav-tab${isActive ? " is-active" : ""}" aria-selected="${isActive ? "true" : "false"}" data-action="sarlaft-operate-section" data-section="${escapeAttr(t.id)}" title="${escapeAttr(t.hint)}">
          ${iconHtml}
          <span class="sst-operate-nav-copy">
            <strong class="sst-operate-nav-label">${escapeHtml(t.label)}</strong>
            <small class="sst-operate-nav-hint">${escapeHtml(t.hint)}</small>
            <span class="sst-operate-nav-norm">${escapeHtml(t.norm)}</span>
          </span>
        </button>`;
      })
      .join("")}
  </nav>`;
}

function renderDataNav(activeId, counts) {
  const active = normalizeSarlaftDataSection(activeId);
  const tabs = [
    { id: "parties", label: "Terceros", count: counts.parties },
    { id: "alerts", label: "Alertas", count: counts.alerts },
    { id: "due", label: "Vencimientos", count: counts.due },
    { id: "reviews", label: "Revisiones", count: counts.reviews },
    { id: "reports", label: "Reportes", count: null }
  ];
  return `<nav class="payroll-data-nav sst-consult-nav" aria-label="Consultas SARLAFT">
    ${tabs
      .map((t) => {
        const isActive = active === t.id;
        const badge = t.count == null ? "" : `<span class="payroll-data-nav__count">${t.count}</span>`;
        return `<button type="button" class="payroll-data-nav__btn${isActive ? " is-active" : ""}" data-action="sarlaft-data-section" data-section="${escapeAttr(t.id)}">${escapeHtml(t.label)}${badge}</button>`;
      })
      .join("")}
  </nav>`;
}

function renderPagination(IC, { total, page, pageSize }) {
  const pages = Math.max(1, Math.ceil((total || 0) / (pageSize || PAGE_SIZE)));
  if (pages <= 1) return "";
  const prevDisabled = page <= 1 ? " disabled" : "";
  const nextDisabled = page >= pages ? " disabled" : "";
  return `<div class="sst-list-pagination payroll-result-meta">
    <button type="button" class="btn btn-sm btn-outline" data-action="sarlaft-list-page" data-page="${page - 1}"${prevDisabled}>${IC.chevronLeft || "‹"} Anterior</button>
    <span>Página ${page} de ${pages}</span>
    <button type="button" class="btn btn-sm btn-outline" data-action="sarlaft-list-page" data-page="${page + 1}"${nextDisabled}>Siguiente ${IC.chevronRight || "›"}</button>
  </div>`;
}

function partyFormHtml(fieldLabel, IC, canMutate) {
  if (!canMutate) return G.emptyState("No tiene permiso para registrar terceros.");
  const today = colombiaTodayIsoDate();
  return `<form id="form-sarlaft-party" class="p-form p-form-colored hr-form-flow antares-create-form" autocomplete="off" novalidate>
    <div class="antares-create-form__sections">
      <fieldset class="form-section form-section-blue full">
        <legend>${IC.user || ""} Identificación del tercero</legend>
        <p class="muted form-section-hint">Registro de personas naturales o jurídicas sujetas a conocimiento y verificación.</p>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.briefcase, "Tipo de vínculo", { required: true })}
            <select name="partyType" required><option value="">Seleccione...</option>${sarlaftCatalogOptionsHtml(SARLAFT_PARTY_TYPES)}</select>
          </label>
          <label>${fieldLabel(IC.user, "Tipo de persona", { required: true })}
            <select name="kind" required>${sarlaftCatalogOptionsHtml(SARLAFT_PERSON_KINDS)}</select>
          </label>
          <label class="full">${fieldLabel(IC.user, "Nombre / razón social", { required: true })}
            <input name="name" required maxlength="255" placeholder="Nombre completo o razón social" />
          </label>
          <label>${fieldLabel(IC.file, "Nombre comercial")}
            <input name="tradeName" maxlength="255" placeholder="Si aplica" />
          </label>
          <label>${fieldLabel(IC.hash, "Tipo de documento", { required: true })}
            <select name="documentType" required>${sarlaftCatalogOptionsHtml(SARLAFT_DOCUMENT_TYPES)}</select>
          </label>
          <label>${fieldLabel(IC.hash, "Número de documento", { required: true })}
            <input name="documentNumber" required maxlength="64" placeholder="Documento o NIT" />
          </label>
          <label>${fieldLabel(IC.hash, "NIT")}
            <input name="nit" maxlength="32" placeholder="Si es persona jurídica" />
          </label>
        </div>
      </fieldset>
      <fieldset class="form-section form-section-emerald full">
        <legend>${IC.activity || ""} Ubicación y contacto</legend>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.mail || IC.file, "Correo")}<input type="email" name="email" maxlength="255" /></label>
          <label>${fieldLabel(IC.phone || IC.user, "Teléfono")}<input name="phone" maxlength="64" /></label>
          <label>${fieldLabel(IC.map || IC.activity, "Departamento")}<input name="department" maxlength="120" /></label>
          <label>${fieldLabel(IC.map || IC.activity, "Ciudad")}<input name="city" maxlength="120" /></label>
          <label class="full">${fieldLabel(IC.map || IC.file, "Dirección")}<input name="address" maxlength="255" /></label>
          <label class="full">${fieldLabel(IC.briefcase, "Actividad económica")}<input name="economicActivity" maxlength="255" placeholder="CIIU o descripción" /></label>
        </div>
      </fieldset>
      <fieldset class="form-section form-section-violet full">
        <legend>${IC.shield || ""} Riesgo, debida diligencia y revisión</legend>
        <p class="muted form-section-hint">Clasificación conforme a la matriz parametrizada. La próxima revisión se calcula con la frecuencia del perfil.</p>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.shield, "Programa", { required: true })}
            <select name="program" required>${sarlaftCatalogOptionsHtml(SARLAFT_PROGRAMS, "ambos")}</select>
          </label>
          <label>${fieldLabel(IC.activity, "Perfil de riesgo")}
            <select name="riskProfileId" data-sarlaft-profile-select><option value="">Seleccione...</option>${profileOptionsHtml()}</select>
          </label>
          <label>${fieldLabel(IC.activity, "Nivel de riesgo", { required: true })}
            <select name="riskLevel" required>${sarlaftCatalogOptionsHtml(SARLAFT_RISK_LEVELS, "medio")}</select>
          </label>
          <label>${fieldLabel(IC.file, "Debida diligencia", { required: true })}
            <select name="dueDiligenceLevel" required>${sarlaftCatalogOptionsHtml(SARLAFT_DUE_DILIGENCE_LEVELS, "normal")}</select>
          </label>
          <label>${fieldLabel(IC.check, "Estado de conocimiento", { required: true })}
            <select name="kycStatus" required>${sarlaftCatalogOptionsHtml(SARLAFT_KYC_STATUSES, "pendiente")}</select>
          </label>
          <label>${fieldLabel(IC.calendar, "Próxima revisión")}
            <input type="date" name="nextReviewDate" value="${escapeAttr(today)}" />
          </label>
          <label>${fieldLabel(IC.user, "Responsable")}
            <select name="responsibleUserId"><option value="">Sin asignar</option>${userOptionsHtml()}</select>
          </label>
          <label class="full">
            <span class="field-label">¿Es PEP?</span>
            <select name="pepFlag"><option value="false">No</option><option value="true">Sí</option></select>
          </label>
          <label class="full">${fieldLabel(IC.file, "Detalle PEP / observaciones")}
            <textarea name="notes" rows="3" placeholder="Hallazgos de conocimiento, listas, origen de fondos o conflictos de interés"></textarea>
          </label>
        </div>
      </fieldset>
    </div>
    <footer class="antares-create-form__footer">
      ${G.renderManagedCreateFormActions("create-sarlaft-party", `<button class="btn btn-primary antares-create-form__submit" type="submit">${IC.plus || ""} Registrar tercero</button>`)}
    </footer>
  </form>`;
}

function alertFormHtml(fieldLabel, IC, canMutate) {
  if (!canMutate) return G.emptyState("No tiene permiso para registrar alertas.");
  return `<form id="form-sarlaft-alert" class="p-form p-form-colored hr-form-flow antares-create-form" autocomplete="off" novalidate>
    <div class="antares-create-form__sections">
      <fieldset class="form-section form-section-blue full">
        <legend>${IC.alert || ""} Alerta, novedad o hallazgo</legend>
        <p class="muted form-section-hint">Situaciones que requieren revisión y gestión interna según políticas SARLAFT/PTE.</p>
        <div class="form-section-grid">
          <label class="full">${fieldLabel(IC.user, "Tercero relacionado", { required: true })}
            <select name="thirdPartyId" required><option value="">Seleccione...</option>${partyOptionsHtml()}</select>
          </label>
          <label>${fieldLabel(IC.file, "Tipo", { required: true })}
            <select name="kind" required>${sarlaftCatalogOptionsHtml(SARLAFT_ALERT_KINDS)}</select>
          </label>
          <label>${fieldLabel(IC.shield, "Programa")}<select name="program">${sarlaftCatalogOptionsHtml(SARLAFT_PROGRAMS, "ambos")}</select></label>
          <label>${fieldLabel(IC.alert, "Severidad", { required: true })}
            <select name="severity" required>${sarlaftCatalogOptionsHtml(SARLAFT_ALERT_SEVERITIES, "media")}</select>
          </label>
          <label>${fieldLabel(IC.activity, "Estado")}<select name="status">${sarlaftCatalogOptionsHtml(SARLAFT_ALERT_STATUSES, "abierta")}</select></label>
          <label class="full">${fieldLabel(IC.file, "Título", { required: true })}
            <input name="title" required maxlength="255" placeholder="Resumen de la situación" />
          </label>
          <label class="full">${fieldLabel(IC.file, "Descripción", { required: true })}
            <textarea name="description" rows="3" required placeholder="Hechos, fuente y gestión requerida"></textarea>
          </label>
          <label>${fieldLabel(IC.calendar, "Fecha límite")}<input type="date" name="dueDate" /></label>
          <label>${fieldLabel(IC.user, "Responsable")}
            <select name="responsibleUserId"><option value="">Sin asignar</option>${userOptionsHtml()}</select>
          </label>
          <label>${fieldLabel(IC.hash, "Origen")}<input name="source" maxlength="120" placeholder="Listas, denuncia, auditoría..." /></label>
        </div>
      </fieldset>
    </div>
    <footer class="antares-create-form__footer">
      ${G.renderManagedCreateFormActions("create-sarlaft-alert", `<button class="btn btn-primary antares-create-form__submit" type="submit">${IC.plus || ""} Registrar alerta</button>`)}
    </footer>
  </form>`;
}

function reviewFormHtml(fieldLabel, IC, canMutate) {
  if (!canMutate) return G.emptyState("No tiene permiso para registrar revisiones.");
  return `<form id="form-sarlaft-review" class="p-form p-form-colored hr-form-flow antares-create-form" autocomplete="off" novalidate>
    <div class="antares-create-form__sections">
      <fieldset class="form-section form-section-emerald full">
        <legend>${IC.file || ""} Revisión u observación</legend>
        <p class="muted form-section-hint">Deje constancia de la actuación: responsable, estado y observaciones.</p>
        <div class="form-section-grid">
          <label class="full">${fieldLabel(IC.user, "Tercero", { required: true })}
            <select name="thirdPartyId" required><option value="">Seleccione...</option>${partyOptionsHtml()}</select>
          </label>
          <label>${fieldLabel(IC.file, "Tipo", { required: true })}
            <select name="kind" required>${sarlaftCatalogOptionsHtml(SARLAFT_REVIEW_KINDS)}</select>
          </label>
          <label>${fieldLabel(IC.activity, "Estado")}<select name="status">${sarlaftCatalogOptionsHtml(SARLAFT_REVIEW_STATUSES, "pendiente")}</select></label>
          <label>${fieldLabel(IC.calendar, "Fecha de revisión")}<input type="date" name="reviewedAt" value="${escapeAttr(colombiaTodayIsoDate())}" /></label>
          <label>${fieldLabel(IC.user, "Responsable")}
            <select name="responsibleUserId"><option value="">Sin asignar</option>${userOptionsHtml()}</select>
          </label>
          <label class="full">${fieldLabel(IC.file, "Observaciones", { required: true })}
            <textarea name="observations" rows="3" required placeholder="Resultado de la revisión, pendientes y decisión"></textarea>
          </label>
        </div>
      </fieldset>
    </div>
    <footer class="antares-create-form__footer">
      ${G.renderManagedCreateFormActions("create-sarlaft-review", `<button class="btn btn-primary antares-create-form__submit" type="submit">${IC.plus || ""} Registrar revisión</button>`)}
    </footer>
  </form>`;
}

function profileFormHtml(fieldLabel, IC, canMutate) {
  if (!canMutate) return G.emptyState("No tiene permiso para parametrizar perfiles de riesgo.");
  return `<form id="form-sarlaft-profile" class="p-form p-form-colored hr-form-flow antares-create-form" autocomplete="off" novalidate>
    <div class="antares-create-form__sections">
      <fieldset class="form-section form-section-violet full">
        <legend>${IC.shield || ""} Perfil de la matriz de riesgo</legend>
        <p class="muted form-section-hint">Parametrice criterios y periodicidad de revisión según la metodología del contratante.</p>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.hash, "Código", { required: true })}<input name="code" required maxlength="32" placeholder="Ej. ALTO" /></label>
          <label>${fieldLabel(IC.file, "Nombre", { required: true })}<input name="name" required maxlength="120" placeholder="Ej. Riesgo alto" /></label>
          <label>${fieldLabel(IC.shield, "Programa")}<select name="program">${sarlaftCatalogOptionsHtml(SARLAFT_PROGRAMS, "ambos")}</select></label>
          <label>${fieldLabel(IC.activity, "Nivel", { required: true })}
            <select name="level" required>${sarlaftCatalogOptionsHtml(SARLAFT_RISK_LEVELS, "medio")}</select>
          </label>
          <label>${fieldLabel(IC.file, "Debida diligencia", { required: true })}
            <select name="dueDiligenceLevel" required>${sarlaftCatalogOptionsHtml(SARLAFT_DUE_DILIGENCE_LEVELS, "normal")}</select>
          </label>
          <label>${fieldLabel(IC.calendar, "Frecuencia de revisión (días)", { required: true })}
            <input type="number" name="reviewFrequencyDays" required min="1" max="1095" value="180" />
          </label>
          <label class="full">${fieldLabel(IC.file, "Criterios / metodología", { required: true })}
            <textarea name="criteria" rows="3" required placeholder="Factores de la matriz: tipo de tercero, zona, PEP, actividad, montos..."></textarea>
          </label>
        </div>
      </fieldset>
    </div>
    <footer class="antares-create-form__footer">
      ${G.renderManagedCreateFormActions("create-sarlaft-profile", `<button class="btn btn-primary antares-create-form__submit" type="submit">${IC.plus || ""} Guardar perfil</button>`)}
    </footer>
  </form>`;
}

function rowActions(IC, actionsHtml) {
  return `<details class="sst-row-more">
    <summary class="sst-row-more__btn" title="Más acciones">${IC.more || IC.edit || "⋯"}</summary>
    <div class="sst-row-more__menu">${actionsHtml}</div>
  </details>`;
}

function sarlaftPteHtml() {
  const IC = G.IC || {};
  const fieldLabel = G.fieldLabel;
  const emptyState = G.emptyState;
  if (typeof fieldLabel !== "function" || typeof canAccessSarlaftView !== "function") return "";
  if (!canAccessSarlaftView(currentUser())) return emptyState("No tiene permiso para consultar SARLAFT / PTE.");

  const ui = getUi();
  const canParties = canMutateSarlaftParties();
  const canAlerts = canMutateSarlaftAlerts();
  const canReviews = canMutateSarlaftReviews();
  const canProfiles = canMutateSarlaftProfiles();
  const canDelete = canDeleteSarlaftRecords();
  const canOperate = canParties || canAlerts || canReviews || canProfiles;
  const operateCaps = { canParties, canAlerts, canReviews, canProfiles };
  let workspace = normalizeHrWorkspace("sarlaft", ui.workspace);
  if (workspace === "operate" && !canOperate) workspace = "data";
  let operateSection = normalizeSarlaftOperateSection(ui.operateSection);
  const operateAllowed =
    (operateSection === "party" && canParties) ||
    (operateSection === "alert" && canAlerts) ||
    (operateSection === "review" && canReviews) ||
    (operateSection === "profile" && canProfiles);
  if (!operateAllowed) operateSection = firstAllowedSarlaftOperateSection(operateCaps);
  const dataSection = normalizeSarlaftDataSection(ui.dataSection);
  const listSearchRaw = String(ui.listSearch || "");
  const listSearchNorm = listSearchRaw.trim().toLowerCase();
  const listPage = Math.max(1, Number(ui.listPage) || 1);
  const pageSize = Math.max(5, Number(ui.pageSize) || PAGE_SIZE);
  const today = colombiaTodayIsoDate();

  const parties = readParties();
  const profiles = readProfiles();
  const alerts = readAlerts();
  const reviews = readReviews();
  const docs = readCompanyDocs();
  const kpis = summarizeSarlaft({ parties, alerts, reviews, todayYmd: today });
  const dueItems = collectSarlaftDueParties(parties, today);

  const filteredParties = applySarlaftTextFilter(
    parties,
    listSearchNorm,
    (p) => `${p.code} ${p.name} ${p.documentNumber} ${p.nit} ${p.partyType} ${p.kycStatus} ${p.riskLevel} ${p.city}`
  );
  const filteredAlerts = applySarlaftTextFilter(
    alerts,
    listSearchNorm,
    (a) => `${a.title} ${a.thirdPartyName} ${a.kind} ${a.status} ${a.severity} ${a.source}`
  );
  const filteredDue = applySarlaftTextFilter(
    dueItems,
    listSearchNorm,
    (p) => `${p.name} ${p.documentNumber} ${p.nextReviewDate} ${p.responsibleName}`
  );
  const filteredReviews = applySarlaftTextFilter(
    reviews,
    listSearchNorm,
    (r) => `${r.thirdPartyName} ${r.kind} ${r.status} ${r.observations} ${r.responsibleName}`
  );

  const activeSource =
    dataSection === "alerts"
      ? filteredAlerts
      : dataSection === "due"
        ? filteredDue
        : dataSection === "reviews"
          ? filteredReviews
          : filteredParties;
  const paged = paginateSarlaftItems(dataSection === "reports" ? [] : activeSource, listPage, pageSize);

  const partyRows = (dataSection === "parties" ? paged.items : filteredParties)
    .map((p) => {
      const more = [
        `<button type="button" class="sst-row-more__item" data-action="view-sarlaft-party" data-id="${escapeAttr(p.id)}">${IC.eye || ""} Ver</button>`,
        canParties
          ? `<button type="button" class="sst-row-more__item" data-action="edit-sarlaft-party" data-id="${escapeAttr(p.id)}">${IC.edit || ""} Editar</button>`
          : "",
        `<button type="button" class="sst-row-more__item" data-action="sarlaft-open-dms" data-id="${escapeAttr(p.id)}">${IC.file || ""} Evidencias</button>`,
        canDelete
          ? `<button type="button" class="sst-row-more__item sst-row-more__item--danger" data-action="delete-sarlaft-party" data-id="${escapeAttr(p.id)}">${IC.trash || ""} Eliminar</button>`
          : ""
      ]
        .filter(Boolean)
        .join("");
      return `<tr>
        <td><strong>${escapeHtml(p.name)}</strong>${p.pepFlag ? '<span class="sarlaft-pep-flag">PEP</span>' : ""}<div class="sarlaft-party-cell"><small>${escapeHtml(p.code || "—")} · ${escapeHtml(p.documentType)} ${escapeHtml(p.documentNumber || "—")}</small></div></td>
        <td>${escapeHtml(sarlaftCatalogLabel(SARLAFT_PARTY_TYPES, p.partyType))}</td>
        <td>${riskChip(p.riskLevel)}</td>
        <td>${kycPill(p.kycStatus)}</td>
        <td>${escapeHtml(p.nextReviewDate || "—")}</td>
        <td>${escapeHtml(p.responsibleName || "—")}</td>
        <td class="payroll-contracts-table__actions">${rowActions(IC, more)}</td>
      </tr>`;
    })
    .join("");

  const alertRows = (dataSection === "alerts" ? paged.items : filteredAlerts)
    .map((a) => {
      const more = [
        `<button type="button" class="sst-row-more__item" data-action="view-sarlaft-alert" data-id="${escapeAttr(a.id)}">${IC.eye || ""} Ver</button>`,
        canAlerts
          ? `<button type="button" class="sst-row-more__item" data-action="edit-sarlaft-alert" data-id="${escapeAttr(a.id)}">${IC.edit || ""} Gestionar</button>`
          : "",
        canDelete
          ? `<button type="button" class="sst-row-more__item sst-row-more__item--danger" data-action="delete-sarlaft-alert" data-id="${escapeAttr(a.id)}">${IC.trash || ""} Eliminar</button>`
          : ""
      ]
        .filter(Boolean)
        .join("");
      return `<tr>
        <td><strong>${escapeHtml(a.title)}</strong><div class="sarlaft-party-cell"><small>${escapeHtml(sarlaftCatalogLabel(SARLAFT_ALERT_KINDS, a.kind))} · ${escapeHtml(a.thirdPartyName || "—")}</small></div></td>
        <td>${escapeHtml(sarlaftCatalogLabel(SARLAFT_ALERT_SEVERITIES, a.severity))}</td>
        <td>${alertStatusPill(a.status)}</td>
        <td>${escapeHtml(a.dueDate || "—")}</td>
        <td>${escapeHtml(a.responsibleName || "—")}</td>
        <td class="payroll-contracts-table__actions">${rowActions(IC, more)}</td>
      </tr>`;
    })
    .join("");

  const dueRows = (dataSection === "due" ? paged.items : filteredDue)
    .map((p) => `<tr>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td>${riskChip(p.riskLevel)}</td>
      <td>${escapeHtml(p.nextReviewDate || "—")}</td>
      <td>${dueBucketPill(p.bucket)}</td>
      <td>${escapeHtml(p.responsibleName || "—")}</td>
      <td class="payroll-contracts-table__actions">
        <button type="button" class="btn btn-sm btn-outline" data-action="view-sarlaft-party" data-id="${escapeAttr(p.id)}">${IC.eye || ""} Ver</button>
      </td>
    </tr>`)
    .join("");

  const reviewRows = (dataSection === "reviews" ? paged.items : filteredReviews)
    .map((r) => {
      const more = [
        canReviews
          ? `<button type="button" class="sst-row-more__item" data-action="edit-sarlaft-review" data-id="${escapeAttr(r.id)}">${IC.edit || ""} Editar</button>`
          : "",
        canDelete
          ? `<button type="button" class="sst-row-more__item sst-row-more__item--danger" data-action="delete-sarlaft-review" data-id="${escapeAttr(r.id)}">${IC.trash || ""} Eliminar</button>`
          : ""
      ]
        .filter(Boolean)
        .join("");
      return `<tr>
        <td><strong>${escapeHtml(sarlaftCatalogLabel(SARLAFT_REVIEW_KINDS, r.kind))}</strong><div class="sarlaft-party-cell"><small>${escapeHtml(r.thirdPartyName || "—")}</small></div></td>
        <td>${escapeHtml(sarlaftCatalogLabel(SARLAFT_REVIEW_STATUSES, r.status))}</td>
        <td>${escapeHtml(r.reviewedAt || String(r.createdAt || "").slice(0, 10) || "—")}</td>
        <td>${escapeHtml(r.responsibleName || "—")}</td>
        <td>${escapeHtml((r.observations || "").slice(0, 80))}${(r.observations || "").length > 80 ? "…" : ""}</td>
        <td class="payroll-contracts-table__actions">${more ? rowActions(IC, more) : "—"}</td>
      </tr>`;
    })
    .join("");

  const profileCards = profiles
    .map(
      (p) => `<article class="sst-due-card">
        <div class="sst-due-card__top">
          <strong>${escapeHtml(p.name)}</strong>
          ${riskChip(p.level)}
        </div>
        <p class="muted">${escapeHtml(p.code)} · Revisión cada ${escapeHtml(String(p.reviewFrequencyDays))} días · ${escapeHtml(sarlaftCatalogLabel(SARLAFT_DUE_DILIGENCE_LEVELS, p.dueDiligenceLevel))}</p>
        <p>${escapeHtml(p.criteria || "Sin criterios registrados.")}</p>
      </article>`
    )
    .join("");

  const tableOrEmpty = (rows, emptyMsg, thead) =>
    rows
      ? `<div class="table-wrap payroll-table-wrap sst-consult-table-wrap"><table class="sst-consult-table"><thead>${thead}</thead><tbody>${rows}</tbody></table></div>`
      : emptyState(emptyMsg);

  const partiesTable = tableOrEmpty(
    partyRows,
    "No hay terceros registrados.",
    "<tr><th>Tercero</th><th>Vínculo</th><th>Riesgo</th><th>Conocimiento</th><th>Próxima revisión</th><th>Responsable</th><th class='payroll-contracts-table__actions'>Acciones</th></tr>"
  );
  const alertsTable = tableOrEmpty(
    alertRows,
    "No hay alertas registradas.",
    "<tr><th>Situación</th><th>Severidad</th><th>Estado</th><th>Límite</th><th>Responsable</th><th class='payroll-contracts-table__actions'>Acciones</th></tr>"
  );
  const dueTable = tableOrEmpty(
    dueRows,
    "No hay vencimientos de revisión en la ventana de 30 días.",
    "<tr><th>Tercero</th><th>Riesgo</th><th>Fecha</th><th>Estado</th><th>Responsable</th><th class='payroll-contracts-table__actions'>Acciones</th></tr>"
  );
  const reviewsTable = tableOrEmpty(
    reviewRows,
    "No hay revisiones registradas.",
    "<tr><th>Tipo</th><th>Estado</th><th>Fecha</th><th>Responsable</th><th>Observación</th><th class='payroll-contracts-table__actions'>Acciones</th></tr>"
  );

  const reportsPane = `<div class="payroll-data-pane${dataSection === "reports" ? "" : " hidden"}" data-sarlaft-section="reports"${dataSection === "reports" ? "" : " hidden"}>
    <p class="muted payroll-result-meta">Exportaciones operativas con la información disponible en el sistema. Las evidencias se consultan también en Gestión documental (${escapeHtml(SARLAFT_COMPANY_FOLDER)}).</p>
    <div class="sst-due-grid">
      <article class="sst-due-card">
        <strong>Terceros y conocimiento</strong>
        <p class="muted">${kpis.parties} registros · ${kpis.pendingKyc} en conocimiento · ${kpis.pepCount} PEP</p>
        <button type="button" class="btn btn-sm btn-primary" data-action="export-sarlaft-parties">${IC.download || ""} Exportar CSV</button>
      </article>
      <article class="sst-due-card">
        <strong>Alertas y hallazgos</strong>
        <p class="muted">${kpis.openAlerts} abiertas · ${kpis.criticalAlerts} de alta/crítica</p>
        <button type="button" class="btn btn-sm btn-primary" data-action="export-sarlaft-alerts">${IC.download || ""} Exportar CSV</button>
      </article>
      <article class="sst-due-card">
        <strong>Perfiles parametrizados</strong>
        <p class="muted">${profiles.length} perfiles activos en la matriz</p>
      </article>
    </div>
    <h3 class="sst-consult-head">Matriz de perfiles</h3>
    <div class="sst-due-grid">${profileCards || emptyState("Parametrice al menos un perfil de riesgo.")}</div>
  </div>`;

  const kpiCards = renderHrAlertCards([
    { label: "Terceros", value: kpis.parties, tone: "info", icon: IC.user || "", help: "Sujetos a conocimiento" },
    { label: "Alertas abiertas", value: kpis.openAlerts, tone: kpis.openAlerts ? "warn" : "ok", icon: IC.alert || "", help: "Requieren gestión" },
    { label: "Revisiones por vencer", value: kpis.dueReviews, tone: kpis.dueReviews ? "alert" : "ok", icon: IC.calendar || "", help: "Ventana 30 días" },
    { label: "Riesgo alto / crítico", value: kpis.highRisk, tone: kpis.highRisk ? "warn" : "ok", icon: IC.shield || "", help: "Según matriz" }
  ]);

  const moduleHead = `<div class="hr-workspace-head">
    <div>
      <p class="hr-workspace-kicker">Cumplimiento</p>
      <h2>SARLAFT / PTE</h2>
      <p class="muted">Conocimiento de terceros, debida diligencia, alertas y trazabilidad de actuaciones.</p>
    </div>
  </div>${kpiCards}`;

  const tabsNav = renderHrWorkspaceTabs({
    module: "sarlaft",
    ariaLabel: "Secciones del módulo SARLAFT / PTE",
    activeId: workspace,
    variant: "switch",
    tabs: [
      ...(canOperate
        ? [{ id: "operate", label: "Registrar", icon: "plus", hint: "Terceros, alertas y perfiles" }]
        : []),
      { id: "data", label: "Consultar", icon: "eye", hint: "Seguimiento y reportes" }
    ]
  });

  const createUi = buildModuleCreatePanelsState(
    ["create-sarlaft-party", "create-sarlaft-alert", "create-sarlaft-review", "create-sarlaft-profile"],
    operateSection === "alert"
      ? "create-sarlaft-alert"
      : operateSection === "review"
        ? "create-sarlaft-review"
        : operateSection === "profile"
          ? "create-sarlaft-profile"
          : "create-sarlaft-party",
    state.createPanels || {},
    { expandActive: workspace === "operate" }
  );

  const partyPane = createHrActionCard(
    "create-sarlaft-party",
    "user",
    "Registrar tercero",
    "Conocimiento, verificación y clasificación de riesgo",
    partyFormHtml(fieldLabel, IC, canParties),
    "Abrir formulario",
    { createPanels: createUi }
  );
  const alertPane = createHrActionCard(
    "create-sarlaft-alert",
    "alert",
    "Registrar alerta o hallazgo",
    "Novedades que requieren gestión interna",
    alertFormHtml(fieldLabel, IC, canAlerts),
    "Abrir formulario",
    { createPanels: createUi }
  );
  const reviewPane = createHrActionCard(
    "create-sarlaft-review",
    "file",
    "Registrar revisión",
    "Observaciones, responsables y estado de gestión",
    reviewFormHtml(fieldLabel, IC, canReviews),
    "Abrir formulario",
    { createPanels: createUi }
  );
  const profilePane = createHrActionCard(
    "create-sarlaft-profile",
    "shield",
    "Parametrizar perfil de riesgo",
    "Matriz, criterios y periodicidad de revisión",
    profileFormHtml(fieldLabel, IC, canProfiles),
    "Abrir formulario",
    { createPanels: createUi }
  );

  const operateAlert =
    kpis.openAlerts || kpis.dueReviews
      ? `<p class="sst-operate-alert hr-attention-strip hr-attention-strip--warn" role="status">${IC.alert || ""} <strong>${kpis.openAlerts}</strong> alerta${kpis.openAlerts === 1 ? "" : "s"} abierta${kpis.openAlerts === 1 ? "" : "s"} · <strong>${kpis.dueReviews}</strong> revisión${kpis.dueReviews === 1 ? "" : "es"} por vencer.</p>`
      : "";

  const operatePanel = canOperate
    ? `<div class="hr-workspace-panel payroll-workspace-panel${workspace === "operate" ? "" : " hidden"}" role="tabpanel" data-sarlaft-panel="operate"${workspace === "operate" ? "" : " hidden"}>
    ${operateAlert}
    <section class="sst-operate sst-operate-panel">
      <aside class="sst-operate__rail" aria-label="Tipo de registro SARLAFT">
        <div class="sst-operate__rail-head"><p class="sst-operate__rail-label">Tipo de trámite</p></div>
        ${renderOperateNav(operateSection, operateCaps)}
      </aside>
      <div class="sst-operate__main auth-tab-panels">
        ${canParties ? `<div class="auth-tab-panel${operateSection === "party" ? "" : " hidden"}" data-sarlaft-operate-pane="party">${partyPane}</div>` : ""}
        ${canAlerts ? `<div class="auth-tab-panel${operateSection === "alert" ? "" : " hidden"}" data-sarlaft-operate-pane="alert">${alertPane}</div>` : ""}
        ${canReviews ? `<div class="auth-tab-panel${operateSection === "review" ? "" : " hidden"}" data-sarlaft-operate-pane="review">${reviewPane}</div>` : ""}
        ${canProfiles ? `<div class="auth-tab-panel${operateSection === "profile" ? "" : " hidden"}" data-sarlaft-operate-pane="profile">${profilePane}</div>` : ""}
      </div>
    </section>
  </div>`
    : "";

  const searchBar = `<div class="payroll-data-search-toolbar sst-consult-search-toolbar">
    <label class="payroll-data-search sst-consult-search">
      <span class="sst-consult-search__ico" aria-hidden="true">${IC.search || ""}</span>
      <input type="search" data-action="sarlaft-data-list-search" value="${escapeAttr(listSearchRaw)}" placeholder="Buscar tercero, documento, alerta, responsable..." autocomplete="off" />
    </label>
    <button type="button" class="btn btn-sm btn-outline sst-export-btn" data-action="export-sarlaft-current">${IC.download || ""} Exportar vista</button>
  </div>`;

  const listPagination = dataSection === "reports" ? "" : renderPagination(IC, paged);
  const dataPanel = `<div class="hr-workspace-panel payroll-workspace-panel${workspace === "data" ? "" : " hidden"}" role="tabpanel" data-sarlaft-panel="data"${workspace === "data" ? "" : " hidden"}>
    <section class="payroll-data-panel sst-consult-panel">
      ${searchBar}
      <div class="payroll-data-toolbar payroll-data-toolbar--compact sst-consult-toolbar">
        ${renderDataNav(dataSection, {
          parties: parties.length,
          alerts: kpis.openAlerts,
          due: dueItems.length,
          reviews: reviews.length
        })}
      </div>
      <div class="payroll-data-panes">
        <div class="payroll-data-pane${dataSection === "parties" ? "" : " hidden"}" data-sarlaft-section="parties"${dataSection === "parties" ? "" : " hidden"}>
          <p class="payroll-result-meta muted"><strong>${filteredParties.length}</strong> tercero${filteredParties.length === 1 ? "" : "s"} · evidencias en Gestión documental</p>
          <div class="payroll-table-shell">${partiesTable}</div>
          ${dataSection === "parties" ? listPagination : ""}
        </div>
        <div class="payroll-data-pane${dataSection === "alerts" ? "" : " hidden"}" data-sarlaft-section="alerts"${dataSection === "alerts" ? "" : " hidden"}>
          <p class="payroll-result-meta muted"><strong>${filteredAlerts.length}</strong> registro${filteredAlerts.length === 1 ? "" : "s"}</p>
          <div class="payroll-table-shell">${alertsTable}</div>
          ${dataSection === "alerts" ? listPagination : ""}
        </div>
        <div class="payroll-data-pane${dataSection === "due" ? "" : " hidden"}" data-sarlaft-section="due"${dataSection === "due" ? "" : " hidden"}>
          <p class="payroll-result-meta muted"><strong>${filteredDue.length}</strong> vencimiento${filteredDue.length === 1 ? "" : "s"} · ventana 30 días</p>
          <div class="payroll-table-shell">${dueTable}</div>
          ${dataSection === "due" ? listPagination : ""}
        </div>
        <div class="payroll-data-pane${dataSection === "reviews" ? "" : " hidden"}" data-sarlaft-section="reviews"${dataSection === "reviews" ? "" : " hidden"}>
          <p class="payroll-result-meta muted"><strong>${filteredReviews.length}</strong> revisión${filteredReviews.length === 1 ? "" : "es"}</p>
          <div class="payroll-table-shell">${reviewsTable}</div>
          ${dataSection === "reviews" ? listPagination : ""}
        </div>
        ${reportsPane}
      </div>
    </section>
  </div>`;

  void docs;
  const studioClass = `sarlaft-studio sst-studio payroll-studio payroll-shell payroll-shell--workspace hr-flow-shell${workspace === "data" ? " payroll-module--clean payroll-studio--consult" : ""}`;
  return `<section class="${studioClass}" data-hr-workspace="${escapeAttr(workspace)}">${renderHrWorkspaceHeader(moduleHead, tabsNav, "payroll")}
    <div class="hr-workspace-panels">${operatePanel}${dataPanel}</div>
  </section>`;
}

function bindProfileSelect(form) {
  const select = form?.querySelector("[data-sarlaft-profile-select]");
  if (!select) return;
  select.addEventListener("change", () => {
    const opt = select.selectedOptions[0];
    if (!opt || !opt.value) return;
    const level = form.querySelector('[name="riskLevel"]');
    const dd = form.querySelector('[name="dueDiligenceLevel"]');
    const next = form.querySelector('[name="nextReviewDate"]');
    if (level && opt.dataset.level) level.value = opt.dataset.level;
    if (dd && opt.dataset.dd) dd.value = opt.dataset.dd;
    if (next && opt.dataset.days) {
      next.value = computeSarlaftNextReviewDate({ reviewFrequencyDays: opt.dataset.days }, colombiaTodayIsoDate());
    }
  });
}

function partyDetailHtml(party) {
  const docs = documentsLinkedToSarlaftParty(readCompanyDocs(), party);
  const evidence =
    docs.length === 0
      ? `<p class="muted">Sin evidencias vinculadas. Ábralas en Gestión documental (${escapeHtml(SARLAFT_COMPANY_FOLDER)}).</p>`
      : `<ul class="sarlaft-evidence-list">${docs
          .map(
            (d) =>
              `<li><span>${escapeHtml(formatCompanyDocumentDisplayName(d) || d.fileName || "Documento")}</span><span class="muted">${escapeHtml(d.folder || "")}</span></li>`
          )
          .join("")}</ul>`;
  const reviews = readReviews().filter((r) => r.thirdPartyId === party.id);
  const alerts = readAlerts().filter((a) => a.thirdPartyId === party.id);
  return `<div class="sarlaft-party-detail">
    <p><strong>${escapeHtml(party.name)}</strong>${party.pepFlag ? ' <span class="sarlaft-pep-flag">PEP</span>' : ""} · ${riskChip(party.riskLevel)} ${kycPill(party.kycStatus)}</p>
    <p class="muted">${escapeHtml(sarlaftCatalogLabel(SARLAFT_PARTY_TYPES, party.partyType))} · ${escapeHtml(party.documentType)} ${escapeHtml(party.documentNumber || "—")} · ${escapeHtml(sarlaftCatalogLabel(SARLAFT_PROGRAMS, party.program))}</p>
    <p>Debida diligencia: <strong>${escapeHtml(sarlaftCatalogLabel(SARLAFT_DUE_DILIGENCE_LEVELS, party.dueDiligenceLevel))}</strong> · Próxima revisión: <strong>${escapeHtml(party.nextReviewDate || "—")}</strong></p>
    <p>Responsable: ${escapeHtml(party.responsibleName || "—")}</p>
    ${party.notes ? `<p>${escapeHtml(party.notes)}</p>` : ""}
    <h4>Evidencias (${docs.length})</h4>
    ${evidence}
    <p class="sarlaft-link-docs"><button type="button" class="btn btn-sm btn-outline" data-action="sarlaft-open-dms" data-id="${escapeAttr(party.id)}">Abrir en Gestión documental</button></p>
    <p class="muted">Alertas: ${alerts.length} · Revisiones: ${reviews.length}</p>
  </div>`;
}

function openPartyView(party) {
  G.openEditModal?.({
    title: "Ficha del tercero",
    subtitle: `${party.code || ""} · SARLAFT / PTE`,
    submitText: "Cerrar",
    hideSubmit: false,
    fields: [{ type: "custom", html: partyDetailHtml(party) }],
    afterMount: (formEl) => {
      formEl.querySelector("[data-action='sarlaft-open-dms']")?.addEventListener("click", () => {
        G.closeModal?.();
        openSarlaftDocumentsInDms(party);
      });
    },
    onSubmit: async () => true
  });
}

function bindSarlaftPortalControls() {
  if (String(state.currentView || "") !== "sarlaft-pte" || !nodes.viewRoot) return;
  void ensureDefaultRiskProfiles();

  nodes.viewRoot.querySelectorAll("[data-action='sarlaft-operate-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizeSarlaftOperateSection(btn.dataset.section);
      if (normalizeSarlaftOperateSection(getUi().operateSection) === section) return;
      patchUi({ workspace: "operate", operateSection: section });
      persistHrWorkspace("sarlaft", "operate");
      if (
        switchModuleTabPanels({
          root: nodes.viewRoot,
          action: "sarlaft-operate-section",
          activeValue: section,
          panelAttr: "data-sarlaft-operate-pane",
          tabActiveClass: "is-active"
        })
      ) {
        nodes.viewRoot.querySelectorAll("[data-action='sarlaft-operate-section']").forEach((tab) => {
          const active = normalizeSarlaftOperateSection(tab.dataset.section) === section;
          tab.classList.toggle("is-active", active);
          tab.setAttribute("aria-selected", active ? "true" : "false");
        });
        return;
      }
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='sarlaft']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ws = normalizeHrWorkspace("sarlaft", btn.dataset.tab);
      if (!HR_VALID_SARLAFT_WS.has(ws)) return;
      if (normalizeHrWorkspace("sarlaft", getUi().workspace) === ws) return;
      patchUi({ workspace: ws, ...(ws === "operate" ? { listSearch: "" } : {}) });
      persistHrWorkspace("sarlaft", ws);
      if (switchHrWorkspacePanels({ root: nodes.viewRoot, moduleId: "sarlaft", workspace: ws })) return;
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='sarlaft-data-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizeSarlaftDataSection(btn.dataset.section);
      if (normalizeSarlaftDataSection(getUi().dataSection) === section) return;
      patchUi({ dataSection: section, workspace: "data", listPage: 1 });
      persistHrWorkspace("sarlaft", "data");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='sarlaft-list-page']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = Number(btn.dataset.page) || 1;
      if (Number(getUi().listPage) === page) return;
      patchUi({ listPage: page, workspace: "data" });
      G.renderPortalView?.();
    });
  });

  const search = nodes.viewRoot.querySelector("[data-action='sarlaft-data-list-search']");
  if (search) {
    const run = () => {
      patchUi({ listSearch: search.value, listPage: 1, workspace: "data" });
      persistHrWorkspace("sarlaft", "data");
      G.renderPortalView?.();
    };
    search.addEventListener("change", run);
    search.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        run();
      }
    });
  }

  const partyForm = document.getElementById("form-sarlaft-party");
  if (partyForm) {
    bindProfileSelect(partyForm);
    G.wireFormSubmitGuard?.(partyForm, async () => {
      if (!canMutateSarlaftParties()) return;
      const data = G.readFormEntriesNormalized?.(partyForm) || Object.fromEntries(new FormData(partyForm).entries());
      if (!String(data.name || "").trim() || !String(data.documentNumber || "").trim()) {
        G.failPortalField?.(partyForm, "name", "Indique nombre y documento del tercero.");
        return;
      }
      const profile = readProfiles().find((p) => String(p.id) === String(data.riskProfileId || ""));
      const record = stampCreatedRecord(
        normalizeSarlaftThirdPartyRow({
          id: newUuidV4(),
          code: nextSarlaftPartyCode(readParties()),
          ...data,
          pepFlag: String(data.pepFlag) === "true",
          responsibleName: findUserName(data.responsibleUserId),
          riskLevel: data.riskLevel || profile?.level || "medio",
          dueDiligenceLevel: data.dueDiligenceLevel || profile?.dueDiligenceLevel || "normal",
          nextReviewDate:
            data.nextReviewDate ||
            (profile ? computeSarlaftNextReviewDate(profile, colombiaTodayIsoDate()) : colombiaTodayIsoDate()),
          createdBy: actorLabel()
        })
      );
      await writeAwaitServerCreate(KEYS.sarlaftThirdParties, [...readParties(), record], record);
      auditSarlaft("create", record.id, record.name, `Alta de tercero ${record.code || ""} · ${record.kycStatus}`);
      G.notify?.("Tercero registrado.", "success");
      G.renderPortalView?.();
    });
  }

  const alertForm = document.getElementById("form-sarlaft-alert");
  if (alertForm) {
    G.wireFormSubmitGuard?.(alertForm, async () => {
      if (!canMutateSarlaftAlerts()) return;
      const data = G.readFormEntriesNormalized?.(alertForm) || Object.fromEntries(new FormData(alertForm).entries());
      const party = readParties().find((p) => String(p.id) === String(data.thirdPartyId || ""));
      if (!party) {
        G.failPortalField?.(alertForm, "thirdPartyId", "Seleccione el tercero.");
        return;
      }
      const record = stampCreatedRecord(
        normalizeSarlaftAlertRow({
          id: newUuidV4(),
          ...data,
          thirdPartyName: party.name,
          responsibleName: findUserName(data.responsibleUserId),
          createdBy: actorLabel()
        })
      );
      await writeAwaitServerCreate(KEYS.sarlaftAlerts, [...readAlerts(), record], record);
      auditSarlaft("create", record.id, record.title, `Alerta ${record.kind} · ${party.name}`);
      G.notify?.("Alerta registrada.", "success");
      G.renderPortalView?.();
    });
  }

  const reviewForm = document.getElementById("form-sarlaft-review");
  if (reviewForm) {
    G.wireFormSubmitGuard?.(reviewForm, async () => {
      if (!canMutateSarlaftReviews()) return;
      const data = G.readFormEntriesNormalized?.(reviewForm) || Object.fromEntries(new FormData(reviewForm).entries());
      const party = readParties().find((p) => String(p.id) === String(data.thirdPartyId || ""));
      if (!party) {
        G.failPortalField?.(reviewForm, "thirdPartyId", "Seleccione el tercero.");
        return;
      }
      const record = stampCreatedRecord(
        normalizeSarlaftReviewRow({
          id: newUuidV4(),
          ...data,
          thirdPartyName: party.name,
          responsibleName: findUserName(data.responsibleUserId),
          createdBy: actorLabel()
        })
      );
      await writeAwaitServerCreate(KEYS.sarlaftReviews, [...readReviews(), record], record);
      if (record.kind === "revision" && record.status === "cerrada" && canMutateSarlaftParties()) {
        const nextList = readParties().map((p) =>
          p.id === party.id
            ? stampUpdatedRecord({
                ...p,
                lastReviewDate: record.reviewedAt || colombiaTodayIsoDate(),
                nextReviewDate: computeSarlaftNextReviewDate(
                  readProfiles().find((x) => x.id === p.riskProfileId) || { reviewFrequencyDays: 180 },
                  record.reviewedAt || colombiaTodayIsoDate()
                )
              })
            : p
        );
        const updated = nextList.find((p) => p.id === party.id);
        if (updated) await writeAwaitServerEdit(KEYS.sarlaftThirdParties, nextList, updated.id);
      }
      auditSarlaft("create", record.id, party.name, `Revisión ${record.kind} · ${record.status}`);
      G.notify?.("Revisión registrada.", "success");
      G.renderPortalView?.();
    });
  }

  const profileForm = document.getElementById("form-sarlaft-profile");
  if (profileForm) {
    G.wireFormSubmitGuard?.(profileForm, async () => {
      if (!canMutateSarlaftProfiles()) return;
      const data = G.readFormEntriesNormalized?.(profileForm) || Object.fromEntries(new FormData(profileForm).entries());
      const record = stampCreatedRecord(
        normalizeSarlaftRiskProfileRow({
          id: newUuidV4(),
          ...data,
          active: true,
          createdBy: actorLabel()
        })
      );
      await writeAwaitServerCreate(KEYS.sarlaftRiskProfiles, [...readProfiles(), record], record);
      auditSarlaft("create", record.id, record.name, `Perfil ${record.code} · ${record.level}`);
      G.notify?.("Perfil de riesgo guardado.", "success");
      G.renderPortalView?.();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='view-sarlaft-party']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const party = readParties().find((p) => String(p.id) === String(btn.dataset.id || ""));
      if (party) openPartyView(party);
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='sarlaft-open-dms']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const party = readParties().find((p) => String(p.id) === String(btn.dataset.id || ""));
      if (party) openSarlaftDocumentsInDms(party);
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-sarlaft-party']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!canMutateSarlaftParties()) return;
      const target = readParties().find((p) => String(p.id) === String(btn.dataset.id || ""));
      if (!target) return;
      G.openEditModal?.({
        title: "Editar tercero",
        subtitle: target.name,
        submitText: "Guardar",
        fields: [
          { name: "name", label: "Nombre / razón social", value: target.name, required: true },
          {
            name: "partyType",
            label: "Vínculo",
            type: "select",
            value: target.partyType,
            options: SARLAFT_PARTY_TYPES.map((x) => ({ value: x.value, label: x.label }))
          },
          {
            name: "kycStatus",
            label: "Estado de conocimiento",
            type: "select",
            value: target.kycStatus,
            options: SARLAFT_KYC_STATUSES.map((x) => ({ value: x.value, label: x.label }))
          },
          {
            name: "riskLevel",
            label: "Nivel de riesgo",
            type: "select",
            value: target.riskLevel,
            options: SARLAFT_RISK_LEVELS.map((x) => ({ value: x.value, label: x.label }))
          },
          {
            name: "dueDiligenceLevel",
            label: "Debida diligencia",
            type: "select",
            value: target.dueDiligenceLevel,
            options: SARLAFT_DUE_DILIGENCE_LEVELS.map((x) => ({ value: x.value, label: x.label }))
          },
          { name: "nextReviewDate", label: "Próxima revisión", type: "date", value: target.nextReviewDate },
          { name: "notes", label: "Observaciones", type: "textarea", value: target.notes, rows: 3 }
        ],
        onSubmit: async (form) => {
          const next = readParties().map((p) =>
            p.id === target.id
              ? stampUpdatedRecord(
                  normalizeSarlaftThirdPartyRow({
                    ...p,
                    ...form,
                    updatedBy: actorLabel()
                  })
                )
              : p
          );
          await writeAwaitServerEdit(KEYS.sarlaftThirdParties, next, target.id);
          auditSarlaft("update", target.id, target.name, `Actualización KYC ${form.kycStatus || target.kycStatus}`);
          G.notify?.("Tercero actualizado.", "success");
          G.renderPortalView?.();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-sarlaft-alert']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!canMutateSarlaftAlerts()) return;
      const target = readAlerts().find((a) => String(a.id) === String(btn.dataset.id || ""));
      if (!target) return;
      G.openEditModal?.({
        title: "Gestionar alerta",
        subtitle: target.title,
        submitText: "Guardar",
        fields: [
          {
            name: "status",
            label: "Estado",
            type: "select",
            value: target.status,
            options: SARLAFT_ALERT_STATUSES.map((x) => ({ value: x.value, label: x.label }))
          },
          {
            name: "severity",
            label: "Severidad",
            type: "select",
            value: target.severity,
            options: SARLAFT_ALERT_SEVERITIES.map((x) => ({ value: x.value, label: x.label }))
          },
          { name: "dueDate", label: "Fecha límite", type: "date", value: target.dueDate },
          { name: "description", label: "Descripción / gestión", type: "textarea", value: target.description, rows: 3 }
        ],
        onSubmit: async (form) => {
          const closed = form.status === "cerrada" || form.status === "desestimada";
          const next = readAlerts().map((a) =>
            a.id === target.id
              ? stampUpdatedRecord(
                  normalizeSarlaftAlertRow({
                    ...a,
                    ...form,
                    closedAt: closed ? new Date().toISOString() : a.closedAt,
                    closedBy: closed ? actorLabel() : a.closedBy,
                    updatedBy: actorLabel()
                  })
                )
              : a
          );
          await writeAwaitServerEdit(KEYS.sarlaftAlerts, next, target.id);
          auditSarlaft("update", target.id, target.title, `Estado ${form.status}`);
          G.notify?.("Alerta actualizada.", "success");
          G.renderPortalView?.();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='view-sarlaft-alert']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = readAlerts().find((a) => String(a.id) === String(btn.dataset.id || ""));
      if (!target) return;
      G.openEditModal?.({
        title: sarlaftCatalogLabel(SARLAFT_ALERT_KINDS, target.kind),
        subtitle: target.title,
        submitText: "Cerrar",
        fields: [
          {
            type: "custom",
            html: `<p>${alertStatusPill(target.status)} ${escapeHtml(sarlaftCatalogLabel(SARLAFT_ALERT_SEVERITIES, target.severity))}</p>
              <p class="muted">${escapeHtml(target.thirdPartyName || "—")} · límite ${escapeHtml(target.dueDate || "—")}</p>
              <p>${escapeHtml(target.description || "Sin descripción.")}</p>
              <p class="muted">Registró ${escapeHtml(target.createdBy || "—")} · ${escapeHtml(String(target.createdAt || "").slice(0, 16))}</p>`
          }
        ],
        onSubmit: async () => true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-sarlaft-review']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!canMutateSarlaftReviews()) return;
      const target = readReviews().find((r) => String(r.id) === String(btn.dataset.id || ""));
      if (!target) return;
      G.openEditModal?.({
        title: "Editar revisión",
        submitText: "Guardar",
        fields: [
          {
            name: "status",
            label: "Estado",
            type: "select",
            value: target.status,
            options: SARLAFT_REVIEW_STATUSES.map((x) => ({ value: x.value, label: x.label }))
          },
          { name: "reviewedAt", label: "Fecha", type: "date", value: target.reviewedAt },
          { name: "observations", label: "Observaciones", type: "textarea", value: target.observations, rows: 3 }
        ],
        onSubmit: async (form) => {
          const next = readReviews().map((r) =>
            r.id === target.id
              ? stampUpdatedRecord(normalizeSarlaftReviewRow({ ...r, ...form, updatedBy: actorLabel() }))
              : r
          );
          await writeAwaitServerEdit(KEYS.sarlaftReviews, next, target.id);
          auditSarlaft("update", target.id, target.thirdPartyName, `Revisión ${form.status}`);
          G.notify?.("Revisión actualizada.", "success");
          G.renderPortalView?.();
          return true;
        }
      });
    });
  });

  const removeRow = async (key, id, listFn) => {
    if (!canDeleteSarlaftRecords()) return;
    const ok = await G.removeFromPortalListAwaitServer?.(key, id);
    if (ok === false) return;
    if (ok == null) {
      const next = listFn().filter((row) => String(row.id) !== String(id));
      await writeAwaitServer(key, next);
    }
    G.renderPortalView?.();
  };

  nodes.viewRoot.querySelectorAll("[data-action='delete-sarlaft-party']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = readParties().find((p) => String(p.id) === String(btn.dataset.id || ""));
      if (!target) return;
      const confirmed = await G.confirmPortalAction?.(`¿Eliminar al tercero ${target.name}?`, { danger: true });
      if (confirmed === false) return;
      await removeRow(KEYS.sarlaftThirdParties, target.id, readParties);
      auditSarlaft("delete", target.id, target.name, "Eliminación de tercero");
    });
  });
  nodes.viewRoot.querySelectorAll("[data-action='delete-sarlaft-alert']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = readAlerts().find((a) => String(a.id) === String(btn.dataset.id || ""));
      if (!target) return;
      await removeRow(KEYS.sarlaftAlerts, target.id, readAlerts);
      auditSarlaft("delete", target.id, target.title, "Eliminación de alerta");
    });
  });
  nodes.viewRoot.querySelectorAll("[data-action='delete-sarlaft-review']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = readReviews().find((r) => String(r.id) === String(btn.dataset.id || ""));
      if (!target) return;
      await removeRow(KEYS.sarlaftReviews, target.id, readReviews);
      auditSarlaft("delete", target.id, target.thirdPartyName, "Eliminación de revisión");
    });
  });

  const exportParties = () => {
    downloadCsv(
      `sarlaft_terceros_${colombiaTodayIsoDate()}.csv`,
      buildSarlaftPartyExportRows(readParties(), readProfiles()),
      SARLAFT_PARTY_EXPORT_COLUMNS
    );
  };
  const exportAlerts = () => {
    downloadCsv(
      `sarlaft_alertas_${colombiaTodayIsoDate()}.csv`,
      buildSarlaftAlertExportRows(readAlerts()),
      SARLAFT_ALERT_EXPORT_COLUMNS
    );
  };
  nodes.viewRoot.querySelectorAll("[data-action='export-sarlaft-parties']").forEach((btn) => {
    btn.addEventListener("click", exportParties);
  });
  nodes.viewRoot.querySelectorAll("[data-action='export-sarlaft-alerts']").forEach((btn) => {
    btn.addEventListener("click", exportAlerts);
  });
  nodes.viewRoot.querySelectorAll("[data-action='export-sarlaft-current']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizeSarlaftDataSection(getUi().dataSection);
      if (section === "alerts") exportAlerts();
      else exportParties();
    });
  });

  nodes.viewRoot.querySelectorAll(".sst-row-more").forEach((details) => {
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      nodes.viewRoot.querySelectorAll(".sst-row-more[open]").forEach((other) => {
        if (other !== details) other.removeAttribute("open");
      });
    });
  });
}

if (typeof window.registerLegacyPortalViews === "function") {
  window.registerLegacyPortalViews({ sarlaftPteHtml });
}

if (typeof window !== "undefined") {
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["sarlaft-pte"] = bindSarlaftPortalControls;
}

export { sarlaftPteHtml, bindSarlaftPortalControls };
