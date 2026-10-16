import { test, expect } from "@playwright/test";

/**
 * Contratación · diseño adaptable (zoom alejado / pantallas anchas).
 * Protege: sin desbordes horizontales, cabecera en una sola fila, tablero visible completo
 * y escala legible del módulo (.hiring-studio usa `zoom` por ancho de ventana).
 */
const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const now = new Date();
const iso = (d) => new Date(now.getTime() + d * 864e5).toISOString();

const candidate = (i, name, status) => ({
  id: `c${i}`, name, email: `c${i}@test.com`, phone: `30000000${i}`, documentType: "CC", idDoc: `1000${i}`,
  department: "Antioquia", city: "La Ceja", educationLevel: "Profesional", experienceYears: 3 + i,
  expectedSalary: 2400000, availabilityDate: iso(7).slice(0, 10), vacancyId: "vac-1", vacancyTitle: "Conductor",
  status, attachments: [], source: "Portal RRHH", createdAt: iso(-i)
});

const seedStore = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  antares_users_v2: [{
    id: "admin-1", name: "Admin QA", email: "admin.qa@antares.test", role: "admin", accountStatus: "aprobado",
    companyId: "co-antares", company: "Transportes Antares", documentType: "CC", taxId: "1010101010", phone: "3001112233",
    department: "Bogota", city: "Bogota D.C.", address: "Cra 1 # 1-1", permissions: [],
    dataPolicyAcceptedAt: now.toISOString(), dataPolicyVersion: "2025-v1", termsAcceptedAt: now.toISOString()
  }],
  antares_companies_v2: [],
  antares_positions_v2: [{ id: "pos-1", name: "Conductor", workerRole: "conductor", baseSalary: 2500000, contractTypeDefault: "Termino fijo", active: true, createdAt: iso(-5) }],
  antares_vacancies_v2: [{ id: "vac-1", title: "Conductor", positionId: "pos-1", positionName: "Conductor", workerRole: "conductor", contractTypeDefault: "Termino fijo", city: "La Ceja", department: "Antioquia", mode: "Presencial", slots: 2, salary: 2600000, status: "Publicada", deadline: iso(20).slice(0, 10), createdAt: iso(-3) }],
  antares_candidates_v2: [
    candidate(1, "Carlos Mejía", "Recibido"), candidate(2, "Luisa Ortiz", "Recibido"),
    candidate(3, "Jhon Zapata", "Preseleccionado"), candidate(4, "Oscar Londoño", "Entrevistado"),
    candidate(5, "Julián Tobón", "Oferta enviada")
  ],
  antares_interviews_v2: [], antares_contracts_v2: [], antares_emails_v2: [],
  antares_session_v2: {
    userId: "admin-1", role: "admin", email: "admin.qa@antares.test", lastActivityAt: Date.now(),
    profileSnapshot: { id: "admin-1", name: "Admin QA", email: "admin.qa@antares.test", role: "admin", dataPolicyAcceptedAt: now.toISOString(), dataPolicyVersion: "2025-v1", termsAcceptedAt: now.toISOString() }
  },
  antares_hr_hiring_workspace_v1: JSON.stringify({ workspace: "data", dataSection: "candidates", candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", candidateView: "board", pipelineStage: "" })
};

const WIDTHS = [
  { w: 1280, h: 720, minZoom: 1 },
  { w: 1920, h: 1080, minZoom: 1.15 },
  { w: 2560, h: 1440, minZoom: 1.4 },
  { w: 3200, h: 1800, minZoom: 2.1 }
];

test.setTimeout(180000);

for (const vp of WIDTHS) {
  test(`Contratación se ve ordenada a ${vp.w}px`, async ({ page, context }) => {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await context.addInitScript((payload) => {
      const raw = new Set(["antares_portal_data_ver", "antares_users_storage_ver", "antares_hr_hiring_workspace_v1"]);
      localStorage.clear();
      Object.entries(payload).forEach(([k, v]) => localStorage.setItem(k, raw.has(k) ? String(v) : JSON.stringify(v)));
    }, seedStore);
    await page.goto(`${BASE_URL}#portal/hiring`, { waitUntil: "networkidle" });
    await page.waitForSelector(".hiring-studio", { timeout: 15000 });

    const zoom = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".hiring-studio")).zoom) || 1);
    expect(zoom).toBeGreaterThanOrEqual(vp.minZoom);

    for (const tab of ["data", "operate", "consult"]) {
      await page.locator(`[data-action='hr-workspace-tab'][data-tab='${tab}']`).first().click();
      await page.waitForSelector(`[data-hiring-panel='${tab}']:not(.hidden)`, { timeout: 5000 });
      const m = await page.evaluate(() => {
        const header = document.querySelector(".hiring-studio > .hr-workspace-header");
        const studio = document.querySelector(".hiring-studio");
        const z = parseFloat(getComputedStyle(studio).zoom) || 1;
        return {
          overflowX: document.documentElement.scrollWidth - window.innerWidth,
          headerH: header ? header.getBoundingClientRect().height / z : 0,
          studioW: studio.getBoundingClientRect().width
        };
      });
      expect(m.overflowX, `desborde horizontal en ${tab}`).toBeLessThanOrEqual(1);
      expect(m.headerH, `cabecera en ${tab} ocupa demasiado alto`).toBeLessThan(vp.w >= 1700 ? 110 : 170);
    }

    // Selección: el tablero cabe en el ancho y muestra todas las etapas visibles
    await page.locator("[data-action='hr-workspace-tab'][data-tab='data']").first().click();
    await page.waitForSelector(".hiring-board__col");
    const board = await page.evaluate(() => {
      const el = document.querySelector(".hiring-board");
      return { cols: document.querySelectorAll(".hiring-board__col").length, scroll: el.scrollWidth - el.clientWidth };
    });
    expect(board.cols).toBeGreaterThanOrEqual(4);
    expect(board.scroll, "el tablero no debe tener scroll horizontal").toBeLessThanOrEqual(1);

    // Ficha lateral: se abre dentro de la ventana y se cierra
    await page.locator(".hiring-kanban-card").first().click();
    const drawer = page.locator(".hiring-drawer");
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(450); // fin de la animación de entrada
    const box = await drawer.evaluate((el) => { const r = el.getBoundingClientRect(); return { right: r.right, left: r.left, h: r.height, vw: window.innerWidth, vh: window.innerHeight }; });
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(box.vw + 1);
    expect(box.h).toBeLessThanOrEqual(box.vh + 1);
    await page.locator(".hiring-drawer__close").first().click();
    await expect(drawer).toHaveCount(0);
  });
}
