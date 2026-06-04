/**
 * Centro de aprobaciones / autorizaciones.
 * Extraído desde app.js — carga con defer después de app.js.
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


(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({authorizationsHtml, buildAuthorizationsPortalRegistrationsSection});
})();
