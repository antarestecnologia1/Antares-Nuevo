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
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function parsePickerTimeParts(raw) {
  const s = String(raw || "").trim();
  let hour = "08";
  let minute = "00";
  const match = s.match(/^(\d{1,2}):(\d{1,2})/);
  if (match) {
    const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
    const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
    hour = String(h).padStart(2, "0");
    minute = String(m).padStart(2, "0");
  }
  if (!HOUR_OPTIONS.includes(hour)) hour = HOUR_OPTIONS[0];
  if (!MINUTE_OPTIONS.includes(minute)) {
    const mNum = parseInt(minute, 10);
    minute =
      MINUTE_OPTIONS.find((m) => parseInt(m, 10) >= mNum) ||
      MINUTE_OPTIONS[MINUTE_OPTIONS.length - 1];
  }
  return { hour, minute };
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
  return dt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
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

  let hour = "08";
  let minute = "00";

  const seedFromInput = () => {
    const next = parsePickerTimeParts(hidden.value);
    hour = next.hour;
    minute = next.minute;
  };

  const renderPanel = () => {
    panel.innerHTML = `<div class="acf-timepicker">
      <div class="acf-timepicker__preview" aria-live="polite">
        <span class="acf-timepicker__preview-label">Hora seleccionada</span>
        <div class="acf-timepicker__preview-clock" aria-hidden="true">
          <span class="acf-timepicker__preview-part">${hour}</span>
          <span class="acf-timepicker__preview-sep">:</span>
          <span class="acf-timepicker__preview-part">${minute}</span>
        </div>
        <strong class="acf-timepicker__preview-value">${formatTimeDisplay(`${hour}:${minute}`) || `${hour}:${minute}`}</strong>
      </div>
      <div class="acf-timepicker__columns">
        <div class="acf-timepicker__section">
          <p class="acf-timepicker__section-label">Hora</p>
          <div class="acf-timepicker__scroll">
            <div class="acf-timepicker__grid acf-timepicker__grid--hours" role="listbox" aria-label="Hora">
              ${HOUR_OPTIONS.map(
                (h) =>
                  `<button type="button" class="acf-timepicker__cell${h === hour ? " is-selected" : ""}" data-acf-time-hour="${h}" role="option"${h === hour ? ' aria-selected="true"' : ""}>${h}</button>`
              ).join("")}
            </div>
          </div>
        </div>
        <div class="acf-timepicker__section">
          <p class="acf-timepicker__section-label">Minutos</p>
          <div class="acf-timepicker__scroll">
            <div class="acf-timepicker__grid acf-timepicker__grid--minutes" role="listbox" aria-label="Minutos">
              ${MINUTE_OPTIONS.map(
                (m) =>
                  `<button type="button" class="acf-timepicker__cell${m === minute ? " is-selected" : ""}" data-acf-time-minute="${m}" role="option"${m === minute ? ' aria-selected="true"' : ""}>${m}</button>`
              ).join("")}
            </div>
          </div>
        </div>
      </div>
      <footer class="acf-timepicker__foot">
        <button type="button" class="acf-timepicker__apply" data-acf-time-apply>Aplicar ${hour}:${minute}</button>
      </footer>
    </div>`;
    const selectedCell = panel.querySelector(".acf-timepicker__cell.is-selected");
    selectedCell?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  };

  const applyTime = (h, m) => {
    setHiddenValue(hidden, `${h}:${m}`);
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
    if (btn.hasAttribute("data-acf-time-hour")) {
      hour = String(btn.dataset.acfTimeHour || "08");
      renderPanel();
      return;
    }
    if (btn.hasAttribute("data-acf-time-minute")) {
      minute = String(btn.dataset.acfTimeMinute || "00");
      renderPanel();
      return;
    }
    if (btn.hasAttribute("data-acf-time-apply")) {
      applyTime(hour, minute);
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
