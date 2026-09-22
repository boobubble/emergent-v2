import { test, expect, type Page } from "@playwright/test";

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

async function openShellPanel(page: Page, panel: string, tab?: string) {
  const search = tab ? `?yaarzo=${panel}&tab=${tab}` : `?yaarzo=${panel}`;
  await page.goto(`/chatroom${search}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-cody-shell-panel]")).toBeVisible({ timeout: 60_000 });
}

test.describe("Chatroom shell panel auth", () => {
  test.setTimeout(240_000);

  test("signed-in user sees feed composer, friends data, embedded poetry compose, and username confession identity", async ({
    page,
  }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;
    test.skip(!email || !password, "Set E2E_USER_EMAIL/E2E_USER_PASSWORD");

    await page.setViewportSize({ width: 1280, height: 900 });
    await loginFromHomepage(page, email!, password!);

    await openShellPanel(page, "feed");
    await expect(page.locator(".chatroom-feed-mode")).toBeVisible();
    await expect(page.getByPlaceholder(/what.?s on your mind/i).first()).toBeVisible({
      timeout: 30_000,
    });

    await openShellPanel(page, "find-friends");
    await expect(page.getByRole("button", { name: /suggestions/i })).toBeVisible();
    await expect(page.getByText(/sign in to find friends/i)).toHaveCount(0);

    await openShellPanel(page, "poetry");
    await page.getByRole("button", { name: /start writing/i }).click();
    await expect(page.locator("[data-cody-shell-panel]")).toContainText(/write a poem/i);
    await expect(page.getByRole("heading", { name: /write a poem/i })).toBeVisible();

    await openShellPanel(page, "confessions");
    await page.getByRole("button", { name: /^confess$/i }).click();
    await expect(page.getByRole("button", { name: /my username/i })).toHaveClass(/bg-primary/);
  });
});
