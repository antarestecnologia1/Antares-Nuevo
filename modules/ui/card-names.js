/**
 * Nombres principales de las tarjetas (conductores, empleados, usuarios, candidatos).
 *
 * Algunos nombres llegan guardados en MAYÚSCULAS ("LAURA CASTAÑEDA") y junto a los que
 * están bien escritos ("Pedro Gómez") se ven más grandes y gritan. Aquí se muestran como
 * nombre propio ("Laura Castañeda") sin tocar el dato guardado: solo cambia lo que se ve
 * y el tooltip. El tamaño de letra de todas las tarjetas lo unifica styles/action-buttons.css.
 */

const PARTICLES = new Set(["de", "del", "la", "las", "los", "el", "y", "e", "da", "do", "dos", "van", "von"]);
/** Siglas y sufijos que se quedan en mayúsculas aunque el resto se convierta. */
const KEEP_UPPER = /^(?:ii|iii|iv|vi|vii|viii|ix)$|^(?:\p{L}\.){2,}\p{L}?\.?$/iu;

/** Elementos de tarjeta que muestran el nombre de una PERSONA (las empresas no se tocan). */
export const CARD_NAME_SELECTOR = [
  ".ag-pass__name",
  ".hr-cred__name",
  ".hiring-kanban-card__name",
  ".hiring-candidate-card__titles > h4",
  ".directory-card--user .adm-badge__name"
].join(", ");

/**
 * "LAURA CASTAÑEDA" → "Laura Castañeda". Solo cambia el texto escrito por completo en
 * mayúsculas; si ya tiene minúsculas (o es muy corto, p. ej. una sigla) se devuelve igual.
 */
export function formatPersonName(value) {
  const raw = String(value ?? "");
  const letters = raw.replace(/[^\p{L}]/gu, "");
  if (letters.length < 4 || letters !== letters.toLocaleUpperCase("es") || letters === letters.toLocaleLowerCase("es")) return raw;
  let first = true;
  return raw.replace(/\S+/g, (token) => {
    const lower = token.toLocaleLowerCase("es");
    const isFirst = first;
    first = false;
    if (KEEP_UPPER.test(token)) return token;
    if (!isFirst && PARTICLES.has(lower)) return lower;
    return lower.replace(/(^|[-'’(])(\p{L})/gu, (_m, pre, ch) => pre + ch.toLocaleUpperCase("es"));
  });
}

const done = new WeakSet();

function fixElement(el) {
  if (done.has(el)) return;
  done.add(el);
  el.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      const next = formatPersonName(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  });
  const title = el.getAttribute("title");
  if (title) {
    const next = formatPersonName(title);
    if (next !== title) el.setAttribute("title", next);
  }
}

/** Normaliza los nombres de tarjeta que haya dentro de `root` (idempotente). */
export function normalizeCardNames(root) {
  const base = root || (typeof document !== "undefined" ? document : null);
  if (!base) return 0;
  let n = 0;
  if (base.nodeType === 1 && base.matches?.(CARD_NAME_SELECTOR)) {
    fixElement(base);
    n++;
  }
  base.querySelectorAll?.(CARD_NAME_SELECTOR).forEach((el) => {
    fixElement(el);
    n++;
  });
  return n;
}

let installed = false;

/** Observa el documento: toda tarjeta nueva (o repintada) queda normalizada. */
export function installCardNames() {
  if (installed || typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  installed = true;
  normalizeCardNames(document.body);
  new MutationObserver((records) => {
    for (const rec of records) {
      rec.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          normalizeCardNames(node);
        } else if (node.nodeType === 3 && node.parentElement?.matches?.(CARD_NAME_SELECTOR)) {
          // Se reescribió el texto del nombre dentro del mismo elemento.
          done.delete(node.parentElement);
          fixElement(node.parentElement);
        }
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
  if (typeof window !== "undefined") window.AntaresCardNames = { formatPersonName, normalizeCardNames };
}
