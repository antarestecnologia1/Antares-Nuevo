/**
 * Mi perfil (profile): vista HTML y formulario en el portal.
 */

function profileSystemJoinDateValue(user) {
  if (!user || typeof user !== "object") return "";
  const candidates = [user.createdAt, user.registeredAt, user.portalSince, user.systemJoinDate];
  for (const raw of candidates) {
    if (!raw) continue;
    const s = String(raw).trim();
    if (!s) continue;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (Number.isFinite(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  return "";
}

function profileHtml(user) {
  const u = resolvePortalProfileUser(user);
  const companyName = portalUserCompanyDisplay(u);
  const docValue = portalUserDocumentValue(u);
  const joinedIso = profileSystemJoinDateValue(u);
  const joinedDate = joinedIso ? fmtDate(joinedIso) : u.createdAt ? fmtDate(u.createdAt) : "No disponible";
  const displayName = getPortalUserDisplayName(u);
  const emergencyName = String(u.emergencyContact || "").trim();
  const emergencyPhone = String(u.emergencyPhone || "").trim();
  const emergencyRelation = String(u.emergencyRelationship || u.emergencyRelation || "").trim();
  const accountStatusLabel =
    normalizeUserAccountStatus(u) === ACCOUNT_STATUS.PENDIENTE
      ? "Pendiente"
      : normalizeUserAccountStatus(u) === ACCOUNT_STATUS.RECHAZADO
        ? "Rechazada"
        : "Aprobada";
  const roleLabel = formatPortalRoleLabel(u.role) || "Usuario";
  const profileFields = [
    "name",
    "phone",
    "taxId",
    "personalDoc",
    "documentType",
    "birthDate",
    "emergencyContact",
    "emergencyPhone",
    "city",
    "department"
  ];
  const filled = profileFields.filter((f) => {
    if (f === "taxId" || f === "personalDoc") return Boolean(docValue);
    if (f === "emergencyContact") return Boolean(emergencyName);
    if (f === "emergencyPhone") return Boolean(emergencyPhone);
    return String(u[f] ?? "").trim();
  }).length;
  const profilePct = Math.round((filled / profileFields.length) * 100);
  const daysInPortal = u.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(u.createdAt).getTime()) / 86400000))
    : 0;
  const profileHero = moduleFleetHeroStrip([
    {
      label: "Perfil completo",
      value: `${profilePct}%`,
      tone: profilePct < 70 ? "warn" : undefined
    },
    { label: "Dias en portal", value: daysInPortal },
    {
      label: "Cuenta",
      value: u.accountStatus === ACCOUNT_STATUS.APROBADO ? "Activa" : "Revision",
      tone: u.accountStatus !== ACCOUNT_STATUS.APROBADO ? "warn" : undefined
    },
    { label: "Permisos", value: (u.permissions || []).length }
  ]);
  const profileAvatarCss = employeeAvatarCssUrl(u.avatarUrl);
  const body = `<section class="profile-shell profile-shell-centered">
    <article class="profile-hero-card profile-hero-card-centered">
      <label for="profile-avatar-input" class="profile-avatar profile-avatar-lg profile-avatar-upload ${profileAvatarCss ? "has-image" : ""}" style="${profileAvatarCss ? `background-image:url('${profileAvatarCss}');` : ""}" title="Cambiar foto de perfil">
        <span class="profile-avatar-initial">${profileAvatarCss ? "" : (displayName || "U").charAt(0).toUpperCase()}</span>
        <span class="profile-avatar-overlay"><span class="profile-avatar-overlay-inner">${IC.upload}<span>Cambiar foto</span></span></span>
        <input type="file" id="profile-avatar-input" name="avatarFile" form="form-profile" accept="image/*" class="profile-avatar-file-input" aria-label="Cambiar foto de perfil" />
      </label>
      <div class="profile-hero-info profile-hero-info-centered">
        <h3>${escapeHtml(displayName)}</h3>
        <p>${u.email || "-"}</p>
        <div class="profile-hero-chips">
          <span>${escapeHtml(roleLabel)}</span>
          <span>${escapeHtml(accountStatusLabel)}</span>
          <span>${companyName}</span>
        </div>
      </div>
    </article>
    <div class="profile-stats-strip">
      <article class="profile-stat-card"><p>Estado de cuenta</p><strong>${escapeHtml(accountStatusLabel)}</strong></article>
      <article class="profile-stat-card"><p>Privacidad</p><strong>Datos sensibles ocultos</strong></article>
      <article class="profile-stat-card"><p>Rol asignado</p><strong>${escapeHtml(roleLabel)}</strong></article>
    </div>
    <section class="profile-key-data">
      <article class="profile-key-item"><p>Documento / NIT</p><strong>${escapeHtml(docValue || "Sin registrar")}</strong></article>
      <article class="profile-key-item"><p>Telefono</p><strong>${escapeHtml(u.phone ? formatPortalPhoneForDisplay(String(u.phone)) : "Sin registrar")}</strong></article>
      <article class="profile-key-item"><p>Empresa</p><strong>${companyName}</strong></article>
      <article class="profile-key-item"><p>Fecha de registro</p><strong>${joinedDate}</strong></article>
    </section>
    <form id="form-profile" class="p-form p-form-colored profile-form profile-form-centered">
      <fieldset class="form-section form-section-blue full">
        <legend>${IC.user} Información personal</legend>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" value="${escapeAttr(displayName)}" required data-antares-restrict="person-name" data-antares-field="person-name" /></label>
          <label>${fieldLabel(IC.mail, "Correo corporativo")}<input type="email" value="${escapeAttr(u.email || "")}" disabled /></label>
          <label>${fieldLabel(IC.file, "Tipo documento")}<select name="documentType">
            <option value="CC" ${u.documentType === "CC" ? "selected" : ""}>Cédula de ciudadanía</option>
            <option value="CE" ${u.documentType === "CE" ? "selected" : ""}>Cédula de extranjería</option>
            <option value="NIT" ${u.documentType === "NIT" ? "selected" : ""}>NIT</option>
            <option value="PAS" ${u.documentType === "PAS" ? "selected" : ""}>Pasaporte</option>
          </select></label>
          <label>${fieldLabel(IC.badge, "Documento / NIT")}<input name="taxId" value="${escapeAttr(docValue)}" placeholder="Ej: 900123456-7" data-antares-restrict="alnum-doc" data-antares-field="doc" /></label>
          <label>${fieldLabel(IC.cake, "Fecha de nacimiento")}<input type="date" name="birthDate" value="${escapeAttr(u.birthDate || "")}" data-antares-validate-blur="date-iso" /></label>
          <label>${fieldLabel(IC.phone, "Teléfono celular")}<input name="phone" value="${escapeAttr(u.phone || "")}" placeholder="Ej: 3001234567" data-antares-restrict="digits" data-antares-validate-blur="phone-loose" /></label>
        </div>
      </fieldset>

      <fieldset class="form-section form-section-cyan full">
        <legend>${IC.heart} Contacto de emergencia</legend>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.user, "Nombre")}<input name="emergencyContact" value="${escapeAttr(emergencyName)}" placeholder="Nombre completo" data-antares-restrict="person-name" data-antares-field="person-name" /></label>
          <label>${fieldLabel(IC.phone, "Teléfono")}<input name="emergencyPhone" value="${escapeAttr(emergencyPhone)}" placeholder="Ej: 3001234567" data-antares-restrict="digits" data-antares-validate-blur="phone-loose" /></label>
          <label>${fieldLabel(IC.heart, "Parentesco")}<input name="emergencyRelation" value="${escapeAttr(emergencyRelation)}" placeholder="Cónyuge, padre..." /></label>
        </div>
      </fieldset>

      <fieldset class="form-section form-section-amber full">
        <legend>${IC.calendar} Ingreso al portal</legend>
        <div class="form-section-grid">
          <label class="full">${fieldLabel(IC.calendar, "Fecha de ingreso al sistema")}<input type="date" name="systemJoinDate" value="${escapeAttr(profileSystemJoinDateValue(u))}" disabled aria-readonly="true" /></label>
        </div>
      </fieldset>

      <fieldset class="form-section form-section-emerald full">
        <legend>${IC.briefcase} Empresa asociada</legend>
        <label class="full">
          <input value="${companyName}" disabled />
          <input type="hidden" name="companyId" value="${escapeAttr(u.companyId || "")}" />
        </label>
      </fieldset>

      <button class="btn btn-primary full" type="submit">${IC.save} Guardar perfil</button>
    </form>
  </section>`;
  return `<section class="profile-studio">${profileHero}${pcardWrap("user", "Mi perfil", null, body, "p-card-profile")}</section>`;
}

function bindProfilePortalControls() {
  if (String(state.currentView || "") !== "profile" || !nodes.viewRoot) return;

  const profileForm = document.getElementById("form-profile");
  if (profileForm) {
    const profileAvatarInput = document.getElementById("profile-avatar-input");
    const profileAvatarLabel = document.querySelector('label[for="profile-avatar-input"]');
    bindEmployeeAvatarFilePreview(profileAvatarInput, profileAvatarLabel);
    wireFormSubmitGuard(profileForm, async (event) => {
      const actor = currentUser();
      if (!actor) return;
      const data = readFormEntriesNormalized(profileForm);
      const Vprof = window.AntaresValidation;
      if (Vprof && typeof Vprof.validateProfileForm === "function") {
        const pv = Vprof.validateProfileForm(data);
        if (!pv.ok) {
          notify(pv.message, "error");
          return;
        }
        Object.assign(data, pv.sanitized);
      }
      const file = profileAvatarInput?.files?.[0];
      const persistProfile = async (avatarUrlValue = "") => {
        const users = read(KEYS.users, []);
        const company = getCompanyById(String(data.companyId || ""));
        const nextUsers = users.map((u) =>
          u.id === actor.id
            ? {
                ...u,
                name: normalizeLatinUpperForDb(String(data.name || u.name || "").trim()),
                phone: normalizePortalPhoneForStorage(String(data.phone || "").trim()),
                taxId: String(data.taxId || "").trim(),
                documentType: String(data.documentType || u.documentType || "CC")
                  .trim()
                  .toUpperCase(),
                birthDate: String(data.birthDate || "").trim(),
                emergencyContact: normalizeLatinUpperForDb(String(data.emergencyContact || "").trim()),
                emergencyPhone: normalizePortalPhoneForStorage(String(data.emergencyPhone || "").trim()),
                emergencyRelation: normalizeLatinUpperForDb(String(data.emergencyRelation || "").trim()),
                emergencyRelationship: normalizeLatinUpperForDb(String(data.emergencyRelation || "").trim()),
                // La fecha de ingreso al sistema es solo lectura: se deriva
                // siempre de la fecha de creación del usuario en el registro
                // (createdAt). Si no existiera todavía en cache, respaldamos
                // con valores previos. Nunca se sobreescribe desde Mi perfil.
                systemJoinDate: profileSystemJoinDateValue(u),
                portalSince: profileSystemJoinDateValue(u),
                companyId: company?.id || u.companyId,
                company: company?.name || u.company,
                avatarUrl: avatarUrlValue || u.avatarUrl || ""
              }
            : u
        );
        try {
          await writeAwaitServer(KEYS.users, nextUsers);
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el perfil en el servidor."), "error");
          return;
        }
        notify(userMessage("profileUpdatedOk"), "success");
        syncSessionProfileSnapshotFromCache();
        updatePortalSidebarSessionMeta();
        renderPortal();
      };
      try {
        if (file) {
          let nextAvatar = "";
          try {
            nextAvatar = await resolveEmployeeAvatarUrl(file, String(actor.avatarUrl || "").trim());
          } catch (presignErr) {
            devWarn?.("profile-avatar-resolve", presignErr);
            notify(String(presignErr?.message || "No fue posible subir la foto. Intente de nuevo."), "error");
            return;
          }
          const trimmed = String(nextAvatar || "").trim();
          if (!trimmed) {
            notify("No se obtuvo una imagen válida para el perfil.", "error");
            return;
          }
          await persistProfile(trimmed);
        } else {
          await persistProfile("");
        }
      } catch (err) {
        if (err && String(err.message || err).trim()) {
          notify(String(err.message || err), "error");
        }
      }
    });
  }
}

(function registerProfilePortalBinds() {
  "use strict";
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.profile = bindProfilePortalControls;
})();

(function registerProfileLegacyViews() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ profileHtml, profileSystemJoinDateValue });
})();