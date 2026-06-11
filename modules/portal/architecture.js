window.PortalArchitecture = (() => {
  const VIEW_DEFINITIONS = {
    dashboard: {
      title: "Dashboard",
      access: "permission-gated",
      shell: true,
      renderer: [{ module: "dashboard", exportName: "viewDashboard" }],
      layoutPlan: [{ container: ".dashboard-studio", order: [".client-data-scope-bar", ".ops-dash", ".dash-grid", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    requests: {
      title: "Solicitudes",
      access: "permission-gated",
      shell: true,
      renderer: [{ module: "solicitudes", exportName: "requestsHtml", passUser: true }],
      layoutPlan: [
        {
          container: ".requests-studio",
          order: [".hr-workspace-header--payroll", ".hr-workspace-panels"]
        }
      ]
    },
    "transport-trips": {
      title: "Transporte · Viajes",
      access: "permission-gated",
      shell: true,
      renderer: [{ module: "transporte", exportName: "transportTripsHtml" }],
      layoutPlan: [
        {
          container: ".transport-studio",
          order: [".hr-workspace-header--payroll", ".hr-workspace-panels"]
        }
      ]
    },
    "transport-vehicles": {
      title: "Transporte · Camiones",
      access: "permission-gated",
      shell: true,
      renderer: [{ module: "transporte", exportName: "vehiclesHtml" }],
      layoutPlan: [
        {
          container: ".vehicles-studio",
          order: [".hr-workspace-header--payroll", ".hr-workspace-panels"]
        }
      ]
    },
    "transport-drivers": {
      title: "Transporte · Conductores",
      access: "permission-gated",
      shell: true,
      renderer: [{ module: "transporte", exportName: "driversHtml" }],
      layoutPlan: [{ container: ".drivers-studio", order: [".fleet-hero-strip", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    "transport-calendar": {
      title: "Transporte · Calendario",
      access: "permission-gated",
      shell: true,
      renderer: [{ module: "transporte", exportName: "transportCalendarHtml" }],
      layoutPlan: [{ container: ".calendar-studio", order: [".fleet-hero-strip", ".calendar-shell", ".toolbar", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    history: {
      title: "Transporte · Historial y reportes",
      access: "permission-gated",
      shell: true,
      renderer: [{ module: "transporte", exportName: "historyHtml" }],
      layoutPlan: [
        {
          container: ".history-studio",
          order: [
            ".history-studio-head",
            ".hist-shell-body",
            ".history-module",
            ".history-workspace-nav",
            ".history-panel",
            ".history-cards-grid",
            ".history-card",
            ".dash-grid",
            ".p-card",
            "[id^='create-']"
          ]
        }
      ]
    },
    reports: {
      title: "Centro de reporteria",
      access: "permission-gated",
      shell: true,
      renderer: [{ module: "transporte", exportName: "reportsHtml" }],
      layoutPlan: [
        {
          container: ".reports-studio",
          order: [".fleet-hero-strip", ".reports-workspace", ".dash-grid", ".p-card", ".table-wrap", ".empty-state"]
        }
      ]
    },
    payroll: {
      title: "Gestión humana",
      access: "admin-or-rrhh",
      shell: true,
      renderer: [{ module: "rrhh", exportName: "payrollHtml" }],
      layoutPlan: [
        {
          container: ".payroll-studio",
          order: [
            ".hr-workspace-header--payroll",
            ".hr-workspace-panels"
          ]
        }
      ]
    },
    hiring: {
      title: "Contratación",
      access: "admin-or-rrhh",
      shell: true,
      renderer: [{ module: "rrhh", exportName: "hiringHtml" }],
      layoutPlan: [
        {
          container: ".hiring-studio",
          order: [
            ".hr-workspace-header--hiring",
            ".hr-workspace-panels"
          ]
        }
      ]
    },
    "labor-compliance": {
      title: "Cumplimiento laboral y SST",
      access: "admin-or-rrhh",
      shell: true,
      renderer: [{ module: "rrhh", exportName: "laborComplianceHtml" }],
      layoutPlan: [{ container: ".sst-studio", order: [".fleet-hero-strip", "[id^='create-']", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    "admin-users": {
      title: "Administración · Usuarios y permisos",
      access: "admin",
      shell: true,
      renderer: [{ module: "usuarios", exportName: "adminUsersHtml", passUser: true }],
      layoutPlan: [{ container: ".admin-users-studio", order: [".fleet-hero-strip", ".users-hero-strip", "[id^='create-']", ".toolbar", ".dash-grid", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    authorizations: {
      title: "Centro de aprobaciones",
      access: "permission-gated",
      shell: true,
      renderer: [{ module: "autorizaciones", exportName: "authorizationsHtml" }],
      layoutPlan: [{ container: ".authorizations-studio", order: [".fleet-hero-strip", ".toolbar", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    "contact-leads": {
      title: "Solicitudes de contacto (web)",
      access: "admin-or-contact-b2b",
      shell: true,
      renderer: [{ module: "contacto-b2b", exportName: "contactLeadsHtml" }],
      layoutPlan: [{ container: ".b2b-studio", order: [".fleet-hero-strip", ".toolbar", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    profile: {
      title: "Mi perfil",
      access: "permission-gated",
      shell: true,
      renderer: [{ module: "perfil", exportName: "profileHtml", passUser: true }],
      layoutPlan: [{ container: ".profile-studio", order: [".fleet-hero-strip", ".p-card", ".table-wrap", ".empty-state"] }]
    },
    notifications: {
      title: "Notificaciones",
      access: "permission-gated",
      shell: true,
      renderer: [{ module: "notificaciones", exportName: "notificationsHtml" }],
      layoutPlan: [{ container: ".notifications-studio", order: [".fleet-hero-strip", ".toolbar", ".p-card", ".table-wrap", ".empty-state"] }]
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
      case "admin-or-contact-b2b":
        if (user.role === ROLES.ADMIN) return true;
        {
          const b2b = typeof window !== "undefined" && window.PERMISSIONS ? window.PERMISSIONS.CONTACT_B2B_VIEW : "contact_b2b_view";
          return Array.isArray(user.permissions) && user.permissions.includes(b2b);
        }
      case "rrhh":
        return canAccessRRHH(user.role);
      case "admin-or-rrhh":
        return user.role === ROLES.ADMIN || canAccessRRHH(user.role);
      case "admin-or-client":
        return user.role === ROLES.CLIENT || user.role === ROLES.ADMIN;
      case "permission-gated":
      case "any":
        return true;
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
