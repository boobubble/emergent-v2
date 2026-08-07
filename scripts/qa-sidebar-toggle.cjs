const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const OUT = path.resolve("qa-screenshots/sidebar-toggle-qa.json");

const results = {
  ts: new Date().toISOString(),
  checks: {},
  consoleErrors: [],
  pageErrors: [],
};

function fail(name, detail) {
  results.checks[name] = { pass: false, detail };
}

function pass(name, detail) {
  results.checks[name] = { pass: true, detail };
}

async function setupPage(browser, viewport, storage) {
  const context = await browser.newContext({ viewport });
  if (storage) await context.addInitScript((s) => {
    for (const [k, v] of Object.entries(s)) {
      if (v === null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    }
  }, storage);
  const page = await context.newPage();
  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error") results.consoleErrors.push(text);
    if (/hydration/i.test(text) && /mismatch|warning/i.test(text)) {
      results.consoleErrors.push(`HYDRATION: ${text}`);
    }
    if (/rules of hooks|Rendered more hooks|Rendered fewer hooks/i.test(text)) {
      results.pageErrors.push(text);
    }
  });
  page.on("pageerror", (err) => results.pageErrors.push(String(err.message || err)));
  return { context, page };
}

async function hasErrorBoundary(page) {
  return page.evaluate(() => {
    const t = document.body?.innerText || "";
    return t.includes("Something went wrong") && t.includes("Chatrooms section hit a problem");
  });
}

async function sidebarVisible(page) {
  return page.evaluate(() => {
    const aside = document.querySelector("aside");
    if (!aside) return false;
    const r = aside.getBoundingClientRect();
    return r.width > 50 && r.height > 100;
  });
}

async function clickCollapse(page) {
  const btn = page.locator('[aria-label="Hide sidebar"]');
  if (await btn.count()) {
    await btn.click({ timeout: 3000, force: true });
    return true;
  }
  return false;
}

async function clickExpand(page) {
  const btn = page.locator('[aria-label="Show sidebar"]');
  if (await btn.count()) {
    await btn.click({ timeout: 3000, force: true });
    return true;
  }
  return false;
}

async function clickMobileClose(page) {
  const btn = page.locator('[aria-label="Close sidebar"]');
  if (await btn.count()) {
    await btn.click({ timeout: 3000, force: true });
    return true;
  }
  return false;
}

async function switchRoom(page, name) {
  const btn = page.locator("button", { hasText: name }).first();
  if (await btn.count()) {
    await btn.click({ timeout: 3000 });
    await page.waitForTimeout(300);
    return true;
  }
  return false;
}

async function measure(page) {
  return page.evaluate(() => {
    const scroll = document.querySelector(".sidebar-scroll");
    const bottom = document.querySelector(".sidebar-bottom-panel");
    const iframeCount = document.querySelectorAll("iframe").length;
    const errorBoundary = (document.body?.innerText || "").includes("Something went wrong");
    const lobbyBtn = document.querySelector("button");
    const roomRows = scroll ? scroll.querySelectorAll("button").length : 0;
    const counts = Array.from(scroll?.querySelectorAll(".tabular-nums") || []).map((el) => el.textContent?.trim());
    return {
      errorBoundary,
      iframeCount,
      roomRows,
      counts: counts.slice(0, 4),
      sidebarMounted: !!document.querySelector("aside"),
      radioVisible: !!document.querySelector(".sidebar-radio-mini"),
      bottomVisible: bottom ? bottom.getBoundingClientRect().height > 0 : false,
    };
  });
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    results.checks.launch = { pass: false, detail: String(e.message || e) };
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
    console.log(JSON.stringify({ fatal: "playwright launch failed", error: String(e.message || e) }));
    process.exit(1);
  }

  async function runCheck(name, fn) {
    try {
      await fn();
    } catch (e) {
      fail(name, { error: String(e.message || e) });
    }
  }

  // Desktop 50 cycles
  await runCheck("desktop50Cycles", async () => {
    const { context, page } = await setupPage(browser, { width: 1920, height: 1080 });
    await page.goto(`${BASE}/chatroom`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(4000);
    let crashes = 0;
    for (let i = 0; i < 50; i++) {
      const open = await sidebarVisible(page);
      if (open) await clickCollapse(page);
      else await clickExpand(page);
      await page.waitForTimeout(80);
      if (await hasErrorBoundary(page)) crashes++;
    }
    const m = await measure(page);
    if (crashes === 0 && !m.errorBoundary) pass("desktop50Cycles", { cycles: 50, crashes, ...m });
    else fail("desktop50Cycles", { cycles: 50, crashes, ...m });
    await context.close();
  });

  // Rapid desktop toggles
  await runCheck("rapidDesktopToggles", async () => {
    const { context, page } = await setupPage(browser, { width: 1920, height: 1080 });
    await page.goto(`${BASE}/chatroom`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(3000);
    let crashes = 0;
    for (let i = 0; i < 30; i++) {
      if (i % 2 === 0) await clickCollapse(page).catch(() => {});
      else await clickExpand(page).catch(() => {});
      await page.waitForTimeout(20);
      if (await hasErrorBoundary(page)) crashes++;
    }
    if (crashes === 0) pass("rapidDesktopToggles", { cycles: 30, crashes });
    else fail("rapidDesktopToggles", { cycles: 30, crashes });
    await context.close();
  });

  // Lobby/Games while toggling + radio
  await runCheck("toggleWhileRoomSwitchAndRadio", async () => {
    const { context, page } = await setupPage(browser, { width: 1920, height: 1080 });
    await page.goto(`${BASE}/chatroom`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(5000);
    const iframeBefore = await page.evaluate(() => document.querySelectorAll("iframe").length);
    let crashes = 0;
    for (let i = 0; i < 10; i++) {
      await switchRoom(page, "# Games").catch(() => {});
      await clickCollapse(page).catch(() => {});
      await page.waitForTimeout(100);
      await clickExpand(page).catch(() => {});
      await switchRoom(page, "# Lobby").catch(() => {});
      await page.waitForTimeout(100);
      if (await hasErrorBoundary(page)) crashes++;
    }
    const iframeAfter = await page.evaluate(() => document.querySelectorAll("iframe").length);
    const radioOk = iframeBefore <= 1 && iframeAfter <= 1 && iframeAfter >= iframeBefore;
    if (crashes === 0 && radioOk) pass("toggleWhileRoomSwitchAndRadio", { crashes, iframeBefore, iframeAfter });
    else fail("toggleWhileRoomSwitchAndRadio", { crashes, iframeBefore, iframeAfter });
    await context.close();
  });

  // Mobile 30 drawer cycles
  await runCheck("mobile30DrawerCycles", async () => {
    const { context, page } = await setupPage(browser, { width: 390, height: 844 });
    await page.goto(`${BASE}/chatroom`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(3000);
    let crashes = 0;
    for (let i = 0; i < 30; i++) {
      const open = await sidebarVisible(page);
      if (open) await clickMobileClose(page).catch(() => clickCollapse(page));
      else await clickExpand(page);
      await page.waitForTimeout(100);
      if (await hasErrorBoundary(page)) crashes++;
    }
    if (crashes === 0) pass("mobile30DrawerCycles", { cycles: 30, crashes });
    else fail("mobile30DrawerCycles", { cycles: 30, crashes });
    await context.close();
  });

  // Refresh saved open
  await runCheck("refreshSavedOpen", async () => {
    const { context, page } = await setupPage(browser, { width: 1920, height: 1080 }, { "palrgo:sidebarOpen": "1" });
    await page.goto(`${BASE}/chatroom`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(3000);
    const open = await sidebarVisible(page);
    const crash = await hasErrorBoundary(page);
    if (open && !crash) pass("refreshSavedOpen", { open });
    else fail("refreshSavedOpen", { open, crash });
    await context.close();
  });

  // Refresh saved closed
  await runCheck("refreshSavedClosed", async () => {
    const { context, page } = await setupPage(browser, { width: 1920, height: 1080 }, { "palrgo:sidebarOpen": "0" });
    await page.goto(`${BASE}/chatroom`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(3000);
    const open = await sidebarVisible(page);
    const crash = await hasErrorBoundary(page);
    if (!open && !crash) pass("refreshSavedClosed", { open });
    else fail("refreshSavedClosed", { open, crash });
    await context.close();
  });

  // Corrupt localStorage
  await runCheck("refreshCorruptStorage", async () => {
    const { context, page } = await setupPage(browser, { width: 1920, height: 1080 }, { "palrgo:sidebarOpen": "garbage" });
    await page.goto(`${BASE}/chatroom`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(3000);
    const crash = await hasErrorBoundary(page);
    const open = await sidebarVisible(page);
    if (!crash) pass("refreshCorruptStorage", { open, crash });
    else fail("refreshCorruptStorage", { open, crash });
    await context.close();
  });

  // Breakpoint change while collapsed
  await runCheck("breakpointChangeWhileCollapsed", async () => {
    const { context, page } = await setupPage(browser, { width: 1920, height: 1080 }, { "palrgo:sidebarOpen": "0" });
    await page.goto(`${BASE}/chatroom`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(800);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(800);
    const crash = await hasErrorBoundary(page);
    const m = await measure(page);
    if (!crash) pass("breakpointChangeWhileCollapsed", m);
    else fail("breakpointChangeWhileCollapsed", { crash, ...m });
    await context.close();
  });

  // Presence counts sanity
  await runCheck("presenceCountsSanity", async () => {
    const { context, page } = await setupPage(browser, { width: 1920, height: 1080 });
    await page.goto(`${BASE}/chatroom`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(4000);
    const m = await measure(page);
    const countsOk = m.counts.every((c) => c && /^\d+$/.test(c));
    if (countsOk && !m.errorBoundary) pass("presenceCountsSanity", m);
    else fail("presenceCountsSanity", m);
    await context.close();
  });

  // Supabase / console summary
  const supabaseErrors = results.consoleErrors.filter((e) => /realtime|presence|removeChannel|supabase/i.test(e));
  const hydrationWarnings = results.consoleErrors.filter((e) => /HYDRATION:/i.test(e));
  const hooksErrors = results.pageErrors.filter((e) => /hooks/i.test(e));
  if (supabaseErrors.length === 0) pass("noSupabaseRealtimeErrors", { count: 0 });
  else fail("noSupabaseRealtimeErrors", { count: supabaseErrors.length, samples: supabaseErrors.slice(0, 3) });
  if (hydrationWarnings.length === 0) pass("noHydrationWarnings", { count: 0 });
  else fail("noHydrationWarnings", { count: hydrationWarnings.length, samples: hydrationWarnings.slice(0, 3) });
  if (hooksErrors.length === 0) pass("noRulesOfHooksErrors", { count: 0 });
  else fail("noRulesOfHooksErrors", { count: hooksErrors.length, samples: hooksErrors.slice(0, 3) });
  if (results.pageErrors.length === 0) pass("noPageErrors", { count: 0 });
  else fail("noPageErrors", { count: results.pageErrors.length, samples: results.pageErrors.slice(0, 3) });

  await browser.close();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  const failed = Object.entries(results.checks).filter(([, v]) => !v.pass).map(([k]) => k);
  console.log(JSON.stringify({ failed, total: Object.keys(results.checks).length, passed: Object.keys(results.checks).length - failed.length }));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
