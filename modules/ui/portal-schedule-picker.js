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

/** Franjas operativas (COT) cada 30 min — un toque para elegir. */
const TIME_SLOT_GROUPS = [
  { label: "Madrugada", slots: ["05:00", "05:30", "06:00", "06:30", "07:00", "07:30"] },
  {
    label: "Mañana",
    slots: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
  },
  {
    label: "Mediodía",
    slots: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"]
  },
  {
    label: "Tarde",
    slots: ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30"]
  },
  {
    label: "Noche",
    slots: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"]
  }
];

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

export function formatTimeDisplay(hhmm) {
  const t = String(hhmm || "").trim().slice(0, 5);
  const match = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "";
  const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
  const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
  const dt = new Date(2000, 0, 1, h, m);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true });
}

function normalizeHhmm(raw) {
  const match = String(raw || "").trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "";
  const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
  const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function snapToNearestSlot(hhmm) {
  const norm = normalizeHhmm(hhmm);
  if (!norm) return "";
  const all = TIME_SLOT_GROUPS.flatMap((g) => g.slots);
  if (all.includes(norm)) return norm;
  const [h, m] = norm.split(":").map((n) => parseInt(n, 10));
  const total = h * 60 + m;
  let best = all[0];
  let bestDist = Infinity;
  for (const slot of all) {
    const [sh, sm] = slot.split(":").map((n) => parseInt(n, 10));
    const dist = Math.abs(sh * 60 + sm - total);
    if (dist < bestDist) {
      bestDist = dist;
      best = slot;
    }
  }
  return best;
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
  const display = wrap.querySelector("[data-acf-picker-display]");
  const placeholder = wrap.querySelector(".acf-picker__placeholder");
  if (kind === "date" || kind === "time") {
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
    return;
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

function renderTimeSlotGroups(selectedHhmm) {
  const selected = normalizeHhmm(selectedHhmm);
  return TIME_SLOT_GROUPS.map(
    (group) => `<section class="acf-time-slots__group">
      <h4 class="acf-time-slots__heading">${group.label}</h4>
      <div class="acf-time-slots__grid" role="listbox" aria-label="${group.label}">
        ${group.slots
          .map((slot) => {
            const label = formatTimeDisplay(slot) || slot;
            const sel = slot === selected;
            return `<button type="button" class="acf-time-slot${sel ? " is-selected" : ""}" data-acf-time-slot="${slot}" role="option"${sel ? ' aria-selected="true"' : ""} aria-label="${label}">${label}</button>`;
          })
          .join("")}
      </div>
    </section>`
  ).join("");
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

  const paint = () => {
    const current = normalizeHhmm(hidden.value) || snapToNearestSlot("08:00");
    const nativeValue = normalizeHhmm(hidden.value) || "";
    panel.innerHTML = `<div class="acf-timepicker acf-timepicker--slots">
      <p class="acf-timepicker__slots-hint muted">Toque una franja horaria. Horario referencial Colombia (COT).</p>
      <div class="acf-time-slots">${renderTimeSlotGroups(current)}</div>
      <div class="acf-time-custom">
        <label class="acf-time-custom__label">
          <span>Otra hora exacta</span>
          <input type="time" class="acf-time-custom__input" data-acf-time-native step="900" value="${nativeValue}" />
        </label>
        <button type="button" class="acf-time-custom__apply" data-acf-time-native-apply>Usar hora personalizada</button>
      </div>
      <footer class="acf-timepicker__foot acf-timepicker__foot--slots">
        <button type="button" class="acf-timepicker__now" data-acf-time-now>Ahora</button>
        <button type="button" class="acf-timepicker__clear" data-acf-time-clear>Borrar</button>
      </footer>
    </div>`;

    const selectedBtn = panel.querySelector(`.acf-time-slot[data-acf-time-slot="${current}"]`);
    selectedBtn?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const pickSlot = (hhmm) => {
    const norm = normalizeHhmm(hhmm);
    if (!norm) return;
    setHiddenValue(hidden, norm);
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
    paint();
    panel.removeAttribute("hidden");
    trigger.setAttribute("aria-expanded", "true");
    wrap.classList.add("acf-picker--open");
    openPickerEl = wrap;
  });

  panel.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const btn = ev.target.closest("button");
    if (btn?.hasAttribute("data-acf-time-slot")) {
      pickSlot(btn.getAttribute("data-acf-time-slot"));
      return;
    }
    if (btn?.hasAttribute("data-acf-time-now")) {
      const now = new Date();
      pickSlot(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
      return;
    }
    if (btn?.hasAttribute("data-acf-time-clear")) {
      setHiddenValue(hidden, "");
      syncPickerDisplay(wrap);
      closeOpenPicker();
      return;
    }
    if (btn?.hasAttribute("data-acf-time-native-apply")) {
      const native = panel.querySelector("[data-acf-time-native]");
      pickSlot(native?.value || "");
    }
  });

  panel.addEventListener("change", (ev) => {
    const native = ev.target.closest?.("[data-acf-time-native]");
    if (native) pickSlot(native.value);
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
