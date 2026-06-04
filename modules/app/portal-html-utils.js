/**
 * escapeHtml / escapeAttr — mitigacion XSS en interpolacion de strings a HTML.
 * Cargar antes de app.js.
 */
/** Evita XSS cuando texto de usuario o BD se interpola en HTML. */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Valores en atributos HTML entre comillas dobles. */
function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;");
}
