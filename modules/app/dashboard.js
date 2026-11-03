/**
 * Portal — Dashboard (Torre de control).
 *
 * Responde, en este orden, tres preguntas:
 *   1. ¿Qué necesita atención ahora?        → «Requiere atención», flota, viajes de hoy, vencimientos.
 *   2. ¿Cómo vamos en el periodo?            → entregas a tiempo, ingresos, resultado, clientes.
 *   3. ¿Cómo está el resto de la empresa?    → talento humano y comercial.
 *
 * Los cálculos están en `modules/domain/dashboard.domain.js` y `dashboard-metrics.domain.js`.
 * Estilos: `styles/dashboard-module.css` (clases `dt-*`). Carga con `defer` después de `app.js`.
 */
(function registerDashboardPortalModule() {
  "use strict";

  /* ───────────────────────── estado de la pantalla ───────────────────────── */

  const ui = { period: "7d", boardFilter: "all", boardQuery: "", expiryTab: "all" };
  let charts = [];
  let refreshTimer = null;
  let lastModel = null;
  let themeObserver = null;

  const REFRESH_MS = 60 * 1000;
  const BOARD_VISIBLE_ROWS = 12;
  const EXPIRY_VISIBLE_ROWS = 6;

  const STATUS_LABEL = {
    en_transito: "En tránsito",
    espera_standby: "En standby",
    viaje_asignado: "Programado",
    aprobada_pendiente_asignacion: "Por asignar",
    pendiente: "En revisión",
    completada: "Entregado",
    cerrada: "Cerrado"
  };
  const STATUS_TONE = {
    en_transito: "live",
    espera_standby: "warn",
    viaje_asignado: "plan",
    aprobada_pendiente_asignacion: "warn",
    pendiente: "plan",
    completada: "done",
    cerrada: "done"
  };

  const ATTN_ICON = {
    late: "alertTriangle",
    standby: "clock",
    assign: "inbox",
    docs: "shield",
    auth: "badge",
    contracts: "briefcase",
    leads: "mail",
    pending: "inbox"
  };

  const BOARD_TABS = [
    { id: "all", label: "Todos" },
    { id: "late", label: "Retrasados" },
    { id: "route", label: "En ruta" },
    { id: "assigned", label: "Programados" },
    { id: "assign", label: "Por asignar" },
    { id: "done", label: "Entregados hoy" }
  ];

  const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

  /* ───────────────────────── utilidades ───────────────────────── */

  function dashDomain() {
    return typeof AntaresDashboardDomain !== "undefined" ? AntaresDashboardDomain : null;
  }

  function icon(key) {
    return (typeof IC !== "undefined" && IC && IC[key]) || "";
  }

  function esc(value) {
    return escapeHtml(String(value ?? ""));
  }

  function attr(value) {
    return escapeAttr(String(value ?? ""));
  }

  function nf(n, digits = 0) {
    return Number(n || 0).toLocaleString("es-CO", { maximumFractionDigits: digits });
  }

  /** $1.250.000 */
  function cop(n) {
    return `$${nf(Math.round(Number(n) || 0))}`;
  }

  /** $1,2 M · $850 mil · $2,3 mil M */
  function copCompact(n) {
    const v = Number(n) || 0;
    const abs = Math.abs(v);
    const sign = v < 0 ? "-" : "";
    if (abs >= 1e9) return `${sign}$${nf(abs / 1e9, 1)} mil M`;
    if (abs >= 1e6) return `${sign}$${nf(abs / 1e6, 1)} M`;
    if (abs >= 1e3) return `${sign}$${nf(abs / 1e3, 0)} mil`;
    return `${sign}$${nf(abs)}`;
  }

  function plural(n, one, many) {
    return `${nf(n)} ${n === 1 ? one : many}`;
  }

  function dayShort(ymd) {
    const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}` : String(ymd || "");
  }

  function dayLong(ymd) {
    const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return String(ymd || "");
    const wd = WEEKDAYS[new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay()];
    return `${wd} ${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}`;
  }

  function rangeLabel(from, to) {
    return from === to ? dayShort(from) : `${dayShort(from)} – ${dayShort(to)}`;
  }

  function statusLabel(slug, fallback) {
    return STATUS_LABEL[slug] || fallback || "—";
  }

  function minutesLabel(min) {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }

  function pctChangeSafe(current, previous) {
    if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
    return Math.round(((current - previous) / Math.abs(previous)) * 100);
  }

  /* ───────────────────────── piezas pequeñas ───────────────────────── */

  /** Cambio frente al periodo anterior. `goodUp`: si subir es bueno (false para costos). */
  function deltaHtml(value, { goodUp = true, unit = "%", compareLabel = "vs periodo anterior", showRef = true } = {}) {
    if (value == null || !Number.isFinite(value)) {
      return `<span class="dt-delta dt-delta--flat">Sin base para comparar</span>`;
    }
    const ref = showRef && compareLabel ? ` <span class="dt-delta__ref">${esc(compareLabel)}</span>` : "";
    if (value === 0) return `<span class="dt-delta dt-delta--flat">Sin cambio${ref}</span>`;
    const up = value > 0;
    const good = up === goodUp;
    const arrow = up ? "▲" : "▼";
    const sign = up ? "+" : "−";
    return `<span class="dt-delta dt-delta--${good ? "good" : "bad"}"><span aria-hidden="true">${arrow}</span> ${sign}${nf(Math.abs(value))}${esc(unit)}${ref}</span>`;
  }

  function tile({ label, value, delta = "", hint = "", tone = "", testid = "", ico = "", spark = "" }) {
    const chip = ico && icon(ico) ? `<span class="dt-ico dt-ico--sm" aria-hidden="true">${icon(ico)}</span>` : "";
    return `<article class="dt-tile${tone ? ` dt-tile--${tone}` : ""}"${testid ? ` data-testid="${attr(testid)}"` : ""}>
      <div class="dt-tile__top"><span class="dt-tile__label">${esc(label)}</span>${chip}</div>
      <div class="dt-tile__main"><strong class="dt-tile__value">${esc(value)}</strong>${spark}</div>
      ${delta}
      ${hint ? `<span class="dt-tile__hint">${hint}</span>` : ""}
    </article>`;
  }

  /** Indicador en vivo de la franja superior: número grande, ícono y, si aplica, acción al hacer clic. */
  function pulseTile({ label, value, sub, tone = "", ico, action = "", data = "" }) {
    const body = `<span class="dt-ico dt-ico--lg" aria-hidden="true">${icon(ico)}</span>
      <span class="dt-pulse__txt"><span class="dt-pulse__label">${esc(label)}</span><strong class="dt-pulse__value">${esc(value)}</strong><span class="dt-pulse__sub">${esc(sub)}</span></span>`;
    return action
      ? `<button type="button" class="dt-pulse__tile dt-pulse__tile--${attr(tone || "plain")}" data-action="${attr(action)}" ${data}>${body}</button>`
      : `<div class="dt-pulse__tile dt-pulse__tile--${attr(tone || "plain")}">${body}</div>`;
  }

  function buildPulse(m) {
    const c = m.board.counts;
    const tiles = [];
    if (m.isClient) {
      tiles.push(pulseTile({ label: "En curso", value: nf(c.route + c.assigned), sub: `${nf(c.assigned)} programados`, ico: "truck", action: "dash-board-filter", data: 'data-filter="all"' }));
      tiles.push(pulseTile({ label: "Retrasados", value: nf(c.late), sub: c.late ? "Con la hora estimada vencida" : "Todo a tiempo", tone: c.late ? "alert" : "ok", ico: "alertTriangle", action: "dash-board-filter", data: 'data-filter="late"' }));
      tiles.push(pulseTile({ label: "En revisión", value: nf(m.ownPending || 0), sub: "Esperando respuesta", tone: m.ownPending ? "warn" : "", ico: "inbox", action: m.access.requests ? "dash-nav" : "", data: 'data-target-view="requests"' }));
      tiles.push(pulseTile({ label: "Entregados hoy", value: nf(c.done), sub: "Servicios finalizados", tone: "", ico: "check", action: "dash-board-filter", data: 'data-filter="done"' }));
    } else {
      const f = m.fleet;
      const ex = m.expirations;
      tiles.push(pulseTile({ label: "En ruta", value: nf(c.route), sub: `${nf(c.assigned)} programados`, ico: "truck", action: "dash-board-filter", data: 'data-filter="route"' }));
      tiles.push(pulseTile({ label: "Retrasados", value: nf(c.late), sub: c.late ? "Requieren acción" : "Todo a tiempo", tone: c.late ? "alert" : "ok", ico: "alertTriangle", action: "dash-board-filter", data: 'data-filter="late"' }));
      tiles.push(pulseTile({ label: "Por asignar", value: nf(c.assign), sub: "Solicitudes sin camión", tone: c.assign ? "warn" : "", ico: "inbox", action: "dash-board-filter", data: 'data-filter="assign"' }));
      if (f) {
        tiles.push(pulseTile({ label: "Flota disponible", value: nf(f.available), sub: f.utilizationPct == null ? `de ${nf(f.total)} registrados` : `${f.utilizationPct} % de la flota en uso`, ico: "check", action: m.access.vehicles ? "dash-nav" : "", data: 'data-target-view="transport-vehicles"' }));
      }
      if (ex) {
        tiles.push(pulseTile({ label: "Documentos vencidos", value: nf(ex.totals.expired), sub: `${nf(ex.totals.soon)} por vencer en 30 días`, tone: ex.totals.expired ? "alert" : "ok", ico: "shield", action: "dash-scroll", data: 'data-target="dt-expirations"' }));
      }
    }
    return `<section class="dt-pulse" style="--dt-n:${tiles.length}" data-testid="dt-pulse" aria-label="Indicadores en vivo">${tiles.join("")}</section>`;
  }

  function cardHead(title, sub = "", right = "", id = "", ico = "") {
    const chip = ico && icon(ico) ? `<span class="dt-ico" aria-hidden="true">${icon(ico)}</span>` : "";
    return `<header class="dt-card__head">
      <div class="dt-card__title">${chip}<div><h3${id ? ` id="${attr(id)}"` : ""}>${esc(title)}</h3>${sub ? `<p>${esc(sub)}</p>` : ""}</div></div>
      ${right}
    </header>`;
  }

  /** Tendencia en miniatura (sin ejes): línea de 2 px y punto final con aro del color de la tarjeta. */
  function sparkline(values, label) {
    const pts = values.map((v, i) => (Number.isFinite(v) ? { v, i } : null)).filter(Boolean);
    if (pts.length < 2) return "";
    const w = 112;
    const h = 36;
    const pad = 5;
    const min = Math.min(...pts.map((p) => p.v));
    const max = Math.max(...pts.map((p) => p.v));
    const span = max - min || 1;
    const x = (i) => pad + (i / Math.max(1, values.length - 1)) * (w - pad * 2);
    const y = (v) => (max === min ? h / 2 : h - pad - ((v - min) / span) * (h - pad * 2));
    const path = pts.map((p, k) => `${k ? "L" : "M"}${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
    const last = pts[pts.length - 1];
    return `<svg class="dt-spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="${attr(label)}" focusable="false">
      <path d="${path}" fill="none" stroke="var(--dt-spark, var(--dt-s1))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
      <circle cx="${x(last.i).toFixed(1)}" cy="${y(last.v).toFixed(1)}" r="4" fill="var(--dt-spark, var(--dt-s1))" stroke="var(--dt-surface)" stroke-width="2"/>
    </svg>`;
  }

  function emptyState(text, tone = "") {
    return `<p class="dt-empty${tone ? ` dt-empty--${tone}` : ""}">${tone === "ok" ? `<span class="dt-empty__ico" aria-hidden="true">${icon("check")}</span>` : ""}<span>${esc(text)}</span></p>`;
  }

  /* ───────────────────────── cabecera ───────────────────────── */

  function buildHeader(m, user) {
    const greeting = typeof colombiaTimeOfDayGreeting === "function" ? colombiaTimeOfDayGreeting(new Date()) : "Hola";
    const displayName = (typeof getPortalUserDisplayName === "function" && getPortalUserDisplayName(user)) || user?.name || "";
    const first = String(displayName).trim().split(/\s+/)[0] || "";
    const longDate = typeof formatColombiaLongDate === "function" ? formatColombiaLongDate(new Date()) : m.todayYmd;
    const time = typeof fmtTimeOnly === "function" ? fmtTimeOnly(m.generatedAt) : "";

    const actions = [];
    if (m.isClient && m.access.requests) {
      actions.push(`<button type="button" class="dt-btn dt-btn--primary" data-action="dash-nav" data-target-view="requests">${icon("plus")}<span>Nueva solicitud</span></button>`);
    } else if (m.access.trips) {
      actions.push(`<button type="button" class="dt-btn dt-btn--primary" data-action="dash-nav" data-target-view="transport-trips">${icon("truck")}<span>Asignar viajes</span></button>`);
    }
    if (!m.isClient && m.access.reports) {
      actions.push(`<button type="button" class="dt-btn" data-action="dash-nav" data-target-view="reports">${icon("file")}<span>Informes</span></button>`);
    }
    if (m.access.calendar && !m.isClient) {
      actions.push(`<button type="button" class="dt-btn" data-action="dash-nav" data-target-view="transport-calendar">${icon("calendar")}<span>Calendario</span></button>`);
    }
    actions.push(`<button type="button" class="dt-btn dt-btn--icon" data-action="dash-refresh" aria-label="Actualizar datos" title="Actualizar datos">${icon("rotateCcw")}</button>`);

    return `<header class="dt-head">
      <div class="dt-head__title">
        <h2>${m.isClient ? "Mi operación" : "Torre de control"}</h2>
        <p>${first ? `<span>${esc(greeting)}, ${esc(first)}</span> · ` : ""}<span>${esc(longDate)}</span> · <span>actualizado ${esc(time || "ahora")}</span></p>
      </div>
      <div class="dt-head__actions">${actions.join("")}</div>
    </header>`;
  }

  /* ───────────────────────── requiere atención ───────────────────────── */

  function buildAttention(m) {
    const items = m.attention || [];
    const body = items.length
      ? `<ul class="dt-attn__list">${items
          .map((it) => {
            const nav = it.action
              ? `data-action="${attr(it.action)}" data-filter="${attr(it.filter || "")}"`
              : `data-action="dash-nav" data-target-view="${attr(it.view || "")}"`;
            const ico = ATTN_ICON[it.id] || ATTN_ICON[String(it.id).split("-")[0]] || "alertTriangle";
            return `<li class="dt-attn__item dt-attn__item--${attr(it.tone)}">
              <span class="dt-ico dt-ico--tone dt-ico--${attr(it.tone)}" aria-hidden="true">${icon(ico)}</span>
              <div class="dt-attn__text"><strong>${esc(it.title)}</strong><span>${esc(it.detail)}</span></div>
              <button type="button" class="dt-link" ${nav}>${esc(it.cta || "Abrir")}<span aria-hidden="true"> →</span></button>
            </li>`;
          })
          .join("")}</ul>`
      : emptyState(
          m.isClient ? "Todo en orden: ninguna de sus entregas está retrasada." : "Todo en orden: sin entregas retrasadas, documentos vencidos ni pendientes por resolver.",
          "ok"
        );
    const urgent = items.filter((i) => i.tone === "alert").length;
    const badge = items.length
      ? `<span class="dt-count${urgent ? " dt-count--alert" : ""}" aria-label="${items.length} pendientes">${items.length}</span>`
      : "";
    return `<section class="dt-card dt-attn" data-testid="dt-attention" aria-labelledby="dt-attn-title">
      ${cardHead("Requiere atención", "De lo más urgente a lo menos urgente", badge, "dt-attn-title", "bell")}
      ${body}
    </section>`;
  }

  /* ───────────────────────── flota ───────────────────────── */

  function buildFleet(m) {
    const f = m.fleet;
    if (!f) return "";
    if (!f.total) {
      return `<section class="dt-card dt-fleet" data-testid="dt-fleet">${cardHead("Estado de la flota")}${emptyState("Aún no hay camiones registrados.")}</section>`;
    }
    const states = f.states;
    const total = f.total;
    const blocks = states
      .filter((s) => s.count > 0)
      .map((s) => {
        const pct = Math.round((s.count / total) * 100);
        const label = `${s.label}: ${plural(s.count, "camión", "camiones")} (${pct} %)${s.plates.length ? ` · ${s.plates.slice(0, 6).join(", ")}${s.plates.length > 6 ? "…" : ""}` : ""}`;
        return `<span class="dt-fbar__seg dt-fs--${attr(s.id)}" style="flex:${s.count} 1 0" tabindex="0" role="img" aria-label="${attr(label)}" title="${attr(label)}">${pct >= 9 ? nf(s.count) : ""}</span>`;
      })
      .join("");
    const legend = states
      .map((s) => `<li><i class="dt-swatch dt-fs--${attr(s.id)}" aria-hidden="true"></i><span>${esc(s.label)}</span><strong>${nf(s.count)}</strong></li>`)
      .join("");
    const util = f.utilizationPct == null ? "—" : `${f.utilizationPct} %`;
    const nav = m.access.vehicles ? `<button type="button" class="dt-link" data-action="dash-nav" data-target-view="transport-vehicles">Ver camiones<span aria-hidden="true"> →</span></button>` : "";
    return `<section class="dt-card dt-fleet" data-testid="dt-fleet" aria-labelledby="dt-fleet-title">
      ${cardHead("Estado de la flota", `${plural(total, "camión registrado", "camiones registrados")}`, nav, "dt-fleet-title", "truck")}
      <div class="dt-fbar">${blocks}</div>
      <ul class="dt-legend">${legend}</ul>
      <dl class="dt-facts">
        <div><dt>Utilización de la flota operativa</dt><dd>${esc(util)}</dd></div>
        <div><dt>Disponibles para asignar</dt><dd>${nf(f.available)}</dd></div>
      </dl>
    </section>`;
  }

  /** Avance del día: servicios entregados frente a los que están en curso o programados. */
  function buildDayProgress(m) {
    const c = m.board.counts;
    const total = c.done + c.route + c.assigned;
    const pct = total > 0 ? Math.round((c.done / total) * 100) : 0;
    const body = total > 0
      ? `<div class="dt-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Avance del día"><i style="width:${pct}%"></i></div>
         <dl class="dt-facts">
           <div><dt>Entregados</dt><dd>${nf(c.done)}</dd></div>
           <div><dt>En ruta</dt><dd>${nf(c.route)}</dd></div>
           <div><dt>Programados</dt><dd>${nf(c.assigned)}</dd></div>
         </dl>`
      : emptyState("Aún no hay servicios programados ni en curso para hoy.");
    return `<section class="dt-card dt-day" data-testid="dt-day" aria-labelledby="dt-day-title">
      ${cardHead("Avance del día", total > 0 ? `${nf(c.done)} de ${plural(total, "servicio", "servicios")} entregados` : "", total > 0 ? `<strong class="dt-bignum">${pct} %</strong>` : "", "dt-day-title", "activity")}
      ${body}
    </section>`;
  }

  /* ───────────────────────── viajes de hoy ───────────────────────── */

  function boardRowHtml(r, isClient) {
    const tone = r.delayed ? "late" : STATUS_TONE[r.slug] || "plan";
    const route = [r.origin, r.destination].filter(Boolean).join(" → ") || "Ruta sin definir";
    const vehicle = r.plate
      ? `<strong>${esc(r.plate)}</strong><span>${esc(r.driver || "Sin conductor")}</span>`
      : `<span class="dt-muted">Sin asignar</span>`;
    const search = [r.number, r.client, route, r.plate, r.driver].join(" ").toLowerCase();
    const prog = r.progress == null
      ? ""
      : `<span class="dt-prog${r.delayed ? " dt-prog--late" : ""}" role="img" aria-label="Avance por tiempo: ${r.progress} %" title="Avance por tiempo entre la recogida y la entrega estimada: ${r.progress} %"><i style="width:${r.progress}%"></i></span>`;
    const eta = r.delayed
      ? `<span class="dt-eta">${esc(r.etaLabel)}</span>${prog}<span class="dt-chip dt-chip--late">Retraso ${esc(minutesLabel(r.lateMin))}</span>`
      : `<span class="dt-eta">${esc(r.bucket === "done" ? "Entregado" : r.etaLabel)}</span>${prog}`;
    return `<tr class="dt-row${r.delayed ? " dt-row--late" : ""}" data-bucket="${attr(r.bucket)}" data-late="${r.delayed ? "1" : "0"}" data-search="${attr(search)}">
      <td><button type="button" class="dt-link dt-link--id" data-action="detail" data-id="${attr(r.id)}">${esc(r.number)}</button></td>
      <td class="dt-cell-main">${isClient
        ? `<strong title="${attr(route)}">${esc(route)}</strong>`
        : `<strong title="${attr(r.client)}">${esc(r.client)}</strong><span title="${attr(route)}">${esc(route)}</span>`}</td>
      <td class="dt-cell-stack">${vehicle}</td>
      <td><span class="dt-state dt-state--${attr(tone)}"><i aria-hidden="true"></i>${esc(r.delayed ? "Retrasado" : statusLabel(r.slug, r.status))}</span></td>
      <td class="dt-cell-eta">${eta}</td>
    </tr>`;
  }

  function buildBoard(m) {
    const { rows, counts } = m.board;
    const tabs = BOARD_TABS.map((t) => {
      const n = t.id === "all" ? counts.all : t.id === "late" ? counts.late : counts[t.id] || 0;
      const active = t.id === ui.boardFilter;
      return `<button type="button" role="tab" class="dt-tab${active ? " is-active" : ""}" data-action="dash-board-filter" data-filter="${attr(t.id)}" aria-selected="${active}" tabindex="${active ? 0 : -1}">${esc(t.label)}<em>${nf(n)}</em></button>`;
    }).join("");
    const visible = rows.slice(0, BOARD_VISIBLE_ROWS);
    const body = visible.length
      ? `<div class="dt-table-wrap"><table class="dt-table">
          <caption class="dt-sr">Viajes en curso y pendientes, ordenados por urgencia</caption>
          <thead><tr><th scope="col">Solicitud</th><th scope="col">${m.isClient ? "Ruta" : "Cliente y ruta"}</th><th scope="col">Vehículo y conductor</th><th scope="col">Estado</th><th scope="col">Entrega estimada</th></tr></thead>
          <tbody id="dt-board-body">${visible.map((r) => boardRowHtml(r, m.isClient)).join("")}</tbody>
        </table></div>`
      : emptyState(m.isClient ? "No tiene viajes en curso en este momento." : "No hay viajes en curso ni pendientes por asignar. Los nuevos aparecerán aquí.");
    const more = rows.length > BOARD_VISIBLE_ROWS && (m.access.trips || m.isClient)
      ? `<footer class="dt-card__foot"><span>Mostrando ${BOARD_VISIBLE_ROWS} de ${rows.length}</span><button type="button" class="dt-link" data-action="dash-nav" data-target-view="${m.isClient ? "requests" : "transport-trips"}">Ver todos<span aria-hidden="true"> →</span></button></footer>`
      : "";
    const search = `<label class="dt-search"><span class="dt-sr">Buscar viaje</span>${icon("search")}<input id="dt-board-search" type="search" placeholder="Placa, cliente o ruta" value="${attr(ui.boardQuery)}" autocomplete="off"></label>`;
    return `<section class="dt-card dt-board" id="dt-board" data-testid="dt-board" aria-labelledby="dt-board-title">
      ${cardHead(m.isClient ? "Mis viajes" : "Viajes de hoy", m.isClient ? "En curso y entregados hoy" : "En curso, programados y pendientes de asignar", search, "dt-board-title", "map")}
      <div class="dt-tabs" role="tablist" aria-label="Filtrar viajes" id="dt-board-tabs">${tabs}</div>
      ${body}
      <p class="dt-empty dt-empty--filter" id="dt-board-empty" hidden>Ningún viaje coincide con el filtro o la búsqueda.</p>
      ${more}
    </section>`;
  }

  /* ───────────────────────── vencimientos ───────────────────────── */

  const EXPIRY_TABS = [
    { id: "all", label: "Todos" },
    { id: "vehicle", label: "Vehículos" },
    { id: "driver", label: "Conductores" },
    { id: "staff", label: "Personal" }
  ];
  const EXPIRY_VIEW = { vehicle: "transport-vehicles", driver: "transport-drivers", staff: "labor-compliance" };

  function expiryStateHtml(item) {
    const d = item.days;
    const text = d < 0 ? `Venció hace ${plural(Math.abs(d), "día", "días")}` : d === 0 ? "Vence hoy" : d === 1 ? "Vence mañana" : `Vence en ${plural(d, "día", "días")}`;
    return `<span class="dt-state dt-state--${item.tone === "alert" ? "late" : "warn"}"><i aria-hidden="true"></i>${esc(text)}</span>`;
  }

  function buildExpirations(m) {
    const ex = m.expirations;
    if (!ex) return "";
    const items = ex.items.filter((i) => ui.expiryTab === "all" || i.kind === ui.expiryTab);
    const present = EXPIRY_TABS.filter((t) => t.id === "all" || ex.items.some((i) => i.kind === t.id));
    if (!present.some((t) => t.id === ui.expiryTab)) ui.expiryTab = "all";
    const tabs = present
      .map((t) => {
        const n = t.id === "all" ? ex.items.length : ex.items.filter((i) => i.kind === t.id).length;
        const active = t.id === ui.expiryTab;
        return `<button type="button" role="tab" class="dt-tab${active ? " is-active" : ""}" data-action="dash-expiry-tab" data-tab="${attr(t.id)}" aria-selected="${active}">${esc(t.label)}<em>${nf(n)}</em></button>`;
      })
      .join("");
    const rows = items.slice(0, EXPIRY_VISIBLE_ROWS);
    const t = ex.totals;
    const summary = `<dl class="dt-summary">
      <div><dt>Al día</dt><dd>${t.okPct == null ? "—" : `${t.okPct} %`}</dd></div>
      <div class="${t.expired ? "is-alert" : ""}"><dt>Vencidos</dt><dd>${nf(t.expired)}</dd></div>
      <div class="${t.soon ? "is-warn" : ""}"><dt>Por vencer (30 días)</dt><dd>${nf(t.soon)}</dd></div>
      ${t.unknown ? `<div><dt>Sin fecha registrada</dt><dd>${nf(t.unknown)}</dd></div>` : ""}
    </dl>`;
    const list = rows.length
      ? `<div class="dt-table-wrap"><table class="dt-table dt-table--compact">
          <caption class="dt-sr">Documentos y controles vencidos o por vencer</caption>
          <thead><tr><th scope="col">Elemento</th><th scope="col">Documento</th><th scope="col">Fecha</th><th scope="col">Estado</th></tr></thead>
          <tbody>${rows
            .map(
              (i) => `<tr>
              <td class="dt-cell-main"><strong>${esc(i.subject)}</strong><span>${esc(i.kind === "vehicle" ? "Vehículo" : i.kind === "driver" ? "Conductor" : "Colaborador")}</span></td>
              <td>${esc(i.what)}</td>
              <td>${esc(dayShort(i.ymd))}</td>
              <td>${expiryStateHtml(i)}</td>
            </tr>`
            )
            .join("")}</tbody>
        </table></div>`
      : emptyState(ex.items.length ? "Sin vencimientos en esta categoría." : "Sin documentos vencidos ni por vencer en los próximos 30 días.", ex.items.length ? "" : "ok");
    const hidden = items.length - rows.length;
    const target = ui.expiryTab !== "all" ? EXPIRY_VIEW[ui.expiryTab] : "";
    const foot = hidden > 0
      ? `<footer class="dt-card__foot"><span>${plural(hidden, "vencimiento más", "vencimientos más")}</span>${target ? `<button type="button" class="dt-link" data-action="dash-nav" data-target-view="${attr(target)}">Ver todos<span aria-hidden="true"> →</span></button>` : ""}</footer>`
      : "";
    return `<section class="dt-card dt-exp" data-testid="dt-expirations" id="dt-expirations" aria-labelledby="dt-exp-title">
      ${cardHead("Vencimientos próximos", "SOAT, tecnomecánica, licencias y exámenes", "", "dt-exp-title", "shield")}
      ${summary}
      <div class="dt-tabs" role="tablist" aria-label="Filtrar vencimientos">${tabs}</div>
      ${list}
      ${foot}
    </section>`;
  }

  /* ───────────────────────── personas y comercial ───────────────────────── */

  function factRow(label, value, tone = "") {
    return `<div${tone ? ` class="is-${tone}"` : ""}><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
  }

  function buildSideCards(m) {
    if (m.isClient) return "";
    const cards = [];
    const p = m.people;
    if (p && (p.hiring || p.contracts.length)) {
      const rows = [];
      if (p.hiring) {
        rows.push(factRow("Vacantes abiertas", nf(p.hiring.openVacancies)));
        rows.push(factRow("Candidatos en proceso", nf(p.hiring.candidatesInProcess)));
        if (p.hiring.candidatesToReview) rows.push(factRow("Por revisar o preseleccionar", nf(p.hiring.candidatesToReview), "warn"));
      }
      rows.push(factRow("Contratos por vencer (30 días)", nf(p.contracts.length), p.contracts.length ? "warn" : ""));
      const nav = p.hiring
        ? `<button type="button" class="dt-link" data-action="dash-nav" data-target-view="hiring">Contratación<span aria-hidden="true"> →</span></button>`
        : `<button type="button" class="dt-link" data-action="dash-nav" data-target-view="payroll">Gestión humana<span aria-hidden="true"> →</span></button>`;
      cards.push(`<section class="dt-card dt-mini" data-testid="dt-people" aria-labelledby="dt-people-title">${cardHead("Talento humano", "", nav, "dt-people-title", "users")}<dl class="dt-facts">${rows.join("")}</dl></section>`);
    }
    const c = m.commercial;
    if (c) {
      const rows = [];
      if (c.leads != null) rows.push(factRow("Prospectos web (7 días)", nf(c.leads), c.leads ? "warn" : ""));
      rows.push(factRow(`Clientes con servicios (${m.period.label.toLowerCase()})`, nf(c.activeClients)));
      if (m.finance && m.perf.clients.count > 1) rows.push(factRow("Ingresos del cliente principal", `${m.perf.clients.top1Pct} %`, m.perf.clients.top1Pct >= 50 ? "warn" : ""));
      const nav = c.leads != null
        ? `<button type="button" class="dt-link" data-action="dash-nav" data-target-view="contact-leads">Prospectos<span aria-hidden="true"> →</span></button>`
        : "";
      cards.push(`<section class="dt-card dt-mini" data-testid="dt-commercial" aria-labelledby="dt-com-title">${cardHead("Comercial", "", nav, "dt-com-title", "briefcase")}<dl class="dt-facts">${rows.join("")}</dl></section>`);
    }
    return cards.join("");
  }

  /* ───────────────────────── resultados del periodo ───────────────────────── */

  function periodControl(m) {
    const periods = [
      { id: "today", label: "Hoy" },
      { id: "7d", label: "7 días" },
      { id: "30d", label: "30 días" },
      { id: "month", label: "Este mes" }
    ];
    return `<div class="dt-segctl" role="group" aria-label="Periodo de los resultados">${periods
      .map((p) => `<button type="button" class="${p.id === m.period.id ? "is-active" : ""}" data-action="dash-period" data-period="${attr(p.id)}" aria-pressed="${p.id === m.period.id}">${esc(p.label)}</button>`)
      .join("")}</div>`;
  }

  function buildTiles(m) {
    const cur = m.perf.current;
    const prev = m.perf.previous;
    const d = m.perf.deltas;
    const cmp = `vs ${rangeLabel(m.period.prevFrom, m.period.prevTo)}`;
    const onTime = cur.onTimePct;
    const tone = onTime == null ? "" : onTime >= m.onTimeTarget ? "ok" : onTime >= m.onTimeTarget - 10 ? "warn" : "alert";
    const tiles = [];
    const sr = m.perf.series;
    const dayPct = sr.days.map((_d, i) => {
      const n = sr.ontime[i] + sr.late[i];
      return n > 0 ? Math.round((sr.ontime[i] / n) * 100) : null;
    });
    tiles.push(
      tile({
        ico: "clock",
        spark: sparkline(dayPct, "Tendencia diaria de entregas a tiempo"),
        label: "Entregas a tiempo",
        value: onTime == null ? "—" : `${onTime} %`,
        delta: d.onTimePts == null ? `<span class="dt-delta dt-delta--flat">Sin base para comparar</span>` : deltaHtml(d.onTimePts, { unit: " pts", compareLabel: cmp }),
        hint: onTime == null
          ? "Aún no hay entregas con fecha para evaluar"
          : `<span class="dt-dot dt-dot--${tone}" aria-hidden="true"></span>Meta ${m.onTimeTarget} % · ${plural(cur.evaluated, "entrega evaluada", "entregas evaluadas")}`,
        testid: "dt-kpi-ontime"
      })
    );
    tiles.push(
      tile({
        ico: "check",
        spark: sparkline(sr.completed, "Tendencia diaria de servicios completados"),
        label: "Servicios completados",
        value: nf(cur.completed),
        delta: deltaHtml(d.completed, { compareLabel: cmp }),
        hint: `${plural(m.board.counts.route + m.board.counts.assigned, "viaje", "viajes")} en curso ahora`,
        testid: "dt-kpi-completed"
      })
    );
    if (m.finance) {
      tiles.push(
        tile({
          ico: "dollar",
          spark: sparkline(sr.revenue, "Tendencia diaria de ingresos"),
          label: m.isClient ? "Valor de fletes" : "Ingresos por fletes",
          value: copCompact(cur.revenue),
          delta: deltaHtml(d.revenue, { compareLabel: cmp }),
          hint: cur.inProgressValue > 0 ? `${esc(copCompact(cur.inProgressValue))} más en curso por completar` : "Servicios completados en el periodo",
          testid: "dt-kpi-revenue"
        })
      );
      if (!m.isClient) {
        tiles.push(
          tile({
            ico: "activity",
            spark: sparkline(sr.revenue.map((v, i) => v - sr.cost[i]), "Tendencia diaria del resultado operativo"),
            label: "Resultado operativo",
            value: copCompact(cur.result),
            delta: deltaHtml(pctChangeSafe(cur.result, prev.result), { compareLabel: cmp }),
            hint: cur.marginPct == null ? "Combustible y taller del periodo" : `Margen ${cur.marginPct} % · antes de nómina y otros gastos`,
            testid: "dt-kpi-result"
          })
        );
      }
    }
    return `<div class="dt-tiles">${tiles.join("")}</div>`;
  }

  function chartCard({ id, title, sub, legend = [], tableHtml, hasData, emptyText, ico = "" }) {
    const legendHtml = legend.length >= 2
      ? `<ul class="dt-legend dt-legend--inline">${legend.map((l) => `<li><i class="dt-key${l.line ? " dt-key--line" : ""}" style="--k:${attr(l.css)}" aria-hidden="true"></i>${esc(l.label)}</li>`).join("")}</ul>`
      : "";
    const toggle = hasData ? `<button type="button" class="dt-link" data-action="dash-chart-table" data-target="${attr(id)}" aria-pressed="false">Ver tabla</button>` : "";
    return `<article class="dt-card dt-chart" data-testid="${attr(id)}-card">
      ${cardHead(title, sub, toggle, "", ico)}
      ${hasData
        ? `${legendHtml}<div class="dt-chart__plot"><canvas id="${attr(id)}" role="img" aria-label="${attr(`${title}. ${sub}`)}"></canvas></div>
           <div class="dt-chart__table" id="${attr(id)}-table" hidden>${tableHtml}</div>`
        : emptyState(emptyText)}
    </article>`;
  }

  function seriesTable(headers, rows) {
    return `<div class="dt-table-wrap dt-table-wrap--short" tabindex="0" role="region" aria-label="Datos de la gráfica"><table class="dt-table dt-table--compact">
      <thead><tr>${headers.map((h, i) => `<th scope="col"${i ? ' class="dt-num"' : ""}>${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="dt-num"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
  }

  function buildCharts(m) {
    const s = m.perf.series;
    const out = [];
    const hasDeliveries = s.ontime.some(Boolean) || s.late.some(Boolean);
    out.push(
      chartCard({
        id: "dt-chart-ontime",
        ico: "clock",
        title: "Entregas por día",
        sub: `A tiempo y con retraso · ${rangeLabel(s.days[0], s.days[s.days.length - 1])}`,
        legend: [{ label: "A tiempo", css: "var(--dt-s1)" }, { label: "Con retraso", css: "var(--dt-late)" }],
        hasData: hasDeliveries,
        emptyText: "Aún no hay entregas con fecha estimada y real para evaluar en estos días.",
        tableHtml: seriesTable(["Día", "A tiempo", "Con retraso"], s.days.map((d, i) => [dayLong(d), nf(s.ontime[i]), nf(s.late[i])]))
      })
    );
    if (m.finance) {
      const hasMoney = s.revenue.some(Boolean) || s.cost.some(Boolean);
      out.push(
        chartCard({
          id: "dt-chart-money",
          ico: "dollar",
          title: m.isClient ? "Fletes por día" : "Ingresos y costos por día",
          sub: m.isClient ? "Servicios completados" : "Ingresos por fletes frente a combustible y taller",
          legend: m.isClient ? [] : [{ label: "Ingresos", css: "var(--dt-s1)", line: true }, { label: "Costos", css: "var(--dt-s2)", line: true }],
          hasData: hasMoney,
          emptyText: "Sin ingresos ni costos registrados en estos días.",
          tableHtml: seriesTable(
            m.isClient ? ["Día", "Fletes"] : ["Día", "Ingresos", "Costos"],
            s.days.map((d, i) => (m.isClient ? [dayLong(d), cop(s.revenue[i])] : [dayLong(d), cop(s.revenue[i]), cop(s.cost[i])]))
          )
        })
      );
    }
    return `<div class="dt-grid dt-grid--2">${out.join("")}</div>`;
  }

  function buildClients(m) {
    const cl = m.perf.clients;
    const sub = cl.count > 1 ? `Los 3 principales concentran el ${cl.top3Pct} % de los ingresos` : "Ingresos por cliente en el periodo";
    let body;
    if (!cl.rows.length) {
      body = emptyState("Aún no hay servicios completados en el periodo.");
    } else {
      const max = Math.max(...cl.rows.map((r) => r.value), 1);
      body = `<ol class="dt-rank">${cl.rows
        .map((r) => {
          const share = cl.total > 0 ? Math.round((r.value / cl.total) * 100) : 0;
          const label = `${r.label}: ${cop(r.value)} (${share} % del total)`;
          return `<li class="dt-rank__row${r.other ? " dt-rank__row--other" : ""}" tabindex="0" title="${attr(label)}" aria-label="${attr(label)}">
            <span class="dt-rank__name">${esc(r.label)}</span>
            <span class="dt-rank__bar" aria-hidden="true"><i style="width:${Math.max(2, Math.round((r.value / max) * 100))}%"></i></span>
            <span class="dt-rank__val">${esc(copCompact(r.value))}</span>
          </li>`;
        })
        .join("")}</ol>`;
    }
    return `<article class="dt-card dt-clients" data-testid="dt-clients">${cardHead("Ingresos por cliente", sub, "", "", "building")}${body}</article>`;
  }

  function resultRow(label, current, previous, { goodUp = true, strong = false, format = copCompact } = {}) {
    const change = pctChangeSafe(current, previous);
    return `<tr${strong ? ' class="is-strong"' : ""}>
      <th scope="row">${esc(label)}</th>
      <td class="dt-num">${esc(format(current))}</td>
      <td class="dt-num dt-muted">${esc(format(previous))}</td>
      <td class="dt-num">${deltaHtml(change, { goodUp, showRef: false })}</td>
    </tr>`;
  }

  function buildResultTable(m) {
    const c = m.perf.current;
    const p = m.perf.previous;
    const pct = (v) => (v == null ? "—" : `${v} %`);
    return `<article class="dt-card dt-pl" data-testid="dt-result-table">
      ${cardHead("Resultado operativo", `${rangeLabel(m.period.from, m.period.to)} frente a ${rangeLabel(m.period.prevFrom, m.period.prevTo)}`, "", "", "dollar")}
      <div class="dt-table-wrap" tabindex="0" role="region" aria-label="Resultado operativo frente al periodo anterior"><table class="dt-table dt-table--compact">
        <thead><tr><th scope="col">Concepto</th><th scope="col" class="dt-num">Periodo</th><th scope="col" class="dt-num">Anterior</th><th scope="col" class="dt-num">Cambio</th></tr></thead>
        <tbody>
          ${resultRow("Ingresos por fletes", c.revenue, p.revenue)}
          ${resultRow("Combustible", c.fuelCost, p.fuelCost, { goodUp: false })}
          ${resultRow("Taller y mantenimiento", c.maintCost, p.maintCost, { goodUp: false })}
          ${resultRow("Resultado operativo", c.result, p.result, { strong: true })}
          <tr><th scope="row">Margen</th><td class="dt-num">${esc(pct(c.marginPct))}</td><td class="dt-num dt-muted">${esc(pct(p.marginPct))}</td><td class="dt-num"></td></tr>
        </tbody>
      </table></div>
      <p class="dt-note">No incluye nómina, peajes ni otros gastos: es el resultado de las operaciones registradas (fletes menos combustible y taller).</p>
    </article>`;
  }

  function buildResults(m) {
    const head = `<div class="dt-section__head">
      <div><h3>Resultados</h3><p>${esc(rangeLabel(m.period.from, m.period.to))} · comparado con ${esc(rangeLabel(m.period.prevFrom, m.period.prevTo))}</p></div>
      ${periodControl(m)}
    </div>`;
    const lower = m.finance && !m.isClient
      ? `<div class="dt-grid dt-grid--2">${buildClients(m)}${buildResultTable(m)}</div>`
      : "";
    return `<section class="dt-section" id="dt-results" data-testid="dt-results" aria-label="Resultados del periodo">
      ${head}
      ${buildTiles(m)}
      ${buildCharts(m)}
      ${lower}
    </section>`;
  }

  /* ───────────────────────── vista principal ───────────────────────── */

  function viewDashboard() {
    const user = currentUser();
    const DD = dashDomain();
    if (!DD?.computeControlTower) {
      return `<section class="dashboard-studio dt-root"><p class="dt-empty">El dashboard no está disponible: falta cargar el módulo de datos.</p></section>`;
    }
    const model = DD.computeControlTower(user, { period: ui.period });
    lastModel = model;
    const scopeBar = model.isClient && typeof clientDataScopeBarHtml === "function"
      ? `<div class="dt-scope">${clientDataScopeBarHtml(getClientDataScope())}</div>`
      : "";
    const side = buildSideCards(model);
    const exp = buildExpirations(model);

    if (model.isClient) {
      return `<section class="dashboard-studio dt-root dt-root--client" id="dashboard-root" data-testid="dashboard">
        ${scopeBar}${buildHeader(model, user)}
        ${buildPulse(model)}
        <div class="dt-grid dt-grid--now">${buildAttention(model)}${buildDayProgress(model)}</div>
        ${buildBoard(model)}
        ${buildResults(model)}
      </section>`;
    }

    return `<section class="dashboard-studio dt-root" id="dashboard-root" data-testid="dashboard">
      ${buildHeader(model, user)}
      ${buildPulse(model)}
      <div class="dt-grid dt-grid--now">${buildAttention(model)}<div class="dt-stack">${buildFleet(model)}${buildDayProgress(model)}</div></div>
      ${buildBoard(model)}
      ${exp || side ? `<div class="dt-grid dt-grid--aside">${exp}${side ? `<div class="dt-stack">${side}</div>` : ""}</div>` : ""}
      ${buildResults(model)}
    </section>`;
  }

  /* ───────────────────────── gráficas ───────────────────────── */

  function destroyCharts() {
    charts.forEach((c) => {
      try {
        c.destroy();
      } catch (_e) {
        /* noop */
      }
    });
    charts = [];
  }

  /** Las gráficas se pintan en canvas: el traductor del DOM no las alcanza, así que se traducen aquí. */
  function tr(text) {
    const i18n = window.PortalI18n;
    return i18n && typeof i18n.getLang === "function" && i18n.getLang() === "en" ? i18n.t(String(text)) : String(text);
  }

  function cssVar(root, name, fallback) {
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    return v || fallback;
  }

  /** Línea vertical que sigue al puntero (el cursor encuentra la fecha, no el punto). */
  const crosshairPlugin = {
    id: "dtCrosshair",
    afterDatasetsDraw(chart, _args, opts) {
      const active = chart.tooltip?.getActiveElements?.() || [];
      if (!active.length) return;
      const x = active[0].element.x;
      const { top, bottom } = chart.chartArea;
      const ctx = chart.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = opts?.color || "rgba(120,130,150,.5)";
      ctx.stroke();
      ctx.restore();
    }
  };

  function showChartTablesInstead(root) {
    root.querySelectorAll(".dt-chart__table").forEach((t) => (t.hidden = false));
    root.querySelectorAll(".dt-chart__plot").forEach((p) => (p.hidden = true));
  }

  function wireCharts(root, m) {
    destroyCharts();
    const canvasOntime = root.querySelector("#dt-chart-ontime");
    const canvasMoney = root.querySelector("#dt-chart-money");
    if (!canvasOntime && !canvasMoney) return;
    const loader = typeof loadChartJsLib === "function" ? loadChartJsLib : null;
    if (!loader) {
      showChartTablesInstead(root);
      return;
    }
    const s = m.perf.series;
    const labels = s.days.map((d) => tr(dayShort(d)));
    const titles = s.days.map((d) => tr(dayLong(d)));

    loader()
      .then((Chart) => {
        if (String(state.currentView || "") !== "dashboard" || !root.isConnected) return;
        destroyCharts();
        const surface = cssVar(root, "--dt-surface", "#ffffff");
        const ink = cssVar(root, "--dt-ink", "#12233f");
        const ink2 = cssVar(root, "--dt-ink-2", "#51627c");
        const ink3 = cssVar(root, "--dt-ink-3", "#8794a8");
        const grid = cssVar(root, "--dt-grid", "#e5eaf1");
        const s1 = cssVar(root, "--dt-s1", "#377cc0");
        const s2 = cssVar(root, "--dt-s2", "#eb6834");
        const late = cssVar(root, "--dt-late", "#d03b3b");
        const font = { family: "'Montserrat', system-ui, sans-serif", size: 11, weight: "500" };
        const tooltip = {
          backgroundColor: surface,
          titleColor: ink,
          bodyColor: ink2,
          borderColor: grid,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          boxWidth: 12,
          boxHeight: 3,
          titleFont: { ...font, weight: "600" },
          bodyFont: font,
          callbacks: { title: (items) => titles[items[0]?.dataIndex] || "" }
        };
        const scalesFor = (stacked, yTicks) => ({
          x: { stacked, grid: { display: false }, border: { color: grid }, ticks: { color: ink3, font, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
          y: { stacked, beginAtZero: true, grid: { color: grid, lineWidth: 1 }, border: { display: false }, ticks: { color: ink3, font, maxTicksLimit: 5, ...yTicks } }
        });
        const base = {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 240 },
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { display: false }, tooltip, dtCrosshair: { color: ink3 } }
        };

        if (canvasOntime) {
          const bar = (label, data, color) => ({
            label,
            data,
            backgroundColor: color,
            borderColor: surface,
            borderWidth: { top: 2, right: 0, bottom: 0, left: 0 },
            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: "bottom",
            maxBarThickness: 24
          });
          charts.push(
            new Chart(canvasOntime, {
              type: "bar",
              data: { labels, datasets: [bar(tr("A tiempo"), s.ontime, s1), bar(tr("Con retraso"), s.late, late)] },
              options: { ...base, scales: scalesFor(true, { precision: 0 }) },
              plugins: [crosshairPlugin]
            })
          );
        }

        if (canvasMoney) {
          const line = (label, data, color, fill) => ({
            label,
            data,
            borderColor: color,
            backgroundColor: fill ? `${color}1a` : color,
            fill: Boolean(fill),
            borderWidth: 2,
            tension: 0.25,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: surface,
            pointHoverBorderWidth: 2
          });
          const datasets = m.isClient
            ? [line(tr("Fletes"), s.revenue, s1, true)]
            : [line(tr("Ingresos"), s.revenue, s1, false), line(tr("Costos"), s.cost, s2, false)];
          charts.push(
            new Chart(canvasMoney, {
              type: "line",
              data: { labels, datasets },
              options: {
                ...base,
                plugins: {
                  ...base.plugins,
                  tooltip: { ...tooltip, callbacks: { ...tooltip.callbacks, label: (ctx) => ` ${ctx.dataset.label}: ${cop(ctx.parsed.y)}` } }
                },
                scales: scalesFor(false, { callback: (v) => copCompact(v) })
              },
              plugins: [crosshairPlugin]
            })
          );
        }
      })
      .catch(() => showChartTablesInstead(root));
  }

  /* ───────────────────────── interacción ───────────────────────── */

  function applyBoardFilter(root) {
    const body = root.querySelector("#dt-board-body");
    if (!body) return;
    const q = ui.boardQuery.trim().toLowerCase();
    let shown = 0;
    body.querySelectorAll("tr").forEach((tr) => {
      const bucket = tr.dataset.bucket;
      const isLate = tr.dataset.late === "1";
      const byTab = ui.boardFilter === "all" || (ui.boardFilter === "late" ? isLate : bucket === ui.boardFilter);
      const byText = !q || String(tr.dataset.search || "").includes(q);
      const show = byTab && byText;
      tr.hidden = !show;
      if (show) shown += 1;
    });
    const empty = root.querySelector("#dt-board-empty");
    if (empty) empty.hidden = shown > 0;
    const wrap = body.closest(".dt-table-wrap");
    if (wrap) wrap.hidden = shown === 0;
    root.querySelectorAll("#dt-board-tabs .dt-tab").forEach((tab) => {
      const active = tab.dataset.filter === ui.boardFilter;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
  }

  function replaceSection(root, selector, html) {
    const el = root.querySelector(selector);
    if (!el) return null;
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const next = tmp.firstElementChild;
    if (!next) return null;
    el.replaceWith(next);
    return next;
  }

  function refreshResults(root) {
    const DD = dashDomain();
    if (!DD?.computeControlTower) return;
    const model = DD.computeControlTower(currentUser(), { period: ui.period });
    lastModel = model;
    destroyCharts();
    replaceSection(root, "#dt-results", buildResults(model));
    wireCharts(root, model);
  }

  function refreshExpirations(root) {
    if (!lastModel) return;
    replaceSection(root, "#dt-expirations", buildExpirations(lastModel));
  }

  /** Recalcula todo y vuelve a pintar manteniendo filtros y posición. */
  function refreshAll() {
    const root = nodes?.viewRoot?.querySelector(".dashboard-studio");
    if (!root || String(state.currentView || "") !== "dashboard") return;
    const scroller = root.closest(".portal-main") || document.scrollingElement;
    const top = scroller ? scroller.scrollTop : 0;
    destroyCharts();
    const tmp = document.createElement("div");
    tmp.innerHTML = viewDashboard();
    const next = tmp.firstElementChild;
    if (!next) return;
    root.replaceWith(next);
    bindDashboardControls();
    if (scroller) scroller.scrollTop = top;
  }

  function stopAutoRefresh() {
    if (refreshTimer) window.clearInterval(refreshTimer);
    refreshTimer = null;
  }

  function startAutoRefresh() {
    stopAutoRefresh();
    refreshTimer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || String(state.currentView || "") !== "dashboard") return;
      const root = nodes?.viewRoot?.querySelector(".dashboard-studio");
      if (!root) return;
      const active = document.activeElement;
      if (active && root.contains(active) && /^(INPUT|SELECT|TEXTAREA)$/.test(active.tagName)) return;
      if (document.querySelector(".modal:not(.hidden), [role='dialog'][open], details[open]")) return;
      refreshAll();
    }, REFRESH_MS);
  }

  /** Al cambiar entre tema claro y oscuro las gráficas se vuelven a pintar con los colores del tema. */
  function watchTheme(root) {
    if (themeObserver) themeObserver.disconnect();
    themeObserver = new MutationObserver(() => {
      if (lastModel && root.isConnected && String(state.currentView || "") === "dashboard") wireCharts(root, lastModel);
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-portal-lang"] });
  }

  function bindDashboardControls() {
    if (String(state.currentView || "") !== "dashboard" || !nodes.viewRoot) return;
    const root = nodes.viewRoot.querySelector(".dashboard-studio");
    if (!root || !lastModel) return;

    wireCharts(root, lastModel);
    watchTheme(root);
    applyBoardFilter(root);
    startAutoRefresh();

    root.addEventListener("input", (event) => {
      if (event.target?.id === "dt-board-search") {
        ui.boardQuery = String(event.target.value || "");
        applyBoardFilter(root);
      }
    });

    root.addEventListener("keydown", (event) => {
      const tab = event.target.closest?.("#dt-board-tabs .dt-tab");
      if (!tab) return;
      const tabs = [...root.querySelectorAll("#dt-board-tabs .dt-tab")];
      const i = tabs.indexOf(tab);
      let n = i;
      if (event.key === "ArrowRight") n = (i + 1) % tabs.length;
      else if (event.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") n = 0;
      else if (event.key === "End") n = tabs.length - 1;
      else return;
      event.preventDefault();
      ui.boardFilter = tabs[n].dataset.filter || "all";
      applyBoardFilter(root);
      tabs[n].focus();
    });

    root.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-action]");
      if (!btn || !root.contains(btn)) return;
      const action = String(btn.dataset.action || "");
      if (!action.startsWith("dash-")) return;
      if (action === "dash-nav") {
        const target = String(btn.dataset.targetView || "").trim();
        if (target) setView(target);
      } else if (action === "dash-scroll") {
        root.querySelector(`#${btn.dataset.target || ""}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (action === "dash-refresh") {
        refreshAll();
      } else if (action === "dash-period") {
        ui.period = String(btn.dataset.period || "7d");
        refreshResults(root);
      } else if (action === "dash-board-filter") {
        ui.boardFilter = String(btn.dataset.filter || "") || "all";
        applyBoardFilter(root);
        if (btn.closest(".dt-attn")) root.querySelector("#dt-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (action === "dash-expiry-tab") {
        ui.expiryTab = String(btn.dataset.tab || "all");
        refreshExpirations(root);
      } else if (action === "dash-chart-table") {
        const id = btn.dataset.target;
        const table = root.querySelector(`#${id}-table`);
        const plot = root.querySelector(`#${id}`)?.closest(".dt-chart__plot");
        const legend = btn.closest(".dt-chart")?.querySelector(".dt-legend");
        if (!table || !plot) return;
        const showTable = table.hidden;
        table.hidden = !showTable;
        plot.hidden = showTable;
        if (legend) legend.hidden = showTable;
        btn.textContent = showTable ? "Ver gráfica" : "Ver tabla";
        btn.setAttribute("aria-pressed", String(showTable));
      }
    });
  }

  /* ───────────────────────── registro ───────────────────────── */

  if (typeof window.registerLegacyPortalViews === "function") {
    window.registerLegacyPortalViews({ viewDashboard });
  } else {
    window.AppLegacyViews = window.AppLegacyViews || {};
    Object.assign(window.AppLegacyViews, { viewDashboard });
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.dashboard = bindDashboardControls;

  window.__portalModuleBeforeLeave = window.__portalModuleBeforeLeave || {};
  window.__portalModuleBeforeLeave.dashboard = function dashLeave() {
    stopAutoRefresh();
    destroyCharts();
    if (themeObserver) themeObserver.disconnect();
    themeObserver = null;
  };
})();
