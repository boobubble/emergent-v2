import { a as createMiddleware, d as getRequest } from "./server-DxoLgaf4.mjs";
const DEFAULT_LIMITS = {
  "auth.login": { limit: 8, window: 60 },
  "auth.signup": { limit: 5, window: 300 },
  "auth.password_reset": { limit: 3, window: 900 },
  "feed.post": { limit: 6, window: 60 },
  "feed.comment": { limit: 20, window: 60 },
  "feed.reaction": { limit: 60, window: 60 },
  "chat.message": { limit: 30, window: 60 },
  "chat.reaction": { limit: 60, window: 60 },
  "competition.vote": { limit: 30, window: 60 },
  "competition.create": { limit: 3, window: 3600 },
  "community.join": { limit: 10, window: 300 },
  "community.create": { limit: 3, window: 3600 },
  "community.invite": { limit: 10, window: 300 },
  "community.redeem": { limit: 10, window: 300 },
  "report.submit": { limit: 10, window: 300 },
  "search": { limit: 60, window: 60 },
  "profile.edit": { limit: 20, window: 300 },
  "upload.avatar": { limit: 10, window: 300 },
  "upload.banner": { limit: 10, window: 300 },
  "follow": { limit: 30, window: 60 },
  "api": { limit: 120, window: 60 }
};
let cachedConfig = null;
async function loadConfig() {
  const now = Date.now();
  if (cachedConfig && now - cachedConfig.at < 3e4) return cachedConfig.value;
  try {
    const { supabaseAdmin } = await import("./client.server-BXCYxJZY.mjs");
    const { data } = await supabaseAdmin.from("app_settings").select("value").eq("key", "rate_limits").maybeSingle();
    const overrides = data?.value ?? {};
    const merged = { ...DEFAULT_LIMITS, ...overrides };
    cachedConfig = { at: now, value: merged };
    return merged;
  } catch {
    return DEFAULT_LIMITS;
  }
}
function getClientIp() {
  try {
    const req = getRequest();
    const h = req?.headers;
    if (!h) return null;
    const fwd = h.get("cf-connecting-ip") || h.get("x-real-ip") || h.get("x-forwarded-for");
    if (!fwd) return null;
    return fwd.split(",")[0].trim() || null;
  } catch {
    return null;
  }
}
class RateLimitError extends Error {
  status = 429;
  retryAfter;
  reason;
  constructor(retryAfter, reason) {
    super("Too many requests. Please slow down and try again shortly.");
    this.retryAfter = Math.max(1, retryAfter);
    this.reason = reason;
  }
}
async function enforceRateLimit(opts) {
  const cfg = await loadConfig();
  const def = cfg[opts.action] ?? DEFAULT_LIMITS[opts.action] ?? DEFAULT_LIMITS["api"];
  const limit = opts.limit ?? def.limit;
  const window = opts.window ?? def.window;
  const ip = opts.ip ?? getClientIp();
  const userId = opts.userId ?? null;
  const key = userId ? `u:${userId}` : ip ? `ip:${ip}` : null;
  if (!key) return;
  try {
    const { supabaseAdmin } = await import("./client.server-BXCYxJZY.mjs");
    const { data, error } = await supabaseAdmin.rpc("check_and_consume_rate_limit", {
      _action: opts.action,
      _key: key,
      _limit: limit,
      _window_seconds: window,
      _user_id: userId ?? void 0,
      _ip: ip ?? void 0,
      _force: opts.force ?? false
    });
    if (error) {
      console.error("[rate-limit] rpc error", error.message);
      return;
    }
    const res = data;
    if (res && !res.allowed) {
      throw new RateLimitError(res.retry_after ?? 60, res.reason ?? "rate_limited");
    }
  } catch (e) {
    if (e instanceof RateLimitError) throw e;
    console.error("[rate-limit] unexpected", e);
  }
}
function withRateLimit(action) {
  return createMiddleware({ type: "function" }).server(async ({ next, context }) => {
    const userId = context?.userId ?? null;
    try {
      await enforceRateLimit({ action, userId });
    } catch (e) {
      if (e instanceof RateLimitError) {
        throw new Error(
          `Too many requests. Please wait ${e.retryAfter}s before trying again.`
        );
      }
      throw e;
    }
    return next();
  });
}
export {
  DEFAULT_LIMITS as D,
  RateLimitError as R,
  enforceRateLimit as e,
  getClientIp as g,
  withRateLimit as w
};
