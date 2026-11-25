/**
 * Modelo de permisos por acción (puro, sin DOM): decide si un conjunto de permisos permite una acción de un
 * módulo según `PERMISSION_MODULES` (config.js). Lo usan `canDo` (auth.js) y las pruebas de QA.
 * El servidor tiene el mismo modelo en apps/api/src/portal/portal-permissions.ts (la prueba compara ambos).
 */
import { PERMISSION_MODULES } from "./config.js";

/** Llaves que abren/consultan un módulo: la completa, la de consulta y cualquiera de sus acciones. */
export function permissionModuleKeys(moduleId, modules = PERMISSION_MODULES) {
  const mod = modules[moduleId];
  if (!mod) return [];
  return [mod.full, mod.view, ...Object.values(mod.actions || {})].filter(Boolean);
}

/**
 * @param {(key: string) => boolean} has  ¿el usuario tiene esa llave de permiso?
 * @param {string} moduleId
 * @param {string} [action]  «view» (abrir el módulo) o una acción del módulo
 */
export function permissionAllows(has, moduleId, action = "view", modules = PERMISSION_MODULES) {
  const mod = modules[moduleId];
  if (!mod) return false;
  if (action === "view") return permissionModuleKeys(moduleId, modules).some((key) => has(key));
  const own = mod.actions?.[action];
  if (own && has(own)) return true;
  if (mod.full && has(mod.full) && !(mod.fullExcludes || []).includes(action)) return true;
  return (mod.alsoFrom?.[action] || []).some((key) => has(key));
}
