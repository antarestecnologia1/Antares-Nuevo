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
    flow = "";
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

const TIME_PRESETS = ["06:00", "08:00", "12:00", "15:00", "18:00"];
const TIME_MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function hhmmToClock(hhmm) {
  const norm = normalizeHhmm(hhmm);
  if (!norm) return null;
  const [h, m] = norm.split(":").map((n) => parseInt(n, 10));
  return { h12: h % 12 === 0 ? 12 : h % 12, min: m, ap: h >= 12 ? "pm" : "am" };
}

function clockToHhmm({ h12, min, ap }) {
  const h24 = (h12 % 12) + (ap === "pm" ? 12 : 0);
  return `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function parseTypedTime(raw) {
  const txt = String(raw || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!txt) return "";
  const m = txt.match(/^(\d{1,2})(?:[:h ]?(\d{2}))?\s*(a ?m|p ?m|am|pm|a|p)?$/);
  if (!m) return "";
  let h = parseInt(m[1], 10);
  const min = m[2] != null ? parseInt(m[2], 10) : 0;
  const ap = m[3] ? (m[3].charAt(0) === "p" ? "pm" : "am") : "";
  if (min > 59 || h > 23) return "";
  if (ap) {
    if (h < 1 || h > 12) return "";
    h = (h % 12) + (ap === "pm" ? 12 : 0);
  }
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function shiftHhmm(hhmm, deltaMin) {
  const norm = normalizeHhmm(hhmm) || "08:00";
  const [h, m] = norm.split(":").map((n) => parseInt(n, 10));
  const total = (((h * 60 + m + deltaMin) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
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

  let flow = "";
  const readClock = () => hhmmToClock(hidden.value) || { h12: 8, min: 0, ap: "am", empty: true };

  const paint = () => {
    const c = readClock();
    const shown = c.empty ? null : c;
    const readout = shown
      ? `${shown.h12}:${String(shown.min).padStart(2, "0")}`
      : "--:--";
    const hoursHtml = Array.from({ length: 12 }, (_, i) => i + 1)
      .map((h) => {
        const on = shown && shown.h12 === h;
        return `<button type="button" class="acf-tp__cell${on ? " is-on" : ""}" data-tp-hour="${h}" aria-pressed="${on ? "true" : "false"}">${h}</button>`;
      })
      .join("");
    const minsHtml = TIME_MINUTES.map((m) => {
      const on = shown && String(shown.min).padStart(2, "0") === m;
      return `<button type="button" class="acf-tp__cell acf-tp__cell--min${on ? " is-on" : ""}" data-tp-min="${m}" aria-pressed="${on ? "true" : "false"}">:${m}</button>`;
    }).join("");
    const presetsHtml = TIME_PRESETS.map((slot) => {
      const on = normalizeHhmm(hidden.value) === slot;
      return `<button type="button" class="acf-tp__preset${on ? " is-on" : ""}" data-tp-preset="${slot}">${formatTimeDisplay(slot)}</button>`;
    }).join("");
    panel.innerHTML = `<div class="acf-tp">
      <div class="acf-tp__top">
        <div class="acf-tp__readout${shown ? "" : " is-empty"}" aria-live="polite"><strong>${readout}</strong></div>
        <div class="acf-tp__ap" role="group" aria-label="Jornada">
          <button type="button" class="${shown && c.ap === "am" ? "is-on" : ""}" data-tp-ap="am" aria-pressed="${shown && c.ap === "am" ? "true" : "false"}">a. m.</button>
          <button type="button" class="${shown && c.ap === "pm" ? "is-on" : ""}" data-tp-ap="pm" aria-pressed="${shown && c.ap === "pm" ? "true" : "false"}">p. m.</button>
        </div>
      </div>
      <div class="acf-tp__quick">
        <button type="button" class="acf-tp__step" data-tp-shift="-60" aria-label="Restar una hora">−1 h</button>
        <button type="button" class="acf-tp__step" data-tp-shift="-15" aria-label="Restar 15 minutos">−15 min</button>
        <input type="text" class="acf-tp__type" data-tp-type inputmode="text" autocomplete="off" placeholder="Escriba: 8:30 am o 14:30" aria-label="Escribir la hora" value="" />
        <button type="button" class="acf-tp__step" data-tp-shift="15" aria-label="Sumar 15 minutos">+15 min</button>
        <button type="button" class="acf-tp__step" data-tp-shift="60" aria-label="Sumar una hora">+1 h</button>
      </div>
      <div class="acf-tp__presets" aria-label="Horas frecuentes">${presetsHtml}</div>
      <p class="acf-tp__label">Hora</p>
      <div class="acf-tp__hours">${hoursHtml}</div>
      <p class="acf-tp__label">Minutos</p>
      <div class="acf-tp__mins">${minsHtml}</div>
      <footer class="acf-tp__foot">
        <button type="button" class="acf-tp__link" data-tp-now>Ahora</button>
        <button type="button" class="acf-tp__link" data-tp-clear>Borrar</button>
        <button type="button" class="acf-tp__done" data-tp-done>Listo</button>
      </footer>
      <p class="acf-tp__hint">Horario referencial Colombia (COT)</p>
    </div>`;
  };

  const commit = (patch) => {
    const next = { ...readClock(), ...patch };
    setHiddenValue(hidden, clockToHhmm(next));
    syncPickerDisplay(wrap);
    paint();
  };

  trigger.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (openPickerEl && openPickerEl !== wrap) closeOpenPicker();
    if (wrap.classList.contains("acf-picker--open")) {
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
    if (!btn) return;
    if (btn.hasAttribute("data-tp-hour")) {
      const h12 = parseInt(btn.dataset.tpHour, 10);
      const wasEmpty = !hhmmToClock(hidden.value);
      flow = "hour";
      if (wasEmpty) return commit({ h12, min: 0, ap: h12 === 12 || h12 <= 4 ? "pm" : "am" });
      return commit({ h12 });
    }
    if (btn.hasAttribute("data-tp-min")) {
      commit({ min: parseInt(btn.dataset.tpMin, 10) });
      if (flow === "hour") closeOpenPicker();
      return;
    }
    if (btn.hasAttribute("data-tp-shift")) {
      setHiddenValue(hidden, shiftHhmm(hidden.value, parseInt(btn.dataset.tpShift, 10)));
      syncPickerDisplay(wrap);
      paint();
      return;
    }
    if (btn.hasAttribute("data-tp-ap")) return commit({ ap: btn.dataset.tpAp });
    if (btn.hasAttribute("data-tp-preset")) {
      const c = hhmmToClock(btn.dataset.tpPreset);
      if (c) commit(c);
      return;
    }
    if (btn.hasAttribute("data-tp-now")) {
      const now = new Date();
      const mins = Math.round(now.getMinutes() / 5) * 5;
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), mins);
      const c = hhmmToClock(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
      if (c) commit(c);
      return;
    }
    if (btn.hasAttribute("data-tp-clear")) {
      setHiddenValue(hidden, "");
      syncPickerDisplay(wrap);
      closeOpenPicker();
      return;
    }
    if (btn.hasAttribute("data-tp-done")) closeOpenPicker();
  });

  const applyTyped = (input) => {
    const v = parseTypedTime(input.value);
    if (!v) {
      input.classList.add("is-invalid");
      return false;
    }
    input.classList.remove("is-invalid");
    setHiddenValue(hidden, v);
    syncPickerDisplay(wrap);
    return true;
  };
  panel.addEventListener("keydown", (ev) => {
    const input = ev.target.closest?.("[data-tp-type]");
    if (!input || ev.key !== "Enter") return;
    ev.preventDefault();
    ev.stopPropagation();
    if (applyTyped(input)) closeOpenPicker();
  });
  panel.addEventListener("input", (ev) => {
    ev.target.closest?.("[data-tp-type]")?.classList.remove("is-invalid");
  });
  panel.addEventListener("change", (ev) => {
    const input = ev.target.closest?.("[data-tp-type]");
    if (input && input.value.trim()) {
      if (applyTyped(input)) paint();
    }
  });

  hidden.addEventListener("input", () => syncPickerDisplay(wrap));
  hidden.addEventListener("change", () => syncPickerDisplay(wrap));
  syncPickerDisplay(wrap);
}

/* ---------- Hora de los campos fecha+hora del portal (viajes, entrevistas…) ---------- */
let dtlSeq = 0;
const DTL_PRESETS = ["06:00", "08:00", "12:00", "15:00", "18:00"];

function enhanceDmyTime(timeEl) {
  if (!timeEl || timeEl.dataset.acfTp === "1") return;
  timeEl.dataset.acfTp = "1";
  const n = ++dtlSeq;
  const id = timeEl.id || `acf-dtl-time-${n}`;
  timeEl.id = id;
  const row = timeEl.closest(".portal-datetime-dmy-row");
  const label = (timeEl.closest("label")?.querySelector("span")?.textContent || "").replace(/[*"]/g, "").trim() || "hora";
  const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  const picker = document.createElement("div");
  picker.className = "acf-picker acf-picker--time acf-picker--inline";
  picker.dataset.acfPicker = "time";
  picker.dataset.acfPickerTarget = id;
  picker.innerHTML = `<div class="acf-picker__shell">
      <button type="button" class="acf-picker__trigger" data-acf-picker-open aria-haspopup="dialog" aria-expanded="false" aria-label="Elegir hora: ${label}">
        <span class="acf-picker__placeholder">Seleccione hora</span>
        <span class="acf-picker__value" data-acf-picker-display hidden></span>
      </button>
      <span class="acf-picker__chevron" aria-hidden="true">▾</span>
    </div>
    <div class="acf-picker__panel acf-picker__panel--time" data-acf-picker-panel hidden role="dialog" aria-label="Elegir hora"></div>`;
  timeEl.type = "hidden";
  timeEl.insertAdjacentElement("beforebegin", picker);
  /* Los módulos que asignan `.value` directamente no disparan eventos: refrescamos la vista. */
  if (desc && desc.get && desc.set) {
    Object.defineProperty(timeEl, "value", {
      configurable: true,
      get() {
        return desc.get.call(this);
      },
      set(v) {
        desc.set.call(this, v);
        queueMicrotask(() => syncPickerDisplay(picker));
      }
    });
  }
  if (row) {
    const chips = document.createElement("div");
    chips.className = "acf-time-presets acf-dtl__chips";
    chips.setAttribute("role", "group");
    chips.setAttribute("aria-label", "Horas sugeridas");
    chips.innerHTML = DTL_PRESETS.map(
      (t) => `<button type="button" class="acf-time-preset" data-dtl-preset="${t}">${formatTimeDisplay(t)}</button>`
    ).join("");
    chips.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-dtl-preset]");
      if (!btn) return;
      setHiddenValue(timeEl, btn.dataset.dtlPreset);
      syncPickerDisplay(picker);
    });
    row.insertAdjacentElement("afterend", chips);
  }
  mountTimePicker(picker);
}

function enhanceDmyTimesIn(root) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll(".portal-datetime-dmy__time:not([data-acf-tp])").forEach(enhanceDmyTime);
  if (scope.matches?.(".portal-datetime-dmy__time:not([data-acf-tp])")) enhanceDmyTime(scope);
}

if (typeof document !== "undefined" && typeof MutationObserver !== "undefined") {
  const startDtlObserver = () => {
    enhanceDmyTimesIn(document);
    new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === 1) enhanceDmyTimesIn(node);
        });
      }
    }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) startDtlObserver();
  else document.addEventListener("DOMContentLoaded", startDtlObserver);
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
