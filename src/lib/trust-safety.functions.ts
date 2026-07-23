// Trust & Safety framework — server functions.
// Reuses existing tables:
//   - word_filters   (extended with category / actions / violation_points)
//   - url_rules      (whitelist / block)
//   - user_mutes     (auto-penalty target)
//   - user_bans      (auto-penalty target)
//   - profiles.level, friendships (feature gating & DM privacy)
// Adds tables:
//   - user_dm_privacy, user_trust_scores, trust_violations, dm_message_requests
//   - app_settings key 'trust_safety'
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

// ------------------------------ Types ---------------------------------------

export type UnlockMode = "level" | "age" | "verified";
export interface TrustSafetySettings {
  enabled: boolean;
  unlock_mode: UnlockMode;
  min_account_age_days: number;
  require_verified: boolean;
  feature_unlocks: Record<string, number>;
  public_url_action: "replace" | "reject";
  default_word_action: "replace" | "reject" | "warn";
  penalty_thresholds: Array<{ points: number; action: string; duration_minutes: number }>;
  violation_points: Record<string, number>;
}

const DEFAULTS: TrustSafetySettings = {
  enabled: true,
  unlock_mode: "level",
  min_account_age_days: 0,
  require_verified: false,
  feature_unlocks: { dm_privacy: 5, message_requests: 10, advanced_safety: 15 },
  public_url_action: "replace",
  default_word_action: "replace",
  penalty_thresholds: [
    { points: 5, action: "warn", duration_minutes: 0 },
    { points: 10, action: "temp_mute", duration_minutes: 30 },
    { points: 20, action: "temp_mute", duration_minutes: 1440 },
    { points: 40, action: "temp_mute", duration_minutes: 10080 },
    { points: 100, action: "permanent_ban", duration_minutes: 0 },
  ],
  violation_points: {
    bad_word: 1, blocked_url_public: 2, blocked_url_dm: 1, spam: 3, mass_report: 5, ai_flag: 2,
  },
};

// ------------------------------ Utilities -----------------------------------

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertMod(userId: string) {
  const sb = await admin();
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  const ok = ["admin", "super_admin", "moderator", "feed_moderator"].some((r) => roles.includes(r));
  if (!ok) throw new Error("Forbidden");
}

// -------------------------- Settings ----------------------------------------

export const getTrustSafetySettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const { data } = await sb.from("app_settings").select("value").eq("key", "trust_safety").maybeSingle();
  return { ...DEFAULTS, ...((data?.value as Partial<TrustSafetySettings>) ?? {}) } as TrustSafetySettings;
});

export const updateTrustSafetySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.record(z.string(), z.unknown()).parse(raw))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const sb = await admin();
    const { data: existing } = await sb.from("app_settings").select("value").eq("key", "trust_safety").maybeSingle();
    const next = { ...DEFAULTS, ...((existing?.value as Partial<TrustSafetySettings>) ?? {}), ...data };
    await sb.from("app_settings").upsert({ key: "trust_safety", value: next as never });
    return next;
  });

// -------------------------- Feature unlock ----------------------------------

export const isFeatureUnlocked = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ feature: z.string() }).parse(raw))
  .handler(async ({ data, context }) => {
    const sb = await admin();
    const { data: ok } = await sb.rpc("trust_feature_unlocked", {
      _user_id: context.userId,
      _feature: data.feature,
    } as never);
    return { unlocked: Boolean(ok) };
  });

// -------------------------- DM privacy --------------------------------------

const PrivacyChoice = z.enum(["everyone", "friends", "nobody"]);

export const getDmPrivacy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = await admin();
    const { data } = await sb.from("user_dm_privacy").select("*").eq("user_id", context.userId).maybeSingle();
    return data ?? { user_id: context.userId, who_can_dm: "everyone" as const, allow_message_requests: true };
  });

export const setDmPrivacy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    who_can_dm: PrivacyChoice,
    allow_message_requests: z.boolean().optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const sb = await admin();
    // Ensure the caller has unlocked DM Privacy (gracefully permit 'everyone' default)
    if (data.who_can_dm !== "everyone") {
      const { data: unlocked } = await sb.rpc("trust_feature_unlocked", {
        _user_id: context.userId, _feature: "dm_privacy",
      } as never);
      if (!unlocked) throw new Error("DM Privacy is not unlocked yet for your account level.");
    }
    await sb.from("user_dm_privacy").upsert({
      user_id: context.userId,
      who_can_dm: data.who_can_dm,
      allow_message_requests: data.allow_message_requests ?? true,
      updated_at: new Date().toISOString(),
    } as never);
    return { ok: true };
  });

// canSendDm: check receiver privacy + friendship
export const canSendDm = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ receiver_id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    if (data.receiver_id === context.userId) return { ok: true, mode: "self" as const };
    const sb = await admin();
    const { data: p } = await sb.from("user_dm_privacy")
      .select("who_can_dm, allow_message_requests").eq("user_id", data.receiver_id).maybeSingle();
    const privacy = p?.who_can_dm ?? "everyone";
    if (privacy === "nobody") return { ok: false, mode: "blocked" as const, reason: "This user isn't accepting messages." };

    // Friendship check
    const { data: fr } = await sb.from("friendships")
      .select("id,status").or(
        `and(sender_id.eq.${context.userId},receiver_id.eq.${data.receiver_id}),and(sender_id.eq.${data.receiver_id},receiver_id.eq.${context.userId})`,
      ).maybeSingle();
    const isFriend = fr?.status === "accepted";

    if (privacy === "friends" && !isFriend) {
      return { ok: false, mode: "friends_only" as const, reason: "This user only accepts messages from friends." };
    }
    if (privacy === "everyone" && !isFriend && (p?.allow_message_requests ?? true)) {
      return { ok: true, mode: "message_request" as const };
    }
    return { ok: true, mode: "direct" as const };
  });

// -------------------------- Message requests --------------------------------

export const createMessageRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("dm.request")])
  .inputValidator((raw) => z.object({
    receiver_id: z.string().uuid(),
    preview: z.string().max(240).optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    if (data.receiver_id === context.userId) throw new Error("Cannot send to self");
    const sb = await admin();
    await sb.from("dm_message_requests").upsert({
      sender_id: context.userId,
      receiver_id: data.receiver_id,
      preview: data.preview ?? null,
      status: "pending",
    } as never, { onConflict: "sender_id,receiver_id" } as never);
    return { ok: true };
  });

export const listMessageRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = await admin();
    const { data } = await sb.from("dm_message_requests")
      .select("id, sender_id, receiver_id, preview, status, created_at")
      .eq("receiver_id", context.userId).eq("status", "pending")
      .order("created_at", { ascending: false }).limit(100);
    return data ?? [];
  });

export const respondMessageRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    id: z.string().uuid(),
    action: z.enum(["accept", "decline", "block"]),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const sb = await admin();
    const status = data.action === "accept" ? "accepted" : data.action === "decline" ? "declined" : "blocked";
    await sb.from("dm_message_requests")
      .update({ status, responded_at: new Date().toISOString() } as never)
      .eq("id", data.id).eq("receiver_id", context.userId);
    return { ok: true };
  });

// -------------------------- Public text filtering ---------------------------
// Applies word_filters + url_rules to any public-content text before storage.
// Returns filtered text + collected actions + violation points to record.

export interface PublicFilterResult {
  ok: boolean;              // false -> reject the submission
  filtered: string;         // text (may be modified with **** replacements)
  actions: string[];        // union of all triggered actions
  matched_categories: string[];
  violation_points: number;
  reasons: string[];
}

async function loadFilters() {
  const sb = await admin();
  const [{ data: words }, { data: urls }] = await Promise.all([
    sb.from("word_filters").select("pattern,match_mode,category,actions,violation_points").eq("active", true),
    sb.from("url_rules").select("domain,kind").eq("active", true),
  ]);
  const allowedDomains = new Set((urls ?? []).filter((r) => r.kind === "whitelist").map((r) => r.domain.toLowerCase()));
  const blockedDomains = new Set((urls ?? []).filter((r) => r.kind === "block").map((r) => r.domain.toLowerCase()));
  return { words: words ?? [], allowedDomains, blockedDomains };
}

function domainAllowed(host: string, allowed: Set<string>, blocked: Set<string>): boolean {
  const h = host.toLowerCase();
  for (const d of blocked) if (h === d || h.endsWith("." + d)) return false;
  if (allowed.size === 0) return true;
  for (const d of allowed) if (h === d || h.endsWith("." + d)) return true;
  return false;
}

const URL_RE = /https?:\/\/[^\s<>]+/gi;

function replaceAll(str: string, needle: string, replacement: string): string {
  if (!needle) return str;
  return str.split(needle).join(replacement);
}

function stars(len: number): string { return "*".repeat(Math.max(4, Math.min(len, 16))); }

export const filterPublicText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ text: z.string(), record_violation: z.boolean().default(true) }).parse(raw))
  .handler(async ({ data, context }): Promise<PublicFilterResult> => {
    const settings = await getTrustSafetySettings();
    if (!settings.enabled) {
      return { ok: true, filtered: data.text, actions: [], matched_categories: [], violation_points: 0, reasons: [] };
    }

    const { words, allowedDomains, blockedDomains } = await loadFilters();
    let out = data.text;
    const actions = new Set<string>();
    const categories = new Set<string>();
    const reasons: string[] = [];
    let points = 0;

    // --- Bad words -----------------------------------------------------------
    for (const w of words) {
      const pattern = String(w.pattern);
      let matched = false;
      if (w.match_mode === "regex") {
        try {
          const re = new RegExp(pattern, "gi");
          if (re.test(out)) { matched = true; out = out.replace(new RegExp(pattern, "gi"), (m) => stars(m.length)); }
        } catch { /* invalid regex ignored */ }
      } else if (w.match_mode === "substring") {
        const idx = out.toLowerCase().indexOf(pattern.toLowerCase());
        if (idx >= 0) { matched = true; out = replaceAll(out, out.substring(idx, idx + pattern.length), stars(pattern.length)); }
      } else {
        const re = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
        if (re.test(out)) { matched = true; out = out.replace(re, (m) => stars(m.length)); }
      }
      if (matched) {
        const wordActions = (w.actions ?? ["replace"]) as string[];
        wordActions.forEach((a) => actions.add(a));
        categories.add(w.category ?? "general");
        reasons.push(`bad-word:${w.category ?? "general"}`);
        points += Number(w.violation_points ?? settings.violation_points.bad_word ?? 1);
      }
    }

    // --- URL allow-list ------------------------------------------------------
    out = out.replace(URL_RE, (url) => {
      try {
        const host = new URL(url).hostname;
        if (!domainAllowed(host, allowedDomains, blockedDomains)) {
          reasons.push(`blocked-url:${host}`);
          categories.add("url");
          points += settings.violation_points.blocked_url_public ?? 2;
          if (settings.public_url_action === "reject") { actions.add("reject"); return url; }
          actions.add("replace");
          return "****";
        }
        return url;
      } catch { return url; }
    });

    const rejected = actions.has("reject");
    if (data.record_violation && points > 0) {
      const sb = await admin();
      await sb.from("trust_violations").insert({
        user_id: context.userId,
        type: rejected ? "rejected_content" : "filtered_content",
        points,
        reason: reasons.slice(0, 5).join("; "),
        metadata: { actions: [...actions], categories: [...categories] } as never,
      } as never);
    }
    return {
      ok: !rejected,
      filtered: out,
      actions: [...actions],
      matched_categories: [...categories],
      violation_points: points,
      reasons,
    };
  });

// ------------------- DM URL masking (recipient-side) ------------------------
// Returns the allowed-domain list so clients can render receiver-masked text
// WITHOUT altering the sender's stored message.
export const getUrlAllowList = createServerFn({ method: "GET" })
  .handler(async () => {
    const sb = await admin();
    const { data } = await sb.from("url_rules")
      .select("domain,kind").eq("active", true);
    return {
      allowed: (data ?? []).filter((r) => r.kind === "whitelist").map((r) => r.domain.toLowerCase()),
      blocked: (data ?? []).filter((r) => r.kind === "block").map((r) => r.domain.toLowerCase()),
    };
  });

// -------------------------- Violations & Logs -------------------------------

export const listTrustViolations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    user_id: z.string().uuid().optional(),
    limit: z.number().int().min(1).max(500).default(200),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const sb = await admin();
    if (data.user_id && data.user_id !== context.userId) await assertMod(context.userId);
    let q = sb.from("trust_violations")
      .select("id, user_id, type, points, reason, ref_type, ref_id, created_at")
      .order("created_at", { ascending: false }).limit(data.limit);
    if (data.user_id) q = q.eq("user_id", data.user_id);
    const { data: rows } = await q;
    return rows ?? [];
  });

export const getTrustScore = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ user_id: z.string().uuid().optional() }).parse(raw))
  .handler(async ({ data, context }) => {
    const sb = await admin();
    const uid = data.user_id ?? context.userId;
    if (uid !== context.userId) await assertMod(context.userId);
    const { data: row } = await sb.from("user_trust_scores").select("*").eq("user_id", uid).maybeSingle();
    return row ?? { user_id: uid, points: 0, lifetime_points: 0 };
  });

export const addTrustViolation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    user_id: z.string().uuid(),
    type: z.string().min(1).max(60),
    points: z.number().int().min(0).max(1000),
    reason: z.string().max(500).optional(),
    ref_type: z.string().max(60).optional(),
    ref_id: z.string().max(120).optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const sb = await admin();
    await sb.from("trust_violations").insert({
      user_id: data.user_id,
      type: data.type,
      points: data.points,
      reason: data.reason ?? null,
      ref_type: data.ref_type ?? null,
      ref_id: data.ref_id ?? null,
      created_by: context.userId,
    } as never);
    return { ok: true };
  });

// -------------------------- Word filter admin CRUD --------------------------

export const listWordFiltersExtended = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMod(context.userId);
    const sb = await admin();
    const { data } = await sb.from("word_filters")
      .select("id,pattern,match_mode,category,actions,violation_points,severity,active,created_at")
      .order("created_at", { ascending: false }).limit(500);
    return data ?? [];
  });

export const upsertWordFilter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    id: z.string().uuid().optional(),
    pattern: z.string().min(1).max(200),
    match_mode: z.enum(["word", "substring", "regex"]).default("word"),
    category: z.string().min(1).max(40).default("general"),
    actions: z.array(z.string()).default(["replace"]),
    violation_points: z.number().int().min(0).max(100).default(1),
    active: z.boolean().default(true),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const sb = await admin();
    const payload = {
      pattern: data.pattern,
      match_mode: data.match_mode,
      category: data.category,
      actions: data.actions,
      violation_points: data.violation_points,
      active: data.active,
      created_by: context.userId,
    };
    if (data.id) {
      await sb.from("word_filters").update(payload as never).eq("id", data.id);
    } else {
      await sb.from("word_filters").insert(payload as never);
    }
    return { ok: true };
  });

export const deleteWordFilter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const sb = await admin();
    await sb.from("word_filters").delete().eq("id", data.id);
    return { ok: true };
  });
