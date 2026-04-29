window.PortalCoreAccess = (() => {
  function isViewAllowed({
    user,
    view,
    canAccessView,
    portalArch,
    ROLES,
    canAccessRRHH
  }) {
    if (!user || !canAccessView(user, view)) return false;
    return portalArch.isAllowedByRole(user, view, { ROLES, canAccessRRHH });
  }

  return {
    isViewAllowed
  };
})();
