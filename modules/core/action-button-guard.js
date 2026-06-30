/**
 * Antares Portal — Guard global anti doble-clic para botones de acción.
 *
 * Objetivo: evitar que el usuario sature el servidor pulsando repetidamente
 * botones de "crear / editar / guardar / eliminar / confirmar / enviar".
 *
 * Cómo funciona:
 *  - Un único listener en fase de captura sobre `document`.
 *  - Al primer clic sobre un botón de mutación, lo marca como ocupado
 *    (clase `is-busy` + `aria-busy`) mostrando el spinner profesional del CSS.
 *    NO bloquea ese primer clic: la acción real se ejecuta con normalidad.
 *  - Los clics siguientes durante el periodo de enfriamiento se descartan
 *    (`preventDefault` + `stopImmediatePropagation`).
 *  - El bloqueo se libera tras un breve enfriamiento; si el formulario sigue
 *    enviándose (`is-submitting`) o el botón está gestionado por
 *    `lockFormSubmitUi` (`data-busy="1"`), se extiende hasta que termine
 *    (con un tope de seguridad).
 *
 * Cooperación:
 *  - Solo limpia los marcadores que él mismo aplicó (`data-guard-busy`).
 *  - Si el sistema de formularios (`data-busy="1"`) es dueño del botón,
 *    deja que ese sistema limpie `is-busy` / `aria-busy`.
 *
 * Exclusiones:
 *  - Botones con `[data-no-lock]`.
 *  - Acciones de navegación/UI (toggles, tabs, ver detalle, etc.): no entran
 *    porque solo se enganchan envíos reales y un set acotado de `data-action`.
 */

const COOLDOWN_MS = 900;
const RELEASE_RECHECK_MS = 500;
const SAFETY_RELEASE_MS = 12000;

const guardTimers = new WeakMap();

/**
 * Verbos de mutación que tocan el servidor. Se evitan a propósito verbos de
 * pura UI como "toggle", "view", "detail", "expand", "cancel", "edit"
 * (abrir formulario de edición): el guardado real va por `type="submit"` o por
 * acciones con `save/update/...`.
 */
const MUTATION_ACTION_RE =
  /(?:^|[-_:])(?:save|create|add|register|store|update|submit|confirm|delete|remove|destroy|approve|reject|deny|decline|send|resend|assign|unassign|generate|liquidate|liquidacion|settle|pay|payroll|sign|finalize|publish|archive|restore|duplicate|import|export|upload|invite|activate|deactivate|hire|terminate|renew|apply)(?:$|[-_:])/i;

const CLICKABLE_SELECTOR =
  "button, input[type='submit'], input[type='button'], [role='button'], a.btn, [data-lock-on-click]";

function resolveButton(target) {
  if (!(target instanceof Element)) return null;
  return target.closest(CLICKABLE_SELECTOR);
}

function isExternallyBusy(btn) {
  return (
    btn.disabled === true ||
    btn.getAttribute("aria-disabled") === "true" ||
    btn.getAttribute("aria-busy") === "true" ||
    btn.classList.contains("is-busy") ||
    btn.dataset.busy === "1"
  );
}

function qualifies(btn) {
  if (!(btn instanceof HTMLElement)) return false;
  if (btn.hasAttribute("data-no-lock")) return false;
  /* El login/registro tiene su propio spinner a medida (`.auth-submit-spinner`). */
  if (btn.closest("#auth-modal, [data-login-submit], [data-register-submit]")) return false;
  if (btn.hasAttribute("data-lock-on-click")) return true;
  const type = (btn.getAttribute("type") || "").toLowerCase();
  if (type === "submit") return true;
  const action = btn.getAttribute("data-action") || "";
  if (action && MUTATION_ACTION_RE.test(action)) return true;
  return false;
}

function relatedFormSubmitting(btn) {
  const ownForm = "form" in btn ? /** @type {HTMLFormElement|null} */ (btn.form) : null;
  const form = ownForm || btn.closest?.("form");
  if (!form) return false;
  return form.dataset.submitting === "1" || form.classList.contains("is-submitting");
}

function scheduleRelease(btn, delay) {
  clearTimeout(guardTimers.get(btn));
  const timer = setTimeout(() => {
    if (btn.dataset.guardBusy !== "1") return;
    const elapsed = Date.now() - Number(btn.dataset.guardStart || Date.now());
    const stillWorking = btn.dataset.busy === "1" || btn.disabled === true || relatedFormSubmitting(btn);
    if (stillWorking && elapsed < SAFETY_RELEASE_MS && btn.isConnected) {
      scheduleRelease(btn, RELEASE_RECHECK_MS);
      return;
    }
    release(btn);
  }, delay);
  guardTimers.set(btn, timer);
}

function release(btn) {
  const timer = guardTimers.get(btn);
  if (timer) clearTimeout(timer);
  guardTimers.delete(btn);
  if (btn.dataset.guardBusy !== "1") return;
  delete btn.dataset.guardBusy;
  delete btn.dataset.guardStart;
  /* Si el sistema de formularios es dueño del estado, que él lo limpie. */
  if (btn.dataset.busy === "1") return;
  btn.classList.remove("is-busy");
  btn.removeAttribute("aria-busy");
}

function lock(btn) {
  btn.dataset.guardBusy = "1";
  btn.dataset.guardStart = String(Date.now());
  btn.classList.add("is-busy");
  btn.setAttribute("aria-busy", "true");
  /* No se usa `disabled` para no cancelar un envío de formulario en vuelo. */
  scheduleRelease(btn, COOLDOWN_MS);
}

function onCaptureClick(event) {
  const btn = resolveButton(event.target);
  if (!btn || !qualifies(btn)) return;

  /* Repetición durante nuestro enfriamiento → descartar. */
  if (btn.dataset.guardBusy === "1") {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  /* Otro sistema ya lo bloqueó (p. ej. `lockFormSubmitUi`) → descartar repetición. */
  if (isExternallyBusy(btn)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  /* Primer clic: dejar pasar la acción y marcar ocupado. */
  lock(btn);
}

let installed = false;

/** Instala el guard global. Idempotente. */
export function installActionButtonGuard() {
  if (installed) return;
  if (typeof document === "undefined" || !document.addEventListener) return;
  installed = true;
  document.addEventListener("click", onCaptureClick, true);
}

export default installActionButtonGuard;
