/**
 * Compuerta central de permisos por acción.
 *
 * Qué hace:
 *  1. Oculta, después de cada render, los botones cuya acción (`data-action`) el usuario no puede ejecutar.
 *  2. Bloquea en fase de captura (antes que cualquier otro manejador) clics, cambios y envíos de formularios
 *     que el usuario no puede ejecutar, y avisa con un mensaje claro. Cubre también los modales.
 *
 * Las reglas salen del catálogo `PERMISSION_MODULES` (config.js) a través de `canDo` (auth.js); aquí solo se
 * relaciona cada acción / formulario del portal con el permiso que exige. La API repite la validación: esta capa
 * mejora la experiencia y evita errores, no sustituye al servidor.
 */
import { canDo, currentUser, isAdminActor } from "./auth.js";
import { PERMISSION_META, PERMISSION_MODULES, userIsClientScoped } from "./config.js";
import { notify } from "../ui/modals.js";
import {
  PERMISSION_ACTION_RULES as ACTION_RULES,
  PERMISSION_FORM_RULES as FORM_RULES,
  PERMISSION_ID_RULES as ID_RULES
} from "./permission-rules.js";

/** Acciones de Solicitudes que el cliente básico usa sobre sus propias solicitudes (no se tocan). */
const CLIENT_OWN_REQUEST_ACTIONS = new Set(["edit-request", "cancel-request"]);

function actor() {
  try {
    return typeof currentUser === "function" ? currentUser() : null;
  } catch {
    return null;
  }
}

function ruleAllows(rule, user) {
  return rule.some(([moduleId, action]) => canDo(user, moduleId, action));
}

/** Título del permiso que habría que tener (para el aviso). */
function ruleLabel(rule) {
  const [moduleId, action] = rule[0] || [];
  const key = PERMISSION_MODULES[moduleId]?.actions?.[action];
  return PERMISSION_META[key]?.title || "";
}

/**
 * ¿Puede el usuario ejecutar la acción? Las acciones sin regla siempre pasan (otras capas las controlan).
 * @param {string} action valor de `data-action`
 * @param {object} [user]
 */
export function canPerformGatedAction(action, user) {
  const rule = ACTION_RULES[String(action || "")];
  if (!rule) return true;
  const u = user || actor();
  if (!u) return false;
  if (isAdminActor(u)) return true;
  if (CLIENT_OWN_REQUEST_ACTIONS.has(action) && userIsClientScoped(u)) return true;
  return ruleAllows(rule, u);
}

export function canSubmitGatedForm(formId, user) {
  const entry = FORM_RULES[String(formId || "")];
  if (!entry) return true;
  const u = user || actor();
  if (!u) return false;
  if (isAdminActor(u)) return true;
  if (entry.clientBypass && userIsClientScoped(u)) return true;
  return ruleAllows(entry.rule, u);
}

function denyMessage(rule) {
  const label = ruleLabel(rule);
  return label
    ? `Su perfil no tiene el permiso «${label}» para esta acción. Pídaselo a un administrador.`
    : "Su perfil no tiene permiso para esta acción. Pídaselo a un administrador.";
}

function blockEvent(event, rule) {
  event.preventDefault();
  event.stopImmediatePropagation();
  try {
    notify(denyMessage(rule), "error");
  } catch {
    /* sin interfaz de avisos: el bloqueo ya se aplicó */
  }
}

function ruleForTrigger(trigger) {
  const action = String(trigger?.dataset?.action || "");
  if (action && ACTION_RULES[action]) return { action, rule: ACTION_RULES[action] };
  const id = String(trigger?.id || "");
  if (id && ID_RULES[id]) return { action: id, rule: ID_RULES[id], byId: true };
  return null;
}

function onGuardedInteraction(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const trigger = target.closest("[data-action], #export-payroll, #export-employees-contracts");
  if (!trigger) return;
  const found = ruleForTrigger(trigger);
  if (!found) return;
  const user = actor();
  if (!user) return;
  const allowed = found.byId ? isAdminActor(user) || ruleAllows(found.rule, user) : canPerformGatedAction(found.action, user);
  if (allowed) return;
  blockEvent(event, found.rule);
}

function onGuardedSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const entry = FORM_RULES[form.id];
  if (!entry) return;
  if (canSubmitGatedForm(form.id)) return;
  blockEvent(event, entry.rule);
}

let gateInstalled = false;

/** Instala los escuchas globales (una sola vez). */
export function installPermissionGate() {
  if (gateInstalled || typeof document === "undefined") return;
  gateInstalled = true;
  document.addEventListener("click", onGuardedInteraction, true);
  document.addEventListener("change", onGuardedInteraction, true);
  document.addEventListener("submit", onGuardedSubmit, true);
}

function markDenied(node, denied) {
  if (denied) {
    node.setAttribute("data-perm-denied", "1");
    node.setAttribute("aria-hidden", "true");
    if (node.matches("button, input, select, textarea")) node.setAttribute("tabindex", "-1");
  } else if (node.hasAttribute("data-perm-denied")) {
    node.removeAttribute("data-perm-denied");
    node.removeAttribute("aria-hidden");
    if (node.getAttribute("tabindex") === "-1") node.removeAttribute("tabindex");
  }
}

/**
 * Oculta lo que el usuario no puede hacer dentro de la vista (y vuelve a mostrar si cambian los permisos).
 * @param {ParentNode} [root]
 */
export function applyPermissionGate(root) {
  const scope = root || document.getElementById("view-root");
  if (!scope || typeof scope.querySelectorAll !== "function") return;
  const user = actor();
  if (!user) return;
  scope.querySelectorAll("[data-action]").forEach((node) => {
    const action = String(node.dataset.action || "");
    if (!ACTION_RULES[action]) return;
    markDenied(node, !canPerformGatedAction(action, user));
  });
  Object.keys(ID_RULES).forEach((id) => {
    const node = scope.querySelector(`#${id}`);
    if (node) markDenied(node, !(isAdminActor(user) || ruleAllows(ID_RULES[id], user)));
  });
  Object.keys(FORM_RULES).forEach((id) => {
    const form = scope.querySelector(`#${id}`);
    if (form) markDenied(form, !canSubmitGatedForm(id, user));
  });
}

let observer = null;
let scheduled = false;

/** Mantiene la compuerta al día cuando un módulo vuelve a pintar partes de su vista sin pasar por el router. */
export function watchPermissionGate() {
  if (observer || typeof MutationObserver === "undefined") return;
  const root = document.getElementById("view-root");
  if (!root) return;
  observer = new MutationObserver((mutations) => {
    if (scheduled) return;
    if (!mutations.some((m) => m.addedNodes && m.addedNodes.length)) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyPermissionGate(root);
    });
  });
  observer.observe(root, { childList: true, subtree: true });
}

/** Punto de entrada del router: tras pintar una vista. */
export function mountPermissionGate() {
  installPermissionGate();
  applyPermissionGate();
  watchPermissionGate();
}

