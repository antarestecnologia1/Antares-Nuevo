/**
 * Regenera CSS por módulo (namespaces independientes) desde payroll-module.css.
 * Uso: node scripts/split-portal-module-css.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = fs.readFileSync(path.join(root, "styles/payroll-module.css"), "utf8");
const lines = src.split(/\r?\n/);

function sliceLines(fromMarker, toMarker) {
  const start = lines.findIndex((l) => l.includes(fromMarker));
  const end = toMarker ? lines.findIndex((l, i) => i > start && l.includes(toMarker)) : lines.length;
  if (start < 0) throw new Error(`Marker not found: ${fromMarker}`);
  return lines.slice(start, end >= 0 ? end : lines.length).join("\n");
}

function studioShellTemplate({ name, root, prefix, accent, badge }) {
  const P = prefix;
  const R = root;
  return `/* ===================================================================
   ${name} — Studio independiente
   Alcance exclusivo: .${R}
   =================================================================== */

.${R} {
  --${P}-navy: #0b2138;
  --${P}-blue: var(--primary, #377cc0);
  --${P}-blue-soft: var(--primary-light, #cce5f8);
  --${P}-surface: #f4f8fc;
  --${P}-card: #ffffff;
  --${P}-edge: rgba(55, 124, 192, 0.14);
  --${P}-edge-strong: rgba(55, 124, 192, 0.22);
  --${P}-shadow: 0 16px 48px rgba(11, 33, 56, 0.07);
  --${P}-shadow-sm: 0 6px 20px rgba(11, 33, 56, 0.06);
  --${P}-radius: 18px;
  --${P}-radius-sm: 12px;
  --${P}-accent: ${accent};
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding-bottom: 0.5rem;
}

.${R} .${P}-studio-head,
.${R} .${root.replace("-studio", "")}-studio-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem 1.5rem;
  padding: 1.15rem 1.35rem;
  border-radius: var(--${P}-radius);
  border: 1px solid var(--${P}-edge-strong);
  background: linear-gradient(135deg, color-mix(in srgb, var(--${P}-accent) 8%, transparent), transparent 55%), var(--${P}-card);
  box-shadow: var(--${P}-shadow-sm);
  position: relative;
  overflow: hidden;
}

.${R} .${P}-operate {
  display: grid;
  grid-template-columns: minmax(10.5rem, 13rem) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.${R} .${P}-operate__rail {
  position: sticky;
  top: 0.75rem;
  padding: 0.65rem;
  border-radius: var(--${P}-radius);
  border: 1px solid var(--${P}-edge);
  background: var(--${P}-card);
  box-shadow: var(--${P}-shadow-sm);
}

.${R} .${P}-operate__rail-label {
  display: block;
  margin: 0 0 0.5rem 0.55rem;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-soft);
}

.${R} .${P}-operate__main { min-width: 0; }

.${R} .${P}-data-panel {
  padding: 1rem 1.1rem 1.15rem;
  border-radius: var(--${P}-radius);
  border: 1px solid var(--${P}-edge);
  background: var(--${P}-card);
  box-shadow: var(--${P}-shadow-sm);
}

.${R} .${P}-form-card.admin-users-data-card {
  border-radius: var(--${P}-radius);
  border: 1px solid var(--${P}-edge-strong);
  background: var(--${P}-card);
  box-shadow: var(--${P}-shadow);
  overflow: hidden;
}

@media (max-width: 900px) {
  .${R} .${P}-operate { grid-template-columns: 1fr; }
  .${R} .${P}-operate__rail { position: static; }
}
`;
}

function transformBlock(text, map) {
  let out = text;
  for (const [from, to] of map) {
    out = out.split(from).join(to);
  }
  return out;
}

const ghToPayroll = [
  [".gh-studio", ".payroll-studio"],
  ["--gh-", "--pay-"],
  [".gh-studio-head", ".payroll-studio-head"],
  [".gh-studio-kpi", ".payroll-studio-kpi"],
  [".gh-operate", ".payroll-operate"],
  [".gh-form-card", ".payroll-form-card"],
  [".gh-data-panel", ".payroll-data-panel"],
  [".gh-emp-wizard", ".payroll-wizard"],
  [".gh-emp-form", ".payroll-emp-form"],
  [".gh-step-hint", ".payroll-wizard__step-hint"],
  ["gh-module.css", "payroll-module.css"],
  ["GH Studio", "Payroll Studio"],
  ["Gestión humana, Transporte, Solicitudes", "Gestión humana / nómina únicamente"]
];

const payrollCore = transformBlock(
  lines.slice(0, lines.findIndex((l) => l.includes("/* ── Solicitudes"))).join("\n"),
  ghToPayroll
);

const payrollResponsive = transformBlock(
  sliceLines("/* ── Responsive ──", "/* Viajes"),
  ghToPayroll
);

fs.writeFileSync(
  path.join(root, "styles/payroll-module.css"),
  payrollCore + "\n\n" + payrollResponsive + "\n"
);

const requestsBlock = transformBlock(
  sliceLines("/* ── Solicitudes", "/* ── Responsive"),
  [
    [".requests-shell .requests-data-panel.gh-data-panel", ".requests-studio .requests-data-panel"],
    [".requests-shell ", ".requests-studio "],
    ["var(--gh-", "var(--req-"],
    ["--gh-", "--req-"]
  ]
);

const requestsShell = studioShellTemplate({
  name: "Mis solicitudes",
  root: "requests-studio",
  prefix: "req",
  accent: "#2563eb",
  badge: "Operaciones"
});

fs.writeFileSync(
  path.join(root, "styles/requests-module.css"),
  requestsShell + "\n" + requestsBlock.replace(/\.gh-operate-panel/g, ".requests-operate-panel").replace(/\.gh-data-panel/g, ".requests-data-panel") + "\n"
);

const transportBlock = transformBlock(
  lines.slice(lines.findIndex((l) => l.includes("/* Viajes"))).join("\n"),
  [
    [".gh-studio", ".transport-studio"],
    ["--gh-", "--trn-"],
    [".gh-operate", ".transport-operate"],
    [".gh-form-card", ".transport-form-card"],
    [".gh-data-panel", ".transport-data-panel"],
    [".gh-transport-form", ".transport-form"],
    [".gh-emp-wizard", ".transport-wizard"],
    [".gh-step-hint", ".transport-wizard__step-hint"],
    [".gh-transport-wizard__meta", ".transport-wizard__meta"]
  ]
);

const transportShell = studioShellTemplate({
  name: "Viajes",
  root: "transport-studio",
  prefix: "trn",
  accent: "#1d4ed8",
  badge: "Transporte"
});

fs.writeFileSync(path.join(root, "styles/transport-module.css"), transportShell + "\n" + transportBlock + "\n");

for (const spec of [
  { file: "vehicles-module.css", root: "vehicles-studio", prefix: "veh", accent: "#0d9488", name: "Camiones" },
  { file: "history-module.css", root: "history-studio", prefix: "hist", accent: "#64748b", name: "Historial" },
  { file: "drivers-module.css", root: "drivers-studio", prefix: "drv", accent: "#0891b2", name: "Conductores" },
  { file: "calendar-module.css", root: "calendar-studio", prefix: "cal", accent: "#7c3aed", name: "Calendario" },
  { file: "reports-module.css", root: "reports-studio", prefix: "rpt", accent: "#0369a1", name: "Reportería" },
  { file: "dashboard-module.css", root: "dashboard-studio", prefix: "dash", accent: "#0f766e", name: "Dashboard" },
  { file: "sst-module.css", root: "sst-studio", prefix: "sst", accent: "#b45309", name: "Cumplimiento laboral y SST" },
  { file: "b2b-module.css", root: "b2b-studio", prefix: "b2b", accent: "#c026d3", name: "Contacto web B2B" },
  { file: "admin-users-module.css", root: "admin-users-studio", prefix: "adm", accent: "#4f46e5", name: "Usuarios y permisos" },
  { file: "authorizations-module.css", root: "authorizations-studio", prefix: "aut", accent: "#dc2626", name: "Autorizaciones" },
  { file: "profile-module.css", root: "profile-studio", prefix: "prf", accent: "#0284c7", name: "Mi perfil" },
  { file: "notifications-module.css", root: "notifications-studio", prefix: "ntf", accent: "#6366f1", name: "Notificaciones, timbre y avisos" }
]) {
  const p = path.join(root, "styles", spec.file);
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, studioShellTemplate({ ...spec, badge: spec.name }) + "\n");
  }
}

console.log("OK split-portal-module-css");
