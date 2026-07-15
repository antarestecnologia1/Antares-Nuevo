/**
 * Usuarios y permisos — permisos granulares y administración.
 * Extraído desde app.js — carga con defer después de app.js.
 */
/**
 * Casillas de permisos granulares (admin). Centralizado para reutilizar en HTML y al
 * cambiar el usuario seleccionado en el formulario de permisos.
 */
function permissionCheckboxHtml(permission, sel, readOnly) {
  const meta = PERMISSION_META[permission] || { title: permission, desc: "" };
  const checked = sel.has(permission) ? "checked" : "";
  const dis = readOnly ? " disabled" : "";
  return `<label class="perm-check">
      <input type="checkbox" name="permissions" value="${escapeAttr(permission)}" ${checked}${dis} />
      <span><strong>${escapeHtml(String(meta.title || ""))}</strong><small>${escapeHtml(String(meta.desc || ""))}</small></span>
    </label>`;
}

function buildGranularPermissionsCheckboxesHtml(selected = [], opts = {}) {
  const readOnly = Boolean(opts.readOnlyAllChecked);
  const allowed = new Set(ALL_PERMISSIONS);
  const sel = new Set(
    readOnly
      ? ALL_PERMISSIONS
      : (Array.isArray(selected) ? selected : []).filter((p) => allowed.has(p))
  );
  const grouped = new Set();
  const sections = PERMISSION_UI_GROUPS.map((group) => {
    const items = group.permissions.filter((p) => allowed.has(p));
    items.forEach((p) => grouped.add(p));
    if (!items.length) return "";
    return `<div class="perm-group">
      <p class="perm-group-title">${escapeHtml(group.title)}</p>
      <div class="perm-group-grid">${items.map((p) => permissionCheckboxHtml(p, sel, readOnly)).join("")}</div>
    </div>`;
  }).join("");
  const rest = ALL_PERMISSIONS.filter((p) => !grouped.has(p));
  const restHtml = rest.length
    ? `<div class="perm-group">
      <p class="perm-group-title">Otros</p>
      <div class="perm-group-grid">${rest.map((p) => permissionCheckboxHtml(p, sel, readOnly)).join("")}</div>
    </div>`
    : "";
  return sections + restHtml;
}

function adminUsersHtml(current) {
  const isAdmin = isAdminActor(current);
  const users = read(KEYS.users, []);
  const companies = read(KEYS.companies, []);
  const ui = getAdminUsersUi();
  const editingUser = ui.editUserId
    ? users.find((u) => String(u.id) === String(ui.editUserId))
    : null;
  const editingCompanyRaw = ui.editCompanyId ? companies.find((c) => String(c.id) === String(ui.editCompanyId)) : null;
  const editingCompany = editingCompanyRaw ? normalizePortalBootstrapCompanyRow(editingCompanyRaw) : null;
  const editingCompanyDeptKey = editingCompany
    ? matchColombiaDepartmentToCatalogKey(editingCompany.department || "")
    : "";
  const editingCompanyCityCanon = editingCompany
    ? matchColombiaCityInDepartment(editingCompanyDeptKey, editingCompany.city || "")
    : "";
  const editingCompanyLogoUrl = editingCompany ? String(editingCompany.logoUrl || "").trim() : "";

  const companiesAssignable = companies.filter((c) => isCompanyRecordActive(c));

  const companyOptions = companiesAssignable
    .map(
      (c) =>
        `<option value="${c.id}">${escapeHtml(String(c.name || ""))} (${escapeHtml(companyKindLabel(c.companyKind))})</option>`
    )
    .join("");
  const companyEditOptions = editingUser
    ? companies
        .map((c) => {
          const id = String(c.id ?? "");
          const selected = String(editingUser.companyId ?? "") === id ? " selected" : "";
          const inactiveMark = !isCompanyRecordActive(c) ? " · Inactiva" : "";
          return `<option value="${escapeAttr(id)}"${selected}>${escapeHtml(String(c.name || ""))}${c.taxId ? ` (${escapeHtml(String(c.taxId))})` : ""} · ${escapeHtml(companyKindLabel(c.companyKind))}${inactiveMark}</option>`;
        })
        .join("")
    : "";

  const genderOptsEdit = editingUser
    ? selectOptionsFromCatalog(CO_CATALOGS.genders, editingUser.gender, "— Sin especificar —")
    : "";

  const userOptions = users
    .map(
      (u) =>
        `<option value="${escapeAttr(String(u.id ?? ""))}">${escapeHtml(String(u.name || ""))} (${escapeHtml(String(u.role || ""))})${String(u.id) === String(current.id) ? " · tu perfil" : ""}</option>`
    )
    .join("");

  const permissionChecks = (selected = []) => buildGranularPermissionsCheckboxesHtml(selected);

  const statusBadge = (s) => {
    if (s === ACCOUNT_STATUS.APROBADO) return `<span class="status status-viaje_asignado">Aprobado</span>`;
    if (s === ACCOUNT_STATUS.PENDIENTE) return `<span class="status status-pendiente">Pendiente</span>`;
    if (s === ACCOUNT_STATUS.RECHAZADO) return `<span class="status status-rechazada">Rechazado</span>`;
    return `<span class="status status-viaje_asignado">Aprobado</span>`;
  };

  const roleBadge = (r) => {
    const colors = {
      admin: "#377cc0",
      rrhh: "#7C3AED",
      administracion: "#1D4ED8",
      auxiliar_administrativo: "#0EA5E9",
      lider_administrativo: "#4F46E5",
      logistica: "#0D9488",
      client: "#0E7490"
    };
    const chipLabel = formatPortalRoleChipLabel(r);
    const fullLabel = formatPortalRoleLabel(r);
    const titleAttr = chipLabel !== fullLabel ? ` title="${escapeAttr(fullLabel)}"` : "";
    return `<span class="role-chip role-chip--card"${titleAttr} style="--role-color:${colors[r] || '#64748B'}">${escapeHtml(chipLabel)}</span>`;
  };

  const renderUserCard = (u, mode = "active") => {
    const namedPerms = effectiveUserPermissions(u).map((p) => PERMISSION_META[p]?.title || p);
    const visiblePerms = namedPerms.slice(0, 2);
    const hiddenCount = Math.max(0, namedPerms.length - visiblePerms.length);
    const isMe = u.id === current.id;
    const isPending = mode === "pending";
    const companyName = String(getCompanyById(u.companyId)?.name || u.company || "Sin empresa");
    const locationLabel = u.city ? `${String(u.city)}${u.department ? `, ${String(u.department)}` : ""}` : "Sin ubicacion";
    const permissionCount = namedPerms.length;
    const resolvedRegKind = resolveUserRegistrationKind(u);
    const profileChipLabel = resolvedRegKind ? registrationKindChipLabel(resolvedRegKind) : "—";
    const profileChipTitle = resolvedRegKind ? registrationKindLabel(resolvedRegKind) : "";
    const joinedLabel = fmtDateOr(u.systemJoinDate || u.registeredAt || u.createdAt, "—");
    const docLabel = String(u.idDoc || u.taxId || "").trim() || "Sin documento";
    const phoneLabel = u.phone ? formatPortalPhoneForDisplay(String(u.phone)) : "Sin teléfono";
    const accountStatusKey = normalizeUserAccountStatus(u);
    const accountStatusLabel =
      accountStatusKey === ACCOUNT_STATUS.PENDIENTE
        ? "Pendiente"
        : accountStatusKey === ACCOUNT_STATUS.RECHAZADO
          ? "Inactiva"
          : "Activa";
    const summaryTitle = isPending
      ? "Pendiente"
      : accountStatusKey === ACCOUNT_STATUS.RECHAZADO
        ? "Inactiva"
        : "Activa";
    const summaryCopy = [
      companyName !== "Sin empresa" ? companyName : "",
      locationLabel !== "Sin ubicacion" ? locationLabel : "",
      joinedLabel !== "—" ? joinedLabel : ""
    ]
      .filter(Boolean)
      .join(" · ") || "Sin datos";
    const userOpsTone = isPending
      ? "warn"
      : accountStatusKey === ACCOUNT_STATUS.RECHAZADO
        ? "alert"
        : "ok";
    const roleTag = u.role ? roleBadge(u.role) : directoryPillHtml("Sin rol", "warn");
    const emailLine = String(u.email || "Sin correo");
    const locationOnly = locationLabel !== "Sin ubicacion" ? locationLabel : "";
    const contactSublineHtml = locationOnly
      ? `<p class="directory-card__subline directory-card__subline--email">${escapeHtml(emailLine)}</p><p class="directory-card__subline">${escapeHtml(locationOnly)}</p>`
      : `<p class="directory-card__subline directory-card__subline--email">${escapeHtml(emailLine)}</p>`;
    const permPreview = namedPerms.length
      ? [
          ...visiblePerms.map((label) => `<span class="perm-tag">${escapeHtml(label)}</span>`),
          hiddenCount > 0 ? `<span class="perm-tag perm-tag-more">+${hiddenCount} mas</span>` : ""
        ].join("")
      : "";
    const rejectionReason = String(u.rejectionReason || "").trim();
    const note = isPending
      ? '<div class="directory-card__banner directory-card__banner--warn"><strong>Pendiente.</strong> Empresa, rol y permisos.</div>'
      : rejectionReason
        ? `<div class="directory-card__banner directory-card__banner--alert"><strong>Inactiva.</strong> ${escapeHtml(rejectionReason)}</div>`
      : "";
    const viewButton = `<button class="btn btn-sm btn-outline" data-action="view-user" data-id="${escapeAttr(String(u.id))}">${IC.eye} Ver</button>`;
    const actions = isPending
      ? `<footer class="directory-card__actions">
          ${viewButton}
          ${isAdmin ? `<button class="btn btn-sm btn-primary" data-action="approve-registration" data-id="${escapeAttr(String(u.id))}">${IC.check} Aprobar</button>` : ""}
          ${isAdmin ? `<button class="btn btn-sm btn-reject" data-action="reject-registration" data-id="${escapeAttr(String(u.id))}">${IC.x} Rechazar</button>` : ""}
        </footer>`
      : `<footer class="directory-card__actions">
          ${viewButton}
          ${isAdmin ? `<button class="btn btn-sm btn-action" data-action="open-edit-user" data-id="${escapeAttr(String(u.id))}">${IC.edit} Editar</button>` : ""}
          ${isAdmin && !isMe ? `<button class="btn btn-sm btn-action" data-action="toggle-user-active" data-id="${escapeAttr(String(u.id))}">${u.accountStatus === ACCOUNT_STATUS.RECHAZADO ? `${IC.check} Activar` : `${IC.x} Desactivar`}</button>` : ""}
          ${isAdmin && !isMe ? `<button class="btn btn-sm btn-reject" data-action="delete-user" data-id="${escapeAttr(String(u.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
        </footer>`;
    const avatarUrlRaw = normalizePortalAvatarDisplayUrl(u.avatarUrl);
    const avatarInitial = escapeHtml((getPortalUserDisplayName(u).charAt(0) || "?").toUpperCase());
    const userAvatarBlock = avatarUrlRaw
      ? `<div class="directory-card__avatar directory-card__avatar--photo" aria-hidden="true"><img src="${escapeAttr(avatarUrlRaw)}" alt="" loading="lazy" decoding="async" data-portal-avatar-img data-avatar-initial="${escapeAttr(avatarInitial)}" /><span class="directory-card__avatar-fallback" hidden>${avatarInitial}</span></div>`
      : `<div class="directory-card__avatar">${avatarInitial}</div>`;
    const cardStateClass = isPending
      ? " directory-card--pending"
      : u.accountStatus === ACCOUNT_STATUS.RECHAZADO
        ? " directory-card--inactive"
        : " directory-card--ok";
    return `<article class="directory-card portal-ops-card trip-ops-card directory-card--user${cardStateClass}">
      <header class="directory-card__head">
        <div class="directory-card__identity">
          ${userAvatarBlock}
          <div class="directory-card__heading">
            <p class="directory-card__kicker">${escapeHtml(companyName)}</p>
            <h4 class="directory-card__title">${escapeHtml(getPortalUserDisplayName(u))}${isMe ? ' <span class="directory-card__title-note">Tu cuenta</span>' : ""}</h4>
            ${contactSublineHtml}
          </div>
        </div>
        <div class="directory-card__status-stack">
          ${roleTag}
          ${statusBadge(u.accountStatus)}
        </div>
      </header>
      ${directoryOpsHtml(summaryTitle, summaryCopy, userOpsTone)}
      <div class="directory-card__metrics directory-card__metrics--triple">
        ${directoryChipHtml("Permisos", String(permissionCount), permissionCount ? "ok" : "warn")}
        ${directoryChipHtml("2FA", u.twoFactorEnabled ? "On" : "Off", u.twoFactorEnabled ? "ok" : "warn")}
        ${directoryChipHtml("Perfil", profileChipLabel, "neutral", profileChipTitle)}
      </div>
      <dl class="directory-card__facts">
        ${directoryFactHtml("Documento", docLabel)}
        ${directoryFactHtml("Telefono", phoneLabel)}
        ${directoryFactHtml("Ingreso", joinedLabel)}
        ${directoryFactHtml("Estado", accountStatusLabel)}
      </dl>
      ${note}
      ${permPreview ? `<div class="directory-card__tags">${permPreview}</div>` : ""}
      ${actions}
    </article>`;
  };

  const renderCompanyCard = (c) => {
    const active = isCompanyRecordActive(c);
    const usersCount = users.filter((u) => String(u.companyId || "") === String(c.id)).length;
    const initial = escapeHtml(String((c.name || "?").trim().charAt(0).toUpperCase() || "?"));
    const logoUrl = companyProfileLogoUrl(c);
    const avatarCompany = logoUrl
      ? `<div class="directory-card__avatar directory-card__avatar--photo directory-card__avatar--logo" aria-hidden="true"><img src="${escapeAttr(logoUrl)}" alt="" loading="lazy" /></div>`
      : `<div class="directory-card__avatar directory-card__avatar--logo" aria-hidden="true">${initial}</div>`;
    const nit = String(c.taxId || c.nit || "").trim() || "Sin NIT";
    const phoneDisp = c.phone ? formatPortalPhoneForDisplay(String(c.phone)) : "Sin teléfono";
    const emailLabel = String(c.email || "").trim() || "Sin correo";
    const contactLabel = String(c.contactName || "").trim() || "Sin contacto";
    const locationLabel = c.city ? `${String(c.city)}${c.department ? `, ${String(c.department)}` : ""}` : "Sin ubicación";
    const kindForUi =
      patchOperatorCompanyKindIfNeeded([{ ...c }])[0]?.companyKind ?? c.companyKind;
    const companyStateClass = active ? " directory-card--ok" : " directory-card--inactive";
    const summaryTitle = active ? "Operativa" : "Inactiva";
    const companyOpsDetail =
      contactLabel !== "Sin contacto"
        ? contactLabel
        : locationLabel !== "Sin ubicación"
          ? locationLabel
          : emailLabel !== "Sin correo"
            ? emailLabel
            : "Sin contacto";
    const companyLine = [
      contactLabel !== "Sin contacto" ? contactLabel : "",
      emailLabel !== "Sin correo" ? emailLabel : "",
      locationLabel !== "Sin ubicación" ? locationLabel : ""
    ]
      .filter(Boolean)
      .join(" · ") || "—";
    const companyOpsTone = active ? "ok" : "alert";
    return `<article class="directory-card portal-ops-card trip-ops-card directory-card--company${companyStateClass}" data-company-id="${escapeAttr(String(c.id || ""))}">
      <header class="directory-card__head">
        <div class="directory-card__identity">
          ${avatarCompany}
          <div class="directory-card__heading">
            <p class="directory-card__kicker">${escapeHtml(companyKindChipShortLabel(normalizeCompanyKindForDb(kindForUi)))} · ${escapeHtml(nit)}</p>
            <h4 class="directory-card__title">${escapeHtml(String(c.name || "Empresa"))}</h4>
            <p class="directory-card__subline">${escapeHtml(companyLine)}</p>
          </div>
        </div>
        <div class="directory-card__status-stack">
          ${companyKindChipHtml(kindForUi)}
          ${active ? '<span class="status status-viaje_asignado">Activa</span>' : '<span class="status status-rechazada">Inactiva</span>'}
        </div>
      </header>
      ${directoryOpsHtml(summaryTitle, companyOpsDetail, companyOpsTone)}
      <div class="directory-card__metrics directory-card__metrics--triple">
        ${directoryChipHtml("Usuarios", String(usersCount), usersCount ? "ok" : "neutral")}
        ${directoryChipHtml("Logo", logoUrl ? "Si" : "No", logoUrl ? "ok" : "warn")}
        ${directoryChipHtml("Canal", phoneDisp !== "Sin teléfono" || emailLabel !== "Sin correo" ? "OK" : "—", phoneDisp !== "Sin teléfono" || emailLabel !== "Sin correo" ? "ok" : "warn")}
      </div>
      <dl class="directory-card__facts">
        ${directoryFactHtml("NIT", nit)}
        ${directoryFactHtml("Contacto", contactLabel)}
        ${directoryFactHtml("Telefono", phoneDisp)}
        ${directoryFactHtml("Ubicacion", locationLabel)}
      </dl>
      <footer class="directory-card__actions">
        <button type="button" class="btn btn-sm btn-outline" data-action="view-company" data-id="${escapeAttr(String(c.id))}">${IC.eye} Ver</button>
        ${isAdmin ? `<button type="button" class="btn btn-sm btn-action" data-action="open-edit-company" data-id="${escapeAttr(String(c.id))}">${IC.edit} Editar</button>` : ""}
        ${isAdmin ? `<button type="button" class="btn btn-sm btn-action" data-action="toggle-company-active" data-id="${escapeAttr(String(c.id))}">${active ? `${IC.x} Desactivar` : `${IC.check} Activar`}</button>` : ""}
        ${isAdmin ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-company" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </footer>
    </article>`;
  };

  const pendingUsers = users.filter((u) => isPortalUserPendingApproval(u));
  const pendingIdSet = new Set(pendingUsers.map((u) => u.id));
  const activeUsers = users.filter((u) => !pendingIdSet.has(u.id));
  const adminUsersSection = normalizeAdminUsersSection(ui.section, pendingUsers.length > 0);
  const directorySearchRaw = String(ui.directorySearch || "");
  const directorySearch = directorySearchRaw.trim().toLowerCase();
  const directoryMatch = (blob) => !directorySearch || String(blob || "").toLowerCase().includes(directorySearch);
  const userDirectoryBlob = (u) =>
    `${getPortalUserDisplayName(u)} ${u.email || ""} ${u.company || ""} ${u.role || ""} ${u.taxId || ""} ${u.idDoc || ""} ${u.phone || ""}`;
  const pendingUsersView = directorySearch
    ? pendingUsers.filter((u) => directoryMatch(userDirectoryBlob(u)))
    : pendingUsers;
  const activeUsersView = directorySearch
    ? activeUsers.filter((u) => directoryMatch(userDirectoryBlob(u)))
    : activeUsers;
  if (state.adminUsersEntryHydrating) {
    return adminUsersHydratingShellHtml({ pendingUsers, activeUsers, companies, ui });
  }
  const pendingCardsHtml = pendingUsersView.map((u) => renderUserCard(u, "pending")).join("");
  const userCards = activeUsersView.map((u) => renderUserCard(u, "active")).join("");

  const fUser = `<form id="form-admin-user-create" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.user} Datos personales</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" required placeholder="Ej.: Laura Castañeda" data-antares-restrict="person-name" data-antares-field="person-name" /></label>
        <label>${fieldLabel(IC.mail, "Correo corporativo")}<input type="email" name="email" required placeholder="correo@empresa.com" /></label>
        <label class="full">${fieldLabel(IC.lock, "Contraseña")}
          <div class="password-field auth-password-row">
            <div class="auth-input-row auth-input-row--grow">
              <span class="auth-input-prefix" aria-hidden="true">${IC.lock}</span>
              <input type="password" name="password" minlength="10" required placeholder="Mín. 10 caracteres, mayúscula, minúscula, número y símbolo" aria-describedby="admin-create-password-hint admin-create-password-strength" autocomplete="new-password" />
            </div>
            <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="admin-create">${IC.eye} Mostrar</button>
          </div>
          <div id="admin-password-strength-suite" class="password-strength-suite">
            <div class="password-strength-bar-wrap">
              <div class="password-strength-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Progreso de requisitos de contraseña">
                <div class="password-strength-bar-fill password-strength-bar-fill--weak"></div>
              </div>
              <div class="password-strength-meta">
                <span class="password-strength-pill password-strength-pill--weak">0%</span>
                <p id="admin-create-password-strength" class="password-strength-headline">Indique una contraseña segura</p>
              </div>
            </div>
            <ul class="password-rule-grid" role="list" aria-label="Requisitos de contraseña">
              <li data-rule="len"><span class="password-rule-dot" aria-hidden="true"></span><span>10+ caracteres</span></li>
              <li data-rule="lower"><span class="password-rule-dot" aria-hidden="true"></span><span>Minúscula (a-z)</span></li>
              <li data-rule="upper"><span class="password-rule-dot" aria-hidden="true"></span><span>Mayúscula (A-Z)</span></li>
              <li data-rule="digit"><span class="password-rule-dot" aria-hidden="true"></span><span>Número (0-9)</span></li>
              <li data-rule="special"><span class="password-rule-dot" aria-hidden="true"></span><span>Símbolo (!@#$…)</span></li>
            </ul>
          </div>
          <p id="admin-create-password-hint" class="muted password-policy-hint">Mismo estándar que el alta público del sitio (10+ caracteres, mayúscula, minúscula, número y símbolo). La contraseña se muestra tal cual al escribirla; se guarda con hash seguro.</p>
        </label>
        <label>${fieldLabel(IC.file, "Tipo documento")}<select name="documentType" required>
          <option value="CC">Cédula de ciudadanía</option>
          <option value="CE">Cédula de extranjería</option>
          <option value="NIT">NIT</option>
          <option value="PAS">Pasaporte</option>
        </select></label>
        <label>${fieldLabel(IC.badge, "Documento / NIT")}<input name="taxId" value="900000001-0" required /></label>
        <label>${fieldLabel(IC.phone, "Teléfono")}<input name="phone" required placeholder="+57 300 000 0000" /></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-violet full">
      <legend>${IC.shield} Acceso y rol</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.shield, "Rol")}<select name="role" required>${portalRoleSelectOptionsHtml()}</select></label>
        <label>${fieldLabel(IC.shield, "Tipo de vínculo")}<select name="registrationKind" required>
          <option value="cliente">Cliente externo</option>
          <option value="empleado_interno">Empleado interno</option>
        </select></label>
        <label>${fieldLabel(IC.briefcase, "Empresa")}<select name="companyId" required>
          <option value="">Seleccione...</option>
          ${companyOptions}
        </select></label>
        <label>${fieldLabel(IC.lock, "Autenticación 2FA")}<select name="twoFactorEnabled">
          <option value="false">Deshabilitada</option>
          <option value="true">Habilitada (recomendado)</option>
        </select></label>
        <label>${fieldLabel(IC.calendar, "Fecha de ingreso al sistema")}<input type="date" name="systemJoinDate" value="${colombiaTodayIsoDate()}" /></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.mapPin} Ubicación</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="department" id="admin-create-department" required><option value="">Seleccione...</option>${departmentOptions()}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="city" id="admin-create-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label>${fieldLabel(IC.compass, "Dirección")}<input name="address" required placeholder="Dirección principal" /></label>
        <label>${fieldLabel(IC.building || IC.briefcase, "Nombre comercial")}<input name="company" value="Antares" /></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-amber full">
      <legend>${IC.upload} Avatar (opcional)</legend>
      <label class="full">${fieldLabel(IC.upload, "Foto del usuario")}<input type="file" name="avatarFile" accept="image/*" /></label>
    </fieldset>

    <fieldset class="full perm-fieldset">
      <legend>${IC.shield} Permisos del usuario</legend>
      <div class="perm-grid">${permissionChecks(defaultPermissionsForRole(ROLES.ADMIN))}</div>
    </fieldset>
    ${renderManagedCreateFormActions("create-user", `<button class="btn btn-primary" type="submit">${IC.userPlus} Crear usuario</button>`, {
      toggleAction: "toggle-admin-create-user-panel",
      cancelAction: "cancel-admin-create-panel"
    })}
  </form>`;

  const fComp = `<form id="form-admin-company-create" class="p-form">
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.upload} Logo corporativo</legend>
      <div class="full hr-employee-avatar-row hr-employee-avatar-row--lead" style="grid-column:1/-1">
        <div class="hr-employee-avatar-inner">
          <label class="full company-logo-form-label">
            ${fieldLabel(IC.upload, "Logo de la empresa", { required: true })}
            <input type="file" id="admin-company-create-logo-file" name="logoFile" accept="image/*" required class="company-logo-file-input" aria-label="Seleccionar logo de la empresa" />
            <span class="company-logo-oval company-logo-oval--interactive" data-company-logo-preview-wrap>
              <span class="company-logo-oval-fallback" data-company-logo-fallback>${IC.upload}</span>
              <img class="company-logo-oval-img" alt="" width="128" height="80" decoding="async" hidden data-company-logo-preview-img />
              <span class="company-logo-oval-overlay" aria-hidden="true">
                <span class="company-logo-oval-overlay-inner">${IC.upload}<span>Elegir imagen</span></span>
              </span>
            </span>
            <span class="muted company-logo-picker-hint">Pulse el óvalo para cargar el logo (obligatorio). La imagen se muestra completa sin recorte.</span>
          </label>
        </div>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.briefcase} Datos de la empresa</legend>
      <p class="muted full" style="margin:0 0 0.85rem;line-height:1.45">
        Registre datos legales, contacto principal y ubicación operativa para habilitar trazabilidad comercial por empresa.
      </p>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.shield, "Clasificación de la empresa")}
          <select name="companyKind" required>
            <option value="cliente">Cliente (contrata servicios)</option>
            <option value="tercero">Tercero (proveedor u otro vínculo)</option>
            <option value="propia">Empresa propia — Antares (operador)</option>
          </select>
        </label>
        <label class="full">
          ${fieldLabel(IC.briefcase, "Nombre o razón social", { required: true })}
          <span class="muted" style="display:block;font-size:0.85rem;font-weight:400;margin:0.15rem 0 0.25rem">
            Obligatorio · hasta 255 caracteres
          </span>
          <input name="name" required maxlength="255" autocomplete="organization" placeholder="Ej. Flores del Valle S.A.S." data-antares-field="db-upper" data-antares-validate-blur="db-upper" />
        </label>
        <label>
          ${fieldLabel(IC.badge, "NIT / RUT", { required: true })}
          <span class="muted" style="display:block;font-size:0.85rem;font-weight:400;margin:0.15rem 0 0.25rem">
            Obligatorio · único en el sistema
          </span>
          <input name="taxId" required maxlength="32" inputmode="numeric" autocomplete="off" placeholder="900123456-7" />
        </label>
        <label>
          ${fieldLabel(IC.phone, "Teléfono")}
          <span class="muted" style="display:block;font-size:0.85rem;font-weight:400;margin:0.15rem 0 0.25rem">
            Opcional · solo dígitos, 7 a 15
          </span>
          <input name="phone" maxlength="15" inputmode="tel" autocomplete="tel" placeholder="Ej. 6011234567" />
        </label>
        <label>
          ${fieldLabel(IC.mail, "Correo empresarial")}
          <span class="muted" style="display:block;font-size:0.85rem;font-weight:400;margin:0.15rem 0 0.25rem">
            Opcional · recomendado para comunicaciones de operación
          </span>
          <input type="email" name="email" maxlength="120" autocomplete="email" placeholder="operaciones@empresa.com" />
        </label>
        <label>${fieldLabel(IC.user, "Contacto principal")}<input name="contactName" maxlength="120" placeholder="Nombre del contacto en la empresa" /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="department"><option value="">Seleccione...</option>${departmentOptions()}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="city"><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Dirección operativa")}<input name="address" maxlength="180" placeholder="Dirección de cargue/descargue o sede principal" /></label>
      </div>
    </fieldset>
    ${renderManagedCreateFormActions("create-company", `<button class="btn btn-primary" type="submit">${IC.plus} Registrar empresa</button>`, {
      toggleAction: "toggle-admin-create-company-panel",
      cancelAction: "cancel-admin-create-panel"
    })}
  </form>`;

  const fCompanyEdit = editingCompany
    ? `<form id="form-admin-company-edit" class="p-form p-form-colored">
    <input type="hidden" name="id" value="${escapeAttr(String(editingCompany.id || ""))}" />
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.upload} Logo corporativo</legend>
      <div class="full hr-employee-avatar-row hr-employee-avatar-row--lead" style="grid-column:1/-1">
        <div class="hr-employee-avatar-inner">
          <label class="full company-logo-form-label">
            ${fieldLabel(IC.upload, "Logo de la empresa")}
            <input type="file" id="admin-company-edit-logo-file" name="logoFile" accept="image/*" class="company-logo-file-input" aria-label="Cambiar logo de la empresa" />
            <span class="company-logo-oval company-logo-oval--interactive${editingCompanyLogoUrl ? " has-image" : ""}" data-company-logo-preview-wrap>
              ${
                editingCompanyLogoUrl
                  ? `<img class="company-logo-oval-img" src="${escapeAttr(editingCompanyLogoUrl)}" alt="" width="128" height="80" loading="lazy" decoding="async" data-company-logo-preview-img data-company-logo-original="1" />`
                  : `<span class="company-logo-oval-fallback" data-company-logo-fallback>${escapeHtml(String(editingCompany.name || "E").charAt(0).toUpperCase())}</span><img class="company-logo-oval-img" alt="" width="128" height="80" decoding="async" hidden data-company-logo-preview-img />`
              }
              <span class="company-logo-oval-overlay" aria-hidden="true">
                <span class="company-logo-oval-overlay-inner">${IC.upload}<span>Cambiar logo</span></span>
              </span>
            </span>
            <span class="muted company-logo-picker-hint">Pulse el óvalo para cambiar el logo. La imagen se muestra completa sin recorte; si no elige archivo, se conserva el actual.</span>
            <input type="hidden" name="logoUrlExisting" value="${escapeAttr(String(editingCompany.logoUrl || ""))}" />
          </label>
        </div>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.briefcase} Datos de la empresa</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.shield, "Clasificación de la empresa")}
          <select name="companyKind" required>
            <option value="cliente" ${normalizeCompanyKindForDb(editingCompany.companyKind) === "cliente" ? "selected" : ""}>Cliente (contrata servicios)</option>
            <option value="tercero" ${normalizeCompanyKindForDb(editingCompany.companyKind) === "tercero" ? "selected" : ""}>Tercero (proveedor u otro vínculo)</option>
            <option value="propia" ${normalizeCompanyKindForDb(editingCompany.companyKind) === "propia" ? "selected" : ""}>Empresa propia — Antares (operador)</option>
          </select>
        </label>
        <label class="full">
          ${fieldLabel(IC.briefcase, "Nombre o razón social", { required: true })}
          <input name="name" required maxlength="255" autocomplete="organization" value="${escapeAttr(String(editingCompany.name || ""))}" />
        </label>
        <label>
          ${fieldLabel(IC.badge, "NIT / RUT", { required: true })}
          <input name="taxId" required maxlength="32" inputmode="numeric" autocomplete="off" value="${escapeAttr(String(editingCompany.taxId ?? editingCompany.nit ?? ""))}" />
        </label>
        <label>
          ${fieldLabel(IC.phone, "Teléfono")}
          <input name="phone" maxlength="32" inputmode="tel" autocomplete="tel" placeholder="+57 300 000 0000" value="${escapeAttr(String(editingCompany.phone ?? ""))}" />
        </label>
        <label>
          ${fieldLabel(IC.mail, "Correo empresarial")}
          <input type="email" name="email" maxlength="120" autocomplete="email" value="${escapeAttr(String(editingCompany.email ?? ""))}" />
        </label>
        <label>${fieldLabel(IC.user, "Contacto principal")}<input name="contactName" maxlength="120" value="${escapeAttr(String(editingCompany.contactName ?? ""))}" /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="department" id="admin-edit-company-department"><option value="">Seleccione...</option>${departmentOptions(editingCompanyDeptKey)}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="city" id="admin-edit-company-city"><option value="">Seleccione...</option>${cityOptionsFromDepartment(editingCompanyDeptKey, editingCompanyCityCanon)}</select></label>
        <label class="full">${fieldLabel(IC.compass, "Dirección operativa")}<input name="address" maxlength="180" value="${escapeAttr(String(editingCompany.address ?? ""))}" /></label>
      </div>
    </fieldset>
    ${renderModulePanelEditActions(`<button class="btn btn-primary" type="submit">${IC.save} Guardar cambios</button>`, { cancelAction: "close-edit-company" })}
  </form>`
    : "";

  const fPerm = `<form id="form-admin-user-permissions" class="p-form">
    <label class="full">${fieldLabel(IC.user, "Seleccionar usuario")}
      <select name="userId" required>
        <option value="">Seleccione un usuario...</option>
        ${userOptions}
      </select>
    </label>
    <fieldset class="full perm-fieldset">
      <legend>Permisos a asignar</legend>
      <div class="perm-grid">${permissionChecks([])}</div>
    </fieldset>
    ${renderManagedCreateFormActions("admin-permissions", `<button class="btn btn-primary" type="submit">${IC.save} Guardar permisos</button>`, {
      toggleAction: "toggle-admin-permissions-panel",
      showCancel: false
    })}
  </form>`;

  const adminEditUserAvatarExisting = escapeAttr(String(editingUser?.avatarUrl ?? ""));
  const adminEditUserAvatarRaw = editingUser ? normalizePortalAvatarDisplayUrl(editingUser.avatarUrl) : "";
  const adminEditUserAvatarHasImage = Boolean(adminEditUserAvatarRaw);
  const adminEditUserAvatarInitialLetter = editingUser
    ? (getPortalUserDisplayName(editingUser).charAt(0) || "?").toUpperCase()
    : "";
  const adminEditUserAvatarInitial = escapeHtml(adminEditUserAvatarInitialLetter);

  const fEdit = editingUser
    ? `<form id="form-admin-user-edit" class="p-form p-form-colored">
    <input type="hidden" name="id" value="${escapeAttr(String(editingUser.id || ""))}" />
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.upload} Foto de perfil</legend>
      <div class="full hr-employee-avatar-row hr-employee-avatar-row--lead" style="grid-column:1/-1">
        <div class="hr-employee-avatar-inner">
          <label class="profile-avatar profile-avatar-lg profile-avatar-upload${adminEditUserAvatarHasImage ? " has-image" : ""}" id="admin-edit-user-avatar-label" title="Foto del usuario" tabindex="0">
            ${adminEditUserAvatarHasImage ? `<img class="profile-avatar-img" src="${escapeAttr(adminEditUserAvatarRaw)}" alt="" decoding="async" data-admin-edit-avatar-img data-avatar-initial="${escapeAttr(adminEditUserAvatarInitialLetter)}" />` : ""}
            <span class="profile-avatar-initial"${adminEditUserAvatarHasImage ? " hidden" : ""}>${adminEditUserAvatarHasImage ? "" : adminEditUserAvatarInitial}</span>
            <span class="profile-avatar-overlay"><span class="profile-avatar-overlay-inner">${IC.upload}<span>${adminEditUserAvatarHasImage ? escapeHtml("Cambiar foto") : escapeHtml("Subir foto")}</span></span></span>
            <input type="file" id="admin-edit-user-avatar-input" name="avatarFile" accept="image/*" class="profile-avatar-file-input profile-avatar-file-input--sr-only" aria-label="Cambiar foto del usuario" tabindex="-1" />
          </label>
          <input type="hidden" name="avatarUrlExisting" value="${adminEditUserAvatarExisting}" />
          <p class="muted hr-employee-avatar-caption">Pulse el óvalo para elegir imagen. La foto se muestra completa sin recorte; si no cambia el archivo, se conserva la actual.</p>
        </div>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.user} Nombre y datos del registro</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.user, "Nombre completo")}<input name="name" value="${escapeAttr(getPortalUserDisplayName(editingUser))}" required autocomplete="name" data-antares-restrict="person-name" data-antares-field="person-name" /></label>
        <label>${fieldLabel(IC.user, "Primer nombre")}<input name="firstName" value="${escapeAttr(String(editingUser.firstName ?? ""))}" autocomplete="given-name" /></label>
        <label>${fieldLabel(IC.user, "Segundo nombre")}<input name="middleName" value="${escapeAttr(String(editingUser.middleName ?? ""))}" autocomplete="additional-name" /></label>
        <label>${fieldLabel(IC.users, "Primer apellido")}<input name="lastName" value="${escapeAttr(String(editingUser.lastName ?? ""))}" autocomplete="family-name" /></label>
        <label>${fieldLabel(IC.users, "Segundo apellido")}<input name="secondLastName" value="${escapeAttr(String(editingUser.secondLastName ?? ""))}" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.file} Persona y documento</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.file, "Tipo de persona")}
          <select name="personType">
            <option value="Natural" ${!isPersonTypeJuridica(editingUser.personType) ? "selected" : ""}>Natural</option>
            <option value="Juridica" ${isPersonTypeJuridica(editingUser.personType) ? "selected" : ""}>Jurídica</option>
          </select>
        </label>
        <label>${fieldLabel(IC.file, "Tipo documento")}
          <select name="documentType" required>
            <option value="CC" ${String(editingUser.documentType || "").toUpperCase() === "CC" ? "selected" : ""}>Cédula de ciudadanía</option>
            <option value="CE" ${String(editingUser.documentType || "").toUpperCase() === "CE" ? "selected" : ""}>Cédula de extranjería</option>
            <option value="NIT" ${String(editingUser.documentType || "").toUpperCase() === "NIT" ? "selected" : ""}>NIT</option>
            <option value="PAS" ${String(editingUser.documentType || "").toUpperCase() === "PAS" ? "selected" : ""}>Pasaporte</option>
          </select>
        </label>
        <label>${fieldLabel(IC.badge, "Número de documento / NIT")}<input name="taxId" value="${escapeAttr(String(editingUser.taxId ?? editingUser.personalDoc ?? ""))}" required /></label>
        <label>${fieldLabel(IC.calendar, "Fecha de nacimiento")}<input type="date" name="birthDate" value="${escapeAttr(String(editingUser.birthDate || "").slice(0, 10))}" /></label>
        <label>${fieldLabel(IC.users, "Género")}<select name="gender">${genderOptsEdit}</select></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.mail} Acceso y rol</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.mail, "Correo")}<input type="email" name="email" value="${escapeAttr(String(editingUser.email || ""))}" required autocomplete="email" /></label>
        <label class="full">${fieldLabel(IC.lock, "Contraseña")}
          <div class="password-field auth-password-row">
            <div class="auth-input-row auth-input-row--grow">
              <span class="auth-input-prefix" aria-hidden="true">${IC.lock}</span>
              <input type="password" name="password" placeholder="Dejar vacío para conservar" autocomplete="new-password" />
            </div>
            <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="admin-edit">${IC.eye} Mostrar</button>
          </div>
        </label>
        <label>${fieldLabel(IC.shield, "Rol")}
          <select name="role" required>${portalRoleSelectOptionsHtml(editingUser.role)}</select>
        </label>
        <label class="full">${fieldLabel(IC.users, "Cliente o usuario interno")}
          <select name="registrationKind" id="admin-edit-registration-kind" required aria-label="Cliente externo o usuario interno Antares">
            <option value="cliente" ${normalizeRegistrationKindForDb(editingUser.registrationKind ?? editingUser.profileQualityChecklist?.registrationKind) === "cliente" ? "selected" : ""}>Cliente (persona de empresa externa)</option>
            <option value="empleado_interno" ${normalizeRegistrationKindForDb(editingUser.registrationKind ?? editingUser.profileQualityChecklist?.registrationKind) === "empleado_interno" ? "selected" : ""}>Usuario interno (personal Antares)</option>
          </select>
        </label>
        <label>${fieldLabel(IC.briefcase, "Empresa")}<select name="companyId" required>
          <option value="">Seleccione...</option>
          ${companyEditOptions}
        </select></label>
        <label>${fieldLabel(IC.lock, "Autenticación 2FA")}<select name="twoFactorEnabled">
          <option value="false" ${!editingUser.twoFactorEnabled ? "selected" : ""}>Deshabilitada</option>
          <option value="true" ${editingUser.twoFactorEnabled ? "selected" : ""}>Habilitada (recomendado)</option>
        </select></label>
        <label>${fieldLabel(IC.calendar, "Fecha de ingreso al sistema")}<input type="date" name="systemJoinDate" value="${escapeAttr(String(editingUser.systemJoinDate || (editingUser.createdAt ? String(editingUser.createdAt).slice(0, 10) : "")))}" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.mapPin} Ubicación y contacto operativo</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.phone, "Teléfono")}<input name="phone" value="${escapeAttr(String(editingUser.phone ?? ""))}" autocomplete="tel" inputmode="tel" maxlength="32" placeholder="+57 300 000 0000" /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento")}
          <select name="department" id="admin-edit-department"><option value="">Seleccione...</option>${departmentOptions(editingUser.department || "")}</select>
        </label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}
          <select name="city" id="admin-edit-city"><option value="">Seleccione...</option>${cityOptionsFromDepartment(editingUser.department || "", editingUser.city || "")}</select>
        </label>
        <label class="full">${fieldLabel(IC.compass, "Dirección")}<input name="address" value="${escapeAttr(String(editingUser.address ?? ""))}" /></label>
        <label>${fieldLabel(IC.user, "Cargo (registro)")}<input name="position" value="${escapeAttr(String(editingUser.position ?? ""))}" placeholder="Ej. Gerente comercial" /></label>
        <label>${fieldLabel(IC.briefcase, "Área de trabajo")}<input name="workArea" value="${escapeAttr(String(editingUser.workArea ?? ""))}" /></label>
        <label>${fieldLabel(IC.building || IC.briefcase, "Nombre comercial / razón corta")}<input name="company" value="${escapeAttr(String(editingUser.company ?? ""))}" /></label>
      </div>
    </fieldset>
    <fieldset class="full perm-fieldset">
      <legend>Permisos granulares</legend>
      <div class="perm-grid">${permissionChecks(effectiveUserPermissions(editingUser))}</div>
    </fieldset>
    ${renderModulePanelEditActions(`<button class="btn btn-primary" type="submit">${IC.save} Guardar cambios</button>`, { cancelAction: "close-edit-user", toggleAction: "toggle-admin-edit-user-panel" })}
  </form>`
    : "";

  const companiesSorted = [...companies].sort((a, b) => {
    const aa = isCompanyRecordActive(a) ? 0 : 1;
    const bb = isCompanyRecordActive(b) ? 0 : 1;
    if (aa !== bb) return aa - bb;
    return String(a.name || "").localeCompare(String(b.name || ""), "es", { sensitivity: "base" });
  });
  const companiesForView = directorySearch
    ? companiesSorted.filter((c) =>
        directoryMatch(
          `${c.name} ${c.taxId || c.nit || ""} ${c.email || ""} ${c.contactName || ""} ${c.phone || ""} ${c.city || ""} ${c.department || ""}`
        )
      )
    : companiesSorted;
  const companyCardsHtml = companiesForView.map((c) => renderCompanyCard(c)).join("");
  const approvedUsers = users.filter((u) => u.accountStatus === ACCOUNT_STATUS.APROBADO);
  const activeCompaniesCount = companies.filter((c) => isCompanyRecordActive(c)).length;
  const inactiveCompaniesCount = Math.max(0, companies.length - activeCompaniesCount);
  const sessions = Array.isArray(state.adminUserSessions) ? state.adminUserSessions : [];
  const activeSessions = sessions.filter((s) => String(s.status || "").toLowerCase() === "activa").length;
  const expiredSessions = sessions.filter((s) => String(s.status || "").toLowerCase() !== "activa").length;
  const focusCardClass = "admin-users-data-card admin-users-focus-card";

  const approvedCount = approvedUsers.length;

  const hero = `<section class="users-hero-strip users-hero-strip--command">
    <div class="admin-users-hero-main">
      <p class="users-hero-kicker">Sistema de acceso y gobierno</p>
      <h2>Usuarios y permisos con una lectura mas clara</h2>
      <p>
        Centralice aprobaciones, altas y cambios de acceso en una vista mas limpia, con menos ruido visual y mejor jerarquia.
      </p>
      <div class="admin-users-hero-chips">
        <span class="status ${pendingUsers.length ? "status-pendiente" : "status-viaje_asignado"}">Pendientes ${pendingUsers.length}</span>
        <span class="status status-viaje_asignado">Aprobados ${approvedCount}</span>
        <span class="status ${inactiveCompaniesCount ? "status-pendiente" : "status-viaje_asignado"}">Empresas activas ${activeCompaniesCount}</span>
      </div>
    </div>
    <div class="admin-users-hero-panel admin-users-hero-panel--compact">
      <p class="admin-users-hero-panel__eyebrow">Acciones rapidas</p>
      <p class="admin-users-hero-panel__copy">
        Abra solo el flujo que necesita y mantenga el resto del modulo despejado.
      </p>
      <div class="users-hero-actions">
        <button class="btn btn-primary btn-sm" data-action="toggle-admin-panel" data-panel="create-user">${IC.userPlus} Nuevo usuario</button>
        <button class="btn btn-action btn-sm" data-action="toggle-admin-panel" data-panel="create-company">${IC.building || IC.briefcase} Nueva empresa</button>
        <button class="btn btn-action btn-sm" data-action="toggle-admin-panel" data-panel="set-permissions">${IC.shield} Asignar permisos</button>
        <button class="btn btn-outline btn-sm" data-action="refresh-user-sessions">${IC.activity} Actualizar sesiones</button>
      </div>
    </div>
  </section>`;

  let actionsPaneHtml = pcardWrapPro(
    "shield",
    "Acciones y flujos",
    "Opciones separadas",
    `<p class="admin-users-form-lead muted">Abra un flujo puntual y mantenga el resto del módulo fuera de pantalla para evitar saturación visual.</p>
    <div class="users-hero-actions">
      <button class="btn btn-primary btn-sm" data-action="toggle-admin-panel" data-panel="create-user">${IC.userPlus} Nuevo usuario</button>
      <button class="btn btn-action btn-sm" data-action="toggle-admin-panel" data-panel="create-company">${IC.building || IC.briefcase} Nueva empresa</button>
      <button class="btn btn-action btn-sm" data-action="toggle-admin-panel" data-panel="set-permissions">${IC.shield} Asignar permisos</button>
      <button class="btn btn-outline btn-sm" data-action="refresh-user-sessions">${IC.activity} Actualizar sesiones</button>
    </div>`,
    "admin-users-data-card"
  );

  if (ui.panel === "create-user") {
    const createUserExpanded = !ui.createUserMinimized;
    actionsPaneHtml += pcardWrapPro(
      "userPlus",
      "Crear nuevo usuario",
      "Alta completa",
      `<p class="admin-users-form-lead muted">Alta centralizada en un solo formulario, sin paneles adicionales alrededor.</p>${adminUsersCollapsibleCardBody(createUserExpanded, "toggle-admin-create-user-panel", fUser)}`,
      `${createUserExpanded ? "p-card--expanded" : "p-card--collapsed"} ${focusCardClass}`
    );
  }
  if (ui.panel === "create-company") {
    const createCompanyExpanded = !ui.createCompanyMinimized;
    actionsPaneHtml += pcardWrapPro(
      "plus",
      "Registrar empresa",
      "Directorio empresarial",
      `<p class="admin-users-form-lead muted">Use este flujo solo cuando necesite crear una empresa nueva para asociar usuarios.</p>${adminUsersCollapsibleCardBody(createCompanyExpanded, "toggle-admin-create-company-panel", fComp)}`,
      `${createCompanyExpanded ? "p-card--expanded" : "p-card--collapsed"} ${focusCardClass}`
    );
  }
  if (ui.panel === "set-permissions") {
    const permExpanded = !ui.permissionsMinimized;
    actionsPaneHtml += pcardWrapPro(
      "save",
      "Asignar permisos",
      "Gobierno granular",
      `<p class="admin-users-form-lead muted">Seleccione la cuenta y ajuste solo los módulos que realmente debe ver.</p>${adminUsersCollapsibleCardBody(permExpanded, "toggle-admin-permissions-panel", fPerm)}`,
      `${permExpanded ? "p-card--expanded" : "p-card--collapsed"} ${focusCardClass}`
    );
  }
  if (editingUser) {
    const editExpanded = !ui.editMinimized;
    actionsPaneHtml += pcardWrapPro(
      "edit",
      "Editar usuario",
      escapeHtml(getPortalUserDisplayName(editingUser)),
      `${adminUsersCollapsibleCardBody(editExpanded, "toggle-admin-edit-user-panel", fEdit)}`,
      `${editExpanded ? "p-card--expanded" : "p-card--collapsed"} ${focusCardClass}`
    );
  }
  if (editingCompany) {
    actionsPaneHtml += pcardWrapPro(
      "briefcase",
      "Editar empresa",
      escapeHtml(String(editingCompany.name || "")),
      fCompanyEdit,
      focusCardClass
    );
  }

  const pendingSubtitle = directorySearch
    ? `${pendingUsersView.length} de ${pendingUsers.length} con búsqueda activa`
    : `${pendingUsers.length} registro${pendingUsers.length === 1 ? "" : "s"} pendiente${pendingUsers.length === 1 ? "" : "s"}`;
  const pendingPaneHtml =
    pendingUsers.length > 0
      ? pendingUsersView.length > 0
        ? pcardWrapPro(
            "shield",
            "Pendientes de aprobación",
            pendingSubtitle,
            `<div class="admin-users-list-shell"><div class="user-grid user-grid-pending directory-grid portal-ops-cards">${pendingCardsHtml}</div></div>`,
            "admin-users-data-card"
          )
        : pcardWrapPro(
            "shield",
            "Pendientes de aprobación",
            pendingSubtitle,
            emptyState("Ningún pendiente coincide con la búsqueda."),
            "admin-users-data-card"
          )
      : pcardWrapPro(
          "shield",
          "Pendientes de aprobación",
          "0 registros",
          emptyState("No hay usuarios pendientes por revisar."),
          "admin-users-data-card"
        );

  const usersPaneSubtitle = directorySearch
    ? `${activeUsersView.length} de ${activeUsers.length} activo${activeUsers.length === 1 ? "" : "s"} con búsqueda${pendingUsers.length ? ` · ${pendingUsers.length} pendiente${pendingUsers.length === 1 ? "" : "s"} en total` : ""}`
    : `${activeUsers.length} activo${activeUsers.length === 1 ? "" : "s"}${pendingUsers.length ? ` · ${pendingUsers.length} pendiente${pendingUsers.length === 1 ? "" : "s"}` : ""}`;
  const usersPaneBody =
    activeUsers.length && !activeUsersView.length
      ? emptyState("Ningún usuario coincide con la búsqueda.")
      : userCards
        ? `<div class="admin-users-list-shell"><div class="user-grid user-grid-main directory-grid portal-ops-cards">${userCards}</div></div>`
        : emptyState("Sin usuarios registrados.");
  const usersPaneHtml = pcardWrapPro(
    "shield",
    "Usuarios del sistema",
    usersPaneSubtitle,
    usersPaneBody,
    "admin-users-data-card"
  );

  const companiesPaneSubtitle = directorySearch
    ? `${companiesForView.length} de ${companies.length} con búsqueda activa`
    : `${companies.length} empresa${companies.length === 1 ? "" : "s"}`;
  const companiesPaneHtml =
    companies.length > 0
      ? companiesForView.length > 0
        ? pcardWrapPro(
            "briefcase",
            "Empresas registradas",
            companiesPaneSubtitle,
            `<div class="admin-users-list-shell"><div class="user-grid user-grid-main user-grid-companies directory-grid portal-ops-cards">${companyCardsHtml}</div></div>`,
            "admin-users-data-card"
          )
        : pcardWrapPro(
            "briefcase",
            "Empresas registradas",
            companiesPaneSubtitle,
            emptyState("Ninguna empresa coincide con la búsqueda."),
            "admin-users-data-card"
          )
      : pcardWrapPro(
          "briefcase",
          "Empresas registradas",
          "0 empresas",
          emptyState("No hay empresas registradas."),
          "admin-users-data-card"
        );

  const sessionsRows = sessions
    .map((s) => {
      const status = String(s.status || "").toLowerCase() === "activa"
        ? '<span class="status status-viaje_asignado">Activa</span>'
        : '<span class="status status-rechazada">Expirada</span>';
      return `<tr>
        <td><strong>${escapeHtml(String(s.userName || "Usuario"))}</strong><br><span class="muted">${escapeHtml(String(s.userEmail || "-"))}</span></td>
        <td>${escapeHtml(String(s.userRole || "-"))}</td>
        <td>${fmtDate(s.createdAt)}</td>
        <td>${fmtDate(s.expiresAt)}</td>
        <td>${status}</td>
      </tr>`;
    })
    .join("");
  const sessionsLogMinimized = Boolean(state.adminSessionsLogMinimized);
  const sessionsLogExpanded = !sessionsLogMinimized;
  const sessionsCardBody = `<div class="admin-users-session-topbar admin-users-session-topbar--compact">
    <div class="admin-users-session-topbar__metrics">
      <span class="status status-viaje_asignado">Activas ${activeSessions}</span>
      <span class="status ${expiredSessions ? "status-pendiente" : "status-viaje_asignado"}">Expiradas ${expiredSessions}</span>
    </div>
    <div class="admin-users-session-topbar__actions">
      ${renderModulePanelToggleBtn({ expanded: sessionsLogExpanded, toggleAction: "toggle-admin-sessions-log", expandLabel: "Mostrar registro" })}
      <button type="button" class="btn btn-sm btn-outline" data-action="refresh-user-sessions">${IC.activity} Actualizar</button>
      <button type="button" class="btn btn-sm btn-outline" data-action="clear-user-sessions-all">${IC.x} Finalizar sesiones (raíz)</button>
    </div>
  </div>
  ${state.adminUserSessionsLoading ? `<p class="admin-users-inline-note muted">Sincronizando sesiones desde la API del portal...</p>` : ""}
  ${state.adminUserSessionsError ? `<p class="admin-users-inline-note"><span class="status status-rechazada">${escapeHtml(String(state.adminUserSessionsError))}</span></p>` : ""}
  <div class="${sessionsLogExpanded ? "" : "hidden"}" data-admin-sessions-log-panel>
    ${
      sessionsRows
        ? `<div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Rol</th><th>Creada</th><th>Expira</th><th>Estado</th></tr></thead><tbody>${sessionsRows}</tbody></table></div>`
        : emptyState("No hay sesiones registradas todavía. Inicie sesión en el portal para empezar a ver actividad.")
    }
  </div>`;
  const sessionsPaneHtml = pcardWrapPro(
    "activity",
    "Sesiones de usuarios",
    `${sessions.length} registro${sessions.length === 1 ? "" : "s"}`,
    sessionsCardBody,
    `${sessionsLogExpanded ? "p-card--expanded" : "p-card--collapsed"} admin-users-data-card`
  );
  const workspaceNav = renderModuleWindowTabs({
    ariaLabel: "Opciones del módulo Usuarios y permisos",
    activeId: adminUsersSection,
    action: "admin-users-section",
    valueAttr: "section",
    tabs: [
      { id: "actions", label: "Acciones" },
      { id: "pending", label: "Pendientes", count: pendingUsers.length },
      { id: "users", label: "Usuarios", count: activeUsers.length },
      { id: "companies", label: "Empresas", count: companies.length },
      { id: "sessions", label: "Sesiones", count: sessions.length }
    ]
  });
  const directorySearchBar = ["pending", "users", "companies"].includes(adminUsersSection)
    ? `<div class="transport-ops-toolbar admin-users-directory-search">
        <label class="transport-ops-search">
          <span class="muted">${IC.search || ""} Buscar</span>
          <input type="search" data-action="admin-users-directory-search" value="${escapeAttr(directorySearchRaw)}" placeholder="Nombre, correo, documento, empresa…" autocomplete="off" />
        </label>
      </div>`
    : "";
  const actionsPane = `<div class="auth-tab-panel${adminUsersSection === "actions" ? "" : " hidden"}" data-admin-users-panel="actions"${adminUsersSection === "actions" ? "" : " hidden"}>${actionsPaneHtml}</div>`;
  const pendingPane = `<div class="auth-tab-panel${adminUsersSection === "pending" ? "" : " hidden"}" data-admin-users-panel="pending"${adminUsersSection === "pending" ? "" : " hidden"}>${pendingPaneHtml}</div>`;
  const usersPane = `<div class="auth-tab-panel${adminUsersSection === "users" ? "" : " hidden"}" data-admin-users-panel="users"${adminUsersSection === "users" ? "" : " hidden"}>${usersPaneHtml}</div>`;
  const companiesPane = `<div class="auth-tab-panel${adminUsersSection === "companies" ? "" : " hidden"}" data-admin-users-panel="companies"${adminUsersSection === "companies" ? "" : " hidden"}>${companiesPaneHtml}</div>`;
  const sessionsPane = `<div class="auth-tab-panel${adminUsersSection === "sessions" ? "" : " hidden"}" data-admin-users-panel="sessions"${adminUsersSection === "sessions" ? "" : " hidden"}>${sessionsPaneHtml}</div>`;
  return `<section class="admin-users-studio">${hero}${workspaceNav}${directorySearchBar}<div class="auth-tab-panels">${actionsPane}${pendingPane}${usersPane}${companiesPane}${sessionsPane}</div></section>`;
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({adminUsersHtml});
})();

(function registerAdminUsersPortalAfterRender() {
  "use strict";
  function bindAdminUsersPortalControls() {
    if (String(state.currentView || "") !== "admin-users" || !nodes.viewRoot) return;
    nodes.viewRoot.querySelectorAll("[data-action='admin-users-directory-search']").forEach((input) => {
      input.addEventListener("input", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        const len = String(el.value || "").length;
        const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        if (typeof setAdminUsersUi === "function") {
          setAdminUsersUi({ directorySearch: String(el.value || "") });
        } else {
          state.adminUsersUi = { ...getAdminUsersUi(), directorySearch: String(el.value || "") };
        }
        state.__adminUsersDirectorySearchRestore = { start, end };
        renderPortalView();
      });
    });

    const restore = state.__adminUsersDirectorySearchRestore;
    if (restore && typeof restore.start === "number") {
      delete state.__adminUsersDirectorySearchRestore;
      queueMicrotask(() => {
        const root = nodes.viewRoot;
        if (!root || String(state.currentView || "") !== "admin-users") return;
        const inp = root.querySelector("[data-action='admin-users-directory-search']");
        if (!inp || typeof inp.focus !== "function") return;
        inp.focus();
        if (typeof inp.setSelectionRange === "function") {
          const n = String(inp.value || "").length;
          const s = Math.max(0, Math.min(restore.start, n));
          const e = Math.max(0, Math.min(restore.end ?? restore.start, n));
          inp.setSelectionRange(s, e);
        }
      });
    }
    if (typeof wirePortalAvatarImgFallback === "function") {
      nodes.viewRoot.querySelectorAll("[data-portal-avatar-img]").forEach((img) => {
        wirePortalAvatarImgFallback(img, String(img.dataset.avatarInitial || "").trim());
      });
    }
  }
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["admin-users"] = bindAdminUsersPortalControls;
})();