/**
 * Calendario y selector de hora personalizados para formularios de creación (solicitudes).
 * Sincroniza inputs ocultos `pickupDate` / `pickupTime` etc. para no romper el envío del formulario.
 */
import { colombiaTodayIsoDate, normalizePortalDateYmd } from "../core/utils.js";

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];
const WEEKDAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const HOUR12_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIOD_OPTIONS = ["AM", "PM"];
const DRUM_PAD_ROWS = 2;

function snapMinuteValue(rawMinute) {
  const m = Math.min(59, Math.max(0, parseInt(String(rawMinute || "0"), 10) || 0));
  return String(m).padStart(2, "0");
}

function parsePickerTimeParts(raw) {
  const s = String(raw || "").trim();
  let hour24 = 8;
  let minute = "00";
  const match = s.match(/^(\d{1,2}):(\d{1,2})/);
  if (match) {
    hour24 = Math.min(23, Math.max(0, parseInt(match[1], 10)));
    minute = snapMinuteValue(match[2]);
  }
  return hhmm24ToPickerState(`${String(hour24).padStart(2, "0")}:${minute}`);
}

/** Convierte HH:MM (24 h, almacenamiento/API) a estado del tambor 12 h. */
function hhmm24ToPickerState(hhmm) {
  const s = String(hhmm || "").trim();
  let hour24 = 8;
  let minute = "00";
  const match = s.match(/^(\d{1,2}):(\d{1,2})/);
  if (match) {
    hour24 = Math.min(23, Math.max(0, parseInt(match[1], 10)));
    minute = snapMinuteValue(match[2]);
  }
  let period = "AM";
  let hour12 = 12;
  if (hour24 === 0) {
    hour12 = 12;
    period = "AM";
  } else if (hour24 < 12) {
    hour12 = hour24;
    period = "AM";
  } else if (hour24 === 12) {
    hour12 = 12;
    period = "PM";
  } else {
    hour12 = hour24 - 12;
    period = "PM";
  }
  return {
    hour12: String(hour12).padStart(2, "0"),
    minute,
    period
  };
}

/** Estado del tambor → HH:MM 24 h para el input y PostgreSQL. */
function pickerStateToHhmm24(hour12, minute, period) {
  const h12 = Math.min(12, Math.max(1, parseInt(String(hour12 || "12"), 10) || 12));
  const m = snapMinuteValue(minute);
  const p = String(period || "AM").toUpperCase() === "PM" ? "PM" : "AM";
  let h24;
  if (p === "AM") {
    h24 = h12 === 12 ? 0 : h12;
  } else {
    h24 = h12 === 12 ? 12 : h12 + 12;
  }
  return `${String(h24).padStart(2, "0")}:${m}`;
}

function formatPickerStateLabel(hour12, minute, period) {
  const hhmm = pickerStateToHhmm24(hour12, minute, period);
  return formatTimeDisplay(hhmm) || `${hour12}:${minute} ${period === "PM" ? "p. m." : "a. m."}`;
}

function drumSpacerHtml() {
  return Array.from({ length: DRUM_PAD_ROWS }, () => '<div class="acf-drum__spacer" aria-hidden="true"></div>').join("");
}

function renderDrumColumn(kind, options, selected) {
  const label =
    kind === "hour" ? "Hora" : kind === "minute" ? "Minutos" : kind === "period" ? "a. m. / p. m." : "Valor";
  const items = options
    .map((opt) => {
      const value = typeof opt === "object" && opt != null ? String(opt.value ?? "") : String(opt);
      const text = typeof opt === "object" && opt != null ? String(opt.label ?? opt.value ?? "") : String(opt);
      const sel = value === selected;
      return `<button type="button" class="acf-drum__item${sel ? " is-selected" : ""}" data-acf-drum-kind="${kind}" data-acf-drum-value="${value}" role="option"${sel ? ' aria-selected="true"' : ""}>${text}</button>`;
    })
    .join("");
  return `<div class="acf-drum__column acf-drum__column--${kind}" data-acf-drum-column="${kind}" tabindex="0" role="listbox" aria-label="${label}">${drumSpacerHtml()}${items}${drumSpacerHtml()}</div>`;
}

function scrollDrumColumnToValue(column, value) {
  if (!column) return;
  const item = column.querySelector(`[data-acf-drum-value="${value}"]`);
  if (!item) return;
  column.scrollTop = item.offsetTop - (column.clientHeight - item.clientHeight) / 2;
}

function nearestDrumValue(column) {
  if (!column) return "";
  const centerY = column.scrollTop + column.clientHeight / 2;
  let best = null;
  let bestDist = Infinity;
  column.querySelectorAll(".acf-drum__item").forEach((btn) => {
    const mid = btn.offsetTop + btn.clientHeight / 2;
    const dist = Math.abs(mid - centerY);
    if (dist < bestDist) {
      bestDist = dist;
      best = btn;
    }
  });
  return best ? String(best.dataset.acfDrumValue || "") : "";
}

function highlightDrumColumn(column) {
  if (!column) return "";
  const value = nearestDrumValue(column);
  column.querySelectorAll(".acf-drum__item").forEach((btn) => {
    const match = String(btn.dataset.acfDrumValue || "") === value;
    btn.classList.toggle("is-selected", match);
    btn.setAttribute("aria-selected", match ? "true" : "false");
  });
  return value;
}

let openPickerEl = null;

function isoToParts(iso) {
  const ymd = normalizePortalDateYmd(iso);
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
}

function partsToIso(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDateDisplay(iso) {
  const p = isoToParts(iso);
  if (!p) return "";
  const dt = new Date(p.y, p.m, p.d, 12, 0, 0);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatTimeDisplay(hhmm) {
  const t = String(hhmm || "").trim().slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(t)) return "";
  const [h, m] = t.split(":").map((n) => parseInt(n, 10));
  const dt = new Date(2000, 0, 1, h, m);
  return dt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function readMinIso(input) {
  const raw = String(input?.dataset?.antaresDateMin || input?.min || "").trim();
  return normalizePortalDateYmd(raw) || colombiaTodayIsoDate();
}

function syncPickerDisplay(wrap) {
  const targetId = String(wrap.dataset.acfPickerTarget || "");
  const hidden = wrap.closest("form")?.querySelector(`#${CSS.escape(targetId)}`) || document.getElementById(targetId);
  if (!hidden) return;
  const kind = String(wrap.dataset.acfPicker || "");
  const value = String(hidden.value || "").trim();
  if (kind === "time" && hidden.type !== "hidden") {
    wrap.classList.toggle("acf-picker--filled", Boolean(value));
    return;
  }
  const display = wrap.querySelector("[data-acf-picker-display]");
  const placeholder = wrap.querySelector(".acf-picker__placeholder");
  if (!display) return;
  let label = "";
  if (kind === "date") label = formatDateDisplay(value);
  else if (kind === "time") label = formatTimeDisplay(value);
  if (label) {
    display.textContent = label;
    display.hidden = false;
    if (placeholder) placeholder.hidden = true;
    wrap.classList.add("acf-picker--filled");
  } else {
    display.textContent = "";
    display.hidden = true;
    if (placeholder) placeholder.hidden = false;
    wrap.classList.remove("acf-picker--filled");
  }
}

export function refreshAntaresSchedulePickerDisplay(root, targetId) {
  const scope = root || document;
  const id = String(targetId || "").trim();
  if (!id) return;
  scope.querySelectorAll(`[data-acf-picker-target="${id}"]`).forEach(syncPickerDisplay);
}

function closeOpenPicker() {
  if (!openPickerEl) return;
  const panel = openPickerEl.querySelector("[data-acf-picker-panel]");
  const trigger = openPickerEl.querySelector("[data-acf-picker-open]");
  panel?.setAttribute("hidden", "");
  trigger?.setAttribute("aria-expanded", "false");
  openPickerEl.classList.remove("acf-picker--open");
  openPickerEl = null;
}

/** Clic dentro del picker aunque el target ya no esté en el DOM (p. ej. tras `innerHTML`). */
function clickInsideOpenPicker(ev) {
  if (!openPickerEl) return false;
  const path = typeof ev.composedPath === "function" ? ev.composedPath() : [];
  if (path.includes(openPickerEl)) return true;
  const target = ev.target;
  if (target instanceof Node && openPickerEl.contains(target)) return true;
  return false;
}

function setHiddenValue(hidden, value) {
  if (!hidden) return;
  hidden.value = value;
  hidden.dispatchEvent(new Event("input", { bubbles: true }));
  hidden.dispatchEvent(new Event("change", { bubbles: true }));
}

function renderCalendarDays(state, minIso) {
  const { viewYear, viewMonth, selectedIso } = state;
  const minParts = isoToParts(minIso);
  const todayIso = colombiaTodayIsoDate();
  const first = new Date(viewYear, viewMonth, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startPad; i++) {
    cells.push(`<span class="acf-cal__day acf-cal__day--empty" aria-hidden="true"></span>`);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = partsToIso(viewYear, viewMonth, day);
    const disabled =
      minParts &&
      (viewYear < minParts.y ||
        (viewYear === minParts.y && viewMonth < minParts.m) ||
        (viewYear === minParts.y && viewMonth === minParts.m && day < minParts.d));
    const classes = [
      "acf-cal__day",
      iso === todayIso ? "acf-cal__day--today" : "",
      iso === selectedIso ? "is-selected" : "",
      disabled ? "is-disabled" : ""
    ]
      .filter(Boolean)
      .join(" ");
    cells.push(
      `<button type="button" class="${classes}" data-acf-cal-day="${iso}"${disabled ? " disabled" : ""} aria-label="${iso}">${day}</button>`
    );
  }
  return cells.join("");
}

function mountDatePicker(wrap) {
  if (!wrap || wrap.dataset.acfPickerMounted === "1") return;
  wrap.dataset.acfPickerMounted = "1";
  const targetId = String(wrap.dataset.acfPickerTarget || "");
  const form = wrap.closest("form");
  const hidden = form?.querySelector(`#${CSS.escape(targetId)}`) || document.getElementById(targetId);
  const panel = wrap.querySelector("[data-acf-picker-panel]");
  const trigger = wrap.querySelector("[data-acf-picker-open]");
  if (!hidden || !panel || !trigger) return;

  const state = {
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(),
    selectedIso: ""
  };

  const paint = () => {
    const minIso = readMinIso(hidden);
    const seed = normalizePortalDateYmd(hidden.value) || minIso;
    const parts = isoToParts(seed);
    if (parts) {
      state.viewYear = parts.y;
      state.viewMonth = parts.m;
      state.selectedIso = partsToIso(parts.y, parts.m, parts.d);
    }
    panel.innerHTML = `<div class="acf-cal">
      <header class="acf-cal__head">
        <button type="button" class="acf-cal__nav" data-acf-cal-prev aria-label="Mes anterior">‹</button>
        <div class="acf-cal__title">
          <strong>${MONTHS_ES[state.viewMonth]}</strong>
          <span>${state.viewYear}</span>
        </div>
        <button type="button" class="acf-cal__nav" data-acf-cal-next aria-label="Mes siguiente">›</button>
      </header>
      <div class="acf-cal__weekdays" aria-hidden="true">${WEEKDAYS_ES.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="acf-cal__grid" role="grid" aria-label="Días del mes">${renderCalendarDays(state, minIso)}</div>
      <footer class="acf-cal__foot">
        <button type="button" class="acf-cal__today" data-acf-cal-today>Hoy</button>
        <button type="button" class="acf-cal__clear" data-acf-cal-clear>Borrar</button>
      </footer>
    </div>`;
  };

  trigger.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (openPickerEl && openPickerEl !== wrap) closeOpenPicker();
    const isOpen = wrap.classList.contains("acf-picker--open");
    if (isOpen) {
      closeOpenPicker();
      return;
    }
    paint();
    panel.removeAttribute("hidden");
    trigger.setAttribute("aria-expanded", "true");
    wrap.classList.add("acf-picker--open");
    openPickerEl = wrap;
  });

  panel.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const btn = ev.target.closest("button");
    if (!btn || btn.disabled) return;
    const minIso = readMinIso(hidden);

    if (btn.hasAttribute("data-acf-cal-prev")) {
      state.viewMonth -= 1;
      if (state.viewMonth < 0) {
        state.viewMonth = 11;
        state.viewYear -= 1;
      }
      paint();
      return;
    }
    if (btn.hasAttribute("data-acf-cal-next")) {
      state.viewMonth += 1;
      if (state.viewMonth > 11) {
        state.viewMonth = 0;
        state.viewYear += 1;
      }
      paint();
      return;
    }
    if (btn.hasAttribute("data-acf-cal-today")) {
      const today = colombiaTodayIsoDate();
      if (today >= minIso) {
        setHiddenValue(hidden, today);
        syncPickerDisplay(wrap);
        closeOpenPicker();
      }
      return;
    }
    if (btn.hasAttribute("data-acf-cal-clear")) {
      setHiddenValue(hidden, "");
      syncPickerDisplay(wrap);
      closeOpenPicker();
      return;
    }
    const dayIso = btn.getAttribute("data-acf-cal-day");
    if (dayIso && dayIso >= minIso) {
      state.selectedIso = dayIso;
      setHiddenValue(hidden, dayIso);
      syncPickerDisplay(wrap);
      closeOpenPicker();
    }
  });

  hidden.addEventListener("change", () => syncPickerDisplay(wrap));
  syncPickerDisplay(wrap);
}

function mountTimePicker(wrap) {
  if (!wrap || wrap.dataset.acfPickerMounted === "1") return;
  wrap.dataset.acfPickerMounted = "1";
  const targetId = String(wrap.dataset.acfPickerTarget || "");
  const form = wrap.closest("form");
  const hidden = form?.querySelector(`#${CSS.escape(targetId)}`) || document.getElementById(targetId);
  const panel = wrap.querySelector("[data-acf-picker-panel]");
  const trigger = wrap.querySelector("[data-acf-picker-open]");
  if (!hidden || !panel || !trigger) return;

  let hour12 = "08";
  let minute = "00";
  let period = "AM";

  const seedFromInput = () => {
    const next = hhmm24ToPickerState(hidden.value);
    hour12 = next.hour12;
    minute = next.minute;
    period = next.period;
  };

  const periodDrumOptions = PERIOD_OPTIONS.map((p) => ({
    value: p,
    label: p === "PM" ? "p. m." : "a. m."
  }));

  const renderPanel = () => {
    const readoutLabel = formatPickerStateLabel(hour12, minute, period);
    panel.innerHTML = `<div class="acf-timepicker acf-timepicker--drum">
      <p class="acf-timepicker__drum-hint muted">Deslice o toque hora, minutos y a. m. / p. m.</p>
      <div class="acf-drum">
        <div class="acf-drum__frame">
          <div class="acf-drum__highlight" aria-hidden="true"></div>
          <div class="acf-drum__columns acf-drum__columns--three">
            ${renderDrumColumn("hour", HOUR12_OPTIONS, hour12)}
            <span class="acf-drum__colon" aria-hidden="true">:</span>
            ${renderDrumColumn("minute", MINUTE_OPTIONS, minute)}
            ${renderDrumColumn("period", periodDrumOptions, period)}
          </div>
        </div>
        <div class="acf-drum__readout" aria-live="polite">
          <span class="acf-drum__readout-label">Hora seleccionada</span>
          <strong>${readoutLabel}</strong>
        </div>
      </div>
      <footer class="acf-timepicker__foot">
        <button type="button" class="acf-timepicker__apply" data-acf-time-apply>Aplicar ${readoutLabel}</button>
      </footer>
    </div>`;

    const hourCol = panel.querySelector('[data-acf-drum-column="hour"]');
    const minCol = panel.querySelector('[data-acf-drum-column="minute"]');
    const periodCol = panel.querySelector('[data-acf-drum-column="period"]');
    scrollDrumColumnToValue(hourCol, hour12);
    scrollDrumColumnToValue(minCol, minute);
    scrollDrumColumnToValue(periodCol, period);
    highlightDrumColumn(hourCol);
    highlightDrumColumn(minCol);
    highlightDrumColumn(periodCol);

    const syncDrumReadout = () => {
      const readout = panel.querySelector(".acf-drum__readout strong");
      const applyBtn = panel.querySelector("[data-acf-time-apply]");
      const label = formatPickerStateLabel(hour12, minute, period);
      if (readout) readout.textContent = label;
      if (applyBtn) applyBtn.textContent = `Aplicar ${label}`;
    };

    let scrollTimer = null;
    const onDrumScroll = (col, kind) => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const val = highlightDrumColumn(col);
        if (!val) return;
        if (kind === "hour") hour12 = val;
        else if (kind === "minute") minute = val;
        else if (kind === "period") period = val;
        syncDrumReadout();
      }, 72);
    };

    hourCol?.addEventListener("scroll", () => onDrumScroll(hourCol, "hour"), { passive: true });
    minCol?.addEventListener("scroll", () => onDrumScroll(minCol, "minute"), { passive: true });
    periodCol?.addEventListener("scroll", () => onDrumScroll(periodCol, "period"), { passive: true });

    panel.querySelectorAll(".acf-drum__item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const col = btn.closest(".acf-drum__column");
        const kind = String(btn.dataset.acfDrumKind || "");
        const val = String(btn.dataset.acfDrumValue || "");
        if (!col || !val) return;
        if (kind === "hour") hour12 = val;
        else if (kind === "minute") minute = val;
        else if (kind === "period") period = val;
        scrollDrumColumnToValue(col, val);
        highlightDrumColumn(col);
        syncDrumReadout();
      });
    });
  };

  const applyTime = () => {
    setHiddenValue(hidden, pickerStateToHhmm24(hour12, minute, period));
    syncPickerDisplay(wrap);
    closeOpenPicker();
  };

  trigger.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (openPickerEl && openPickerEl !== wrap) closeOpenPicker();
    const isOpen = wrap.classList.contains("acf-picker--open");
    if (isOpen) {
      closeOpenPicker();
      return;
    }
    seedFromInput();
    renderPanel();
    panel.removeAttribute("hidden");
    trigger.setAttribute("aria-expanded", "true");
    wrap.classList.add("acf-picker--open");
    openPickerEl = wrap;
  });

  panel.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const btn = ev.target.closest("button");
    if (!btn) return;
    if (btn.hasAttribute("data-acf-time-apply")) {
      applyTime();
    }
  });

  hidden.addEventListener("input", () => syncPickerDisplay(wrap));
  hidden.addEventListener("change", () => syncPickerDisplay(wrap));
  syncPickerDisplay(wrap);
}

export function mountAntaresSchedulePickers(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-acf-picker="date"]').forEach(mountDatePicker);
  scope.querySelectorAll('[data-acf-picker="time"]').forEach(mountTimePicker);
}

if (typeof document !== "undefined") {
  document.addEventListener("click", (ev) => {
    if (!openPickerEl) return;
    if (clickInsideOpenPicker(ev)) return;
    closeOpenPicker();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeOpenPicker();
  });
}
