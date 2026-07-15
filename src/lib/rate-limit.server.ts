// Server-only rate-limit + abuse-protection helper.
// Uses supabaseAdmin (service role) to invoke check_and_consume_rate_limit
// so limits apply uniformly regardless of caller RLS.
//
// Configurable via app_settings.rate_limits (JSON):
//   { "<action>": { "limit": 10, "window": 60 } }
// Missing entries fall back to DEFAULT_LIMITS below.

import { getRequest } from "@tanstack/react-start/server";

export interface RateLimitDef { limit: number; window: number }

export const DEFAULT_LIMITS: Record<string, RateLimitDef> = {
  // Auth
  "auth.login":            { limit: 8,   window: 60 },
  "auth.signup":           { limit: 5,   window: 300 },
  "auth.password_reset":   { limit: 3,   window: 900 },
  // Feed
  "feed.post":             { limit: 6,   window: 60 },
  "feed.comment":          { limit: 20,  window: 60 },
  "feed.reaction":         { limit: 60,  window: 60 },
  // Chat
  "chat.message":          { limit: 30,  window: 60 },
  "chat.reaction":         { limit: 60,  window: 60 },
  // Competitions & votes
  "competition.vote":      { limit: 30,  window: 60 },
  "competition.create":    { limit: 3,   window: 3600 },
  // Communities
  "community.join":        { limit: 10,  window: 300 },
  "community.create":      { limit: 3,   window: 3600 },
  "community.invite":      { limit: 10,  window: 300 },
  "community.redeem":      { limit: 10,  window: 300 },
  // Misc
  "report.submit":         { limit: 10,  window: 300 },
  "search":                { limit: 60,  window: 60 },
  "profile.edit":          { limit: 20,  window: 300 },
  "upload.avatar":         { limit: 10,  window: 300 },
  "upload.banner":         { limit: 10,  window: 300 },
  "follow":                { limit: 30,  window: 60 },
  "api":                   { limit: 120, window: 60 },
};

let cachedConfig: { at: number; value: Record<string, RateLimitDef> } | null = null;

async function loadConfig(): Promise<Record<string, RateLimitDef>> {
  const now = Date.now();
  if (cachedConfig && now - cachedConfig.at < 30_000) return cachedConfig.value;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "rate_limits")
      .maybeSingle();
    const overrides = (data?.value as Record<string, RateLimitDef> | null) ?? {};
    const merged = { ...DEFAULT_LIMITS, ...overrides };
    cachedConfig = { at: now, value: merged };
    return merged;
  } catch {
    return DEFAULT_LIMITS;
  }
}

export function getClientIp(): string | null {
  try {
    const req = getRequest();
    const h = req?.headers;
    if (!h) return null;
    const fwd = h.get("cf-connecting-ip") || h.get("x-real-ip") || h.get("x-forwarded-for");
    if (!fwd) return null;
    return fwd.split(",")[0]!.trim() || null;
  } catch {
    return null;
  }
}

export class RateLimitError extends Error {
  status = 429;
  retryAfter: number;
  reason: string;
  constructor(retryAfter: number, reason: string) {
    super("Too many requests. Please slow down and try again shortly.");
    this.retryAfter = Math.max(1, retryAfter);
    this.reason = reason;
  }
}

interface EnforceOpts {
  action: string;
  userId?: string | null;
  ip?: string | null;
  /** Override limit/window from config for this call */
  limit?: number;
  window?: number;
  /** When true, does not apply admin bypass */
  force?: boolean;
}

/**
 * Enforce a rate limit for `action`. Throws RateLimitError when blocked.
 * If userId is present, key = "u:<userId>"; else key = "ip:<ip>". If neither
 * is available, this is a no-op (nothing to key against).
 */
export async function enforceRateLimit(opts: EnforceOpts): Promise<void> {
  const cfg = await loadConfig();
  const def = cfg[opts.action] ?? DEFAULT_LIMITS[opts.action] ?? DEFAULT_LIMITS["api"];
  const limit = opts.limit ?? def.limit;
  const window = opts.window ?? def.window;

  const ip = opts.ip ?? getClientIp();
  const userId = opts.userId ?? null;
  const key = userId ? `u:${userId}` : ip ? `ip:${ip}` : null;
  if (!key) return;

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("check_and_consume_rate_limit", {
      _action: opts.action,
      _key: key,
      _limit: limit,
      _window_seconds: window,
      _user_id: userId ?? undefined,
      _ip: ip ?? undefined,
      _force: opts.force ?? false,
    });

    if (error) {
      // Fail-open on infra errors so real traffic isn't blocked by our meter.
      console.error("[rate-limit] rpc error", error.message);
      return;
    }
    const res = data as { allowed: boolean; retry_after: number; reason: string } | null;
    if (res && !res.allowed) {
      throw new RateLimitError(res.retry_after ?? 60, res.reason ?? "rate_limited");
    }
  } catch (e) {
    if (e instanceof RateLimitError) throw e;
    console.error("[rate-limit] unexpected", e);
  }
}

/**
 * Log a spam / abuse event (does not throw). Useful for extra detectors
 * that decide to record without immediately blocking.
 */
export async function logAbuseEvent(params: {
  action: string;
  key: string;
  userId?: string | null;
  ip?: string | null;
  severity?: "info" | "warn" | "block";
  reason: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("abuse_events").insert({
      action: params.action,
      key: params.key,
      user_id: params.userId ?? null,
      ip: params.ip ?? null,
      severity: params.severity ?? "warn",
      reason: params.reason,
      meta: params.meta ?? {},
    });
  } catch (e) {
    console.error("[abuse-event] insert failed", e);
  }
}
