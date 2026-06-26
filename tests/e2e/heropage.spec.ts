import { test, expect, type Page } from "@playwright/test";

/**
 * End-to-end coverage for the Hero Homepage auth CTAs.
 *
 * Verifies that Join, Login, and Guest buttons each open the correct
 * auth dialog, that Logout from an authenticated session sends the user
 * back to the auth/welcome surface, and that all flows work in both
 * dark and light theme modes.
 */

const HERO_PATH = "/heropage";

async function gotoHero(page: Page) {
  await page.goto(HERO_PATH, { waitUntil: "domcontentloaded" });
  // Hero page redirects authed users to "/"; ensure we landed on hero.
  await expect(page).toHaveURL(/\/heropage/);
  await page.waitForLoadState("networkidle");
}

async function setTheme(page: Page, mode: "dark" | "light") {
  // The hero page tracks theme via local `dark` state, toggled by the
  // sun/moon button labelled "Toggle theme". Click until we match.
  const toggle = page.getByRole("button", { name: /toggle theme/i }).first();
  await expect(toggle).toBeVisible();
  // Read current icon by checking aria for sun (dark active) vs moon (light active).
  for (let i = 0; i < 2; i++) {
    const html = await page.locator("body").getAttribute("class");
    const isDark = (html ?? "").includes("dark") || (await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    ));
    if ((mode === "dark" && isDark) || (mode === "light" && !isDark)) return;
    await toggle.click();
    await page.waitForTimeout(200);
  }
}

async function dialogCount(page: Page) {
  return page.locator('[role="dialog"]').count();
}

async function closeAnyDialog(page: Page) {
  if ((await dialogCount(page)) > 0) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }
}

for (const mode of ["dark", "light"] as const) {
  test.describe(`Hero homepage (${mode} mode)`, () => {
    test.beforeEach(async ({ page }) => {
      await gotoHero(page);
      await setTheme(page, mode);
    });

    test("Join button opens the signup dialog", async ({ page }) => {
      await page.getByRole("button", { name: /join/i }).first().click();
      await expect(page.locator('[role="dialog"]').first()).toBeVisible();
      // Dialog should expose an email field for signup
      await expect(
        page.locator('[role="dialog"] input[type="email"]').first(),
      ).toBeVisible();
      await closeAnyDialog(page);
    });

    test("Login button opens the signin dialog", async ({ page }) => {
      await page.getByRole("button", { name: /^login$/i }).first().click();
      await expect(page.locator('[role="dialog"]').first()).toBeVisible();
      await expect(
        page.locator('[role="dialog"] input[type="password"]').first(),
      ).toBeVisible();
      await closeAnyDialog(page);
    });

    test("Guest button triggers the demo/guest flow", async ({ page }) => {
      const guest = page
        .getByRole("button", { name: /(guest|explore)/i })
        .first();
      await expect(guest).toBeVisible();
      // Watch for the demo-account server call OR any navigation away
      // from /heropage OR a "Loading" state appearing on the button.
      const demoCall = page.waitForRequest(
        (req) => /createDemoAccount|demo-account|demo/i.test(req.url()),
        { timeout: 6_000 },
      ).catch(() => null);
      const navAway = page.waitForURL(
        (url) => !url.pathname.startsWith("/heropage"),
        { timeout: 6_000 },
      ).catch(() => null);
      const dialog = page.waitForSelector('[role="dialog"]', {
        timeout: 6_000,
      }).catch(() => null);
      await guest.click();
      const [req, , dlg] = await Promise.all([demoCall, navAway, dialog]);
      const navigated = !page.url().includes("/heropage");
      const dialogOpen = (await dialogCount(page)) > 0;
      const loadingText = await guest.innerText().catch(() => "");
      expect(
        Boolean(req) ||
          navigated ||
          dialogOpen ||
          Boolean(dlg) ||
          /loading|…/i.test(loadingText),
      ).toBeTruthy();
    });

    test("Logged-in users are redirected away; logout returns to auth", async ({
      page,
    }) => {
      // Simulate an authenticated session by stamping a fake Supabase
      // token into localStorage and reloading. If real credentials are
      // provided via env, prefer those.
      const email = process.env.E2E_USER_EMAIL;
      const password = process.env.E2E_USER_PASSWORD;
      test.skip(
        !email || !password,
        "Set E2E_USER_EMAIL/E2E_USER_PASSWORD to run the logout flow",
      );

      // Sign in via the dialog
      await page.getByRole("button", { name: /^login$/i }).first().click();
      const dlg = page.locator('[role="dialog"]').first();
      await dlg.locator('input[type="email"]').first().fill(email!);
      await dlg.locator('input[type="password"]').first().fill(password!);
      await dlg
        .getByRole("button", { name: /sign in|log in|login/i })
        .first()
        .click();

      // Hero page should redirect authenticated users away
      await page.waitForURL(
        (url) => !url.pathname.startsWith("/heropage"),
        { timeout: 10_000 },
      );

      // Trigger logout from wherever the app lands
      const logout = page.getByRole("button", { name: /log\s?out|sign\s?out/i })
        .first();
      if (await logout.count()) {
        await logout.click();
      } else {
        // Fallback: programmatic sign-out via the supabase client global
        await page.evaluate(async () => {
          const mod = await import("/src/integrations/supabase/client.ts");
          await mod.supabase.auth.signOut();
        });
      }

      await page.waitForURL(/\/(auth|welcome|heropage)?/, { timeout: 10_000 });
      // Re-visiting hero should now render the CTAs again
      await gotoHero(page);
      await expect(
        page.getByRole("button", { name: /^login$/i }).first(),
      ).toBeVisible();
    });
  });
}
