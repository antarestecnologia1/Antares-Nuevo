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

  window.DomainRegistry = {
    domains: registry,
    has(domain) {
      return Boolean(this.domains[domain]);
    },
    get(domain) {
      return this.domains[domain] || null;
    },
    list() {
      return Object.keys(this.domains);
    }
  };
})();
