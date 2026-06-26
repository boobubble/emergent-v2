import { test, expect, type Page } from "@playwright/test";

/**
 * Visual regression tests for the redesigned /heropage.
 *
 * Captures full-page and per-section screenshots in both dark and light
 * theme modes and compares them against committed baselines under
 * `tests/e2e/heropage-visual.spec.ts-snapshots/`.
 *
 * First run (or when the design intentionally changes), regenerate baselines:
 *   bun run test:e2e -- --update-snapshots
 */

const SECTIONS = [
  { id: "top", name: "hero" },
  { id: "chatrooms", name: "chatrooms" },
  { id: "feed", name: "feed" },
  { id: "radio", name: "radio" },
  { id: "games", name: "games" },
  { id: "rewards", name: "rewards" },
] as const;

const THEMES = ["dark", "light"] as const;

// Pixel diff tolerance — covers font hinting / subpixel + tiny animation jitter.
const SNAPSHOT_OPTS = { maxDiffPixelRatio: 0.02, animations: "disabled" as const };

async function setTheme(page: Page, theme: "dark" | "light") {
  await page.addInitScript((t) => {
    try {
      window.localStorage.setItem("heropage-theme", t);
    } catch {}
  }, theme);
}

async function gotoHeropage(page: Page) {
  await page.goto("/heropage", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-hero-theme]", { timeout: 10_000 });
  // Disable transitions/animations for stable screenshots.
  await page.addStyleTag({
    content: `*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important;}`,
  });
  // Allow reveal-on-scroll observers to fire by stepping through the page.
  const total = await page.evaluate(() => document.body.scrollHeight);
  const step = 800;
  for (let y = 0; y < total; y += step) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

for (const theme of THEMES) {
  test.describe(`/heropage visual — ${theme} mode`, () => {
    test.beforeEach(async ({ page }) => {
      await setTheme(page, theme);
    });

    test(`root attribute reflects ${theme} theme`, async ({ page }) => {
      await gotoHeropage(page);
      const attr = await page.locator("[data-hero-theme]").first().getAttribute("data-hero-theme");
      expect(attr).toBe(theme);
    });

    test(`full page matches baseline (${theme})`, async ({ page }) => {
      await gotoHeropage(page);
      expect(await page.screenshot({ fullPage: true, animations: "disabled" }))
        .toMatchSnapshot(`heropage-full-${theme}.png`, SNAPSHOT_OPTS);
    });

    for (const section of SECTIONS) {
      test(`section "${section.name}" matches baseline (${theme})`, async ({ page }) => {
        await gotoHeropage(page);
        const locator = page.locator(`#${section.id}`).first();
        await expect(locator).toBeVisible();
        await locator.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        expect(await locator.screenshot({ animations: "disabled" }))
          .toMatchSnapshot(`heropage-${section.name}-${theme}.png`, SNAPSHOT_OPTS);
      });
    }
  });
}
