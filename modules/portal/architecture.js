window.PortalArchitecture = (() => {
  const VIEW_DEFINITIONS = {
    dashboard: {
      title: "Dashboard",
      access: "any",
      shell: true,
      renderer: [{ module: "dashboard", exportName: "viewDashboard" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", ".toolbar", ".dash-grid", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    requests: {
      title: "Solicitudes",
      access: "admin-or-client",
      shell: true,
      renderer: [
        { module: "solicitudes", exportName: "requestFormHtml" },
        { module: "solicitudes", exportName: "requestListClientHtml", passUser: true }
      ],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", "[id^='create-']", ".toolbar", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    "transport-requests": {
      title: "Transporte · Solicitudes",
      access: "admin",
      shell: true,
      renderer: [{ module: "transporte", exportName: "adminQueueHtml" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    "transport-trips": {
      title: "Transporte · Viajes",
      access: "admin",
      shell: true,
      renderer: [{ module: "transporte", exportName: "transportTripsHtml" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", ".dash-grid", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    "transport-vehicles": {
      title: "Transporte · Camiones",
      access: "admin",
      shell: true,
      renderer: [{ module: "transporte", exportName: "vehiclesHtml" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", "[id^='create-']", ".toolbar", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    "transport-drivers": {
      title: "Transporte · Conductores",
      access: "admin",
      shell: true,
      renderer: [{ module: "transporte", exportName: "driversHtml" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    "transport-calendar": {
      title: "Transporte · Calendario",
      access: "admin",
      shell: true,
      renderer: [{ module: "transporte", exportName: "transportCalendarHtml" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", ".calendar-shell", ".toolbar", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    history: {
      title: "Transporte · Historial y reportes",
      access: "admin",
      shell: true,
      renderer: [{ module: "transporte", exportName: "historyHtml" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", "[id^='create-']", ".toolbar", ".dash-grid", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    reports: {
      title: "Centro de reporteria",
      access: "admin-or-rrhh",
      shell: true,
      renderer: [{ module: "transporte", exportName: "reportsHtml" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", ".dash-grid", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    payroll: {
      title: "Nomina",
      access: "rrhh",
      shell: true,
      renderer: [{ module: "rrhh", exportName: "payrollHtml" }],
      layoutPlan: [{ container: ".payroll-shell", order: [".fleet-hero-strip", ".ops-module-head", ".ops-command-bar", ".ops-block", ".p-card", ".payroll-data-grid"] }]
    },
    hiring: {
      title: "Contratacion",
      access: "rrhh",
      shell: true,
      renderer: [{ module: "rrhh", exportName: "hiringHtml" }],
      layoutPlan: [{ container: ".hiring-shell", order: [".fleet-hero-strip", ".ops-module-head", ".ops-command-bar", ".hr-flow-block", ".hiring-data-grid"] }]
    },
    "labor-compliance": {
      title: "Cumplimiento laboral y SST",
      access: "rrhh",
      shell: true,
      renderer: [{ module: "rrhh", exportName: "laborComplianceHtml" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", "[id^='create-']", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    "admin-users": {
      title: "Administración · Usuarios y permisos",
      access: "admin",
      shell: true,
      renderer: [{ module: "usuarios", exportName: "adminUsersHtml", passUser: true }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", ".users-hero-strip", "[id^='create-']", ".toolbar", ".dash-grid", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    authorizations: {
      title: "Autorizaciones",
      access: "admin",
      shell: true,
      renderer: [{ module: "autorizaciones", exportName: "authorizationsHtml" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", ".toolbar", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    "contact-leads": {
      title: "Solicitudes de contacto (web)",
      access: "admin",
      shell: true,
      renderer: [{ module: "contacto-b2b", exportName: "contactLeadsHtml" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", ".toolbar", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    profile: {
      title: "Mi perfil",
      access: "any",
      shell: true,
      renderer: [{ module: "perfil", exportName: "profileHtml", passUser: true }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    notifications: {
      title: "Notificaciones",
      access: "any",
      shell: true,
      renderer: [{ module: "notificaciones", exportName: "notificationsHtml" }],
      layoutPlan: [{ container: ".module-shell-body", order: [".fleet-hero-strip", ".toolbar", ".p-card", ".table-wrap", ".empty-state"] }]
    }
  };

  function isKnownView(view) {
    return Object.prototype.hasOwnProperty.call(VIEW_DEFINITIONS, String(view || ""));
  }

  function getViewDefinition(view) {
    return VIEW_DEFINITIONS[String(view || "")] || null;
  }

  function getTitle(view) {
    return getViewDefinition(view)?.title || "Dashboard";
  }

  function shouldUseShell(view) {
    return Boolean(getViewDefinition(view)?.shell);
  }

  function getLayoutPlan(view) {
    return getViewDefinition(view)?.layoutPlan || null;
  }

  function isAllowedByRole(user, view, deps) {
    const def = getViewDefinition(view);
    if (!def || !user) return false;
    const { ROLES, canAccessRRHH } = deps;
    switch (def.access) {
      case "admin":
        return user.role === ROLES.ADMIN;
      case "rrhh":
        return canAccessRRHH(user.role);
      case "admin-or-rrhh":
        return user.role === ROLES.ADMIN || canAccessRRHH(user.role);
      case "admin-or-client":
        return user.role === ROLES.CLIENT || user.role === ROLES.ADMIN;
      default:
        return true;
    }
  }

  function resolveContent({ user, view, renderFromModule, accessDeniedFactory }) {
    const def = getViewDefinition(view);
    if (!def) return accessDeniedFactory();
    const fragments = (def.renderer || []).map((item) =>
      renderFromModule(item.module, item.exportName, ...(item.passUser ? [user] : []))
    );
    return fragments.join("");
  }

  return {
    VIEW_DEFINITIONS,
    isKnownView,
    getViewDefinition,
    getTitle,
    shouldUseShell,
    getLayoutPlan,
    isAllowedByRole,
    resolveContent
  };
})();
