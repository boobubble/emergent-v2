import type { LoggerContext } from "./types";

let ctx: LoggerContext = {};

export function setLoggerContext(patch: LoggerContext) {
  ctx = { ...ctx, ...patch };
}

export function getLoggerContext(): LoggerContext {
  return ctx;
}

export function getAppVersion(): string {
  return import.meta.env.VITE_APP_VERSION ?? "1.0.0";
}

export function getBuildVersion(): string {
  return import.meta.env.VITE_BUILD_ID ?? import.meta.env.MODE ?? "development";
}

export function getCurrentRoute(): string | null {
  if (typeof window === "undefined") return ctx.route ?? null;
  return ctx.route ?? window.location.pathname;
}

export function getCurrentUrl(): string | null {
  if (typeof window === "undefined") return null;
  return window.location.href;
}

export function parseUserAgent() {
  if (typeof navigator === "undefined") {
    return { browser: null, os: null, device: null };
  }
  const ua = navigator.userAgent;
  let browser = "unknown";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";

  let os = "unknown";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  const device = /Mobile|Android|iPhone|iPad/.test(ua) ? "mobile" : "desktop";
  return { browser, os, device };
}

export function getScreenSize(): string | null {
  if (typeof window === "undefined") return null;
  return `${window.innerWidth}x${window.innerHeight}`;
}

export function buildBasePayload(severity: import("./types").LogSeverity): Omit<import("./types").ErrorLogPayload, "message"> {
  const { browser, os, device } = parseUserAgent();
  return {
    severity,
    route: getCurrentRoute(),
    url: getCurrentUrl(),
    user_id: ctx.userId ?? null,
    browser,
    os,
    device,
    screen: getScreenSize(),
    app_version: getAppVersion(),
    build_version: getBuildVersion(),
  };
}
