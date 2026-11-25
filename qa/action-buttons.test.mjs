/**
 * Sistema de botones de acción (modules/ui/action-buttons.js + styles/action-buttons.css).
 * Sin navegador: valida catálogo, CSS (tonos, variantes, estados, contraste AA), el
 * generador `actionButton`, el clasificador de botones heredados, la guarda de cambios
 * pendientes y que TODA acción de eliminar del portal pida confirmación.
 * Ejecutar: node qa/action-buttons.test.mjs
 */
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const css = read("styles/action-buttons.css");
const indexHtml = read("index.html");
const mod = await import(pathToFileURL(path.join(root, "modules/ui/action-buttons.js")).href);
const { ACTION_BUTTONS, ACTION_TONES, ACTION_BUTTON_VARIANTS, actionButton, actionGroup, classifyActionButton, formIsDirty, lucideIcon } = mod;

let n = 0;
const ok = (cond, msg) => {
  assert.ok(cond, msg);
  n++;
};

/* 1) Las 12 acciones pedidas y sus tonos */
const REQUESTED = ["aceptar", "cancelar", "eliminar", "guardar", "editar", "nuevo", "buscar", "regresar", "descargar", "imprimir", "enviar", "cerrar"];
for (const k of REQUESTED) {
  ok(ACTION_TONES.includes(k), `falta el tono «${k}»`);
  ok(ACTION_BUTTONS[k] && ACTION_BUTTONS[k].tone === k, `la acción «${k}» debe usar su propio tono`);
}
ok(ACTION_BUTTONS.confirmar.tone === "aceptar" && ACTION_BUTTONS.consultar.tone === "buscar", "confirmar→verde, consultar→gris azulado");
ok(["anular", "rechazar"].every((k) => ACTION_BUTTONS[k].tone === "eliminar"), "anular/rechazar comparten el rojo");
ok(JSON.stringify([...ACTION_BUTTON_VARIANTS]) === JSON.stringify(["primary", "outline", "ghost", "soft"]), "variantes primary/outline/ghost/soft");
for (const k of ["exito", "info", "aviso", "error"]) ok(ACTION_TONES.includes(k) && ACTION_BUTTONS[k].tone === k, `falta el tono de aviso «${k}»`);
ok(ACTION_BUTTONS.compartir.tone === "neutral" && ACTION_BUTTONS.copiar.icon === "link" && ACTION_BUTTONS.marcador.icon === "bookmark", "acciones neutras: compartir, copiar enlace, marcador");

/* Todo en español: etiquetas por defecto del catálogo */
const ETIQUETAS = { aceptar: "Aceptar", confirmar: "Confirmar", cancelar: "Cancelar", eliminar: "Eliminar", anular: "Anular", rechazar: "Rechazar", guardar: "Guardar", editar: "Editar", nuevo: "Nuevo", buscar: "Buscar", consultar: "Consultar", regresar: "Regresar", descargar: "Descargar", imprimir: "Imprimir", enviar: "Enviar", cerrar: "Cerrar", compartir: "Compartir", copiar: "Copiar enlace", marcador: "Guardar", exito: "Éxito", info: "Información", aviso: "Advertencia", error: "Error" };
for (const [k, def] of Object.entries(ACTION_BUTTONS)) ok(ETIQUETAS[k] === def.label, `la etiqueta de «${k}» debe estar en español: «${ETIQUETAS[k]}» (hay «${def.label}»)`);
ok(Object.keys(ETIQUETAS).length === Object.keys(ACTION_BUTTONS).length, "el catálogo y las etiquetas esperadas coinciden");

/* 2) CSS: tonos, variantes, estados, capa y contraste */
ok(/@layer\s+antares-buttons\s*\{/.test(css), "el CSS debe ir en @layer antares-buttons (gana a los !important antiguos)");
const lum = (hex) => {
  const c = hex.replace("#", "").match(/../g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const toneBlock = (tone) => {
  const m = css.match(new RegExp(`\\.ab--${tone}\\s*\\{([^}]*)\\}`));
  if (!m) return null;
  return Object.fromEntries([...m[1].matchAll(/--ab-([a-z-]+):\s*([^;]+);/g)].map((x) => [x[1], x[2].trim()]));
};
for (const tone of ACTION_TONES) {
  const t = toneBlock(tone);
  ok(t, `tono «${tone}» sin definir en el CSS`);
  for (const k of ["cl", "c", "cd", "ch", "ca", "soft", "line", "rgb", "fg-dark"]) ok(t[k], `tono «${tone}» sin --ab-${k}`);
  const fg = t.on || "#ffffff";
  for (const stop of ["cl", "c"]) ok(contrast(t[stop], fg) >= 4.5, `contraste AA: texto ${fg} sobre ${tone} (${stop}) ${t[stop]} = ${contrast(t[stop], fg).toFixed(2)} (< 4.5)`);
}
ok(/--ab-radius:\s*999px/.test(css), "forma de píldora por defecto");
ok(/linear-gradient\(180deg,\s*var\(--ab-cl\)/.test(css), "«primary» usa degradado vertical suave");
ok(/color-mix\(/.test(css), "estado deshabilitado con tinte del propio color");
for (const v of ACTION_BUTTON_VARIANTS) ok(new RegExp(`\\.ab\\.ab--${v}\\s*\\{`).test(css), `variante ${v} sin definir`);
const mustHave = [
  [":is(:hover, .is-hover)", "hover"],
  [":is(:active, .is-pressed)", "active"],
  [":focus-visible", "foco con teclado"],
  [':is(:disabled, [aria-disabled="true"])', "disabled"],
  ['[aria-busy="true"]', "loading"],
  ["@keyframes ab-spin", "animación del spinner"],
  ["prefers-reduced-motion", "movimiento reducido"],
  ["max-width: 640px", "móvil"],
  ['body[data-theme="dark"]', "tema oscuro"],
  [".ab-confirm", "diálogo de confirmación"]
];
for (const [needle, name] of mustHave) ok(css.includes(needle), `CSS sin estilo de ${name}`);
ok(!/text-transform:\s*uppercase/.test(css), "sin mayúsculas sostenidas");

/* 3) Íconos Lucide embebidos */
for (const [k, def] of Object.entries(ACTION_BUTTONS)) {
  ok(lucideIcon(def.icon).startsWith("<svg"), `ícono Lucide «${def.icon}» de la acción ${k} no existe`);
}
ok(/stroke="currentColor"/.test(lucideIcon("save")) && /aria-hidden="true"/.test(lucideIcon("save")), "los íconos heredan color y se ocultan a lectores");

/* 4) Generador actionButton */
const del = actionButton({ action: "eliminar", variant: "outline", dataAction: "delete-x", data: { id: "7" } });
ok(/data-ab-confirm="1"/.test(del) && /data-action="delete-x"/.test(del) && /data-id="7"/.test(del), "«eliminar» debe pedir confirmación por defecto");
ok(!/data-ab-confirm/.test(actionButton({ action: "eliminar", confirm: false })), "confirm:false omite la confirmación");
ok(/ab--eliminar ab--outline/.test(del) && /class="btn ab /.test(del), "clases de familia");
const soft = actionButton({ action: "imprimir", tone: "neutral", variant: "soft" });
ok(/ab--neutral ab--soft/.test(soft) && /data-ab-action="imprimir"/.test(soft) && />Imprimir</.test(soft), "variante soft y tono alternativo (tone)");
ok(/ab--exito ab--primary/.test(actionButton({ action: "exito" })) && />Éxito</.test(actionButton({ action: "exito" })), "botón de aviso «Éxito»");
const icon = actionButton({ action: "editar", iconOnly: true, size: "sm" });
ok(/aria-label="Editar"/.test(icon) && /ab--icon/.test(icon) && !/ab__label/.test(icon), "solo ícono con aria-label");
const loading = actionButton({ action: "guardar", loading: true });
ok(/aria-busy="true"/.test(loading) && /\bdisabled\b/.test(loading) && /is-loading/.test(loading), "estado loading");
ok(/&lt;b&gt;/.test(actionButton({ action: "nuevo", label: "<b>x</b>" })), "el texto se escapa");
ok(/type="submit"/.test(actionButton({ action: "guardar", type: "submit" })) && /type="button"/.test(actionButton({ action: "guardar" })), "type button/submit");
ok(/^<a /.test(actionButton({ action: "descargar", href: "/x" })), "href genera enlace");
ok(/ab-group--end ab-group--stack/.test(actionGroup(["<i></i>"])), "grupo de acciones");

/* 5) Clasificador de botones heredados (elemento simulado) */
const el = ({ cls = "", da = "", id = "", text = "", label = "", svg = false, attrs = {}, inside = false } = {}) => ({
  nodeType: 1,
  childNodes: [...(svg ? [{ nodeType: 1, tagName: "SVG", className: "", textContent: "" }] : []), { nodeType: 3, textContent: text }],
  getAttribute: (k) => ({ class: cls, "data-action": da, id, "aria-label": label, title: "", type: "button", ...attrs })[k] ?? null,
  hasAttribute: (k) => ({ class: !!cls, "data-action": !!da, ...Object.fromEntries(Object.keys(attrs).map((a) => [a, true])) })[k] || false,
  closest: () => (inside ? {} : null),
  querySelector: (s) => (s === "svg" && svg ? {} : null),
  get id() { return id; }
});
const cases = [
  [{ cls: "btn btn-sm btn-action btn-danger-soft module-panel-btn module-panel-btn--cancel", da: "cancel-create-panel", text: "Cancelar" }, "cancelar"],
  [{ id: "crud-cancel", cls: "btn", text: "Cancelar" }, "cancelar"],
  [{ id: "crud-close", cls: "btn btn-sm btn-outline", svg: true, label: "Cerrar" }, "cerrar"],
  [{ cls: "btn btn-sm btn-reject", da: "delete-vacancy", svg: true }, "eliminar"],
  [{ cls: "btn btn-primary", id: "crud-confirm", text: "Sí, eliminar" }, "eliminar"],
  [{ cls: "btn btn-outline", da: "delete-trip", text: "Eliminar viaje" }, "eliminar"],
  [{ cls: "btn btn-sm", da: "unlink-employee", text: "Desvincular" }, "eliminar"],
  [{ cls: "btn btn-sm", da: "edit-vehicle", svg: true, label: "Editar" }, "editar"],
  [{ cls: "btn btn-primary", text: "Actualizar conductor" }, "guardar"],
  [{ cls: "btn btn-outline", da: "employee-form-save-draft", text: "Guardar borrador" }, "guardar"],
  [{ cls: "btn btn-primary", text: "Crear viaje" }, "nuevo"],
  [{ cls: "btn", da: "doc-new-folder", text: "Nueva carpeta" }, "nuevo"],
  [{ cls: "btn btn-sm", da: "view-vehicle", text: "Ver ficha" }, "consultar"],
  [{ cls: "btn btn-sm", da: "generate-report", text: "Vista previa" }, "consultar"],
  [{ cls: "btn btn-sm", da: "generate-report", text: "PDF" }, "descargar"],
  [{ cls: "btn btn-sm", da: "export-sst-due-csv", text: "Exportar CSV" }, "descargar"],
  [{ cls: "btn btn-sm", text: "Exportar todo (3)" }, "descargar"],
  [{ cls: "btn btn-sm", da: "report-preview-print", text: "Imprimir" }, "imprimir"],
  [{ cls: "btn", da: "send-invite", text: "Enviar invitación" }, "enviar"],
  [{ cls: "btn", da: "modal-back", text: "Atrás" }, "regresar"],
  [{ cls: "btn btn-sm btn-approve", da: "approve", text: "Aprobar" }, "aceptar"],
  [{ cls: "btn btn-sm btn-reject", da: "reject", text: "Rechazar" }, "rechazar"],
  [{ cls: "btn btn-sm", da: "cancel-request", text: "Cancelar solicitud" }, "anular"],
  [{ cls: "btn btn-sm btn-outline", text: "Quitar selección" }, "cancelar"],
  [{ cls: "btn btn-sm btn-outline", text: "Limpiar filtros" }, "cancelar"],
  [{ cls: "btn btn-sm btn-outline", da: "renew-sst-control", text: "Renovar" }, ""],
  [{ cls: "btn btn-sm module-panel-btn module-panel-btn--minimize", da: "toggle-create-panel", text: "Minimizar" }, ""]
];
for (const [spec, expected] of cases) {
  const r = classifyActionButton(el(spec));
  ok(r, `no se clasificó: ${JSON.stringify(spec)}`);
  ok(r.action === expected, `«${spec.text || spec.da || spec.id}» → ${r.action || "(genérico)"}, se esperaba ${expected || "(genérico)"}`);
}
const untouched = [
  { cls: "hr-workspace-tab is-active", da: "hr-workspace-tab", text: "Registrar" },
  { cls: "payroll-contracts-page-btn", text: "2" },
  { cls: "ag-seg__btn", text: "Activos" },
  { cls: "sst-view-toggle__btn", text: "Lista" },
  { cls: "sst-status-card sst-status-card--total", da: "sst-quick-status", text: "Ver todo" },
  { cls: "btn btn-outline", da: "payroll-runs-view", text: "Tarjetas" },
  { cls: "btn btn-outline", da: "admin-users-layout", svg: true },
  { cls: "btn btn-sm", text: "Tarjetas", attrs: { "aria-pressed": "true" } },
  { cls: "btn btn-primary", text: "Entrar", inside: true }
];
for (const spec of untouched) ok(classifyActionButton(el(spec)) === null, `debía quedar intacto: ${JSON.stringify(spec)}`);

/* 6) Cambios pendientes */
const field = (o) => ({ disabled: false, tagName: "INPUT", type: "text", value: "", defaultValue: "", checked: false, defaultChecked: false, ...o });
const form = (fields, touched = true) => ({ __abTouched: touched, querySelectorAll: () => fields });
ok(formIsDirty(form([field({ value: "a", defaultValue: "b" })])) === true, "campo modificado = pendiente");
ok(formIsDirty(form([field({ value: "a", defaultValue: "a" })])) === false, "sin cambios = sin pendiente");
ok(formIsDirty(form([field({ value: "a", defaultValue: "b" })], false)) === false, "valores precargados por código no cuentan");
ok(formIsDirty(form([field({ type: "checkbox", checked: true, defaultChecked: false })])) === true, "checkbox cambiado");
const sel = (idx, opts) => field({ tagName: "SELECT", type: "select-one", multiple: false, selectedIndex: idx, options: opts.map((d) => ({ defaultSelected: d, selected: false })) });
ok(formIsDirty(form([sel(0, [false, false])])) === false, "select con primera opción por defecto = sin cambios");
ok(formIsDirty(form([sel(2, [false, true, false])])) === true, "select cambiado respecto de su opción por defecto");
ok(formIsDirty(form([field({ type: "hidden", value: "x" })])) === false, "los ocultos no cuentan");

/* 7) Toda acción de eliminar confirma antes de ejecutar */
const walk = (d) => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : e.name.endsWith(".js") ? [`${d}/${e.name}`] : []));
const files = walk("modules").filter((f) => !/core\/(auth|config|permission-rules|permission-gate)\.js$/.test(f) && !/action-buttons\.js$/.test(f));
const DESTRUCTIVE = /^(delete|remove|unlink|purge)-|-(delete|remove|purge)(-|$)|^doc-(bulk-)?delete/;
const CONFIRMS = /openConfirm|openConfirmModal|confirmDelete|openPayrollEmployeeUnlinkModal|historyDeleteEventsFlow|confirmBulkDeleteDocuments|confirmSarlaftDelete|runPayrollLegalDelete|openActionConfirm|data-ab-confirm|window\.confirm|ConfirmReason/;
const actions = new Set();
files.forEach((f) => {
  for (const m of read(f).matchAll(/data-action="([a-z0-9-]+)"/g)) if (DESTRUCTIVE.test(m[1]) && !/toggle|snapshot|^deleted-/.test(m[1])) actions.add(m[1]);
});
ok(actions.size >= 20, `se esperaban ≥20 acciones de eliminar y se hallaron ${actions.size}`);
const unconfirmed = [];
for (const a of actions) {
  let handled = false;
  let confirmed = false;
  for (const f of files) {
    const lines = read(f).split("\n");
    lines.forEach((l, i) => {
      if (new RegExp(`(\\[data-action=['"]${a}['"]\\]|case\\s+['"]${a}['"]|(action|act)\\s*===?\\s*['"]${a}['"])`).test(l)) {
        handled = true;
        if (CONFIRMS.test(lines.slice(i, i + 70).join("\n"))) confirmed = true;
      }
    });
  }
  if (!handled || !confirmed) unconfirmed.push(`${a}${handled ? " (sin confirmación)" : " (sin manejador)"}`);
}
ok(unconfirmed.length === 0, `acciones de eliminar sin confirmación: ${unconfirmed.join(", ")}`);

/* 8) Cableado */
ok(/action-buttons\.css\?v=[0-9a-f]{10}/.test(indexHtml), "index.html enlaza action-buttons.css");
const cssLinks = [...indexHtml.matchAll(/<link rel="stylesheet" href="\.\/styles\/([a-z-]+)\.css/g)].map((m) => m[1]);
ok(cssLinks.lastIndexOf("action-buttons") > cssLinks.lastIndexOf("ops-clean-modules"), "action-buttons.css se carga después de las hojas del portal");
ok(/import \* as AntaresActionButtons from "\.\/modules\/ui\/action-buttons\.js"/.test(indexHtml) && /installActionButtons\(\)/.test(indexHtml), "index.html instala el sistema");
const comp = read("modules/ui/components.js");
ok(/from "\.\/action-buttons\.js"/.test(comp) && (comp.match(/actionButton\(\{/g) || []).length >= 5, "los constructores compartidos de modales usan actionButton");

console.log(`action-buttons: OK (${n} comprobaciones, ${actions.size} acciones de eliminar auditadas)`);
