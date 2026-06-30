/**
 * Auditoría de contraste de tema (claro/oscuro) para el portal.
 * - Recorre cada módulo en ambos temas.
 * - Calcula el contraste WCAG real de cada texto visible contra su fondo efectivo
 *   (componiendo capas translúcidas y promediando degradados).
 * - Marca textos con bajo contraste y guarda capturas en assets/ui-audit-v2/.
 *
 * Uso: node scripts/ui-theme-audit.mjs [moduloId]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "assets", "ui-audit-v2");
const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const ONLY = process.argv[2] || null;

const MODULES = [
  { id: "dashboard", view: "dashboard", label: "Dashboard" },
  { id: "mis-solicitudes", view: "requests", label: "Mis solicitudes" },
  { id: "viajes", view: "transport-trips", label: "Viajes" },
  { id: "camiones", view: "transport-vehicles", label: "Camiones" },
  { id: "conductores", view: "transport-drivers", label: "Conductores" },
  { id: "calendario", view: "transport-calendar", label: "Calendario" },
  { id: "historial", view: "history", label: "Historial" },
  { id: "reporteria", view: "reports", label: "Reportería" },
  { id: "gestion-humana", view: "payroll", label: "Gestión humana" },
  { id: "contratacion", view: "hiring", label: "Contratación" },
  { id: "cumplimiento-sst", view: "labor-compliance", label: "Cumplimiento laboral y SST" },
  { id: "contacto-b2b", view: "contact-leads", label: "Contacto web (B2B)" },
  { id: "usuarios-permisos", view: "admin-users", label: "Usuarios y permisos" },
  { id: "autorizaciones", view: "authorizations", label: "Autorizaciones" },
  { id: "mi-perfil", view: "profile", label: "Mi perfil" },
  { id: "notificaciones", view: "notifications", label: "Notificaciones" }
];

const seedStore = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  antares_users_v2: [
    {
      id: "admin-1", name: "Admin QA", email: "admin.qa@antares.test", role: "admin",
      accountStatus: "aprobado", companyId: "co-antares", company: "Transportes Antares",
      documentType: "CC", taxId: "1010101010", phone: "3001112233", department: "Bogota",
      city: "Bogota D.C.", address: "Cra 1 # 1-1", permissions: []
    }
  ],
  antares_companies_v2: [{ id: "co-antares", name: "Transportes Antares", taxId: "900000001-0", companyKind: "propia", active: true }],
  antares_session_v2: { userId: "admin-1", token: "qa-token", expiresAt: new Date(Date.now() + 86400000).toISOString() },
  antares_counters_v2: {}, antares_requests_v2: [], antares_vehicles_v2: [], antares_drivers_v2: [], antares_notifications_v2: [],
  antares_payroll_employees_v2: [], antares_payroll_runs_v2: [],
  antares_positions_v2: [{ id: "pos-conductor", name: "CONDUCTOR", baseSalary: 2500000, active: true, workerRole: "empleado" }],
  antares_vacancies_v2: [], antares_candidates_v2: [], antares_interviews_v2: [], antares_contracts_v2: [],
  antares_hr_absences_v2: [], antares_sst_compliance_v2: [], antares_approvals_v2: [], antares_portal_contacts_v1: []
};

// Función que corre dentro de la página: calcula contraste de todos los textos visibles.
const AUDIT_FN = () => {
  const parseColor = (str) => {
    if (!str || str === "transparent" || str === "none") return null;
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
    const [r, g, b] = parts;
    const a = parts.length >= 4 ? parts[3] : 1;
    return { r, g, b, a };
  };
  // Promedia los stops rgba de un background-image con degradados.
  const gradientAvg = (bgImg) => {
    if (!bgImg || bgImg === "none") return null;
    const matches = bgImg.match(/rgba?\([^)]+\)/g);
    if (!matches || !matches.length) return null;
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    for (const c of matches) {
      const col = parseColor(c);
      if (!col) continue;
      // ignora stops totalmente transparentes (no aportan color)
      r += col.r * col.a; g += col.g * col.a; b += col.b * col.a; a += col.a; n += 1;
    }
    if (!n || a === 0) return null;
    return { r: r / a, g: g / a, b: b / a, a: Math.min(1, a / n) };
  };
  const srcOver = (fg, bg) => {
    const a = fg.a + bg.a * (1 - fg.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
      g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
      b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
      a
    };
  };
  // Pintura propia de un elemento (gradiente debajo + backgroundColor encima).
  const ownPaint = (el) => {
    const cs = getComputedStyle(el);
    const solid = parseColor(cs.backgroundColor);
    const grad = gradientAvg(cs.backgroundImage);
    let layer = null;
    if (grad) layer = grad;
    if (solid && solid.a > 0) layer = layer ? srcOver(solid, layer) : solid;
    return layer; // puede ser null (transparente)
  };
  const baseBg = () => {
    const dark = document.body.getAttribute("data-theme") === "dark";
    return dark ? { r: 7, g: 24, b: 36, a: 1 } : { r: 238, g: 246, b: 252, a: 1 };
  };
  const effectiveBg = (el) => {
    let acc = { r: 0, g: 0, b: 0, a: 0 };
    let node = el;
    while (node && node.nodeType === 1) {
      const own = ownPaint(node);
      if (own) acc = srcOver(acc, own);
      if (acc.a >= 0.995) break;
      node = node.parentElement;
    }
    if (acc.a < 0.995) acc = srcOver(acc, baseBg());
    return acc;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const contrast = (c1, c2) => {
    const l1 = lum(c1), l2 = lum(c2);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  };
  const cssPath = (el) => {
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && parts.length < 4) {
      let s = node.tagName.toLowerCase();
      if (node.id) { s += `#${node.id}`; parts.unshift(s); break; }
      const cls = (node.className && typeof node.className === "string")
        ? node.className.trim().split(/\s+/).slice(0, 3).map((c) => `.${c}`).join("") : "";
      s += cls;
      parts.unshift(s);
      node = node.parentElement;
    }
    return parts.join(" > ");
  };

  const root = document.querySelector("#view-root") || document.body;
  const all = root.querySelectorAll("*");
  const results = [];
  const seen = new Set();
  for (const el of all) {
    // sólo elementos con texto directo no vacío
    let hasText = false;
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.textContent.trim().length > 0) { hasText = true; break; }
    }
    if (!hasText) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.15) continue;
    const fg = parseColor(cs.color);
    if (!fg) continue;
    const bg = effectiveBg(el);
    const fgOnBg = fg.a < 1 ? srcOver(fg, bg) : fg;
    const ratio = contrast(fgOnBg, bg);
    const fontSize = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = fontSize >= 24 || (fontSize >= 18.66 && bold);
    const threshold = large ? 3.0 : 4.5;
    if (ratio >= threshold) continue;
    const txt = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50);
    const key = cssPath(el) + "|" + txt;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({
      ratio: Math.round(ratio * 100) / 100,
      sev: ratio < 2 ? "CRIT" : ratio < threshold ? "LOW" : "ok",
      text: txt,
      color: `rgb(${Math.round(fgOnBg.r)},${Math.round(fgOnBg.g)},${Math.round(fgOnBg.b)})`,
      bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
      fontSize, path: cssPath(el)
    });
  }
  results.sort((a, b) => a.ratio - b.ratio);
  return results.slice(0, 30);
};

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const summary = {};

  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate((data) => {
      for (const [k, v] of Object.entries(data.store)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
      localStorage.setItem("antares_theme_v1", data.theme);
    }, { store: seedStore, theme });
    await page.reload({ waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(500);

    const mods = ONLY ? MODULES.filter((m) => m.id === ONLY) : MODULES;
    for (const mod of mods) {
      const nav = page.locator(`[data-view="${mod.view}"]`).first();
      if (!(await nav.count())) { summary[`${mod.id}__${theme}`] = { error: "nav not found" }; continue; }
      await nav.click();
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(OUT_DIR, `${mod.id}__${theme}.png`), fullPage: false }).catch(() => {});
      const issues = await page.evaluate(AUDIT_FN);
      summary[`${mod.id}__${theme}`] = { count: issues.length, issues };
    }
    await context.close();
  }
  await browser.close();

  // Reporte legible
  let totalCrit = 0, totalLow = 0;
  for (const [key, val] of Object.entries(summary)) {
    if (val.error) { console.log(`\n### ${key}: ERROR ${val.error}`); continue; }
    const crit = val.issues.filter((i) => i.sev === "CRIT");
    const low = val.issues.filter((i) => i.sev === "LOW");
    totalCrit += crit.length; totalLow += low.length;
    if (!val.issues.length) continue;
    console.log(`\n### ${key} — ${val.issues.length} textos bajo umbral (${crit.length} CRIT)`);
    for (const i of val.issues.slice(0, 14)) {
      console.log(`  [${i.sev} ${i.ratio}] "${i.text}" ${i.color} on ${i.bg}\n      ${i.path}`);
    }
  }
  console.log(`\n==== TOTAL: ${totalCrit} CRIT, ${totalLow} LOW ====`);
}

run().catch((e) => { console.error(e); process.exit(1); });
