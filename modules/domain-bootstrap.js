(() => {
  const domainList = [
    "auth",
    "users",
    "companies",
    "vehicles",
    "drivers",
    "trips",
    "requests",
    "notifications",
    "payroll",
    "recruitment",
    "files"
  ];

  const registry = {};
  domainList.forEach((domain) => {
    registry[domain] = window.DomainModules?.[domain] || {};
  });

  /**
   * Repositorios por clave de almacenamiento (patrón adaptador).
   * La app legacy sigue usando read(KEYS.*) directamente; nuevas piezas pueden usar DomainRegistry.repo().
   */
  function wireFromAntaresDeps({ KEYS, read, write }) {
    if (!KEYS || typeof read !== "function" || typeof write !== "function") return;

    const list = (key) => ({
      storageKey: key,
      read: () => read(key, []),
      write: (v) => write(key, v)
    });

    const objectDoc = (key, empty = {}) => ({
      storageKey: key,
      read: () => read(key, empty),
      write: (v) => write(key, v)
    });

    const requestsRepo =
      window.DomainModules?.requests?.readAllSync &&
      window.DomainModules?.requests?.writeAllSync
        ? {
            storageKey: KEYS.requests,
            read: () => window.DomainModules.requests.readAllSync(),
            write: (v) => window.DomainModules.requests.writeAllSync(v)
          }
        : list(KEYS.requests);

    window.DomainRegistry.repositories = {
      users: list(KEYS.users),
      companies: list(KEYS.companies),
      counters: objectDoc(KEYS.counters, {}),
      contacts: list(KEYS.contacts),
      requests: requestsRepo,
      vehicles: list(KEYS.vehicles),
      drivers: list(KEYS.drivers),
      notifications: list(KEYS.notifications),
      emails: list(KEYS.emails),
      payrollEmployees: list(KEYS.payrollEmployees),
      payrollRuns: list(KEYS.payrollRuns),
      fuelLogs: list(KEYS.fuelLogs),
      vehicleTechnicalLogs: list(KEYS.vehicleTechnicalLogs),
      travelAllowanceRules: objectDoc(KEYS.travelAllowanceRules, { interDepartmentTripAmount: 85000 }),
      vacancies: list(KEYS.vacancies),
      candidates: list(KEYS.candidates),
      positions: list(KEYS.positions),
      interviews: list(KEYS.interviews),
      contracts: list(KEYS.contracts),
      hrAbsences: list(KEYS.hrAbsences),
      sstCompliance: list(KEYS.sstCompliance),
      approvals: list(KEYS.approvals),
      session: {
        storageKey: KEYS.session,
        read: () => read(KEYS.session, null),
        write: (v) => write(KEYS.session, v),
        clear() {
          localStorage.removeItem(KEYS.session);
        }
      }
    };
  }

  window.DomainRegistry = {
    domains: registry,
    repositories: null,

    wireFromAntares: wireFromAntaresDeps,

    has(domain) {
      return Boolean(this.domains[domain]);
    },
    get(domain) {
      return this.domains[domain] || null;
    },
    list() {
      return Object.keys(this.domains);
    },
    repo(name) {
      return this.repositories?.[name] || null;
    }
  };
})();
