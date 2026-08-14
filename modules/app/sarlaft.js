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
  normalizeSarlaftProgramFilter,
  colombiaTodayIsoDate,
  stampCreatedRecord,
  stampUpdatedRecord,
  newUuidV4
} from "../core/utils.js";
import {
  canAccessSarlaftView,
  canAccessDocumentsView,
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
import { validateUploadFile, SAFE_DOCUMENT_ACCEPT } from "../core/file-upload-security.js";
import {
  SARLAFT_COMPANY_FOLDER,
  SARLAFT_DOCUMENT_PROCESS,
  SARLAFT_PROGRAMS,
  SARLAFT_PROGRAM_COPY,
  sarlaftProgramCopy,
  sarlaftCatalogForProgram,
  filterSarlaftByProgram,
  matchesSarlaftProgram,
  serializeSarlaftCompliance,
  inferSarlaftProgramFromKind,
  sarlaftReviewAdvancesSchedule,
  normalizeSarlaftProgram,
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
  COMPANY_DOCUMENT_MAX_BYTES,
  normalizeCompanyFolder,
  normalizeCompanyDocumentRow,
  normalizeCompanyFolderRow,
  formatCompanyDocumentDisplayName,
  getCompanyDocumentCategoryLabel,
  fileTypeLabel,
  formatFileSize,
  findCompanyDocumentCategory,
  listCompanyDocumentCategories,
  serializeCompanyDocumentTags,
  folderKey
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

function readFolders() {
  return read(KEYS.companyDocumentFolders, []).map(normalizeCompanyFolderRow).filter((f) => f && f.id);
}

function getUi() {
  if (!state.sarlaftUi || typeof state.sarlaftUi !== "object") {
    state.sarlaftUi = {
      workspace: "operate",
      operateSection: "party",
      dataSection: "parties",
      programFilter: "ambos",
      listSearch: "",
      listPage: 1,
      pageSize: PAGE_SIZE,
      selectedPartyId: ""
    };
  }
  state.sarlaftUi.programFilter = normalizeSarlaftProgramFilter(state.sarlaftUi.programFilter);
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

function partyOptionsHtml(selectedId = "", program = "ambos") {
  return filterSarlaftByProgram(readParties(), program)
    .map((p) => {
      const id = String(p.id);
      return `<option value="${escapeAttr(id)}"${id === String(selectedId) ? " selected" : ""}>${escapeHtml(p.name)} · ${escapeHtml(p.documentNumber || p.code || "")}</option>`;
    })
    .join("");
}

function sarlaftEvidenceFolder(partyName) {
  const leaf = String(partyName || "")
    .replace(/[\\/]+/g, " ")
    .trim()
    .slice(0, 120);
  return normalizeCompanyFolder(leaf ? `${SARLAFT_COMPANY_FOLDER} / ${leaf}` : SARLAFT_COMPANY_FOLDER);
}

async function ensureSarlaftEvidenceFolder(partyName) {
  const path = sarlaftEvidenceFolder(partyName);
  const by = actorLabel();
  const has = (p) => readFolders().some((f) => folderKey(f.folderName) === folderKey(p));
  const createFolder = async (folderName, description) => {
    if (readFolders().some((f) => folderKey(f.folderName) === folderKey(folderName))) return;
    const record = normalizeCompanyFolderRow({
      id: newUuidV4(),
      folderName,
      description,
      createdBy: by,
      createdAt: new Date().toISOString()
    });
    try {
      await writeAwaitServerCreate(KEYS.companyDocumentFolders, [...readFolders(), record], record);
    } catch (_err) {
      /* El archivo igual queda en la ruta; la carpeta puede crearla Gestión documental. */
    }
  };
  if (!has(SARLAFT_COMPANY_FOLDER)) {
    await createFolder(SARLAFT_COMPANY_FOLDER, "Evidencias SARLAFT / PTE");
  }
  if (path !== SARLAFT_COMPANY_FOLDER && !has(path)) {
    await createFolder(path, `Expediente de ${String(partyName || "").trim() || "tercero"}`);
  }
  return path;
}

function sarlaftEvidenceCategoryOptionsHtml(selected = "form_conocimiento_tercero", program = "ambos") {
  const cats = evidenceCatsForProgram(program);
  const sel = cats.some((c) => c.value === selected) ? selected : cats[0]?.value || "otro";
  return cats
    .map(
      (c) =>
        `<option value="${escapeAttr(c.value)}"${c.value === sel ? " selected" : ""}>${escapeHtml(c.label)}</option>`
    )
    .join("");
}

function evidenceAttachHtml(fieldLabel, IC, { defaultCategory = "form_conocimiento_tercero", hint, program = "ambos" } = {}) {
  return `<fieldset class="form-section form-section-amber full">
    <legend>${IC.upload || IC.file || ""} Anexar evidencias</legend>
    <p class="muted form-section-hint">${escapeHtml(
      hint ||
        `Opcional. Quedan en Gestión documental (${SARLAFT_COMPANY_FOLDER}), vinculados a este registro.`
    )}</p>
    <div class="form-section-grid">
      <label>${fieldLabel(IC.file, "Tipo documental")}
        <select name="evidenceCategory">${sarlaftEvidenceCategoryOptionsHtml(defaultCategory, program)}</select>
      </label>
      <label>${fieldLabel(IC.calendar, "Vencimiento (si aplica)")}
        <input type="date" name="evidenceExpiresAt" />
      </label>
      <label class="full sarlaft-evidence-file">
        ${fieldLabel(IC.upload || IC.file, "Archivos")}
        <input type="file" name="evidenceFiles" data-sarlaft-evidence-input multiple accept="${SAFE_DOCUMENT_ACCEPT}" />
        <span class="muted sarlaft-evidence-file__hint">PDF, Office, imagen o ZIP · varios archivos · máx. ${escapeHtml(formatFileSize(COMPANY_DOCUMENT_MAX_BYTES))} c/u</span>
        <ul class="sarlaft-evidence-file__list" data-sarlaft-evidence-list></ul>
      </label>
    </div>
  </fieldset>`;
}

function bindSarlaftEvidencePicker(form) {
  const input = form?.querySelector("[data-sarlaft-evidence-input]");
  const list = form?.querySelector("[data-sarlaft-evidence-list]");
  if (!input || !list) return;
  const render = () => {
    list.innerHTML = [...(input.files || [])]
      .map((f) => `<li><span>${escapeHtml(f.name)}</span><small>${escapeHtml(formatFileSize(f.size))}</small></li>`)
      .join("");
  };
  input.addEventListener("change", render);
}

async function uploadSarlaftEvidenceFile(file, folder) {
  const api = window.AntaresApi;
  if (!api?.postFormData) throw new Error("API no disponible para anexar archivos.");
  const check = await validateUploadFile(file, "document");
  if (!check.ok) throw new Error(check.message || "Archivo no permitido.");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await api.postFormData("/uploads/company-document", fd);
  if (!res?.key) throw new Error("No se obtuvo la clave de almacenamiento.");
  return res;
}

async function attachSarlaftEvidenceFiles({ formEl, party, relatedLabel = "" }) {
  const input = formEl?.querySelector("[data-sarlaft-evidence-input]");
  const files = input?.files ? [...input.files] : [];
  if (!files.length || !party?.id) return [];
  const category =
    String(formEl.querySelector("[name='evidenceCategory']")?.value || "form_conocimiento_tercero").trim() || "otro";
  const expiresAt = String(formEl.querySelector("[name='evidenceExpiresAt']")?.value || "").trim();
  const catMeta = findCompanyDocumentCategory(category);
  const folder = await ensureSarlaftEvidenceFolder(party.name);
  const by = actorLabel();
  const ids = [];
  for (const file of files) {
    if (file.size > COMPANY_DOCUMENT_MAX_BYTES) {
      G.notify?.(`"${file.name}" supera el tamaño máximo (${formatFileSize(COMPANY_DOCUMENT_MAX_BYTES)}).`, "error");
      continue;
    }
    try {
      const uploaded = await uploadSarlaftEvidenceFile(file, folder);
      const nowIso = new Date().toISOString();
      const recordId = newUuidV4();
      const record = normalizeCompanyDocumentRow({
        id: recordId,
        fileName: uploaded.fileName || file.name,
        type: fileTypeLabel(uploaded.fileName || file.name, uploaded.mimeType || file.type),
        documentCategory: category,
        folder: normalizeCompanyFolder(uploaded.folder || folder),
        mimeType: uploaded.mimeType || file.type || "application/octet-stream",
        sizeBytes: Number(uploaded.sizeBytes) || file.size || 0,
        storageKey: uploaded.key,
        description: relatedLabel,
        uploadedBy: by,
        createdAt: nowIso,
        updatedAt: nowIso,
        entityType: "tercero",
        entityId: party.id,
        entityLabel: party.name,
        process: SARLAFT_DOCUMENT_PROCESS,
        area: catMeta?.area || "kyc",
        expiresAt,
        version: 1,
        versionGroup: recordId,
        isCurrentVersion: true
      });
      record.tags = serializeCompanyDocumentTags(record);
      await writeAwaitServerCreate(KEYS.companyDocuments, [...readCompanyDocs(), record], record);
      ids.push(record.id);
    } catch (err) {
      G.notify?.(`No se pudo anexar "${file.name}": ${String(err?.message || err)}`, "error");
    }
  }
  return ids;
}

async function downloadSarlaftDocument(doc) {
  const api = window.AntaresApi;
  if (!api?.postJson) throw new Error("API no disponible.");
  if (!doc?.storageKey) throw new Error("El documento no tiene archivo en almacenamiento.");
  const res = await api.postJson("/uploads/company-document/download", {
    storageKey: doc.storageKey,
    disposition: "attachment",
    fileName: doc.fileName || "documento"
  });
  const url = String(res?.downloadUrl || "").trim();
  if (!url) throw new Error("No se obtuvo el enlace de descarga.");
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.fileName || "documento";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function previewSarlaftDocument(doc) {
  if (typeof window.openCompanyDocumentPreview === "function") {
    await window.openCompanyDocumentPreview(doc);
    return;
  }
  const api = window.AntaresApi;
  if (!api?.postJson) throw new Error("API no disponible.");
  if (!doc?.storageKey) throw new Error("El documento no tiene archivo en almacenamiento.");
  const res = await api.postJson("/uploads/company-document/download", {
    storageKey: doc.storageKey,
    disposition: "inline",
    fileName: doc.fileName || "documento"
  });
  const url = String(res?.downloadUrl || "").trim();
  if (!url) throw new Error("No se obtuvo el enlace de vista previa.");
  window.open(url, "_blank", "noopener");
}

async function mergePartyDocumentIds(partyId, attachedIds) {
  if (!partyId || !attachedIds?.length) return;
  const next = readParties().map((p) =>
    p.id === partyId
      ? stampUpdatedRecord({
          ...p,
          documentIds: [...new Set([...(p.documentIds || []), ...attachedIds].map(String))]
        })
      : p
  );
  await writeAwaitServerEdit(KEYS.sarlaftThirdParties, next, partyId);
}

function profileOptionsHtml(selectedId = "", program = "ambos") {
  return readProfiles()
    .filter((p) => p.active && matchesSarlaftProgram(p.program, program))
    .map((p) => {
      const id = String(p.id);
      return `<option value="${escapeAttr(id)}" data-level="${escapeAttr(p.level)}" data-dd="${escapeAttr(p.dueDiligenceLevel)}" data-days="${escapeAttr(String(p.reviewFrequencyDays))}"${id === String(selectedId) ? " selected" : ""}>${escapeHtml(p.name)} · ${escapeHtml(sarlaftCatalogLabel(SARLAFT_RISK_LEVELS, p.level))}</option>`;
    })
    .join("");
}

function programChip(program) {
  const value = normalizeSarlaftProgram(program, "ambos");
  const label = sarlaftCatalogLabel(SARLAFT_PROGRAMS, value);
  return `<span class="sarlaft-program-chip sarlaft-program-chip--${escapeAttr(value)}">${escapeHtml(label)}</span>`;
}

function programSwitcherHtml(active) {
  const current = normalizeSarlaftProgramFilter(active);
  return `<div class="sarlaft-program-switch" role="group" aria-label="Programa de cumplimiento">
    ${SARLAFT_PROGRAMS.map((p) => {
      const copy = SARLAFT_PROGRAM_COPY[p.value] || SARLAFT_PROGRAM_COPY.ambos;
      const on = current === p.value;
      return `<button type="button" class="sarlaft-program-switch__btn sarlaft-program-switch__btn--${escapeAttr(p.value)}${on ? " is-active" : ""}" data-action="sarlaft-program" data-program="${escapeAttr(p.value)}" aria-pressed="${on ? "true" : "false"}">
        <strong>${escapeHtml(p.label)}</strong>
        <small>${escapeHtml(copy.kicker)}</small>
      </button>`;
    }).join("")}
  </div>`;
}

function flagCheck(label, on) {
  return `<li class="sarlaft-check ${on ? "is-on" : "is-off"}"><span aria-hidden="true">${on ? "✓" : "○"}</span> ${escapeHtml(label)}</li>`;
}

function yesNoOptions(selected, { trueLabel = "Sí", falseLabel = "No" } = {}) {
  const on = selected === true || selected === "true";
  return `<option value="false"${on ? "" : " selected"}>${escapeHtml(falseLabel)}</option><option value="true"${on ? " selected" : ""}>${escapeHtml(trueLabel)}</option>`;
}

function evidenceCatsForProgram(program) {
  const cats = listCompanyDocumentCategories().filter((c) => c.process === "sarlaft" || c.value === "otro");
  const f = normalizeSarlaftProgram(program, "ambos");
  if (f === "sarlaft") return cats.filter((c) => c.value === "otro" || c.area === "kyc" || !c.area);
  if (f === "pte") return cats.filter((c) => c.value === "otro" || c.area === "pte");
  return cats;
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
  if (!canAccessDocumentsView(currentUser())) {
    G.notify?.("Puede ver o descargar las evidencias desde la ficha, sin salir de SARLAFT / PTE.", "info");
    return;
  }
  if (!state.companyDocsUi || typeof state.companyDocsUi !== "object") {
    state.companyDocsUi = {};
  }
  state.companyDocsUi.folderFilter = sarlaftEvidenceFolder(party?.name);
  state.companyDocsUi.search = "";
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

function renderOperateNav(activeId, caps = {}, copy = sarlaftProgramCopy("ambos")) {
  const tabs = [
    { id: "party", ...copy.operateParty, icon: "user", allowed: Boolean(caps.canParties) },
    { id: "alert", ...copy.operateAlert, icon: "alert", allowed: Boolean(caps.canAlerts) },
    { id: "review", ...copy.operateReview, icon: "file", allowed: Boolean(caps.canReviews) },
    { id: "profile", ...copy.operateProfile, icon: "shield", allowed: Boolean(caps.canProfiles) }
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

function renderDataNav(activeId, counts, copy = sarlaftProgramCopy("ambos")) {
  const active = normalizeSarlaftDataSection(activeId);
  const tabs = [
    { id: "parties", label: copy.consultParties, count: counts.parties },
    { id: "alerts", label: copy.consultAlerts, count: counts.alerts },
    { id: "due", label: copy.consultDue, count: counts.due },
    { id: "reviews", label: copy.consultReviews, count: counts.reviews },
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

function partyFormHtml(fieldLabel, IC, canMutate, program = "ambos") {
  if (!canMutate) return G.emptyState("No tiene permiso para registrar terceros.");
  const today = colombiaTodayIsoDate();
  const copy = sarlaftProgramCopy(program);
  const programValue = normalizeSarlaftProgram(program, "ambos");
  return `<form id="form-sarlaft-party" class="p-form p-form-colored hr-form-flow antares-create-form" autocomplete="off" novalidate data-sarlaft-program="${escapeAttr(programValue)}">
    <div class="antares-create-form__sections">
      <fieldset class="form-section form-section-blue full">
        <legend>${IC.user || ""} Identificación ${programValue === "pte" ? "de la contraparte" : "del tercero"}</legend>
        <p class="muted form-section-hint">${escapeHtml(copy.partyHint)}</p>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.shield, "Programa", { required: true })}
            <select name="program" required data-sarlaft-program-select>${sarlaftCatalogOptionsHtml(SARLAFT_PROGRAMS, programValue)}</select>
          </label>
          <label>${fieldLabel(IC.briefcase, "Tipo de vínculo", { required: true })}
            <select name="partyType" required><option value="">Seleccione...</option>${sarlaftCatalogOptionsHtml(SARLAFT_PARTY_TYPES)}</select>
          </label>
          <label>${fieldLabel(IC.user, "Tipo de persona", { required: true })}
            <select name="kind" required data-sarlaft-kind-select>${sarlaftCatalogOptionsHtml(SARLAFT_PERSON_KINDS)}</select>
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
        <legend>${IC.shield || ""} Riesgo y debida diligencia</legend>
        <p class="muted form-section-hint">La matriz define nivel, debida diligencia y próxima revisión.</p>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.activity, "Perfil de riesgo")}
            <select name="riskProfileId" data-sarlaft-profile-select><option value="">Seleccione...</option>${profileOptionsHtml("", programValue)}</select>
          </label>
          <label>${fieldLabel(IC.activity, "Nivel de riesgo", { required: true })}
            <select name="riskLevel" required>${sarlaftCatalogOptionsHtml(SARLAFT_RISK_LEVELS, "medio")}</select>
          </label>
          <label>${fieldLabel(IC.file, copy.ddLabel, { required: true })}
            <select name="dueDiligenceLevel" required>${sarlaftCatalogOptionsHtml(SARLAFT_DUE_DILIGENCE_LEVELS, "normal")}</select>
          </label>
          <label>${fieldLabel(IC.check, copy.kycLabel, { required: true })}
            <select name="kycStatus" required>${sarlaftCatalogOptionsHtml(SARLAFT_KYC_STATUSES, "pendiente")}</select>
          </label>
          <label>${fieldLabel(IC.calendar, "Próxima revisión")}
            <input type="date" name="nextReviewDate" value="${escapeAttr(today)}" />
          </label>
          <label>${fieldLabel(IC.user, "Responsable")}
            <select name="responsibleUserId"><option value="">Sin asignar</option>${userOptionsHtml()}</select>
          </label>
        </div>
      </fieldset>
      <fieldset class="form-section form-section-blue full" data-program-panel="sarlaft"${programValue === "pte" ? " hidden" : ""}>
        <legend>${IC.shield || ""} SARLAFT · conocimiento LA/FT</legend>
        <p class="muted form-section-hint">Consulta de listas, PEP, origen de fondos y beneficiario final.</p>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.check, "Consulta listas restrictivas")}
            <select name="listsChecked">${yesNoOptions(false)}</select>
          </label>
          <label>${fieldLabel(IC.check, "Declaración de origen de fondos")}
            <select name="fundsDeclared">${yesNoOptions(false)}</select>
          </label>
          <label>
            <span class="field-label">¿Es PEP?</span>
            <select name="pepFlag" data-sarlaft-pep-select>${yesNoOptions(false)}</select>
          </label>
          <label class="full" data-pep-details-wrap hidden>${fieldLabel(IC.file, "Detalle PEP")}
            <textarea name="pepDetails" rows="2" placeholder="Cargo, vínculo, país y fecha de la condición PEP"></textarea>
          </label>
          <label class="full" data-beneficial-wrap hidden>${fieldLabel(IC.user, "Beneficiario final")}
            <input name="beneficialOwner" maxlength="255" placeholder="Nombre y documento del beneficiario final" />
          </label>
        </div>
      </fieldset>
      <fieldset class="form-section form-section-emerald full" data-program-panel="pte"${programValue === "sarlaft" ? " hidden" : ""}>
        <legend>${IC.check || ""} PTE · transparencia y ética</legend>
        <p class="muted form-section-hint">Código de ética, conflictos de interés y transparencia empresarial.</p>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.check, "Aceptó código de ética")}
            <select name="ethicsAccepted">${yesNoOptions(false)}</select>
          </label>
          <label>${fieldLabel(IC.check, "Declaró conflicto de intereses")}
            <select name="conflictDeclared">${yesNoOptions(false)}</select>
          </label>
        </div>
      </fieldset>
      <fieldset class="form-section form-section-slate full">
        <legend>${IC.file || ""} Observaciones</legend>
        <div class="form-section-grid">
          <label class="full">${fieldLabel(IC.file, "Notas de cumplimiento")}
            <textarea name="notes" rows="3" placeholder="Hallazgos, pendientes o decisión de vinculación"></textarea>
          </label>
        </div>
      </fieldset>
      ${evidenceAttachHtml(fieldLabel, IC, {
        defaultCategory: copy.evidenceDefault,
        hint: copy.evidenceHint,
        program: programValue
      })}
    </div>
    <footer class="antares-create-form__footer">
      ${G.renderManagedCreateFormActions("create-sarlaft-party", `<button class="btn btn-primary antares-create-form__submit" type="submit">${IC.plus || ""} ${escapeHtml(copy.partyTitle)}</button>`)}
    </footer>
  </form>`;
}
function alertFormHtml(fieldLabel, IC, canMutate, program = "ambos") {
  if (!canMutate) return G.emptyState("No tiene permiso para registrar alertas.");
  const copy = sarlaftProgramCopy(program);
  const programValue = normalizeSarlaftProgram(program, "ambos");
  const kinds = sarlaftCatalogForProgram(SARLAFT_ALERT_KINDS, programValue);
  const defaultKind = kinds[0]?.value || "alerta";
  const sourcePh =
    programValue === "pte"
      ? "Canal ético, auditoría, declaración..."
      : programValue === "sarlaft"
        ? "Listas, monitoreo, operación inusual..."
        : "Listas, denuncia, auditoría...";
  return `<form id="form-sarlaft-alert" class="p-form p-form-colored hr-form-flow antares-create-form" autocomplete="off" novalidate data-sarlaft-program="${escapeAttr(programValue)}">
    <div class="antares-create-form__sections">
      <fieldset class="form-section form-section-blue full">
        <legend>${IC.alert || ""} ${escapeHtml(copy.alertTitle.replace(/^Registrar /i, ""))}</legend>
        <p class="muted form-section-hint">${escapeHtml(copy.alertHint)}</p>
        <div class="form-section-grid">
          <label class="full">${fieldLabel(IC.user, programValue === "pte" ? "Contraparte relacionada" : "Tercero relacionado", { required: true })}
            <select name="thirdPartyId" required><option value="">Seleccione...</option>${partyOptionsHtml("", programValue)}</select>
          </label>
          <label>${fieldLabel(IC.file, "Tipo", { required: true })}
            <select name="kind" required data-sarlaft-alert-kind>${sarlaftCatalogOptionsHtml(kinds, defaultKind)}</select>
          </label>
          <label>${fieldLabel(IC.shield, "Programa")}<select name="program">${sarlaftCatalogOptionsHtml(SARLAFT_PROGRAMS, programValue)}</select></label>
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
          <label>${fieldLabel(IC.hash, "Origen")}<input name="source" maxlength="120" placeholder="${escapeAttr(sourcePh)}" /></label>
        </div>
      </fieldset>
      ${evidenceAttachHtml(fieldLabel, IC, {
        defaultCategory: copy.evidenceDefault,
        hint: copy.evidenceHint,
        program: programValue
      })}
    </div>
    <footer class="antares-create-form__footer">
      ${G.renderManagedCreateFormActions("create-sarlaft-alert", `<button class="btn btn-primary antares-create-form__submit" type="submit">${IC.plus || ""} ${escapeHtml(copy.alertTitle)}</button>`)}
    </footer>
  </form>`;
}

function reviewFormHtml(fieldLabel, IC, canMutate, program = "ambos") {
  if (!canMutate) return G.emptyState("No tiene permiso para registrar revisiones.");
  const copy = sarlaftProgramCopy(program);
  const programValue = normalizeSarlaftProgram(program, "ambos");
  const kinds = sarlaftCatalogForProgram(SARLAFT_REVIEW_KINDS, programValue);
  const defaultKind = kinds[0]?.value || "revision";
  return `<form id="form-sarlaft-review" class="p-form p-form-colored hr-form-flow antares-create-form" autocomplete="off" novalidate data-sarlaft-program="${escapeAttr(programValue)}">
    <div class="antares-create-form__sections">
      <fieldset class="form-section form-section-emerald full">
        <legend>${IC.file || ""} ${escapeHtml(copy.reviewTitle.replace(/^Registrar /i, ""))}</legend>
        <p class="muted form-section-hint">${escapeHtml(copy.reviewHint)}</p>
        <div class="form-section-grid">
          <label class="full">${fieldLabel(IC.user, programValue === "pte" ? "Contraparte" : "Tercero", { required: true })}
            <select name="thirdPartyId" required><option value="">Seleccione...</option>${partyOptionsHtml("", programValue)}</select>
          </label>
          <label>${fieldLabel(IC.file, "Tipo", { required: true })}
            <select name="kind" required>${sarlaftCatalogOptionsHtml(kinds, defaultKind)}</select>
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
      ${evidenceAttachHtml(fieldLabel, IC, {
        defaultCategory: copy.evidenceDefault,
        hint: copy.evidenceHint,
        program: programValue
      })}
    </div>
    <footer class="antares-create-form__footer">
      ${G.renderManagedCreateFormActions("create-sarlaft-review", `<button class="btn btn-primary antares-create-form__submit" type="submit">${IC.plus || ""} ${escapeHtml(copy.reviewTitle)}</button>`)}
    </footer>
  </form>`;
}

function profileFormHtml(fieldLabel, IC, canMutate, program = "ambos") {
  if (!canMutate) return G.emptyState("No tiene permiso para parametrizar perfiles de riesgo.");
  const copy = sarlaftProgramCopy(program);
  const programValue = normalizeSarlaftProgram(program, "ambos");
  const criteriaPh =
    programValue === "pte"
      ? "Factores PTE: conflicto de intereses, exposición a corrupción, canal ético, cargo sensible..."
      : programValue === "sarlaft"
        ? "Factores SARLAFT: tipo de tercero, zona, PEP, listas, actividad, montos..."
        : "Factores de la matriz: tipo de tercero, zona, PEP, actividad, montos, conflictos...";
  return `<form id="form-sarlaft-profile" class="p-form p-form-colored hr-form-flow antares-create-form" autocomplete="off" novalidate>
    <div class="antares-create-form__sections">
      <fieldset class="form-section form-section-violet full">
        <legend>${IC.shield || ""} ${escapeHtml(copy.profileTitle.replace(/^Parametrizar /i, ""))}</legend>
        <p class="muted form-section-hint">${escapeHtml(copy.profileHint)}</p>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.hash, "Código", { required: true })}<input name="code" required maxlength="32" placeholder="Ej. ALTO" /></label>
          <label>${fieldLabel(IC.file, "Nombre", { required: true })}<input name="name" required maxlength="120" placeholder="Ej. Riesgo alto" /></label>
          <label>${fieldLabel(IC.shield, "Programa")}<select name="program">${sarlaftCatalogOptionsHtml(SARLAFT_PROGRAMS, programValue)}</select></label>
          <label>${fieldLabel(IC.activity, "Nivel", { required: true })}
            <select name="level" required>${sarlaftCatalogOptionsHtml(SARLAFT_RISK_LEVELS, "medio")}</select>
          </label>
          <label>${fieldLabel(IC.file, copy.ddLabel, { required: true })}
            <select name="dueDiligenceLevel" required>${sarlaftCatalogOptionsHtml(SARLAFT_DUE_DILIGENCE_LEVELS, "normal")}</select>
          </label>
          <label>${fieldLabel(IC.calendar, "Frecuencia de revisión (días)", { required: true })}
            <input type="number" name="reviewFrequencyDays" required min="1" max="1095" value="180" />
          </label>
          <label class="full">${fieldLabel(IC.file, "Criterios / metodología", { required: true })}
            <textarea name="criteria" rows="3" required placeholder="${escapeAttr(criteriaPh)}"></textarea>
          </label>
        </div>
      </fieldset>
    </div>
    <footer class="antares-create-form__footer">
      ${G.renderManagedCreateFormActions("create-sarlaft-profile", `<button class="btn btn-primary antares-create-form__submit" type="submit">${IC.plus || ""} ${escapeHtml(copy.profileTitle)}</button>`)}
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
  const programFilter = normalizeSarlaftProgramFilter(ui.programFilter);
  const copy = sarlaftProgramCopy(programFilter);
  const partiesById = new Map(readParties().map((p) => [String(p.id), p]));

  const partiesAll = readParties();
  const profilesAll = readProfiles();
  const alertsAll = readAlerts();
  const reviewsAll = readReviews();
  const docs = readCompanyDocs();
  const parties = filterSarlaftByProgram(partiesAll, programFilter);
  const profiles = filterSarlaftByProgram(profilesAll, programFilter);
  const alerts = filterSarlaftByProgram(alertsAll, programFilter);
  const reviews = filterSarlaftByProgram(reviewsAll, programFilter, (r) => {
    const party = partiesById.get(String(r.thirdPartyId || ""));
    if (party) return party.program;
    return inferSarlaftProgramFromKind(SARLAFT_REVIEW_KINDS, r.kind, "ambos");
  });
  const kpis = summarizeSarlaft({ parties, alerts, reviews, todayYmd: today });
  const dueItems = collectSarlaftDueParties(parties, today);

  const filteredParties = applySarlaftTextFilter(
    parties,
    listSearchNorm,
    (p) => `${p.code} ${p.name} ${p.documentNumber} ${p.nit} ${p.partyType} ${p.kycStatus} ${p.riskLevel} ${p.city} ${p.program}`
  );
  const filteredAlerts = applySarlaftTextFilter(
    alerts,
    listSearchNorm,
    (a) => `${a.title} ${a.thirdPartyName} ${a.kind} ${a.status} ${a.severity} ${a.source} ${a.program}`
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
        <td><strong>${escapeHtml(p.name)}</strong>${programFilter !== "pte" && p.pepFlag ? '<span class="sarlaft-pep-flag">PEP</span>' : ""}${programFilter !== "sarlaft" && p.conflictDeclared ? '<span class="sarlaft-pte-flag">Conflicto</span>' : ""} ${programChip(p.program)}<div class="sarlaft-party-cell"><small>${escapeHtml(p.code || "—")} · ${escapeHtml(p.documentType)} ${escapeHtml(p.documentNumber || "—")}</small></div></td>
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
        <td><strong>${escapeHtml(a.title)}</strong> ${programChip(a.program)}<div class="sarlaft-party-cell"><small>${escapeHtml(sarlaftCatalogLabel(SARLAFT_ALERT_KINDS, a.kind))} · ${escapeHtml(a.thirdPartyName || "—")}</small></div></td>
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
      <td><strong>${escapeHtml(p.name)}</strong> ${programChip(p.program)}</td>
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
        <td><strong>${escapeHtml(sarlaftCatalogLabel(SARLAFT_REVIEW_KINDS, r.kind))}</strong><div class="sarlaft-party-cell"><small>${escapeHtml(r.thirdPartyName || "—")} · ${programChip(partiesById.get(String(r.thirdPartyId || ""))?.program || inferSarlaftProgramFromKind(SARLAFT_REVIEW_KINDS, r.kind))}</small></div></td>
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
        <p class="muted">${escapeHtml(p.code)} · ${programChip(p.program)} · Revisión cada ${escapeHtml(String(p.reviewFrequencyDays))} días · ${escapeHtml(sarlaftCatalogLabel(SARLAFT_DUE_DILIGENCE_LEVELS, p.dueDiligenceLevel))}</p>
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
    copy.emptyParties,
    `<tr><th>${escapeHtml(copy.consultParties)}</th><th>Vínculo</th><th>Riesgo</th><th>${escapeHtml(copy.kycLabel)}</th><th>Próxima revisión</th><th>Responsable</th><th class='payroll-contracts-table__actions'>Acciones</th></tr>`
  );
  const alertsTable = tableOrEmpty(
    alertRows,
    copy.emptyAlerts,
    `<tr><th>${escapeHtml(copy.consultAlerts)}</th><th>Severidad</th><th>Estado</th><th>Límite</th><th>Responsable</th><th class='payroll-contracts-table__actions'>Acciones</th></tr>`
  );
  const dueTable = tableOrEmpty(
    dueRows,
    copy.emptyDue,
    `<tr><th>${escapeHtml(copy.consultParties)}</th><th>Riesgo</th><th>Fecha</th><th>Estado</th><th>Responsable</th><th class='payroll-contracts-table__actions'>Acciones</th></tr>`
  );
  const reviewsTable = tableOrEmpty(
    reviewRows,
    copy.emptyReviews,
    `<tr><th>Tipo</th><th>Estado</th><th>Fecha</th><th>Responsable</th><th>Observación</th><th class='payroll-contracts-table__actions'>Acciones</th></tr>`
  );

  const reportsPane = `<div class="payroll-data-pane${dataSection === "reports" ? "" : " hidden"}" data-sarlaft-section="reports"${dataSection === "reports" ? "" : " hidden"}>
    <p class="muted payroll-result-meta">Exportaciones del programa <strong>${escapeHtml(copy.title)}</strong>. Las evidencias se consultan también en Gestión documental (${escapeHtml(SARLAFT_COMPANY_FOLDER)}).</p>
    <div class="sst-due-grid">
      <article class="sst-due-card">
        <strong>${escapeHtml(copy.consultParties)} y conocimiento</strong>
        <p class="muted">${kpis.parties} registros · ${kpis.pendingKyc} en ${escapeHtml(copy.kycLabel.toLowerCase())} · ${kpis.pepCount} PEP</p>
        <button type="button" class="btn btn-sm btn-primary" data-action="export-sarlaft-parties">${IC.download || ""} Exportar CSV</button>
      </article>
      <article class="sst-due-card">
        <strong>${escapeHtml(copy.consultAlerts)}</strong>
        <p class="muted">${kpis.openAlerts} abiertas · ${kpis.criticalAlerts} de alta/crítica</p>
        <button type="button" class="btn btn-sm btn-primary" data-action="export-sarlaft-alerts">${IC.download || ""} Exportar CSV</button>
      </article>
      <article class="sst-due-card">
        <strong>Perfiles parametrizados</strong>
        <p class="muted">${profiles.length} perfiles en la matriz ${escapeHtml(copy.title)}</p>
      </article>
    </div>
    <h3 class="sst-consult-head">Matriz de perfiles</h3>
    <div class="sst-due-grid">${profileCards || emptyState("Parametrice al menos un perfil de riesgo.")}</div>
  </div>`;

  const kpiCards = renderHrAlertCards([
    { label: copy.kpiParties, value: kpis.parties, tone: "info", icon: IC.user || "", help: copy.partyHint },
    { label: copy.kpiAlerts, value: kpis.openAlerts, tone: kpis.openAlerts ? "warn" : "ok", icon: IC.alert || "", help: "Requieren gestión" },
    { label: copy.kpiDue, value: kpis.dueReviews, tone: kpis.dueReviews ? "alert" : "ok", icon: IC.calendar || "", help: "Ventana 30 días" },
    { label: copy.kpiRisk, value: kpis.highRisk, tone: kpis.highRisk ? "warn" : "ok", icon: IC.shield || "", help: "Según matriz" }
  ]);

  const moduleHead = `<div class="hr-workspace-head sarlaft-studio-head">
    <div>
      <p class="hr-workspace-kicker">${escapeHtml(copy.kicker)}</p>
      <h2>${escapeHtml(copy.title)}</h2>
      <p class="muted">${escapeHtml(copy.subtitle)}</p>
    </div>
    ${programSwitcherHtml(programFilter)}
  </div>${kpiCards}`;

  const tabsNav = renderHrWorkspaceTabs({
    module: "sarlaft",
    ariaLabel: `Secciones del módulo ${copy.title}`,
    activeId: workspace,
    variant: "switch",
    tabs: [
      ...(canOperate
        ? [{ id: "operate", label: "Registrar", icon: "plus", hint: copy.operateRail }]
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
    copy.partyTitle,
    copy.partyHint,
    partyFormHtml(fieldLabel, IC, canParties, programFilter),
    "Abrir formulario",
    { createPanels: createUi }
  );
  const alertPane = createHrActionCard(
    "create-sarlaft-alert",
    "alert",
    copy.alertTitle,
    copy.alertHint,
    alertFormHtml(fieldLabel, IC, canAlerts, programFilter),
    "Abrir formulario",
    { createPanels: createUi }
  );
  const reviewPane = createHrActionCard(
    "create-sarlaft-review",
    "file",
    copy.reviewTitle,
    copy.reviewHint,
    reviewFormHtml(fieldLabel, IC, canReviews, programFilter),
    "Abrir formulario",
    { createPanels: createUi }
  );
  const profilePane = createHrActionCard(
    "create-sarlaft-profile",
    "shield",
    copy.profileTitle,
    copy.profileHint,
    profileFormHtml(fieldLabel, IC, canProfiles, programFilter),
    "Abrir formulario",
    { createPanels: createUi }
  );

  const operateAlert =
    kpis.openAlerts || kpis.dueReviews
      ? `<p class="sst-operate-alert hr-attention-strip hr-attention-strip--warn" role="status">${IC.alert || ""} <strong>${kpis.openAlerts}</strong> ${escapeHtml(copy.kpiAlerts.toLowerCase())} · <strong>${kpis.dueReviews}</strong> ${escapeHtml(copy.kpiDue.toLowerCase())}.</p>`
      : "";

  const operatePanel = canOperate
    ? `<div class="hr-workspace-panel payroll-workspace-panel${workspace === "operate" ? "" : " hidden"}" role="tabpanel" data-sarlaft-panel="operate"${workspace === "operate" ? "" : " hidden"}>
    ${operateAlert}
    <section class="sst-operate sst-operate-panel">
      <aside class="sst-operate__rail" aria-label="${escapeAttr(copy.operateRail)}">
        <div class="sst-operate__rail-head"><p class="sst-operate__rail-label">${escapeHtml(copy.operateRail)}</p></div>
        ${renderOperateNav(operateSection, operateCaps, copy)}
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
      <input type="search" data-action="sarlaft-data-list-search" value="${escapeAttr(listSearchRaw)}" placeholder="${escapeAttr(copy.searchPlaceholder)}" autocomplete="off" />
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
        }, copy)}
      </div>
      <div class="payroll-data-panes">
        <div class="payroll-data-pane${dataSection === "parties" ? "" : " hidden"}" data-sarlaft-section="parties"${dataSection === "parties" ? "" : " hidden"}>
          <p class="payroll-result-meta muted"><strong>${filteredParties.length}</strong> ${escapeHtml(copy.consultParties).toLowerCase()} · evidencias en Gestión documental</p>
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
          <p class="payroll-result-meta muted"><strong>${filteredReviews.length}</strong> ${escapeHtml(copy.consultReviews).toLowerCase()}</p>
          <div class="payroll-table-shell">${reviewsTable}</div>
          ${dataSection === "reviews" ? listPagination : ""}
        </div>
        ${reportsPane}
      </div>
    </section>
  </div>`;

  void docs;
  const studioClass = `sarlaft-studio sst-studio payroll-studio payroll-shell payroll-shell--workspace hr-flow-shell sarlaft-studio--${escapeAttr(programFilter)}${workspace === "data" ? " payroll-module--clean payroll-studio--consult" : ""}`;
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

function syncProgramPanels(form) {
  if (!form) return;
  const program = normalizeSarlaftProgram(
    form.querySelector("[data-sarlaft-program-select], [name='program']")?.value,
    "ambos"
  );
  form.querySelectorAll("[data-program-panel]").forEach((el) => {
    const want = el.getAttribute("data-program-panel");
    el.hidden = !(program === "ambos" || want === program);
  });
  const pepOn = String(form.querySelector("[name='pepFlag'], [data-sarlaft-pep-select]")?.value || "") === "true";
  const pepWrap = form.querySelector("[data-pep-details-wrap]");
  if (pepWrap) pepWrap.hidden = !pepOn;
  const kind = String(form.querySelector("[name='kind'], [data-sarlaft-kind-select]")?.value || "");
  const ben = form.querySelector("[data-beneficial-wrap]");
  if (ben) ben.hidden = kind !== "persona_juridica";
}

function refreshPartyProgramDependents(form) {
  const program = normalizeSarlaftProgram(form.querySelector("[data-sarlaft-program-select]")?.value, "ambos");
  const profileSel = form.querySelector("[data-sarlaft-profile-select]");
  if (profileSel) {
    const current = profileSel.value;
    profileSel.innerHTML = `<option value="">Seleccione...</option>${profileOptionsHtml(current, program)}`;
  }
  const catSel = form.querySelector("[name='evidenceCategory']");
  if (catSel) {
    const copy = sarlaftProgramCopy(program);
    catSel.innerHTML = sarlaftEvidenceCategoryOptionsHtml(catSel.value || copy.evidenceDefault, program);
  }
}

function bindProgramPanels(form) {
  if (!form) return;
  const run = () => syncProgramPanels(form);
  form.querySelector("[data-sarlaft-program-select]")?.addEventListener("change", () => {
    run();
    refreshPartyProgramDependents(form);
  });
  form.querySelector("[data-sarlaft-pep-select]")?.addEventListener("change", run);
  form.querySelector("[data-sarlaft-kind-select]")?.addEventListener("change", run);
  run();
}

function bindAlertKindProgram(form) {
  const kindSel = form?.querySelector("[data-sarlaft-alert-kind], [name='kind']");
  const progSel = form?.querySelector("[name='program']");
  if (!kindSel || !progSel) return;
  kindSel.addEventListener("change", () => {
    const inferred = inferSarlaftProgramFromKind(SARLAFT_ALERT_KINDS, kindSel.value, progSel.value);
    if (inferred && inferred !== "ambos") progSel.value = inferred;
  });
}

function partyDetailHtml(party) {
  const IC = G.IC || {};
  const program = normalizeSarlaftProgram(party.program, "ambos");
  const showSarlaft = program === "sarlaft" || program === "ambos";
  const showPte = program === "pte" || program === "ambos";
  const docs = documentsLinkedToSarlaftParty(readCompanyDocs(), party);
  const canAttach = canMutateSarlaftParties();
  const canOpenDms = canAccessDocumentsView(currentUser());
  const evidence =
    docs.length === 0
      ? `<p class="muted">Aún no hay evidencias en ${escapeHtml(SARLAFT_COMPANY_FOLDER)}${party.name ? ` / ${escapeHtml(party.name)}` : ""}.</p>`
      : `<ul class="sarlaft-evidence-list">${docs
          .map((d) => {
            const display = formatCompanyDocumentDisplayName(d);
            const title = display?.label || display?.title || d.fileName || "Documento";
            const cat = getCompanyDocumentCategoryLabel(d.documentCategory);
            return `<li>
              <div class="sarlaft-evidence-list__meta">
                <strong>${escapeHtml(title)}</strong>
                <span class="muted">${escapeHtml(cat || d.folder || "")}${d.sizeBytes ? ` · ${escapeHtml(formatFileSize(d.sizeBytes))}` : ""}</span>
              </div>
              <span class="sarlaft-evidence-list__actions">
                <button type="button" class="btn btn-sm btn-outline" data-action="sarlaft-preview-doc" data-doc-id="${escapeAttr(d.id)}">Ver</button>
                <button type="button" class="btn btn-sm btn-outline" data-action="sarlaft-download-doc" data-doc-id="${escapeAttr(d.id)}">Descargar</button>
              </span>
            </li>`;
          })
          .join("")}</ul>`;
  const attachBlock = canAttach
    ? `<div class="sarlaft-ficha-attach" data-sarlaft-ficha-attach>
        <p class="muted form-section-hint">Los archivos se guardan en Gestión documental (${escapeHtml(sarlaftEvidenceFolder(party.name))}).</p>
        <div class="sarlaft-ficha-attach__row">
          <select name="evidenceCategory" aria-label="Tipo documental">${sarlaftEvidenceCategoryOptionsHtml("form_conocimiento_tercero", party.program)}</select>
          <input type="file" data-sarlaft-evidence-input multiple accept="${SAFE_DOCUMENT_ACCEPT}" />
          <button type="button" class="btn btn-sm btn-primary" data-action="sarlaft-ficha-upload">${IC.upload || ""} Anexar</button>
        </div>
        <ul class="sarlaft-evidence-file__list" data-sarlaft-evidence-list></ul>
      </div>`
    : "";
  const reviews = readReviews().filter((r) => r.thirdPartyId === party.id);
  const alerts = readAlerts().filter((a) => a.thirdPartyId === party.id);
  const sarlaftBlock = showSarlaft
    ? `<div class="sarlaft-detail-block sarlaft-detail-block--sarlaft">
        <h4>SARLAFT · conocimiento LA/FT</h4>
        <ul class="sarlaft-check-list">
          ${flagCheck("Consulta de listas restrictivas", party.listsChecked)}
          ${flagCheck("Declaración de origen de fondos", party.fundsDeclared)}
          ${flagCheck("Condición PEP", party.pepFlag)}
        </ul>
        ${party.pepDetails ? `<p class="muted">${escapeHtml(party.pepDetails)}</p>` : ""}
        ${party.beneficialOwner ? `<p>Beneficiario final: <strong>${escapeHtml(party.beneficialOwner)}</strong></p>` : ""}
      </div>`
    : "";
  const pteBlock = showPte
    ? `<div class="sarlaft-detail-block sarlaft-detail-block--pte">
        <h4>PTE · transparencia y ética</h4>
        <ul class="sarlaft-check-list">
          ${flagCheck("Aceptó código de ética", party.ethicsAccepted)}
          ${flagCheck("Declaró conflicto de intereses", party.conflictDeclared)}
        </ul>
      </div>`
    : "";
  return `<div class="sarlaft-party-detail">
    <p><strong>${escapeHtml(party.name)}</strong>${party.pepFlag ? ' <span class="sarlaft-pep-flag">PEP</span>' : ""}${party.conflictDeclared ? ' <span class="sarlaft-pte-flag">Conflicto</span>' : ""} · ${programChip(party.program)} ${riskChip(party.riskLevel)} ${kycPill(party.kycStatus)}</p>
    <p class="muted">${escapeHtml(sarlaftCatalogLabel(SARLAFT_PARTY_TYPES, party.partyType))} · ${escapeHtml(party.documentType)} ${escapeHtml(party.documentNumber || "—")}</p>
    <p>${escapeHtml(showPte && !showSarlaft ? "Seguimiento ético" : "Debida diligencia")}: <strong>${escapeHtml(sarlaftCatalogLabel(SARLAFT_DUE_DILIGENCE_LEVELS, party.dueDiligenceLevel))}</strong> · Próxima revisión: <strong>${escapeHtml(party.nextReviewDate || "—")}</strong></p>
    <p>Responsable: ${escapeHtml(party.responsibleName || "—")}</p>
    ${sarlaftBlock}
    ${pteBlock}
    ${party.notes ? `<p>${escapeHtml(party.notes)}</p>` : ""}
    <h4>Evidencias (${docs.length})</h4>
    ${evidence}
    ${attachBlock}
    ${
      canOpenDms
        ? `<p class="sarlaft-link-docs"><button type="button" class="btn btn-sm btn-outline" data-action="sarlaft-open-dms" data-id="${escapeAttr(party.id)}">Abrir carpeta en Gestión documental</button></p>`
        : `<p class="muted sarlaft-link-docs">Carpeta: ${escapeHtml(sarlaftEvidenceFolder(party.name))}</p>`
    }
    <p class="muted">${showPte && !showSarlaft ? "Incidentes" : "Alertas"}: ${alerts.length} · ${showPte && !showSarlaft ? "Seguimientos" : "Revisiones"}: ${reviews.length}</p>
  </div>`;
}

function openPartyView(party) {
  const program = normalizeSarlaftProgram(party.program, "ambos");
  G.openEditModal?.({
    title: program === "pte" ? "Ficha de contraparte" : "Ficha del tercero",
    subtitle: `${party.code || ""} · ${sarlaftCatalogLabel(SARLAFT_PROGRAMS, program)}`,
    submitText: "Cerrar",
    hideSubmit: false,
    fields: [{ type: "custom", html: partyDetailHtml(party) }],
    afterMount: (formEl) => {
      const bindDocAction = (action, fn) => {
        formEl.querySelectorAll(`[data-action='${action}']`).forEach((btn) => {
          btn.addEventListener("click", async () => {
            const doc = readCompanyDocs().find((d) => String(d.id) === String(btn.dataset.docId || ""));
            if (!doc) {
              G.notify?.("No se encontró el documento.", "error");
              return;
            }
            try {
              await fn(doc);
            } catch (err) {
              G.notify?.(String(err?.message || err), "error");
            }
          });
        });
      };
      bindDocAction("sarlaft-preview-doc", previewSarlaftDocument);
      bindDocAction("sarlaft-download-doc", downloadSarlaftDocument);
      formEl.querySelector("[data-action='sarlaft-open-dms']")?.addEventListener("click", () => {
        G.closeModal?.();
        openSarlaftDocumentsInDms(party);
      });
      const attachWrap = formEl.querySelector("[data-sarlaft-ficha-attach]");
      if (attachWrap) {
        bindSarlaftEvidencePicker(attachWrap);
        formEl.querySelector("[data-action='sarlaft-ficha-upload']")?.addEventListener("click", async () => {
          if (!canMutateSarlaftParties()) return;
          const input = attachWrap.querySelector("[data-sarlaft-evidence-input]");
          if (!input?.files?.length) {
            G.notify?.("Seleccione al menos un archivo.", "error");
            return;
          }
          const attachedIds = await attachSarlaftEvidenceFiles({
            formEl: attachWrap,
            party,
            relatedLabel: `Evidencia ${party.code || party.name || ""}`
          });
          if (attachedIds.length) {
            await mergePartyDocumentIds(party.id, attachedIds);
            G.notify?.(
              `${attachedIds.length} documento${attachedIds.length === 1 ? "" : "s"} anexado${attachedIds.length === 1 ? "" : "s"} en Gestión documental.`,
              "success"
            );
            G.closeModal?.();
            G.renderPortalView?.();
            const fresh = readParties().find((p) => String(p.id) === String(party.id));
            if (fresh) openPartyView(fresh);
          }
        });
      }
    },
    onSubmit: async () => true
  });
}

function bindSarlaftPortalControls() {
  if (String(state.currentView || "") !== "sarlaft-pte" || !nodes.viewRoot) return;
  void ensureDefaultRiskProfiles();

  nodes.viewRoot.querySelectorAll("[data-action='sarlaft-program']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const program = normalizeSarlaftProgramFilter(btn.dataset.program);
      if (normalizeSarlaftProgramFilter(getUi().programFilter) === program) return;
      patchUi({ programFilter: program, listPage: 1 });
      persistHrWorkspace("sarlaft", getUi().workspace);
      G.renderPortalView?.();
    });
  });

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
    bindProgramPanels(partyForm);
    bindSarlaftEvidencePicker(partyForm);
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
          listsChecked: String(data.listsChecked) === "true",
          fundsDeclared: String(data.fundsDeclared) === "true",
          ethicsAccepted: String(data.ethicsAccepted) === "true",
          conflictDeclared: String(data.conflictDeclared) === "true",
          cumplimientoJson: serializeSarlaftCompliance({
            listsChecked: String(data.listsChecked) === "true",
            fundsDeclared: String(data.fundsDeclared) === "true",
            beneficialOwner: data.beneficialOwner,
            conflictDeclared: String(data.conflictDeclared) === "true",
            ethicsAccepted: String(data.ethicsAccepted) === "true"
          }),
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
      const attachedIds = await attachSarlaftEvidenceFiles({
        formEl: partyForm,
        party: record,
        relatedLabel: `Alta de tercero ${record.code || ""}`
      });
      if (attachedIds.length && canMutateSarlaftParties()) {
        await mergePartyDocumentIds(record.id, attachedIds);
      }
      auditSarlaft(
        "create",
        record.id,
        record.name,
        `Alta de tercero ${record.code || ""} · ${record.kycStatus}${attachedIds.length ? ` · ${attachedIds.length} anexo(s)` : ""}`
      );
      G.notify?.(
        attachedIds.length
          ? `Tercero registrado. ${attachedIds.length} documento${attachedIds.length === 1 ? "" : "s"} anexado${attachedIds.length === 1 ? "" : "s"}.`
          : "Tercero registrado.",
        "success"
      );
      G.renderPortalView?.();
    });
  }

  const alertForm = document.getElementById("form-sarlaft-alert");
  if (alertForm) {
    bindSarlaftEvidencePicker(alertForm);
    bindAlertKindProgram(alertForm);
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
          program: data.program || inferSarlaftProgramFromKind(SARLAFT_ALERT_KINDS, data.kind, getUi().programFilter),
          thirdPartyName: party.name,
          responsibleName: findUserName(data.responsibleUserId),
          createdBy: actorLabel()
        })
      );
      await writeAwaitServerCreate(KEYS.sarlaftAlerts, [...readAlerts(), record], record);
      const attachedIds = await attachSarlaftEvidenceFiles({
        formEl: alertForm,
        party,
        relatedLabel: `Alerta ${record.kind} · ${record.title}`
      });
      if (attachedIds.length && canMutateSarlaftParties()) {
        await mergePartyDocumentIds(party.id, attachedIds);
      }
      auditSarlaft(
        "create",
        record.id,
        record.title,
        `Alerta ${record.kind} · ${party.name}${attachedIds.length ? ` · ${attachedIds.length} anexo(s)` : ""}`
      );
      G.notify?.(
        attachedIds.length
          ? `Alerta registrada. ${attachedIds.length} documento${attachedIds.length === 1 ? "" : "s"} anexado${attachedIds.length === 1 ? "" : "s"}.`
          : "Alerta registrada.",
        "success"
      );
      G.renderPortalView?.();
    });
  }

  const reviewForm = document.getElementById("form-sarlaft-review");
  if (reviewForm) {
    bindSarlaftEvidencePicker(reviewForm);
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
      const attachedIds = await attachSarlaftEvidenceFiles({
        formEl: reviewForm,
        party,
        relatedLabel: `Revisión ${record.kind} · ${record.status}`
      });
      if (attachedIds.length && canMutateSarlaftParties()) {
        await mergePartyDocumentIds(party.id, attachedIds);
      }
      if (sarlaftReviewAdvancesSchedule(record.kind) && record.status === "cerrada" && canMutateSarlaftParties()) {
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
      auditSarlaft(
        "create",
        record.id,
        party.name,
        `Revisión ${record.kind} · ${record.status}${attachedIds.length ? ` · ${attachedIds.length} anexo(s)` : ""}`
      );
      G.notify?.(
        attachedIds.length
          ? `Revisión registrada. ${attachedIds.length} documento${attachedIds.length === 1 ? "" : "s"} anexado${attachedIds.length === 1 ? "" : "s"}.`
          : "Revisión registrada.",
        "success"
      );
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
      if (!party) return;
      if (canAccessDocumentsView(currentUser())) openSarlaftDocumentsInDms(party);
      else openPartyView(party);
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-sarlaft-party']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!canMutateSarlaftParties()) return;
      const target = readParties().find((p) => String(p.id) === String(btn.dataset.id || ""));
      if (!target) return;
      const program = normalizeSarlaftProgram(target.program, "ambos");
      const copy = sarlaftProgramCopy(program);
      const yesNo = [
        { value: "true", label: "Sí" },
        { value: "false", label: "No" }
      ];
      const fields = [
        { name: "name", label: "Nombre / razón social", value: target.name, required: true },
        {
          name: "program",
          label: "Programa",
          type: "select",
          value: program,
          options: SARLAFT_PROGRAMS.map((x) => ({ value: x.value, label: x.label }))
        },
        {
          name: "partyType",
          label: "Vínculo",
          type: "select",
          value: target.partyType,
          options: SARLAFT_PARTY_TYPES.map((x) => ({ value: x.value, label: x.label }))
        },
        {
          name: "kycStatus",
          label: copy.kycLabel,
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
          label: copy.ddLabel,
          type: "select",
          value: target.dueDiligenceLevel,
          options: SARLAFT_DUE_DILIGENCE_LEVELS.map((x) => ({ value: x.value, label: x.label }))
        },
        { name: "nextReviewDate", label: "Próxima revisión", type: "date", value: target.nextReviewDate }
      ];
      if (program === "sarlaft" || program === "ambos") {
        fields.push(
          {
            name: "listsChecked",
            label: "Consulta listas restrictivas",
            type: "select",
            value: String(Boolean(target.listsChecked)),
            options: yesNo
          },
          {
            name: "fundsDeclared",
            label: "Declaración de origen de fondos",
            type: "select",
            value: String(Boolean(target.fundsDeclared)),
            options: yesNo
          },
          {
            name: "pepFlag",
            label: "¿Es PEP?",
            type: "select",
            value: String(Boolean(target.pepFlag)),
            options: yesNo
          },
          { name: "pepDetails", label: "Detalle PEP", type: "textarea", value: target.pepDetails || "", rows: 2 },
          { name: "beneficialOwner", label: "Beneficiario final", value: target.beneficialOwner || "" }
        );
      }
      if (program === "pte" || program === "ambos") {
        fields.push(
          {
            name: "ethicsAccepted",
            label: "Aceptó código de ética",
            type: "select",
            value: String(Boolean(target.ethicsAccepted)),
            options: yesNo
          },
          {
            name: "conflictDeclared",
            label: "Declaró conflicto de intereses",
            type: "select",
            value: String(Boolean(target.conflictDeclared)),
            options: yesNo
          }
        );
      }
      fields.push({ name: "notes", label: "Observaciones", type: "textarea", value: target.notes, rows: 3 });
      G.openEditModal?.({
        title: program === "pte" ? "Editar contraparte" : "Editar tercero",
        subtitle: `${target.name} · ${sarlaftCatalogLabel(SARLAFT_PROGRAMS, program)}`,
        submitText: "Guardar",
        fields,
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
        title: normalizeSarlaftProgram(target.program) === "pte" ? "Gestionar incidente" : "Gestionar alerta",
        subtitle: `${target.title} · ${sarlaftCatalogLabel(SARLAFT_PROGRAMS, target.program)}`,
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
            html: `<p>${programChip(target.program)} ${alertStatusPill(target.status)} ${escapeHtml(sarlaftCatalogLabel(SARLAFT_ALERT_SEVERITIES, target.severity))}</p>
              <p class="muted">${escapeHtml(target.thirdPartyName || "—")} · ${escapeHtml(sarlaftCatalogLabel(SARLAFT_PROGRAMS, target.program))} · límite ${escapeHtml(target.dueDate || "—")}</p>
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
    const program = normalizeSarlaftProgramFilter(getUi().programFilter);
    const prefix = program === "pte" ? "pte_contrapartes" : program === "sarlaft" ? "sarlaft_terceros" : "sarlaft_pte_terceros";
    downloadCsv(
      `${prefix}_${colombiaTodayIsoDate()}.csv`,
      buildSarlaftPartyExportRows(filterSarlaftByProgram(readParties(), program), readProfiles()),
      SARLAFT_PARTY_EXPORT_COLUMNS
    );
  };
  const exportAlerts = () => {
    const program = normalizeSarlaftProgramFilter(getUi().programFilter);
    const prefix = program === "pte" ? "pte_incidentes" : program === "sarlaft" ? "sarlaft_alertas" : "sarlaft_pte_alertas";
    downloadCsv(
      `${prefix}_${colombiaTodayIsoDate()}.csv`,
      buildSarlaftAlertExportRows(filterSarlaftByProgram(readAlerts(), program)),
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
