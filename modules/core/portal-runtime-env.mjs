/**
 * Re-exporta símbolos que `portal-runtime.js` esperaba como globales (`Object.assign(window, …)`).
 * Evita colisiones de nombres entre módulos: cada export debe ser único entre estos cinco.
 */
export * from "./config.js";
export * from "./auth.js";
export * from "./store.js";
export * from "./utils.js";
export * from "./audit-trail.js";
export * from "../ui/modals.js";
