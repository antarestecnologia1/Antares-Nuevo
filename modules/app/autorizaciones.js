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
  const pending = approvals.filter((a) => a.status === "pendiente");
  const approvedCt = approvals.filter((a) => a.status === "aprobado").length;
  const rejectedCt = approvals.filter((a) => a.status === "rechazado").length;
  const pendingUsers = read(KEYS.users, []).filter((u) => isPortalUserPendingApproval(u));
  const pendingTransportRequests = sortAuthQueueByDateDesc(
    reqRead().filter((r) => r.status === STATUS.PENDIENTE),
    (r) => r.createdAt
  );
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
    const internalCt = pending.filter((a) => {
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
  const bodyInner = `${syncBanner}${tabsWrap}${
    infoSectionsHtml ? `<div class="auth-info-blocks">${infoSectionsHtml}</div>` : ""
  }`;
  return (
    authHero +
    pcardWrap(
      "shield",
      "Centro de aprobaciones",
      `${totalOpen} ítem(s) abierto(s) · Histórico cola local: ${approvedCt} aprob. / ${rejectedCt} rech.`,
      bodyInner
    )
  );
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


function bindAuthorizationsPortalControls() {
  if (String(state.currentView || "") !== "authorizations" || !nodes.viewRoot) return;
  mountAuthorizationsTabs();

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
            )
          });
          try {
            await writeAwaitServer(KEYS.users, users);
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
        employees.push({ id: newUuidV4(), workerRole: payload.workerRole || "empleado", ...payload });
        try {
          await writeAwaitServer(KEYS.payrollEmployees, employees);
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
      } else if (approval.type === "create_driver") {
        const drivers = read(KEYS.drivers, []);
        const driverRow = normalizeDriverFormPayloadForStorage({ ...approval.payload });
        drivers.push({ id: newUuidV4(), ...driverRow, available: true, hiredAt: nowIso() });
        try {
          await writeAwaitServer(KEYS.drivers, drivers);
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
        const employees = read(KEYS.payrollEmployees, []);
        const existsEmployee = employees.some((e) => String(e.idDoc || "") === String(approval.payload.idDoc || ""));
        if (!existsEmployee) {
          employees.push({
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
          try {
            await writeAwaitServer(KEYS.payrollEmployees, employees);
          } catch (err) {
            notify(String(err?.message || userMessage("genericError")), "error");
            return;
          }
        }
        try {
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
        } catch (_e) {}
      } else if (approval.type === "register_hr_absence") {
        const absences = read(KEYS.hrAbsences, []);
        absences.unshift({
          ...approval.payload,
          id: isUuidString(approval.payload?.id) ? String(approval.payload.id).trim() : newUuidV4(),
          approvedBy: actor.name,
          approvedAt: nowIso()
        });
        try {
          await writeAwaitServer(KEYS.hrAbsences, absences);
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
          await writeAwaitServer(
            KEYS.payrollRuns,
            runs.map((r) => (r.id === payrollRunId ? { ...r, paid: true, paidAt: nowIso(), paidApprovedBy: actor.name } : r))
          );
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

            if ((vehicleId && !driverId) || (!vehicleId && driverId)) {
              notify(userMessage("assignAutoPickResources"), "error");
              return false;
            }
            if (vehicleId && driverId && tripValue <= 0) {
              notify(userMessage("assignPriceRequired"), "error");
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

            const ok = vehicleId && driverId
              ? approveRequest(requestId, actor.name, false, vehicleId, driverId, tripValue, {
                  allowApproveAndAssign: true
                })
              : approveRequest(requestId, actor.name, true);

            if (!ok) {
              notify(userMessage("approvalResourcesFailed"), "error");
              return false;
            }

            const latestApprovals = read(KEYS.approvals, []);
            try {
              await writeAwaitServer(
                KEYS.approvals,
                latestApprovals.map((a) =>
                  a.id === id ? { ...a, status: "aprobado", reviewedAt: nowIso(), reviewedBy: actor.name } : a
                )
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
        await writeAwaitServer(
          KEYS.approvals,
          approvals.map((a) =>
            a.id === id ? { ...a, status: "aprobado", reviewedAt: nowIso(), reviewedBy: actor.name } : a
          )
        );
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la autorización en el servidor."), "error");
        return;
      }
      notify(userMessage("authApprovalOk"), "success");
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
            await writeAwaitServer(
              KEYS.approvals,
              approvals.map((a) =>
                a.id === id
                  ? { ...a, status: "rechazado", reviewedAt: nowIso(), reviewedBy: actor?.name || "Admin", rejectionReason: reason }
                  : a
              )
            );
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el rechazo en el servidor."), "error");
            return false;
          }
          notify(userMessage("authRejectOk"), "success");
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
            <p class="muted">No se pudo regenerar el Word: ${String(err?.message || err).replace(/</g, "&lt;")}</p>
            <pre style="white-space:pre-wrap;font-size:15px;line-height:1.6">${c.content}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
        popup.document.close();
      }
    });
  });
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