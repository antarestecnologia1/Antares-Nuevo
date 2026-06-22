/**
 * Portal — Dashboard (Torre de Control · Antares v3)
 * Rediseño visual completo. Módulo autocontenido.
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

/* ══════════════════════════════════════════════════════════
   VARIABLES DE DISEÑO — ANTARES TOWER v3
══════════════════════════════════════════════════════════ */
.dashboard-studio {
  /* Superficies */
  --at-bg:          #09090E;
  --at-surface:     #111318;
  --at-surface-2:   #191C23;
  --at-surface-3:   #1E2229;
  --at-border:      rgba(255,255,255,0.07);
  --at-border-2:    rgba(255,255,255,0.12);

  /* Acento primario — cian radar */
  --at-cyan:        #00D4FF;
  --at-cyan-mid:    rgba(0,212,255,0.18);
  --at-cyan-low:    rgba(0,212,255,0.07);
  --at-cyan-glow:   0 0 20px rgba(0,212,255,0.3);

  /* Semáforos */
  --at-green:       #10B981;
  --at-green-mid:   rgba(16,185,129,0.15);
  --at-green-low:   rgba(16,185,129,0.07);
  --at-amber:       #F59E0B;
  --at-amber-mid:   rgba(245,158,11,0.15);
  --at-amber-low:   rgba(245,158,11,0.07);
  --at-red:         #EF4444;
  --at-red-mid:     rgba(239,68,68,0.15);
  --at-red-low:     rgba(239,68,68,0.07);

  /* Texto */
  --at-text:        #E8EAF0;
  --at-text-2:      #9CA3AF;
  --at-text-3:      #6B7280;

  /* Tipografía */
  --at-font-ui:     'Inter', system-ui, sans-serif;
  --at-font-data:   'JetBrains Mono', 'SF Mono', monospace;

  /* Radio */
  --at-r-sm:        6px;
  --at-r:           10px;
  --at-r-lg:        14px;

  /* Sombras */
  --at-shadow:      0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3);
  --at-shadow-lg:   0 4px 24px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4);
}

/* ══════════════════════════════════════════════════════════
   RESET & BASE
══════════════════════════════════════════════════════════ */
.dashboard-studio *,
.dashboard-studio *::before,
.dashboard-studio *::after { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard-studio {
  font-family: var(--at-font-ui);
  background: var(--at-bg);
  color: var(--at-text);
  min-height: 100vh;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.dashboard-studio button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

.dashboard-studio a { color: inherit; text-decoration: none; }

/* ══════════════════════════════════════════════════════════
   REVEAL ANIMATION
══════════════════════════════════════════════════════════ */
@keyframes at-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.at-reveal {
  opacity: 0;
  animation: at-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: calc(var(--at-stagger, 0) * 55ms);
}

.dashboard-studio--mounted .at-reveal { opacity: 1; }

/* ══════════════════════════════════════════════════════════
   HERO — COMANDO CENTRAL
══════════════════════════════════════════════════════════ */
.at-hero {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 24px;
  padding: 28px 32px 24px;
  border-bottom: 1px solid var(--at-border);
  position: relative;
  overflow: hidden;
}

.at-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 100% at 0% 0%, rgba(0,212,255,0.05) 0%, transparent 70%);
  pointer-events: none;
}

.at-hero__eyebrow {
  font-family: var(--at-font-data);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--at-cyan);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.at-hero__eyebrow::before {
  content: '';
  display: block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--at-cyan);
  box-shadow: 0 0 8px var(--at-cyan);
  animation: at-pulse-dot 2s ease-in-out infinite;
}

@keyframes at-pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--at-cyan); }
  50%       { opacity: 0.6; box-shadow: 0 0 16px var(--at-cyan); }
}

.at-hero__title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--at-text);
  line-height: 1.2;
}

.at-hero__name { color: var(--at-cyan); }

.at-hero__meta {
  font-family: var(--at-font-data);
  font-size: 11px;
  color: var(--at-text-3);
  margin-top: 6px;
  display: flex;
  gap: 12px;
}

.at-hero__meta span + span::before {
  content: '·';
  margin-right: 12px;
  opacity: 0.4;
}

.at-hero__aside {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

/* Status chips */
.at-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.at-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
  transition: all 0.2s;
  cursor: pointer;
}

.at-chip--warn   { background: var(--at-amber-low); border-color: rgba(245,158,11,0.3); color: var(--at-amber); }
.at-chip--doc    { background: var(--at-cyan-low);  border-color: rgba(0,212,255,0.25); color: var(--at-cyan); }
.at-chip--live   { background: var(--at-green-low); border-color: rgba(16,185,129,0.3); color: var(--at-green); }
.at-chip--ok     { background: var(--at-green-low); border-color: rgba(16,185,129,0.3); color: var(--at-green); }
.at-chip--alert  { background: var(--at-red-low);   border-color: rgba(239,68,68,0.3);  color: var(--at-red); }
.at-chip--neutral { background: var(--at-surface-2); border-color: var(--at-border-2);   color: var(--at-text-2); }

.at-chip__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.at-chip--live .at-chip__dot,
.at-chip--ok .at-chip__dot { animation: at-pulse-dot 2s infinite; }

/* Acciones rápidas */
.at-quick-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.at-qa-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--at-r-sm);
  font-size: 12px;
  font-weight: 500;
  background: var(--at-surface-2);
  border: 1px solid var(--at-border-2);
  color: var(--at-text-2);
  transition: all 0.15s;
}

.at-qa-btn:hover { background: var(--at-surface-3); color: var(--at-text); border-color: var(--at-border-2); }
.at-qa-btn--primary { background: var(--at-cyan-mid); border-color: rgba(0,212,255,0.4); color: var(--at-cyan); }
.at-qa-btn--primary:hover { background: rgba(0,212,255,0.25); }

/* ══════════════════════════════════════════════════════════
   KPI STRIP
══════════════════════════════════════════════════════════ */
.at-kpi-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  background: var(--at-border);
  border-bottom: 1px solid var(--at-border);
}

.at-kpi {
  background: var(--at-surface);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  overflow: hidden;
  transition: background 0.2s;
}

.at-kpi:hover { background: var(--at-surface-2); }

.at-kpi::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: var(--at-kpi-accent, transparent);
}

.at-kpi--live   { --at-kpi-accent: var(--at-cyan); }
.at-kpi--blue   { --at-kpi-accent: #6366F1; }
.at-kpi--purple { --at-kpi-accent: #A855F7; }
.at-kpi--alert  { --at-kpi-accent: var(--at-red); }
.at-kpi--ok     { --at-kpi-accent: var(--at-green); }
.at-kpi--warn   { --at-kpi-accent: var(--at-amber); }
.at-kpi--muted  { --at-kpi-accent: var(--at-border-2); }

.at-kpi__icon {
  font-size: 16px;
  margin-bottom: 8px;
  opacity: 0.7;
}

.at-kpi__value {
  font-family: var(--at-font-data);
  font-size: 28px;
  font-weight: 700;
  color: var(--at-text);
  letter-spacing: -0.02em;
  line-height: 1;
}

.at-kpi--live .at-kpi__value   { color: var(--at-cyan); }
.at-kpi--alert .at-kpi__value  { color: var(--at-red); }

.at-kpi__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--at-text-2);
  margin-top: 4px;
}

.at-kpi__sub {
  font-family: var(--at-font-data);
  font-size: 10px;
  color: var(--at-text-3);
  letter-spacing: 0.03em;
}

/* Exec strip */
.at-exec-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--at-border);
  border-bottom: 1px solid var(--at-border);
}

.at-exec-item {
  background: var(--at-bg);
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.at-exec-item span {
  font-size: 11px;
  color: var(--at-text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
}

.at-exec-item strong {
  font-family: var(--at-font-data);
  font-size: 13px;
  color: var(--at-text);
}

/* ══════════════════════════════════════════════════════════
   COMMAND CENTER — MAPA + ALERTAS
══════════════════════════════════════════════════════════ */
.at-command {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1px;
  background: var(--at-border);
  border-bottom: 1px solid var(--at-border);
}

/* MAPA */
.at-map {
  background: var(--at-surface);
  position: relative;
  min-height: 260px;
  overflow: hidden;
}

.at-map__head {
  position: absolute;
  top: 0; left: 0; right: 0;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
  background: linear-gradient(to bottom, rgba(17,19,24,0.9) 60%, transparent);
}

.at-map__title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--at-text-2);
}

.at-live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--at-font-data);
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--at-green);
  font-weight: 700;
}

.at-live-pulse {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--at-green);
  animation: at-pulse-dot 1.5s infinite;
  box-shadow: 0 0 6px var(--at-green);
}

/* Terrain SVG */
.at-map__terrain {
  position: absolute;
  inset: 0;
}

/* Grid radar */
.at-map__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--at-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--at-border) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
}

.at-map__coords {
  position: absolute;
  bottom: 12px; left: 16px;
  font-family: var(--at-font-data);
  font-size: 9px;
  color: var(--at-text-3);
  letter-spacing: 0.08em;
  z-index: 2;
}

/* Pins */
.at-map-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: transform 0.2s;
}

.at-map-pin:hover { transform: translate(-50%, -50%) scale(1.15); z-index: 10; }

.at-map-pin__ico {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 2px solid;
  position: relative;
}

.at-map-pin--live .at-map-pin__ico {
  background: var(--at-cyan-mid);
  border-color: var(--at-cyan);
  box-shadow: 0 0 16px rgba(0,212,255,0.4);
}

.at-map-pin--alert .at-map-pin__ico {
  background: var(--at-red-mid);
  border-color: var(--at-red);
  box-shadow: 0 0 12px rgba(239,68,68,0.4);
}

/* Radar ring effect */
.at-map-pin--live .at-map-pin__ico::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1.5px solid var(--at-cyan);
  opacity: 0;
  animation: at-radar-ring 2.4s ease-out infinite;
}

@keyframes at-radar-ring {
  0%   { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.2); opacity: 0; }
}

.at-map-pin__label {
  font-family: var(--at-font-data);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: rgba(17,19,24,0.9);
  border: 1px solid var(--at-border-2);
  padding: 2px 5px;
  border-radius: 3px;
  white-space: nowrap;
}

.at-map-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--at-text-3);
  font-size: 13px;
}

.at-map-empty__icon { font-size: 28px; opacity: 0.3; }

/* ALERTAS */
.at-alerts-panel {
  background: var(--at-surface);
  display: flex;
  flex-direction: column;
}

.at-panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--at-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.at-panel-head__kicker {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--at-text-3);
  font-weight: 600;
  display: block;
  margin-bottom: 3px;
  font-family: var(--at-font-data);
}

.at-panel-head h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--at-text);
}

.at-alert-count {
  font-family: var(--at-font-data);
  font-size: 18px;
  font-weight: 700;
  color: var(--at-red);
  min-width: 28px;
  text-align: right;
}

.at-alert-ok-badge {
  font-family: var(--at-font-data);
  font-size: 10px;
  font-weight: 700;
  color: var(--at-green);
  letter-spacing: 0.1em;
  background: var(--at-green-low);
  border: 1px solid rgba(16,185,129,0.3);
  padding: 3px 8px;
  border-radius: 4px;
}

.at-alert-list {
  list-style: none;
  overflow-y: auto;
  flex: 1;
}

.at-alert-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--at-border);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;
  text-align: left;
}

.at-alert-item:hover { background: var(--at-surface-2); }

.at-alert-item__bar {
  width: 3px;
  height: 32px;
  border-radius: 2px;
  flex-shrink: 0;
}

.at-alert-item--alert .at-alert-item__bar { background: var(--at-red); box-shadow: 0 0 6px rgba(239,68,68,0.5); }
.at-alert-item--warn  .at-alert-item__bar { background: var(--at-amber); }

.at-alert-item__ico { font-size: 14px; flex-shrink: 0; }
.at-alert-item__text { flex: 1; color: var(--at-text-2); line-height: 1.3; }
.at-alert-ok { padding: 20px; font-size: 12px; color: var(--at-green); text-align: center; }

/* ══════════════════════════════════════════════════════════
   ANALYTICS ROW
══════════════════════════════════════════════════════════ */
.at-analytics {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 1px;
  background: var(--at-border);
  border-bottom: 1px solid var(--at-border);
}

.at-panel {
  background: var(--at-surface);
  display: flex;
  flex-direction: column;
}

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
  font-family: var(--at-font-data);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 4px 9px;
  border-radius: 4px;
}

.at-chart-badge--ok    { background: var(--at-green-low);  color: var(--at-green);  border: 1px solid rgba(16,185,129,0.3); }
.at-chart-badge--warn  { background: var(--at-amber-low);  color: var(--at-amber);  border: 1px solid rgba(245,158,11,0.3); }
.at-chart-badge--alert { background: var(--at-red-low);    color: var(--at-red);    border: 1px solid rgba(239,68,68,0.3); }

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
  background: linear-gradient(90deg, var(--at-cyan) 0%, rgba(0,212,255,0.6) 100%);
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

/* ══════════════════════════════════════════════════════════
   FLEET TOWER
══════════════════════════════════════════════════════════ */
.at-fleet-section {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1px;
  background: var(--at-border);
}

.at-fleet-panel { background: var(--at-bg); }

/* Fleet panel head */
.at-fleet-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--at-border);
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--at-surface);
}

.at-fleet-head__info { flex: 1; }
.at-fleet-head__info h3 { font-size: 14px; font-weight: 600; }
.at-fleet-head__info p  { font-size: 11px; color: var(--at-text-3); margin-top: 1px; }

.at-search-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--at-surface-2);
  border: 1px solid var(--at-border-2);
  border-radius: var(--at-r-sm);
  padding: 6px 10px;
}

.at-search-wrap input {
  background: none;
  border: none;
  outline: none;
  font-size: 12px;
  color: var(--at-text);
  font-family: var(--at-font-ui);
  width: 180px;
}

.at-search-wrap input::placeholder { color: var(--at-text-3); }
.at-search-wrap svg { color: var(--at-text-3); }

.at-fleet-count {
  font-family: var(--at-font-data);
  font-size: 11px;
  color: var(--at-text-3);
  white-space: nowrap;
}

/* Tabs */
.at-tabs {
  display: flex;
  border-bottom: 1px solid var(--at-border);
  background: var(--at-surface);
}

.at-tab {
  flex: 1;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--at-text-3);
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.at-tab:hover { color: var(--at-text); background: var(--at-surface-2); }

.at-tab.is-active {
  color: var(--at-cyan);
  border-bottom-color: var(--at-cyan);
  background: var(--at-surface-2);
}

.at-tab em {
  font-style: normal;
  font-family: var(--at-font-data);
  font-size: 10px;
  background: var(--at-surface-3);
  border-radius: 10px;
  padding: 1px 6px;
  color: var(--at-text-3);
}

.at-tab.is-active em { background: var(--at-cyan-low); color: var(--at-cyan); }

/* Fleet list */
.at-fleet-list {
  overflow-y: auto;
  max-height: 600px;
}

/* Vehicle card */
.at-vehicle {
  border-bottom: 1px solid var(--at-border);
  transition: background 0.15s;
}

.at-vehicle:hover { background: var(--at-surface); }

.at-vehicle__head {
  padding: 14px 20px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.at-vehicle__status-bar {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  flex-shrink: 0;
}

.at-vehicle--en-ruta .at-vehicle__status-bar   { background: var(--at-cyan); box-shadow: 0 0 8px rgba(0,212,255,0.5); }
.at-vehicle--programado .at-vehicle__status-bar { background: #6366F1; }
.at-vehicle--cerrado .at-vehicle__status-bar    { background: var(--at-surface-3); }
.at-vehicle--libre .at-vehicle__status-bar      { background: var(--at-surface-3); }

.at-vehicle__plate {
  font-family: var(--at-font-data);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.at-vehicle__driver { font-size: 11px; color: var(--at-text-3); margin-top: 1px; }

.at-vehicle__badge {
  margin-left: auto;
  font-family: var(--at-font-data);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 9px;
  border-radius: 4px;
}

.at-vehicle--en-ruta   .at-vehicle__badge { background: var(--at-cyan-mid);  color: var(--at-cyan);  border: 1px solid rgba(0,212,255,0.35); }
.at-vehicle--programado .at-vehicle__badge { background: rgba(99,102,241,0.15); color: #818CF8; border: 1px solid rgba(99,102,241,0.3); }
.at-vehicle--cerrado   .at-vehicle__badge { background: var(--at-surface-3); color: var(--at-text-3); border: 1px solid var(--at-border); }
.at-vehicle--libre     .at-vehicle__badge { background: var(--at-surface-3); color: var(--at-text-3); border: 1px solid var(--at-border); }

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
  padding: 6px 20px;
  text-align: left;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--at-text-3);
  font-weight: 600;
  font-family: var(--at-font-data);
  background: var(--at-bg);
  border-top: 1px solid var(--at-border);
  border-bottom: 1px solid var(--at-border);
}

.at-trip-table tbody td {
  padding: 9px 20px;
  border-bottom: 1px solid var(--at-border);
  vertical-align: middle;
}

.at-trip-table tbody tr:hover td { background: rgba(255,255,255,0.02); }

.at-trip-table tr.at-row--delayed td { background: rgba(239,68,68,0.04); }

.at-trip-link {
  font-family: var(--at-font-data);
  font-size: 12px;
  font-weight: 600;
  color: var(--at-cyan);
  transition: color 0.15s;
}

.at-trip-link:hover { color: white; }

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
  font-family: var(--at-font-data);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.at-pill--live    { background: var(--at-cyan-low);  color: var(--at-cyan);  border: 1px solid rgba(0,212,255,0.25); }
.at-pill--ok      { background: var(--at-green-low); color: var(--at-green); border: 1px solid rgba(16,185,129,0.25); }
.at-pill--warn    { background: var(--at-amber-low); color: var(--at-amber); border: 1px solid rgba(245,158,11,0.25); }
.at-pill--alert   { background: var(--at-red-low);   color: var(--at-red);   border: 1px solid rgba(239,68,68,0.25); }
.at-pill--neutral { background: var(--at-surface-2); color: var(--at-text-3); border: 1px solid var(--at-border); }

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

/* ══════════════════════════════════════════════════════════
   ACTIVITY FEED
══════════════════════════════════════════════════════════ */
.at-activity-panel {
  background: var(--at-surface);
  display: flex;
  flex-direction: column;
}

.at-activity-list { list-style: none; overflow-y: auto; flex: 1; }

.at-activity-item {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--at-border);
  position: relative;
}

.at-activity-item::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
}

.at-activity-item--live::before  { background: var(--at-cyan); }
.at-activity-item--ok::before    { background: var(--at-green); }
.at-activity-item--warn::before  { background: var(--at-amber); }
.at-activity-item--alert::before { background: var(--at-red); }

.at-activity-time {
  font-family: var(--at-font-data);
  font-size: 10px;
  color: var(--at-text-3);
  text-align: right;
}

.at-activity-link {
  font-size: 12px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1px;
  transition: color 0.15s;
}

.at-activity-link:hover { color: var(--at-cyan); }

.at-activity-link strong {
  font-family: var(--at-font-data);
  font-size: 12px;
}

.at-activity-link span { font-size: 10px; color: var(--at-text-3); }
.at-activity-empty { padding: 20px 16px; font-size: 12px; color: var(--at-text-3); text-align: center; }

/* ══════════════════════════════════════════════════════════
   PULSE PANEL
══════════════════════════════════════════════════════════ */
.at-pulse-list { list-style: none; padding: 8px 0; }

.at-pulse-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 20px;
  border-bottom: 1px solid var(--at-border);
  font-size: 12px;
}

.at-pulse-item__label { color: var(--at-text-2); }
.at-pulse-item__value {
  font-family: var(--at-font-data);
  font-weight: 600;
  color: var(--at-text);
}

.at-pulse-item--warn .at-pulse-item__value  { color: var(--at-amber); }
.at-pulse-item--alert .at-pulse-item__value { color: var(--at-red); }

.at-pulse-foot {
  padding: 10px 20px;
  font-size: 10px;
  color: var(--at-text-3);
  font-family: var(--at-font-data);
  border-top: 1px solid var(--at-border);
}

/* ══════════════════════════════════════════════════════════
   SCOPE BAR
══════════════════════════════════════════════════════════ */
.at-scope-bar {
  padding: 8px 32px;
  background: rgba(245,158,11,0.08);
  border-bottom: 1px solid rgba(245,158,11,0.2);
  font-size: 12px;
  color: var(--at-amber);
  font-family: var(--at-font-data);
}

/* ══════════════════════════════════════════════════════════
   CLIENT VIEW
══════════════════════════════════════════════════════════ */
.at-client-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--at-border);
}

.at-client-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--at-border);
  margin: 0;
  border-top: 1px solid var(--at-border);
}

.at-client-stat {
  background: var(--at-surface);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.at-client-stat dt { font-size: 11px; color: var(--at-text-3); text-transform: uppercase; letter-spacing: 0.08em; }
.at-client-stat dd {
  font-family: var(--at-font-data);
  font-size: 28px;
  font-weight: 700;
  color: var(--at-text);
  line-height: 1;
}

.at-client-stat--live dd  { color: var(--at-cyan); }
.at-client-stat--ok dd    { color: var(--at-green); }
.at-client-stat--warn dd  { color: var(--at-amber); }

/* ══════════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════════ */
@media (max-width: 1100px) {
  .at-kpi-strip { grid-template-columns: repeat(3, 1fr); }
  .at-exec-strip { grid-template-columns: repeat(2, 1fr); }
  .at-analytics { grid-template-columns: 1fr 1fr; }
  .at-analytics > :last-child { grid-column: 1 / -1; }
  .at-fleet-section { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .at-hero { grid-template-columns: 1fr; }
  .at-hero__aside { align-items: flex-start; }
  .at-kpi-strip { grid-template-columns: repeat(2, 1fr); }
  .at-exec-strip { grid-template-columns: 1fr; }
  .at-command { grid-template-columns: 1fr; }
  .at-analytics { grid-template-columns: 1fr; }
  .at-client-layout { grid-template-columns: 1fr; }
  .at-hero { padding: 20px 16px; }
}

@media (prefers-reduced-motion: reduce) {
  .at-reveal { animation: none; opacity: 1; }
  .at-pulse-dot, .at-live-pulse, .at-radar-ring { animation: none; }
  .at-fleet-pie, .at-ring-fg, .at-hour-fill,
  .at-compliance-bar-fill { transition: none; }
}
  `;

  /* ─────────────────────────────────────────────────────────────
     INYECTAR CSS UNA VEZ
  ───────────────────────────────────────────────────────────── */

  function dashInjectStyles() {
    if (document.getElementById("at-dash-styles")) return;
    const style = document.createElement("style");
    style.id = "at-dash-styles";
    style.textContent = DASH_STYLES;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────────────────────
     COMPONENTES ATOM
  ───────────────────────────────────────────────────────────── */

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
      <button type="button" class="at-chip at-chip--warn" data-action="dash-nav" data-target-view="notifications">
        <span>🔔</span>
        <span>${alertCount} alerta${alertCount === 1 ? "" : "s"}</span>
      </button>
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
        <div class="at-hero__eyebrow">TORRE DE CONTROL · ANTARES</div>
        <h2 class="at-hero__title">${escapeHtml(greeting)}, <span class="at-hero__name">${firstName}</span></h2>
        <div class="at-hero__meta">
          <span>${escapeHtml(longDate)}</span>
          <span>Actualizado ${escapeHtml(updatedAgo)}</span>
        </div>
      </div>
      <div class="at-hero__aside">
        <div class="at-chips">${chips}</div>
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

    function kpi(icon, label, value, sub, tone, idx) {
      const display = String(value);
      const rawNum = display.replace(/[^\d.-]/g, "");
      const countAttr = rawNum !== "" && Number.isFinite(Number(rawNum))
        ? ` data-at-count="${escapeAttr(rawNum)}" data-at-display="${escapeAttr(display)}"` : "";
      return `<div class="at-kpi at-kpi--${tone} at-reveal" style="--at-stagger:${idx}"${countAttr}>
        <div class="at-kpi__icon">${icon}</div>
        <strong class="at-kpi__value">${escapeHtml(display)}</strong>
        <div class="at-kpi__label">${escapeHtml(label)}</div>
        <div class="at-kpi__sub">${escapeHtml(sub)}</div>
      </div>`;
    }

    const kpis = [
      kpi(IC.truck || "🚚", "En ruta", snap.vehicleIdsEnRuta, "Vehículos activos", "live", 0),
      kpi(IC.compass || "📋", "Asignados", snap.assignedToday, "Programados hoy", "blue", 1),
      kpi(IC.check || "✅", "Completados", snap.completedToday, "Entregas cerradas", "purple", 2),
      kpi(IC.alertTriangle || "⚠️", "Retrasos", snap.delayedToday,
        snap.delayedToday ? "Requieren acción" : "Sin desvíos",
        snap.delayedToday ? "alert" : "muted", 3),
      kpi(IC.activity || "🎯", "Cumplimiento SLA", `${snap.compliancePct}%`, complianceSub, complianceTone, 4),
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

    return `<section class="at-map at-reveal" style="--at-stagger:10" aria-label="Mapa en vivo">
      <div class="at-map__head">
        <span class="at-map__title">Geolocalización · ${list.length} unidad${list.length === 1 ? "" : "es"}</span>
        <span class="at-live-badge"><span class="at-live-pulse"></span>LIVE</span>
      </div>
      <div class="at-map__grid" aria-hidden="true"></div>
      <div class="at-map__coords">4.7110° N · 74.0721° W · CO</div>
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
      <section class="at-panel">
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
      <section class="at-panel">
        <div class="at-panel-head">
          <div><span class="at-panel-head__kicker">Timeline</span><h3>Actividad reciente</h3></div>
        </div>
        ${recent.length ? `<div class="at-trip-table-wrap">
          <table class="at-trip-table">
            <thead><tr><th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Recogida</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table></div>`
          : `<p style="padding:20px;font-size:12px;color:var(--at-text-3)">Aún no tiene solicitudes registradas.</p>`}
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
      return `${scopeBar}<section class="dashboard-studio dashboard-studio--client">${hero}${dashBuildClientPanel(list, user, snap)}</section>`;
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

    return `${scopeBar}<section class="dashboard-studio" id="dashboard-root">
      ${hero}
      ${dashBuildKpiStrip(snap, exec)}
      <div class="at-command">
        ${dashBuildLiveMap(mapMarkers)}
        ${dashBuildCriticalAlertsPanel(criticalAlerts)}
      </div>
      ${dashBuildAnalyticsRow(snap, hourly, fleetPie)}
      <div class="at-fleet-section">
        <div class="at-fleet-panel at-reveal" id="dash-fleet-panel" style="--at-stagger:17">
          <div class="at-fleet-head">
            <div class="at-fleet-head__info">
              <span style="font-size:9px;text-transform:uppercase;letter-spacing:0.14em;color:var(--at-text-3);font-family:var(--at-font-data);display:block;margin-bottom:3px">Operaciones · Hoy</span>
              <h3>Torre de flota</h3>
              <p>Seguimiento en vivo de vehículos programados</p>
            </div>
            <label class="at-search-wrap">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input id="dash-search" type="search" placeholder="Buscar placa, conductor…" autocomplete="off"/>
            </label>
            <span class="at-fleet-count" id="dash-fleet-count">${groupList.length} veh.</span>
          </div>
          <div class="at-tabs" role="tablist" id="dash-tablist">${dashBuildFleetTabs(tabCounts)}</div>
          <div class="at-fleet-list" id="dash-fleet-list">${fleetContent}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:1px;background:var(--at-border)">
          <aside class="at-activity-panel at-reveal" style="--at-stagger:18;flex:1" aria-label="Actividad reciente">
            <div class="at-panel-head">
              <div>
                <span class="at-panel-head__kicker">Timeline</span>
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
      const r           = 38;
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
        const r = 38, c = 2 * Math.PI * r;
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

    // Compliance pct text
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