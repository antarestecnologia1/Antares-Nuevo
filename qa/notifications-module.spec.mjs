/**
 * Pruebas del módulo Notificaciones: dominio en runtime + bandeja, filtros,
 * lectura, borrado, preferencias y campana.
 */
import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const KEY_NOTIF = "antares_notifications_v2";
const KEY_USERS = "antares_users_v2";
const KEY_SESSION = "antares_session_v2";

const now = new Date();
const iso = (d) => d.toISOString();
const daysAgo = (n) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
};

const adminUser = {
  id: "admin-1",
  requiresDataPolicyAcceptance: false,
  requiresTermsAcceptance: false,
  name: "Admin QA Notif",
  email: "admin.notif@antares.test",
  role: "admin",
  accountStatus: "aprobado",
  companyId: "co-antares",
  company: "Transportes Antares",
  permissions: []
};

const fixtureNotifications = [
  {
    id: "not-req-1",
    userId: "admin-1",
    title: "Solicitud nueva",
    body: "Hay una solicitud pendiente [ref:abc]",
    createdAt: iso(now),
    readAt: null,
    category: "request",
    deepLink: "#portal/requests"
  },
  {
    id: "not-sys-1",
    userId: "admin-1",
    title: "Aviso sistema",
    body: "Mensaje de sistema",
    createdAt: iso(now),
    readAt: null,
    category: "system"
  },
  {
    id: "not-hr-1",
    userId: "admin-1",
    title: "Aviso no renovación · Colaborador",
    body: "Contrato a término fijo",
    createdAt: iso(daysAgo(1)),
    readAt: iso(now),
    category: "hr",
    deepLink: "#portal/payroll"
  },
  {
    id: "not-auth-1",
    userId: "admin-1",
    title: "Autorización pendiente",
    body: "Hay una aprobación por revisar",
    createdAt: iso(daysAgo(8)),
    readAt: null,
    category: "authorization"
  }
];

const seedStore = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  [KEY_USERS]: [adminUser],
  [KEY_NOTIF]: fixtureNotifications,
  [KEY_SESSION]: {
    userId: "admin-1",
    role: "admin",
    email: adminUser.email,
    lastActivityAt: Date.now(),
    profileSnapshot: {
      id: "admin-1",
      name: adminUser.name,
      email: adminUser.email,
      role: "admin"
    }
  }
};

test.describe("Módulo de notificaciones", () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript((payload) => {
      const rawKeys = new Set(["antares_portal_data_ver", "antares_users_storage_ver"]);
      localStorage.clear();
      Object.entries(payload).forEach(([key, value]) => {
        localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
      });
    }, seedStore);
  });

  async function openInbox(page) {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#portal-app", { timeout: 15_000 });
    await page.waitForFunction(() => Boolean(window.AntaresNotificacionesDomain && window.currentUser?.()), null, {
      timeout: 15_000
    });
    await page.evaluate((rows) => {
      window.stopNotificationsPolling?.();
      const key = window.KEYS?.notifications || "antares_notifications_v2";
      if (window.AntaresPersistence?.write) {
        window.AntaresPersistence.write(key, rows, { skipSyncSchedule: true });
      } else {
        localStorage.setItem(key, JSON.stringify(rows));
      }
      if (window.state) {
        window.state.notificationsUi = { filter: "all", renderLimit: 30 };
        window.state.currentView = "notifications";
      }
      window.updateNotificationBadge?.();
      window.location.hash = "#portal/notifications";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      window.setView?.("notifications");
      window.renderPortalView?.();
    }, fixtureNotifications);
    await page.waitForSelector(".notifications-studio", { timeout: 10_000 });
    await page.waitForSelector(".ntf-card", { timeout: 10_000 });
  }

  async function clickSel(page, selector) {
    await page.waitForSelector(selector, { state: "attached", timeout: 8_000 });
    await page.evaluate((target) => {
      const el = document.querySelector(target);
      if (!el) throw new Error(`No se encontró ${target}`);
      el.click();
    }, selector);
  }

  test("dominio: categoría, filtros, deep link, lectura y toasts obsoletos", async ({ page }) => {
    await openInbox(page);
    const report = await page.evaluate(() => {
      const D = window.AntaresNotificacionesDomain;
      const sample = [
        { title: "Nueva solicitud", body: "x" },
        { title: "Aprobación lista", body: "autorizada" },
        { title: "Contrato vencido", body: "empleado" },
        { title: "Ping", body: "hola" },
        { category: "hr", title: "Otro" }
      ];
      const cats = sample.map((n) => D.resolveNotificationCategory(n));
      const list = [
        { id: "1", title: "Solicitud nueva", body: "a", category: "request", readAt: null },
        { id: "2", title: "Aviso", body: "b", category: "system", readAt: new Date().toISOString() }
      ];
      const unread = D.filterNotificationsByUiFilter(list, "unread");
      const req = D.filterNotificationsByUiFilter(list, "request");
      const stale = D.collectStaleNotificationIdsForToastSuppress([
        { id: "old", createdAt: new Date(Date.now() - 120_000).toISOString() },
        { id: "fresh", createdAt: new Date().toISOString() },
        { id: "bad" }
      ]);
      const buckets = D.groupNotificationsByDateBucket([
        { id: "t", createdAt: new Date().toISOString() },
        { id: "y", createdAt: new Date(Date.now() - 86_400_000).toISOString() },
        { id: "o", createdAt: new Date(Date.now() - 10 * 86_400_000).toISOString() }
      ]);
      const merged = D.mergeNotificationsListPreserveReadAt(
        [{ id: "x", readAt: "2026-01-01T00:00:00.000Z", title: "A", body: "B" }],
        [{ id: "x", readAt: null, title: "A", body: "B" }]
      );
      return {
        cats,
        unreadIds: unread.map((n) => n.id),
        reqIds: req.map((n) => n.id),
        stale,
        bucketIds: buckets.map((b) => b.id),
        body: D.sanitizeNotificationBodyForDisplay("Hola  [ref:zz]  mundo"),
        deepExplicit: D.resolveNotificationDeepLink({ deepLink: "#portal/requests" }),
        deepEntity: D.resolveNotificationDeepLink({ entityType: "trip" }),
        deepHr: D.resolveNotificationDeepLink({ title: "Nómina de marzo" }),
        isReadAt: D.notificationIsRead({ readAt: "2026-01-01T00:00:00.000Z" }),
        isReadLeido: D.notificationIsRead({ leido: true }),
        isUnread: D.notificationIsRead({ readAt: null }),
        mergedReadAt: merged[0]?.readAt || null,
        alertsOn: D.isInAppNotificationAlertsEnabled(),
        soundOn: D.isSonidoNotificacionesHabilitado()
      };
    });

    expect(report.cats).toEqual(["request", "authorization", "hr", "system", "hr"]);
    expect(report.unreadIds).toEqual(["1"]);
    expect(report.reqIds).toEqual(["1"]);
    expect(report.stale).toEqual(["old", "bad"]);
    expect(report.bucketIds).toEqual(["today", "yesterday", "older"]);
    expect(report.body).toBe("Hola mundo");
    expect(report.deepExplicit).toBe("#portal/requests");
    expect(report.deepEntity).toBe("#portal/transport-trips");
    expect(report.deepHr).toBe("#portal/payroll");
    expect(report.isReadAt).toBe(true);
    expect(report.isReadLeido).toBe(true);
    expect(report.isUnread).toBe(false);
    expect(report.mergedReadAt).toBe("2026-01-01T00:00:00.000Z");
    expect(report.alertsOn).toBe(true);
    expect(report.soundOn).toBe(true);
  });

  test("bandeja: métricas, filtros, marcar leída y campana", async ({ page }) => {
    await openInbox(page);

    await expect(page.locator(".ntf-studio-head__sub")).toContainText("4 mensajes");
    await expect(page.locator(".ntf-studio-head__sub")).toContainText("3 sin leer");
    await expect(page.locator(".ntf-card")).toHaveCount(4);
    await expect(page.locator(".ntf-card--unread")).toHaveCount(3);

    const badge = page.locator('.side-link[data-view="notifications"] .side-link-badge');
    await expect(badge).toHaveText("3");

    await clickSel(page, "[data-action='notif-filter'][data-filter='unread']");
    await expect(page.locator(".ntf-card")).toHaveCount(3);
    await expect(page.locator(".ntf-filter-btn--active")).toContainText("Sin leer");

    await clickSel(page, "[data-action='notif-filter'][data-filter='request']");
    await expect(page.locator(".ntf-card")).toHaveCount(1);
    await expect(page.locator(".ntf-card__title")).toHaveText("Solicitud nueva");

    await clickSel(page, "[data-action='notif-filter'][data-filter='hr']");
    await expect(page.locator(".ntf-card")).toHaveCount(1);
    await expect(page.locator(".ntf-card__title")).toHaveText("Aviso no renovación · Colaborador");

    await clickSel(page, "[data-action='notif-filter'][data-filter='system']");
    await expect(page.locator(".ntf-card")).toHaveCount(1);

    await clickSel(page, "[data-action='notif-filter'][data-filter='all']");
    await clickSel(page, ".ntf-card[data-id='not-sys-1'] [data-action='notif-read']");
    await expect(page.locator(".ntf-studio-head__sub")).toContainText("2 sin leer", { timeout: 8_000 });
    await expect(badge).toHaveText("2");
    await expect(page.locator(".ntf-card[data-id='not-sys-1'] .ntf-card__read-badge")).toHaveText("Leída");
  });

  test("bandeja: clic en tarjeta, Abrir, avisos independientes del timbre y borrar", async ({ page }) => {
    await openInbox(page);

    await page.evaluate(() => {
      const card = document.querySelector(".ntf-card[data-id='not-sys-1']");
      if (!card) throw new Error("No está la tarjeta not-sys-1");
      card.querySelector(".ntf-card__title")?.click();
    });
    await expect(page.locator(".ntf-card[data-id='not-sys-1'] .ntf-card__read-badge")).toHaveText("Leída", {
      timeout: 8_000
    });

    await clickSel(page, ".ntf-card[data-id='not-req-1'] [data-action='notif-open']");
    await page.waitForFunction(() => String(window.state?.currentView || "") === "requests", null, { timeout: 8_000 });
    const viewAfterOpen = await page.evaluate(() => window.state?.currentView);
    expect(viewAfterOpen).toBe("requests");
    const reqRead = await page.evaluate(() => {
      const rows = window.AntaresNotificacionesDomain.getCurrentNotifications();
      const row = rows.find((n) => n.id === "not-req-1");
      return window.AntaresNotificacionesDomain.notificationIsRead(row);
    });
    expect(reqRead).toBe(true);

    await page.evaluate(() => {
      window.setView?.("notifications");
      window.renderPortalView?.();
    });
    await page.waitForSelector(".notifications-studio");

    await clickSel(page, "[data-action='notif-toggle-alerts']");
    const afterAlertsOff = await page.evaluate(() => ({
      alerts: window.isInAppNotificationAlertsEnabled(),
      sound: window.isSonidoNotificacionesHabilitado()
    }));
    expect(afterAlertsOff.alerts).toBe(false);
    expect(afterAlertsOff.sound).toBe(true);
    await expect(page.locator("[data-action='notif-toggle-sound']")).toBeDisabled();
    await expect(page.locator("[data-notif-pref='master']")).toHaveAttribute("aria-pressed", "false");

    await clickSel(page, "[data-action='notif-toggle-alerts']");
    await clickSel(page, "[data-action='notif-toggle-sound']");
    const afterSoundOff = await page.evaluate(() => ({
      alerts: window.isInAppNotificationAlertsEnabled(),
      sound: window.isSonidoNotificacionesHabilitado()
    }));
    expect(afterSoundOff.alerts).toBe(true);
    expect(afterSoundOff.sound).toBe(false);

    await clickSel(page, "[data-notif-pref='master']");
    const afterSidebar = await page.evaluate(() => ({
      alerts: window.isInAppNotificationAlertsEnabled(),
      sound: window.isSonidoNotificacionesHabilitado()
    }));
    expect(afterSidebar.alerts).toBe(false);
    expect(afterSidebar.sound).toBe(false);

    await clickSel(page, "[data-notif-pref='master']");
    await page.evaluate(() => {
      window.setNotificationAlertsEnabled?.(true);
      window.setNotificationSoundMuted?.(false);
      window.renderPortalView?.();
    });

    await clickSel(page, ".ntf-card[data-id='not-hr-1'] [data-action='notif-delete']");
    await page.waitForSelector("#crud-confirm", { timeout: 8_000 });
    await clickSel(page, "#crud-confirm");
    await page.waitForFunction(
      () => {
        const rows = window.AntaresNotificacionesDomain.getCurrentNotifications();
        return rows.every((n) => n.id !== "not-hr-1");
      },
      null,
      { timeout: 8_000 }
    );

    await clickSel(page, "[data-action='notif-read-all']");
    await page.waitForFunction(
      () => window.AntaresNotificacionesDomain.getCurrentNotifications().every((n) =>
        window.AntaresNotificacionesDomain.notificationIsRead(n)
      ),
      null,
      { timeout: 8_000 }
    );
    const unread = await page.evaluate(
      () =>
        window.AntaresNotificacionesDomain.getCurrentNotifications().filter(
          (n) => !window.AntaresNotificacionesDomain.notificationIsRead(n)
        ).length
    );
    expect(unread).toBe(0);
  });
});
