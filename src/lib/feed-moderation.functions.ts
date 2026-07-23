// Feed Moderation server functions
// Scope: FEED CONTENT ONLY (posts + comments). Competition/Poetry/Admin unaffected.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const MOD_ROLES = ["feed_moderator", "moderator", "admin", "super_admin"] as const;
const ADMIN_ROLES = ["admin", "super_admin"] as const;

async function getRoles(userId: string): Promise<string[]> {
  const sb = await admin();
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role as string);
}

async function assertFeedMod(userId: string) {
  const roles = await getRoles(userId);
  if (!roles.some((r) => (MOD_ROLES as readonly string[]).includes(r))) {
    throw new Error("Forbidden: feed moderator only");
  }
  return roles;
}

async function assertAdmin(userId: string) {
  const roles = await getRoles(userId);
  if (!roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r))) {
    throw new Error("Forbidden: admin only");
  }
}

async function log(actor_id: string, action: string, extra: Record<string, unknown> = {}) {
  const sb = await admin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await sb.from("mod_logs").insert({ actor_id, action, ...extra } as any);
}

// ---------------- Settings ----------------
const DEFAULT_SETTINGS = {
  enabled: true,
  auto_hide_report_threshold: 5,
  auto_hide_ai_threshold: 0.8,
  duplicate_window_minutes: 10,
  max_posts_per_hour: 20,
  max_comments_per_minute: 10,
  ai_image_moderation_enabled: true,
  ai_moderation_categories: [
    "nudity", "pornography", "violence", "gore", "child_safety", "drugs", "weapons",
  ],
};

export const getFeedModerationSettings = createServerFn({ method: "GET" }).handler(
  async () => {
    const sb = await admin();
    const { data } = await sb
      .from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
    return { ...DEFAULT_SETTINGS, ...((data?.value as Record<string, unknown>) ?? {}) };
  },
);

export const updateFeedModerationSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      enabled: z.boolean().optional(),
      auto_hide_report_threshold: z.number().int().min(1).max(1000).optional(),
      auto_hide_ai_threshold: z.number().min(0).max(1).optional(),
      duplicate_window_minutes: z.number().int().min(0).max(1440).optional(),
      max_posts_per_hour: z.number().int().min(1).max(500).optional(),
      max_comments_per_minute: z.number().int().min(1).max(200).optional(),
      ai_image_moderation_enabled: z.boolean().optional(),
      ai_moderation_categories: z.array(z.string()).optional(),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await admin();
    const { data: existing } = await sb
      .from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
    const merged = { ...DEFAULT_SETTINGS, ...((existing?.value as Record<string, unknown>) ?? {}), ...data };
    await sb.from("app_settings").upsert({ key: "feed_moderation", value: merged });
    await log(context.userId, "update_feed_moderation_settings", { payload: data });
    return { ok: true };
  });

// ---------------- Report content ----------------
export const reportFeedContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("report.submit")])
  .inputValidator((raw) =>
    z.object({
      target_type: z.enum(["post", "comment"]),
      target_id: z.string().min(1).max(200),
      reason: z.string().min(1).max(200),
      details: z.string().max(2000).optional(),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const sb = await admin();
    // Prevent duplicate report from same reporter for the same target
    const { data: dup } = await sb
      .from("reports")
      .select("id")
      .eq("reporter_id", context.userId)
      .eq("target_type", data.target_type)
      .eq("target_id", data.target_id)
      .maybeSingle();
    if (dup) return { ok: true, deduped: true };

    const { error } = await sb.from("reports").insert({
      reporter_id: context.userId,
      target_type: data.target_type,
      target_id: data.target_id,
      reason: data.reason,
      details: data.details ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Moderation queue ----------------
export const listFeedModerationQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      status: z.enum(["pending_review", "hidden", "removed", "visible", "all"]).default("pending_review"),
      kind: z.enum(["post", "comment", "all"]).default("all"),
      limit: z.number().int().min(1).max(200).default(50),
    }).parse(raw ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertFeedMod(context.userId);
    const sb = await admin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: { posts: any[]; comments: any[] } = { posts: [], comments: [] };

    if (data.kind === "post" || data.kind === "all") {
      let q = sb.from("posts")
        .select("id, author_id, text, media_urls, moderation_status, moderation_reason, report_count, ai_flags, created_at, hidden_at, slug")
        .order("hidden_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(data.limit);
      if (data.status !== "all") q = q.eq("moderation_status", data.status);
      const { data: rows } = await q;
      out.posts = rows ?? [];
    }
    if (data.kind === "comment" || data.kind === "all") {
      let q = sb.from("comments")
        .select("id, author_id, post_id, text, moderation_status, moderation_reason, report_count, created_at, hidden_at")
        .order("hidden_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(data.limit);
      if (data.status !== "all") q = q.eq("moderation_status", data.status);
      const { data: rows } = await q;
      out.comments = rows ?? [];
    }
    return out;
  });

// ---------------- Moderate actions ----------------
export const setFeedContentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      target_type: z.enum(["post", "comment"]),
      target_id: z.string().uuid(),
      status: z.enum(["visible", "pending_review", "hidden", "removed"]),
      reason: z.string().max(500).optional(),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertFeedMod(context.userId);
    const sb = await admin();
    const table = data.target_type === "post" ? "posts" : "comments";
    const patch: Record<string, unknown> = {
      moderation_status: data.status,
      moderation_reason: data.reason ?? null,
      hidden_at: data.status === "visible" ? null : new Date().toISOString(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await sb.from(table).update(patch as any).eq("id", data.target_id);
    if (error) throw new Error(error.message);

    // Auto-resolve open reports for this target
    await sb.from("reports").update({
      status: "resolved",
      resolved_by: context.userId,
      resolved_at: new Date().toISOString(),
      resolution_note: `Moderated: ${data.status}`,
    }).eq("target_type", data.target_type).eq("target_id", data.target_id).eq("status", "open");

    await log(context.userId, `feed_${data.status}_${data.target_type}`, {
      target_id: data.target_id, payload: { reason: data.reason },
    });
    return { ok: true };
  });

// ---------------- Warnings ----------------
export const warnFeedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      user_id: z.string().uuid(),
      reason: z.string().min(1).max(500),
      severity: z.enum(["notice", "warning", "final_warning"]).default("warning"),
      target_type: z.enum(["post", "comment"]).optional(),
      target_id: z.string().optional(),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertFeedMod(context.userId);
    const sb = await admin();
    const { error } = await sb.from("feed_mod_warnings").insert({
      user_id: data.user_id,
      moderator_id: context.userId,
      severity: data.severity,
      reason: data.reason,
      target_type: data.target_type ?? null,
      target_id: data.target_id ?? null,
    });
    if (error) throw new Error(error.message);
    await log(context.userId, "warn", { target_user_id: data.user_id, payload: { reason: data.reason, severity: data.severity } });
    return { ok: true };
  });

export const listMyFeedWarnings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = await admin();
    const { data } = await sb.from("feed_mod_warnings")
      .select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false }).limit(50);
    return data ?? [];
  });

export const acknowledgeWarning = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const sb = await admin();
    await sb.from("feed_mod_warnings").update({ acknowledged_at: new Date().toISOString() })
      .eq("id", data.id).eq("user_id", context.userId);
    return { ok: true };
  });

// ---------------- Posting bans ----------------
export const banFeedPosting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      user_id: z.string().uuid(),
      reason: z.string().max(500).optional(),
      duration_hours: z.number().int().min(1).max(24 * 365).optional(),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertFeedMod(context.userId);
    const sb = await admin();
    const expires_at = data.duration_hours
      ? new Date(Date.now() + data.duration_hours * 3600_000).toISOString()
      : null;
    const { error } = await sb.from("feed_posting_bans").insert({
      user_id: data.user_id,
      reason: data.reason ?? null,
      created_by: context.userId,
      expires_at,
      active: true,
    });
    if (error) throw new Error(error.message);
    await log(context.userId, "feed_posting_ban", {
      target_user_id: data.user_id,
      payload: { reason: data.reason, expires_at },
    });
    return { ok: true };
  });

export const restoreFeedPosting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ user_id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertFeedMod(context.userId);
    const sb = await admin();
    await sb.from("feed_posting_bans").update({ active: false })
      .eq("user_id", data.user_id).eq("active", true);
    await log(context.userId, "feed_posting_restore", { target_user_id: data.user_id });
    return { ok: true };
  });

export const listFeedPostingBans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertFeedMod(context.userId);
    const sb = await admin();
    const { data } = await sb.from("feed_posting_bans")
      .select("*")
      .order("created_at", { ascending: false }).limit(100);
    return data ?? [];
  });

export const checkMyPostingBan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = await admin();
    const { data } = await sb.from("feed_posting_bans")
      .select("id, reason, expires_at, created_at")
      .eq("user_id", context.userId).eq("active", true)
      .order("created_at", { ascending: false }).limit(1);
    const row = data?.[0];
    if (!row) return { banned: false as const };
    if (row.expires_at && new Date(row.expires_at) < new Date()) return { banned: false as const };
    return { banned: true as const, reason: row.reason, expires_at: row.expires_at };
  });

// ---------------- Moderator logs ----------------
export const listFeedModLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({ limit: z.number().int().min(1).max(200).default(100) }).parse(raw ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertFeedMod(context.userId);
    const sb = await admin();
    const { data: rows } = await sb.from("mod_logs")
      .select("*")
      .like("action", "feed_%")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    return rows ?? [];
  });

// ---------------- AI image moderation ----------------
type AiScanResult = {
  flagged: boolean;
  max_score: number;
  categories: Record<string, number>;
  reasons: string[];
};

async function callLovableAiVision(imageUrl: string, categories: string[]): Promise<AiScanResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  const catList = categories.join(", ");
  const prompt = `You are a content safety classifier. Analyze the image and return STRICT JSON only, no prose.
For each of these categories: ${catList}, return a probability from 0.0 to 1.0 that the image contains that category.
Respond in this exact JSON shape:
{"categories":{"nudity":0.0,"pornography":0.0,"violence":0.0,"gore":0.0,"child_safety":0.0,"drugs":0.0,"weapons":0.0},"reasons":["short reason"]}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-lite",
      messages: [
        { role: "user", content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ]},
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI gateway ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "{}";
  const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
  let parsed: { categories?: Record<string, number>; reasons?: string[] } = {};
  try { parsed = JSON.parse(cleaned); } catch { /* fallback below */ }
  const cats = parsed.categories ?? {};
  const values = Object.values(cats).map((v) => Number(v) || 0);
  const max_score = values.length ? Math.max(...values) : 0;
  return {
    flagged: max_score >= 0.5,
    max_score,
    categories: cats,
    reasons: parsed.reasons ?? [],
  };
}

export const scanPostImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ post_id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const sb = await admin();
    const { data: post } = await sb.from("posts")
      .select("id, author_id, media_urls").eq("id", data.post_id).maybeSingle();
    if (!post) throw new Error("Post not found");

    // Author can rescan own post; otherwise require mod
    if (post.author_id !== context.userId) await assertFeedMod(context.userId);

    const settings = await (async () => {
      const { data } = await sb.from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
      return { ...DEFAULT_SETTINGS, ...((data?.value as Record<string, unknown>) ?? {}) };
    })();

    if (!settings.ai_image_moderation_enabled) return { skipped: true as const };

    const urls = (post.media_urls ?? []).filter((u: string) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(u));
    if (urls.length === 0) return { skipped: true as const, reason: "no images" };

    const results: Array<AiScanResult & { url: string }> = [];
    for (const url of urls.slice(0, 4)) {
      try {
        const r = await callLovableAiVision(url, settings.ai_moderation_categories as string[]);
        results.push({ ...r, url });
      } catch (e) {
        results.push({ url, flagged: false, max_score: 0, categories: {}, reasons: [String(e).slice(0, 200)] });
      }
    }

    const worst = results.reduce((m, r) => (r.max_score > m ? r.max_score : m), 0);
    const threshold = Number(settings.auto_hide_ai_threshold) || 0.8;
    const patch: Record<string, unknown> = {
      ai_flags: { scanned_at: new Date().toISOString(), threshold, results },
    };
    if (worst >= threshold) {
      patch.moderation_status = "hidden";
      patch.moderation_reason = `AI moderation: score ${worst.toFixed(2)}`;
      patch.hidden_at = new Date().toISOString();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sb.from("posts").update(patch as any).eq("id", post.id);
    if (worst >= threshold) {
      await log(context.userId, "feed_ai_auto_hide_post", { target_id: post.id, payload: { worst, threshold } });
    }
    return { ok: true, worst, threshold, results };
  });
