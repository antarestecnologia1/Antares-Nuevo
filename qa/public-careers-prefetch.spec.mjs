import { expect, test } from "@playwright/test";

/**
 * Carreras públicas: la petición de vacantes debe salir en el <head> (no al final del arranque)
 * y la segunda visita debe pintar desde caché sin esperar a la red.
 */

const VACANCY_ROWS = [
  {
    id: "vac-1",
    title: "Conductor refrigerado",
    department: "Cundinamarca",
    city: "Bogotá",
    deadline: futureYmd(30),
    publishedFrom: null,
    salaryOffer: 2800000,
    requirements: "Licencia C2 vigente.",
    status: "Publicada",
    positionName: "Conductor",
    imageUrl: ""
  }
];

function futureYmd(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** El portal solo acepta antares_api_base en hosts locales; el servidor de QA sirve 127.0.0.1. */
async function stubVacanciesApi(page, { delayMs = 0, fail = false } = {}) {
  const calls = [];
  await page.addInitScript(() => {
    localStorage.setItem("antares_api_base", location.origin);
  });
  await page.route("**/api/public/vacancies", async (route) => {
    calls.push({ at: Date.now() });
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
    if (fail) {
      await route.fulfill({ status: 503, contentType: "application/json", body: '{"message":"cold"}' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(VACANCY_ROWS)
    });
  });
  return calls;
}

test("la petición de vacantes sale antes de que termine de cargar el bundle", async ({ page }) => {
  await stubVacanciesApi(page, { delayMs: 1500 });

  const timeline = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/public/vacancies")) timeline.push("vacancies");
    if (req.url().includes("app.js")) timeline.push("app.js");
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#careers-vacancies-grid .careers-card h3")).toHaveText("Conductor refrigerado");

  // El prefetch del <head> se adelanta al último módulo de la página.
  expect(timeline.indexOf("vacancies")).toBeGreaterThanOrEqual(0);
  expect(timeline.indexOf("vacancies")).toBeLessThan(timeline.indexOf("app.js"));
});

test("mientras el servidor despierta se avisa, y la segunda visita pinta desde caché", async ({ page }) => {
  await stubVacanciesApi(page, { delayMs: 1200 });
  await page.goto("/");
  await expect(page.locator("#careers-vacancies-grid .careers-card h3")).toHaveText("Conductor refrigerado");

  // Segunda visita con la API caída: la caché sostiene el contenido.
  await page.unrouteAll();
  const calls = await stubVacanciesApi(page, { fail: true });
  await page.reload();
  await expect(page.locator("#careers-vacancies-grid .careers-card h3")).toHaveText("Conductor refrigerado", {
    timeout: 5000
  });
  expect(calls.length).toBeGreaterThan(0);
});

test("sin caché y sin API se ofrece reintentar en lugar de un spinner infinito", async ({ page }) => {
  await stubVacanciesApi(page, { fail: true });
  await page.goto("/");
  await expect(page.locator("#careers-vacancies-grid [data-careers-retry]")).toBeVisible({ timeout: 15000 });
});
