window.PortalCoreRenderer = (() => {
  function resolveViewContent({
    user,
    view,
    isViewAllowed,
    resolveContent,
    accessDeniedFactory
  }) {
    return !isViewAllowed(user, view)
      ? accessDeniedFactory()
      : resolveContent(user, view);
  }

  function safeResolve({ view, resolver, onError, fallbackFactory }) {
    try {
      return resolver();
    } catch (error) {
      if (typeof onError === "function") onError({ view, error });
      return fallbackFactory();
    }
  }

  function orderDirectChildrenBySelectors(container, selectors) {
    if (!container || !Array.isArray(selectors) || selectors.length === 0) return;
    const children = [...container.children];
    if (children.length < 2) return;
    const ordered = [];
    const used = new Set();
    selectors.forEach((selector) => {
      children.forEach((child) => {
        if (used.has(child)) return;
        if (child.matches(selector)) {
          ordered.push(child);
          used.add(child);
        }
      });
    });
    children.forEach((child) => {
      if (used.has(child)) return;
      ordered.push(child);
    });
    const changed = ordered.some((child, idx) => child !== children[idx]);
    if (!changed) return;
    ordered.forEach((child) => container.appendChild(child));
  }

  function applyManualLayout({ viewRoot, plan }) {
    if (!viewRoot || !plan) return;
    plan.forEach(({ container, order }) => {
      viewRoot.querySelectorAll(container).forEach((node) => {
        orderDirectChildrenBySelectors(node, order);
      });
    });
  }

  return {
    resolveViewContent,
    safeResolve,
    orderDirectChildrenBySelectors,
    applyManualLayout
  };
})();
