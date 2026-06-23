/**
 * Portal — Dashboard (Antares Nexus · 2026)
 * Command center rediseñado. Módulo autocontenido.
 * Carga con `defer` después de `app.js`.
 */
(function registerDashboardPortalModule() {
  "use strict";

  /* ─────────────────────────────────────────────────────────────
     HELPERS DE TONO Y ESTADO
  ───────────────────────────────────────────────────────────── */

  function dashDomain() {
    return typeof AntaresDashboardDomain !== "undefined" ? AntaresDashboardDomain : null;
  }

  function dashRequestOutcomeTone(status) {
    const fn = dashDomain()?.requestOutcomeTone;
    return typeof fn === "function" ? fn(status) : "neutral";
  }

  function dashTripIsDelayed(request) {
    const fn = dashDomain()?.requestIsDelayed;
    return typeof fn === "function" ? fn(request) : false;
  }

  function dashOpsStatusTone(snap) {
    if (!snap) return "neutral";
    if (snap.delayedToday > 0) return "alert";
    if (snap.standbyToday > 0 || snap.pendingAssignment > 0) return "warn";
    if (snap.vehicleIdsEnRuta > 0) return "live";
    return "ok";
  }

  function dashActivitySortKey(request) {
    const candidates = [
      request?.updatedAt, request?.deliveredAt,
      request?.trip?.etaDelivery, request?.deliveryAt,
      request?.trip?.etaPickup, request?.pickupAt, request?.createdAt
    ];
    for (const value of candidates) {
      const ts = new Date(value).getTime();
      if (Number.isFinite(ts)) return ts;
    }
    return 0;
  }

  function dashCountFleetByStatus(groups) {
    const counts = { all: groups.length, "en-ruta": 0, programado: 0, cerrado: 0 };
    groups.forEach((g) => {
      const trips = g.trips || [];
      const liveCount = trips.filter((r) => dashRequestOutcomeTone(r.status) === "live").length;
      const completed = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
      const status = liveCount ? "en-ruta"
        : completed === trips.length && trips.length ? "cerrado"
        : trips.length ? "programado" : "libre";
      if (status in counts) counts[status] += 1;
    });
    return counts;
  }

  function dashFormatTimeAgo(iso) {
    const ts = new Date(iso).getTime();
    if (!Number.isFinite(ts)) return "ahora";
    const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (mins < 1) return "ahora";
    if (mins < 60) return `hace ${mins} min`;
    return `hace ${Math.round(mins / 60)} h`;
  }

  /* ─────────────────────────────────────────────────────────────
     CSS INLINE — variables de diseño y estilos completos
  ───────────────────────────────────────────────────────────── */

  const DASH_STYLES = `
/* ══ ANTARES NEXUS — theme-aware, suave y funcional ══ */
.dashboard-studio {
  --nx-accent:       var(--primary, #377cc0);
  --nx-accent-deep:  var(--primary-dark, #2a6399);
  --nx-accent-mid:   rgba(var(--primary-rgb, 55, 124, 192), 0.32);
  --nx-accent-low:   rgba(var(--primary-rgb, 55, 124, 192), 0.2);
  --nx-live:         #178564;
  --nx-live-low:     rgba(23, 133, 100, 0.18);
  --nx-live-mid:     rgba(23, 133, 100, 0.28);
  --nx-indigo:       #5c6bc0;
  --nx-indigo-low:   rgba(92, 107, 192, 0.1);
  --nx-violet:       #6b7fd7;
  --nx-violet-low:   rgba(107, 127, 215, 0.1);
  --nx-teal:         var(--nx-live);
  --nx-teal-glow:    rgba(23, 133, 100, 0.18);
  --nx-amber:        #c9820f;
  --nx-amber-low:    rgba(201, 130, 15, 0.1);
  --nx-amber-mid:    rgba(201, 130, 15, 0.16);
  --nx-green:        var(--success, #1b8e5f);
  --nx-green-low:    rgba(27, 142, 95, 0.1);
  --nx-green-mid:    rgba(27, 142, 95, 0.14);
  --nx-red:          var(--danger, #c53030);
  --nx-red-low:      rgba(197, 48, 48, 0.08);
  --nx-red-mid:      rgba(197, 48, 48, 0.14);
  --nx-cyan:         var(--nx-accent);
  --nx-cyan-mid:     var(--nx-accent-mid);
  --nx-cyan-low:     var(--nx-accent-low);
  --nx-bg:           #8fa8c0;
  --nx-void:         #96afc6;
  --nx-surface:      #9eb5ca;
  --nx-surface-2:    #92a9c0;
  --nx-surface-3:    #869fb8;
  --nx-glass:        rgba(158, 181, 202, 0.96);
  --nx-card-bg:      #a3bad0;
  --nx-card-bg-soft: linear-gradient(148deg, #97afc6 0%, #8ba3bb 48%, #8098b0 100%);
  --nx-brand-gradient: linear-gradient(135deg, var(--primary, #377cc0) 0%, var(--success, #1b8e5f) 100%);
  --nx-hero-accent: linear-gradient(180deg, var(--primary, #377cc0) 0%, var(--success, #1b8e5f) 100%);
  --nx-border:       rgba(var(--primary-rgb, 55, 124, 192), 0.28);
  --nx-border-hi:    rgba(var(--primary-rgb, 55, 124, 192), 0.42);
  --nx-text:         var(--text, #071828);
  --nx-text-2:       var(--text-soft, #1e3a52);
  --nx-text-3:       #4a6478;
  --nx-font-display: var(--font-display, 'Poppins', system-ui, sans-serif);
  --nx-font-ui:      var(--font-body, 'Montserrat', system-ui, sans-serif);
  --nx-font-data:    var(--font-tertiary, 'Roboto', monospace);
  --nx-r-sm: 8px; --nx-r: 12px; --nx-r-lg: 16px; --nx-r-xl: 18px;
  --nx-card-shadow: 0 2px 8px rgba(15, 43, 74, 0.14), 0 14px 40px rgba(55, 124, 192, 0.18);
  --nx-card-shadow-hover: 0 8px 20px rgba(15, 43, 74, 0.18), 0 24px 52px rgba(55, 124, 192, 0.26);
  --nx-shadow: var(--nx-card-shadow);
  --nx-glow-teal: 0 8px 24px rgba(23, 133, 100, 0.28);
  --nx-glow-blue: 0 8px 24px rgba(55, 124, 192, 0.32);
  --nx-ambient-opacity: 1;
  --nx-card-inset: inset 0 1px 0 rgba(255, 255, 255, 0.16);
  --at-bg: var(--nx-bg); --at-surface: var(--nx-glass); --at-surface-2: var(--nx-surface-2);
  --at-surface-3: var(--nx-surface-3); --at-border: var(--nx-border); --at-border-2: var(--nx-border-hi);
  --at-cyan: var(--nx-accent); --at-cyan-mid: var(--nx-cyan-mid); --at-cyan-low: var(--nx-cyan-low);
  --at-green: var(--nx-green); --at-green-mid: var(--nx-green-mid); --at-green-low: var(--nx-green-low);
  --at-amber: var(--nx-amber); --at-amber-mid: var(--nx-amber-mid); --at-amber-low: var(--nx-amber-low);
  --at-red: var(--nx-red); --at-red-mid: var(--nx-red-mid); --at-red-low: var(--nx-red-low);
  --at-text: var(--nx-text); --at-text-2: var(--nx-text-2); --at-text-3: var(--nx-text-3);
  --at-font-ui: var(--nx-font-ui); --at-font-data: var(--nx-font-data);
  --at-r-sm: var(--nx-r-sm); --at-r: var(--nx-r); --at-r-lg: var(--nx-r-lg);
}

body[data-theme="dark"] .dashboard-studio {
  --nx-bg:           #0a1018;
  --nx-void:         #0e1622;
  --nx-surface:      rgba(255, 255, 255, 0.05);
  --nx-surface-2:    rgba(255, 255, 255, 0.07);
  --nx-surface-3:    rgba(255, 255, 255, 0.1);
  --nx-glass:        rgba(18, 28, 42, 0.96);
  --nx-card-bg:      rgba(20, 30, 46, 0.97);
  --nx-card-bg-soft: linear-gradient(148deg, rgba(26, 38, 56, 0.98) 0%, rgba(16, 26, 40, 0.96) 100%);
  --nx-brand-gradient: linear-gradient(135deg, #83bee9 0%, #3cb896 100%);
  --nx-hero-accent: linear-gradient(180deg, #83bee9 0%, #3cb896 100%);
  --nx-border:       rgba(131, 190, 233, 0.14);
  --nx-border-hi:    rgba(131, 190, 233, 0.26);
  --nx-text:         var(--text, #e8f4fc);
  --nx-text-2:       var(--text-soft, #9ec7e8);
  --nx-text-3:       rgba(158, 199, 232, 0.55);
  --nx-accent-mid:   rgba(var(--primary-mid-rgb, 131, 190, 233), 0.2);
  --nx-accent-low:   rgba(var(--primary-mid-rgb, 131, 190, 233), 0.1);
  --nx-live:         #3cb896;
  --nx-live-low:     rgba(60, 184, 150, 0.12);
  --nx-live-mid:     rgba(60, 184, 150, 0.2);
  --nx-indigo-low:   rgba(140, 156, 230, 0.12);
  --nx-violet-low:   rgba(140, 156, 230, 0.12);
  --nx-amber:        #e5a020;
  --nx-red:          #ef6b6b;
  --nx-card-shadow: 0 2px 8px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  --nx-card-shadow-hover: 0 6px 24px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  --nx-shadow: var(--nx-card-shadow);
  --nx-glow-teal: 0 6px 22px rgba(60, 184, 150, 0.18);
  --nx-ambient-opacity: 0.4;
  --nx-card-inset: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.dashboard-studio *, .dashboard-studio *::before, .dashboard-studio *::after { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard-studio {
  font-family: var(--nx-font-ui);
  background:
    radial-gradient(ellipse 110% 65% at 50% -18%, rgba(var(--primary-rgb, 55, 124, 192), 0.32), transparent 58%),
    radial-gradient(ellipse 70% 55% at 100% 40%, rgba(27, 142, 95, 0.18), transparent 52%),
    radial-gradient(ellipse 60% 45% at 0% 80%, rgba(var(--primary-mid-rgb, 131, 190, 233), 0.22), transparent 50%),
    linear-gradient(180deg, #849eb8 0%, var(--nx-bg) 45%, var(--nx-void) 100%);
  color: var(--nx-text);
  min-height: 100%;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow-x: hidden;
}

.module-shell[data-module-view="dashboard"],
.module-shell[data-module-view="dashboard"] .module-shell-body,
#view-root:has(.dashboard-studio) {
  background: transparent;
  gap: 0;
  margin: 0;
  padding: 0;
}

.portal-main:has(.dashboard-studio) {
  padding: 0;
  background: linear-gradient(180deg, #849eb8 0%, var(--nx-bg, #8fa8c0) 140px, #879fb7 100%);
}

.portal-main:has(.dashboard-studio)::before {
  opacity: 0.22;
  background-size: 52px 52px;
}

.portal-layout:has(.dashboard-studio) {
  background: linear-gradient(160deg, #7f98b2 0%, #8fa8c0 45%, #849eb8 100%);
}

body[data-theme="dark"] .portal-main:has(.dashboard-studio) {
  background: linear-gradient(180deg, #060c14 0%, #0a1018 160px, #0e1622 100%);
}

body[data-theme="dark"] .portal-main:has(.dashboard-studio)::before {
  opacity: 0.2;
}

.dashboard-studio button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
.dashboard-studio a { color: inherit; text-decoration: none; }

/* Ambient canvas */
.nx-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.nx-ambient__mesh {
  position: absolute;
  inset: -15%;
  opacity: var(--nx-ambient-opacity);
  background:
    radial-gradient(ellipse 60% 50% at 8% 0%, rgba(var(--primary-rgb, 55, 124, 192), 0.38) 0%, transparent 58%),
    radial-gradient(ellipse 50% 45% at 92% 8%, rgba(27, 142, 95, 0.24) 0%, transparent 52%),
    radial-gradient(ellipse 45% 40% at 50% 100%, rgba(var(--primary-mid-rgb, 131, 190, 233), 0.22) 0%, transparent 48%);
}
.nx-ambient__grid {
  position: absolute;
  inset: 0;
  opacity: 0.72;
  background-image:
    linear-gradient(rgba(var(--primary-rgb, 55, 124, 192), 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--primary-rgb, 55, 124, 192), 0.12) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 90% 70% at 50% 20%, black 10%, transparent 82%);
}
.nx-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.68;
}
.nx-orb--1 { width: 420px; height: 420px; background: rgba(var(--primary-rgb, 55, 124, 192), 0.34); top: -8%; left: -5%; }
.nx-orb--2 { width: 320px; height: 320px; background: rgba(27, 142, 95, 0.24); top: 42%; right: -8%; }
.nx-orb--3 { width: 260px; height: 260px; background: rgba(var(--primary-mid-rgb, 131, 190, 233), 0.28); bottom: 5%; left: 32%; }

.dashboard-studio > *:not(.nx-ambient) { position: relative; z-index: 1; }

/* Tarjeta base — sistema unificado */
.at-kpi, .at-panel, .at-alerts-panel, .at-fleet-panel,
.at-activity-panel, .at-exec-item, .at-client-stat {
  background: var(--nx-card-bg);
  border: 1px solid var(--nx-border);
  box-shadow: var(--nx-card-shadow), var(--nx-card-inset);
  transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s;
}
.at-map {
  border: 1px solid rgba(var(--primary-rgb, 55, 124, 192), 0.22);
  box-shadow: var(--nx-card-shadow);
  transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s;
}

/* Reveal — estático, sin parpadeo al cargar */
.at-reveal { opacity: 1; animation: none; }
.dashboard-studio--mounted .at-reveal { opacity: 1; animation: none; }

/* ══ HEADER ══ */
.at-hero {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 28px;
  padding: 28px 36px 24px;
  border-bottom: 1px solid var(--nx-border-hi);
  background:
    radial-gradient(ellipse 80% 120% at 100% 0%, rgba(var(--primary-rgb, 55, 124, 192), 0.22), transparent 55%),
    radial-gradient(ellipse 60% 80% at 0% 100%, rgba(27, 142, 95, 0.12), transparent 50%),
    var(--nx-card-bg-soft);
  box-shadow: var(--nx-card-shadow);
  position: relative;
  overflow: hidden;
}
.at-hero::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: var(--nx-hero-accent);
  border-radius: 0 4px 4px 0;
}
.at-hero::after {
  content: '';
  position: absolute;
  top: -50%; right: -5%;
  width: min(380px, 45%);
  height: 200%;
  background: radial-gradient(circle, rgba(var(--primary-rgb, 55, 124, 192), 0.08) 0%, transparent 68%);
  pointer-events: none;
}
.at-hero__main { position: relative; z-index: 1; }
.at-hero__aside { position: relative; z-index: 1; }
.at-hero__eyebrow {
  font-family: var(--nx-font-data);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--nx-accent);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
}
.at-hero__eyebrow::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--nx-live);
  box-shadow: 0 0 0 3px var(--nx-live-low);
}
.at-hero__title {
  font-family: var(--nx-font-display);
  font-size: clamp(24px, 3.5vw, 32px);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--nx-text);
}
.at-hero__name {
  background: var(--nx-brand-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
}
.at-hero__meta {
  font-family: var(--nx-font-data);
  font-size: 11px;
  color: var(--nx-text-3);
  margin-top: 10px;
  display: flex;
  gap: 14px;
  padding: 6px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--nx-surface-2) 80%, transparent);
  border: 1px solid var(--nx-border);
  width: fit-content;
}
.at-hero__meta span + span::before { content: '·'; margin-right: 14px; opacity: 0.35; }
.at-hero__aside { display: flex; flex-direction: column; align-items: flex-end; gap: 14px; }
.at-hero__status-row { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; justify-content: flex-end; }

/* Health orb */
.nx-health-orb {
  width: 76px; height: 76px;
  position: relative;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--nx-card-bg);
  box-shadow: var(--nx-glow-teal);
}
.nx-health-orb::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: var(--nx-brand-gradient);
  z-index: -1;
}
.nx-health-orb svg {
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  margin: 3px;
  transform: rotate(-90deg);
  display: block;
}
.nx-health-orb__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.nx-health-orb__pct {
  font-family: var(--nx-font-data);
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}
.nx-health-orb__lbl { font-size: 8px; color: var(--nx-text-3); text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2px; }

/* Chips & actions */
.at-chips { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.at-chip {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 12px; font-weight: 600;
  border: 1px solid;
  background: var(--nx-card-bg);
  box-shadow: 0 2px 8px rgba(15, 43, 74, 0.05);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.at-chip:hover { transform: translateY(-2px); box-shadow: var(--nx-card-shadow-hover); }
.at-chip--warn   { background: linear-gradient(135deg, var(--nx-amber-low), var(--nx-surface-2)); border-color: rgba(201,130,15,0.32); color: var(--nx-amber); }
.at-chip--doc    { background: linear-gradient(135deg, var(--nx-accent-low), var(--nx-surface-2)); border-color: var(--nx-border-hi); color: var(--nx-accent-deep); }
.at-chip--live   { background: linear-gradient(135deg, var(--nx-live-low), var(--nx-surface-2)); border-color: rgba(23,133,100,0.32); color: var(--nx-live); }
.at-chip--ok     { background: linear-gradient(135deg, var(--nx-green-low), var(--nx-surface-2)); border-color: rgba(27,142,95,0.3); color: var(--nx-green); }
.at-chip--alert  { background: linear-gradient(135deg, var(--nx-red-low), var(--nx-surface-2)); border-color: rgba(197,48,48,0.3); color: var(--nx-red); }
.at-chip--neutral { background: var(--nx-surface-2); border-color: var(--nx-border-hi); color: var(--nx-text-2); }
.at-chip__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.at-quick-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.at-qa-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  border-radius: var(--nx-r-sm);
  font-size: 12px; font-weight: 500;
  background: var(--nx-surface-2);
  border: 1px solid var(--nx-border);
  color: var(--nx-text-2);
  box-shadow: 0 1px 2px rgba(15, 43, 74, 0.04);
  transition: all 0.2s;
}
.at-qa-btn:hover { background: var(--nx-card-bg); color: var(--nx-text); border-color: var(--nx-border-hi); transform: translateY(-1px); box-shadow: var(--nx-card-shadow); }
.at-qa-btn--primary {
  background: linear-gradient(135deg, var(--nx-accent) 0%, var(--nx-accent-deep) 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 6px 20px rgba(var(--primary-rgb, 55, 124, 192), 0.38);
}
.at-qa-btn--primary:hover {
  filter: brightness(1.06);
  color: #fff;
  box-shadow: 0 8px 28px rgba(var(--primary-rgb, 55, 124, 192), 0.45);
  transform: translateY(-2px);
}

/* ══ KPI GRID — clicables, tinte semántico ══ */
.at-kpi-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  padding: 22px 36px;
  background: color-mix(in srgb, var(--nx-surface-3) 72%, var(--nx-bg));
  border-bottom: 1px solid var(--nx-border-hi);
}
.at-kpi {
  border-radius: var(--nx-r-lg);
  padding: 18px 18px 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  overflow: hidden;
  text-align: left;
  width: 100%;
}
.at-kpi--action { cursor: pointer; }
.at-kpi--action:hover, .at-kpi:hover {
  transform: translateY(-4px);
  border-color: var(--nx-border-hi);
  box-shadow: var(--nx-card-shadow-hover), var(--nx-card-inset);
}
.at-kpi--action:active { transform: translateY(-2px); }
.at-kpi::before {
  content: '';
  position: absolute;
  left: 0; top: 12px; bottom: 12px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: var(--at-kpi-accent, var(--nx-border));
}
.at-kpi::after {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 80px; height: 80px;
  border-radius: 50%;
  background: var(--at-kpi-accent, var(--nx-border));
  opacity: 0.06;
  transform: translate(30%, -30%);
  pointer-events: none;
}
.at-kpi--live   { --at-kpi-accent: var(--nx-live);   --at-kpi-tint: var(--nx-live-low); }
.at-kpi--blue   { --at-kpi-accent: var(--nx-accent); --at-kpi-tint: var(--nx-accent-low); }
.at-kpi--purple { --at-kpi-accent: var(--nx-violet); --at-kpi-tint: var(--nx-violet-low); }
.at-kpi--alert  { --at-kpi-accent: var(--nx-red);    --at-kpi-tint: var(--nx-red-low); }
.at-kpi--ok     { --at-kpi-accent: var(--nx-green);  --at-kpi-tint: var(--nx-green-low); }
.at-kpi--warn   { --at-kpi-accent: var(--nx-amber);   --at-kpi-tint: var(--nx-amber-low); }
.at-kpi--muted  { --at-kpi-accent: var(--nx-text-3); --at-kpi-tint: var(--nx-surface-3); }
.at-kpi--live, .at-kpi--blue, .at-kpi--purple, .at-kpi--alert, .at-kpi--ok, .at-kpi--warn {
  background: linear-gradient(155deg, color-mix(in srgb, var(--at-kpi-tint) 92%, var(--nx-surface-3)) 0%, var(--nx-card-bg) 42%, var(--nx-surface-2) 100%);
}
.at-kpi--ok, .at-kpi--warn, .at-kpi--alert {
  border-color: color-mix(in srgb, var(--at-kpi-accent) 22%, var(--nx-border));
}
.at-kpi__icon {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
  font-size: 18px;
  margin-bottom: 10px;
  background: var(--at-kpi-tint, var(--nx-accent-low));
  border: 1px solid color-mix(in srgb, var(--at-kpi-accent, var(--nx-border)) 18%, transparent);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.14);
  position: relative;
  z-index: 1;
}
body[data-theme="dark"] .at-kpi__icon {
  border-color: rgba(255,255,255,0.06);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}
.at-kpi__value {
  font-family: var(--nx-font-display);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--nx-text);
  position: relative;
  z-index: 1;
}
.at-kpi--live .at-kpi__value   { color: var(--nx-live); }
.at-kpi--blue .at-kpi__value   { color: var(--nx-accent-deep); }
.at-kpi--purple .at-kpi__value { color: var(--nx-violet); }
.at-kpi--alert .at-kpi__value  { color: var(--nx-red); }
.at-kpi--ok .at-kpi__value     { color: var(--nx-green); }
.at-kpi__label { font-size: 12px; font-weight: 600; color: var(--nx-text-2); margin-top: 8px; position: relative; z-index: 1; }
.at-kpi__sub { font-family: var(--nx-font-data); font-size: 10px; color: var(--nx-text-3); letter-spacing: 0.03em; margin-top: 2px; position: relative; z-index: 1; }

.at-exec-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0 36px 22px;
  border-bottom: 1px solid var(--nx-border-hi);
  background: color-mix(in srgb, var(--nx-bg) 82%, var(--nx-surface-3));
}
.at-exec-item {
  border-radius: var(--nx-r);
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: color-mix(in srgb, var(--nx-surface-2) 88%, var(--nx-bg));
  border-left: 3px solid var(--nx-accent);
}
.at-exec-item:nth-child(2) { border-left-color: var(--nx-live); }
.at-exec-item:nth-child(3) { border-left-color: var(--nx-violet); }
.at-exec-item:nth-child(4) { border-left-color: var(--nx-amber); }
.at-exec-item:hover { border-color: var(--nx-border-hi); box-shadow: var(--nx-card-shadow-hover); transform: translateY(-1px); }
.at-exec-item span { font-size: 10px; color: var(--nx-text-3); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; }
.at-exec-item strong { font-family: var(--nx-font-data); font-size: 14px; color: var(--nx-text); }

/* ══ MAPA OPERATIVO — radar táctico ══ */
.at-command {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 14px;
  padding: 18px 36px;
  border-bottom: 1px solid var(--nx-border-hi);
  background: color-mix(in srgb, var(--nx-bg) 88%, var(--nx-surface-3));
}
.at-map {
  border-radius: var(--nx-r-xl);
  position: relative;
  min-height: 300px;
  overflow: hidden;
  background:
    radial-gradient(ellipse 120% 80% at 50% 110%, rgba(27, 142, 95, 0.14), transparent 55%),
    linear-gradient(165deg, #061220 0%, #0b1e32 38%, #102a44 72%, #153552 100%);
  border-color: rgba(var(--primary-rgb, 55, 124, 192), 0.22);
  box-shadow: var(--nx-card-shadow), inset 0 0 80px rgba(0, 0, 0, 0.35);
}
.at-map__head {
  position: absolute;
  top: 0; left: 0; right: 0;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 4;
  background: linear-gradient(to bottom, rgba(6, 18, 32, 0.92) 50%, transparent);
}
.at-map__title {
  font-family: var(--nx-font-display);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.72);
}
.at-live-badge {
  display: flex; align-items: center; gap: 7px;
  font-family: var(--nx-font-data);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: #5dcaab;
  font-weight: 600;
  padding: 5px 12px;
  background: rgba(27, 142, 95, 0.18);
  border: 1px solid rgba(60, 184, 150, 0.35);
  border-radius: 999px;
  box-shadow: 0 0 16px rgba(27, 142, 95, 0.2);
}
.at-live-pulse {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--nx-live);
  box-shadow: 0 0 0 3px var(--nx-live-mid);
}

/* Radar rings */
.nx-radar {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nx-radar__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(131, 190, 233, 0.14);
}
.nx-radar__ring--1 { width: 25%; height: 25%; }
.nx-radar__ring--2 { width: 50%; height: 50%; }
.nx-radar__ring--3 { width: 75%; height: 75%; }
.nx-radar__ring--4 { width: 92%; height: 92%; border-color: rgba(131, 190, 233, 0.06); }
.nx-radar__sweep {
  position: absolute;
  width: 50%; height: 50%;
  top: 50%; left: 50%;
  transform-origin: 0 0;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(60, 184, 150, 0.12) 24deg, transparent 48deg);
  border-radius: 0 100% 0 0;
  opacity: 0.85;
}

.at-map__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(131, 190, 233, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(131, 190, 233, 0.06) 1px, transparent 1px);
  background-size: 44px 44px;
  opacity: 0.55;
}
.at-map__coords {
  position: absolute;
  bottom: 12px; left: 16px;
  font-family: var(--nx-font-data);
  font-size: 9px;
  color: rgba(255, 255, 255, 0.48);
  letter-spacing: 0.08em;
  z-index: 4;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.at-map-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: transform 0.25s;
}
.at-map-pin:hover { transform: translate(-50%, -50%) scale(1.2); z-index: 10; }
.at-map-pin__ico {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  border: 2px solid;
  position: relative;
  backdrop-filter: blur(4px);
}
.at-map-pin--live .at-map-pin__ico {
  background: var(--nx-live-low);
  border-color: var(--nx-live);
  box-shadow: 0 2px 12px var(--nx-teal-glow);
}
.at-map-pin--alert .at-map-pin__ico {
  background: var(--nx-red-low);
  border-color: var(--nx-red);
}
.at-map-pin__label {
  font-family: var(--nx-font-data);
  font-size: 9px;
  font-weight: 600;
  background: rgba(6, 18, 32, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.88);
  padding: 3px 7px;
  border-radius: 6px;
  white-space: nowrap;
}
.at-map-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
  z-index: 3;
}
.at-map-empty__icon { font-size: 36px; opacity: 0.35; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4)); }

/* Alerts stack */
.nx-alerts-stack { display: flex; flex-direction: column; gap: 12px; }
.at-alerts-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  border-radius: var(--nx-r-xl);
  border-color: color-mix(in srgb, var(--nx-red) 16%, var(--nx-border));
}

.at-panel-head {
  padding: 18px 22px;
  border-bottom: 1px solid var(--nx-border-hi);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background: linear-gradient(180deg, color-mix(in srgb, var(--nx-accent) 10%, var(--nx-surface-2)), color-mix(in srgb, var(--nx-surface-3) 60%, transparent));
}
.at-panel-head__kicker {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--nx-text-3);
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
  font-family: var(--nx-font-data);
}
.at-panel-head h3 {
  font-family: var(--nx-font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--nx-text);
}
.at-alert-count {
  font-family: var(--nx-font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--nx-red);
  min-width: 32px;
  text-align: right;
}
.at-alert-ok-badge {
  font-family: var(--nx-font-data);
  font-size: 10px;
  font-weight: 600;
  color: var(--nx-green);
  letter-spacing: 0.1em;
  background: var(--nx-green-low);
  border: 1px solid rgba(52,211,153,0.35);
  padding: 5px 12px;
  border-radius: 999px;
}
.at-alert-list { list-style: none; overflow-y: auto; flex: 1; max-height: 280px; }
.at-alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--nx-border);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  text-align: left;
}
.at-alert-item:hover { background: var(--nx-surface-2); }
.at-alert-item__bar { width: 3px; height: 36px; border-radius: 3px; flex-shrink: 0; }
.at-alert-item--alert .at-alert-item__bar { background: var(--nx-red); box-shadow: 0 0 10px rgba(248,113,113,0.5); }
.at-alert-item--warn  .at-alert-item__bar { background: var(--nx-amber); }
.at-alert-item__ico { font-size: 15px; flex-shrink: 0; }
.at-alert-item__text { flex: 1; color: var(--nx-text-2); line-height: 1.4; }
.at-alert-ok { padding: 24px; font-size: 13px; color: var(--nx-green); text-align: center; }

/* ══ ANALYTICS BENTO ══ */
.at-analytics {
  display: grid;
  grid-template-columns: 1fr 1.3fr 1fr;
  gap: 14px;
  padding: 18px 36px 22px;
  border-bottom: 1px solid var(--nx-border-hi);
  background: color-mix(in srgb, var(--nx-void) 90%, var(--nx-surface-3));
}
.at-panel {
  border-radius: var(--nx-r-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.at-panel:hover { border-color: var(--nx-border-hi); box-shadow: var(--nx-card-shadow-hover); }
.at-panel:nth-child(1) { border-top: 3px solid var(--nx-green); }
.at-panel:nth-child(2) { border-top: 3px solid var(--nx-accent); }
.at-panel:nth-child(3) { border-top: 3px solid var(--nx-violet); }

/* Compliance */
.at-compliance-wrap {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.at-compliance-ring-wrap {
  position: relative;
  flex-shrink: 0;
}

.at-compliance-ring-wrap svg {
  width: 88px; height: 88px;
  transform: rotate(-90deg);
}

.at-ring-bg   { fill: none; stroke: var(--at-surface-3); stroke-width: 7; }
.at-ring-fg   { fill: none; stroke-width: 7; stroke-linecap: round; transition: stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1); }
.at-ring-fg--ok    { stroke: var(--at-green); filter: drop-shadow(0 0 4px rgba(16,185,129,0.5)); }
.at-ring-fg--warn  { stroke: var(--at-amber); filter: drop-shadow(0 0 4px rgba(245,158,11,0.5)); }
.at-ring-fg--alert { stroke: var(--at-red);   filter: drop-shadow(0 0 4px rgba(239,68,68,0.5)); }

.at-ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.at-ring-pct {
  font-family: var(--at-font-data);
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.at-ring-lbl {
  font-size: 9px;
  color: var(--at-text-3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.at-compliance-body { flex: 1; }

.at-compliance-body h4 {
  font-size: 22px;
  font-family: var(--at-font-data);
  font-weight: 700;
  color: var(--at-text);
  letter-spacing: -0.02em;
}

.at-compliance-caption { font-size: 11px; color: var(--at-text-3); margin-top: 2px; }

.at-compliance-bar-wrap {
  margin-top: 14px;
  background: var(--at-surface-3);
  border-radius: 3px;
  height: 5px;
  overflow: hidden;
}

.at-compliance-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.9s cubic-bezier(0.22,1,0.36,1);
}

.at-compliance-bar-fill--ok    { background: var(--at-green); box-shadow: 0 0 6px rgba(16,185,129,0.5); }
.at-compliance-bar-fill--warn  { background: var(--at-amber); }
.at-compliance-bar-fill--alert { background: var(--at-red); }

.at-chart-badge {
  font-family: var(--nx-font-data);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 5px 11px;
  border-radius: 999px;
}
.at-chart-badge--ok    { background: var(--nx-green-low); color: var(--nx-green); border: 1px solid rgba(27,142,95,0.22); }
.at-chart-badge--warn  { background: var(--nx-amber-low); color: var(--nx-amber); border: 1px solid rgba(201,130,15,0.22); }
.at-chart-badge--alert { background: var(--nx-red-low); color: var(--nx-red); border: 1px solid rgba(197,48,48,0.22); }

/* Hourly */
.at-hourly-wrap { padding: 16px 20px; flex: 1; overflow: hidden; }

.at-hour-row {
  display: grid;
  grid-template-columns: 38px 1fr 28px;
  align-items: center;
  gap: 8px;
  margin-bottom: 9px;
}

.at-hour-label {
  font-family: var(--at-font-data);
  font-size: 10px;
  color: var(--at-text-3);
  text-align: right;
}

.at-hour-track {
  background: var(--at-surface-3);
  border-radius: 3px;
  height: 6px;
  overflow: hidden;
}

.at-hour-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--nx-accent) 0%, var(--nx-live) 100%);
  border-radius: 3px;
  transition: width 0.7s cubic-bezier(0.22,1,0.36,1);
}

.at-hour-val {
  font-family: var(--at-font-data);
  font-size: 10px;
  color: var(--at-text-2);
  text-align: right;
}

.at-chart-total {
  font-family: var(--at-font-data);
  font-size: 12px;
  color: var(--at-text-3);
}

/* Fleet Pie */
.at-fleet-pie-wrap {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.at-fleet-pie {
  width: 90px; height: 90px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}

.at-fleet-pie__hole {
  position: absolute;
  inset: 16px;
  background: var(--at-surface);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.at-fleet-pie__hole strong {
  font-family: var(--at-font-data);
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

.at-fleet-pie__hole span {
  font-size: 8px;
  color: var(--at-text-3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.at-fleet-legend { list-style: none; font-size: 12px; }
.at-fleet-legend li { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; color: var(--at-text-2); }
.at-fleet-legend strong { font-family: var(--at-font-data); font-size: 13px; color: var(--at-text); margin-left: auto; padding-left: 8px; }

.at-legend-dot {
  width: 8px; height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.at-legend-dot--live  { background: var(--at-cyan); }
.at-legend-dot--warn  { background: var(--at-amber); }
.at-legend-dot--alert { background: var(--at-red); }

/* ══ FLEET COMMAND ZONE ══ */
.at-fleet-section {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 14px;
  padding: 18px 36px 36px;
  background: color-mix(in srgb, var(--nx-bg) 85%, var(--nx-surface-3));
}
.at-fleet-panel {
  border-radius: var(--nx-r-xl);
  overflow: hidden;
  border-top: 3px solid var(--nx-live);
}
.at-fleet-head {
  padding: 20px 24px;
  border-bottom: 1px solid var(--nx-border-hi);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  background: linear-gradient(180deg, color-mix(in srgb, var(--nx-live) 12%, var(--nx-surface-2)), color-mix(in srgb, var(--nx-surface-3) 70%, var(--nx-bg)));
}
.at-fleet-head__info { flex: 1; min-width: 180px; }
.at-fleet-head__info h3 { font-family: var(--nx-font-display); font-size: 16px; font-weight: 600; }
.at-fleet-head__info p  { font-size: 12px; color: var(--nx-text-3); margin-top: 3px; }
.at-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--nx-surface-2);
  border: 1px solid var(--nx-border-hi);
  border-radius: var(--nx-r);
  padding: 8px 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.at-search-wrap:focus-within { border-color: var(--nx-accent); box-shadow: 0 0 0 3px var(--nx-accent-low); }
.at-search-wrap input {
  background: none; border: none; outline: none;
  font-size: 13px; color: var(--nx-text);
  font-family: var(--nx-font-ui);
  width: 200px;
}
.at-search-wrap input::placeholder { color: var(--nx-text-3); }
.at-search-wrap svg { color: var(--nx-text-3); }
.at-fleet-count { font-family: var(--nx-font-data); font-size: 11px; color: var(--nx-text-3); white-space: nowrap; }

.at-tabs {
  display: flex;
  gap: 4px;
  padding: 8px;
  margin: 0 16px;
  border: 1px solid var(--nx-border);
  border-radius: var(--nx-r-lg);
  background: color-mix(in srgb, var(--nx-surface-3) 70%, var(--nx-bg));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
}
.at-tab {
  flex: 1;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--nx-text-3);
  border-radius: var(--nx-r-sm);
  transition: all 0.2s;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
}
.at-tab:hover { color: var(--nx-text); background: var(--nx-card-bg); }
.at-tab.is-active {
  color: var(--nx-accent-deep);
  background: var(--nx-card-bg);
  border-color: var(--nx-border-hi);
  box-shadow: 0 2px 10px rgba(var(--primary-rgb, 55, 124, 192), 0.1);
}
.at-tab em {
  font-style: normal;
  font-family: var(--nx-font-data);
  font-size: 10px;
  background: var(--nx-surface-3);
  border-radius: 999px;
  padding: 2px 7px;
  color: var(--nx-text-3);
}
.at-tab.is-active em { background: var(--nx-accent-mid); color: var(--nx-accent-deep); }

.at-fleet-list { overflow-y: auto; max-height: 640px; }

/* Vehicle cards — glass tiles */
.at-vehicle {
  border-bottom: 1px solid var(--nx-border);
  transition: background 0.2s;
}
.at-vehicle:hover { background: var(--nx-accent-low); }
.at-vehicle__head {
  padding: 16px 24px 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: transparent;
}
.at-vehicle__status-bar {
  width: 4px;
  height: 44px;
  border-radius: 4px;
  flex-shrink: 0;
}
.at-vehicle--en-ruta .at-vehicle__status-bar   { background: linear-gradient(180deg, var(--nx-live), var(--nx-accent)); }
.at-vehicle--programado .at-vehicle__status-bar { background: var(--nx-violet); }
.at-vehicle--cerrado .at-vehicle__status-bar    { background: var(--nx-surface-3); }
.at-vehicle--libre .at-vehicle__status-bar      { background: var(--nx-surface-3); }
.at-vehicle__plate {
  font-family: var(--nx-font-data);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.at-vehicle__driver { font-size: 12px; color: var(--nx-text-3); margin-top: 2px; }
.at-vehicle__badge {
  margin-left: auto;
  font-family: var(--nx-font-data);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 5px 12px;
  border-radius: 999px;
}
.at-vehicle--en-ruta   .at-vehicle__badge { background: var(--nx-live-low); color: var(--nx-live); border: 1px solid rgba(29,158,117,0.28); }
.at-vehicle--programado .at-vehicle__badge { background: rgba(167,139,250,0.12); color: var(--nx-violet); border: 1px solid rgba(167,139,250,0.3); }
.at-vehicle--cerrado   .at-vehicle__badge { background: var(--nx-surface-3); color: var(--nx-text-3); border: 1px solid var(--nx-border); }
.at-vehicle--libre     .at-vehicle__badge { background: var(--nx-surface-3); color: var(--nx-text-3); border: 1px solid var(--nx-border); }

/* Mini bars */
.at-mini-bars {
  display: flex;
  gap: 3px;
  padding: 0 20px 10px;
}

.at-mini-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  min-width: 8px;
}

.at-mini-bar--live    { background: var(--at-cyan); }
.at-mini-bar--ok      { background: var(--at-green); }
.at-mini-bar--warn    { background: var(--at-amber); }
.at-mini-bar--alert   { background: var(--at-red); }
.at-mini-bar--neutral { background: var(--at-surface-3); }

/* Trip table */
.at-trip-table-wrap { overflow-x: auto; }

.at-trip-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.at-trip-table thead th {
  padding: 8px 20px;
  text-align: left;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--nx-text-3);
  font-weight: 600;
  font-family: var(--nx-font-data);
  background: var(--nx-surface-2);
  border-top: 1px solid var(--nx-border);
  border-bottom: 1px solid var(--nx-border);
}

.at-trip-table tbody td {
  padding: 9px 20px;
  border-bottom: 1px solid var(--at-border);
  vertical-align: middle;
}

.at-trip-table tbody tr:hover td { background: var(--nx-accent-low); }
.at-trip-table tr.at-row--delayed td { background: var(--nx-red-low); }

.at-trip-link {
  font-family: var(--at-font-data);
  font-size: 12px;
  font-weight: 600;
  color: var(--nx-accent);
  transition: color 0.15s;
}
.at-trip-link:hover { color: var(--primary-dark, #2a6399); }

.at-activity-item--fail::before,
.at-activity-item--neutral::before { background: var(--nx-text-3); }
.at-activity-item--fail::before { background: var(--nx-red); }

.dashboard-studio :focus-visible {
  outline: 2px solid var(--nx-accent);
  outline-offset: 2px;
}
.dashboard-studio .at-chip:focus-visible,
.dashboard-studio .at-qa-btn:focus-visible,
.dashboard-studio .at-tab:focus-visible,
.dashboard-studio .at-kpi--action:focus-visible,
.dashboard-studio .at-map-pin:focus-visible,
.dashboard-studio .at-alert-item:focus-visible,
.dashboard-studio .at-trip-link:focus-visible,
.dashboard-studio .at-activity-link:focus-visible {
  outline: 2px solid var(--nx-accent);
  outline-offset: 2px;
}
.dashboard-studio .at-search-wrap input:focus-visible { outline: none; }

.at-command { align-items: stretch; }
.nx-alerts-stack { min-height: 280px; }
.at-alerts-panel { min-height: 100%; }

.at-fleet-pie__hole { background: var(--nx-glass); }

.at-activity-item--live::before  { background: var(--nx-live); }
.at-activity-link:hover { color: var(--nx-accent); }

.at-trip-client {
  display: block;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.at-trip-route {
  display: block;
  font-size: 10px;
  color: var(--at-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  margin-top: 1px;
}

.at-trip-eta {
  font-family: var(--at-font-data);
  font-size: 12px;
}

.at-delay-tag {
  margin-left: 4px;
  color: var(--at-red);
  font-size: 11px;
}

.at-vehicle__empty {
  padding: 16px 20px;
  font-size: 12px;
  color: var(--at-text-3);
}

/* Pill */
.at-pill {
  display: inline-flex;
  align-items: center;
  font-family: var(--nx-font-data);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 4px 9px;
  border-radius: 999px;
  white-space: nowrap;
}
.at-pill--live    { background: var(--nx-live-low); color: var(--nx-live); border: 1px solid rgba(23,133,100,0.22); }
.at-pill--ok      { background: var(--nx-green-low); color: var(--nx-green); border: 1px solid rgba(27,142,95,0.22); }
.at-pill--warn    { background: var(--nx-amber-low); color: var(--nx-amber); border: 1px solid rgba(201,130,15,0.22); }
.at-pill--alert   { background: var(--nx-red-low); color: var(--nx-red); border: 1px solid rgba(197,48,48,0.22); }
.at-pill--fail    { background: var(--nx-red-low); color: var(--nx-red); border: 1px solid rgba(197,48,48,0.22); }
.at-pill--neutral { background: var(--nx-surface-3); color: var(--nx-text-3); border: 1px solid var(--nx-border); }

/* Fleet empty */
.at-fleet-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 40px;
  text-align: center;
  color: var(--at-text-3);
}

.at-fleet-empty__icon { font-size: 36px; opacity: 0.2; }
.at-fleet-empty strong { color: var(--at-text-2); }

/* Activity timeline */
.at-activity-panel {
  border-radius: var(--nx-r-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-top: 3px solid var(--nx-violet);
}
.at-activity-list { list-style: none; overflow-y: auto; flex: 1; max-height: 360px; }
.at-activity-item {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--nx-border);
  position: relative;
  transition: background 0.15s;
}
.at-activity-item:hover { background: var(--nx-surface); }
.at-activity-item::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
}
.at-activity-item--live::before  { background: var(--nx-teal); }
.at-activity-item--ok::before    { background: var(--nx-green); }
.at-activity-item--warn::before  { background: var(--nx-amber); }
.at-activity-item--alert::before { background: var(--nx-red); }
.at-activity-time { font-family: var(--nx-font-data); font-size: 10px; color: var(--nx-text-3); text-align: right; }
.at-activity-link { font-size: 12px; text-align: left; display: flex; flex-direction: column; gap: 2px; transition: color 0.15s; }
.at-activity-link:hover { color: var(--nx-teal); }
.at-activity-link strong { font-family: var(--nx-font-data); font-size: 12px; }
.at-activity-link span { font-size: 10px; color: var(--nx-text-3); }
.at-activity-empty { padding: 24px 18px; font-size: 12px; color: var(--nx-text-3); text-align: center; }

.at-pulse-list { list-style: none; padding: 8px 0; }
.at-pulse-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 22px;
  border-bottom: 1px solid var(--nx-border);
  font-size: 12px;
}
.at-pulse-item__label { color: var(--nx-text-2); }
.at-pulse-item__value { font-family: var(--nx-font-data); font-weight: 600; color: var(--nx-text); }
.at-pulse-item--warn .at-pulse-item__value  { color: var(--nx-amber); }
.at-pulse-item--alert .at-pulse-item__value { color: var(--nx-red); }
.at-pulse-foot {
  padding: 12px 22px;
  font-size: 10px;
  color: var(--nx-text-3);
  font-family: var(--nx-font-data);
  border-top: 1px solid var(--nx-border);
}

.at-scope-bar {
  padding: 10px 36px;
  background: color-mix(in srgb, var(--nx-amber) 12%, var(--nx-surface-3));
  border-bottom: 1px solid color-mix(in srgb, var(--nx-amber) 28%, var(--nx-border-hi));
  font-size: 12px;
  color: var(--nx-amber);
  font-family: var(--nx-font-data);
  position: relative;
  z-index: 2;
}

/* Client view */
.at-client-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 20px 36px 36px;
  background: color-mix(in srgb, var(--nx-bg) 85%, var(--nx-surface-3));
}
.at-client-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px 20px 20px;
}
.at-client-stat {
  border-radius: var(--nx-r-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;
}
.at-client-stat::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--at-stat-accent, var(--nx-border));
  opacity: 0.85;
}
.at-client-stat--live  { --at-stat-accent: var(--nx-live); background: linear-gradient(180deg, var(--nx-live-low) 0%, var(--nx-surface-2) 40%); }
.at-client-stat--ok    { --at-stat-accent: var(--nx-green); background: linear-gradient(180deg, var(--nx-green-low) 0%, var(--nx-surface-2) 40%); }
.at-client-stat--warn  { --at-stat-accent: var(--nx-amber); background: linear-gradient(180deg, var(--nx-amber-low) 0%, var(--nx-surface-2) 40%); }
.at-client-stat:hover { transform: translateY(-2px); border-color: var(--nx-border-hi); box-shadow: var(--nx-card-shadow-hover); }
.at-client-stat dt { font-size: 11px; color: var(--nx-text-3); text-transform: uppercase; letter-spacing: 0.1em; }
.at-client-stat dd {
  font-family: var(--nx-font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--nx-text);
  line-height: 1;
  letter-spacing: -0.02em;
}
.at-client-stat--live dd  { color: var(--nx-live); }
.at-client-stat--ok dd    { color: var(--nx-green); }
.at-client-stat--warn dd  { color: var(--nx-amber); }

.nx-sidebar-stack { display: flex; flex-direction: column; gap: 16px; }

@media (max-width: 1200px) {
  .at-kpi-strip { grid-template-columns: repeat(3, 1fr); }
  .at-exec-strip { grid-template-columns: repeat(2, 1fr); }
  .at-analytics { grid-template-columns: 1fr 1fr; }
  .at-analytics > :last-child { grid-column: 1 / -1; }
  .at-fleet-section { grid-template-columns: 1fr; }
  .at-command { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .at-hero { grid-template-columns: 1fr; padding: 24px 20px; }
  .at-hero__aside { align-items: flex-start; width: 100%; }
  .at-hero__status-row { justify-content: flex-start; width: 100%; }
  .at-quick-actions { justify-content: flex-start; }
  .at-search-wrap { flex: 1; min-width: 0; }
  .at-search-wrap input { width: 100%; min-width: 0; }
  .at-activity-item { grid-template-columns: 40px minmax(0, 1fr) auto; gap: 8px; }
  .at-activity-link span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
  .at-kpi-strip, .at-exec-strip, .at-analytics, .at-command, .at-fleet-section, .at-client-layout { padding-left: 20px; padding-right: 20px; }
  .at-kpi-strip { grid-template-columns: repeat(2, 1fr); }
  .at-exec-strip { grid-template-columns: 1fr; }
  .at-analytics { grid-template-columns: 1fr; }
  .at-client-layout { grid-template-columns: 1fr; }
  .at-scope-bar { padding-left: 20px; padding-right: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .at-fleet-pie, .at-ring-fg, .at-hour-fill, .at-compliance-bar-fill { transition: none; }
}
  `;

  /* ─────────────────────────────────────────────────────────────
     INYECTAR CSS UNA VEZ
  ───────────────────────────────────────────────────────────── */

  function dashInjectStyles() {
    let style = document.getElementById("at-dash-styles");
    if (!style) {
      style = document.createElement("style");
      style.id = "at-dash-styles";
      document.head.appendChild(style);
    }
    style.textContent = DASH_STYLES;
  }

  /* ─────────────────────────────────────────────────────────────
     COMPONENTES ATOM
  ───────────────────────────────────────────────────────────── */

  function dashBuildAmbient() {
    return `<div class="nx-ambient" aria-hidden="true">
      <div class="nx-ambient__mesh"></div>
      <div class="nx-ambient__grid"></div>
      <div class="nx-orb nx-orb--1"></div>
      <div class="nx-orb nx-orb--2"></div>
      <div class="nx-orb nx-orb--3"></div>
    </div>`;
  }

  function dashBuildHealthOrb(snap) {
    const pct = snap?.compliancePct ?? 0;
    const tone = pct >= 80 ? "ok" : pct >= 50 ? "warn" : "alert";
    const stroke = tone === "ok" ? "var(--nx-green)" : tone === "warn" ? "var(--nx-amber)" : "var(--nx-red)";
    const r = 30, c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    return `<div class="nx-health-orb at-reveal" style="--at-stagger:0" role="img" aria-label="Cumplimiento SLA ${pct}%">
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="5"/>
        <circle class="at-ring-anim" cx="36" cy="36" r="${r}" fill="none" stroke="${stroke}" stroke-width="5"
          stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${c.toFixed(2)}"
          data-at-ring-offset="${offset.toFixed(2)}"/>
      </svg>
      <div class="nx-health-orb__center">
        <span class="nx-health-orb__pct" data-at-count="${pct}" data-at-display="${pct}%">0%</span>
        <span class="nx-health-orb__lbl">SLA</span>
      </div>
    </div>`;
  }

  function dashStatusPill(status) {
    const tone = dashRequestOutcomeTone(status);
    return `<span class="at-pill at-pill--${tone}">${prettyStatus(status, "request")}</span>`;
  }

  /* ─────────────────────────────────────────────────────────────
     HERO
  ───────────────────────────────────────────────────────────── */

  function dashBuildHero(snap, user, attentionItems) {
    const longDate = formatColombiaLongDate(new Date());
    const greeting = colombiaTimeOfDayGreeting(new Date());
    const displayName = getPortalUserDisplayName(user) || user?.name || "Operador";
    const firstName = escapeHtml(String(displayName).trim().split(/\s+/)[0] || displayName);
    const updatedAgo = snap?.generatedAt ? dashFormatTimeAgo(snap.generatedAt) : "ahora";

    const alertCount =
      (snap?.unreadNotifications || 0) +
      (attentionItems || []).reduce((acc, item) => acc + (Number(item?.value) > 0 ? Number(item.value) : 0), 0);
    const docCount = snap?.docRisk || 0;
    const opsTone = dashOpsStatusTone(snap);
    const opsLabels = { live: "Operación en curso", ok: "Sistema operativo", warn: "Seguimiento activo", alert: "Atención requerida", neutral: "Operación" };

    const chips = `
      ${alertCount > 0 ? `<button type="button" class="at-chip at-chip--warn" data-action="dash-nav" data-target-view="notifications" aria-label="${alertCount} alertas pendientes">
        <span aria-hidden="true">🔔</span>
        <span>${alertCount} alerta${alertCount === 1 ? "" : "s"}</span>
      </button>` : `<span class="at-chip at-chip--ok"><span class="at-chip__dot"></span><span>Sin alertas</span></span>`}
      ${docCount > 0 ? `<button type="button" class="at-chip at-chip--doc" data-action="dash-nav" data-target-view="transport-vehicles">
        <span>📄</span>
        <span>${docCount} doc${docCount === 1 ? "" : "s"}</span>
      </button>` : ""}
      <span class="at-chip at-chip--${opsTone}">
        <span class="at-chip__dot"></span>
        <span>${escapeHtml(opsLabels[opsTone] || "Operación")}</span>
      </span>`;

    const quickActions = dashBuildQuickActions(user);

    return `<header class="at-hero">
      <div class="at-hero__main">
        <div class="at-hero__eyebrow">Torre de control · Antares</div>
        <h2 class="at-hero__title">${escapeHtml(greeting)}, <span class="at-hero__name">${firstName}</span></h2>
        <div class="at-hero__meta">
          <span>${escapeHtml(longDate)}</span>
          <span>Sincronizado ${escapeHtml(updatedAgo)}</span>
        </div>
      </div>
      <div class="at-hero__aside">
        <div class="at-hero__status-row">
          ${snap ? dashBuildHealthOrb(snap) : ""}
          <div class="at-chips">${chips}</div>
        </div>
        ${quickActions ? `<div class="at-quick-actions">${quickActions}</div>` : ""}
      </div>
    </header>`;
  }

  /* ─────────────────────────────────────────────────────────────
     KPI STRIP
  ───────────────────────────────────────────────────────────── */

  function dashBuildKpiStrip(snap, exec) {
    if (!snap) return "";
    const complianceSub = snap.compliancePct >= 80 ? "Meta alcanzada" : snap.compliancePct >= 50 ? "Seguimiento" : "Bajo objetivo";
    const complianceTone = snap.compliancePct >= 80 ? "ok" : snap.compliancePct >= 50 ? "warn" : "alert";

    function kpi(icon, label, value, sub, tone, idx, nav) {
      const display = String(value);
      const rawNum = display.replace(/[^\d.-]/g, "");
      const countAttr = rawNum !== "" && Number.isFinite(Number(rawNum))
        ? ` data-at-count="${escapeAttr(rawNum)}" data-at-display="${escapeAttr(display)}"` : "";
      const navAttrs = nav
        ? ` type="button" data-action="${escapeAttr(nav.action)}"${nav.targetView ? ` data-target-view="${escapeAttr(nav.targetView)}"` : ""}${nav.fleetTab ? ` data-dash-tab="${escapeAttr(nav.fleetTab)}"` : ""}`
        : "";
      const tag = nav ? "button" : "div";
      const actionCls = nav ? " at-kpi--action" : "";
      return `<${tag}${navAttrs} class="at-kpi at-kpi--${tone}${actionCls} at-reveal" style="--at-stagger:${idx}"${countAttr}${nav ? ` aria-label="${escapeAttr(`${label}: ${display}`)}"` : ""}>
        <div class="at-kpi__icon">${icon}</div>
        <strong class="at-kpi__value">${escapeHtml(display)}</strong>
        <div class="at-kpi__label">${escapeHtml(label)}</div>
        <div class="at-kpi__sub">${escapeHtml(sub)}</div>
      </${tag}>`;
    }

    const kpis = [
      kpi(IC.truck || "🚚", "En ruta", snap.vehicleIdsEnRuta, "Vehículos activos", "live", 0, { action: "dash-focus-fleet", fleetTab: "en-ruta" }),
      kpi(IC.compass || "📋", "Asignados", snap.assignedToday, "Programados hoy", "blue", 1, { action: "dash-focus-fleet", fleetTab: "programado" }),
      kpi(IC.check || "✅", "Completados", snap.completedToday, "Entregas cerradas", "purple", 2, { action: "dash-focus-fleet", fleetTab: "cerrado" }),
      kpi(IC.alertTriangle || "⚠️", "Retrasos", snap.delayedToday,
        snap.delayedToday ? "Requieren acción" : "Sin desvíos",
        snap.delayedToday ? "alert" : "muted", 3,
        snap.delayedToday ? { action: "dash-focus-fleet", fleetTab: "en-ruta" } : null),
      kpi(IC.activity || "🎯", "Cumplimiento SLA", `${snap.compliancePct}%`, complianceSub, complianceTone, 4, null),
    ];

    const execItems = exec ? [
      { label: "Puntualidad",      value: `${exec.punctualityPct}%` },
      { label: "Utilización flota", value: `${exec.fleetUtilPct}%` },
      { label: "Combustible hoy",  value: exec.fuelLiters > 0 ? `${exec.fuelLiters} L` : "—" },
      { label: "Km recorridos",    value: exec.kmToday > 0 ? `${exec.kmToday.toLocaleString("es-CO")} km` : "—" },
    ] : [];

    const execRow = execItems.length
      ? `<div class="at-exec-strip">
          ${execItems.map((item, i) =>
            `<div class="at-exec-item at-reveal" style="--at-stagger:${6 + i}">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
            </div>`).join("")}
        </div>`
      : "";

    return `<section class="at-kpi-strip">${kpis.join("")}</section>${execRow}`;
  }

  /* ─────────────────────────────────────────────────────────────
     MAPA EN VIVO
  ───────────────────────────────────────────────────────────── */

  function dashBuildLiveMap(markers) {
    const list = Array.isArray(markers) ? markers : [];

    const pins = list.map((m) =>
      `<button type="button"
        class="at-map-pin at-map-pin--${m.delayed ? "alert" : "live"}"
        style="left:${m.x}%;top:${m.y}%"
        aria-label="${escapeAttr(`${m.plate}, ${m.city}${m.delayed ? ", retrasado" : ", en ruta"}`)}"
        title="${escapeAttr(`${m.plate} · ${m.city}`)}"
        data-action="dash-focus-fleet"
        data-dash-tab="en-ruta">
        <div class="at-map-pin__ico">🚚</div>
        <div class="at-map-pin__label">${escapeHtml(m.plate)}</div>
      </button>`
    ).join("");

    const empty = !list.length
      ? `<div class="at-map-empty">
          <div class="at-map-empty__icon">📡</div>
          <p>Sin unidades en movimiento</p>
        </div>` : "";

    return `<section class="at-map at-reveal" style="--at-stagger:10" aria-label="Radar operativo en vivo">
      <div class="at-map__head">
        <span class="at-map__title">Radar · ${list.length} unidad${list.length === 1 ? "" : "es"} activa${list.length === 1 ? "" : "s"}</span>
        <span class="at-live-badge"><span class="at-live-pulse"></span>EN VIVO</span>
      </div>
      <div class="nx-radar" aria-hidden="true">
        <div class="nx-radar__ring nx-radar__ring--1"></div>
        <div class="nx-radar__ring nx-radar__ring--2"></div>
        <div class="nx-radar__ring nx-radar__ring--3"></div>
        <div class="nx-radar__ring nx-radar__ring--4"></div>
        <div class="nx-radar__sweep"></div>
      </div>
      <div class="at-map__grid" aria-hidden="true"></div>
      <div class="at-map__coords">4.7110° N · 74.0721° W · BOG</div>
      ${pins}
      ${empty}
    </section>`;
  }

  /* ─────────────────────────────────────────────────────────────
     ALERTAS CRÍTICAS
  ───────────────────────────────────────────────────────────── */

  function dashBuildCriticalAlertsPanel(alerts) {
    const items = Array.isArray(alerts) ? alerts : [];
    const body = items.length
      ? `<ul class="at-alert-list">${items.map((a) => {
          const navAttrs = a.targetView
            ? `data-action="${a.fleetTab ? "dash-focus-fleet" : "dash-attention-nav"}" data-target-view="${escapeAttr(a.targetView)}"${a.fleetTab ? ` data-dash-tab="${escapeAttr(a.fleetTab)}"` : ""}`
            : "";
          return `<li><button type="button" class="at-alert-item at-alert-item--${escapeAttr(a.tone || "warn")}" ${navAttrs}>
            <div class="at-alert-item__bar"></div>
            <span class="at-alert-item__ico">⚠️</span>
            <span class="at-alert-item__text">${escapeHtml(String(a.message || ""))}</span>
          </button></li>`;
        }).join("")}</ul>`
      : `<p class="at-alert-ok">✓ Sin alertas críticas activas</p>`;

    return `<aside class="at-alerts-panel at-reveal" style="--at-stagger:11" aria-label="Alertas críticas">
      <div class="at-panel-head">
        <div>
          <span class="at-panel-head__kicker">Prioridad alta</span>
          <h3>Alertas críticas</h3>
        </div>
        ${items.length
          ? `<span class="at-alert-count">${items.length}</span>`
          : `<span class="at-alert-ok-badge">OK</span>`}
      </div>
      ${body}
    </aside>`;
  }

  /* ─────────────────────────────────────────────────────────────
     ANALYTICS ROW
  ───────────────────────────────────────────────────────────── */

  function dashBuildAnalyticsRow(snap, hourly, fleetPie) {
    if (!snap) return "";
    const complianceTone = snap.compliancePct >= 80 ? "ok" : snap.compliancePct >= 50 ? "warn" : "alert";
    const complianceBadge = complianceTone === "ok" ? "En meta" : complianceTone === "warn" ? "Seguimiento" : "Crítico";

    // SVG ring
    const r = 38, c = 2 * Math.PI * r;
    const offset = c - (snap.compliancePct / 100) * c;

    // Hourly bars
    const hourlyList = Array.isArray(hourly) ? hourly : [];
    const maxH = Math.max(1, ...hourlyList.map((b) => Number(b.count) || 0));
    const hourlyBars = hourlyList.map((b, i) => {
      const pct = Math.round(((Number(b.count) || 0) / maxH) * 100);
      return `<div class="at-hour-row at-reveal" style="--at-stagger:${i}">
        <span class="at-hour-label">${escapeHtml(b.label)}</span>
        <div class="at-hour-track"><i class="at-hour-fill" style="width:0%" data-at-width="${pct}"></i></div>
        <span class="at-hour-val">${escapeHtml(String(b.count))}</span>
      </div>`;
    }).join("");

    // Pie
    const pieTotal = Math.max(1, fleetPie?.total || (fleetPie?.activos + fleetPie?.espera + fleetPie?.mantenimiento) || 1);
    const aPct = Math.round(((fleetPie?.activos || 0) / pieTotal) * 100);
    const ePct = Math.round(((fleetPie?.espera || 0) / pieTotal) * 100);
    const mPct = Math.max(0, 100 - aPct - ePct);
    const finalPie = `conic-gradient(var(--at-cyan) 0% ${aPct}%, var(--at-amber) ${aPct}% ${aPct + ePct}%, var(--at-red) ${aPct + ePct}% 100%)`;

    return `<section class="at-analytics" aria-label="Análisis operativo">

      <article class="at-panel at-reveal" style="--at-stagger:14">
        <div class="at-panel-head">
          <div>
            <span class="at-panel-head__kicker">Performance</span>
            <h3>Cumplimiento diario</h3>
          </div>
          <span class="at-chart-badge at-chart-badge--${complianceTone}">${escapeHtml(complianceBadge)}</span>
        </div>
        <div class="at-compliance-wrap">
          <div class="at-compliance-ring-wrap">
            <svg viewBox="0 0 88 88" aria-hidden="true">
              <circle class="at-ring-bg" cx="44" cy="44" r="${r}"/>
              <circle class="at-ring-fg at-ring-fg--${complianceTone} at-ring-anim"
                cx="44" cy="44" r="${r}"
                stroke-dasharray="${c.toFixed(2)}"
                stroke-dashoffset="${c.toFixed(2)}"
                data-at-ring-offset="${offset.toFixed(2)}"/>
            </svg>
            <div class="at-ring-center">
              <span class="at-ring-pct" data-at-count="${snap.compliancePct}" data-at-display="${snap.compliancePct}%">0%</span>
              <span class="at-ring-lbl">SLA</span>
            </div>
          </div>
          <div class="at-compliance-body">
            <h4 data-at-count="${snap.compliancePct}" data-at-display="${snap.compliancePct}%">0%</h4>
            <p class="at-compliance-caption">del objetivo diario</p>
            <div class="at-compliance-bar-wrap" style="margin-top:14px">
              <div class="at-compliance-bar-fill at-compliance-bar-fill--${complianceTone}"
                   style="width:0%"
                   data-at-width="${snap.compliancePct}"></div>
            </div>
          </div>
        </div>
      </article>

      <article class="at-panel at-reveal" style="--at-stagger:15">
        <div class="at-panel-head">
          <div>
            <span class="at-panel-head__kicker">Distribución</span>
            <h3>Entregas por hora</h3>
          </div>
          <span class="at-chart-total">${hourlyList.reduce((n, b) => n + (Number(b.count) || 0), 0)} total</span>
        </div>
        <div class="at-hourly-wrap">
          ${hourlyBars || '<p style="font-size:12px;color:var(--at-text-3);text-align:center;padding:20px 0">Sin entregas registradas hoy.</p>'}
        </div>
      </article>

      <article class="at-panel at-reveal" style="--at-stagger:16">
        <div class="at-panel-head">
          <div>
            <span class="at-panel-head__kicker">Inventario</span>
            <h3>Estado de flota</h3>
          </div>
        </div>
        <div class="at-fleet-pie-wrap">
          <div class="at-fleet-pie at-fleet-pie--anim"
            data-pie-a="${aPct}" data-pie-e="${ePct}" data-pie-m="${mPct}"
            data-pie-final="${escapeAttr(finalPie)}"
            style="background: var(--at-surface-3)"
            role="img" aria-label="Flota: ${fleetPie?.activos || 0} activos, ${fleetPie?.espera || 0} espera, ${fleetPie?.mantenimiento || 0} mantenimiento">
            <div class="at-fleet-pie__hole">
              <strong data-at-count="${pieTotal}" data-at-display="${pieTotal}">0</strong>
              <span>Total</span>
            </div>
          </div>
          <ul class="at-fleet-legend">
            <li><span class="at-legend-dot at-legend-dot--live"></span>Activos <strong>${fleetPie?.activos || 0}</strong></li>
            <li><span class="at-legend-dot at-legend-dot--warn"></span>Espera <strong>${fleetPie?.espera || 0}</strong></li>
            <li><span class="at-legend-dot at-legend-dot--alert"></span>Mantenimiento <strong>${fleetPie?.mantenimiento || 0}</strong></li>
          </ul>
        </div>
      </article>

    </section>`;
  }

  /* ─────────────────────────────────────────────────────────────
     PULSE PANEL
  ───────────────────────────────────────────────────────────── */

  function dashBuildPulsePanel(snap, user) {
    if (!snap) return "";
    const items = [
      { label: "Sin novedad",    value: snap.okDeliveries,      tone: "" },
      { label: "Con incidencia", value: snap.issueDeliveries,   tone: snap.issueDeliveries ? "warn" : "" },
      { label: "En standby",     value: snap.standbyToday,      tone: snap.standbyToday ? "warn" : "" },
    ];
    if (!isPortalClientUser(user)) {
      items.push(
        { label: "Pendientes de asignar", value: snap.pendingAssignment, tone: snap.pendingAssignment ? "warn" : "" },
        { label: "Alertas documentales",  value: snap.docRisk,           tone: snap.docRisk ? "warn" : "" },
        { label: "Notificaciones",        value: snap.unreadNotifications, tone: snap.unreadNotifications ? "warn" : "" },
      );
    }
    const rows = items.filter((item) => Number.parseInt(String(item.value), 10) > 0 || item.label === "Sin novedad")
      .map((item) => `<li class="at-pulse-item${item.tone ? ` at-pulse-item--${item.tone}` : ""}">
        <span class="at-pulse-item__label">${escapeHtml(item.label)}</span>
        <span class="at-pulse-item__value">${escapeHtml(String(item.value))}</span>
      </li>`).join("");

    return `<div class="at-panel">
      <div class="at-panel-head">
        <div>
          <span class="at-panel-head__kicker">Desglose</span>
          <h3>Pulso operativo</h3>
        </div>
      </div>
      <ul class="at-pulse-list">${rows}</ul>
      <div class="at-pulse-foot">
        ${isPortalClientUser(user)
          ? "Sus indicadores reflejan solo sus solicitudes."
          : `Actualizado ${escapeHtml(fmtTimeOnly(snap.generatedAt) || "ahora")} · hora Colombia`}
      </div>
    </div>`;
  }

  /* ─────────────────────────────────────────────────────────────
     FLEET CARDS
  ───────────────────────────────────────────────────────────── */

  function dashBuildMiniBarsFn(trips) {
    if (!trips.length) return "";
    const bars = trips.map((r) => {
      const tone = dashRequestOutcomeTone(r.status);
      return `<i class="at-mini-bar at-mini-bar--${tone}" title="${escapeAttr(`${r.requestNumber || r.id}: ${prettyStatus(r.status, "request")}`)}" aria-hidden="true"></i>`;
    }).join("");
    return `<div class="at-mini-bars" aria-hidden="true">${bars}</div>`;
  }

  function dashBuildVehicleCard(group, staggerIdx) {
    const plate = String(group.plate || "Sin placa").trim();
    const driver = String(group.driverName || "Sin conductor").trim();
    const trips = group.trips || [];
    const completed = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
    const liveCount = trips.filter((r) => dashRequestOutcomeTone(r.status) === "live").length;
    const cardStatus = liveCount ? "en-ruta"
      : completed === trips.length && trips.length ? "cerrado"
      : trips.length ? "programado" : "libre";

    const statusLabel = { "en-ruta": "En ruta", cerrado: "Cerrado", programado: "Programado", libre: "Libre" }[cardStatus] || cardStatus;

    const rows = trips.map((r) => {
      const delivery = fmtTimeOnly(r.deliveredAt || r.trip?.etaDelivery || r.deliveryAt);
      const delayed = dashTripIsDelayed(r);
      return `<tr class="${delayed ? "at-row--delayed" : ""}">
        <td><button type="button" class="at-trip-link" data-action="detail" data-id="${escapeAttr(r.id)}">${escapeHtml(String(r.requestNumber || r.id))}</button></td>
        <td>
          <span class="at-trip-client" title="${escapeAttr(String(r.clientName || "—"))}">${escapeHtml(String(r.clientName || "—"))}</span>
          <span class="at-trip-route" title="${escapeAttr(formatRoute(r))}">${escapeHtml(formatRoute(r))}</span>
        </td>
        <td>${dashStatusPill(r.status)}</td>
        <td class="at-trip-eta">${delivery}${delayed ? `<span class="at-delay-tag">⚠</span>` : ""}</td>
      </tr>`;
    }).join("");

    const table = rows
      ? `<div class="at-trip-table-wrap">
          <table class="at-trip-table">
            <thead><tr><th>Solicitud</th><th>Cliente / ruta</th><th>Estado</th><th>Entrega</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
         </div>`
      : `<p class="at-vehicle__empty">Sin viajes asignados.</p>`;

    const searchBlob = [plate, driver, ...trips.map((r) => `${r.requestNumber} ${r.clientName} ${formatRoute(r)}`)].join(" ");
    const pulse = cardStatus === "en-ruta" ? `<span class="at-live-pulse" style="margin-right:4px"></span>` : "";

    return `<article class="at-vehicle at-vehicle--${cardStatus}"
      data-plate="${escapeAttr(plate)}"
      data-driver="${escapeAttr(driver)}"
      data-status="${escapeAttr(cardStatus)}"
      data-search="${escapeAttr(searchBlob)}">
      <div class="at-vehicle__head">
        <div class="at-vehicle__status-bar"></div>
        <div>
          <div class="at-vehicle__plate">${pulse}<strong>${escapeHtml(plate)}</strong></div>
          <div class="at-vehicle__driver">${escapeHtml(driver)} · ${trips.length} viaje${trips.length === 1 ? "" : "s"}</div>
        </div>
        <span class="at-vehicle__badge">${escapeHtml(statusLabel)}</span>
      </div>
      ${dashBuildMiniBarsFn(trips)}
      ${table}
    </article>`;
  }

  /* ─────────────────────────────────────────────────────────────
     FLEET TABS
  ───────────────────────────────────────────────────────────── */

  function dashBuildFleetTabs(counts, activeTab = "all") {
    const tabs = [
      { id: "all",        label: "Todos" },
      { id: "en-ruta",    label: "En ruta" },
      { id: "programado", label: "Programados" },
      { id: "cerrado",    label: "Cerrados" },
    ];
    return tabs.map((t) => {
      const n = counts[t.id] ?? 0;
      const active = t.id === activeTab;
      return `<button type="button" role="tab" class="at-tab${active ? " is-active" : ""}"
        data-dash-tab="${escapeAttr(t.id)}"
        aria-selected="${active}"
        tabindex="${active ? "0" : "-1"}">${escapeHtml(t.label)}<em>${n}</em></button>`;
    }).join("");
  }

  /* ─────────────────────────────────────────────────────────────
     ACTIVITY FEED
  ───────────────────────────────────────────────────────────── */

  function dashBuildActivityFeed(trips) {
    const recent = [...(trips || [])].sort((a, b) => dashActivitySortKey(b) - dashActivitySortKey(a)).slice(0, 10);
    if (!recent.length) return `<p class="at-activity-empty">Sin movimientos recientes hoy.</p>`;

    return `<ul class="at-activity-list">${recent.map((r) => {
      const when = fmtTimeOnly(r.updatedAt || r.deliveredAt || r.trip?.etaDelivery || r.pickupAt) || "—";
      const tone = dashRequestOutcomeTone(r.status);
      return `<li class="at-activity-item at-activity-item--${tone}">
        <time class="at-activity-time">${escapeHtml(when)}</time>
        <button type="button" class="at-activity-link" data-action="detail" data-id="${escapeAttr(r.id)}">
          <strong>${escapeHtml(String(r.requestNumber || r.id))}</strong>
          <span>${escapeHtml(String(r.clientName || "Cliente"))} · ${escapeHtml(formatRoute(r))}</span>
        </button>
        ${dashStatusPill(r.status)}
      </li>`;
    }).join("")}</ul>`;
  }

  /* ─────────────────────────────────────────────────────────────
     ACCIONES RÁPIDAS
  ───────────────────────────────────────────────────────────── */

  function dashBuildQuickActions(user) {
    const actions = [];
    if (isViewAllowedForUser(user, "transport-trips"))
      actions.push({ view: "transport-trips", label: "Asignar viajes",  icon: IC.truck });
    if (isViewAllowedForUser(user, "requests"))
      actions.push({ view: "requests",        label: "Solicitudes",     icon: IC.inbox });
    if (isViewAllowedForUser(user, "calendar"))
      actions.push({ view: "calendar",        label: "Calendario",      icon: IC.calendar });
    if (isViewAllowedForUser(user, "reports"))
      actions.push({ view: "reports",         label: "Informes",        icon: IC.file });
    if (canAccessAuthorizationsView?.(user) && isViewAllowedForUser(user, "authorizations"))
      actions.push({ view: "authorizations",  label: "Autorizaciones",  icon: IC.shield });
    if (!actions.length) return "";
    return actions.map((a, i) =>
      `<button type="button" class="at-qa-btn${i === 0 ? " at-qa-btn--primary" : ""}"
        data-action="dash-nav" data-target-view="${escapeAttr(a.view)}">
        ${a.icon}<span>${escapeHtml(a.label)}</span>
      </button>`
    ).join("");
  }

  /* ─────────────────────────────────────────────────────────────
     CLIENT VIEW
  ───────────────────────────────────────────────────────────── */

  function dashBuildClientPanel(list, user, snap) {
    const pending   = list.filter((r) => r.status === STATUS.PENDIENTE).length;
    const active    = list.filter((r) => r.trip && tripRequestStatusIsOperational(r.status)).length;
    const done      = list.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
    const inTransit = list.filter((r) => String(r.status) === STATUS.EN_TRANSITO).length;

    const stats = [
      { label: "En tránsito", value: inTransit, tone: "live" },
      { label: "Activas",     value: active,    tone: "" },
      { label: "En revisión", value: pending,   tone: pending ? "warn" : "" },
      { label: "Completadas", value: done,      tone: "ok" },
    ];

    const recent = [...list].sort((a, b) => dashActivitySortKey(b) - dashActivitySortKey(a)).slice(0, 6);
    const tableRows = recent.map((r) =>
      `<tr>
        <td><button type="button" class="at-trip-link" data-action="detail" data-id="${escapeAttr(r.id)}">${escapeHtml(String(r.requestNumber || r.id))}</button></td>
        <td>${escapeHtml(formatRoute(r))}</td>
        <td>${dashStatusPill(r.status)}</td>
        <td>${fmtTimeOnly(r.pickupAt || r.trip?.etaPickup)}</td>
      </tr>`
    ).join("");

    const cta = isViewAllowedForUser(user, "requests")
      ? `<button type="button" class="at-qa-btn at-qa-btn--primary" data-action="dash-nav" data-target-view="requests">
          ${IC.plus || ""} Nueva solicitud</button>` : "";

    return `<div class="at-client-layout">
      <section class="at-panel at-reveal" style="--at-stagger:2">
        <div class="at-panel-head">
          <div><span class="at-panel-head__kicker">Mi operación</span><h3>Resumen de solicitudes</h3></div>
          ${cta ? `<div>${cta}</div>` : ""}
        </div>
        <dl class="at-client-grid">
          ${stats.map((s) => `<div class="at-client-stat at-client-stat--${s.tone || "neutral"}">
            <dt>${escapeHtml(s.label)}</dt><dd>${s.value}</dd>
          </div>`).join("")}
        </dl>
      </section>
      <section class="at-panel at-reveal" style="--at-stagger:3">
        <div class="at-panel-head">
          <div><span class="at-panel-head__kicker">Timeline</span><h3>Actividad reciente</h3></div>
        </div>
        ${recent.length ? `<div class="at-trip-table-wrap">
          <table class="at-trip-table">
            <thead><tr><th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Recogida</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table></div>`
          : `<p style="padding:24px;font-size:13px;color:var(--nx-text-3);text-align:center">Aún no tiene solicitudes registradas.</p>`}
      </section>
    </div>`;
  }

  /* ─────────────────────────────────────────────────────────────
     VISTA PRINCIPAL
  ───────────────────────────────────────────────────────────── */

  function viewDashboard() {
    dashInjectStyles();

    const user           = currentUser();
    const list           = getVisibleRequestsForUser(user);
    const DD             = dashDomain();
    const snap           = DD?.computeTodayOperationsSnapshot?.(user) ?? null;
    const attentionItems = DD?.computeDashboardAttentionItems?.(user) ?? [];
    const scopeBar       = isPortalClientUser(user)
      ? `<div class="at-scope-bar">${clientDataScopeBarHtml(getClientDataScope())}</div>` : "";

    const hero = dashBuildHero(snap, user, attentionItems);

    /* ── Vista cliente ── */
    if (isPortalClientUser(user)) {
      return `<section class="dashboard-studio dashboard-studio--client">${scopeBar}${dashBuildAmbient()}${hero}${dashBuildClientPanel(list, user, snap)}</section>`;
    }

    /* ── Vista operacional ── */
    const todayIso   = snap?.todayIso || colombiaTodayIsoDate();
    const todayTrips = list.filter((r) => {
      const pickupDay = requestPickupIsoDate(r);
      if (pickupDay === todayIso) return true;
      return r.trip && tripRequestStatusIsOperational(r.status);
    });

    const groupList = (
      DD?.groupRequestsByVehicleForDashboard
        ? DD.groupRequestsByVehicleForDashboard(todayTrips.filter((r) => r.trip?.vehicleId))
        : []
    ).sort((a, b) => String(a.plate).localeCompare(String(b.plate), "es"));

    const fleetCards = groupList.map((g, i) => dashBuildVehicleCard(g, i)).join("");
    const fleetContent = fleetCards || `<div class="at-fleet-empty">
      <div class="at-fleet-empty__icon">${IC.truck || "🚚"}</div>
      <p><strong>Sin vehículos activos hoy</strong></p>
      <p style="font-size:12px;color:var(--at-text-3);margin-top:4px">Asigne rutas desde Transporte · Viajes para ver la flota en tiempo real.</p>
      ${isViewAllowedForUser(user, "transport-trips")
        ? `<button type="button" class="at-qa-btn at-qa-btn--primary" style="margin-top:14px" data-action="dash-nav" data-target-view="transport-trips">Ir a asignación</button>` : ""}
    </div>`;

    const tabCounts     = dashCountFleetByStatus(groupList);
    const exec          = DD?.computeTodayExecutiveMetrics?.(user) ?? null;
    const hourly        = DD?.computeDeliveriesByHour?.(todayTrips) ?? [];
    const fleetPie      = DD?.computeFleetStatusBreakdown?.(user, groupList) ?? null;
    const mapMarkers    = DD?.computeDashboardMapMarkers?.(groupList) ?? [];
    const criticalAlerts = DD?.computeDashboardCriticalAlerts?.(user) ?? [];

    return `<section class="dashboard-studio" id="dashboard-root">${scopeBar}
      ${dashBuildAmbient()}
      ${hero}
      ${dashBuildKpiStrip(snap, exec)}
      <div class="at-command">
        ${dashBuildLiveMap(mapMarkers)}
        <div class="nx-alerts-stack">
          ${dashBuildCriticalAlertsPanel(criticalAlerts)}
        </div>
      </div>
      ${dashBuildAnalyticsRow(snap, hourly, fleetPie)}
      <div class="at-fleet-section">
        <div class="at-fleet-panel at-reveal" id="dash-fleet-panel" style="--at-stagger:17">
          <div class="at-fleet-head">
            <div class="at-fleet-head__info">
              <span style="font-size:9px;text-transform:uppercase;letter-spacing:0.16em;color:var(--nx-text-3);font-family:var(--nx-font-data);display:block;margin-bottom:4px">Command Center</span>
              <h3>Flota en tiempo real</h3>
              <p>Vehículos programados y en ruta hoy</p>
            </div>
            <label class="at-search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input id="dash-search" type="search" placeholder="Placa, conductor, ruta…" autocomplete="off"/>
            </label>
            <span class="at-fleet-count" id="dash-fleet-count">${groupList.length} veh.</span>
          </div>
          <div class="at-tabs" role="tablist" id="dash-tablist">${dashBuildFleetTabs(tabCounts)}</div>
          <div class="at-fleet-list" id="dash-fleet-list">${fleetContent}</div>
        </div>
        <div class="nx-sidebar-stack">
          <aside class="at-activity-panel at-reveal" style="--at-stagger:18" aria-label="Actividad reciente">
            <div class="at-panel-head">
              <div>
                <span class="at-panel-head__kicker">Stream</span>
                <h3>Últimos movimientos</h3>
              </div>
            </div>
            ${dashBuildActivityFeed(todayTrips)}
          </aside>
          ${dashBuildPulsePanel(snap, user)}
        </div>
      </div>
    </section>`;
  }

  /* ─────────────────────────────────────────────────────────────
     ANIMACIONES POST-RENDER
  ───────────────────────────────────────────────────────────── */

  function dashAnimateCount(el, delay, sourceEl) {
    const src     = sourceEl || el;
    const target  = Number(src.dataset.atCount);
    const display = String(src.dataset.atDisplay || "");
    if (!Number.isFinite(target)) return;
    const hasPct  = display.includes("%");
    const dur     = 820;
    const startAt = performance.now() + delay;
    const tick = (now) => {
      if (now < startAt) { requestAnimationFrame(tick); return; }
      const t = Math.min(1, (now - startAt) / dur);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = hasPct ? `${Math.round(target * ease)}%` : String(Math.round(target * ease));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = display;
    };
    requestAnimationFrame(tick);
  }

  function dashAnimateBars(root, baseDelay) {
    root.querySelectorAll(".at-hour-fill[data-at-width], .at-compliance-bar-fill[data-at-width]").forEach((bar, i) => {
      const target  = Number(bar.dataset.atWidth);
      if (!Number.isFinite(target)) return;
      const startAt = performance.now() + baseDelay + i * 55;
      bar.style.width = "0%";
      const tick = (now) => {
        if (now < startAt) { requestAnimationFrame(tick); return; }
        const t = Math.min(1, (now - startAt) / 720);
        bar.style.width = `${target * (1 - Math.pow(1 - t, 3))}%`;
        if (t < 1) requestAnimationFrame(tick);
        else bar.style.width = `${target}%`;
      };
      requestAnimationFrame(tick);
    });
  }

  function dashAnimateRing(root, delay) {
    root.querySelectorAll(".at-ring-anim[data-at-ring-offset]").forEach((ring) => {
      const finalOffset = Number(ring.dataset.atRingOffset);
      const r           = Number(ring.getAttribute("r")) || 38;
      const c           = 2 * Math.PI * r;
      ring.style.strokeDasharray  = `${c}`;
      ring.style.strokeDashoffset = `${c}`;
      const startAt = performance.now() + delay;
      const tick = (now) => {
        if (now < startAt) { requestAnimationFrame(tick); return; }
        const t = Math.min(1, (now - startAt) / 900);
        const ease = 1 - Math.pow(1 - t, 3);
        ring.style.strokeDashoffset = `${c + (finalOffset - c) * ease}`;
        if (t < 1) requestAnimationFrame(tick);
        else ring.style.strokeDashoffset = `${finalOffset}`;
      };
      requestAnimationFrame(tick);
    });
  }

  function dashAnimatePie(root, delay) {
    root.querySelectorAll(".at-fleet-pie--anim[data-pie-a]").forEach((pie) => {
      const a     = Number(pie.dataset.pieA);
      const e     = Number(pie.dataset.pieE);
      const m     = Number(pie.dataset.pieM);
      const final = String(pie.dataset.pieFinal || "");
      const startAt = performance.now() + delay;
      const tick = (now) => {
        if (now < startAt) { requestAnimationFrame(tick); return; }
        const t    = Math.min(1, (now - startAt) / 950);
        const ease = 1 - Math.pow(1 - t, 3);
        const aa   = a * ease, ee = e * ease, mm = m * ease, used = aa + ee + mm;
        if (used >= 99.5) pie.style.background = final;
        else pie.style.background = `conic-gradient(var(--at-cyan) 0% ${aa}%, var(--at-amber) ${aa}% ${aa + ee}%, var(--at-red) ${aa + ee}% ${used}%, var(--at-surface-3) ${used}% 100%)`;
        if (t < 1) requestAnimationFrame(tick);
        else if (final) pie.style.background = final;
      };
      requestAnimationFrame(tick);
    });
  }

  function initDashboardMotion(root) {
    if (!root || root.dataset.motionInit === "1") return;
    root.dataset.motionInit = "1";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("dashboard-studio--mounted");

    if (reduced) {
      root.querySelectorAll("[data-at-count]").forEach((el) => {
        if (el.dataset.atDisplay) el.textContent = el.dataset.atDisplay;
      });
      root.querySelectorAll(".at-hour-fill[data-at-width], .at-compliance-bar-fill[data-at-width]").forEach((b) => {
        b.style.width = `${b.dataset.atWidth}%`;
      });
      root.querySelectorAll(".at-fleet-pie--anim[data-pie-final]").forEach((p) => {
        p.style.background = p.dataset.pieFinal;
      });
      root.querySelectorAll(".at-ring-anim[data-at-ring-offset]").forEach((ring) => {
        const r = Number(ring.getAttribute("r")) || 38;
        const c = 2 * Math.PI * r;
        ring.style.strokeDasharray  = `${c}`;
        ring.style.strokeDashoffset = `${ring.dataset.atRingOffset}`;
      });
      return;
    }

    // KPI counters
    root.querySelectorAll(".at-kpi[data-at-count]").forEach((card) => {
      const stagger   = Number.parseInt(getComputedStyle(card).getPropertyValue("--at-stagger"), 10) || 0;
      const valueEl   = card.querySelector(".at-kpi__value");
      if (valueEl) dashAnimateCount(valueEl, 120 + stagger * 70, card);
    });

    // Compliance + health orb counters (exclude KPI cards already handled)
    root.querySelectorAll("[data-at-count][data-at-display]").forEach((el) => {
      if (!el.closest(".at-kpi")) dashAnimateCount(el, 520);
    });

    // Pie hole
    const pieTotalEl = root.querySelector(".at-fleet-pie__hole strong[data-at-count]");
    if (pieTotalEl) dashAnimateCount(pieTotalEl, 680);

    dashAnimateBars(root, 480);
    dashAnimateRing(root, 500);
    dashAnimatePie(root, 620);
  }

  /* ─────────────────────────────────────────────────────────────
     CONTROLES POST-RENDER
  ───────────────────────────────────────────────────────────── */

  function bindDashboardControls() {
    if (String(state.currentView || "") !== "dashboard" || !nodes.viewRoot) return;
    const root = nodes.viewRoot.querySelector(".dashboard-studio");
    if (!root) return;

    initDashboardMotion(root);

    const search   = root.querySelector("#dash-search");
    const cards    = [...root.querySelectorAll(".at-vehicle")];
    const countEl  = root.querySelector("#dash-fleet-count");
    const tablist  = root.querySelector("#dash-tablist");
    let activeTab  = "all";

    const syncTabs = (tabId) => {
      root.querySelectorAll(".at-tab").forEach((tab) => {
        const active = tab.dataset.dashTab === tabId;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active);
        tab.tabIndex = active ? 0 : -1;
      });
    };

    const selectTab = (tabId) => {
      activeTab = String(tabId || "all");
      syncTabs(activeTab);
      applyFilter();
    };

    const applyFilter = () => {
      const q = String(search?.value || "").trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const blob   = String(card.dataset.search || "").toLowerCase();
        const status = String(card.dataset.status || "");
        const matchQ = !q || blob.includes(q);
        const matchF = activeTab === "all" || status === activeTab;
        const show   = matchQ && matchF;
        card.hidden  = !show;
        if (show) visible++;
      });
      if (countEl) countEl.textContent = `${visible} veh.`;
      const listEl = root.querySelector("#dash-fleet-list");
      let emptyFilter = root.querySelector("#dash-fleet-filter-empty");
      const hasFilter = Boolean(q) || activeTab !== "all";
      if (cards.length && visible === 0 && hasFilter) {
        if (!emptyFilter && listEl) {
          emptyFilter = document.createElement("p");
          emptyFilter.id = "dash-fleet-filter-empty";
          emptyFilter.className = "at-vehicle__empty";
          emptyFilter.textContent = "Ningún vehículo coincide con la búsqueda o el filtro activo.";
          listEl.appendChild(emptyFilter);
        } else if (emptyFilter) {
          emptyFilter.hidden = false;
        }
      } else if (emptyFilter) {
        emptyFilter.hidden = true;
      }
    };

    search?.addEventListener("input", applyFilter);

    tablist?.addEventListener("click", (event) => {
      const tab = event.target.closest(".at-tab[data-dash-tab]");
      if (tab) selectTab(tab.dataset.dashTab);
    });

    tablist?.addEventListener("keydown", (event) => {
      const tabs = [...root.querySelectorAll(".at-tab")];
      if (!tabs.length) return;
      const ci = tabs.findIndex((t) => t.classList.contains("is-active"));
      let ni   = ci;
      if      (event.key === "ArrowRight") ni = (ci + 1) % tabs.length;
      else if (event.key === "ArrowLeft")  ni = (ci - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home")       ni = 0;
      else if (event.key === "End")        ni = tabs.length - 1;
      else return;
      event.preventDefault();
      const nextTab = tabs[ni];
      selectTab(nextTab.dataset.dashTab);
      nextTab.focus();
    });

    applyFilter();

    root.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === "dash-nav" || action === "dash-attention-nav") {
        const target = String(btn.dataset.targetView || "").trim();
        if (target) setView(target);
      } else if (action === "dash-focus-fleet") {
        selectTab(btn.dataset.dashTab || "all");
        root.querySelector("#dash-fleet-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     REGISTRO
  ───────────────────────────────────────────────────────────── */

  if (typeof window.registerLegacyPortalViews === "function") {
    window.registerLegacyPortalViews({ viewDashboard });
  } else {
    window.AppLegacyViews = window.AppLegacyViews || {};
    Object.assign(window.AppLegacyViews, { viewDashboard });
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.dashboard = bindDashboardControls;
})();