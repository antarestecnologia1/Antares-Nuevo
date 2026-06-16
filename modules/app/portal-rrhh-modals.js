/**
 * Modales y navegación RRHH (nómina masiva, prefill desde candidato).
 */
const G = globalThis;

  } else {
    G.state.createPanels[id] = true;
  }
  G.renderPortalView();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => G.scrollToCreatePanelForm(id));
  });
  return true;
}

function formHasDirtyValues(formEl) {
  if (!formEl) return false;
  const fields = [...formEl.querySelectorAll("input, select, textarea")];
  return fields.some((field) => {
    if (field.disabled) return false;
    const tag = String(field.tagName || "").toLowerCase();
    const type = String(field.type || "").toLowerCase();
    if (type === "hidden") return false;
    if (type === "file") return Boolean(field.files?.length);
    if (type === "checkbox" || type === "radio") return field.checked !== field.defaultChecked;
    if (tag === "select") return field.value !== (field.defaultValue || "");
    return String(field.value || "") !== String(field.defaultValue || "");
  });
}

function payrollBulkEmployeeNameMap() {
  const map = new Map();
  readArray(G.KEYS.payrollEmployees).forEach((e) => {
    const id = String(e?.id || "").trim();
    if (id) map.set(id, String(e.name || "Colaborador").trim() || "Colaborador");
  });
  return map;
}

function humanizePayrollBulkSkipReason(raw) {
  let text = String(raw || "").trim();
  const hireMatch = text.match(/fecha de ingreso\s*\(?(\d{4}-\d{2}-\d{2})\)?/i);
  if (/sin días (efectivos en el corte|laborables en el período)/i.test(text)) {
    const hireLabel = hireMatch ? G.fmtDateOr(hireMatch[1], hireMatch[1]) : "";
    return hireLabel
      ? `Sin días laborables en el período (ingresó el ${hireLabel}, después del corte seleccionado).`
      : "Sin días laborables en el período seleccionado.";
  }
  if (/sin fecha de ingreso/i.test(text)) return "Falta fecha de ingreso válida en la ficha del colaborador.";
  if (/prima omitida/i.test(text)) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function parsePayrollBulkAutogenMessage(msg, nameById = new Map()) {
  const s = String(msg || "").trim();
  let m = s.match(/^Empleado\s+([0-9a-f-]{36})\s+\(([^)]+)\):\s*(.+)$/i);
  if (m) {
    return { name: m[2].trim(), reason: humanizePayrollBulkSkipReason(m[3]) };
  }
  m = s.match(/^Empleado\s+([0-9a-f-]{36}):\s*(.+)$/i);
  if (m) {
    return {
      name: nameById.get(m[1]) || "Colaborador",
      reason: humanizePayrollBulkSkipReason(m[2])
    };
  }
  m = s.match(/^([^:]+):\s*(.+)$/);
  if (m) {
    return { name: m[1].trim(), reason: humanizePayrollBulkSkipReason(m[2]) };
  }
  return { name: "", reason: humanizePayrollBulkSkipReason(s) };
}

function openPayrollBulkResultModal({ title, bodyHtml }) {
  const modal = G.ensureCrudModalElement();
  const card = modal.querySelector(".modal-card");
  if (card) card.className = "modal-card modal-card-edit modal-card--payroll-bulk-result";
  const content = modal.querySelector("#crud-modal-content");
  content.innerHTML = `
    ${G.renderModalHead(title)}
    <div class="payroll-bulk-result-body">${bodyHtml}</div>
    ${G.renderModalFooterActions({
      showCancel: false,
      primaryHtml: `<button type="button" id="crud-ok" class="btn btn-primary">${G.IC.check} Entendido</button>`
    })}
  `;
  modal.classList.remove("hidden");
  const close = () => modal.classList.add("hidden");
  G.wireModalDismiss(content, close, { closeIds: ["crud-close", "crud-ok"] });
  G.scrollOpenCrudModalIntoView();
}

function presentPayrollBulkAutogenResult(result) {
  const created = Number(result?.created || 0);
  const skipped = Number(result?.skipped || 0);
  const rawMsgs = Array.isArray(result?.messages) ? result.messages.filter(Boolean) : [];
  const nameById = payrollBulkEmployeeNameMap();
  const items = rawMsgs.map((msg) => parsePayrollBulkAutogenMessage(msg, nameById));

  const summaryBits = [];
  if (created > 0) {
    summaryBits.push(
      `<span class="payroll-bulk-result-stat payroll-bulk-result-stat--ok"><strong>${created}</strong> creada${created === 1 ? "" : "s"}</span>`
    );
  }
  if (skipped > 0) {
    summaryBits.push(
      `<span class="payroll-bulk-result-stat payroll-bulk-result-stat--skip"><strong>${skipped}</strong> omitida${skipped === 1 ? "" : "s"}</span>`
    );
  }

  const title =
    created > 0 ? "Liquidación masiva completada" : skipped > 0 ? "Sin nuevas liquidaciones" : "Liquidación masiva";

  let bodyHtml = `<div class="payroll-bulk-result-summary">${summaryBits.join("") || '<span class="muted">No hubo cambios.</span>'}</div>`;

  if (items.length) {
    bodyHtml += `<ul class="payroll-bulk-result-list" aria-label="Detalle por colaborador">${items
      .map(
        (it) =>
          `<li><span class="payroll-bulk-result-name">${G.escapeHtml(it.name || "Colaborador")}</span><span class="payroll-bulk-result-reason">${G.escapeHtml(it.reason)}</span></li>`
      )
      .join("")}</ul>`;
  } else if (skipped > 0 && created === 0) {
    bodyHtml += `<p class="muted payroll-bulk-result-hint">Ningún colaborador tenía un corte pendiente en esa fecha, o ya existía su liquidación para el mismo período.</p>`;
  }

  if (items.length || (skipped > 0 && created === 0)) {
    openPayrollBulkResultModal({ title, bodyHtml });
    return;

  if (posSel && position) {
    setFormSelectValue(posSel, position.id);
    posSel.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const hintEl = form.querySelector("#emp-position-catalog-hint");
  if (hintEl) {
    hintEl.textContent = `Datos precargados desde candidato «${String(candidate.name || "").trim()}». Complete seguridad social, banco y demás campos obligatorios antes de guardar.`;
  }
  form.dataset.prefillCandidateId = String(candidate.id || "");
  return true;
}

function openPayrollEmployeeFromCandidate(candidateId) {
  const cid = String(candidateId || "").trim();
  if (!cid) return;
  G.state.hiringUi = { ...(G.state.hiringUi || {}), prefillEmployeeFromCandidateId: cid };
  G.state.payrollUi = { ...(G.state.payrollUi || {}), workspace: "operate", operateSection: "employee" };
  G.state.createPanels = { ...(G.state.createPanels || {}), "create-employee": true };
  G.persistHrWorkspace("payroll", "operate");
  G.persistHrWorkspace("hiring", G.state.hiringUi?.workspace || "data");
  G.state.currentView = "payroll";
  G.renderPortalView();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => G.scrollToCreatePanelForm("create-employee"));
  });
}

function openHiringContractFromCandidate(candidateId) {
  const cid = String(candidateId || "").trim();
  if (!cid) return;
  G.state.hiringUi = {

export {
  openPayrollEmployeeFromCandidate,
  openHiringContractFromCandidate,
  openPayrollBulkResultModal,
  presentPayrollBulkAutogenResult,
  parsePayrollBulkAutogenMessage,
  humanizePayrollBulkSkipReason,
  payrollBulkEmployeeNameMap
};
