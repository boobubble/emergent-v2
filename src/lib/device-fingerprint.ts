/**
 * Stable browser/device fingerprint.
 *
 * Combines low-entropy but persistent signals (UA, platform, language,
 * timezone, screen, hardware concurrency, canvas hash) into a SHA-256 hash.
 * Cached in localStorage so we don't recompute on every page load.
 *
 * Not bulletproof — a different browser, private mode, or new device evades
 * it — but it stops casual ban-evasion on the same machine.
 */

const STORAGE_KEY = "lovable:device-fp";

function canvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";
    ctx.textBaseline = "top";
    ctx.font = "16px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 100, 30);
    ctx.fillStyle = "#069";
    ctx.fillText("lovable-fp-7\u2728", 4, 4);
    ctx.strokeStyle = "rgba(102,200,0,0.7)";
    ctx.beginPath();
    ctx.arc(40, 30, 18, 0, Math.PI * 2, true);
    ctx.stroke();
    return canvas.toDataURL();
  } catch {
    return "canvas-error";
  }
}

async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "";
  try {
    const cached = window.localStorage.getItem(STORAGE_KEY);
    if (cached && cached.length === 64) return cached;
  } catch { /* noop */ }

  const nav = window.navigator;
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const parts = [
    nav.userAgent,
    nav.language,
    (nav.languages ?? []).join(","),
    (nav as Navigator & { platform?: string }).platform ?? "",
    nav.hardwareConcurrency ?? "",
    (nav as Navigator & { deviceMemory?: number }).deviceMemory ?? "",
    screenInfo,
    tz,
    new Date().getTimezoneOffset(),
    canvasFingerprint(),
  ].join("|");

  const hash = await sha256(parts);
  try { window.localStorage.setItem(STORAGE_KEY, hash); } catch { /* noop */ }
  return hash;
}

export function clearStoredFingerprint() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}
