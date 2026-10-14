/**
 * Usuarios y permisos — permisos granulares y administración.
 * Extraído desde app.js — carga con defer después de app.js.
 */
/**
 * Casillas de permisos granulares (admin). Centralizado para reutilizar en HTML y al
 * cambiar el usuario seleccionado en el formulario de permisos.
 */
function directoryCardTitle(raw) {
  const text = String(raw || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  const shouting = letters && letters === letters.toLocaleUpperCase("es-CO") && letters !== letters.toLocaleLowerCase("es-CO");
  if (!shouting) return text;
  const particles = new Set(["de", "del", "la", "las", "los", "y", "e", "da", "do", "dos"]);
  return text
    .toLocaleLowerCase("es-CO")
    .split(" ")
    .map((part, index) => {
      if (!part) return part;
      if (index > 0 && particles.has(part)) return part;
      return part.charAt(0).toLocaleUpperCase("es-CO") + part.slice(1);
    })
    .join(" ");
}

function permissionCheckboxHtml(permission, sel, readOnly) {
  const meta = PERMISSION_META[permission] || { title: permission, desc: "" };
  const checked = sel.has(permission) ? "checked" : "";
  const dis = readOnly ? " disabled" : "";
  return `<label class="perm-check${checked ? " is-on" : ""}">
      <input type="checkbox" name="permissions" value="${escapeAttr(permission)}" ${checked}${dis} />
      <span><strong>${escapeHtml(String(meta.title || ""))}</strong><small>${escapeHtml(String(meta.desc || ""))}</small></span>
    </label>`;
}

function buildGranularPermissionsCheckboxesHtml(selected = [], opts = {}) {
  const readOnly = Boolean(opts.readOnlyAllChecked);
  const roleAssignable =
    opts.role && typeof assignablePermissionsForRole === "function"
      ? assignablePermissionsForRole(opts.role)
      : null;
  const allowed = new Set(
    readOnly
      ? ALL_PERMISSIONS
      : roleAssignable ||
          (Array.isArray(opts.allowedPermissions) && opts.allowedPermissions.length
            ? opts.allowedPermissions
            : ALL_PERMISSIONS)
  );
  const sel = new Set(
    readOnly
      ? [...allowed]
      : (Array.isArray(selected) ? selected : []).filter((p) => allowed.has(p))
  );
  const grouped = new Set();
  const sections = PERMISSION_UI_GROUPS.map((group) => {
    const items = group.permissions.filter((p) => allowed.has(p));
    items.forEach((p) => grouped.add(p));
    if (!items.length) return "";
    const onCount = items.filter((p) => sel.has(p)).length;
    const allOn = onCount === items.length;
    return `<div class="perm-group" data-perm-group>
      <div class="perm-group-head">
        <p class="perm-group-title">${escapeHtml(group.title)}</p>
        <span class="perm-group-count">${onCount}/${items.length}</span>
        ${
          readOnly
            ? ""
            : `<button type="button" class="ag-link-btn" data-action="perm-group-toggle" aria-pressed="${allOn}">${allOn ? "Quitar módulo" : "Todo el módulo"}</button>`
        }
      </div>
      <div class="perm-group-grid">${items.map((p) => permissionCheckboxHtml(p, sel, readOnly)).join("")}</div>
    </div>`;
  }).join("");
  const rest = ALL_PERMISSIONS.filter((p) => !grouped.has(p));
  const restHtml = rest.length
    ? (() => {
        const onCount = rest.filter((p) => sel.has(p)).length;
        const allOn = onCount === rest.length;
        return `<div class="perm-group" data-perm-group>
      <div class="perm-group-head">
        <p class="perm-group-title">Otros</p>
        <span class="perm-group-count">${onCount}/${rest.length}</span>
        ${
          readOnly
            ? ""
            : `<button type="button" class="ag-link-btn" data-action="perm-group-toggle" aria-pressed="${allOn}">${allOn ? "Quitar módulo" : "Todo el módulo"}</button>`
        }
      </div>
      <div class="perm-group-grid">${rest.map((p) => permissionCheckboxHtml(p, sel, readOnly)).join("")}</div>
    </div>`;
      })()
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

  const permUserId = String(ui.permUserId || "").trim();
  const userOptions = users
    .map((u) => {
      const id = String(u.id ?? "");
      const selected = permUserId && permUserId === id ? " selected" : "";
      return `<option value="${escapeAttr(id)}"${selected}>${escapeHtml(getPortalUserDisplayName(u))} · ${escapeHtml(formatPortalRoleLabel(u.role))}${String(u.id) === String(current.id) ? " · tu perfil" : ""}</option>`;
    })
    .join("");

  const permissionChecks = (selected = []) => buildGranularPermissionsCheckboxesHtml(selected);

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

  const accessMenu = (items) =>
    typeof renderAgActionMenu === "function"
      ? renderAgActionMenu(items, { label: "Más acciones" })
      : "";

  const userAccessMeta = (u, mode = "active") => {
    const namedPerms = effectiveUserPermissions(u).map((p) => PERMISSION_META[p]?.title || p);
    const isMe = String(u.id) === String(current.id);
    const isPending = mode === "pending";
    const uid = String(u.id ?? "");
    const rawName = getPortalUserDisplayName(u);
    const displayName = directoryCardTitle(rawName) || rawName;
    const companyName = directoryCardTitle(String(getCompanyById(u.companyId)?.name || u.company || "Sin empresa")) || "Sin empresa";
    const permissionCount = namedPerms.length;
    const permCap = Math.max(8, (typeof ALL_PERMISSIONS !== "undefined" && ALL_PERMISSIONS.length) || 24);
    const permPct = Math.min(100, Math.round((permissionCount / permCap) * 100));
    const resolvedRegKind = resolveUserRegistrationKind(u);
    const profileChipLabel = resolvedRegKind ? registrationKindChipLabel(resolvedRegKind) : "—";
    const joinedLabel = fmtDateOr(u.systemJoinDate || u.registeredAt || u.createdAt, "—");
    const docLabel = String(u.idDoc || u.taxId || "").trim() || "Sin documento";
    const phoneRaw = String(u.phone || "").replace(/[^\d+]/g, "");
    const phoneLabel = u.phone ? formatPortalPhoneForDisplay(String(u.phone)) : "";
    const accountStatusKey = normalizeUserAccountStatus(u);
    const tone = isPending
      ? "warn"
      : accountStatusKey === ACCOUNT_STATUS.RECHAZADO
        ? "alert"
        : "ok";
    const statusLabel = isPending
      ? "Pendiente"
      : accountStatusKey === ACCOUNT_STATUS.RECHAZADO
        ? "Inactiva"
        : "Activa";
    const avatarUrlRaw = normalizePortalAvatarDisplayUrl(u.avatarUrl);
    const initials = String(displayName || "?")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("") || "?";
    const hue = typeof agAvatarHue === "function" ? agAvatarHue(displayName) : 0;
    const roleKey = String(u.role || "none");
    const rejectionReason = String(u.rejectionReason || "").trim();
    const menuItems = isPending
      ? [isAdmin ? { action: "reject-registration", id: uid, icon: IC.x, label: "Rechazar alta", tone: "danger" } : null]
      : [
          isAdmin ? { action: "open-user-permissions", id: uid, icon: IC.shield, label: "Asignar permisos" } : null,
          isAdmin && !isMe
            ? {
                action: "toggle-user-active",
                id: uid,
                icon: accountStatusKey === ACCOUNT_STATUS.RECHAZADO ? IC.check : IC.x,
                label: accountStatusKey === ACCOUNT_STATUS.RECHAZADO ? "Activar cuenta" : "Desactivar cuenta"
              }
            : null,
          isAdmin && !isMe ? "sep" : null,
          isAdmin && !isMe
            ? { action: "delete-user", id: uid, icon: IC.trash, label: "Eliminar usuario", tone: "danger" }
            : null
        ];
    const primary =
      isPending && isAdmin
        ? `<button type="button" class="ag-btn ag-btn--primary" data-action="approve-registration" data-id="${escapeAttr(uid)}">${IC.check}<span>Aprobar</span></button>`
        : `<button type="button" class="ag-btn ag-btn--primary" data-action="view-user" data-id="${escapeAttr(uid)}">${IC.eye}<span>Ver ficha</span></button>`;
    const editBtn =
      isPending || !isAdmin
        ? ""
        : `<button type="button" class="ag-icon-btn" data-action="open-edit-user" data-id="${escapeAttr(uid)}" title="Editar" aria-label="Editar ${escapeAttr(displayName)}">${IC.edit}</button>`;
    const viewIcon =
      isPending
        ? `<button type="button" class="ag-icon-btn" data-action="view-user" data-id="${escapeAttr(uid)}" title="Ver ficha" aria-label="Ver ficha">${IC.eye}</button>`
        : "";
    const avatarBlock = `<span class="ag-avatar ag-avatar--lg ag-avatar--hue-${hue}${avatarUrlRaw ? " ag-avatar--photo" : ""}" aria-hidden="true">${
      avatarUrlRaw
        ? `<img src="${escapeAttr(avatarUrlRaw)}" alt="" loading="lazy" decoding="async" data-portal-avatar-img data-avatar-initial="${escapeAttr(initials)}" />`
        : escapeHtml(initials)
    }</span>`;
    return {
      namedPerms,
      isMe,
      isPending,
      uid,
      displayName,
      companyName,
      permissionCount,
      permPct,
      profileChipLabel,
      joinedLabel,
      docLabel,
      phoneRaw,
      phoneLabel,
      tone,
      statusLabel,
      roleKey,
      rejectionReason,
      menuItems,
      primary,
      editBtn,
      viewIcon,
      avatarBlock,
      roleBadgeHtml: u.role ? roleBadge(u.role) : directoryPillHtml("Sin rol", "warn"),
      email: String(u.email || "Sin correo"),
      twoFactor: Boolean(u.twoFactorEnabled)
    };
  };

  const renderUserCard = (u, mode = "active") => {
    const m = userAccessMeta(u, mode);
    return `<article class="adm-badge adm-badge--${escapeAttr(m.tone)} adm-badge--role-${escapeAttr(m.roleKey)} directory-card--user" data-user-id="${escapeAttr(m.uid)}">
      <div class="adm-badge__band" aria-hidden="true"></div>
      <header class="adm-badge__head">
        ${m.avatarBlock}
        <div class="adm-badge__head-meta">
          <span class="ag-status ag-status--${m.tone}"><span class="ag-status__dot" aria-hidden="true"></span>${escapeHtml(m.statusLabel)}</span>
        </div>
      </header>
      <div class="adm-badge__who">
        <h4 class="adm-badge__name" title="${escapeAttr(m.displayName)}">${escapeHtml(m.displayName)}${m.isMe ? ' <span class="ag-access-card__you">Tú</span>' : ""}</h4>
        <p class="adm-badge__org"><span class="adm-badge__org-name">${escapeHtml(m.companyName)}</span>${m.roleBadgeHtml}</p>
        <p class="adm-badge__mail">${escapeHtml(m.email)}</p>
      </div>
      <div class="adm-badge__meter" role="img" aria-label="${m.permissionCount} permisos asignados">
        <span class="adm-gauge">
          <span class="adm-ring" style="--pct:${m.permPct}"><span><strong>${m.permissionCount}</strong></span></span>
          <small>accesos</small>
        </span>
        <ul class="adm-badge__facts">
          <li><span>Vínculo</span><strong>${escapeHtml(m.profileChipLabel)}</strong></li>
          <li><span>2FA</span><strong class="${m.twoFactor ? "is-ok" : "is-warn"}">${m.twoFactor ? "Activa" : "Off"}</strong></li>
          <li><span>Ingreso</span><strong>${escapeHtml(m.joinedLabel)}</strong></li>
        </ul>
      </div>
      ${
        m.rejectionReason
          ? `<p class="adm-badge__note adm-badge__note--alert">${escapeHtml(m.rejectionReason)}</p>`
          : m.isPending
            ? '<p class="adm-badge__note">Revise empresa, rol y permisos antes de aprobar.</p>'
            : `<p class="adm-badge__note">${escapeHtml(m.docLabel)}</p>`
      }
      <footer class="adm-badge__foot">
        <div class="adm-badge__contact">
          ${
            m.phoneLabel
              ? `<a class="adm-badge__tel" href="tel:${escapeAttr(m.phoneRaw)}">${IC.phone}<span>${escapeHtml(m.phoneLabel)}</span></a>`
              : '<span class="adm-badge__tel adm-badge__tel--muted">Sin teléfono</span>'
          }
        </div>
        <div class="adm-badge__actions">
          ${m.primary}
          ${m.viewIcon}
          ${m.editBtn}
          ${accessMenu(m.menuItems)}
        </div>
      </footer>
    </article>`;
  };

  const renderUserListRow = (u, mode = "active") => {
    const m = userAccessMeta(u, mode);
    return `<tr class="adm-row adm-row--${escapeAttr(m.tone)}" data-user-id="${escapeAttr(m.uid)}">
      <td data-label="Usuario">
        <div class="ag-row__who">
          ${m.avatarBlock.replace("ag-avatar--lg", "ag-avatar--sm")}
          <div>
            <strong>${escapeHtml(m.displayName)}${m.isMe ? " · tú" : ""}</strong>
            <span>${escapeHtml(m.email)}</span>
          </div>
        </div>
      </td>
      <td data-label="Rol">${m.roleBadgeHtml}</td>
      <td data-label="Estado"><span class="ag-status ag-status--${m.tone}"><span class="ag-status__dot" aria-hidden="true"></span>${escapeHtml(m.statusLabel)}</span></td>
      <td data-label="Permisos"><strong class="ag-row__mono">${m.permissionCount}</strong></td>
      <td data-label="2FA"><span class="ag-check ag-check--${m.twoFactor ? "ok" : "warn"}">${m.twoFactor ? "On" : "Off"}</span></td>
      <td data-label="Empresa"><span class="ag-row__sub">${escapeHtml(m.companyName)}</span></td>
      <td data-label="Teléfono">${m.phoneLabel ? `<a class="adm-badge__tel" href="tel:${escapeAttr(m.phoneRaw)}">${escapeHtml(m.phoneLabel)}</a>` : "—"}</td>
      <td data-label="Acciones" class="ag-row__actions">
        ${m.isPending && isAdmin ? `<button type="button" class="ag-icon-btn ag-icon-btn--primary" data-action="approve-registration" data-id="${escapeAttr(m.uid)}" title="Aprobar">${IC.check}</button>` : ""}
        <button type="button" class="ag-icon-btn${m.isPending ? "" : " ag-icon-btn--primary"}" data-action="view-user" data-id="${escapeAttr(m.uid)}" title="Ver ficha">${IC.eye}</button>
        ${m.editBtn}
        ${accessMenu(m.menuItems)}
      </td>
    </tr>`;
  };

  const companyAccessMeta = (c) => {
    const active = isCompanyRecordActive(c);
    const cid = String(c.id || "");
    const usersCount = users.filter((u) => String(u.companyId || "") === cid).length;
    const rawName = String(c.name || "Empresa");
    const name = directoryCardTitle(rawName) || rawName;
    const initial = String((rawName || "?").trim().charAt(0).toUpperCase() || "?");
    const logoUrl = companyProfileLogoUrl(c);
    const hue = typeof agAvatarHue === "function" ? agAvatarHue(name) : 0;
    const avatarCompany = (size) =>
      `<span class="ag-avatar${size ? ` ag-avatar--${size}` : ""} ag-avatar--hue-${hue}${logoUrl ? " ag-avatar--photo" : ""}" aria-hidden="true">${
        logoUrl ? `<img src="${escapeAttr(logoUrl)}" alt="" loading="lazy" />` : escapeHtml(initial)
      }</span>`;
    const nit = String(c.taxId || c.nit || "").trim() || "Sin NIT";
    const phoneRaw = String(c.phone || "").replace(/[^\d+]/g, "");
    const phoneDisp = c.phone ? formatPortalPhoneForDisplay(String(c.phone)) : "";
    const emailLabel = String(c.email || "").trim();
    const contactLabel = directoryCardTitle(String(c.contactName || "").trim());
    const locationLabel = c.city
      ? `${directoryCardTitle(String(c.city)) || String(c.city)}${c.department ? `, ${directoryCardTitle(String(c.department)) || String(c.department)}` : ""}`
      : "—";
    const kindForUi = patchOperatorCompanyKindIfNeeded([{ ...c }])[0]?.companyKind ?? c.companyKind;
    const tone = active ? "ok" : "alert";
    const menuItems = [
      isAdmin
        ? {
            action: "toggle-company-active",
            id: cid,
            icon: active ? IC.x : IC.check,
            label: active ? "Desactivar" : "Activar"
          }
        : null,
      isAdmin ? "sep" : null,
      isAdmin ? { action: "delete-company", id: cid, icon: IC.trash, label: "Eliminar empresa", tone: "danger" } : null
    ];
    return { active, cid, usersCount, name, avatarCompany, nit, phoneRaw, phoneDisp, emailLabel, contactLabel, locationLabel, kindForUi, tone, menuItems };
  };

  const renderCompanyCard = (c) => {
    const m = companyAccessMeta(c);
    return `<article class="adm-badge adm-badge--${escapeAttr(m.tone)} adm-badge--company directory-card--company" data-company-id="${escapeAttr(m.cid)}">
      <div class="adm-badge__band" aria-hidden="true"></div>
      <header class="adm-badge__head">
        ${m.avatarCompany("lg")}
        <div class="adm-badge__head-meta">
          <span class="ag-status ag-status--${m.tone}"><span class="ag-status__dot" aria-hidden="true"></span>${m.active ? "Operativa" : "Inactiva"}</span>
        </div>
      </header>
      <div class="adm-badge__who">
        <h4 class="adm-badge__name" title="${escapeAttr(m.name)}">${escapeHtml(m.name)}</h4>
        <p class="adm-badge__org"><span class="adm-badge__org-name">${escapeHtml(m.nit)}</span>${companyKindChipHtml(m.kindForUi)}</p>
        <p class="adm-badge__mail">${escapeHtml(m.contactLabel || m.emailLabel || "Sin contacto")}</p>
      </div>
      <div class="adm-badge__meter">
        <span class="adm-gauge">
          <span class="adm-ring adm-ring--users" style="--pct:${Math.min(100, m.usersCount * 12)}"><span><strong>${m.usersCount}</strong></span></span>
          <small>cuentas</small>
        </span>
        <ul class="adm-badge__facts">
          <li><span>Tipo</span><strong>${escapeHtml(companyKindChipShortLabel(normalizeCompanyKindForDb(m.kindForUi)))}</strong></li>
          <li><span>Logo</span><strong class="${companyProfileLogoUrl(c) ? "is-ok" : "is-warn"}">${companyProfileLogoUrl(c) ? "Sí" : "No"}</strong></li>
          <li><span>Sede</span><strong>${escapeHtml(m.locationLabel)}</strong></li>
        </ul>
      </div>
      <p class="adm-badge__note">${escapeHtml(m.emailLabel || "Sin correo corporativo")}</p>
      <footer class="adm-badge__foot">
        <div class="adm-badge__contact">
          ${
            m.phoneDisp
              ? `<a class="adm-badge__tel" href="tel:${escapeAttr(m.phoneRaw)}">${IC.phone}<span>${escapeHtml(m.phoneDisp)}</span></a>`
              : '<span class="adm-badge__tel adm-badge__tel--muted">Sin teléfono</span>'
          }
        </div>
        <div class="adm-badge__actions">
          <button type="button" class="ag-btn ag-btn--primary" data-action="view-company" data-id="${escapeAttr(m.cid)}">${IC.eye}<span>Ver ficha</span></button>
          ${isAdmin ? `<button type="button" class="ag-icon-btn" data-action="open-edit-company" data-id="${escapeAttr(m.cid)}" title="Editar" aria-label="Editar ${escapeAttr(m.name)}">${IC.edit}</button>` : ""}
          ${accessMenu(m.menuItems)}
        </div>
      </footer>
    </article>`;
  };

  const renderCompanyListRow = (c) => {
    const m = companyAccessMeta(c);
    return `<tr class="adm-row adm-row--${escapeAttr(m.tone)}" data-company-id="${escapeAttr(m.cid)}">
      <td data-label="Empresa">
        <div class="ag-row__who">
          ${m.avatarCompany("sm")}
          <div><strong>${escapeHtml(m.name)}</strong><span>${escapeHtml(m.nit)}</span></div>
        </div>
      </td>
      <td data-label="Tipo">${companyKindChipHtml(m.kindForUi)}</td>
      <td data-label="Estado"><span class="ag-status ag-status--${m.tone}"><span class="ag-status__dot" aria-hidden="true"></span>${m.active ? "Operativa" : "Inactiva"}</span></td>
      <td data-label="Usuarios"><strong class="ag-row__mono">${m.usersCount}</strong></td>
      <td data-label="Contacto"><span class="ag-row__sub">${escapeHtml(m.contactLabel || m.emailLabel || "—")}</span></td>
      <td data-label="Teléfono">${m.phoneDisp ? `<a class="adm-badge__tel" href="tel:${escapeAttr(m.phoneRaw)}">${escapeHtml(m.phoneDisp)}</a>` : "—"}</td>
      <td data-label="Acciones" class="ag-row__actions">
        <button type="button" class="ag-icon-btn ag-icon-btn--primary" data-action="view-company" data-id="${escapeAttr(m.cid)}" title="Ver ficha">${IC.eye}</button>
        ${isAdmin ? `<button type="button" class="ag-icon-btn" data-action="open-edit-company" data-id="${escapeAttr(m.cid)}" title="Editar">${IC.edit}</button>` : ""}
        ${accessMenu(m.menuItems)}
      </td>
    </tr>`;
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
  const userStatusFilter = String(ui.userStatusFilter || "all").toLowerCase();
  const userRoleFilter = String(ui.userRoleFilter || "all").toLowerCase();
  const companyStatusFilter = String(ui.companyStatusFilter || "all").toLowerCase();
  const auF = {
    fCompany: String(ui.fCompany || ""),
    fKind: String(ui.fKind || ""),
    f2fa: String(ui.f2fa || ""),
    fCompKind: String(ui.fCompKind || ""),
    fCompCity: String(ui.fCompCity || "")
  };
  const activeUsersView = activeUsers.filter((u) => {
    if (directorySearch && !directoryMatch(userDirectoryBlob(u))) return false;
    const statusKey = normalizeUserAccountStatus(u);
    if (userStatusFilter === "active" && statusKey === ACCOUNT_STATUS.RECHAZADO) return false;
    if (userStatusFilter === "inactive" && statusKey !== ACCOUNT_STATUS.RECHAZADO) return false;
    if (userRoleFilter !== "all" && String(u.role || "").toLowerCase() !== userRoleFilter) return false;
    if (auF.fCompany && String(u.companyId || "") !== auF.fCompany) return false;
    if (auF.fKind) {
      const k = normalizeRegistrationKindForDb(u.registrationKind ?? u.profileQualityChecklist?.registrationKind);
      if (k !== auF.fKind) return false;
    }
    if (auF.f2fa === "on" && !u.twoFactorEnabled) return false;
    if (auF.f2fa === "off" && u.twoFactorEnabled) return false;
    return true;
  });
  if (state.adminUsersEntryHydrating) {
    return adminUsersHydratingShellHtml({ pendingUsers, activeUsers, companies, ui });
  }
  const directoryLayout = String(ui.directoryLayout || "cards").toLowerCase() === "list" ? "list" : "cards";
  const wrapDirectory = (kind, rows, emptyHtml) => {
    if (!rows.length) return emptyHtml;
    if (directoryLayout === "list") {
      const heads =
        kind === "company"
          ? `<th>Empresa</th><th>Tipo</th><th>Estado</th><th>Usuarios</th><th>Contacto</th><th>Teléfono</th><th>Acciones</th>`
          : `<th>Usuario</th><th>Rol</th><th>Estado</th><th>Permisos</th><th>2FA</th><th>Empresa</th><th>Teléfono</th><th>Acciones</th>`;
      return `<div class="admin-users-list-shell adm-list-shell"><div class="ag-table-wrap"><table class="ag-table adm-table"><thead><tr>${heads}</tr></thead><tbody>${rows.join("")}</tbody></table></div></div>`;
    }
    return `<div class="admin-users-list-shell"><div class="adm-badge-grid adm-badge-grid--${kind}">${rows.join("")}</div></div>`;
  };
  const pendingCardsHtml = wrapDirectory(
    "pending",
    pendingUsersView.map((u) => (directoryLayout === "list" ? renderUserListRow(u, "pending") : renderUserCard(u, "pending"))),
    "",
  );
  const userCards = wrapDirectory(
    "user",
    activeUsersView.map((u) => (directoryLayout === "list" ? renderUserListRow(u, "active") : renderUserCard(u, "active"))),
    "",
  );

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
            <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="admin-create">${IC.eyeOff} Mostrar</button>
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
      <label class="full">${fieldLabel(IC.upload, "Foto del usuario")}<input type="file" name="avatarFile" accept="image/jpeg,image/png,image/webp,image/gif" /></label>
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
            <input type="file" id="admin-company-create-logo-file" name="logoFile" accept="image/jpeg,image/png,image/webp,image/gif" required class="company-logo-file-input" aria-label="Seleccionar logo de la empresa" />
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
            <input type="file" id="admin-company-edit-logo-file" name="logoFile" accept="image/jpeg,image/png,image/webp,image/gif" class="company-logo-file-input" aria-label="Cambiar logo de la empresa" />
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

  const fPerm = `<form id="form-admin-user-permissions" class="p-form adm-perm-form">
    <label class="full">${fieldLabel(IC.user, "Seleccionar usuario")}
      <select name="userId" required>
        <option value="">Seleccione un usuario...</option>
        ${userOptions}
      </select>
    </label>
    <p class="muted full adm-perm-hint">Los módulos siguen el rol. Marque o quite un grupo entero con «Todo el módulo». Lo que no aplique al rol no aparece.</p>
    <fieldset class="full perm-fieldset">
      <legend>Módulos visibles</legend>
      <div class="perm-grid">${(() => {
        const permTarget = permUserId ? users.find((u) => String(u.id) === permUserId) : null;
        return buildGranularPermissionsCheckboxesHtml(
          permTarget ? effectiveUserPermissions(permTarget) : [],
          permTarget ? { role: permTarget.role } : {}
        );
      })()}</div>
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
            <input type="file" id="admin-edit-user-avatar-input" name="avatarFile" accept="image/jpeg,image/png,image/webp,image/gif" class="profile-avatar-file-input profile-avatar-file-input--sr-only" aria-label="Cambiar foto del usuario" tabindex="-1" />
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
            <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="admin-edit">${IC.eyeOff} Mostrar</button>
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
  const companiesForView = companiesSorted.filter((c) => {
    if (
      directorySearch &&
      !directoryMatch(
        `${c.name} ${c.taxId || c.nit || ""} ${c.email || ""} ${c.contactName || ""} ${c.phone || ""} ${c.city || ""} ${c.department || ""}`
      )
    ) {
      return false;
    }
    const active = isCompanyRecordActive(c);
    if (companyStatusFilter === "active" && !active) return false;
    if (companyStatusFilter === "inactive" && active) return false;
    if (auF.fCompKind && String(c.companyKind || "") !== auF.fCompKind) return false;
    if (auF.fCompCity && String(c.city || "").trim() !== auF.fCompCity) return false;
    return true;
  });
  const companyCardsHtml = wrapDirectory(
    "company",
    companiesForView.map((c) => (directoryLayout === "list" ? renderCompanyListRow(c) : renderCompanyCard(c))),
    "",
  );
  const approvedUsers = users.filter((u) => u.accountStatus === ACCOUNT_STATUS.APROBADO);
  const activeCompaniesCount = companies.filter((c) => isCompanyRecordActive(c)).length;
  const inactiveCompaniesCount = Math.max(0, companies.length - activeCompaniesCount);
  const sessions = Array.isArray(state.adminUserSessions) ? state.adminUserSessions : [];
  const activeSessions = sessions.filter((s) => String(s.status || "").toLowerCase() === "activa").length;
  const expiredSessions = sessions.filter((s) => String(s.status || "").toLowerCase() !== "activa").length;
  const focusCardClass = "admin-users-data-card admin-users-focus-card";

  const approvedCount = approvedUsers.length;

  const inactiveUsersCount = users.filter((u) => normalizeUserAccountStatus(u) === ACCOUNT_STATUS.RECHAZADO).length;
  const hero = `<header class="ag-fleet__head adm-access-head">
    <div class="ag-fleet__title">
      <p class="ag-eyebrow">Sistema · Gobierno de acceso</p>
      <h2>Usuarios y permisos</h2>
      <p class="ag-fleet__hint">Altas, roles y módulos visibles. La ficha guarda el perfil; los permisos se ajustan por módulo sin saturar la tarjeta.</p>
      <div class="users-hero-actions adm-access-head__actions">
        <button type="button" class="ag-btn ag-btn--primary" data-action="toggle-admin-panel" data-panel="create-user">${IC.userPlus}<span>Nuevo usuario</span></button>
        <button type="button" class="ag-icon-btn" data-action="toggle-admin-panel" data-panel="create-company" title="Nueva empresa" aria-label="Nueva empresa">${IC.building || IC.briefcase}</button>
        <button type="button" class="ag-icon-btn" data-action="toggle-admin-panel" data-panel="set-permissions" title="Asignar permisos" aria-label="Asignar permisos">${IC.shield}</button>
        <button type="button" class="ag-icon-btn" data-action="refresh-user-sessions" title="Actualizar sesiones" aria-label="Actualizar sesiones">${IC.activity}</button>
      </div>
    </div>
    <div class="ag-fleet__kpis">
      <div class="ag-kpi${pendingUsers.length ? " ag-kpi--warn" : ""}"><span class="ag-kpi__label">Pendientes</span><strong class="ag-kpi__value">${pendingUsers.length}</strong><span class="ag-kpi__sub">altas por aprobar</span></div>
      <div class="ag-kpi ag-kpi--ok"><span class="ag-kpi__label">Activos</span><strong class="ag-kpi__value">${approvedCount}</strong><span class="ag-kpi__sub">${inactiveUsersCount ? `${inactiveUsersCount} inactiv${inactiveUsersCount === 1 ? "a" : "as"}` : "sin inactivos"}</span></div>
      <div class="ag-kpi"><span class="ag-kpi__label">Empresas</span><strong class="ag-kpi__value">${activeCompaniesCount}</strong><span class="ag-kpi__sub">${inactiveCompaniesCount ? `${inactiveCompaniesCount} inactiva${inactiveCompaniesCount === 1 ? "" : "s"}` : "todas operativas"}</span></div>
      <div class="ag-kpi"><span class="ag-kpi__label">Sesiones</span><strong class="ag-kpi__value">${activeSessions}</strong><span class="ag-kpi__sub">activas ahora</span></div>
    </div>
  </header>`;

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
            pendingCardsHtml,
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
        ? userCards
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
            companyCardsHtml,
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
  const userRolePills = (PORTAL_ASSIGNABLE_ROLES || [])
    .filter((r) => activeUsers.some((u) => String(u.role || "") === r.value))
    .map(
      (r) =>
        `<option value="${escapeAttr(r.value)}"${userRoleFilter === r.value ? " selected" : ""}>${escapeHtml(r.label)}</option>`
    )
    .join("");
  const auPairs = (vals) => uniqueSortedFilterValues(vals).map((v) => [v, v]);
  const adminExtraFilters =
    adminUsersSection === "users"
      ? renderModuleFieldFilters({
          ariaLabel: "Filtros de usuarios",
          action: "admin-users-field",
          clearAction: "admin-users-fields-clear",
          extraClass: "admin-users-field-filters",
          fields: [
            { key: "fCompany", label: "Empresa", value: auF.fCompany, allLabel: "Todas las empresas",
              options: companies.filter((c) => activeUsers.some((u) => String(u.companyId || "") === String(c.id))).map((c) => [String(c.id), c.name || c.id]).sort((a, b) => a[1].localeCompare(b[1], "es")) },
            { key: "fKind", label: "Tipo de vínculo", value: auF.fKind, allLabel: "Cliente e interno",
              options: [["cliente", "Cliente externo"], ["empleado_interno", "Usuario interno Antares"]] },
            { key: "f2fa", label: "Autenticación 2FA", value: auF.f2fa, allLabel: "Con o sin 2FA",
              options: [["on", "2FA activo"], ["off", "Sin 2FA"]] }
          ]
        })
      : adminUsersSection === "companies"
        ? renderModuleFieldFilters({
            ariaLabel: "Filtros de empresas",
            action: "admin-users-field",
            clearAction: "admin-users-fields-clear",
            extraClass: "admin-users-field-filters",
            fields: [
              { key: "fCompKind", label: "Tipo de empresa", value: auF.fCompKind, allLabel: "Todos los tipos",
                options: [["cliente", "Cliente"], ["tercero", "Tercero / proveedor"], ["propia", "Propia (Antares)"]] },
              { key: "fCompCity", label: "Ciudad", value: auF.fCompCity, allLabel: "Todas las ciudades",
                options: auPairs(companies.map((c) => String(c.city || "").trim())) }
            ]
          })
        : "";
  const directoryLayoutToggle = `<div class="ag-fleet__view" role="group" aria-label="Vista del directorio">
          <button type="button" class="ag-icon-btn${directoryLayout === "cards" ? " is-active" : ""}" data-action="admin-users-layout" data-layout="cards" title="Tarjetas" aria-label="Vista en tarjetas" aria-pressed="${directoryLayout === "cards"}">${IC.grid}</button>
          <button type="button" class="ag-icon-btn${directoryLayout === "list" ? " is-active" : ""}" data-action="admin-users-layout" data-layout="list" title="Lista" aria-label="Vista en lista" aria-pressed="${directoryLayout === "list"}">${IC.list}</button>
        </div>`;
  const directorySearchBar = ["pending", "users", "companies"].includes(adminUsersSection)
    ? `<div class="ag-fleet__row admin-users-directory-search">
        <div class="ag-fleet__row ag-fleet__row--filters">
          <label class="ag-search">
            ${IC.search || ""}
            <span class="visually-hidden">Buscar</span>
            <input type="search" data-action="admin-users-directory-search" value="${escapeAttr(directorySearchRaw)}" placeholder="Nombre, correo, documento, empresa…" autocomplete="off" />
          </label>
          ${
            adminUsersSection === "users"
              ? `<div class="ag-seg" role="group" aria-label="Estado de cuenta">
              <button type="button" class="ag-seg__btn${userStatusFilter === "all" ? " is-active" : ""}" data-action="admin-users-status-filter" data-status="all" aria-pressed="${userStatusFilter === "all"}">Todos</button>
              <button type="button" class="ag-seg__btn ag-seg__btn--available${userStatusFilter === "active" ? " is-active" : ""}" data-action="admin-users-status-filter" data-status="active" aria-pressed="${userStatusFilter === "active"}">Activos</button>
              <button type="button" class="ag-seg__btn ag-seg__btn--offline${userStatusFilter === "inactive" ? " is-active" : ""}" data-action="admin-users-status-filter" data-status="inactive" aria-pressed="${userStatusFilter === "inactive"}">Inactivos</button>
            </div>
            <label class="ag-select-chip${userRoleFilter !== "all" ? " is-set" : ""}">${IC.badge}
              <select data-action="admin-users-role-filter" aria-label="Filtrar por rol">
                <option value="all"${userRoleFilter === "all" ? " selected" : ""}>Todos los roles</option>
                ${userRolePills}
              </select>
            </label>`
              : ""
          }
          ${
            adminUsersSection === "companies"
              ? `<div class="ag-seg" role="group" aria-label="Estado de empresa">
              <button type="button" class="ag-seg__btn${companyStatusFilter === "all" ? " is-active" : ""}" data-action="admin-users-company-filter" data-status="all" aria-pressed="${companyStatusFilter === "all"}">Todas</button>
              <button type="button" class="ag-seg__btn ag-seg__btn--available${companyStatusFilter === "active" ? " is-active" : ""}" data-action="admin-users-company-filter" data-status="active" aria-pressed="${companyStatusFilter === "active"}">Operativas</button>
              <button type="button" class="ag-seg__btn ag-seg__btn--offline${companyStatusFilter === "inactive" ? " is-active" : ""}" data-action="admin-users-company-filter" data-status="inactive" aria-pressed="${companyStatusFilter === "inactive"}">Inactivas</button>
            </div>`
              : ""
          }
        </div>
        ${directoryLayoutToggle}
      </div>`
    : "";
  const directoryFiltersHtml = `${directorySearchBar}${adminExtraFilters}`;
  const actionsPane = `<div class="auth-tab-panel${adminUsersSection === "actions" ? "" : " hidden"}" data-admin-users-panel="actions"${adminUsersSection === "actions" ? "" : " hidden"}>${actionsPaneHtml}</div>`;
  const pendingPane = `<div class="auth-tab-panel${adminUsersSection === "pending" ? "" : " hidden"}" data-admin-users-panel="pending"${adminUsersSection === "pending" ? "" : " hidden"}>${pendingPaneHtml}</div>`;
  const usersPane = `<div class="auth-tab-panel${adminUsersSection === "users" ? "" : " hidden"}" data-admin-users-panel="users"${adminUsersSection === "users" ? "" : " hidden"}>${usersPaneHtml}</div>`;
  const companiesPane = `<div class="auth-tab-panel${adminUsersSection === "companies" ? "" : " hidden"}" data-admin-users-panel="companies"${adminUsersSection === "companies" ? "" : " hidden"}>${companiesPaneHtml}</div>`;
  const sessionsPane = `<div class="auth-tab-panel${adminUsersSection === "sessions" ? "" : " hidden"}" data-admin-users-panel="sessions"${adminUsersSection === "sessions" ? "" : " hidden"}>${sessionsPaneHtml}</div>`;
  return `<section class="admin-users-studio">${hero}${workspaceNav}${directoryFiltersHtml}<div class="auth-tab-panels">${actionsPane}${pendingPane}${usersPane}${companiesPane}${sessionsPane}</div></section>`;
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({adminUsersHtml});
})();

(function registerAdminUsersPortalAfterRender() {
  "use strict";
  function bindAdminUsersPortalControls() {
    if (String(state.currentView || "") !== "admin-users" || !nodes.viewRoot) return;
    const patchUi = (partial) => {
      if (typeof setAdminUsersUi === "function") setAdminUsersUi(partial);
      else state.adminUsersUi = { ...getAdminUsersUi(), ...partial };
    };

    nodes.viewRoot.querySelectorAll("[data-action='open-user-permissions']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = String(btn.dataset.id || "").trim();
        if (!id) return;
        patchUi({
          panel: "set-permissions",
          permUserId: id,
          editUserId: "",
          editCompanyId: "",
          section: "actions",
          permissionsMinimized: false
        });
        renderPortalView();
      });
    });

    bindModuleFieldFilters(nodes.viewRoot, {
      action: "admin-users-field",
      clearAction: "admin-users-fields-clear",
      onChange: (key, value) => {
        if (!["fCompany", "fKind", "f2fa", "fCompKind", "fCompCity"].includes(key)) return;
        patchUi({ [key]: value });
        renderPortalView();
      },
      onClear: () => {
        patchUi({ fCompany: "", fKind: "", f2fa: "", fCompKind: "", fCompCity: "" });
        renderPortalView();
      }
    });

    nodes.viewRoot.querySelectorAll("[data-action='admin-users-status-filter']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const status = String(btn.dataset.status || "all");
        patchUi({ userStatusFilter: ["all", "active", "inactive"].includes(status) ? status : "all" });
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='admin-users-company-filter']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const status = String(btn.dataset.status || "all");
        patchUi({ companyStatusFilter: ["all", "active", "inactive"].includes(status) ? status : "all" });
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='admin-users-role-filter']").forEach((sel) => {
      sel.addEventListener("change", () => {
        patchUi({ userRoleFilter: String(sel.value || "all") || "all" });
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='admin-users-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const layout = String(btn.dataset.layout || "cards").toLowerCase() === "list" ? "list" : "cards";
        patchUi({ directoryLayout: layout });
        renderPortalView();
      });
    });

    if (!nodes.viewRoot.dataset.permGroupToggleBound) {
      nodes.viewRoot.dataset.permGroupToggleBound = "1";
      nodes.viewRoot.addEventListener("click", (event) => {
        const btn = event.target instanceof Element ? event.target.closest("[data-action='perm-group-toggle']") : null;
        if (!btn || !nodes.viewRoot.contains(btn)) return;
        event.preventDefault();
        const group = btn.closest("[data-perm-group]");
        if (!group) return;
        const boxes = [...group.querySelectorAll("input[name='permissions']")].filter((el) => !el.disabled);
        if (!boxes.length) return;
        const allOn = boxes.every((el) => el.checked);
        boxes.forEach((el) => {
          el.checked = !allOn;
          el.closest(".perm-check")?.classList.toggle("is-on", el.checked);
        });
        const countEl = group.querySelector(".perm-group-count");
        const onCount = boxes.filter((el) => el.checked).length;
        if (countEl) countEl.textContent = `${onCount}/${boxes.length}`;
        btn.setAttribute("aria-pressed", String(!allOn));
        btn.textContent = !allOn ? "Quitar módulo" : "Todo el módulo";
      });
    }

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