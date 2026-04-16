const IC = {
  eye: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  edit: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  check: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  plus: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  download: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  filter: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  send: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  truck: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 4v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  user: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  phone: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.62 2.6a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.48-1.28a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.6.62A2 2 0 0 1 22 16.92z"/></svg>',
  clock: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  shield: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  file: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  inbox: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  calendar: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  dollar: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  briefcase: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"/></svg>',
  bell: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  compass: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  mapPin: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  toggle: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3"/></svg>',
  grid: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  activity: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  save: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  userPlus: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  printer: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
};

function pcardWrap(iconKey, title, subtitle, bodyHtml, extraClass = "") {
  return `<div class="p-card ${extraClass}"><div class="p-card-header"><div class="p-card-header-left"><svg class="p-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[iconKey]?.replace(/<svg[^>]*>|<\/svg>/g, "") || ""}</svg><div><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div></div></div><div class="p-card-body">${bodyHtml}</div></div>`;
}

function emptyState(text) {
  return `<div class="empty-state"><svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg><p>${text}</p></div>`;
}

function notify(message, type = "info") {
  let box = document.getElementById("toast-container");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast-container";
    box.className = "toast-container";
    document.body.appendChild(box);
  }
  const item = document.createElement("div");
  item.className = `toast toast-${type}`;
  item.textContent = message;
  box.appendChild(item);
  requestAnimationFrame(() => item.classList.add("show"));
  setTimeout(() => {
    item.classList.remove("show");
    setTimeout(() => item.remove(), 240);
  }, 3200);
}

function openEditModal({ title, subtitle = "", fields = [], submitText = "Guardar", onSubmit }) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const content = modal.querySelector("#crud-modal-content");
  const fieldsHtml = fields
    .map((f) => {
      if (f.type === "select") {
        const options = (f.options || [])
          .map((opt) => `<option value="${opt.value}" ${String(opt.value) === String(f.value ?? "") ? "selected" : ""}>${opt.label}</option>`)
          .join("");
        return `<label><span>${f.label}</span><select name="${f.name}" ${f.required ? "required" : ""}>${options}</select></label>`;
      }
      return `<label><span>${f.label}</span><input type="${f.type || "text"}" name="${f.name}" value="${String(f.value ?? "").replace(/"/g, "&quot;")}" ${f.required ? "required" : ""} /></label>`;
    })
    .join("");

  content.innerHTML = `
    <div class="modal-head">
      <h2>${title}</h2>
      <button type="button" id="crud-close" class="btn btn-text" aria-label="Cerrar">${IC.x}</button>
    </div>
    ${subtitle ? `<p class="muted">${subtitle}</p>` : ""}
    <form id="crud-form" class="p-form modal-edit-form">
      ${fieldsHtml}
      <div class="modal-edit-actions">
        <button type="button" id="crud-cancel" class="btn btn-outline">Cancelar</button>
        <button type="submit" class="btn btn-primary">${IC.save} ${submitText}</button>
      </div>
    </form>
  `;

  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  content.querySelector("#crud-close").addEventListener("click", close);
  content.querySelector("#crud-cancel").addEventListener("click", close);
  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) close();
    },
    { once: true }
  );
  content.querySelector("#crud-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const result = onSubmit?.(payload);
    if (result === false) return;
    close();
  });
}

function openConfirmModal({ title, message, confirmText = "Confirmar", onConfirm }) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const content = modal.querySelector("#crud-modal-content");
  content.innerHTML = `
    <div class="modal-head">
      <h2>${title}</h2>
      <button type="button" id="crud-close" class="btn btn-text" aria-label="Cerrar">${IC.x}</button>
    </div>
    <p>${message}</p>
    <div class="modal-edit-actions" style="margin-top:1rem;">
      <button type="button" id="crud-cancel" class="btn btn-outline">Cancelar</button>
      <button type="button" id="crud-confirm" class="btn btn-primary">${IC.check} ${confirmText}</button>
    </div>
  `;
  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  content.querySelector("#crud-close").addEventListener("click", close);
  content.querySelector("#crud-cancel").addEventListener("click", close);
  content.querySelector("#crud-confirm").addEventListener("click", () => {
    onConfirm?.();
    close();
  });
  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) close();
    },
    { once: true }
  );
}

function openInfoModal({ title, subtitle = "", bodyHtml = "" }) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const content = modal.querySelector("#crud-modal-content");
  content.innerHTML = `
    <div class="modal-head">
      <h2>${title}</h2>
      <button type="button" id="crud-close" class="btn btn-text" aria-label="Cerrar">${IC.x}</button>
    </div>
    ${subtitle ? `<p class="muted">${subtitle}</p>` : ""}
    <div class="modal-info-body">${bodyHtml}</div>
    <div class="modal-edit-actions" style="margin-top:1rem;">
      <button type="button" id="crud-ok" class="btn btn-primary">Cerrar</button>
    </div>
  `;
  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  content.querySelector("#crud-close").addEventListener("click", close);
  content.querySelector("#crud-ok").addEventListener("click", close);
  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) close();
    },
    { once: true }
  );
}

function validateColombianDocument(docType, rawValue) {
  const type = String(docType || "").toUpperCase();
  const base = String(rawValue || "").trim();
  const compact = base.replace(/[.\s]/g, "");
  if (!compact) return { ok: false, message: "El documento es obligatorio.", normalized: "" };
  if (type === "CC") {
    const ok = /^\d{6,10}$/.test(compact);
    return { ok, message: ok ? "" : "La cedula CC debe tener entre 6 y 10 digitos.", normalized: compact };
  }
  if (type === "CE") {
    const ok = /^\d{6,12}$/.test(compact);
    return { ok, message: ok ? "" : "La cedula CE debe tener entre 6 y 12 digitos.", normalized: compact };
  }
  if (type === "NIT") {
    const ok = /^\d{8,10}(-\d)?$/.test(compact);
    return { ok, message: ok ? "" : "El NIT debe tener formato 900123456 o 900123456-7.", normalized: compact };
  }
  if (type === "PAS") {
    const ok = /^[A-Za-z0-9]{5,20}$/.test(compact);
    return { ok, message: ok ? "" : "El pasaporte debe ser alfanumerico (5-20 caracteres).", normalized: compact.toUpperCase() };
  }
  return { ok: compact.length >= 5, message: "Tipo de documento no valido.", normalized: compact };
}

function chunkBySizes(items, sizes = []) {
  const result = [];
  let cursor = 0;
  sizes.forEach((size) => {
    if (size > 0 && cursor < items.length) {
      result.push(items.slice(cursor, cursor + size));
      cursor += size;
    }
  });
  if (cursor < items.length) result.push(items.slice(cursor));
  return result.filter((group) => group.length);
}

function enhanceFormAsWizard(form, config = {}) {
  if (!form || form.dataset.wizardReady === "true") return;
  const children = [...form.children];
  const submitButtons = children.filter((node) => node.matches?.("button[type='submit']"));
  const baseFields = children.filter((node) => !submitButtons.includes(node));
  if (baseFields.length < 6) return;

  const groups = chunkBySizes(baseFields, config.sizes || []);
  if (!groups.length) return;
  form.innerHTML = "";
  form.classList.add("form-wizard");
  const titles = config.titles || [];

  groups.forEach((group, idx) => {
    const step = document.createElement("section");
    step.className = `wizard-step ${idx === 0 ? "active" : ""}`;
    step.dataset.step = String(idx);
    if (titles[idx]) {
      const head = document.createElement("div");
      head.className = "wizard-step-head";
      head.innerHTML = `<h4>${titles[idx]}</h4><span>Paso ${idx + 1} de ${groups.length}</span>`;
      step.appendChild(head);
    }
    group.forEach((node) => step.appendChild(node));
    if (idx === groups.length - 1) submitButtons.forEach((btn) => step.appendChild(btn));
    form.appendChild(step);
  });

  const nav = document.createElement("div");
  nav.className = "wizard-nav";
  nav.innerHTML = `<button type="button" class="btn btn-outline" data-wizard-prev>Anterior</button><button type="button" class="btn btn-primary" data-wizard-next>Siguiente</button>`;
  form.appendChild(nav);

  let current = 0;
  const steps = [...form.querySelectorAll(".wizard-step")];
  const prevBtn = nav.querySelector("[data-wizard-prev]");
  const nextBtn = nav.querySelector("[data-wizard-next]");

  const update = () => {
    steps.forEach((step, idx) => step.classList.toggle("active", idx === current));
    prevBtn.disabled = current === 0;
    nextBtn.classList.toggle("hidden", current === steps.length - 1);
    nextBtn.textContent = "Siguiente";
  };
  update();

  nextBtn.addEventListener("click", () => {
    const currentStep = steps[current];
    const requiredInputs = [...currentStep.querySelectorAll("input, select, textarea")].filter((el) => el.required);
    const invalid = requiredInputs.find((el) => !el.value);
    if (invalid) {
      notify("Completa los campos obligatorios del paso actual.", "error");
      invalid.focus();
      return;
    }
    if (current < steps.length - 1) current += 1;
    update();
  });
  prevBtn.addEventListener("click", () => {
    if (current > 0) current -= 1;
    update();
  });

  form.dataset.wizardReady = "true";
}

function applyFormWizards() {
  return;
}

function applyModuleMicroAnimations() {
  const targets = [...nodes.viewRoot.querySelectorAll(".p-card, .table-wrap, .user-card, .users-hero-item")];
  targets.forEach((node, idx) => {
    node.classList.remove("module-appear");
    node.style.animationDelay = `${Math.min(idx * 45, 380)}ms`;
    requestAnimationFrame(() => node.classList.add("module-appear"));
  });
}

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  counters: "antares_counters_v2",
  contacts: "antares_contacts_v2",
  requests: "antares_requests_v2",
  vehicles: "antares_vehicles_v2",
  drivers: "antares_drivers_v2",
  notifications: "antares_notifications_v2",
  emails: "antares_emails_v2",
  payrollEmployees: "antares_payroll_employees_v2",
  payrollRuns: "antares_payroll_runs_v2",
  vacancies: "antares_vacancies_v2",
  candidates: "antares_candidates_v2",
  interviews: "antares_interviews_v2",
  contracts: "antares_contracts_v2",
  approvals: "antares_approvals_v2",
  session: "antares_session_v2"
};

const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
  RRHH: "rrhh"
};

const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard_view",
  CLIENT_REQUESTS: "client_requests",
  TRANSPORT_REQUESTS: "transport_requests",
  TRANSPORT_TRIPS: "transport_trips",
  TRANSPORT_VEHICLES: "transport_vehicles",
  TRANSPORT_DRIVERS: "transport_drivers",
  TRANSPORT_CALENDAR: "transport_calendar",
  TRANSPORT_HISTORY: "transport_history",
  PAYROLL_MANAGE: "payroll_manage",
  HIRING_MANAGE: "hiring_manage",
  USERS_MANAGE: "users_manage",
  AUTHORIZATIONS_MANAGE: "authorizations_manage",
  PROFILE_VIEW: "profile_view",
  NOTIFICATIONS_VIEW: "notifications_view"
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);
const COLOMBIA_LOCATIONS = {
  Amazonas: ["Leticia", "Puerto Narino"],
  Antioquia: ["Medellin", "Bello", "Itagui", "Envigado", "Rionegro", "Apartado", "Turbo", "Caucasia", "La Ceja", "Sabaneta", "Copacabana", "Girardota", "Marinilla", "Yarumal", "Santa Fe de Antioquia"],
  Arauca: ["Arauca", "Arauquita", "Saravena", "Tame", "Fortul"],
  Atlantico: ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia", "Galapa", "Sabanagrande", "Santo Tomas", "Baranoa"],
  Bogota: ["Bogota D.C."],
  Bolivar: ["Cartagena", "Turbaco", "Magangue", "Arjona", "El Carmen de Bolivar", "Mompox", "San Juan Nepomuceno", "Turbana"],
  Boyaca: ["Tunja", "Duitama", "Sogamoso", "Chiquinquira", "Paipa", "Puerto Boyaca", "Samaca", "Villa de Leyva"],
  Caldas: ["Manizales", "Villamaria", "Chinchina", "La Dorada", "Riosucio", "Anserma", "Supia"],
  Caqueta: ["Florencia", "San Vicente del Caguan", "El Doncello", "Puerto Rico", "Belen de los Andaquies"],
  Casanare: ["Yopal", "Aguazul", "Villanueva", "Monterrey", "Tauramena", "Paz de Ariporo"],
  Cauca: ["Popayan", "Santander de Quilichao", "Puerto Tejada", "Patia", "Piendamo", "Corinto", "Guapi"],
  Cesar: ["Valledupar", "Aguachica", "Bosconia", "Codazzi", "La Jagua de Ibirico", "Curumani"],
  Choco: ["Quibdo", "Istmina", "Condoto", "Tado", "Bahia Solano"],
  Cordoba: ["Monteria", "Cerete", "Lorica", "Sahagun", "Planeta Rica", "Montelibano", "Tierralta", "Cienaga de Oro"],
  Cundinamarca: ["Soacha", "Chia", "Zipaquira", "Facatativa", "Girardot", "Mosquera", "Funza", "Madrid", "Fusagasuga", "Cajica", "La Calera", "Sopo", "Tabio", "Tocancipa", "Gachancipa"],
  Guainia: ["Inirida", "Barranco Minas", "Cacahual"],
  Guaviare: ["San Jose del Guaviare", "Calamar", "El Retorno", "Miraflores"],
  Huila: ["Neiva", "Pitalito", "Garzon", "La Plata", "Campoalegre", "Palermo"],
  LaGuajira: ["Riohacha", "Maicao", "Uribia", "Manaure", "Fonseca", "San Juan del Cesar", "Villanueva"],
  Magdalena: ["Santa Marta", "Cienaga", "Fundacion", "Aracataca", "El Banco", "Plato", "Pivijay"],
  Meta: ["Villavicencio", "Acacias", "Granada", "Puerto Lopez", "Puerto Gaitan", "Cumaral", "Restrepo"],
  Narino: ["Pasto", "Ipiales", "Tumaco", "Tuquerres", "Sandoná", "La Union", "Samaniego"],
  NorteDeSantander: ["Cucuta", "Ocana", "Villa del Rosario", "Los Patios", "Tibú", "Pamplona", "Chinacota"],
  Putumayo: ["Mocoa", "Puerto Asis", "Orito", "Villagarzon", "Sibundoy", "Valle del Guamuez"],
  Quindio: ["Armenia", "Calarca", "La Tebaida", "Montenegro", "Quimbaya", "Circasia"],
  Risaralda: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia", "Marsella", "Belen de Umbria"],
  SanAndresYProvidencia: ["San Andres", "Providencia"],
  Santander: ["Bucaramanga", "Floridablanca", "Giron", "Barrancabermeja", "Piedecuesta", "San Gil", "Socorro", "Malaga", "Cimitarra", "Puerto Wilches"],
  Sucre: ["Sincelejo", "Corozal", "Sampues", "San Marcos", "Toluviejo", "Coveñas", "Tolu"],
  Tolima: ["Ibague", "Espinal", "Melgar", "Honda", "Lerida", "Chaparral", "Libano", "Mariquita"],
  ValleDelCauca: ["Cali", "Palmira", "Buenaventura", "Tulua", "Yumbo", "Buga", "Cartago", "Jamundi", "Candelaria", "Florida", "Pradera", "Zarzal", "Roldanillo"],
  Vaupes: ["Mitu", "Caruru", "Taraira"],
  Vichada: ["Puerto Carreno", "La Primavera", "Santa Rosalia", "Cumaribo"]
};
const PERMISSION_META = {
  [PERMISSIONS.DASHBOARD_VIEW]: { title: "Ver dashboard", desc: "Acceso a indicadores y resumen general." },
  [PERMISSIONS.CLIENT_REQUESTS]: { title: "Solicitudes de cliente", desc: "Crear y consultar solicitudes propias." },
  [PERMISSIONS.TRANSPORT_REQUESTS]: { title: "Bandeja de transporte", desc: "Aprobar, rechazar y editar solicitudes." },
  [PERMISSIONS.TRANSPORT_TRIPS]: { title: "Gestion de viajes", desc: "Asignar y actualizar estados de viaje." },
  [PERMISSIONS.TRANSPORT_VEHICLES]: { title: "Gestion de camiones", desc: "Registrar y modificar vehiculos." },
  [PERMISSIONS.TRANSPORT_DRIVERS]: { title: "Gestion de conductores", desc: "Registrar y administrar conductores." },
  [PERMISSIONS.TRANSPORT_CALENDAR]: { title: "Calendario operativo", desc: "Ver programacion de viajes." },
  [PERMISSIONS.TRANSPORT_HISTORY]: { title: "Historial y reportes", desc: "Consultar historicos y filtros." },
  [PERMISSIONS.PAYROLL_MANAGE]: { title: "Nomina", desc: "Gestionar empleados y liquidaciones." },
  [PERMISSIONS.HIRING_MANAGE]: { title: "Contratacion", desc: "Gestionar vacantes, candidatos y contratos." },
  [PERMISSIONS.USERS_MANAGE]: { title: "Usuarios y permisos", desc: "Crear usuarios y administrar accesos." },
  [PERMISSIONS.AUTHORIZATIONS_MANAGE]: { title: "Autorizaciones", desc: "Aprobar solicitudes de operaciones y personal." },
  [PERMISSIONS.PROFILE_VIEW]: { title: "Mi perfil", desc: "Ver y editar informacion personal." },
  [PERMISSIONS.NOTIFICATIONS_VIEW]: { title: "Notificaciones", desc: "Ver novedades del sistema." }
};

const VIEW_PERMISSIONS = {
  dashboard: PERMISSIONS.DASHBOARD_VIEW,
  requests: PERMISSIONS.CLIENT_REQUESTS,
  "transport-requests": PERMISSIONS.TRANSPORT_REQUESTS,
  "transport-trips": PERMISSIONS.TRANSPORT_TRIPS,
  "transport-vehicles": PERMISSIONS.TRANSPORT_VEHICLES,
  "transport-drivers": PERMISSIONS.TRANSPORT_DRIVERS,
  "transport-calendar": PERMISSIONS.TRANSPORT_CALENDAR,
  history: PERMISSIONS.TRANSPORT_HISTORY,
  payroll: PERMISSIONS.PAYROLL_MANAGE,
  hiring: PERMISSIONS.HIRING_MANAGE,
  "admin-users": PERMISSIONS.USERS_MANAGE,
  authorizations: PERMISSIONS.AUTHORIZATIONS_MANAGE,
  profile: PERMISSIONS.PROFILE_VIEW,
  notifications: PERMISSIONS.NOTIFICATIONS_VIEW
};

const STATUS = {
  PENDIENTE: "Pendiente",
  APROBADA_PENDIENTE_ASIGNACION: "Aprobada pendiente asignacion",
  VIAJE_ASIGNADO: "Viaje asignado",
  EN_TRANSITO: "En transito",
  ESPERA_STANDBY: "Espera standby",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  RECHAZADA: "Rechazada"
};

const STATUS_TRANSITIONS = {
  [STATUS.PENDIENTE]: [STATUS.APROBADA_PENDIENTE_ASIGNACION, STATUS.VIAJE_ASIGNADO, STATUS.CANCELADA, STATUS.RECHAZADA],
  [STATUS.APROBADA_PENDIENTE_ASIGNACION]: [STATUS.VIAJE_ASIGNADO, STATUS.CANCELADA],
  [STATUS.VIAJE_ASIGNADO]: [STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY, STATUS.CANCELADA],
  [STATUS.EN_TRANSITO]: [STATUS.ESPERA_STANDBY, STATUS.COMPLETADA, STATUS.CANCELADA],
  [STATUS.ESPERA_STANDBY]: [STATUS.EN_TRANSITO, STATUS.COMPLETADA, STATUS.CANCELADA],
  [STATUS.COMPLETADA]: [],
  [STATUS.CANCELADA]: [],
  [STATUS.RECHAZADA]: []
};

const ACCOUNT_STATUS = {
  PENDIENTE: "pendiente",
  APROBADO: "aprobado",
  RECHAZADO: "rechazado"
};

const PIPELINE = ["Recibido", "Preseleccionado", "Entrevistado", "Oferta enviada", "Contratado", "Descartado"];
const AUTO_APPROVE_MINUTES = 10;
const CO_PAYROLL = {
  healthEmployeeRate: 0.04,
  pensionEmployeeRate: 0.04,
  solidarityRate: 0.01,
  solidarityThresholdSmmlv: 4,
  smmlv: 1750905
};

let state = {
  session: null,
  currentView: "dashboard",
  authTab: "login",
  authSecurity: {
    failedAttempts: 0,
    lockUntil: 0
  },
  adminUsersUi: {
    panel: "",
    editUserId: ""
  }
};

const nodes = {
  openAuth: document.getElementById("open-auth"),
  openAuthHero: document.getElementById("open-auth-hero"),
  closeAuth: document.getElementById("close-auth"),
  authModal: document.getElementById("auth-modal"),
  authContent: document.getElementById("auth-content"),
  b2bForm: document.getElementById("b2b-form"),
  publicApp: document.getElementById("public-app"),
  portalApp: document.getElementById("portal-app"),
  sideLinks: [...document.querySelectorAll(".side-link")],
  logout: document.getElementById("logout"),
  viewTitle: document.getElementById("view-title"),
  viewRoot: document.getElementById("view-root"),
  kpiCards: document.getElementById("kpi-cards"),
  sessionMeta: document.getElementById("session-meta"),
  authTabs: [...document.querySelectorAll(".tab")]
};

function read(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (_error) {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function hashPassword(raw) {
  const input = String(raw || "");
  if (!input) return "";
  if (input.startsWith("sha256:")) return input;
  if (!window.crypto?.subtle) return `sha256:${btoa(input)}`;
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const hex = [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `sha256:${hex}`;
}

async function verifyPassword(raw, storedHash) {
  if (!String(storedHash || "").startsWith("sha256:")) {
    return String(raw || "") === String(storedHash || "");
  }
  const hashed = await hashPassword(raw);
  return hashed === storedHash;
}

function passwordStrengthLabel(password) {
  const value = String(password || "");
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (score <= 1) return "Baja";
  if (score <= 3) return "Media";
  return "Alta";
}

function readCounters() {
  return read(KEYS.counters, {});
}

function nextCounter(prefix) {
  const counters = readCounters();
  const current = Number(counters[prefix] || 0) + 1;
  counters[prefix] = current;
  write(KEYS.counters, counters);
  return current;
}

function makeRequestNumber() {
  const value = String(nextCounter("request")).padStart(6, "0");
  return `SOL-${value}`;
}

function fmtDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CO");
}

function addYears(dateValue, years) {
  const d = new Date(dateValue);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function daysUntil(dateValue) {
  const target = new Date(dateValue).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.floor((target - now) / 86400000);
}

function docExpiryStatus(expeditionDate) {
  if (!expeditionDate) return { label: "Sin fecha", cls: "status-rechazada", days: -9999, expiresAt: null };
  const expiresAt = addYears(expeditionDate, 1);
  const days = daysUntil(expiresAt);
  if (days < 0) return { label: `Vencido hace ${Math.abs(days)} dias`, cls: "status-rechazada", days, expiresAt };
  if (days <= 30) return { label: `Por vencer (${days} dias)`, cls: "status-pendiente", days, expiresAt };
  return { label: `Vigente (${days} dias)`, cls: "status-viaje_asignado", days, expiresAt };
}

function formatRoute(request) {
  const origin = `${request.originDepartment ? `${request.originDepartment}, ` : ""}${request.originCity || "-"}`;
  const destination = `${request.destinationDepartment ? `${request.destinationDepartment}, ` : ""}${request.destinationCity || "-"}`;
  return `${origin} → ${destination}`;
}

function toInputDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function slugStatus(value) {
  return value.toLowerCase().replaceAll(" ", "_");
}

function prettyStatus(status, scope = "general") {
  const key = slugStatus(status);
  const iconMap = {
    pendiente: IC.clock,
    aprobada_pendiente_asignacion: IC.inbox,
    viaje_asignado: scope === "request" ? IC.truck : IC.check,
    en_transito: IC.truck,
    espera_standby: IC.clock,
    completada: IC.check,
    cancelada: IC.x,
    rechazada: IC.x
  };
  const icon = iconMap[key] || IC.activity;
  const road = scope === "request" && (key === "viaje_asignado" || key === "en_transito");
  return `<span class="status-pretty status-${key} ${road ? "status-road" : ""}">${icon}<span>${status}</span></span>`;
}

function fieldLabel(icon, text) {
  return `<span class="field-label">${icon}<span>${text}</span></span>`;
}

function saveNotification({ userId, title, body }) {
  const all = read(KEYS.notifications, []);
  all.unshift({ id: uid(), userId, title, body, createdAt: nowIso(), readAt: null });
  write(KEYS.notifications, all);
}

function sendEmail({ to, subject, body }) {
  const outbox = read(KEYS.emails, []);
  outbox.unshift({ id: uid(), to, subject, body, createdAt: nowIso() });
  write(KEYS.emails, outbox);
}

function findOrCreateCompanyIdByName(name) {
  const companyName = String(name || "").trim();
  if (!companyName) return null;
  const companies = read(KEYS.companies, []);
  const existing = companies.find(
    (item) => item.name.toLowerCase() === companyName.toLowerCase()
  );
  if (existing) return existing.id;
  const company = {
    id: uid(),
    name: companyName,
    taxId: "",
    phone: "",
    createdAt: nowIso()
  };
  companies.push(company);
  write(KEYS.companies, companies);
  return company.id;
}

function getCompanyById(companyId) {
  return read(KEYS.companies, []).find((item) => item.id === companyId) || null;
}

function companySelectOptions(selectedId = "") {
  return read(KEYS.companies, [])
    .map((company) => `<option value="${company.id}" ${company.id === selectedId ? "selected" : ""}>${company.name}</option>`)
    .join("");
}

function ensureCompaniesAndUserMapping() {
  const companies = read(KEYS.companies, []);
  const users = read(KEYS.users, []);

  let nextCompanies = [...companies];
  if (!nextCompanies.length) {
    nextCompanies = [
      {
        id: uid(),
        name: "Antares",
        taxId: "900000001-0",
        phone: "3001111111",
        createdAt: nowIso()
      },
      {
        id: uid(),
        name: "Flora Export SAS",
        taxId: "901000222-1",
        phone: "3003333333",
        createdAt: nowIso()
      }
    ];
    write(KEYS.companies, nextCompanies);
  }

  const companyByName = (name) =>
    nextCompanies.find(
      (company) => company.name.toLowerCase() === String(name || "").toLowerCase()
    );

  const mappedUsers = users.map((user) => {
    if (user.companyId) return user;
    const existing = companyByName(user.company);
    if (existing) return { ...user, companyId: existing.id };
    const created = {
      id: uid(),
      name: user.company || "Empresa sin nombre",
      taxId: user.taxId || "",
      phone: user.phone || "",
      createdAt: nowIso()
    };
    nextCompanies.push(created);
    return { ...user, companyId: created.id };
  });

  write(KEYS.companies, nextCompanies);
  write(KEYS.users, mappedUsers);
}

function ensureRequestsCompanyMapping() {
  const users = read(KEYS.users, []);
  const requests = read(KEYS.requests, []);
  const mapped = requests.map((request) => {
    if (request.clientCompanyId) return request;
    const owner = users.find((user) => user.id === request.clientUserId);
    return {
      ...request,
      clientCompanyId: owner?.companyId || null,
      requestedByName: request.requestedByName || owner?.name || request.clientName
    };
  });
  write(KEYS.requests, mapped);
}

function ensureRequestAndTripIdentifiers() {
  const requests = read(KEYS.requests, []);
  let changed = false;
  const mapped = requests.map((request) => {
    const next = { ...request };
    if (!next.requestNumber) {
      next.requestNumber = makeRequestNumber();
      changed = true;
    }
    if (next.trip && !next.trip.tripNumber) {
      next.trip = { ...next.trip, tripNumber: makeTripNumber() };
      changed = true;
    }
    return next;
  });
  if (changed) write(KEYS.requests, mapped);
}

function defaultPermissionsForRole(role) {
  if (role === ROLES.ADMIN) return [...ALL_PERMISSIONS];
  if (role === ROLES.RRHH) {
    return [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.HIRING_MANAGE,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW
    ];
  }
  return [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CLIENT_REQUESTS,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW
  ];
}

function ensureUsersPermissions() {
  const users = read(KEYS.users, []);
  const updated = users.map((user) => {
    const current = Array.isArray(user.permissions) ? user.permissions : [];
    const base = defaultPermissionsForRole(user.role);
    const merged = [...new Set([...base, ...current])].filter((permission) =>
      ALL_PERMISSIONS.includes(permission)
    );
    return { ...user, permissions: merged };
  });
  write(KEYS.users, updated);
}

function ensureUsersAccountStatus() {
  const users = read(KEYS.users, []);
  let changed = false;
  const updated = users.map((user) => {
    if (user.accountStatus) return user;
    changed = true;
    return { ...user, accountStatus: ACCOUNT_STATUS.APROBADO };
  });
  if (changed) write(KEYS.users, updated);
}

function queueApproval({ type, title, payload, requestedByUserId, requestedByName }) {
  const approvals = read(KEYS.approvals, []);
  approvals.unshift({
    id: uid(),
    type,
    title,
    payload,
    status: "pendiente",
    requestedByUserId,
    requestedByName,
    requestedAt: nowIso(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: ""
  });
  write(KEYS.approvals, approvals);
  const admins = read(KEYS.users, []).filter((u) => u.role === ROLES.ADMIN);
  admins.forEach((admin) => {
    saveNotification({
      userId: admin.id,
      title: "Nueva autorizacion pendiente",
      body: `${title} solicitada por ${requestedByName}.`
    });
  });
}

function ensureVehicleDocs() {
  const vehicles = read(KEYS.vehicles, []);
  let changed = false;
  const nowDate = new Date().toISOString().slice(0, 10);
  const updated = vehicles.map((v) => {
    if (v.soatExpeditionDate && v.techInspectionExpeditionDate) return v;
    changed = true;
    return {
      ...v,
      soatExpeditionDate: v.soatExpeditionDate || nowDate,
      techInspectionExpeditionDate: v.techInspectionExpeditionDate || nowDate
    };
  });
  if (changed) write(KEYS.vehicles, updated);
}

function seed() {
  if (!localStorage.getItem(KEYS.companies)) {
    write(KEYS.companies, [
      {
        id: uid(),
        name: "Antares",
        taxId: "900000001-0",
        phone: "3001111111",
        createdAt: nowIso()
      },
      {
        id: uid(),
        name: "Flora Export SAS",
        taxId: "901000222-1",
        phone: "3003333333",
        createdAt: nowIso()
      }
    ]);
  }

  const seededCompanies = read(KEYS.companies, []);
  const antaresCompany = seededCompanies.find((c) => c.name === "Antares");
  const floraCompany = seededCompanies.find((c) => c.name === "Flora Export SAS");

  if (!localStorage.getItem(KEYS.users)) {
    write(KEYS.users, [
      {
        id: uid(),
        name: "Admin Antares",
        email: "admin@antares.com",
        password: "admin123",
        role: ROLES.ADMIN,
        accountStatus: ACCOUNT_STATUS.APROBADO,
        permissions: defaultPermissionsForRole(ROLES.ADMIN),
        company: "Antares",
        companyId: antaresCompany?.id || null,
        taxId: "900000001-0",
        phone: "3001111111"
      },
      {
        id: uid(),
        name: "RRHH Antares",
        email: "rrhh@antares.com",
        password: "rrhh123",
        role: ROLES.RRHH,
        accountStatus: ACCOUNT_STATUS.APROBADO,
        permissions: defaultPermissionsForRole(ROLES.RRHH),
        company: "Antares",
        companyId: antaresCompany?.id || null,
        taxId: "900000001-0",
        phone: "3002222222"
      },
      {
        id: uid(),
        name: "Cliente Demo",
        email: "cliente@antares.com",
        password: "cliente123",
        role: ROLES.CLIENT,
        accountStatus: ACCOUNT_STATUS.APROBADO,
        permissions: defaultPermissionsForRole(ROLES.CLIENT),
        company: "Flora Export SAS",
        companyId: floraCompany?.id || null,
        taxId: "901000222-1",
        phone: "3003333333"
      }
    ]);
  }

  if (!localStorage.getItem(KEYS.vehicles)) {
    write(KEYS.vehicles, [
      { id: uid(), plate: "TRB123", type: "Turbo", capacityKg: 3500, refrigerated: true, available: true },
      { id: uid(), plate: "CMN456", type: "Camion", capacityKg: 8000, refrigerated: true, available: true },
      { id: uid(), plate: "TRC789", type: "Tractocamion", capacityKg: 30000, refrigerated: true, available: true }
    ]);
  }

  if (!localStorage.getItem(KEYS.drivers)) {
    write(KEYS.drivers, [
      { id: uid(), name: "Juan Perez", phone: "3010000001", license: "C3", available: true },
      { id: uid(), name: "Maria Gomez", phone: "3010000002", license: "C2", available: true },
      { id: uid(), name: "Carlos Ruiz", phone: "3010000003", license: "C3", available: true }
    ]);
  }

  [
    KEYS.companies,
    KEYS.counters,
    KEYS.contacts,
    KEYS.requests,
    KEYS.notifications,
    KEYS.emails,
    KEYS.payrollEmployees,
    KEYS.payrollRuns,
    KEYS.vacancies,
    KEYS.candidates,
    KEYS.interviews,
    KEYS.contracts
    ,KEYS.approvals
  ].forEach((key) => {
    if (!localStorage.getItem(key)) write(key, []);
  });

  ensureCompaniesAndUserMapping();
  ensureRequestsCompanyMapping();
  ensureRequestAndTripIdentifiers();
  ensureUsersPermissions();
  ensureUsersAccountStatus();
  ensureVehicleDocs();
}

function getSession() {
  return read(KEYS.session, null);
}

function setSession(sessionData) {
  write(KEYS.session, sessionData);
  state.session = sessionData;
}

function clearSession() {
  localStorage.removeItem(KEYS.session);
  state.session = null;
}

function buildToken(user) {
  const nonce = crypto.getRandomValues(new Uint32Array(2)).join("");
  return btoa(`${user.id}.${user.role}.${Date.now()}.${nonce}`);
}

async function ensureUsersPasswordHashing() {
  const users = read(KEYS.users, []);
  let changed = false;
  const secured = [];
  for (const user of users) {
    if (String(user.password || "").startsWith("sha256:")) {
      secured.push(user);
      continue;
    }
    changed = true;
    secured.push({ ...user, password: await hashPassword(user.password) });
  }
  if (changed) write(KEYS.users, secured);
}

function authView() {
  const tab = state.authTab;
  if (tab === "login") {
    return `
      <form id="form-login" class="form-grid auth-form">
        <label class="full">Correo corporativo <input type="email" name="email" autocomplete="username" required /></label>
        <label class="full">Contrasena
          <div class="password-field">
            <input type="password" name="password" autocomplete="current-password" required />
            <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="login">Mostrar</button>
          </div>
        </label>
        <button class="btn btn-primary full" type="submit">Ingresar de forma segura</button>
      </form>
      <p class="muted auth-help">Usa tu correo y contrasena. Evita ingresar desde equipos compartidos.</p>
    `;
  }

  if (tab === "register") {
    return `
      <form id="form-register" class="form-grid auth-form">
        <label>Primer nombre <input name="firstName" required /></label>
        <label>Segundo nombre <input name="middleName" /></label>
        <label>Primer apellido <input name="lastName" required /></label>
        <label>Segundo apellido <input name="secondLastName" /></label>
        <label>Tipo de persona
          <select name="personType" required>
            <option value="Natural">Natural</option>
            <option value="Juridica">Juridica</option>
          </select>
        </label>
        <label>Tipo documento
          <select name="documentType" required>
            <option value="CC">Cedula de ciudadania</option>
            <option value="CE">Cedula de extranjeria</option>
            <option value="NIT">NIT</option>
            <option value="PAS">Pasaporte</option>
          </select>
        </label>
        <label>Numero documento/NIT <input name="taxId" required /></label>
        <label>Expedicion documento <input type="date" name="documentIssuedAt" required /></label>
        <label>Fecha de nacimiento <input type="date" name="birthDate" required /></label>
        <label>Genero
          <select name="gender" required>
            <option value="">Seleccione...</option>
            <option>Femenino</option>
            <option>Masculino</option>
            <option>No binario</option>
            <option>Prefiero no decirlo</option>
          </select>
        </label>
        <label>Cargo <input name="position" required /></label>
        <label>Area <input name="workArea" required placeholder="Ej: Operaciones" /></label>
        <label>Telefono <input name="phone" required /></label>
        <label>Ciudad <input name="city" required placeholder="Ej: Medellin" /></label>
        <label>Departamento <input name="department" required placeholder="Ej: Antioquia" /></label>
        <label>Direccion <input name="address" required placeholder="Direccion principal" /></label>
        <label>Correo <input type="email" name="email" autocomplete="username" required /></label>
        <label class="full">Contrasena
          <div class="password-field">
            <input type="password" minlength="8" name="password" autocomplete="new-password" required />
            <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="register">Mostrar</button>
          </div>
          <small id="password-strength" class="muted">Seguridad: Baja</small>
        </label>
        <label class="full">Confirmar contrasena <input type="password" minlength="8" name="passwordConfirm" autocomplete="new-password" required /></label>
        <label class="full"><input type="checkbox" name="acceptTerms" required /> Acepto terminos, politica de privacidad y tratamiento de datos (Habeas Data).</label>
        <button class="btn btn-primary full" type="submit">Crear cuenta cliente</button>
      </form>
    `;
  }

  return `
    <form id="form-recover" class="form-grid">
      <label class="full">Correo registrado <input type="email" name="email" required /></label>
      <button class="btn btn-primary full" type="submit">Enviar recuperacion</button>
    </form>
  `;
}

function showAuth() {
  nodes.authModal.classList.remove("hidden");
  renderAuthTab();
}

function hideAuth() {
  nodes.authModal.classList.add("hidden");
}

function renderAuthTab() {
  nodes.authTabs.forEach((tabBtn) => {
    tabBtn.classList.toggle("active", tabBtn.dataset.tab === state.authTab);
  });
  nodes.authContent.innerHTML = authView();
  bindAuthForms();
}

function bindAuthForms() {
  const login = document.getElementById("form-login");
  const register = document.getElementById("form-register");
  const recover = document.getElementById("form-recover");
  const togglePassword = document.querySelectorAll("[data-action='toggle-password']");
  togglePassword.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetForm = String(btn.dataset.target || "");
      const input = targetForm === "register"
        ? register?.querySelector("input[name='password']")
        : login?.querySelector("input[name='password']");
      if (!input) return;
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      btn.textContent = visible ? "Mostrar" : "Ocultar";
    });
  });

  if (login) {
    login.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (Date.now() < state.authSecurity.lockUntil) {
        const secs = Math.ceil((state.authSecurity.lockUntil - Date.now()) / 1000);
        alert(`Demasiados intentos. Intenta nuevamente en ${secs} segundos.`);
        return;
      }
      const data = Object.fromEntries(new FormData(login).entries());
      const users = read(KEYS.users, []);
      const user = users.find((u) => normalizeEmail(u.email) === normalizeEmail(data.email));
      const valid = user ? await verifyPassword(String(data.password || ""), user.password) : false;
      if (!valid || !user) {
        state.authSecurity.failedAttempts += 1;
        if (state.authSecurity.failedAttempts >= 5) {
          state.authSecurity.lockUntil = Date.now() + 60_000;
          state.authSecurity.failedAttempts = 0;
        }
        alert("Credenciales invalidas.");
        return;
      }
      state.authSecurity.failedAttempts = 0;
      state.authSecurity.lockUntil = 0;
      if (user.accountStatus === ACCOUNT_STATUS.PENDIENTE) {
        alert("Tu cuenta aun esta pendiente de aprobacion por un administrador. Te notificaremos por correo cuando sea aprobada.");
        return;
      }
      if (user.accountStatus === ACCOUNT_STATUS.RECHAZADO) {
        alert("Tu solicitud de registro fue rechazada. Contacta a soporte para mas informacion.");
        return;
      }
      setSession({ userId: user.id, role: user.role, token: buildToken(user) });
      hideAuth();
      renderPortal();
    });
  }

  if (register) {
    const regPass = register.querySelector("input[name='password']");
    const strength = register.querySelector("#password-strength");
    if (regPass && strength) {
      regPass.addEventListener("input", () => {
        strength.textContent = `Seguridad: ${passwordStrengthLabel(regPass.value)}`;
      });
    }
    register.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(register).entries());
      const fullName = [data.firstName, data.middleName, data.lastName, data.secondLastName]
        .map((chunk) => String(chunk || "").trim())
        .filter(Boolean)
        .join(" ");
      if (!fullName) {
        notify("Debes ingresar nombres y apellidos validos.", "error");
        return;
      }
      const docValidation = validateColombianDocument(data.documentType, data.taxId);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.taxId = docValidation.normalized;
      if (String(data.password || "") !== String(data.passwordConfirm || "")) {
        notify("La confirmacion de contrasena no coincide.", "error");
        return;
      }
      if (String(data.password || "").length < 8) {
        alert("La contrasena debe tener minimo 8 caracteres.");
        return;
      }
      if (!data.acceptTerms) {
        notify("Debes aceptar terminos y tratamiento de datos para continuar.", "error");
        return;
      }
      const birthDateValue = new Date(String(data.birthDate || ""));
      if (!Number.isFinite(birthDateValue.getTime())) {
        notify("La fecha de nacimiento no es valida.", "error");
        return;
      }
      const ageYears = Math.floor((Date.now() - birthDateValue.getTime()) / 31557600000);
      if (ageYears < 18) {
        notify("El usuario debe ser mayor de edad para registrarse.", "error");
        return;
      }
      const users = read(KEYS.users, []);
      if (users.some((u) => normalizeEmail(u.email) === normalizeEmail(data.email))) {
        alert("El correo ya existe.");
        return;
      }
      if (users.some((u) => String(u.documentType || "") === String(data.documentType || "") && String(u.taxId || "") === String(data.taxId || ""))) {
        notify("Ya existe un usuario registrado con este documento.", "error");
        return;
      }
      const { passwordConfirm, acceptTerms, ...profileData } = data;
      const newUser = {
        id: uid(),
        ...profileData,
        name: fullName,
        email: normalizeEmail(data.email),
        password: await hashPassword(data.password),
        role: ROLES.CLIENT,
        accountStatus: ACCOUNT_STATUS.PENDIENTE,
        companyId: null,
        company: "",
        permissions: defaultPermissionsForRole(ROLES.CLIENT),
        profileQualityChecklist: {
          idVerified: true,
          acceptedTermsAt: nowIso(),
          requiredFieldsCompleted: true
        },
        registeredAt: nowIso()
      };
      users.push(newUser);
      write(KEYS.users, users);
      sendEmail({
        to: data.email,
        subject: "Registro recibido - Antares Portal",
        body: "Tu solicitud de registro fue recibida. Un administrador revisara tu cuenta y te notificaremos cuando sea aprobada."
      });
      const adminUsers = read(KEYS.users, []).filter((u) => u.role === ROLES.ADMIN);
      adminUsers.forEach((admin) => {
        saveNotification({
          userId: admin.id,
          title: "Nuevo registro de cliente pendiente",
          body: `${data.name} solicita acceso al portal. Falta asociar empresa en aprobacion.`
        });
        sendEmail({
          to: admin.email,
          subject: "Nuevo registro de cliente pendiente de aprobacion",
          body: `Cliente: ${data.name} | Documento: ${data.documentType || "-"} ${data.taxId || "-"} | Correo: ${data.email}`
        });
      });
      alert("Registro enviado. Tu cuenta sera revisada por un administrador antes de poder acceder. Te notificaremos por correo.");
      state.authTab = "login";
      renderAuthTab();
    });
  }

  if (recover) {
    recover.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(recover).entries());
      const users = read(KEYS.users, []);
      const user = users.find((u) => normalizeEmail(u.email) === normalizeEmail(data.email));
      if (!user) {
        alert("No existe usuario con ese correo.");
        return;
      }
      sendEmail({
        to: user.email,
        subject: "Recuperacion de contrasena",
        body: `Hola ${user.name}, se solicito recuperacion de acceso. Por seguridad, solicita a un administrador restablecer tu contrasena.`
      });
      alert("Solicitud enviada. Un administrador debe ayudarte a restablecer el acceso.");
    });
  }
  applyFormWizards();
}

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function diffMinutes(fromIso) {
  return (Date.now() - new Date(fromIso).getTime()) / 60000;
}

function intervalsOverlap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();
  if (![aStart, aEnd, bStart, bEnd].every(Number.isFinite)) return false;
  return aStart < bEnd && bStart < aEnd;
}

function activeTripStatuses() {
  return [STATUS.VIAJE_ASIGNADO, STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY];
}

function getActiveTrips() {
  const requests = read(KEYS.requests, []);
  return requests.filter((r) => r.trip && activeTripStatuses().includes(r.status));
}

function canTransitionStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  const allowed = STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

function applyStandbyCharge(request, actorName) {
  const hoursRaw = prompt("Horas en standby:", "1");
  if (!hoursRaw) return null;
  const rateRaw = prompt("Valor por hora standby:", "50000");
  if (!rateRaw) return null;
  const hours = Math.max(1, parseNum(hoursRaw));
  const rate = Math.max(0, parseNum(rateRaw));
  const value = hours * rate;
  const currentTotal = parseNum(request.standbyChargeTotal);
  const event = {
    id: uid(),
    hours,
    rate,
    value,
    createdAt: nowIso(),
    createdBy: actorName
  };
  return {
    standbyChargeTotal: currentTotal + value,
    standbyEvents: [...(request.standbyEvents || []), event]
  };
}

function transitionRequestStatus(requestId, nextStatus, actorName = "Sistema") {
  const requests = read(KEYS.requests, []);
  const target = requests.find((request) => request.id === requestId);
  if (!target) return false;

  if (!canTransitionStatus(target.status, nextStatus)) {
    alert(`Transición no permitida: ${target.status} -> ${nextStatus}`);
    return false;
  }

  let extra = {};
  if (nextStatus === STATUS.ESPERA_STANDBY) {
    const standbyData = applyStandbyCharge(target, actorName);
    if (!standbyData) return false;
    extra = standbyData;
  }

  const updated = requests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status: nextStatus,
          ...extra,
          deliveredAt: nextStatus === STATUS.COMPLETADA ? nowIso() : request.deliveredAt,
          trip: request.trip
            ? {
                ...request.trip,
                realtimeStatus: nextStatus
              }
            : request.trip
        }
      : request
  );
  write(KEYS.requests, updated);
  return true;
}

function isVehicleBusyAtHour(vehicle, pickupAt, etaDelivery, currentRequestId = null) {
  return getActiveTrips().some((request) => {
    if (currentRequestId && request.id === currentRequestId) return false;
    const tripStart = request.trip?.etaPickup;
    const tripEnd = request.trip?.etaDelivery || tripStart;
    const conflict = intervalsOverlap(tripStart, tripEnd, pickupAt, etaDelivery);
    if (!conflict) return false;
    return request.trip.vehicleId
      ? request.trip.vehicleId === vehicle.id
      : request.trip.vehiclePlate === vehicle.plate;
  });
}

function isDriverBusyAtHour(driver, pickupAt, etaDelivery, currentRequestId = null) {
  return getActiveTrips().some((request) => {
    if (currentRequestId && request.id === currentRequestId) return false;
    const tripStart = request.trip?.etaPickup;
    const tripEnd = request.trip?.etaDelivery || tripStart;
    const conflict = intervalsOverlap(tripStart, tripEnd, pickupAt, etaDelivery);
    if (!conflict) return false;
    return request.trip.driverId
      ? request.trip.driverId === driver.id
      : request.trip.driverName === driver.name;
  });
}

function selectBestVehicle(requiredType, weight, pickupAt, etaDelivery, currentRequestId = null) {
  const vehicles = read(KEYS.vehicles, []);
  const filtered = vehicles.filter(
    (v) =>
      v.available &&
      (!requiredType || v.type === requiredType) &&
      !isVehicleBusyAtHour(v, pickupAt, etaDelivery, currentRequestId)
  );
  const pick =
    filtered.find((v) => v.capacityKg >= weight) ||
    filtered[0] ||
    vehicles.find((v) => v.available && !isVehicleBusyAtHour(v, pickupAt, etaDelivery, currentRequestId)) ||
    null;
  return pick || null;
}

function selectDriver(pickupAt, etaDelivery, currentRequestId = null) {
  const drivers = read(KEYS.drivers, []);
  return (
    drivers.find((d) => d.available && !isDriverBusyAtHour(d, pickupAt, etaDelivery, currentRequestId)) ||
    null
  );
}

function getCompatibleVehiclesForRequest(request, currentRequestId = null) {
  const requiresRefrigeration = String(request?.serviceType || "").toLowerCase().includes("refrigerada");
  return read(KEYS.vehicles, []).filter((vehicle) => {
    if (!vehicle.available) return false;
    if (request?.vehicleType && vehicle.type !== request.vehicleType) return false;
    if (parseNum(vehicle.capacityKg) < parseNum(request?.weightKg)) return false;
    if (requiresRefrigeration && !vehicle.refrigerated) return false;
    if (docExpiryStatus(vehicle.soatExpeditionDate).days < 0) return false;
    if (docExpiryStatus(vehicle.techInspectionExpeditionDate).days < 0) return false;
    if (isVehicleBusyAtHour(vehicle, request?.pickupAt, request?.etaDelivery || request?.pickupAt, currentRequestId)) return false;
    return true;
  });
}

function getCompatibleDriversForRequest(request, currentRequestId = null) {
  return read(KEYS.drivers, []).filter(
    (driver) =>
      driver.available &&
      daysUntil(driver.licenseExpiry) >= 0 &&
      !isDriverBusyAtHour(driver, request?.pickupAt, request?.etaDelivery || request?.pickupAt, currentRequestId)
  );
}

function makeTripNumber() {
  const value = String(nextCounter("trip")).padStart(6, "0");
  return `VIA-${value}`;
}

function setVehicleAvailability(vehicleId, available) {
  const vehicles = read(KEYS.vehicles, []);
  const next = vehicles.map((v) => (v.id === vehicleId ? { ...v, available } : v));
  write(KEYS.vehicles, next);
}

function setDriverAvailability(driverId, available) {
  const drivers = read(KEYS.drivers, []);
  const next = drivers.map((d) => (d.id === driverId ? { ...d, available } : d));
  write(KEYS.drivers, next);
}

function approveRequest(requestId, actorName = "Sistema", auto = false, selectedVehicleId = "", selectedDriverId = "") {
  const requests = read(KEYS.requests, []);
  const current = requests.find((r) => r.id === requestId);
  const canAssignTrip = current && [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(current.status);
  if (!current || !canAssignTrip) return false;

  if (auto) {
    write(
      KEYS.requests,
      requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: STATUS.APROBADA_PENDIENTE_ASIGNACION,
              approvedAt: nowIso(),
              approvedBy: actorName,
              autoApproved: true,
              rejectionReason: ""
            }
          : r
      )
    );
    const targetUser = read(KEYS.users, []).find((u) => u.id === current.clientUserId);
    if (targetUser) {
      saveNotification({
        userId: targetUser.id,
        title: "Solicitud autoaprobada",
        body: `Tu solicitud ${current.requestNumber || current.id} fue autoaprobada y quedo pendiente de asignacion de viaje.`
      });
    }
    return true;
  }

  const compatibleVehicles = getCompatibleVehiclesForRequest(current, requestId);
  const compatibleDrivers = getCompatibleDriversForRequest(current, requestId);

  const vehicle = selectedVehicleId
    ? compatibleVehicles.find((item) => item.id === selectedVehicleId) || null
    : selectBestVehicle(
      current.vehicleType,
      parseNum(current.weightKg),
      current.pickupAt,
      current.etaDelivery || current.pickupAt,
      requestId
    );
  const driver = selectedDriverId
    ? compatibleDrivers.find((item) => item.id === selectedDriverId) || null
    : selectDriver(current.pickupAt, current.etaDelivery || current.pickupAt, requestId);

  if (!vehicle || !driver) {
    notify("No hay conductor o camion compatible/disponible para esta solicitud.", "error");
    return false;
  }

  const trip = {
    id: uid(),
    tripNumber: makeTripNumber(),
    vehicleId: vehicle.id,
    vehiclePlate: vehicle ? vehicle.plate : "SIN-DISP",
    vehicleType: vehicle ? vehicle.type : current.vehicleType,
    driverId: driver.id,
    driverName: driver ? driver.name : "Por definir",
    driverPhone: driver ? driver.phone : "-",
    route: formatRoute(current),
    etaPickup: current.pickupAt,
    etaDelivery: current.etaDelivery || current.pickupAt,
    assignedBy: actorName,
    assignedAt: nowIso(),
    realtimeStatus: STATUS.VIAJE_ASIGNADO
  };

  const next = requests.map((r) =>
    r.id === requestId
      ? {
          ...r,
          status: STATUS.VIAJE_ASIGNADO,
          approvedAt: nowIso(),
          approvedBy: actorName,
          autoApproved: auto,
          rejectionReason: "",
          trip
        }
      : r
  );
  write(KEYS.requests, next);

  const users = read(KEYS.users, []);
  const target = users.find((u) => u.id === current.clientUserId);
  if (target) {
    saveNotification({
      userId: target.id,
      title: "Solicitud aprobada",
      body: `Tu solicitud ${current.id} fue aprobada${auto ? " automaticamente" : ""}. Viaje ${trip.tripNumber}.`
    });
    sendEmail({
      to: target.email,
      subject: "Solicitud aprobada",
      body: `Viaje ${trip.tripNumber} - Vehiculo ${trip.vehiclePlate} - Conductor ${trip.driverName}`
    });
  }
  return true;
}

function rejectRequest(requestId, reason, actorName) {
  const requests = read(KEYS.requests, []);
  const current = requests.find((r) => r.id === requestId);
  if (!current) return;
  const next = requests.map((r) =>
    r.id === requestId
      ? { ...r, status: STATUS.RECHAZADA, approvedAt: nowIso(), approvedBy: actorName, rejectionReason: reason }
      : r
  );
  write(KEYS.requests, next);

  const user = read(KEYS.users, []).find((u) => u.id === current.clientUserId);
  if (user) {
    saveNotification({ userId: user.id, title: "Solicitud rechazada", body: `Motivo: ${reason}` });
    sendEmail({ to: user.email, subject: "Solicitud rechazada", body: reason });
  }
}

function updateAutoApprove() {
  const requests = read(KEYS.requests, []);
  requests
    .filter((r) => r.status === STATUS.PENDIENTE)
    .forEach((r) => {
      if (diffMinutes(r.createdAt) >= AUTO_APPROVE_MINUTES) {
        approveRequest(r.id, "Sistema", true);
      }
    });
}

function minutesRemaining(createdAt) {
  const left = AUTO_APPROVE_MINUTES - diffMinutes(createdAt);
  return Math.max(0, Math.ceil(left));
}

function currentUser() {
  const users = read(KEYS.users, []);
  return users.find((u) => u.id === state.session?.userId) || null;
}

function getVisibleRequestsForUser(user) {
  const requests = read(KEYS.requests, []);
  if (!user) return [];
  if (user.role === ROLES.ADMIN) return requests;
  return requests.filter((request) => request.clientCompanyId === user.companyId);
}

function hasPermission(user, permission) {
  if (!permission) return true;
  if (user?.role === ROLES.ADMIN) return true;
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  return permissions.includes(permission);
}

function canAccessView(user, view) {
  return hasPermission(user, VIEW_PERMISSIONS[view]);
}

function canAccessRRHH(role) {
  return role === ROLES.ADMIN || role === ROLES.RRHH;
}

function isViewAllowedForUser(user, view) {
  if (!user || !canAccessView(user, view)) return false;
  if (view === "requests") return user.role === ROLES.CLIENT || user.role === ROLES.ADMIN;
  if (["transport-requests", "transport-trips", "transport-vehicles", "transport-drivers", "transport-calendar", "history", "admin-users", "authorizations"].includes(view)) {
    return user.role === ROLES.ADMIN;
  }
  if (["payroll", "hiring"].includes(view)) return canAccessRRHH(user.role);
  return true;
}

function viewFromPortalHash() {
  const hash = String(window.location.hash || "");
  if (!hash.startsWith("#portal/")) return "";
  const view = hash.slice("#portal/".length).trim();
  return VIEW_PERMISSIONS[view] ? view : "";
}

function syncPortalHash(view) {
  const safeView = VIEW_PERMISSIONS[view] ? view : "dashboard";
  const nextHash = `#portal/${safeView}`;
  if (window.location.hash !== nextHash) {
    history.replaceState(null, "", nextHash);
  }
}

function enforcePortalViewFromUrl(user) {
  if (!state.session || !user) return;
  const candidate = viewFromPortalHash();
  if (!candidate) {
    syncPortalHash(state.currentView || "dashboard");
    return;
  }
  if (!isViewAllowedForUser(user, candidate)) {
    state.currentView = "dashboard";
    syncPortalHash("dashboard");
    alert("Ruta no autorizada. Se redirigio al dashboard.");
    return;
  }
  state.currentView = candidate;
}

function setView(view) {
  const user = currentUser();
  if (!user) return;
  if (!isViewAllowedForUser(user, view)) {
    alert("No tienes permisos para acceder a este módulo.");
    return;
  }
  state.currentView = view;
  syncPortalHash(view);
  nodes.sideLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.view === view);
  });
  renderPortalView();
}

function renderPortal() {
  const session = getSession();
  if (!session) {
    document.body.classList.remove("portal-mode");
    nodes.publicApp.classList.remove("hidden");
    nodes.portalApp.classList.add("hidden");
    return;
  }
  state.session = session;
  document.body.classList.add("portal-mode");
  nodes.publicApp.classList.add("hidden");
  nodes.portalApp.classList.remove("hidden");
  const user = currentUser();
  if (!user) {
    clearSession();
    renderPortal();
    return;
  }

  nodes.sessionMeta.textContent = `${user.name} - ${user.role.toUpperCase()}`;
  document.querySelectorAll(".admin-only").forEach((n) => n.classList.toggle("hidden", user.role !== ROLES.ADMIN));
  document.querySelectorAll(".client-only").forEach((n) => n.classList.toggle("hidden", user.role !== ROLES.CLIENT));
  document.querySelectorAll(".rrhh-only").forEach((n) => n.classList.toggle("hidden", !canAccessRRHH(user.role)));
  nodes.sideLinks.forEach((link) => {
    const isRoleHidden =
      (link.classList.contains("admin-only") && user.role !== ROLES.ADMIN) ||
      (link.classList.contains("client-only") && user.role !== ROLES.CLIENT) ||
      (link.classList.contains("rrhh-only") && !canAccessRRHH(user.role));
    const view = link.dataset.view;
    const allowedByPermission = isViewAllowedForUser(user, view);
    link.classList.toggle("hidden", isRoleHidden || !allowedByPermission);
  });
  renderKpis();
  enforcePortalViewFromUrl(user);
  if (!isViewAllowedForUser(user, state.currentView)) {
    state.currentView = "dashboard";
    syncPortalHash("dashboard");
  }
  renderPortalView();
}

function renderKpis() {
  const user = currentUser();
  const visible = getVisibleRequestsForUser(user);
  const cards = [
    { label: "Pendientes", value: visible.filter((r) => r.status === STATUS.PENDIENTE || r.status === STATUS.APROBADA_PENDIENTE_ASIGNACION).length, icon: IC.clock, color: "kpi-icon-warning" },
    { label: "Viaje asignado", value: visible.filter((r) => r.status === STATUS.VIAJE_ASIGNADO).length, icon: IC.check, color: "kpi-icon-success" },
    { label: "En transito", value: visible.filter((r) => r.status === STATUS.EN_TRANSITO).length, icon: IC.truck, color: "kpi-icon-primary" },
    { label: "Completadas", value: visible.filter((r) => r.status === STATUS.COMPLETADA).length, icon: IC.shield, color: "kpi-icon-teal" }
  ];
  nodes.kpiCards.innerHTML = cards.map((c) => `
    <article class="kpi">
      <div class="kpi-icon ${c.color}">${c.icon}</div>
      <div class="kpi-data"><span>${c.label}</span><b>${c.value}</b></div>
    </article>
  `).join("");
}

function viewDashboard() {
  const user = currentUser();
  const list = getVisibleRequestsForUser(user);
  const byVehicle = {};
  list.forEach((r) => {
    const key = r.vehicleType || "Sin tipo";
    byVehicle[key] = (byVehicle[key] || 0) + 1;
  });
  const colors = { Turbo: "#F59F00", Camion: "#1565C0", Tractocamion: "#1B8E5F", "Sin tipo": "#94A3B8" };
  const vehicleStats = Object.entries(byVehicle)
    .map(([k, v]) => `<div class="dash-stat-row"><div class="dash-stat-label"><span class="dash-stat-dot" style="background:${colors[k] || '#94A3B8'}"></span>${k}</div><div class="dash-stat-value">${v}</div></div>`)
    .join("");

  const byStatus = {};
  list.forEach((r) => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; });
  const statusStats = Object.entries(byStatus)
    .map(([k, v]) => `<div class="dash-stat-row"><div class="dash-stat-label">${prettyStatus(k)}</div><div class="dash-stat-value">${v}</div></div>`)
    .join("");

  const users = read(KEYS.users, []);
  const drivers = read(KEYS.drivers, []);
  const vehicles = read(KEYS.vehicles, []);
  const avg = (rows) => (rows.length ? Math.round(rows.reduce((acc, val) => acc + val, 0) / rows.length) : 0);
  const userQuality = avg(
    users.map((u) => {
      const required = ["name", "email", "documentType", "taxId", "phone", "city", "address", "companyId"];
      const done = required.filter((field) => String(u[field] ?? "").trim() !== "").length;
      return Math.round((done / required.length) * 100);
    })
  );
  const driverQuality = avg(
    drivers.map((d) => {
      const required = ["name", "documentType", "idDoc", "phone", "license", "licenseExpiry", "licenseCategory", "city", "companyId"];
      const done = required.filter((field) => String(d[field] ?? "").trim() !== "").length;
      return Math.round((done / required.length) * 100);
    })
  );
  const vehicleQuality = avg(
    vehicles.map((v) => {
      const required = ["plate", "brand", "model", "year", "type", "capacityKg", "mileageKm", "soatExpeditionDate", "techInspectionExpeditionDate"];
      const done = required.filter((field) => String(v[field] ?? "").trim() !== "").length;
      return Math.round((done / required.length) * 100);
    })
  );
  const qualityBody = `
    <div class="quality-row"><span>Usuarios</span><div class="quality-bar"><i style="width:${userQuality}%"></i></div><b>${userQuality}%</b></div>
    <div class="quality-row"><span>Conductores</span><div class="quality-bar"><i style="width:${driverQuality}%"></i></div><b>${driverQuality}%</b></div>
    <div class="quality-row"><span>Vehiculos</span><div class="quality-bar"><i style="width:${vehicleQuality}%"></i></div><b>${vehicleQuality}%</b></div>
  `;

  return `<div class="dash-grid">
    ${pcardWrap("truck", "Por tipo de vehiculo", list.length + " solicitudes registradas", vehicleStats || emptyState("Sin datos de vehiculos aun"))}
    ${pcardWrap("activity", "Por estado", "Distribucion de solicitudes", statusStats || emptyState("Sin solicitudes aun"))}
    ${pcardWrap("shield", "Calidad de datos", "Completitud de registros", qualityBody)}
  </div>`;
}

function requestFormHtml() {
  const user = currentUser();
  const companyName = getCompanyById(user?.companyId)?.name || user?.company || "-";
  const departments = Object.keys(COLOMBIA_LOCATIONS)
    .map((dept) => `<option value="${dept}">${dept}</option>`)
    .join("");
  const body = `<form id="form-request" class="p-form">
    <label class="full">${fieldLabel(IC.briefcase, "Empresa asociada")}
      <input value="${companyName}" disabled />
      <input type="hidden" name="companyId" value="${user?.companyId || ""}" />
    </label>
    <label>${fieldLabel(IC.mapPin, "Departamento origen")}<select name="originDepartment" id="origin-department" required><option value="">Seleccione...</option>${departments}</select></label>
    <label>${fieldLabel(IC.mapPin, "Ciudad origen")}<select name="originCity" id="origin-city" required><option value="">Seleccione un departamento...</option></select></label>
    <label>${fieldLabel(IC.compass, "Origen direccion")}<input name="originAddress" required /></label>
    <label>${fieldLabel(IC.mapPin, "Departamento destino")}<select name="destinationDepartment" id="destination-department" required><option value="">Seleccione...</option>${departments}</select></label>
    <label>${fieldLabel(IC.mapPin, "Ciudad destino")}<select name="destinationCity" id="destination-city" required><option value="">Seleccione un departamento...</option></select></label>
    <label>${fieldLabel(IC.compass, "Destino direccion")}<input name="destinationAddress" required /></label>
    <div class="full datetime-group">
      <label>${fieldLabel(IC.calendar, "Fecha de recogida")}<input type="date" name="pickupDate" id="pickup-date" required /></label>
      <label>${fieldLabel(IC.clock, "Hora de recogida")}<input type="time" name="pickupTime" id="pickup-time" required /></label>
      <label>${fieldLabel(IC.calendar, "Fecha de entrega")}<input type="date" name="deliveryDate" id="delivery-date" required /></label>
      <label>${fieldLabel(IC.clock, "Hora de entrega")}<input type="time" name="deliveryTime" id="delivery-time" required /></label>
    </div>
    <label>${fieldLabel(IC.truck, "Tipo vehiculo")}<select name="vehicleType" required><option value="">Seleccione...</option><option>Turbo</option><option>Camion</option><option>Tractocamion</option></select></label>
    <label>${fieldLabel(IC.file, "Descripcion carga")}<input name="cargoDescription" required /></label>
    <label>${fieldLabel(IC.briefcase, "Tipo de servicio")}<select name="serviceType" required><option value="">Seleccione...</option><option>Transporte nacional</option><option>Ultima milla</option><option>Carga refrigerada</option><option>Carga seca</option></select></label>
    <label>${fieldLabel(IC.grid, "Volumen cajas")}<input type="number" min="0" name="boxes" required /></label>
    <label>${fieldLabel(IC.dollar, "Peso kg")}<input type="number" min="0" name="weightKg" required /></label>
    <label>${fieldLabel(IC.dollar, "Valor del viaje (COP)")}<input type="number" min="0" name="tripValue" required /></label>
    <label>${fieldLabel(IC.user, "Contacto en sitio")}<input name="siteContactName" required /></label>
    <label>${fieldLabel(IC.phone, "Telefono contacto")}<input name="siteContactPhone" required /></label>
    <label class="full">Observaciones <textarea name="notes" rows="3"></textarea></label>
    <label class="full">Adjuntos opcionales <input type="file" name="attachments" multiple /></label>
    <button class="btn btn-primary full" type="submit">${IC.send} Crear solicitud</button>
  </form>`;
  return pcardWrap("plus", "Nueva solicitud de viaje", "Selecciona origen, destino, fecha y hora de forma guiada", body);
}

function requestListClientHtml(user) {
  const requests = getVisibleRequestsForUser(user);
  const rows = requests
    .map((r) => {
      const allowEdit = r.status === STATUS.PENDIENTE || r.status === STATUS.APROBADA_PENDIENTE_ASIGNACION;
      const trip = r.trip
        ? `<strong>${r.trip.tripNumber}</strong><br><span class="muted">${r.trip.vehiclePlate} · ${r.trip.driverName}</span>`
        : '<span class="muted">-</span>';
      return `<tr>
        <td><strong>${r.requestNumber || r.id}</strong></td>
        <td>${formatRoute(r)}<br><span class="muted">Creada por: ${r.requestedByName || r.clientName}</span></td>
        <td>${prettyStatus(r.status, "request")}</td>
        <td>${trip}</td>
        <td><div class="toolbar">
          <button class="btn btn-sm btn-action" data-action="detail" data-id="${r.id}">${IC.eye} Ver</button>
          ${allowEdit ? `<button class="btn btn-sm btn-action" data-action="edit" data-id="${r.id}">${IC.edit} Editar</button>` : ""}
          ${allowEdit ? `<button class="btn btn-sm btn-reject" data-action="cancel" data-id="${r.id}">${IC.x} Cancelar</button>` : ""}
        </div></td>
      </tr>`;
    })
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Viaje</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("Aun no hay solicitudes creadas.");
  return pcardWrap("file", "Mis solicitudes", requests.length + " registradas", body);
}

function adminQueueHtml() {
  const requests = read(KEYS.requests, []).filter((r) => r.status === STATUS.PENDIENTE);
  const rows = requests
    .map((r) => `<tr>
      <td><strong>${r.requestNumber || r.id}</strong></td>
      <td>${r.clientName}</td>
      <td>${formatRoute(r)}</td>
      <td>${r.vehicleType}</td>
      <td><span class="timer-badge">${IC.clock} ${minutesRemaining(r.createdAt)} min</span></td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-approve" data-action="approve" data-id="${r.id}">${IC.check} Aprobar</button>
        <button class="btn btn-sm btn-reject" data-action="reject" data-id="${r.id}">${IC.x} Rechazar</button>
        <button class="btn btn-sm btn-action" data-action="edit-admin" data-id="${r.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-action" data-action="delete-admin" data-id="${r.id}">${IC.trash} Eliminar</button>
      </div></td>
    </tr>`)
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Solicitud</th><th>Cliente</th><th>Ruta</th><th>Vehiculo</th><th>Timer</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay solicitudes pendientes.");
  return pcardWrap("inbox", "Bandeja de pendientes", requests.length + " solicitudes por revisar", body, requests.length > 0 ? "p-card-alert" : "");
}

function vehiclesHtml() {
  const vehicles = read(KEYS.vehicles, []);
  const rows = vehicles
    .map((v) => {
      const soat = docExpiryStatus(v.soatExpeditionDate);
      const tecno = docExpiryStatus(v.techInspectionExpeditionDate);
      return `<tr>
      <td><strong>${v.plate}</strong></td>
      <td>${v.type}<br><span class="muted">${v.brand || "-"} · ${v.model || "-"} · ${v.year || "-"}</span></td>
      <td>${v.capacityKg.toLocaleString("es-CO")} kg</td>
      <td>${v.refrigerated ? '<span class="status status-viaje_asignado">Si</span>' : '<span class="status status-espera_standby">No</span>'}</td>
      <td><span class="muted">${v.soatExpeditionDate || "-"}</span><br><span class="status ${soat.cls}">${soat.label}</span></td>
      <td><span class="muted">${v.techInspectionExpeditionDate || "-"}</span><br><span class="status ${tecno.cls}">${tecno.label}</span></td>
      <td>${v.available ? '<span class="status status-viaje_asignado">Disponible</span>' : '<span class="status status-rechazada">Ocupado</span>'}</td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-action" data-action="edit-vehicle" data-id="${v.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-action" data-action="toggle-vehicle" data-id="${v.id}">${IC.toggle} Estado</button>
      </div></td>
    </tr>`;
    })
    .join("");
  const formBody = `<form id="form-vehicle" class="p-form">
    <label>${fieldLabel(IC.truck, "Placa")}<input name="plate" required /></label>
    <label>${fieldLabel(IC.briefcase, "Marca")}<input name="brand" required /></label>
    <label>${fieldLabel(IC.grid, "Linea/Modelo")}<input name="model" required /></label>
    <label>${fieldLabel(IC.calendar, "Ano modelo")}<input type="number" min="1990" max="2100" name="year" required /></label>
    <label>${fieldLabel(IC.grid, "Tipo")}<select name="type" required><option>Turbo</option><option>Camion</option><option>Tractocamion</option></select></label>
    <label>${fieldLabel(IC.dollar, "Capacidad kg")}<input type="number" min="1" name="capacityKg" required /></label>
    <label>${fieldLabel(IC.activity, "Refrigerado")}<select name="refrigerated"><option value="true">Si</option><option value="false">No</option></select></label>
    <label>${fieldLabel(IC.clock, "Kilometraje")}<input type="number" min="0" name="mileageKm" required /></label>
    <label>${fieldLabel(IC.calendar, "Expedicion SOAT")}<input type="date" name="soatExpeditionDate" required /></label>
    <label>${fieldLabel(IC.calendar, "Expedicion tecnomecanica")}<input type="date" name="techInspectionExpeditionDate" required /></label>
    <button class="btn btn-primary full" type="submit">${IC.plus} Agregar vehiculo</button>
  </form>`;
  const tableBody = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Placa</th><th>Tipo</th><th>Capacidad</th><th>Refrigerado</th><th>SOAT</th><th>Tecnomecanica</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay vehiculos registrados.");
  return pcardWrap("plus", "Registrar vehiculo", null, formBody) + pcardWrap("truck", "Flota de camiones", vehicles.length + " vehiculos", tableBody);
}

function driversHtml() {
  const drivers = read(KEYS.drivers, []);
  const companyOptions = companySelectOptions();
  const rows = drivers
    .map((d) => `<tr>
      <td><strong>${d.name}</strong></td>
      <td>${d.phone}</td>
      <td>${d.license}<br><span class="muted">${d.licenseCategory || "-"} · vence ${d.licenseExpiry || "-"}</span></td>
      <td>${getCompanyById(d.companyId)?.name || "-"}</td>
      <td>${d.available ? '<span class="status status-viaje_asignado">Disponible</span>' : '<span class="status status-rechazada">Ocupado</span>'}</td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-action" data-action="edit-driver" data-id="${d.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-action" data-action="toggle-driver" data-id="${d.id}">${IC.toggle} Estado</button>
      </div></td>
    </tr>`)
    .join("");
  const formBody = `<form id="form-driver" class="p-form">
    <label>${fieldLabel(IC.user, "Nombre")}<input name="name" required /></label>
    <label>${fieldLabel(IC.file, "Tipo documento")}
      <select name="documentType" required>
        <option value="CC">Cedula de ciudadania</option>
        <option value="CE">Cedula de extranjeria</option>
        <option value="PAS">Pasaporte</option>
      </select>
    </label>
    <label>${fieldLabel(IC.file, "No. documento")}<input name="idDoc" required /></label>
    <label>${fieldLabel(IC.phone, "Telefono")}<input name="phone" required /></label>
    <label>${fieldLabel(IC.file, "Licencia")}<input name="license" required /></label>
    <label>${fieldLabel(IC.calendar, "Vence licencia")}<input type="date" name="licenseExpiry" required /></label>
    <label>${fieldLabel(IC.activity, "Categoria licencia")}<select name="licenseCategory" required><option>C1</option><option>C2</option><option>C3</option></select></label>
    <label>${fieldLabel(IC.mapPin, "Ciudad residencia")}<input name="city" required /></label>
    <label>${fieldLabel(IC.mapPin, "Direccion residencia")}<input name="address" required /></label>
    <label>${fieldLabel(IC.user, "Contacto emergencia")}<input name="emergencyContact" required /></label>
    <label>${fieldLabel(IC.phone, "Telefono emergencia")}<input name="emergencyPhone" required /></label>
    <label>${fieldLabel(IC.briefcase, "Empresa")}<select name="companyId" required><option value="">Seleccione...</option>${companyOptions}</select></label>
    <label>${fieldLabel(IC.activity, "Tipo contrato")}<input name="contractType" required placeholder="Indefinido/Fijo" /></label>
    <label>${fieldLabel(IC.dollar, "Salario base")}<input type="number" min="0" name="baseSalary" required /></label>
    <label>${fieldLabel(IC.calendar, "Fecha ingreso")}<input type="date" name="startDate" required /></label>
    <button class="btn btn-primary full" type="submit">${IC.userPlus} Agregar conductor</button>
  </form>`;
  const tableBody = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Telefono</th><th>Licencia</th><th>Empresa</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay conductores registrados.");
  return pcardWrap("userPlus", "Registrar conductor", null, formBody) + pcardWrap("user", "Conductores", drivers.length + " registrados", tableBody);
}

function transportTripsHtml() {
  const pendingForTrip = read(KEYS.requests, []).filter(
    (r) => [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status) && !r.trip
  );
  const trips = read(KEYS.requests, []).filter((r) => r.trip);
  const rows = trips
    .map((r) => `<tr>
      <td><strong>${r.trip.tripNumber}</strong></td>
      <td>${r.requestNumber || r.id}</td>
      <td>${r.clientName}</td>
      <td>${formatRoute(r)}<br><span class="muted">${r.cargoDescription || "-"} · $${parseNum(r.tripValue || r.insuredValue || 0).toLocaleString("es-CO")}</span></td>
      <td>${r.trip.vehiclePlate}</td>
      <td>${r.trip.driverName}<br><span class="muted">Asignado por: ${r.trip.assignedBy || r.approvedBy || "-"}</span></td>
      <td>${fmtDate(r.trip.etaPickup)}</td>
      <td>${prettyStatus(r.status, "trip")}${parseNum(r.standbyChargeTotal) > 0 ? `<br><span class="muted" style="font-size:0.78rem">Standby: $${parseNum(r.standbyChargeTotal).toLocaleString("es-CO")}</span>` : ""}</td>
      <td><div class="toolbar"><select data-action="trip-status" data-id="${r.id}" style="padding:0.4rem 0.6rem;border-radius:8px;border:1px solid var(--line);font-size:0.82rem">
        ${[STATUS.VIAJE_ASIGNADO,STATUS.EN_TRANSITO,STATUS.ESPERA_STANDBY,STATUS.COMPLETADA,STATUS.CANCELADA].map((s) => `<option ${r.status === s ? "selected" : ""}>${s}</option>`).join("")}
      </select><button class="btn btn-sm btn-action" data-action="trip-detail" data-id="${r.id}">${IC.eye} Detalle</button></div></td>
    </tr>`)
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Viaje</th><th>Solicitud</th><th>Cliente</th><th>Ruta y carga</th><th>Camion</th><th>Conductor</th><th>Hora</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay viajes asignados.");
  const createTripForm = `<form id="form-create-trip" class="p-form">
    <label class="full">Solicitud pendiente
      <select name="requestId" required>
        <option value="">Seleccione...</option>
        ${pendingForTrip.map((r) => `<option value="${r.id}" data-createdby="${r.requestedByName || "-"}" data-route="${r.originDepartment ? `${r.originDepartment}, ` : ""}${r.originCity} → ${r.destinationDepartment ? `${r.destinationDepartment}, ` : ""}${r.destinationCity}" data-company="${r.clientName || "-"}">${r.requestNumber || r.id} · ${r.clientName} · ${r.originCity} → ${r.destinationCity}</option>`).join("")}
      </select>
    </label>
    <div id="trip-request-preview" class="trip-preview full">
      <p><strong>Solicitante:</strong> <span data-preview="createdBy">-</span></p>
      <p><strong>Cliente:</strong> <span data-preview="company">-</span></p>
      <p><strong>Ruta:</strong> <span data-preview="route">-</span></p>
    </div>
    <button class="btn btn-primary full" type="submit">${IC.plus} Crear viaje desde solicitud</button>
  </form>`;
  return (pendingForTrip.length ? pcardWrap("plus", "Crear viaje", "Selecciona manualmente camion y conductor segun la carga", createTripForm) : "")
    + pcardWrap("compass", "Viajes activos", trips.length + " viajes", body);
}

function transportCalendarHtml() {
  const requests = read(KEYS.requests, [])
    .filter((r) => r.trip)
    .sort((a, b) => new Date(a.trip.etaPickup).getTime() - new Date(b.trip.etaPickup).getTime());
  const rows = requests
    .map((r) => `<tr>
      <td><strong>${new Date(r.trip.etaPickup).toLocaleDateString("es-CO")}</strong></td>
      <td>${new Date(r.trip.etaPickup).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</td>
      <td>${r.trip.driverName}</td>
      <td>${r.trip.vehiclePlate}</td>
      <td>${r.trip.route}</td>
      <td>${prettyStatus(r.status, "trip")}</td>
    </tr>`)
    .join("");
  const body = rows
    ? `<p class="muted" style="margin:0 0 0.8rem">Un conductor y un camion no se pueden asignar a dos viajes en la misma hora.</p><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Hora</th><th>Conductor</th><th>Camion</th><th>Ruta</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay programacion registrada.");
  return pcardWrap("calendar", "Calendario de programacion", requests.length + " viajes programados", body);
}

function adminUsersHtml(current) {
  const users = read(KEYS.users, []);
  const companies = read(KEYS.companies, []);
  const ui = state.adminUsersUi || { panel: "", editUserId: "" };
  const editingUser = ui.editUserId ? users.find((u) => u.id === ui.editUserId) : null;

  const companyOptions = companies
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");

  const userOptions = users
    .filter((u) => u.id !== current.id)
    .map((u) => `<option value="${u.id}">${u.name} (${u.role})</option>`)
    .join("");

  const permissionChecks = (selected = []) => ALL_PERMISSIONS.map((permission) => {
    const meta = PERMISSION_META[permission] || { title: permission, desc: "" };
    return `<label class="perm-check">
      <input type="checkbox" name="permissions" value="${permission}" ${selected.includes(permission) ? "checked" : ""} />
      <span><strong>${meta.title}</strong><small>${meta.desc}</small></span>
    </label>`;
  }).join("");

  const statusBadge = (s) => {
    if (s === ACCOUNT_STATUS.APROBADO) return `<span class="status status-viaje_asignado">Aprobado</span>`;
    if (s === ACCOUNT_STATUS.PENDIENTE) return `<span class="status status-pendiente">Pendiente</span>`;
    if (s === ACCOUNT_STATUS.RECHAZADO) return `<span class="status status-rechazada">Rechazado</span>`;
    return `<span class="status status-viaje_asignado">Aprobado</span>`;
  };

  const roleBadge = (r) => {
    const colors = { admin: "#1565C0", rrhh: "#7C3AED", client: "#0E7490" };
    return `<span class="role-chip" style="--role-color:${colors[r] || '#64748B'}">${r}</span>`;
  };

  // --- Usuarios ---
  const userCards = users.map((u) => {
    const namedPerms = (u.permissions || []).map((p) => PERMISSION_META[p]?.title || p);
    const visiblePerms = namedPerms.slice(0, 3);
    const hiddenCount = Math.max(0, namedPerms.length - visiblePerms.length);
    const permList = [
      ...visiblePerms.map((label) => `<span class="perm-tag">${label}</span>`),
      hiddenCount > 0 ? `<span class="perm-tag perm-tag-more">+${hiddenCount} mas</span>` : ""
    ].join("");
    const isMe = u.id === current.id;
    return `<div class="user-card">
      <div class="user-card-top">
        <div class="user-avatar">${u.name.charAt(0).toUpperCase()}</div>
        <div class="user-card-info">
          <h4>${u.name}${isMe ? ' <span class="muted" style="font-weight:400;font-size:0.78rem">(tu)</span>' : ""}</h4>
          <p>${u.email}</p>
        </div>
        <div class="user-card-badges">
          ${roleBadge(u.role)}
          ${statusBadge(u.accountStatus)}
        </div>
      </div>
      <div class="user-card-meta">
        <span>${IC.briefcase} ${getCompanyById(u.companyId)?.name || u.company || "Sin empresa"}</span>
        ${u.phone ? `<span>${IC.user} ${u.phone}</span>` : ""}
        ${u.city ? `<span>${IC.mapPin} ${u.city}${u.department ? `, ${u.department}` : ""}</span>` : ""}
      </div>
      ${permList ? `<div class="user-card-perms">${permList}</div>` : ""}
      ${!isMe ? `<div class="user-card-actions">
        <button class="btn btn-sm btn-action" data-action="open-edit-user" data-id="${u.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-reject" data-action="delete-user" data-id="${u.id}">${IC.trash} Eliminar</button>
      </div>` : ""}
    </div>`;
  }).join("");

  // --- Pendientes ---
  const pendingUsers = users.filter((u) => u.accountStatus === ACCOUNT_STATUS.PENDIENTE);
  const pendingCards = pendingUsers.map((u) => `<div class="user-card pending-card">
    <div class="user-card-top">
      <div class="user-avatar pending-avatar">${u.name.charAt(0).toUpperCase()}</div>
      <div class="user-card-info">
        <h4>${u.name}</h4>
        <p>${u.email}</p>
      </div>
    </div>
    <div class="user-card-meta">
      <span>${IC.briefcase} ${getCompanyById(u.companyId)?.name || u.company || "-"}</span>
      <span>${IC.file} ${(u.documentType || "Doc") + " " + (u.taxId || "-")}</span>
      ${u.phone ? `<span>${IC.user} ${u.phone}</span>` : ""}
      ${u.registeredAt ? `<span>${IC.clock} ${fmtDate(u.registeredAt)}</span>` : ""}
    </div>
    <div class="user-card-actions">
      <button class="btn btn-sm btn-approve" data-action="approve-registration" data-id="${u.id}">${IC.check} Aprobar</button>
      <button class="btn btn-sm btn-reject" data-action="reject-registration" data-id="${u.id}">${IC.x} Rechazar</button>
    </div>
  </div>`).join("");

  // --- Formularios ---
  const fUser = `<form id="form-admin-user-create" class="p-form">
    <label>Nombre <input name="name" required placeholder="Nombre completo" /></label>
    <label>Correo <input type="email" name="email" required placeholder="correo@empresa.com" /></label>
    <label>Contraseña <input type="password" name="password" minlength="6" required placeholder="Min. 6 caracteres" /></label>
    <label>Tipo documento
      <select name="documentType" required>
        <option value="CC">Cedula de ciudadania</option>
        <option value="CE">Cedula de extranjeria</option>
        <option value="NIT">NIT</option>
        <option value="PAS">Pasaporte</option>
      </select>
    </label>
    <label>Documento/NIT <input name="taxId" value="900000001-0" required /></label>
    <label>Rol
      <select name="role" required>
        <option value="${ROLES.ADMIN}">Administrador</option>
        <option value="${ROLES.RRHH}">Recursos Humanos</option>
        <option value="${ROLES.CLIENT}">Cliente</option>
      </select>
    </label>
    <label>Empresa
      <select name="companyId" required>
        <option value="">Seleccione...</option>
        ${companyOptions}
      </select>
    </label>
    <label>Telefono <input name="phone" required placeholder="+57 300 000 0000" /></label>
    <label>Ciudad <input name="city" required placeholder="Ciudad principal" /></label>
    <label>Departamento <input name="department" required placeholder="Ej: Antioquia" /></label>
    <label>Direccion <input name="address" required placeholder="Direccion principal" /></label>
    <label>Nombre comercial <input name="company" value="Antares" /></label>
    <fieldset class="full perm-fieldset">
      <legend>Permisos del usuario</legend>
      <div class="perm-grid">${permissionChecks([...ALL_PERMISSIONS])}</div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.userPlus} Crear usuario</button>
  </form>`;

  const fComp = `<form id="form-admin-company-create" class="p-form">
    <label>Nombre empresa <input name="name" required placeholder="Nombre de la empresa" /></label>
    <label>NIT/RUT <input name="taxId" required placeholder="000.000.000-0" /></label>
    <label>Telefono <input name="phone" required placeholder="+57 300 000 0000" /></label>
    <button class="btn btn-primary full" type="submit">${IC.plus} Registrar empresa</button>
  </form>`;

  const fPerm = `<form id="form-admin-user-permissions" class="p-form">
    <label class="full">Seleccionar usuario
      <select name="userId" required>
        <option value="">Seleccione un usuario...</option>
        ${userOptions}
      </select>
    </label>
    <fieldset class="full perm-fieldset">
      <legend>Permisos a asignar</legend>
      <div class="perm-grid">${permissionChecks([])}</div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.save} Guardar permisos</button>
  </form>`;

  const fEdit = editingUser ? `<form id="form-admin-user-edit" class="p-form">
    <input type="hidden" name="id" value="${editingUser.id}" />
    <label>Nombre <input name="name" value="${editingUser.name || ""}" required /></label>
    <label>Correo <input type="email" name="email" value="${editingUser.email || ""}" required /></label>
    <label>Contraseña <input type="password" name="password" placeholder="Dejar vacio para conservar" /></label>
    <label>Tipo documento
      <select name="documentType" required>
        <option value="CC" ${editingUser.documentType === "CC" ? "selected" : ""}>Cedula de ciudadania</option>
        <option value="CE" ${editingUser.documentType === "CE" ? "selected" : ""}>Cedula de extranjeria</option>
        <option value="NIT" ${editingUser.documentType === "NIT" ? "selected" : ""}>NIT</option>
        <option value="PAS" ${editingUser.documentType === "PAS" ? "selected" : ""}>Pasaporte</option>
      </select>
    </label>
    <label>Rol
      <select name="role" required>
        <option value="${ROLES.ADMIN}" ${editingUser.role === ROLES.ADMIN ? "selected" : ""}>Administrador</option>
        <option value="${ROLES.RRHH}" ${editingUser.role === ROLES.RRHH ? "selected" : ""}>Recursos Humanos</option>
        <option value="${ROLES.CLIENT}" ${editingUser.role === ROLES.CLIENT ? "selected" : ""}>Cliente</option>
      </select>
    </label>
    <label>Empresa
      <input value="${getCompanyById(editingUser.companyId)?.name || editingUser.company || "-"}" disabled />
      <input type="hidden" name="companyId" value="${editingUser.companyId || ""}" />
    </label>
    <label>Telefono <input name="phone" value="${editingUser.phone || ""}" /></label>
    <label>Ciudad <input name="city" value="${editingUser.city || ""}" /></label>
    <label>Departamento <input name="department" value="${editingUser.department || ""}" /></label>
    <label>Direccion <input name="address" value="${editingUser.address || ""}" /></label>
    <label>Nombre comercial <input name="company" value="${editingUser.company || ""}" /></label>
    <label>NIT/RUT <input name="taxId" value="${editingUser.taxId || ""}" /></label>
    <fieldset class="full perm-fieldset">
      <legend>Permisos granulares</legend>
      <div class="perm-grid">${permissionChecks(editingUser.permissions || [])}</div>
    </fieldset>
    <div class="toolbar full">
      <button class="btn btn-primary" type="submit">${IC.save} Guardar cambios</button>
      <button class="btn btn-action" type="button" data-action="close-edit-user">${IC.x} Cancelar</button>
    </div>
  </form>` : "";

  // --- Empresas tabla ---
  const companyRows = companies.map((c) => `<div class="company-chip">
    <strong>${c.name}</strong>
    <span class="muted">${c.taxId || ""} · ${c.phone || ""}</span>
  </div>`).join("");

  // --- Render ---
  let html = "";
  const adminCount = users.filter((u) => u.role === ROLES.ADMIN).length;
  const rrhhCount = users.filter((u) => u.role === ROLES.RRHH).length;
  const clientCount = users.filter((u) => u.role === ROLES.CLIENT).length;
  const approvedCount = users.filter((u) => u.accountStatus === ACCOUNT_STATUS.APROBADO).length;

  html += `<div class="users-hero">
    <div class="users-hero-item">
      <span>Total usuarios</span><strong>${users.length}</strong>
    </div>
    <div class="users-hero-item">
      <span>Admins</span><strong>${adminCount}</strong>
    </div>
    <div class="users-hero-item">
      <span>RRHH</span><strong>${rrhhCount}</strong>
    </div>
    <div class="users-hero-item">
      <span>Clientes</span><strong>${clientCount}</strong>
    </div>
    <div class="users-hero-item">
      <span>Aprobados</span><strong>${approvedCount}</strong>
    </div>
  </div>`;

  if (pendingUsers.length > 0) {
    html += pcardWrap("bell", "Solicitudes pendientes (" + pendingUsers.length + ")", "Estos clientes necesitan aprobacion para acceder", `<div class="user-grid user-grid-pending">${pendingCards}</div>`, "p-card-alert");
  }

  html += pcardWrap("shield", "Usuarios del sistema", users.length + " registrados", userCards ? `<div class="user-grid user-grid-main">${userCards}</div>` : emptyState("Sin usuarios registrados."));
  html += `<div class="toolbar users-actions">
    <button class="btn btn-action users-action-btn" data-action="toggle-admin-panel" data-panel="create-user">${IC.userPlus} Nuevo usuario</button>
    <button class="btn btn-action users-action-btn" data-action="toggle-admin-panel" data-panel="create-company">${IC.plus} Nueva empresa</button>
    <button class="btn btn-action users-action-btn" data-action="toggle-admin-panel" data-panel="set-permissions">${IC.save} Asignar permisos</button>
  </div>`;

  if (ui.panel === "create-user") html += pcardWrap("userPlus", "Crear nuevo usuario", "Completa los datos y permisos", fUser);
  if (ui.panel === "create-company") html += pcardWrap("plus", "Registrar empresa", "Agregar nueva empresa al sistema", fComp);
  if (ui.panel === "set-permissions") html += pcardWrap("save", "Asignar permisos", "Selecciona usuario y permisos", fPerm);
  if (editingUser) html += pcardWrap("edit", "Editar usuario", `Actualiza los datos de ${editingUser.name}`, fEdit);

  if (companies.length > 0) {
    html += pcardWrap("briefcase", "Empresas registradas", companies.length + " empresas", `<div class="company-grid">${companyRows}</div>`);
  }

  return html;
}

function historyHtml() {
  const requests = read(KEYS.requests, []);
  const users = read(KEYS.users, []);
  const options = users
    .filter((u) => u.role === ROLES.CLIENT)
    .map((u) => `<option value="${u.id}">${u.company}</option>`)
    .join("");
  const rows = requests
    .map((r) => `<tr>
      <td>${fmtDate(r.createdAt)}</td>
      <td><strong>${r.requestNumber || r.id}</strong></td>
      <td>${r.clientName}</td>
      <td>${r.vehicleType}</td>
      <td>${prettyStatus(r.status)}</td>
      <td>${r.trip?.tripNumber || '<span class="muted">-</span>'}</td>
    </tr>`)
    .join("");

  const filterBody = `<form id="history-filter" class="p-form">
    <label>Desde <input type="date" name="from" /></label>
    <label>Hasta <input type="date" name="to" /></label>
    <label>Cliente <select name="client"><option value="">Todos</option>${options}</select></label>
    <label>Estado <select name="status"><option value="">Todos</option>${Object.values(STATUS).map((s) => `<option>${s}</option>`).join("")}</select></label>
    <button class="btn btn-primary full" type="submit">${IC.filter} Aplicar filtro</button>
  </form>`;
  const tableBody = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Solicitud</th><th>Cliente</th><th>Vehiculo</th><th>Estado</th><th>Viaje</th></tr></thead><tbody id="history-body">${rows}</tbody></table></div>`
    : emptyState("Sin registros.");
  const reportBody = `<div class="dash-grid" style="margin-top:1rem">
    ${pcardWrap("user", "Clientes mas activos", null, `<p>${topClients(requests).join(", ") || "Sin datos"}</p>`)}
    ${pcardWrap("truck", "Vehiculos mas usados", null, `<p>${topVehicles(requests).join(", ") || "Sin datos"}</p>`)}
  </div>`;
  return pcardWrap("filter", "Filtros", null, filterBody) + pcardWrap("clock", "Historial de viajes", requests.length + " registros", tableBody) + reportBody;
}

function topClients(requests) {
  const acc = {};
  requests.forEach((r) => {
    acc[r.clientName] = (acc[r.clientName] || 0) + 1;
  });
  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty})`);
}

function topVehicles(requests) {
  const acc = {};
  requests.forEach((r) => {
    acc[r.vehicleType] = (acc[r.vehicleType] || 0) + 1;
  });
  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty})`);
}

function payrollHtml() {
  const employees = read(KEYS.payrollEmployees, []);
  const companies = read(KEYS.companies, []);
  const companyOptions = companies.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  const runs = read(KEYS.payrollRuns, []);
  const pending = runs.filter((r) => !r.paid).length;
  const employeeRows = employees
    .map((e) => `<tr>
      <td><strong>${e.name}</strong><br><span class="muted">${e.workerRole === "conductor" ? "Conductor" : "Empleado"}</span></td><td>${e.idDoc}</td><td>${e.position}</td><td>${e.contractType}</td><td>${getCompanyById(e.companyId)?.name || "-"}</td><td>$${parseNum(e.baseSalary).toLocaleString("es-CO")}</td><td>${fmtDate(e.startDate)}</td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-action" data-action="edit-employee" data-id="${e.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-reject" data-action="delete-employee" data-id="${e.id}">${IC.trash} Eliminar</button>
      </div></td>
    </tr>`)
    .join("");
  const runRows = runs
    .map((r) => `<tr>
      <td>${r.month}</td><td>${r.employeeName}</td><td>$${parseNum(r.gross).toLocaleString("es-CO")}</td><td>$${parseNum(r.deductions).toLocaleString("es-CO")}</td><td>$${parseNum(r.net).toLocaleString("es-CO")}</td>
      <td>${r.paid ? '<span class="status status-viaje_asignado">Pagado</span>' : '<span class="status status-pendiente">Pendiente</span>'}</td>
      <td><button class="btn btn-sm btn-action" data-action="payslip" data-id="${r.id}">${IC.printer} Desprendible</button></td>
    </tr>`)
    .join("");

  const formEmp = `<form id="form-employee" class="p-form">
    <label>${fieldLabel(IC.user, "Nombre")}<input name="name" required /></label>
    <label>${fieldLabel(IC.file, "Tipo documento")}
      <select name="documentType" required>
        <option value="CC">Cedula de ciudadania</option>
        <option value="CE">Cedula de extranjeria</option>
        <option value="PAS">Pasaporte</option>
      </select>
    </label>
    <label>${fieldLabel(IC.file, "No. documento")}<input name="idDoc" required /></label>
    <label>${fieldLabel(IC.briefcase, "Cargo")}<input name="position" required /></label>
    <label>${fieldLabel(IC.activity, "Tipo contrato")}<input name="contractType" required /></label>
    <label>${fieldLabel(IC.mapPin, "Ciudad")}<input name="city" required /></label>
    <label>${fieldLabel(IC.mapPin, "Direccion")}<input name="address" required /></label>
    <label>${fieldLabel(IC.phone, "Telefono")}<input name="phone" required /></label>
    <label>${fieldLabel(IC.user, "Contacto emergencia")}<input name="emergencyContact" required /></label>
    <label>${fieldLabel(IC.phone, "Telefono emergencia")}<input name="emergencyPhone" required /></label>
    <label>${fieldLabel(IC.briefcase, "Empresa")}<select name="companyId" required><option value="">Seleccione</option>${companyOptions}</select></label>
    <label>${fieldLabel(IC.dollar, "Salario base")}<input type="number" name="baseSalary" required /></label>
    <label>${fieldLabel(IC.calendar, "Fecha ingreso")}<input type="date" name="startDate" required /></label>
    <button class="btn btn-primary full" type="submit">${IC.save} Guardar empleado</button>
  </form>`;
  const formPay = `<form id="form-payroll" class="p-form">
    <label>Empleado <select name="employeeId" required><option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name} · ${e.workerRole === "conductor" ? "Conductor" : "Empleado"}</option>`).join("")}</select></label>
    <label>Mes <input type="month" name="month" required /></label>
    <label>Horas extras <input type="number" name="extras" value="0" /></label>
    <label>Aux transporte <input type="number" name="aux" value="0" /></label>
    <label>Bonificaciones <input type="number" name="bonus" value="0" /></label>
    <p class="muted full">Deducciones automaticas Colombia: Salud 4%, Pension 4% y Fondo de Solidaridad 1% para IBC superior a 4 SMMLV.</p>
    <button class="btn btn-primary full" type="submit">${IC.dollar} Generar liquidacion</button>
  </form>`;
  const empTable = employeeRows
    ? `<div class="table-wrap"><table><thead><tr><th>Nombre/Rol</th><th>Cedula</th><th>Cargo</th><th>Contrato</th><th>Empresa</th><th>Base</th><th>Ingreso</th><th>Acciones</th></tr></thead><tbody>${employeeRows}</tbody></table></div>`
    : emptyState("No hay empleados registrados.");
  const runTable = runRows
    ? `<div style="margin-bottom:0.8rem"><button id="export-payroll" class="btn btn-sm btn-action">${IC.download} Exportar CSV</button></div><div class="table-wrap"><table><thead><tr><th>Mes</th><th>Empleado</th><th>Devengado</th><th>Deducciones</th><th>Neto</th><th>Estado</th><th></th></tr></thead><tbody>${runRows}</tbody></table></div>`
    : emptyState("Sin liquidaciones registradas.");
  return `<div class="dash-grid">${pcardWrap("userPlus", "Registro empleado", null, formEmp)}${pcardWrap("dollar", "Liquidacion mensual", null, formPay)}</div>`
    + pcardWrap("user", "Empleados", employees.length + " registrados" + (pending > 0 ? ` · ${pending} pagos pendientes` : ""), empTable)
    + pcardWrap("clock", "Historial de pagos", runs.length + " liquidaciones", runTable);
}

function hiringHtml() {
  const vacancies = read(KEYS.vacancies, []);
  const candidates = read(KEYS.candidates, []);
  const interviews = read(KEYS.interviews, []);
  const contracts = read(KEYS.contracts, []);
  const employees = read(KEYS.payrollEmployees, []);
  const companies = read(KEYS.companies, []);
  const companyOptions = companies.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");

  const vacRows = vacancies.map((v) => `<tr><td><strong>${v.title}</strong></td><td>$${parseNum(v.salaryOffer).toLocaleString("es-CO")}</td><td>${v.deadline}</td><td>${v.status === "Publicada" ? '<span class="status status-viaje_asignado">Publicada</span>' : '<span class="status status-rechazada">Cerrada</span>'}</td><td><button class="btn btn-sm btn-action" data-action="close-vacancy" data-id="${v.id}">${IC.x} Cerrar</button></td></tr>`).join("");
  const candRows = candidates.map((c) => `<tr><td><strong>${c.name}</strong></td><td>${c.email}</td><td>${c.vacancyTitle}</td><td><span class="status status-en_transito">${c.status}</span></td><td><select data-action="candidate-status" data-id="${c.id}" style="padding:0.4rem;border-radius:8px;border:1px solid var(--line);font-size:0.82rem">${PIPELINE.map((p) => `<option ${c.status === p ? "selected" : ""}>${p}</option>`).join("")}</select></td></tr>`).join("");
  const interviewRows = interviews.map((i) => `<tr><td><strong>${i.candidateName}</strong></td><td>${i.when}</td><td>${i.interviewer}</td></tr>`).join("");
  const contractRows = contracts.map((c) => `<tr><td><strong>${c.candidateName || c.employeeName || "-"}</strong></td><td>${c.position}</td><td>${c.source || "Candidato"}</td><td>${fmtDate(c.createdAt)}</td><td><button class="btn btn-sm btn-action" data-action="view-contract" data-id="${c.id}">${IC.eye} Ver</button></td></tr>`).join("");

  const fVac = `<form id="form-vacancy" class="p-form"><label>Cargo <input name="title" required /></label><label>Requisitos <input name="requirements" required /></label><label>Salario ofrecido <input type="number" name="salaryOffer" required /></label><label>Fecha limite <input type="date" name="deadline" required /></label><button class="btn btn-primary full" type="submit">${IC.plus} Publicar vacante</button></form>`;
  const fCand = `<form id="form-candidate" class="p-form"><label>Nombre <input name="name" required /></label><label>Correo <input type="email" name="email" required /></label><label>Telefono <input name="phone" required /></label><label>Tipo documento <select name="documentType" required><option value="CC">CC</option><option value="CE">CE</option><option value="PAS">PAS</option></select></label><label>No. documento <input name="idDoc" required /></label><label>Ciudad <input name="city" required /></label><label>Direccion <input name="address" required /></label><label>Vacante <select name="vacancyId" required><option value="">Seleccione</option>${vacancies.filter((v) => v.status === "Publicada").map((v) => `<option value="${v.id}">${v.title}</option>`).join("")}</select></label><label class="full">Adjunto hoja vida <input type="file" name="attachments" multiple /></label><button class="btn btn-primary full" type="submit">${IC.userPlus} Registrar candidato</button></form>`;
  const fInt = `<form id="form-interview" class="p-form"><label>Candidato <select name="candidateId" required><option value="">Seleccione</option>${candidates.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></label><label>Fecha y hora <input type="datetime-local" name="when" required /></label><label>Entrevistador <input name="interviewer" required /></label><button class="btn btn-primary full" type="submit">${IC.calendar} Guardar entrevista</button></form>`;
  const fCon = `<form id="form-contract" class="p-form"><label>Candidato contratado <select name="candidateId" required><option value="">Seleccione</option>${candidates.filter((c) => c.status === "Contratado").map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></label><label>Rol contratado <select name="workerRole" required><option value="empleado">Empleado</option><option value="conductor">Conductor</option></select></label><label>Cargo <input name="position" required /></label><label>Empresa <select name="companyId" required><option value="">Seleccione</option>${companyOptions}</select></label><label>Salario <input type="number" name="salary" required /></label><label>Tipo contrato <input name="contractType" required placeholder="Termino indefinido/fijo/obra" /></label><label>Inicio <input type="date" name="startDate" required /></label><label>Licencia (si rol conductor) <input name="license" placeholder="C2/C3" /></label><label>Categoria licencia <input name="licenseCategory" placeholder="C2/C3" /></label><label>Vence licencia <input type="date" name="licenseExpiry" /></label><button class="btn btn-primary full" type="submit">${IC.file} Generar contrato</button></form>`;
  const fEmpCon = `<form id="form-employee-contract" class="p-form"><label>Empleado <select name="employeeId" required><option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name} - ${e.position}</option>`).join("")}</select></label><label>Salario acordado <input type="number" name="salary" required /></label><label>Fecha de inicio <input type="date" name="startDate" required /></label><label>Tipo de contrato <input name="contractType" required /></label><button class="btn btn-primary full" type="submit">${IC.printer} Crear contrato PDF</button></form>`;

  const tVac = vacRows ? `<div class="table-wrap"><table><thead><tr><th>Cargo</th><th>Salario</th><th>Limite</th><th>Estado</th><th></th></tr></thead><tbody>${vacRows}</tbody></table></div>` : emptyState("Sin vacantes");
  const tCand = candRows ? `<div class="table-wrap"><table><thead><tr><th>Candidato</th><th>Correo</th><th>Vacante</th><th>Estado</th><th>Cambiar</th></tr></thead><tbody>${candRows}</tbody></table></div>` : emptyState("Sin candidatos");
  const tInt = interviewRows ? `<div class="table-wrap"><table><thead><tr><th>Candidato</th><th>Fecha</th><th>Entrevistador</th></tr></thead><tbody>${interviewRows}</tbody></table></div>` : emptyState("Sin entrevistas");
  const tCon = contractRows ? `<div class="table-wrap"><table><thead><tr><th>Persona</th><th>Cargo</th><th>Origen</th><th>Fecha</th><th></th></tr></thead><tbody>${contractRows}</tbody></table></div>` : emptyState("Sin contratos");

  return `<div class="dash-grid">${pcardWrap("plus", "Nueva vacante", null, fVac)}${pcardWrap("userPlus", "Registrar candidato", null, fCand)}</div>`
    + pcardWrap("briefcase", "Vacantes", vacancies.length + " registradas", tVac)
    + pcardWrap("activity", "Pipeline de candidatos", candidates.length + " candidatos", tCand)
    + `<div class="dash-grid">${pcardWrap("calendar", "Programar entrevista", null, fInt)}${pcardWrap("file", "Generar contrato", null, fCon)}</div>`
    + pcardWrap("printer", "Contrato desde nomina", null, fEmpCon)
    + pcardWrap("calendar", "Entrevistas", interviews.length + " programadas", tInt)
    + pcardWrap("file", "Contratos generados", contracts.length + " contratos", tCon);
}

function notificationsHtml() {
  const user = currentUser();
  const list = read(KEYS.notifications, []).filter((n) => n.userId === user.id || user.role === ROLES.ADMIN);
  const rows = list
    .map((n) => `<tr>
      <td>${fmtDate(n.createdAt)}</td>
      <td><strong>${n.title}</strong></td>
      <td>${n.body}</td>
      <td>${n.readAt ? '<span class="status status-completada">Leida</span>' : '<span class="status status-pendiente">Nueva</span>'}</td>
    </tr>`)
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Titulo</th><th>Mensaje</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No tienes notificaciones.");
  return pcardWrap("bell", "Notificaciones", list.length + " notificaciones", body);
}

function profileHtml(user) {
  const companyName = getCompanyById(user.companyId)?.name || user.company || "-";
  const body = `<form id="form-profile" class="p-form">
    <label>Nombre <input name="name" value="${user.name || ""}" required /></label>
    <label>Correo <input type="email" value="${user.email || ""}" disabled /></label>
    <label>Telefono <input name="phone" value="${user.phone || ""}" /></label>
    <label>Empresa
      <input value="${companyName}" disabled />
      <input type="hidden" name="companyId" value="${user.companyId || ""}" />
    </label>
    <label>NIT/RUT <input name="taxId" value="${user.taxId || ""}" /></label>
    <label class="full">Foto (URL)
      <input name="avatarUrl" placeholder="https://..." value="${user.avatarUrl || ""}" />
    </label>
    <label class="full">Subir foto
      <input type="file" name="avatarFile" accept="image/*" />
    </label>
    <button class="btn btn-primary full" type="submit">${IC.save} Guardar perfil</button>
  </form>`;
  const preview = `<div class="user-card" style="max-width:280px">
      <div class="user-card-top">
        <div class="user-avatar" style="${user.avatarUrl ? `background-image:url('${user.avatarUrl}');background-size:cover;background-position:center;color:transparent;` : ""}">
          ${user.avatarUrl ? "." : (user.name || "U").charAt(0).toUpperCase()}
        </div>
        <div class="user-card-info"><h4>${user.name}</h4><p>${user.role}</p></div>
      </div>
    </div>`;
  return `<div class="dash-grid">${pcardWrap("user", "Mi perfil", "Actualiza tu informacion personal", body)}${pcardWrap("eye", "Vista previa", null, preview)}</div>`;
}

function authorizationsHtml() {
  const approvals = read(KEYS.approvals, []);
  const pending = approvals.filter((a) => a.status === "pendiente");
  const rows = pending.map((a) => `<tr>
    <td><strong>${a.title}</strong></td>
    <td>${a.type}</td>
    <td>${a.requestedByName}</td>
    <td>${fmtDate(a.requestedAt)}</td>
    <td><div class="toolbar">
      <button class="btn btn-sm btn-approve" data-action="approval-approve" data-id="${a.id}">${IC.check} Aprobar</button>
      <button class="btn btn-sm btn-reject" data-action="approval-reject" data-id="${a.id}">${IC.x} Rechazar</button>
    </div></td>
  </tr>`).join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Titulo</th><th>Tipo</th><th>Solicitante</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay autorizaciones pendientes.");
  return pcardWrap("shield", "Autorizaciones", `${pending.length} pendientes`, body);
}

function renderPortalView() {
  updateAutoApprove();
  renderKpis();

  const user = currentUser();
  const view = state.currentView;
  const titles = {
    dashboard: "Dashboard",
    requests: "Solicitudes",
    "transport-requests": "Transporte · Solicitudes",
    "transport-trips": "Transporte · Viajes",
    "transport-vehicles": "Transporte · Camiones",
    "transport-drivers": "Transporte · Conductores",
    "transport-calendar": "Transporte · Calendario",
    history: "Transporte · Historial y reportes",
    payroll: "Nomina",
    hiring: "Contratacion",
    "admin-users": "Administración · Usuarios y permisos",
    authorizations: "Autorizaciones",
    profile: "Mi perfil",
    notifications: "Notificaciones"
  };
  nodes.viewTitle.textContent = titles[view] || "Dashboard";

  if (!isViewAllowedForUser(user, view)) {
    nodes.viewRoot.innerHTML = pcardWrap("shield", "Acceso restringido", null, emptyState("No tienes autorizacion para este modulo."));
  } else if (view === "dashboard") {
    nodes.viewRoot.innerHTML = viewDashboard();
  } else if (view === "requests" && (user.role === ROLES.CLIENT || user.role === ROLES.ADMIN)) {
    nodes.viewRoot.innerHTML = `${requestFormHtml()}${requestListClientHtml(user)}`;
  } else if (view === "transport-requests" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = adminQueueHtml();
  } else if (view === "transport-trips" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = transportTripsHtml();
  } else if (view === "transport-vehicles" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = vehiclesHtml();
  } else if (view === "transport-drivers" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = driversHtml();
  } else if (view === "transport-calendar" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = transportCalendarHtml();
  } else if (view === "history" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = historyHtml();
  } else if (view === "payroll" && canAccessRRHH(user.role)) {
    nodes.viewRoot.innerHTML = payrollHtml();
  } else if (view === "hiring" && canAccessRRHH(user.role)) {
    nodes.viewRoot.innerHTML = hiringHtml();
  } else if (view === "admin-users" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = adminUsersHtml(user);
  } else if (view === "authorizations" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = authorizationsHtml();
  } else if (view === "profile") {
    nodes.viewRoot.innerHTML = profileHtml(user);
  } else if (view === "notifications") {
    nodes.viewRoot.innerHTML = notificationsHtml();
  } else {
    nodes.viewRoot.innerHTML = pcardWrap("shield", "Acceso restringido", null, emptyState("No tienes autorizacion para esta vista."));
  }

  bindDynamicEvents();
  applyFormWizards();
  applyModuleMicroAnimations();
}

function bindDynamicEvents() {
  nodes.viewRoot.querySelectorAll("[data-action='toggle-admin-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = String(btn.dataset.panel || "");
      const currentPanel = state.adminUsersUi?.panel || "";
      state.adminUsersUi = {
        panel: currentPanel === panel ? "" : panel,
        editUserId: ""
      };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='open-edit-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      if (!id) return;
      state.adminUsersUi = { panel: "", editUserId: id };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='close-edit-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  });

  const adminUserCreate = document.getElementById("form-admin-user-create");
  if (adminUserCreate) {
    adminUserCreate.addEventListener("submit", async (event) => {
      event.preventDefault();
      const actor = currentUser();
      const data = Object.fromEntries(new FormData(adminUserCreate).entries());
      const permissions = [...adminUserCreate.querySelectorAll("input[name='permissions']:checked")].map(
        (input) => input.value
      );
      const users = read(KEYS.users, []);
      if (users.some((item) => normalizeEmail(item.email) === normalizeEmail(data.email))) {
        alert("Ya existe un usuario con ese correo.");
        return;
      }
      const docValidation = validateColombianDocument(data.documentType, data.taxId);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.taxId = docValidation.normalized;
      const company = getCompanyById(data.companyId);
      if (!company) {
        alert("Debes seleccionar una empresa válida.");
        return;
      }
      if (actor?.role !== ROLES.ADMIN) {
        queueApproval({
          type: "create_user",
          title: `Creacion de usuario ${data.name}`,
          payload: { ...data, companyName: company.name, permissions },
          requestedByUserId: actor?.id || "",
          requestedByName: actor?.name || "Usuario"
        });
        alert("Solicitud enviada a autorizaciones para aprobacion del administrador.");
        renderPortalView();
        return;
      }
      users.push({
        id: uid(),
        name: data.name,
        email: normalizeEmail(data.email),
        password: await hashPassword(data.password),
        role: data.role,
        documentType: data.documentType,
        accountStatus: ACCOUNT_STATUS.APROBADO,
        personType: data.personType || "Natural",
        documentIssuedAt: data.documentIssuedAt || "",
        company: data.company || company.name,
        companyId: company.id,
        taxId: data.taxId,
        phone: data.phone,
        city: data.city,
        department: data.department,
        address: data.address,
        permissions:
          data.role === ROLES.ADMIN
            ? [...ALL_PERMISSIONS]
            : permissions.length
              ? permissions
              : defaultPermissionsForRole(data.role)
      });
      write(KEYS.users, users);
      alert("Usuario creado correctamente.");
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  }

  const adminCompanyCreate = document.getElementById("form-admin-company-create");
  if (adminCompanyCreate) {
    adminCompanyCreate.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(adminCompanyCreate).entries());
      const companies = read(KEYS.companies, []);
      if (
        companies.some(
          (company) => company.name.toLowerCase() === String(data.name).toLowerCase()
        )
      ) {
        alert("La empresa ya existe.");
        return;
      }
      companies.push({
        id: uid(),
        name: data.name,
        taxId: data.taxId,
        phone: data.phone,
        createdAt: nowIso()
      });
      write(KEYS.companies, companies);
      alert("Empresa creada correctamente.");
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  }

  const adminUserPermissions = document.getElementById("form-admin-user-permissions");
  if (adminUserPermissions) {
    adminUserPermissions.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(adminUserPermissions);
      const userId = String(form.get("userId") || "");
      if (!userId) {
        alert("Selecciona un usuario.");
        return;
      }
      const permissions = [...adminUserPermissions.querySelectorAll("input[name='permissions']:checked")].map(
        (input) => input.value
      );
      const users = read(KEYS.users, []);
      write(
        KEYS.users,
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                permissions:
                  user.role === ROLES.ADMIN
                    ? [...ALL_PERMISSIONS]
                    : permissions.filter((permission) => ALL_PERMISSIONS.includes(permission))
              }
            : user
        )
      );
      if (state.session?.userId === userId) {
        const refreshed = read(KEYS.users, []).find((item) => item.id === userId);
        if (refreshed && !hasPermission(refreshed, PERMISSIONS.USERS_MANAGE)) {
          alert("Tus permisos cambiaron. Se cerrará la sesión por seguridad.");
          clearSession();
          renderPortal();
          return;
        }
      }
      alert("Permisos actualizados.");
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  }

  const adminUserEdit = document.getElementById("form-admin-user-edit");
  if (adminUserEdit) {
    adminUserEdit.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(adminUserEdit).entries());
      const userId = String(data.id || "");
      if (!userId) return;
      const users = read(KEYS.users, []);
      const existing = users.find((u) => u.id === userId);
      if (!existing) {
        alert("Usuario no encontrado.");
        return;
      }
      const duplicated = users.some((u) => u.id !== userId && normalizeEmail(u.email) === normalizeEmail(data.email));
      if (duplicated) {
        alert("Ya existe otro usuario con ese correo.");
        return;
      }
      const docValidation = validateColombianDocument(data.documentType, data.taxId);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.taxId = docValidation.normalized;
      const company = getCompanyById(String(data.companyId || ""));
      if (!company) {
        alert("Debes seleccionar una empresa valida.");
        return;
      }
      const permissions = [...adminUserEdit.querySelectorAll("input[name='permissions']:checked")].map((input) => input.value);
      const nextPassword = String(data.password || "").trim()
        ? await hashPassword(String(data.password || "").trim())
        : existing.password;
      write(
        KEYS.users,
        users.map((u) =>
          u.id === userId
            ? {
                ...u,
                name: String(data.name || "").trim(),
                email: normalizeEmail(data.email),
                password: nextPassword,
                role: String(data.role || u.role),
                documentType: String(data.documentType || u.documentType || "CC"),
                personType: String(data.personType || u.personType || "Natural"),
                documentIssuedAt: String(data.documentIssuedAt || u.documentIssuedAt || ""),
                companyId: company.id,
                company: String(data.company || company.name).trim(),
                taxId: String(data.taxId || "").trim(),
                phone: String(data.phone || "").trim(),
                city: String(data.city || "").trim(),
                department: String(data.department || u.department || "").trim(),
                address: String(data.address || u.address || "").trim(),
                permissions:
                  String(data.role || u.role) === ROLES.ADMIN
                    ? [...ALL_PERMISSIONS]
                    : permissions.length
                      ? permissions.filter((p) => ALL_PERMISSIONS.includes(p))
                      : defaultPermissionsForRole(String(data.role || u.role))
              }
            : u
        )
      );
      alert("Usuario actualizado correctamente.");
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='approve-registration']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.id;
      if (!userId) return;
      const users = read(KEYS.users, []);
      const target = users.find((u) => u.id === userId);
      if (!target) return;
      const companies = read(KEYS.companies, []);
      if (!companies.length) {
        notify("No hay empresas registradas para asociar al usuario.", "error");
        return;
      }
      openEditModal({
        title: "Aprobar usuario y asociar empresa",
        subtitle: `${target.name} · ${target.email}`,
        submitText: "Aprobar cuenta",
        fields: [
          {
            name: "companyId",
            label: "Empresa a asociar",
            type: "select",
            required: true,
            value: target.companyId || "",
            options: companies.map((c) => ({ value: c.id, label: `${c.name} (${c.taxId || "Sin NIT"})` }))
          }
        ],
        onSubmit: (form) => {
          const selected = getCompanyById(String(form.companyId || ""));
          if (!selected) {
            notify("Debes seleccionar una empresa valida.", "error");
            return false;
          }
          write(
            KEYS.users,
            users.map((u) =>
              u.id === userId
                ? {
                    ...u,
                    accountStatus: ACCOUNT_STATUS.APROBADO,
                    companyId: selected.id,
                    company: selected.name
                  }
                : u
            )
          );
          saveNotification({
            userId: target.id,
            title: "Cuenta aprobada",
            body: `Tu cuenta ha sido aprobada y asociada a ${selected.name}. Ya puedes iniciar sesion.`
          });
          sendEmail({
            to: target.email,
            subject: "Cuenta aprobada - Antares Portal",
            body: `Hola ${target.name}, tu cuenta fue aprobada y asociada a ${selected.name}. Ya puedes iniciar sesion en el portal.`
          });
          notify(`Cuenta de ${target.name} aprobada exitosamente.`, "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='reject-registration']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.id;
      if (!userId) return;
      const reason = prompt("Motivo del rechazo:");
      if (!reason) return;
      const users = read(KEYS.users, []);
      const target = users.find((u) => u.id === userId);
      if (!target) return;
      write(
        KEYS.users,
        users.map((u) => u.id === userId ? { ...u, accountStatus: ACCOUNT_STATUS.RECHAZADO, rejectionReason: reason } : u)
      );
      saveNotification({
        userId: target.id,
        title: "Registro rechazado",
        body: `Tu solicitud de registro fue rechazada. Motivo: ${reason}`
      });
      sendEmail({
        to: target.email,
        subject: "Registro rechazado - Antares Portal",
        body: `Hola ${target.name}, tu solicitud de registro fue rechazada. Motivo: ${reason}. Contacta a soporte para mas informacion.`
      });
      alert(`Registro de ${target.name} rechazado.`);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.id;
      if (!userId) return;
      if (state.session?.userId === userId) {
        notify("No puedes eliminar tu propio usuario.", "error");
        return;
      }
      openConfirmModal({
        title: "Eliminar usuario",
        message: "Esta accion eliminara el usuario de forma permanente.",
        confirmText: "Eliminar",
        onConfirm: () => {
          write(
            KEYS.users,
            read(KEYS.users, []).filter((user) => user.id !== userId)
          );
          notify("Usuario eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });

  const requestForm = document.getElementById("form-request");
  if (requestForm) {
    const originDepartment = requestForm.querySelector("#origin-department");
    const originCity = requestForm.querySelector("#origin-city");
    const destinationDepartment = requestForm.querySelector("#destination-department");
    const destinationCity = requestForm.querySelector("#destination-city");
    const pickupDate = requestForm.querySelector("#pickup-date");
    const pickupTime = requestForm.querySelector("#pickup-time");
    const deliveryDate = requestForm.querySelector("#delivery-date");
    const deliveryTime = requestForm.querySelector("#delivery-time");

    const fillCityOptions = (departmentSelect, citySelect) => {
      const department = String(departmentSelect?.value || "");
      const cities = COLOMBIA_LOCATIONS[department] || [];
      citySelect.innerHTML = `<option value="">Seleccione...</option>${cities
        .map((c) => `<option value="${c}">${c}</option>`)
        .join("")}`;
    };

    if (originDepartment && originCity) {
      originDepartment.addEventListener("change", () => fillCityOptions(originDepartment, originCity));
    }
    if (destinationDepartment && destinationCity) {
      destinationDepartment.addEventListener("change", () => fillCityOptions(destinationDepartment, destinationCity));
    }
    if (pickupDate) {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      pickupDate.min = today;
      if (deliveryDate) deliveryDate.min = today;
    }

    requestForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const user = currentUser();
      const data = Object.fromEntries(new FormData(requestForm).entries());
      const pickupDateValue = String(data.pickupDate || "");
      const pickupTimeValue = String(data.pickupTime || "");
      const deliveryDateValue = String(data.deliveryDate || "");
      const deliveryTimeValue = String(data.deliveryTime || "");
      if (!pickupDateValue || !pickupTimeValue || !deliveryDateValue || !deliveryTimeValue) {
        notify("Debes seleccionar fecha y hora de recogida y entrega.", "error");
        return;
      }
      const pickupAt = `${pickupDateValue}T${pickupTimeValue}`;
      const etaDelivery = `${deliveryDateValue}T${deliveryTimeValue}`;
      const pickupDateTime = new Date(pickupAt);
      const deliveryDateTime = new Date(etaDelivery);
      if (pickupDateTime.getTime() < Date.now()) {
        notify("No puedes crear solicitudes para fechas u horas anteriores.", "error");
        return;
      }
      if (deliveryDateTime.getTime() <= pickupDateTime.getTime()) {
        notify("La entrega estimada debe ser posterior a la recogida.", "error");
        return;
      }
      const { pickupDate, pickupTime, deliveryDate, deliveryTime, ...payload } = data;
      const files = requestForm.querySelector("input[name='attachments']").files;
      const attachments = [...files].map((f) => f.name);
      const all = read(KEYS.requests, []);
      all.unshift({
        id: uid(),
        requestNumber: makeRequestNumber(),
        clientUserId: user.id,
        clientName: user.company,
        clientCompanyId: user.companyId,
        requestedByName: user.name,
        ...payload,
        pickupAt,
        etaDelivery,
        attachments,
        status: STATUS.PENDIENTE,
        createdAt: nowIso(),
        approvedAt: null,
        approvedBy: null,
        trip: null,
        standbyChargeTotal: 0,
        standbyEvents: [],
        rejectionReason: ""
      });
      write(KEYS.requests, all);

      const adminUsers = read(KEYS.users, []).filter((u) => u.role === ROLES.ADMIN);
      adminUsers.forEach((admin) => {
        saveNotification({
          userId: admin.id,
          title: "Nueva solicitud pendiente",
          body: `Solicitud ${all[0].id} de ${user.company}`
        });
        sendEmail({
          to: admin.email,
          subject: "Nueva solicitud de viaje",
          body: `Revisar solicitud ${all[0].id}`
        });
      });

      notify("Solicitud creada correctamente.", "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='detail']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const req = read(KEYS.requests, []).find((r) => r.id === btn.dataset.id);
      if (!req) return;
      const tripDetail = req.trip
        ? `<div class="dash-grid" style="margin-top:0.6rem">
            <div><strong>Viaje:</strong> ${req.trip.tripNumber}</div>
            <div><strong>Camion:</strong> ${req.trip.vehiclePlate} (${req.trip.vehicleType || "-"})</div>
            <div><strong>Conductor:</strong> ${req.trip.driverName} · ${req.trip.driverPhone || "-"}</div>
            <div><strong>Asignado por:</strong> ${req.trip.assignedBy || req.approvedBy || "-"}</div>
            <div><strong>Recogida:</strong> ${fmtDate(req.trip.etaPickup)}</div>
            <div><strong>Entrega:</strong> ${fmtDate(req.trip.etaDelivery)}</div>
          </div>`
        : `<p class="muted">Aun no tiene viaje asignado.</p>`;
      openInfoModal({
        title: `Solicitud ${req.requestNumber || req.id}`,
        subtitle: `${prettyStatus(req.status, "request")}`,
        bodyHtml: `
          <div class="dash-grid">
            <div><strong>Ruta:</strong> ${formatRoute(req)}</div>
            <div><strong>Creada por:</strong> ${req.requestedByName || "-"}</div>
            <div><strong>Carga:</strong> ${req.cargoDescription}</div>
            <div><strong>Peso/Volumen:</strong> ${parseNum(req.weightKg).toLocaleString("es-CO")} kg · ${parseNum(req.boxes).toLocaleString("es-CO")} cajas</div>
            <div><strong>Valor viaje:</strong> $${parseNum(req.tripValue || req.insuredValue || 0).toLocaleString("es-CO")}</div>
            <div><strong>Adjuntos:</strong> ${(req.attachments || []).join(", ") || "Ninguno"}</div>
            ${parseNum(req.standbyChargeTotal) > 0 ? `<div><strong>Standby:</strong> $${parseNum(req.standbyChargeTotal).toLocaleString("es-CO")}</div>` : ""}
            ${req.rejectionReason ? `<div class="full"><strong>Motivo rechazo:</strong> ${req.rejectionReason}</div>` : ""}
          </div>
          <hr style="border:0;border-top:1px solid var(--line);margin:0.8rem 0;" />
          <h3 style="margin:0 0 0.4rem;">Detalle del viaje</h3>
          ${tripDetail}
        `
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requests = read(KEYS.requests, []);
      const req = requests.find((r) => r.id === btn.dataset.id);
      if (!req || req.status !== STATUS.PENDIENTE) return;
      openEditModal({
        title: "Editar observaciones de solicitud",
        subtitle: req.requestNumber || req.id,
        submitText: "Guardar observaciones",
        fields: [{ name: "notes", label: "Observaciones", value: req.notes || "", required: false }],
        onSubmit: (form) => {
          const updated = requests.map((r) => (r.id === req.id ? { ...r, notes: String(form.notes || "").trim() } : r));
          write(KEYS.requests, updated);
          notify("Observaciones actualizadas.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='cancel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requests = read(KEYS.requests, []);
      const req = requests.find((r) => r.id === btn.dataset.id);
      if (!req || req.status !== STATUS.PENDIENTE) return;
      const updated = requests.map((r) => (r.id === req.id ? { ...r, status: STATUS.CANCELADA } : r));
      write(KEYS.requests, updated);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='approve']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const actor = currentUser();
      const requestId = String(btn.dataset.id || "");
      const request = read(KEYS.requests, []).find((item) => item.id === requestId);
      if (!request) return;
      const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
      const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
      if (!compatibleVehicles.length || !compatibleDrivers.length) {
        notify("No hay combinacion disponible de camion/conductor para esta solicitud.", "error");
        return;
      }
      openEditModal({
        title: "Asignacion manual de viaje",
        subtitle: `${request.requestNumber || request.id} · ${request.vehicleType} · ${parseNum(request.weightKg).toLocaleString("es-CO")} kg`,
        submitText: "Aprobar y crear viaje",
        fields: [
          {
            name: "vehicleId",
            label: "Selecciona camion compatible",
            type: "select",
            required: true,
            options: compatibleVehicles.map((vehicle) => ({
              value: vehicle.id,
              label: `${vehicle.plate} · ${vehicle.type} · ${parseNum(vehicle.capacityKg).toLocaleString("es-CO")} kg · ${vehicle.refrigerated ? "Refrigerado" : "Seco"} · SOAT ${docExpiryStatus(vehicle.soatExpeditionDate).label} · Tec ${docExpiryStatus(vehicle.techInspectionExpeditionDate).label}`
            }))
          },
          {
            name: "driverId",
            label: "Selecciona conductor disponible",
            type: "select",
            required: true,
            options: compatibleDrivers.map((driver) => ({
              value: driver.id,
              label: `${driver.name} · Lic ${driver.license || "-"} · vence ${driver.licenseExpiry || "-"} · ${driver.phone || ""}`
            }))
          }
        ],
        onSubmit: (form) => {
          const ok = approveRequest(requestId, actor?.name || "Administrador", false, String(form.vehicleId || ""), String(form.driverId || ""));
          if (!ok) return false;
          notify("Solicitud aprobada y viaje asignado correctamente.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  const createTripForm = document.getElementById("form-create-trip");
  if (createTripForm) {
    const select = createTripForm.querySelector("select[name='requestId']");
    const preview = createTripForm.querySelector("#trip-request-preview");
    const setPreview = () => {
      const option = select?.selectedOptions?.[0];
      if (!option || !preview) return;
      const createdBy = option.getAttribute("data-createdby") || "-";
      const company = option.getAttribute("data-company") || "-";
      const route = option.getAttribute("data-route") || "-";
      const createdByNode = preview.querySelector("[data-preview='createdBy']");
      const companyNode = preview.querySelector("[data-preview='company']");
      const routeNode = preview.querySelector("[data-preview='route']");
      if (createdByNode) createdByNode.textContent = createdBy;
      if (companyNode) companyNode.textContent = company;
      if (routeNode) routeNode.textContent = route;
    };
    if (select) {
      select.addEventListener("change", setPreview);
      setPreview();
    }

    createTripForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const actor = currentUser();
      const data = Object.fromEntries(new FormData(createTripForm).entries());
      const requestId = String(data.requestId || "");
      if (!requestId) {
        notify("Selecciona una solicitud pendiente.", "error");
        return;
      }
      if (actor?.role !== ROLES.ADMIN) {
        queueApproval({
          type: "approve_trip_request",
          title: `Aprobacion de viaje para solicitud ${requestId}`,
          payload: { requestId },
          requestedByUserId: actor?.id || "",
          requestedByName: actor?.name || "Usuario"
        });
        notify("Solicitud de aprobacion de viaje enviada al administrador.", "info");
        renderPortalView();
        return;
      }
      const request = read(KEYS.requests, []).find((item) => item.id === requestId);
      if (!request) {
        notify("Solicitud no encontrada.", "error");
        return;
      }
      const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
      const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
      if (!compatibleVehicles.length || !compatibleDrivers.length) {
        notify("No hay camion/conductor compatible disponible para esta solicitud.", "error");
        return;
      }
      openEditModal({
        title: "Asignar viaje",
        subtitle: `${request.requestNumber || request.id} · ${request.vehicleType}`,
        submitText: "Crear viaje",
        fields: [
          {
            name: "vehicleId",
            label: "Camion",
            type: "select",
            required: true,
            options: compatibleVehicles.map((vehicle) => ({
              value: vehicle.id,
              label: `${vehicle.plate} · ${vehicle.type} · ${parseNum(vehicle.capacityKg).toLocaleString("es-CO")} kg · ${vehicle.refrigerated ? "Refrigerado" : "Seco"} · SOAT ${docExpiryStatus(vehicle.soatExpeditionDate).label} · Tec ${docExpiryStatus(vehicle.techInspectionExpeditionDate).label}`
            }))
          },
          {
            name: "driverId",
            label: "Conductor",
            type: "select",
            required: true,
            options: compatibleDrivers.map((driver) => ({
              value: driver.id,
              label: `${driver.name} · Lic ${driver.license || "-"} · vence ${driver.licenseExpiry || "-"}`
            }))
          }
        ],
        onSubmit: (form) => {
          const ok = approveRequest(requestId, currentUser()?.name || "Administrador", false, String(form.vehicleId || ""), String(form.driverId || ""));
          if (!ok) return false;
          notify("Viaje creado y asignado correctamente.", "success");
          renderPortalView();
          return true;
        }
      });
      return;
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='trip-detail']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const req = read(KEYS.requests, []).find((r) => r.id === btn.dataset.id);
      if (!req || !req.trip) return;
      openInfoModal({
        title: `Viaje ${req.trip.tripNumber}`,
        subtitle: prettyStatus(req.status, "trip"),
        bodyHtml: `
          <div class="dash-grid">
            <div><strong>Solicitud:</strong> ${req.requestNumber || req.id}</div>
            <div><strong>Cliente:</strong> ${req.clientName || "-"}</div>
            <div><strong>Ruta:</strong> ${formatRoute(req)}</div>
            <div><strong>Carga:</strong> ${req.cargoDescription || "-"} · ${parseNum(req.weightKg).toLocaleString("es-CO")} kg</div>
            <div><strong>Valor viaje:</strong> $${parseNum(req.tripValue || 0).toLocaleString("es-CO")}</div>
            <div><strong>Camion:</strong> ${req.trip.vehiclePlate} (${req.trip.vehicleType || "-"})</div>
            <div><strong>Conductor:</strong> ${req.trip.driverName} · ${req.trip.driverPhone || "-"}</div>
            <div><strong>Asignado por:</strong> ${req.trip.assignedBy || req.approvedBy || "-"}</div>
            <div><strong>Fecha asignacion:</strong> ${fmtDate(req.trip.assignedAt || req.approvedAt || req.createdAt)}</div>
            <div><strong>Recogida:</strong> ${fmtDate(req.trip.etaPickup)}</div>
            <div><strong>Entrega:</strong> ${fmtDate(req.trip.etaDelivery)}</div>
          </div>
          ${parseNum(req.standbyChargeTotal) > 0 ? `<p><strong>Standby acumulado:</strong> $${parseNum(req.standbyChargeTotal).toLocaleString("es-CO")}</p>` : ""}
        `
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='trip-status']").forEach((select) => {
    select.addEventListener("change", () => {
      const actor = currentUser();
      transitionRequestStatus(select.dataset.id, select.value, actor?.name || "Operación");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='reject']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reason = prompt("Motivo de rechazo");
      if (!reason) return;
      rejectRequest(btn.dataset.id, reason, currentUser().name);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-admin']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requests = read(KEYS.requests, []);
      const req = requests.find((r) => r.id === btn.dataset.id);
      if (!req) return;
      const [pickupDate, pickupTime] = String(toInputDate(req.pickupAt) || "").split("T");
      const [deliveryDate, deliveryTime] = String(toInputDate(req.etaDelivery || req.pickupAt) || "").split("T");
      openEditModal({
        title: "Editar solicitud",
        subtitle: req.requestNumber || req.id,
        submitText: "Actualizar solicitud",
        fields: [
          { name: "pickupDate", label: "Fecha de recogida", type: "date", value: pickupDate, required: true },
          { name: "pickupTime", label: "Hora de recogida", type: "time", value: pickupTime, required: true },
          { name: "deliveryDate", label: "Fecha de entrega", type: "date", value: deliveryDate, required: true },
          { name: "deliveryTime", label: "Hora de entrega", type: "time", value: deliveryTime, required: true }
        ],
        onSubmit: (form) => {
          const newPickup = `${form.pickupDate}T${form.pickupTime}`;
          const newDelivery = `${form.deliveryDate}T${form.deliveryTime}`;
          if (new Date(newDelivery).getTime() <= new Date(newPickup).getTime()) {
            notify("La entrega debe ser posterior a la recogida.", "error");
            return false;
          }
          write(
            KEYS.requests,
            requests.map((r) => (r.id === req.id ? { ...r, pickupAt: newPickup, etaDelivery: newDelivery } : r))
          );
          notify("Solicitud actualizada correctamente.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-admin']").forEach((btn) => {
    btn.addEventListener("click", () => {
      openConfirmModal({
        title: "Eliminar solicitud",
        message: "Se eliminara la solicitud seleccionada.",
        confirmText: "Eliminar",
        onConfirm: () => {
          write(
            KEYS.requests,
            read(KEYS.requests, []).filter((r) => r.id !== btn.dataset.id)
          );
          notify("Solicitud eliminada.", "success");
          renderPortalView();
        }
      });
    });
  });

  const vehicleForm = document.getElementById("form-vehicle");
  if (vehicleForm) {
    vehicleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(vehicleForm).entries());
      const list = read(KEYS.vehicles, []);
      list.push({
        id: uid(),
        plate: String(data.plate).toUpperCase(),
        brand: String(data.brand || "").trim(),
        model: String(data.model || "").trim(),
        year: parseNum(data.year),
        type: data.type,
        capacityKg: parseNum(data.capacityKg),
        refrigerated: data.refrigerated === "true",
        mileageKm: parseNum(data.mileageKm),
        soatExpeditionDate: data.soatExpeditionDate,
        techInspectionExpeditionDate: data.techInspectionExpeditionDate,
        available: true
      });
      write(KEYS.vehicles, list);
      notify("Camion registrado correctamente.", "success");
      renderPortalView();
    });
  }

  const driverForm = document.getElementById("form-driver");
  if (driverForm) {
    driverForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const actor = currentUser();
      const data = Object.fromEntries(new FormData(driverForm).entries());
      const docValidation = validateColombianDocument(data.documentType, data.idDoc);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.idDoc = docValidation.normalized;
      if (new Date(String(data.licenseExpiry || "")).getTime() <= Date.now()) {
        notify("La licencia debe tener vigencia futura para registrar conductor.", "error");
        return;
      }
      if (actor?.role !== ROLES.ADMIN) {
        queueApproval({
          type: "create_driver",
          title: `Creacion de conductor ${data.name}`,
          payload: data,
          requestedByUserId: actor?.id || "",
          requestedByName: actor?.name || "Usuario"
        });
        notify("Solicitud de conductor enviada para aprobacion.", "info");
        renderPortalView();
        return;
      }
      const list = read(KEYS.drivers, []);
      list.push({ id: uid(), ...data, available: true, hiredAt: nowIso() });
      write(KEYS.drivers, list);
      const employees = read(KEYS.payrollEmployees, []);
      const existsEmployee = employees.some((e) => String(e.idDoc || "") === String(data.idDoc || ""));
      if (!existsEmployee) {
        employees.push({
          id: uid(),
          name: data.name,
          idDoc: data.idDoc,
          documentType: data.documentType,
          position: "Conductor",
          contractType: data.contractType || "Indefinido",
          workerRole: "conductor",
          city: data.city || "",
          address: data.address || "",
          phone: data.phone || "",
          emergencyContact: data.emergencyContact || "",
          emergencyPhone: data.emergencyPhone || "",
          companyId: data.companyId || "",
          baseSalary: parseNum(data.baseSalary),
          startDate: data.startDate || nowIso().slice(0, 10)
        });
        write(KEYS.payrollEmployees, employees);
      }
      notify("Conductor creado correctamente.", "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='toggle-vehicle']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.vehicles, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      setVehicleAvailability(target.id, !target.available);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-vehicle']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.vehicles, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      openEditModal({
        title: "Editar camion",
        subtitle: target.plate,
        submitText: "Guardar cambios",
        fields: [
          { name: "plate", label: "Placa", value: target.plate, required: true },
          { name: "brand", label: "Marca", value: target.brand || "", required: true },
          { name: "model", label: "Linea/Modelo", value: target.model || "", required: true },
          { name: "year", label: "Ano modelo", type: "number", value: target.year || "", required: true },
          { name: "capacityKg", label: "Capacidad (kg)", type: "number", value: target.capacityKg, required: true },
          { name: "mileageKm", label: "Kilometraje", type: "number", value: target.mileageKm || 0, required: true },
          { name: "soatExpeditionDate", label: "Expedicion SOAT", type: "date", value: target.soatExpeditionDate, required: true },
          {
            name: "techInspectionExpeditionDate",
            label: "Expedicion tecnomecanica",
            type: "date",
            value: target.techInspectionExpeditionDate,
            required: true
          }
        ],
        onSubmit: (form) => {
          write(
            KEYS.vehicles,
            all.map((v) =>
              v.id === target.id
                ? {
                    ...v,
                    plate: String(form.plate || "").toUpperCase(),
                    brand: String(form.brand || "").trim(),
                    model: String(form.model || "").trim(),
                    year: parseNum(form.year),
                    capacityKg: parseNum(form.capacityKg),
                    mileageKm: parseNum(form.mileageKm),
                    soatExpeditionDate: form.soatExpeditionDate,
                    techInspectionExpeditionDate: form.techInspectionExpeditionDate
                  }
                : v
            )
          );
          notify("Camion actualizado correctamente.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-driver']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.drivers, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      setDriverAvailability(target.id, !target.available);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-driver']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.drivers, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      openEditModal({
        title: "Editar conductor",
        subtitle: target.name,
        submitText: "Actualizar conductor",
        fields: [
          { name: "name", label: "Nombre completo", value: target.name, required: true },
          { name: "phone", label: "Telefono", value: target.phone, required: true }
        ],
        onSubmit: (form) => {
          write(
            KEYS.drivers,
            all.map((d) =>
              d.id === target.id ? { ...d, name: String(form.name || "").trim(), phone: String(form.phone || "").trim() } : d
            )
          );
          notify("Conductor actualizado correctamente.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  const historyFilter = document.getElementById("history-filter");
  if (historyFilter) {
    historyFilter.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(historyFilter).entries());
      let items = read(KEYS.requests, []);
      if (data.client) items = items.filter((i) => i.clientUserId === data.client);
      if (data.status) items = items.filter((i) => i.status === data.status);
      if (data.from) items = items.filter((i) => new Date(i.createdAt) >= new Date(`${data.from}T00:00`));
      if (data.to) items = items.filter((i) => new Date(i.createdAt) <= new Date(`${data.to}T23:59`));
      document.getElementById("history-body").innerHTML =
        items
          .map(
            (r) =>
              `<tr><td>${fmtDate(r.createdAt)}</td><td>${r.requestNumber || r.id}</td><td>${r.clientName}</td><td>${r.vehicleType}</td><td>${r.status}</td><td>${r.trip?.tripNumber || "-"}</td></tr>`
          )
          .join("") || "<tr><td colspan='6'>Sin registros</td></tr>";
    });
  }

  const employeeForm = document.getElementById("form-employee");
  if (employeeForm) {
    employeeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const actor = currentUser();
      const data = Object.fromEntries(new FormData(employeeForm).entries());
      const docValidation = validateColombianDocument(data.documentType, data.idDoc);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.idDoc = docValidation.normalized;
      if (actor?.role !== ROLES.ADMIN) {
        queueApproval({
          type: "create_employee",
          title: `Creacion de empleado ${data.name}`,
          payload: data,
          requestedByUserId: actor?.id || "",
          requestedByName: actor?.name || "Usuario"
        });
        notify("Solicitud de empleado enviada a autorizaciones.", "info");
        renderPortalView();
        return;
      }
      const all = read(KEYS.payrollEmployees, []);
      all.push({ id: uid(), workerRole: "empleado", ...data });
      write(KEYS.payrollEmployees, all);
      notify("Empleado creado correctamente.", "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='edit-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.payrollEmployees, []);
      const target = all.find((e) => e.id === btn.dataset.id);
      if (!target) return;
      openEditModal({
        title: "Editar empleado",
        subtitle: target.name,
        submitText: "Actualizar empleado",
        fields: [
          { name: "position", label: "Cargo", value: target.position, required: true },
          { name: "baseSalary", label: "Salario base", type: "number", value: target.baseSalary, required: true }
        ],
        onSubmit: (form) => {
          write(
            KEYS.payrollEmployees,
            all.map((e) =>
              e.id === target.id
                ? { ...e, position: String(form.position || "").trim(), baseSalary: parseNum(form.baseSalary) }
                : e
            )
          );
          notify("Empleado actualizado correctamente.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      openConfirmModal({
        title: "Eliminar empleado",
        message: "El empleado sera removido de nomina.",
        confirmText: "Eliminar",
        onConfirm: () => {
          write(
            KEYS.payrollEmployees,
            read(KEYS.payrollEmployees, []).filter((e) => e.id !== btn.dataset.id)
          );
          notify("Empleado eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });

  const payrollForm = document.getElementById("form-payroll");
  if (payrollForm) {
    payrollForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(payrollForm).entries());
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === data.employeeId);
      if (!employee) return;
      const baseSalary = parseNum(employee.baseSalary);
      const extras = parseNum(data.extras);
      const aux = parseNum(data.aux);
      const bonus = parseNum(data.bonus);
      const gross = baseSalary + extras + aux + bonus;
      const ibc = baseSalary + extras + bonus;
      const health = ibc * CO_PAYROLL.healthEmployeeRate;
      const pension = ibc * CO_PAYROLL.pensionEmployeeRate;
      const solidarity = ibc > CO_PAYROLL.smmlv * CO_PAYROLL.solidarityThresholdSmmlv ? ibc * CO_PAYROLL.solidarityRate : 0;
      const deductions = health + pension + solidarity;
      const net = gross - deductions;
      const run = {
        id: uid(),
        employeeId: employee.id,
        employeeName: employee.name,
        month: data.month,
        gross,
        ibc,
        health,
        pension,
        solidarity,
        deductions,
        net,
        paid: false,
        createdAt: nowIso()
      };
      const runs = read(KEYS.payrollRuns, []);
      runs.unshift(run);
      write(KEYS.payrollRuns, runs);
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='payslip']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const run = read(KEYS.payrollRuns, []).find((r) => r.id === btn.dataset.id);
      if (!run) return;
      const pop = window.open("", "_blank", "width=600,height=700");
      pop.document.write(`
        <html><head><title>Desprendible ${run.employeeName}</title></head>
        <body style="font-family:Arial;padding:20px">
          <h1>Desprendible de pago</h1>
          <p>Empleado: ${run.employeeName}</p>
          <p>Periodo: ${run.month}</p>
          <p>Devengado: $${parseNum(run.gross).toLocaleString("es-CO")}</p>
          <p>IBC: $${parseNum(run.ibc).toLocaleString("es-CO")}</p>
          <p>Salud empleado (4%): $${parseNum(run.health).toLocaleString("es-CO")}</p>
          <p>Pension empleado (4%): $${parseNum(run.pension).toLocaleString("es-CO")}</p>
          <p>Fondo solidaridad: $${parseNum(run.solidarity).toLocaleString("es-CO")}</p>
          <p>Total deducciones: $${parseNum(run.deductions).toLocaleString("es-CO")}</p>
          <p>Neto: $${parseNum(run.net).toLocaleString("es-CO")}</p>
          <p>Generado: ${fmtDate(run.createdAt)}</p>
        </body></html>
      `);
      pop.document.close();
      const all = read(KEYS.payrollRuns, []);
      write(
        KEYS.payrollRuns,
        all.map((item) => (item.id === run.id ? { ...item, paid: true } : item))
      );
      renderPortalView();
    });
  });

  const exportPayroll = document.getElementById("export-payroll");
  if (exportPayroll) {
    exportPayroll.addEventListener("click", () => {
      const rows = read(KEYS.payrollRuns, []);
      const csv = ["Mes,Empleado,Devengado,IBC,Salud,Pension,Solidaridad,Deducciones,Neto,Estado"]
        .concat(rows.map((r) => `${r.month},${r.employeeName},${r.gross},${r.ibc || 0},${r.health || 0},${r.pension || 0},${r.solidarity || 0},${r.deductions},${r.net},${r.paid ? "Pagado" : "Pendiente"}`))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nomina_resumen.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const vacancyForm = document.getElementById("form-vacancy");
  if (vacancyForm) {
    vacancyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(vacancyForm).entries());
      const all = read(KEYS.vacancies, []);
      all.unshift({ id: uid(), ...data, status: "Publicada", createdAt: nowIso() });
      write(KEYS.vacancies, all);
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='close-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.vacancies, []);
      write(
        KEYS.vacancies,
        all.map((v) => (v.id === btn.dataset.id ? { ...v, status: "Cerrada" } : v))
      );
      renderPortalView();
    });
  });

  const candidateForm = document.getElementById("form-candidate");
  if (candidateForm) {
    candidateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(candidateForm).entries());
      const docValidation = validateColombianDocument(data.documentType, data.idDoc);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.idDoc = docValidation.normalized;
      const vac = read(KEYS.vacancies, []).find((v) => v.id === data.vacancyId);
      if (!vac) return;
      const files = [...candidateForm.querySelector("input[name='attachments']").files].map((f) => f.name);
      const all = read(KEYS.candidates, []);
      all.unshift({
        id: uid(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        documentType: data.documentType,
        idDoc: data.idDoc,
        city: data.city,
        address: data.address,
        vacancyId: vac.id,
        vacancyTitle: vac.title,
        status: PIPELINE[0],
        attachments: files,
        createdAt: nowIso()
      });
      write(KEYS.candidates, all);
      sendEmail({ to: data.email, subject: "Registro recibido", body: "Gracias por aplicar." });
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='candidate-status']").forEach((select) => {
    select.addEventListener("change", () => {
      const all = read(KEYS.candidates, []);
      const updated = all.map((c) => (c.id === select.dataset.id ? { ...c, status: select.value } : c));
      write(KEYS.candidates, updated);
      const current = updated.find((c) => c.id === select.dataset.id);
      if (current) {
        sendEmail({
          to: current.email,
          subject: "Actualizacion de proceso",
          body: `Tu estado cambio a: ${current.status}`
        });
      }
      renderPortalView();
    });
  });

  const interviewForm = document.getElementById("form-interview");
  if (interviewForm) {
    interviewForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(interviewForm).entries());
      const candidate = read(KEYS.candidates, []).find((c) => c.id === data.candidateId);
      if (!candidate) return;
      const all = read(KEYS.interviews, []);
      all.unshift({
        id: uid(),
        candidateId: candidate.id,
        candidateName: candidate.name,
        when: data.when,
        interviewer: data.interviewer
      });
      write(KEYS.interviews, all);
      sendEmail({ to: candidate.email, subject: "Entrevista programada", body: `Fecha: ${data.when}` });
      renderPortalView();
    });
  }

  const contractForm = document.getElementById("form-contract");
  if (contractForm) {
    contractForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(contractForm).entries());
      const candidate = read(KEYS.candidates, []).find((c) => c.id === data.candidateId);
      if (!candidate) return;
      const company = getCompanyById(String(data.companyId || ""));
      if (!company) {
        notify("Selecciona una empresa valida para el contrato.", "error");
        return;
      }
      const workerRole = String(data.workerRole || "empleado");
      if (workerRole === "conductor" && (!data.license || !data.licenseExpiry)) {
        notify("Para rol conductor debes completar licencia y fecha de vencimiento.", "error");
        return;
      }
      const text = `CONTRATO LABORAL\nEmpleado: ${candidate.name}\nCargo: ${data.position}\nSalario: ${data.salary}\nFecha inicio: ${data.startDate}\nEmpresa: ${company.name}`;
      const all = read(KEYS.contracts, []);
      all.unshift({
        id: uid(),
        candidateId: candidate.id,
        candidateName: candidate.name,
        workerRole,
        position: data.position,
        salary: data.salary,
        startDate: data.startDate,
        companyId: company.id,
        companyName: company.name,
        contractType: data.contractType,
        content: text,
        createdAt: nowIso()
      });
      write(KEYS.contracts, all);

      const employeeDocValidation = validateColombianDocument("CC", candidate.idDoc || candidate.docId || candidate.document || "");
      const employees = read(KEYS.payrollEmployees, []);
      const existingEmployee = employees.find((e) => String(e.email || "").toLowerCase() === String(candidate.email || "").toLowerCase());
      if (!existingEmployee) {
        employees.push({
          id: uid(),
          name: candidate.name,
          idDoc: employeeDocValidation.ok ? employeeDocValidation.normalized : (candidate.idDoc || candidate.document || uid()),
          documentType: candidate.documentType || "CC",
          position: data.position,
          contractType: data.contractType,
          workerRole,
          city: candidate.city || "",
          address: candidate.address || "",
          phone: candidate.phone || "",
          emergencyContact: candidate.emergencyContact || "",
          emergencyPhone: candidate.emergencyPhone || "",
          companyId: company.id,
          baseSalary: parseNum(data.salary),
          startDate: data.startDate
        });
        write(KEYS.payrollEmployees, employees);
      }

      if (workerRole === "conductor") {
        const drivers = read(KEYS.drivers, []);
        const existsDriver = drivers.some((d) => String(d.idDoc || "") === String(employeeDocValidation.normalized || ""));
        if (!existsDriver) {
          drivers.push({
            id: uid(),
            name: candidate.name,
            documentType: candidate.documentType || "CC",
            idDoc: employeeDocValidation.ok ? employeeDocValidation.normalized : (candidate.idDoc || uid()),
            phone: candidate.phone || "",
            license: data.license,
            licenseCategory: data.licenseCategory || data.license || "C2",
            licenseExpiry: data.licenseExpiry,
            city: candidate.city || "",
            emergencyContact: candidate.emergencyContact || "",
            emergencyPhone: candidate.emergencyPhone || "",
            companyId: company.id,
            available: true,
            hiredAt: nowIso()
          });
          write(KEYS.drivers, drivers);
        }
      }

      sendEmail({ to: candidate.email, subject: "Oferta/Contrato generado", body: text });
      notify(`Contrato generado y vinculación registrada como ${workerRole}.`, "success");
      renderPortalView();
    });
  }

  const employeeContractForm = document.getElementById("form-employee-contract");
  if (employeeContractForm) {
    employeeContractForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(employeeContractForm).entries());
      const employee = read(KEYS.payrollEmployees, []).find((item) => item.id === data.employeeId);
      if (!employee) return;
      const contractText =
        `CONTRATO LABORAL\n` +
        `Empresa: Antares\n` +
        `Empleado: ${employee.name}\n` +
        `Cédula: ${employee.idDoc}\n` +
        `Cargo: ${employee.position}\n` +
        `Tipo de contrato: ${data.contractType}\n` +
        `Salario: ${data.salary}\n` +
        `Fecha de inicio: ${data.startDate}\n` +
        `Fecha de generación: ${new Date().toLocaleDateString("es-CO")}\n`;

      const all = read(KEYS.contracts, []);
      all.unshift({
        id: uid(),
        employeeId: employee.id,
        employeeName: employee.name,
        position: employee.position,
        salary: data.salary,
        startDate: data.startDate,
        source: "Empleado",
        content: contractText,
        createdAt: nowIso()
      });
      write(KEYS.contracts, all);

      const popup = window.open("", "_blank", "width=800,height=900");
      popup.document.write(`
        <html>
          <head><title>Contrato ${employee.name}</title></head>
          <body style="font-family:Arial;padding:28px">
            <h1>Contrato laboral</h1>
            <pre style="white-space:pre-wrap;font-size:15px;line-height:1.6">${contractText}</pre>
            <p>Firma empresa: ____________________</p>
            <p>Firma empleado: ___________________</p>
            <script>window.print();</script>
          </body>
        </html>
      `);
      popup.document.close();
      renderPortalView();
    });
  }

  const profileForm = document.getElementById("form-profile");
  if (profileForm) {
    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const actor = currentUser();
      if (!actor) return;
      const data = Object.fromEntries(new FormData(profileForm).entries());
      const fileInput = profileForm.querySelector("input[name='avatarFile']");
      const file = fileInput?.files?.[0];
      const applyProfile = (avatarUrlValue = String(data.avatarUrl || "")) => {
        const users = read(KEYS.users, []);
        const company = getCompanyById(String(data.companyId || ""));
        write(
          KEYS.users,
          users.map((u) =>
            u.id === actor.id
              ? {
                  ...u,
                  name: String(data.name || u.name).trim(),
                  phone: String(data.phone || "").trim(),
                  taxId: String(data.taxId || "").trim(),
                  companyId: company?.id || u.companyId,
                  company: company?.name || u.company,
                  avatarUrl: avatarUrlValue || u.avatarUrl || ""
                }
              : u
          )
        );
        alert("Perfil actualizado.");
        renderPortal();
      };
      if (file) {
        const reader = new FileReader();
        reader.onload = () => applyProfile(String(reader.result || ""));
        reader.readAsDataURL(file);
      } else {
        applyProfile(String(data.avatarUrl || ""));
      }
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='approval-approve']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = String(btn.dataset.id || "");
      const approvals = read(KEYS.approvals, []);
      const approval = approvals.find((a) => a.id === id && a.status === "pendiente");
      const actor = currentUser();
      if (!approval || !actor || actor.role !== ROLES.ADMIN) return;

      if (approval.type === "create_user") {
        const users = read(KEYS.users, []);
        if (!users.some((u) => normalizeEmail(u.email) === normalizeEmail(approval.payload.email))) {
          users.push({
            id: uid(),
            name: approval.payload.name,
            email: normalizeEmail(approval.payload.email),
            password: await hashPassword(approval.payload.password || "Cambio123!"),
            role: approval.payload.role,
            documentType: approval.payload.documentType || "CC",
            personType: approval.payload.personType || "Natural",
            documentIssuedAt: approval.payload.documentIssuedAt || "",
            accountStatus: ACCOUNT_STATUS.APROBADO,
            company: approval.payload.companyName || getCompanyById(approval.payload.companyId)?.name || "",
            companyId: approval.payload.companyId,
            taxId: approval.payload.taxId,
            phone: approval.payload.phone,
            city: approval.payload.city || "",
            department: approval.payload.department || "",
            address: approval.payload.address || "",
            permissions:
              approval.payload.role === ROLES.ADMIN
                ? [...ALL_PERMISSIONS]
                : (approval.payload.permissions || defaultPermissionsForRole(approval.payload.role))
          });
          write(KEYS.users, users);
        }
      } else if (approval.type === "create_employee") {
        const employees = read(KEYS.payrollEmployees, []);
        employees.push({ id: uid(), workerRole: "empleado", ...approval.payload });
        write(KEYS.payrollEmployees, employees);
      } else if (approval.type === "create_driver") {
        const drivers = read(KEYS.drivers, []);
        drivers.push({ id: uid(), ...approval.payload, available: true, hiredAt: nowIso() });
        write(KEYS.drivers, drivers);
        const employees = read(KEYS.payrollEmployees, []);
        const existsEmployee = employees.some((e) => String(e.idDoc || "") === String(approval.payload.idDoc || ""));
        if (!existsEmployee) {
          employees.push({
            id: uid(),
            name: approval.payload.name,
            idDoc: approval.payload.idDoc,
            documentType: approval.payload.documentType || "CC",
            position: "Conductor",
            contractType: approval.payload.contractType || "Indefinido",
            workerRole: "conductor",
            city: approval.payload.city || "",
            address: approval.payload.address || "",
            phone: approval.payload.phone || "",
            emergencyContact: approval.payload.emergencyContact || "",
            emergencyPhone: approval.payload.emergencyPhone || "",
            companyId: approval.payload.companyId || "",
            baseSalary: parseNum(approval.payload.baseSalary),
            startDate: approval.payload.startDate || nowIso().slice(0, 10)
          });
          write(KEYS.payrollEmployees, employees);
        }
      } else if (approval.type === "approve_trip_request") {
        approveRequest(String(approval.payload.requestId || ""), actor.name, false);
      }

      write(
        KEYS.approvals,
        approvals.map((a) =>
          a.id === id ? { ...a, status: "aprobado", reviewedAt: nowIso(), reviewedBy: actor.name } : a
        )
      );
      alert("Autorizacion aprobada.");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='approval-reject']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      const reason = prompt("Motivo del rechazo:");
      if (!reason) return;
      const actor = currentUser();
      const approvals = read(KEYS.approvals, []);
      write(
        KEYS.approvals,
        approvals.map((a) =>
          a.id === id
            ? { ...a, status: "rechazado", reviewedAt: nowIso(), reviewedBy: actor?.name || "Admin", rejectionReason: reason }
            : a
        )
      );
      alert("Autorizacion rechazada.");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='view-contract']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = read(KEYS.contracts, []).find((x) => x.id === btn.dataset.id);
      if (!c) return;
      const popup = window.open("", "_blank", "width=800,height=900");
      popup.document.write(`
        <html>
          <head><title>Contrato</title></head>
          <body style="font-family:Arial;padding:28px">
            <h1>Contrato laboral</h1>
            <pre style="white-space:pre-wrap;font-size:15px;line-height:1.6">${c.content}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
      popup.document.close();
    });
  });
}

function initGlobalEvents() {
  nodes.openAuth.addEventListener("click", showAuth);
  if (nodes.openAuthHero) {
    nodes.openAuthHero.addEventListener("click", showAuth);
  }
  nodes.closeAuth.addEventListener("click", hideAuth);

  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mainNav = document.getElementById("main-nav");
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener("click", () => {
      mainNav.classList.toggle("nav-open");
    });
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => mainNav.classList.remove("nav-open"));
    });
  }
  nodes.authTabs.forEach((tabBtn) =>
    tabBtn.addEventListener("click", () => {
      state.authTab = tabBtn.dataset.tab;
      renderAuthTab();
    })
  );
  nodes.authModal.addEventListener("click", (event) => {
    if (event.target === nodes.authModal) hideAuth();
  });

  nodes.b2bForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(nodes.b2bForm).entries());
    const all = read(KEYS.contacts, []);
    all.unshift({ id: uid(), ...data, createdAt: nowIso() });
    write(KEYS.contacts, all);
    sendEmail({ to: "comercial@antarescargo.com", subject: "Nuevo lead B2B", body: JSON.stringify(data) });
    nodes.b2bForm.reset();
    alert("Contacto enviado.");
  });

  nodes.sideLinks.forEach((link) => {
    link.addEventListener("click", () => setView(link.dataset.view));
  });

  window.addEventListener("hashchange", () => {
    const user = currentUser();
    if (!state.session || !user) return;
    const urlView = viewFromPortalHash();
    if (!urlView) return;
    if (!isViewAllowedForUser(user, urlView)) {
      state.currentView = "dashboard";
      syncPortalHash("dashboard");
      renderPortalView();
      return;
    }
    state.currentView = urlView;
    renderPortalView();
  });

  nodes.logout.addEventListener("click", () => {
    clearSession();
    state.currentView = "dashboard";
    history.replaceState(null, "", window.location.pathname + window.location.search);
    renderPortal();
  });
}

function initPublicEffects() {
  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!revealItems.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 40, 280)}ms`;
    observer.observe(item);
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.getElementById("hero");
  if (!hero || prefersReducedMotion) return;

  window.addEventListener(
    "scroll",
    () => {
      const offset = window.scrollY * 0.15;
      hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;
    },
    { passive: true }
  );

  const tiltCards = document.querySelectorAll("[data-tilt]");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const rotateY = ((x / bounds.width) - 0.5) * 7;
      const rotateX = (0.5 - y / bounds.height) * 7;
      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

seed();
ensureUsersPasswordHashing();
initGlobalEvents();
initPublicEffects();
renderPortal();
setInterval(() => {
  if (!state.session) return;
  updateAutoApprove();
  const typingRequestForm = state.currentView === "requests" && !!document.getElementById("form-request");
  if (!typingRequestForm) {
    renderPortalView();
  }
}, 30000);
