import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

test("index público: botones sin errores de consola", async ({ page }) => {
  const jsErrors = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const t = msg.text();
    /* Turnstile / widgets externos suelen devolver 400 en localhost; no es regresión del index. */
    if (/Failed to load resource/i.test(t)) return;
    if (/challenges\.cloudflare|turnstile/i.test(t)) return;
    jsErrors.push(t);
  });
  page.on("pageerror", (err) => {
    jsErrors.push(String(err?.message || err));
  });

  await page.addInitScript(() => {
    try {
      localStorage.removeItem("antares_session_v2");
    } catch (_e) {
      /* noop */
    }
    try {
      document.documentElement.classList.remove("antares-booting-portal");
    } catch (_e2) {
      /* noop */
    }
  });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForSelector("#public-app", { timeout: 15_000 });
  await page.waitForSelector("#open-auth", { state: "visible", timeout: 10_000 });

  await page.locator("#open-auth").click();
  await expect(page.locator("#auth-modal")).not.toHaveClass(/hidden/);
  await expect(page.locator("#auth-content")).toBeAttached();

  await page.locator("#close-auth").click();
  await expect(page.locator("#auth-modal")).toHaveClass(/hidden/);

  await page.locator("#open-auth-hero").click();
  await expect(page.locator("#auth-modal")).not.toHaveClass(/hidden/);
  await page.locator("#close-auth").click();
  await expect(page.locator("#auth-modal")).toHaveClass(/hidden/);

  const hamburger = page.locator("#hamburger-btn");
  if (await hamburger.isVisible()) {
    await hamburger.click();
    await expect(page.locator("#main-nav")).toHaveClass(/nav-open/);
    await expect(page.locator("body")).toHaveClass(/public-nav-open/);
    await hamburger.click();
    await expect(page.locator("#main-nav")).not.toHaveClass(/nav-open/);
  }

  await page.locator('#theme-toggle-public [data-theme-option="dark"]').click();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
  await page.locator('#theme-toggle-public [data-theme-option="light"]').click();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "light");

  await page.locator('#lang-toggle-public [data-lang-option="en"]').click();
  await page.locator('#lang-toggle-public [data-lang-option="es"]').click();

  expect(jsErrors, `Errores JS en consola: ${JSON.stringify(jsErrors, null, 2)}`).toEqual([]);
});
