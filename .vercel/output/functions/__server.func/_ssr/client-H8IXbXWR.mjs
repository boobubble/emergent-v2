import { createClient } from "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
let ctx = {};
function setLoggerContext(patch) {
  ctx = { ...ctx, ...patch };
}
function getAppVersion() {
  return "1.0.0";
}
function getBuildVersion() {
  return "production";
}
function getCurrentRoute() {
  if (typeof window === "undefined") return ctx.route ?? null;
  return ctx.route ?? window.location.pathname;
}
function getCurrentUrl() {
  if (typeof window === "undefined") return null;
  return window.location.href;
}
function parseUserAgent() {
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
function getScreenSize() {
  if (typeof window === "undefined") return null;
  return `${window.innerWidth}x${window.innerHeight}`;
}
function buildBasePayload(severity) {
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
    build_version: getBuildVersion()
  };
}
let queue = [];
let flushing = false;
async function flushQueue() {
  if (flushing || queue.length === 0 || typeof window === "undefined") return;
  flushing = true;
  const batch = queue.splice(0, 10);
  try {
    const { supabase: supabase2 } = await Promise.resolve().then(() => client);
    await supabase2.from("client_error_logs").insert(
      batch.map((row) => ({
        user_id: row.user_id,
        route: row.route,
        url: row.url,
        message: row.message,
        stack: row.stack,
        component_stack: row.component_stack,
        browser: row.browser,
        os: row.os,
        device: row.device,
        screen: row.screen,
        app_version: row.app_version,
        build_version: row.build_version,
        severity: row.severity,
        metadata: row.metadata ?? {}
      }))
    );
  } catch {
  } finally {
    flushing = false;
    if (queue.length) void flushQueue();
  }
}
function persistErrorLog(payload) {
  queue.push(payload);
  void flushQueue();
}
const THROTTLE_MS = 6e4;
const seen = /* @__PURE__ */ new Map();
function shouldLog(key) {
  const now = Date.now();
  const last = seen.get(key) ?? 0;
  if (now - last < THROTTLE_MS) return false;
  seen.set(key, now);
  if (seen.size > 500) {
    const cutoff = now - THROTTLE_MS * 2;
    for (const [k, t] of seen) {
      if (t < cutoff) seen.delete(k);
    }
  }
  return true;
}
function throttleKey(message, extra) {
  return `${message}::${extra ?? ""}`.slice(0, 240);
}
function normalizeError(err) {
  if (err instanceof Error) return { message: err.message, stack: err.stack };
  if (typeof err === "string") return { message: err };
  try {
    return { message: JSON.stringify(err) };
  } catch {
    return { message: String(err) };
  }
}
function emit(severity, message, err, metadata) {
  const norm = err ? normalizeError(err) : { message };
  const key = throttleKey(norm.message, severity);
  if (!shouldLog(key)) return;
  const payload = {
    ...buildBasePayload(severity),
    message: norm.message || message,
    stack: norm.stack ?? null,
    metadata
  };
  const line = `[${severity.toUpperCase()}] ${payload.message}`;
  if (severity === "info") console.info(line, metadata ?? "");
  else if (severity === "warn") console.warn(line, err ?? metadata ?? "");
  else console.error(line, err ?? metadata ?? "");
  if (severity === "error" || severity === "fatal") {
    persistErrorLog(payload);
  }
}
const logger = {
  info(message, metadata) {
    emit("info", message, void 0, metadata);
  },
  warn(message, err, metadata) {
    emit("warn", message, err, metadata);
  },
  error(message, err, metadata) {
    emit("error", message, err, metadata);
  },
  fatal(message, err, metadata) {
    emit("fatal", message, err, metadata);
  },
  capture(payload) {
    const key = throttleKey(payload.message, payload.severity ?? "error");
    if (!shouldLog(key)) return;
    const full = {
      ...buildBasePayload(payload.severity ?? "error"),
      ...payload
    };
    console.error(`[${(full.severity ?? "error").toUpperCase()}] ${full.message}`, full.metadata ?? "");
    if (full.severity === "error" || full.severity === "fatal") {
      persistErrorLog(full);
    }
  }
};
function logSupabaseError(op, err, meta) {
  const pg = err;
  logger.error(`Supabase ${op} failed`, err instanceof Error ? err : new Error(pg.message ?? String(err)), {
    ...meta,
    postgresCode: pg.code,
    status: pg.status,
    details: pg.details
  });
}
async function inspectResult(promise, op, meta) {
  try {
    const result = await promise;
    const r = result;
    if (r && typeof r === "object" && "error" in r && r.error) {
      logSupabaseError(op, r.error, meta);
    }
    return result;
  } catch (err) {
    logSupabaseError(op, err, meta);
    throw err;
  }
}
function wrapBuilder(builder, meta) {
  if (!builder || typeof builder !== "object") return builder;
  return new Proxy(builder, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (prop === "then" && typeof val === "function") {
        return (onfulfilled, onrejected) => inspectResult(
          Promise.resolve().then(() => val.call(target)),
          "query",
          meta
        ).then(onfulfilled, onrejected);
      }
      if (typeof val === "function") {
        return (...args) => {
          const result = val.apply(target, args);
          if (result && typeof result === "object") return wrapBuilder(result, meta);
          return result;
        };
      }
      return val;
    }
  });
}
function attachSupabaseMonitoring(client2) {
  return new Proxy(client2, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (prop === "from" && typeof val === "function") {
        return (table) => wrapBuilder(val.call(target, table), { table, source: "supabase" });
      }
      if (prop === "rpc" && typeof val === "function") {
        return (fn, params, options) => inspectResult(val.call(target, fn, params, options), "rpc", { rpc: fn });
      }
      if (prop === "storage" && val && typeof val === "object") {
        return new Proxy(val, {
          get(st, sp, sr) {
            const sv = Reflect.get(st, sp, sr);
            if (sp === "from" && typeof sv === "function") {
              return (bucket) => {
                const bucketApi = sv.call(st, bucket);
                return wrapBuilder(bucketApi, { bucket, source: "supabase-storage" });
              };
            }
            return sv;
          }
        });
      }
      if (prop === "auth" && val && typeof val === "object") {
        return new Proxy(val, {
          get(at, ap, ar) {
            const av = Reflect.get(at, ap, ar);
            if (typeof av === "function") {
              return (...args) => inspectResult(av.apply(at, args), "auth", { op: String(ap) });
            }
            return av;
          }
        });
      }
      return val;
    }
  });
}
function createSupabaseClient() {
  const SUPABASE_URL = "https://aofjhfsecwsrcvvvcfcy.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_R6cvebYP3NIBStd_txk04Q_a5agjzs_";
  const client2 = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
  return attachSupabaseMonitoring(client2);
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
const client = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  supabase
}, Symbol.toStringTag, { value: "Module" }));
export {
  setLoggerContext as a,
  client as c,
  logger as l,
  supabase as s
};
