window.PortalCoreRouter = (() => {
  function getViewFromHash({ hash, isKnownView }) {
    const raw = String(hash || "");
    if (!raw.startsWith("#portal/")) return "";
    const view = raw.slice("#portal/".length).trim();
    return isKnownView(view) ? view : "";
  }

  function syncHash({ view, isKnownView, fallbackView = "dashboard" }) {
    const safeView = isKnownView(view) ? view : fallbackView;
    const nextHash = `#portal/${safeView}`;
    if (window.location.hash !== nextHash) {
      history.replaceState(null, "", nextHash);
    }
  }

  function enforceViewFromUrl({
    state,
    user,
    getViewFromHashFn,
    syncHashFn,
    isViewAllowed,
    onUnauthorized,
    fallbackView = "dashboard"
  }) {
    if (!state?.session || !user) return;
    const candidate = getViewFromHashFn();
    if (!candidate) {
      syncHashFn(state.currentView || fallbackView);
      return;
    }
    if (!isViewAllowed(user, candidate)) {
      state.currentView = fallbackView;
      syncHashFn(fallbackView);
      if (typeof onUnauthorized === "function") onUnauthorized(candidate);
      return;
    }
    state.currentView = candidate;
  }

  function activateSideLinks(sideLinks, view) {
    (sideLinks || []).forEach((link) => {
      link.classList.toggle("active", link.dataset.view === view);
    });
  }

  return {
    getViewFromHash,
    syncHash,
    enforceViewFromUrl,
    activateSideLinks
  };
})();
