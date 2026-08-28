import { test, expect, type Page } from "@playwright/test";

/**
 * Chatroom first-render layout: desktop column vs mobile overlay.
 * Covers refresh, client mount, and (when credentials exist) post-login.
 */

async function sidebarBox(page: Page) {
  const sidebar = page.locator("[data-chatroom-sidebar]");
  await expect(sidebar).toBeVisible({ timeout: 60_000 });
  return {
    sidebar,
    box: await sidebar.boundingBox(),
    position: await sidebar.evaluate((el) => getComputedStyle(el).position),
    transform: await sidebar.evaluate((el) => getComputedStyle(el).transform),
    layout: await page.locator("[data-chatroom-shell]").getAttribute("data-chatroom-layout"),
  };
}

async function loginFromHomepage(page: Page, email: string, password: string) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /^login$/i }).first().click();
  const dlg = page.locator('[role="dialog"]').first();
  await expect(dlg).toBeVisible();
  await dlg.locator('input[type="email"]').first().fill(email);
  await dlg.locator('input[type="password"]').first().fill(password);
  await dlg.getByRole("button", { name: /sign in|log in|login/i }).first().click();
  await expect(page.locator("[data-chatroom-shell]")).toBeVisible({ timeout: 60_000 });
}

test.describe("Chatroom first-render layout", () => {
  test.setTimeout(180_000);
  test("desktop /chatroom refresh uses a static 272px sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/chatroom", { waitUntil: "domcontentloaded" });
    const { box, position, sidebar } = await sidebarBox(page);
    expect(position).toBe("static");
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(250);
    expect(box?.width ?? 0).toBeLessThanOrEqual(300);
    await expect(page.getByRole("button", { name: "Show sidebar" })).toBeHidden();
    const members = page.locator("[data-chatroom-members]");
    if (await members.count()) {
      await expect(members).toBeVisible();
    }
    await page.reload({ waitUntil: "domcontentloaded" });
    const after = await sidebarBox(page);
    expect(after.position).toBe("static");
    expect(after.box?.width ?? 0).toBeGreaterThanOrEqual(250);
    await expect(sidebar).toBeVisible();
  });

  test("mobile /chatroom keeps a closed overlay sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/chatroom", { waitUntil: "domcontentloaded" });
    const sidebar = page.locator("[data-chatroom-sidebar]");
    await expect(sidebar).toBeAttached({ timeout: 60_000 });
    const position = await sidebar.evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("fixed");
    const transform = await sidebar.evaluate((el) => getComputedStyle(el).transform);
    expect(transform).toMatch(/matrix|translate/);
    await expect(page.getByRole("button", { name: "Show sidebar" })).toBeVisible();
    await expect(page.locator("[data-chatroom-members]")).toBeHidden();
  });

  test("desktop login from homepage opens Chatroom as a static column", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;
    test.skip(!email || !password, "Set E2E_USER_EMAIL/E2E_USER_PASSWORD for post-login layout");

    await page.setViewportSize({ width: 1280, height: 900 });
    await loginFromHomepage(page, email!, password!);
    const { position, box, layout } = await sidebarBox(page);
    expect(layout === "desktop" || position === "static").toBeTruthy();
    expect(position).toBe("static");
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(250);
    await expect(page.getByRole("button", { name: "Show sidebar" })).toBeHidden();

    await page.goto("/feed", { waitUntil: "domcontentloaded" });
    await page.goto("/chatroom", { waitUntil: "domcontentloaded" });
    const returned = await sidebarBox(page);
    expect(returned.position).toBe("static");
  });

  test("mobile login from homepage keeps overlay Chatroom", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;
    test.skip(!email || !password, "Set E2E_USER_EMAIL/E2E_USER_PASSWORD for post-login layout");

    await page.setViewportSize({ width: 390, height: 844 });
    await loginFromHomepage(page, email!, password!);
    const sidebar = page.locator("[data-chatroom-sidebar]");
    await expect(sidebar).toBeAttached({ timeout: 60_000 });
    const position = await sidebar.evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("fixed");
    await expect(page.getByRole("button", { name: "Show sidebar" })).toBeVisible();
  });
});

test.describe("Chatroom layout regressions", () => {
  test.setTimeout(180_000);
  test("desktop Feed stays 3-column without a mobile bottom nav", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/feed", { waitUntil: "domcontentloaded" });
    await expect.poll(async () => {
      return page.evaluate(() =>
        [...document.querySelectorAll("div")].some((d) =>
          `${d.className}`.includes("lg:grid-cols-[260px"),
        ),
      );
    }, { timeout: 60_000 }).toBe(true);
    const gridCols = await page.evaluate(() => {
      const el = [...document.querySelectorAll("div")].find((d) =>
        (d.getAttribute("class") ?? "").includes("lg:grid-cols-[260px"),
      );
      return el ? getComputedStyle(el).gridTemplateColumns : "";
    });
    expect(gridCols.split(" ").filter(Boolean).length).toBeGreaterThanOrEqual(3);
    const bottomNav = page.locator("nav.fixed.bottom-0");
    if (await bottomNav.count()) {
      await expect(bottomNav).toBeHidden();
    }
  });

  test("guest homepage still paints its H1", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("[data-chatroom-shell]")).toHaveCount(0);
  });
});
