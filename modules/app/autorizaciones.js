/**
 * Centro de aprobaciones (uthorizations): vista HTML y listeners del portal.
 */

function buildAuthorizationsPortalRegistrationsSection(pendingUsers) {
  const list = Array.isArray(pendingUsers) ? pendingUsers : [];
  const n = list.length;
  const countBadge = `<span class="auth-section-count">${n} en bandeja</span>`;
  const body = n
    ? buildPortalRegistrationPendingTableHtml(list)
    : `<div class="auth-inbox-empty">${emptyState(
        "Nadie en cola con estado pendiente. Si acaba de registrarse un cliente, espere unos segundos o salga y vuelva a entrar a Autorizaciones."
      )}</div>`;
  return `<section class="auth-queue-section auth-queue-section--portal" data-auth-section="portal_registrations" aria-label="Registro de clientes en el portal">
      <header class="auth-queue-section-head">
        <div class="auth-queue-section-title-row">
          <h3 class="auth-queue-section-title">Bandeja de altas (portal web)</h3>
          ${countBadge}
        </div>
        <p class="muted auth-queue-section-desc">Solicitudes nuevas pendientes de aprobación. Revise identidad y asigne empresa antes de activar el acceso.</p>
      </header>
      <div class="auth-queue-section-body">${body}</div>
    </section>`;
}

function authorizationsHtml() {
  const actor = currentUser();
  const approvals = read(KEYS.approvals, []);
  const authUi = state.authorizationsUi && typeof state.authorizationsUi === "object" ? state.authorizationsUi : {};
  const authSearchRaw = String(authUi.listSearch || "");
  const authQ = authSearchRaw.trim().toLowerCase();
  const authInc = (blob) => !authQ || String(blob || "").toLowerCase().includes(authQ);
  const pendingAll = approvals.filter((a) => a.status === "pendiente");
  const approvalSearchBlob = (a) => {
    const meta = APPROVAL_TYPE_META[a.type] || {};
    const p = a.payload && typeof a.payload === "object" ? a.payload : {};
    return `${a.type || ""} ${meta.title || ""} ${a.id || ""} ${JSON.stringify(p)}`.toLowerCase();
  };
  const pending = authQ ? pendingAll.filter((a) => authInc(approvalSearchBlob(a))) : pendingAll;
  const approvedCt = approvals.filter((a) => a.status === "aprobado").length;
  const rejectedCt = approvals.filter((a) => a.status === "rechazado").length;
  const pendingUsersAll = read(KEYS.users, []).filter((u) => isPortalUserPendingApproval(u));
  const pendingUsers = authQ
    ? pendingUsersAll.filter((u) =>
        authInc(
          `${u.name || ""} ${u.email || ""} ${u.company || ""} ${u.companyId || ""} ${getCompanyById(u.companyId)?.name || ""} ${u.role || ""}`
        )
      )
    : pendingUsersAll;
  const pendingTransportRequestsAll = sortAuthQueueByDateDesc(
    reqRead().filter((r) => r.status === STATUS.PENDIENTE),
    (r) => r.createdAt
  );
  const transportRequestSearchBlob = (r) =>
    `${r.requestNumber || ""} ${r.id || ""} ${r.clientName || ""} ${r.originCity || ""} ${r.destinationCity || ""} ${r.status || ""}`.toLowerCase();
  const pendingTransportRequests = authQ
    ? pendingTransportRequestsAll.filter((r) => authInc(transportRequestSearchBlob(r)))
    : pendingTransportRequestsAll;
  let totalOpen = 0;
  if (canAccessAuthorizationSection(actor, "portal_registrations")) totalOpen += pendingUsers.length;
  if (canAccessAuthorizationSection(actor, "transport_requests")) totalOpen += pendingTransportRequests.length;
  pending.forEach((a) => {
    const sk = APPROVAL_TYPE_META[a.type]?.sectionKey || "misc";
    if (sk === "misc" && !hasAuthorizationManageAll(actor)) return;
    if (canAccessAuthorizationSection(actor, sk)) totalOpen += 1;
  });

  const groups = new Map();
  APPROVAL_UI_BLOCKS.forEach((b) => {
    if (b.kind === "queue") groups.set(b.key, []);
  });
  groups.set("misc", []);

  pending.forEach((a) => {
    const key = APPROVAL_TYPE_META[a.type]?.sectionKey;
    const safeKey = key && groups.has(key) ? key : "misc";
    if (!canAccessAuthorizationSection(actor, safeKey === "misc" ? "misc" : safeKey)) return;
    if (safeKey === "misc" && !hasAuthorizationManageAll(actor)) return;
    groups.get(safeKey).push(a);
  });

  ["portal_access", "transport_fleet", "workforce", "hr_absences", "payroll_pay", "misc"].forEach((gk) => {
    const arr = groups.get(gk);
    if (Array.isArray(arr) && arr.length > 1) {
      arr.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
    }
  });

  const heroItems = [{ label: "Bandeja total", value: totalOpen, tone: totalOpen ? "warn" : undefined }];
  if (canAccessAuthorizationSection(actor, "portal_registrations")) {
    heroItems.push({
      label: "Nuevas cuentas web",
      value: pendingUsers.length,
      tone: pendingUsers.length ? "warn" : undefined
    });
  }
  if (canAccessAuthorizationSection(actor, "transport_requests")) {
    heroItems.push({
      label: "Solicitudes pendientes",
      value: pendingTransportRequests.length,
      tone: pendingTransportRequests.length ? "warn" : undefined
    });
  }
  if (
    hasAuthorizationManageAll(actor) ||
    APPROVAL_UI_BLOCKS.some((b) => b.kind === "queue" && canAccessAuthorizationSection(actor, b.key))
  ) {
    const internalCt = pendingAll.filter((a) => {
      const sk = APPROVAL_TYPE_META[a.type]?.sectionKey || "misc";
      return sk !== "transport_requests" && sk !== "portal_registrations" && canAccessAuthorizationSection(actor, sk);
    }).length;
    heroItems.push({
      label: "Cola interna (aprobaciones)",
      value: internalCt,
      tone: internalCt ? "warn" : undefined
    });
  }
  const authHero = moduleFleetHeroStrip(heroItems);

  const transportSection = buildAuthorizationsTransportRequestsSection(pendingTransportRequests);
  const portalRegHtml = buildAuthorizationsPortalRegistrationsSection(pendingUsers);

  const miscRows = groups.get("misc") || [];
  const miscSectionHtml =
    miscRows.length > 0
      ? `<section class="auth-queue-section auth-queue-section--misc" data-auth-section="misc">
      <header class="auth-queue-section-head">
        <div class="auth-queue-section-title-row">
          <h3 class="auth-queue-section-title">Otras solicitudes (tipo no catalogado o histórico)</h3>
          <span class="auth-section-count">${miscRows.length} pendiente(s)</span>
        </div>
        <p class="muted auth-queue-section-desc">Ítems que no coinciden con una categoría definida (por ejemplo datos migrados o tipos reservados). Revise el detalle antes de aprobar.</p>
      </header>
      <div class="auth-queue-section-body">${buildPendingApprovalsTableHtml(miscRows)}</div>
    </section>`
      : "";

  const tabDefs = [];
  if (canAccessAuthorizationSection(actor, "portal_registrations")) {
    tabDefs.push({
      id: "portal_registrations",
      label: "Nuevas cuentas",
      count: pendingUsers.length,
      html: portalRegHtml
    });
  }
  if (canAccessAuthorizationSection(actor, "transport_requests")) {
    tabDefs.push({
      id: "transport_requests",
      label: "Solicitudes pendientes",
      count: pendingTransportRequests.length,
      html: transportSection
    });
  }
  APPROVAL_UI_BLOCKS.forEach((section) => {
    if (section.kind !== "queue") return;
    if (!canAccessAuthorizationSection(actor, section.key)) return;
    const rows = groups.get(section.key) || [];
    const countBadge = `<span class="auth-section-count">${rows.length} pendiente(s)</span>`;
    const tableOrEmpty = rows.length
      ? buildPendingApprovalsTableHtml(rows)
      : emptyState("No hay autorizaciones pendientes en esta categoría.");
    const html = `<section class="auth-queue-section" data-auth-section="${section.key}" aria-label="${escapeAttr(section.title)}">
      <header class="auth-queue-section-head">
        <div class="auth-queue-section-title-row">
          <h3 class="auth-queue-section-title">${section.title}</h3>
          ${countBadge}
        </div>
        <p class="muted auth-queue-section-desc">${section.description}</p>
      </header>
      <div class="auth-queue-section-body"><div class="auth-queue-scroll">${tableOrEmpty}</div></div>
    </section>`;
    tabDefs.push({
      id: section.key,
      label: AUTH_QUEUE_SHORT_TAB_LABELS[section.key] || section.title,
      count: rows.length,
      html
    });
  });
  if (miscRows.length && hasAuthorizationManageAll(actor)) {
    tabDefs.push({ id: "misc", label: "Otras colas", count: miscRows.length, html: miscSectionHtml });
  }

  if (!tabDefs.length) {
    return (
      authHero +
      pcardWrap(
        "shield",
        "Centro de aprobaciones",
        "Sin bandejas asignadas",
        emptyState("Su usuario no tiene permisos de autorización configurados. Solicite al administrador los accesos necesarios.")
      )
    );
  }

  const tabBar = `<div class="auth-tabs-bar" data-auth-tabs-bar role="tablist">${tabDefs
    .map(
      (t, i) =>
        `<button type="button" role="tab" class="auth-tab-btn ${i === 0 ? "is-active" : ""}" data-auth-tab="${escapeAttr(
          t.id
        )}" aria-selected="${i === 0 ? "true" : "false"}">${escapeHtml(t.label)} <span class="auth-tab-badge">${t.count}</span></button>`
    )
    .join("")}</div>`;
  const tabPanels = `<div class="auth-tab-panels">${tabDefs
    .map(
      (t, i) =>
        `<div class="auth-tab-panel ${i === 0 ? "is-active" : ""}" data-auth-panel="${escapeAttr(t.id)}" role="tabpanel" ${i === 0 ? "" : "hidden"}>${t.html}</div>`
    )
    .join("")}</div>`;
  const tabsWrap = `<div class="auth-tabs-layout">${tabBar}${tabPanels}</div>`;
  const authSearchToolbar = `<div class="transport-ops-toolbar authorizations-queue-search">
      <label class="transport-ops-search">
        <span class="muted">${IC.search || ""} Buscar en bandejas</span>
        <input type="search" data-action="auth-queue-search" value="${escapeAttr(authSearchRaw)}" placeholder="Nombre, correo, tipo, solicitud…" autocomplete="off" />
      </label>
    </div>`;

  const infoSectionsHtml = APPROVAL_UI_BLOCKS.filter((s) => s.kind === "info")
    .map(
      (section) =>
        `<section class="auth-queue-section auth-queue-section--info" data-auth-section="${section.key}">
      <header class="auth-queue-section-head">
        <h3 class="auth-queue-section-title">${section.title}</h3>
        <p class="muted auth-queue-section-desc">${section.description}</p>
      </header>
    </section>`
    )
    .join("");

  portalEnsureApiTokensAligned();

  const syncBanner = state.authorizationsSyncError
    ? `<div class="auth-sync-banner ${state.authorizationsSyncError.code === "PARCIAL" ? "auth-sync-banner--warn" : "auth-sync-banner--err"}" role="status">
        <strong>${escapeHtml(String(state.authorizationsSyncError.code || "Aviso"))}</strong>
        <span>${escapeHtml(String(state.authorizationsSyncError.message || ""))}</span>
      </div>`
    : "";
  const bodyInner = `${syncBanner}${authSearchToolbar}${tabsWrap}${
    infoSectionsHtml ? `<div class="auth-info-blocks">${infoSectionsHtml}</div>` : ""
  }`;
  return `<section class="authorizations-studio">${authHero}${pcardWrap(
      "shield",
      "Centro de aprobaciones",
      `${totalOpen} ítem(s) abierto(s) · Histórico cola local: ${approvedCt} aprob. / ${rejectedCt} rech.`,
      bodyInner
    )}</section>`;
}

function mountAuthorizationsTabs() {
  const shell = nodes.viewRoot && nodes.viewRoot.querySelector('.module-shell[data-module-view="authorizations"]');
  if (!shell) return;
  const bar = shell.querySelector("[data-auth-tabs-bar]");
  if (!bar) return;
  const activate = (id) => {
    const sid = String(id || "");
    bar.querySelectorAll("[data-auth-tab]").forEach((btn) => {
      const on = String(btn.getAttribute("data-auth-tab") || "") === sid;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    shell.querySelectorAll("[data-auth-panel]").forEach((panel) => {
      const on = String(panel.getAttribute("data-auth-panel") || "") === sid;
      panel.classList.toggle("is-active", on);
      if (on) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
    try {
      localStorage.setItem("antares_auth_tab", sid);
    } catch (_) {}
  };
  bar.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-auth-tab]");
    if (!btn || !bar.contains(btn)) return;
    e.preventDefault();
    activate(btn.getAttribute("data-auth-tab"));
  });
  let initial =
    bar.querySelector(".auth-tab-btn.is-active")?.getAttribute("data-auth-tab") ||
    bar.querySelector("[data-auth-tab]")?.getAttribute("data-auth-tab") ||
    "";
  try {
    const saved = localStorage.getItem("antares_auth_tab");
    if (saved && shell.querySelector(`[data-auth-panel="${saved}"]`)) initial = saved;
  } catch (_) {}
  if (initial) activate(initial);
}


function payrollDocDedupKeyForAuth(documentType, value) {
  const dt = String(documentType || "CC").toUpperCase();
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (dt === "PAS" || dt === "PEP") return raw.replace(/[.\s]/g, "").toUpperCase();
  return raw.replace(/\D/g, "");
}

function findPayrollEmployeeDuplicateForAuth(employees, documentType, idDoc, companyId) {
  const docType = String(documentType || "CC").toUpperCase();
  const needle = payrollDocDedupKeyForAuth(docType, idDoc);
  if (!needle) return null;
  const cid = String(companyId || "").trim();
  const list = Array.isArray(employees) ? employees : [];
  return (
    list.find((row) => {
      const rdt = String(row?.documentType || "CC").toUpperCase();
      if (rdt !== docType) return false;
      if (payrollDocDedupKeyForAuth(rdt, row?.idDoc) !== needle) return false;
      if (cid && String(row?.companyId || "").trim() !== cid) return false;
      return true;
    }) || null
  );
}

async function payrollEmployeeDuplicateBlocksAuthApproval(documentType, idDoc, companyId, employees) {
  const local = findPayrollEmployeeDuplicateForAuth(employees, documentType, idDoc, companyId);
  if (local) return local;
  const queryFn =
    typeof queryPayrollEmployeeDocumentDuplicateFromApi === "function"
      ? queryPayrollEmployeeDocumentDuplicateFromApi
      : typeof window.queryPayrollEmployeeDocumentDuplicateFromApi === "function"
        ? window.queryPayrollEmployeeDocumentDuplicateFromApi
        : null;
  if (!queryFn) return null;
  const remote = await queryFn({ documentType, idDoc, companyId });
  if (remote?.found && remote?.blocking) {
    return { name: remote.name || "", idDoc, id: remote.employeeId || "" };
  }
  return null;
}

function bindAuthorizationsPortalControls() {
  if (String(state.currentView || "") !== "authorizations" || !nodes.viewRoot) return;
  mountAuthorizationsTabs();

  nodes.viewRoot.querySelectorAll("[data-action='auth-queue-search']").forEach((input) => {
    input.addEventListener("input", () => {
      const el = /** @type {HTMLInputElement} */ (input);
      const len = String(el.value || "").length;
      const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
      const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
      state.authorizationsUi = { ...(state.authorizationsUi || {}), listSearch: String(el.value || "") };
      state.__authQueueSearchRestore = { start, end };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='approval-approve']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (btn.dataset.busy === "1") return;
      btn.dataset.busy = "1";
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      try {
      const id = String(btn.dataset.id || "");
      const approvals = read(KEYS.approvals, []);
      const approval = approvals.find((a) => a.id === id && a.status === "pendiente");
      const actor = currentUser();
      if (!approval || !actor || !canApproveInternalAuthorization(actor, approval.type)) return;

      if (approval.type === "create_user") {
        const p = approval.payload || {};
        let nextPasswordHash = String(p.passwordHash || "").trim();
        if (!nextPasswordHash) {
          const pwPol = validatePasswordPolicy(p.password || "");
          if (!pwPol.ok) {
            notify(userMessage(pwPol.key), "error");
            return;
          }
          nextPasswordHash = await hashPassword(p.password || "");
        }
        const users = read(KEYS.users, []);
        if (!users.some((u) => normalizeEmail(u.email) === normalizeEmail(p.email))) {
          const compName = p.companyName || getCompanyById(p.companyId)?.name || "";
          users.push({
            id: newUuidV4(),
            name: normalizeLatinUpperForDb(p.name),
            email: normalizeEmail(p.email),
            password: nextPasswordHash,
            role: p.role,
            documentType: p.documentType || "CC",
            personType: normalizePersonTypeForDb(p.personType),
            documentIssuedAt: p.documentIssuedAt || "",
            accountStatus: ACCOUNT_STATUS.APROBADO,
            company: normalizeLatinUpperForDb(compName),
            companyId: p.companyId,
            taxId: p.taxId,
            phone: normalizePortalPhoneForStorage(p.phone || ""),
            city: normalizeLatinForDb(p.city || ""),
            department: normalizeLatinForDb(p.department || ""),
            address: normalizeLatinUpperForDb(p.address || ""),
            permissions: normalizeSavedUserPermissions(
              p.role,
              p.permissions || defaultPermissionsForRole(p.role)
            ),
            createdAt: nowIso(),
            registeredAt: nowIso()
          });
          const createdUser = users[users.length - 1];
          try {
            await writeAwaitServerCreate(KEYS.users, users, createdUser);
          } catch (err) {
            notify(String(err?.message || userMessage("genericError")), "error");
            return;
          }
        }
      } else if (approval.type === "create_employee") {
        const employees = read(KEYS.payrollEmployees, []);
        const payload = { ...approval.payload };
        const pos = payload.positionId ? getPositionById(String(payload.positionId)) : null;
        if (pos) {
          payload.position = pos.name;
          payload.workerRole = pos.workerRole || payload.workerRole || "empleado";
          payload.contractType = payload.contractType || pos.contractTypeDefault || "Termino indefinido";
        }
        const docType = String(payload.documentType || "CC").toUpperCase();
        const idDoc = String(payload.idDoc || "").trim();
        const companyId = String(payload.companyId || "").trim();
        const existingEmployee = await payrollEmployeeDuplicateBlocksAuthApproval(
          docType,
          idDoc,
          companyId,
          employees
        );
        if (!existingEmployee) {
          const created = stampCreatedRecord({
            id: newUuidV4(),
            workerRole: payload.workerRole || "empleado",
            ...payload
          });
          const nextEmployees = [...employees, created];
          try {
            await writeAwaitServerCreate(KEYS.payrollEmployees, nextEmployees, created, {
              notifyOnFailure: false
            });
          } catch (err) {
            write(KEYS.payrollEmployees, employees, { skipSyncSchedule: true });
            notify(userMessage("employeeSaveServerFail", err?.message), "error");
            return;
          }
          appendPayrollEmployeeAuditLog("create", created);
          const propagate = await propagateEmployeeChanges(created, {
            license: created.license,
            licenseCategory: created.licenseCategory,
            licenseExpiry: created.licenseExpiry,
            isNewHire: true
          });
          if (!propagate.ok) {
            notify(propagate.message || userMessage("employeeCreatedDriverSyncFail"), "error");
            return;
          }
        } else {
          notify(userMessage("authApprovalEmployeeAlreadyExists", idDoc), "info");
        }
      } else if (approval.type === "update_employee") {
        const employees = read(KEYS.payrollEmployees, []);
        const payload = { ...approval.payload };
        const employeeId = String(payload.employeeId || "").trim();
        if (!employeeId) {
          notify(userMessage("employeeDeleteNotFound"), "error");
          return;
        }
        const idx = employees.findIndex((row) => String(row.id) === employeeId);
        if (idx < 0) {
          notify(userMessage("employeeDeleteNotFound"), "error");
          return;
        }
        delete payload.employeeId;
        const pos = payload.positionId ? getPositionById(String(payload.positionId)) : null;
        if (pos) {
          payload.position = pos.name;
          payload.workerRole = pos.workerRole || payload.workerRole || employees[idx].workerRole || "empleado";
          payload.contractType = payload.contractType || pos.contractTypeDefault || employees[idx].contractType || "Termino indefinido";
        }
        const previousEmployee = employees[idx];
        const merged = stampUpdatedRecord({
          ...previousEmployee,
          ...payload,
          id: employeeId,
          avatarUrl:
            String(payload.avatarUrl || "").trim() || previousEmployee.avatarUrl || ""
        });
        employees[idx] = merged;
        try {
          await writeAwaitServerEdit(KEYS.payrollEmployees, employees, employeeId, { notifyOnFailure: false });
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
        appendPayrollEmployeeAuditLog("update", merged, { previous: previousEmployee });
        const propagate = await propagateEmployeeChanges(merged, {
          license: merged.license,
          licenseCategory: merged.licenseCategory,
          licenseExpiry: merged.licenseExpiry
        });
        if (!propagate.ok) {
          notify(propagate.message || userMessage("employeeCreatedDriverSyncFail"), "error");
          return;
        }
        await refreshPayrollDraftsLinked(employeeId, null, null, { notifyOnError: false });
        try {
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
        } catch (_e) {}
      } else if (approval.type === "create_driver") {
        const drivers = read(KEYS.drivers, []);
        const driverRow = normalizeDriverFormPayloadForStorage({ ...approval.payload });
        const createdDriver = stampCreatedRecord({
          id: newUuidV4(),
          ...driverRow,
          available: true,
          hiredAt: nowIso()
        });
        drivers.push(createdDriver);
        try {
          await writeAwaitServerCreate(KEYS.drivers, drivers, createdDriver);
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
        const employees = read(KEYS.payrollEmployees, []);
        const existsEmployee = employees.some((e) => String(e.idDoc || "") === String(approval.payload.idDoc || ""));
        if (!existsEmployee) {
          const createdEmployee = stampCreatedRecord({
            id: newUuidV4(),
            name: normalizeLatinUpperForDb(approval.payload.name),
            idDoc: approval.payload.idDoc,
            documentType: approval.payload.documentType || "CC",
            position: "CONDUCTOR",
            contractType: normalizeLatinUpperForDb(approval.payload.contractType || "Indefinido"),
            workerRole: "conductor",
            city: normalizeLatinForDb(approval.payload.city || ""),
            address: normalizeLatinUpperForDb(approval.payload.address || ""),
            phone: normalizePortalPhoneForStorage(approval.payload.phone || ""),
            emergencyContact: normalizeLatinUpperForDb(approval.payload.emergencyContact || ""),
            emergencyPhone: normalizePortalPhoneForStorage(approval.payload.emergencyPhone || ""),
            companyId: approval.payload.companyId || "",
            baseSalary: parseNum(approval.payload.baseSalary),
            payFrequency: "Mensual",
            startDate: approval.payload.startDate || nowIso().slice(0, 10)
          });
          employees.push(createdEmployee);
          try {
            await writeAwaitServerCreate(KEYS.payrollEmployees, employees, createdEmployee);
          } catch (err) {
            notify(String(err?.message || userMessage("genericError")), "error");
            return;
          }
          appendPayrollEmployeeAuditLog("create", createdEmployee, {
            summary: "CONDUCTOR · vinculado desde aprobación de conductor",
            actor: String(actor?.email || actor?.name || "—").trim()
          });
          const propagate = await propagateEmployeeChanges(createdEmployee, {
            license: createdEmployee.license,
            licenseCategory: createdEmployee.licenseCategory,
            licenseExpiry: createdEmployee.licenseExpiry,
            isNewHire: true
          });
          if (!propagate.ok) {
            notify(
              propagate.message ||
                "Conductor aprobado; no fue posible registrar el contrato del empleado vinculado.",
              "error"
            );
          }
        }
        try {
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
        } catch (_e) {}
      } else if (approval.type === "register_hr_absence") {
        const absenceRow = {
          ...approval.payload,
          id: isUuidString(approval.payload?.id) ? String(approval.payload.id).trim() : newUuidV4(),
          createdAt: String(approval.payload?.createdAt || nowIso()),
          approvedBy: actor.name,
          approvedAt: nowIso()
        };
        const absences = read(KEYS.hrAbsences, []);
        absences.unshift(absenceRow);
        try {
          await writeAwaitServerCreate(KEYS.hrAbsences, absences, absenceRow, { notifyOnFailure: false });
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
        const payload = approval.payload || {};
        await refreshPayrollDraftsLinked(payload.employeeId, payload.startDate, payload.endDate, {
          notifyOnError: false
        });
      } else if (approval.type === "mark_payroll_paid") {
        const payrollRunId = String(approval.payload?.payrollRunId || "");
        if (!payrollRunId) {
          notify(userMessage("paymentNoSettlement"), "error");
          return;
        }
        const runs = read(KEYS.payrollRuns, []);
        const targetRun = runs.find((r) => r.id === payrollRunId);
        if (!targetRun) {
          notify(userMessage("settlementNotFound"), "error");
          return;
        }
        try {
          const approver = String(actor?.name || actor?.email || "").trim();
          const nextRuns = runs.map((r) =>
              r.id === payrollRunId
                ? stampUpdatedRecord({
                    ...r,
                    paid: true,
                    paidAt: nowIso(),
                    approvedBy: approver
                  })
                : r
            );
          await writeAwaitServerEdit(KEYS.payrollRuns, nextRuns, payrollRunId);
          appendPayrollRunAuditLog("update", targetRun, {
            summary: `Pago aprobado vía autorizaciones · aprobado por ${approver} · neto $${parseNum(targetRun.net).toLocaleString("es-CO")}`
          });
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
      } else if (approval.type === "approve_trip_request") {
        const requestId = String(approval.payload.requestId || "");
        const request = reqRead().find((item) => item.id === requestId);
        if (!request) {
          notify(userMessage("approvalLinkedRequestMissing"), "error");
          return;
        }

        const needsTermoking = requestRequiresTermoking(request);
        void refreshTransportScheduleBusyFromApi(request, requestId);
        const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
        const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
        const vehicleCandidates = getVehicleCandidatesForRequest(request, requestId);
        const driverCandidates = getDriverCandidatesForRequest(request, requestId);
        const tripRateUi = buildTripRateModalFields(request, { required: false });

        openEditModal({
          title: "Aprobar solicitud de viaje",
          subtitle: "",
          introHtml: buildTripApprovalHeroHtml(request, needsTermoking, "auth"),
          extraModalCardClass: "modal-card-edit--approve-trip modal-card-edit--assign-revamp",
          submitText: "Aprobar",
          afterMount: (formEl) => {
            if (typeof tripRateUi.afterMount === "function") tripRateUi.afterMount(formEl);
            wireTripAssignmentScheduleBusyRefresh(formEl, request, requestId, needsTermoking);
          },
          fields: [
            {
              type: "section",
              id: "auth-approve-hint",
              title: "Asignación opcional",
              hint: "Puede aprobar sin asignar. Si completa vehículo y conductor, indique precio."
            },
            {
              name: "vehicleId",
              labelHtml: `${IC.truck}<span>Vehículo</span>`,
              type: "select",
              searchable: true,
              searchablePlaceholder: "Buscar por placa, tipo o capacidad…",
              full: true,
              options: [
                { value: "", label: "Dejar sin asignar por ahora" },
                ...vehicleCandidates.map((vehicle) => ({
                  value: vehicle.id,
                  disabled: Boolean(vehicle.isBusy || vehicle.isUnavailable || vehicle.hasExpiredDocs || vehicle.wrongTruckType),
                  label: tripAssignmentVehicleOptionLabel(vehicle, {
                    needsTermoking,
                    isBusy: vehicle.isBusy,
                    isUnavailable: vehicle.isUnavailable,
                    hasExpiredDocs: vehicle.hasExpiredDocs,
                    wrongTruckType: vehicle.wrongTruckType,
                    requestTruckType: normalizeRequestRequiredTruckType(request?.vehicleType)
                  })
                }))
              ]
            },
            {
              name: "driverId",
              labelHtml: `${IC.user}<span>Conductor</span>`,
              type: "select",
              searchable: true,
              searchablePlaceholder: "Buscar por nombre, documento o teléfono…",
              full: true,
              options: [
                { value: "", label: "Dejar sin asignar por ahora" },
                ...driverCandidates.map((driver) => ({
                  value: driver.id,
                  disabled: Boolean(driver.isBusy || driver.isUnavailable || driver.hasExpiredDocs),
                  label: tripAssignmentDriverOptionLabel(driver, {
                    isBusy: driver.isBusy,
                    isUnavailable: driver.isUnavailable,
                    hasExpiredDocs: driver.hasExpiredDocs
                  })
                }))
              ]
            },
            {
              type: "section",
              id: "auth-approve-price",
              title: "Precio del viaje",
              hint: "Obligatorio solo si hay asignación completa."
            },
            ...tripRateUi.fields.map((tf) => ({ ...tf, full: true }))
          ],
          onSubmit: async (form) => {
            const vehicleId = String(form.vehicleId || "").trim();
            const driverId = String(form.driverId || "").trim();
            const tripValue = parseNum(form.tripValue);
            const schedPickup = requestSchedulingPickupIso(request);
            const schedDelivery = requestSchedulingDeliveryIso(request);

            const authForm = document.getElementById("crud-form");
            if ((vehicleId && !driverId) || (!vehicleId && driverId)) {
              failPortalField(authForm, vehicleId ? "driverId" : "vehicleId", userMessage("assignAutoPickResources"));
              return false;
            }
            if (vehicleId && driverId && tripValue <= 0) {
              failPortalField(authForm, "tripValue", userMessage("assignPriceRequired"));
              return false;
            }
            if (vehicleId && driverId) {
              await refreshTransportScheduleBusyFromApi(request, requestId);
              if (
                notifyScheduleConflictIfAny(schedPickup, schedDelivery, requestId, "vehículo", (t) =>
                  String(t.vehicleId || "").trim() === vehicleId
                )
              ) {
                return false;
              }
              if (
                notifyScheduleConflictIfAny(schedPickup, schedDelivery, requestId, "conductor", (t) =>
                  String(t.driverId || "").trim() === driverId
                )
              ) {
                return false;
              }
            }
            if (vehicleId && driverId && (!compatibleVehicles.some((v) => v.id === vehicleId) || !compatibleDrivers.some((d) => d.id === driverId))) {
              notify(userMessage("assignResourcesBusy"), "error");
              return false;
            }

            const ok =
              vehicleId && driverId
                ? await approveRequest(requestId, actor.name, false, vehicleId, driverId, tripValue, {
                    allowApproveAndAssign: true
                  })
                : await approveRequest(requestId, actor.name, true);

            if (!ok) {
              notify(userMessage("approvalResourcesFailed"), "error");
              return false;
            }

            const latestApprovals = read(KEYS.approvals, []);
            try {
              await writeAwaitServerEdit(
                KEYS.approvals,
                latestApprovals.map((a) =>
                  a.id === id ? { ...a, status: "aprobado", reviewedAt: nowIso(), reviewedBy: actor.name } : a
                ),
                id
              );
            } catch (err) {
              notify(String(err?.message || "No fue posible guardar la autorización en el servidor."), "error");
              return false;
            }

            suppressSelfInboxPollToastIfRecipientIsCurrentUser(request?.clientUserId);
            notify(
              vehicleId && driverId ? userMessage("authApprovalWithTrip") : userMessage("authApprovalPendingManual"),
              "success"
            );
            renderPortalView();
            return true;
          }
        });
        return;
      }

      try {
        await writeAwaitServerEdit(
          KEYS.approvals,
          approvals.map((a) =>
            a.id === id ? { ...a, status: "aprobado", reviewedAt: nowIso(), reviewedBy: actor.name } : a
          ),
          id
        );
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la autorización en el servidor."), "error");
        return;
      }
      notify(userMessage("authApprovalOk"), "success");
      logPortalAuditEvent?.("authorizations", "update", {
        entityId: id,
        entityLabel: String(approval.title || approval.type || "Autorización"),
        summary: `Autorización aprobada · ${String(approval.type || "interna")}`,
        actor: String(actor?.email || actor?.name || "")
      });
      renderPortalView();
      } finally {
        btn.dataset.busy = "0";
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
      }
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='approval-reject']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      const approval = read(KEYS.approvals, []).find((a) => String(a.id) === id && a.status === "pendiente");
      if (!approval || !canApproveInternalAuthorization(currentUser(), approval.type)) return;
      openEditModal({
        title: "Rechazar autorización",
        subtitle: "Motivo obligatorio",
        submitText: "Rechazar",
        fields: [{ name: "reason", label: "Motivo", value: "", required: true }],
        onSubmit: async (form) => {
          const reason = String(form.reason || "").trim();
          if (!reason) return false;
          const actor = currentUser();
          const approvals = read(KEYS.approvals, []);
          try {
            await writeAwaitServerEdit(
              KEYS.approvals,
              approvals.map((a) =>
                a.id === id
                  ? { ...a, status: "rechazado", reviewedAt: nowIso(), reviewedBy: actor?.name || "Admin", rejectionReason: reason }
                  : a
              ),
              id
            );
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el rechazo en el servidor."), "error");
            return false;
          }
          notify(userMessage("authRejectOk"), "success");
          logPortalAuditEvent?.("authorizations", "delete", {
            entityId: id,
            entityLabel: String(approval.title || approval.type || "Autorización"),
            summary: `Autorización rechazada · ${reason}`,
            actor: String(actor?.email || actor?.name || "")
          });
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='view-contract']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const c = read(KEYS.contracts, []).find((x) => x.id === btn.dataset.id);
      if (!c) return;
      const employee = c.employeeId ? read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(c.employeeId)) : null;
      const displayName = c.candidateName || c.employeeName || employee?.name || "Contrato";
      const docId = String(c.idDocSnapshot || employee?.idDoc || "").trim();
      const salaryVal = parseNum(c.salary);
      const templateKind = String(c.contractTemplateKind || c.templateKind || "").trim().toLowerCase();
      const contractType = String(c.contractType || employee?.contractType || "").trim();
      const workerRole = String(c.workerRole || employee?.workerRole || "empleado");

      try {
        if (employee && validateEmployeeContractDocFields(employee).length === 0) {
          await generateOfficialWordContract(
            buildEmployeeContractDocxPayload(employee, {
              contractTemplateKind: templateKind,
              signDate: c.startDate || employee.startDate
            })
          );
        } else {
          const salLet =
            salaryVal > 0 && window.RecruitmentDomain?.formatSalarioLetrasPesos
              ? window.RecruitmentDomain.formatSalarioLetrasPesos(salaryVal)
              : "";
          await generateOfficialWordContract({
            contractTemplateKind: templateKind,
            contractType,
            workerRole,
            nombre_empleado: displayName,
            cedula_empleado: docId,
            ciudad_empleado: String(employee?.city || c.companyName || "").trim(),
            departamento_empleado: String(employee?.department || "").trim(),
            banco_cuenta_bancaria: String(employee?.bankName || "").trim(),
            cuenta_bancaria: String(employee?.bankAccount || "").trim(),
            salario: salaryVal,
            salario_letras: salLet || "",
            duracion_contrato: describeContractDurationForDocx({
              contractType: contractType || "Termino indefinido",
              startDate: c.startDate || "",
              endDate: c.endDate || ""
            }),
            cargo_empleado: String(c.position || c.positionName || employee?.position || ""),
            signDate: c.startDate
          });
        }
        notify(userMessage("wordTemplatesRedownloaded"), "success");
      } catch (err) {
        const popup = window.open("", "_blank", "width=800,height=900");
        popup.document.write(`
        <html>
          <head><title>Contrato</title></head>
          <body style="font-family:Arial;padding:28px">
            <h1>Contrato laboral (resumen interno)</h1>
            <p class="muted">No se pudo regenerar el Word: ${escapeHtml(String(err?.message || err))}</p>
            <pre style="white-space:pre-wrap;font-size:15px;line-height:1.6">${escapeHtml(String(c.content || ""))}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
        popup.document.close();
      }
    });
  });

  const authSearchRestore = state.__authQueueSearchRestore;
  if (authSearchRestore && typeof authSearchRestore.start === "number") {
    delete state.__authQueueSearchRestore;
    queueMicrotask(() => {
      const root = nodes.viewRoot;
      if (!root || String(state.currentView || "") !== "authorizations") return;
      const inp = root.querySelector("[data-action='auth-queue-search']");
      if (!inp || typeof inp.focus !== "function") return;
      inp.focus();
      if (typeof inp.setSelectionRange === "function") {
        const n = String(inp.value || "").length;
        const s = Math.max(0, Math.min(authSearchRestore.start, n));
        const e = Math.max(0, Math.min(authSearchRestore.end ?? authSearchRestore.start, n));
        inp.setSelectionRange(s, e);
      }
    });
  }
}

(function registerAuthorizationsPortalBinds() {
  "use strict";
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.authorizations = bindAuthorizationsPortalControls;
})();

(function registerAuthorizationsLegacyViews() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ authorizationsHtml, buildAuthorizationsPortalRegistrationsSection });
})();