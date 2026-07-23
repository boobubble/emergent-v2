// Unified Content Moderation Engine
//
// Single pipeline that protects every content module (Feed, Poetry, Memes,
// Images, Videos, Comments, Competition Submissions). Future modules only
// need to register a content-type adapter — no new moderation logic.
//
// Public server functions:
//   - reportContent            user report → auto flag when threshold hit
//   - listModerationQueue      admin/mod queue across all content types
//   - setContentModerationStatus  moderator hide/remove/restore
//   - warnUser / banPosting / restorePosting  user actions (shared)
//   - scanContentText          AI text moderation
//   - scanContentImages        AI image moderation
//   - listModerationLogs       unified audit log
//   - listPostingBans          shared ban list
//
// All moderator actions write to `content_moderation_logs` with
//   { content_type, content_id, reason, action_taken, moderator, timestamp }

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

// ----- Content type registry -----------------------------------------------

export const CONTENT_TYPES = [
  "feed_post",
  "poetry_poem",
  "comment",
  "competition_submission",
  "meme",
  "image",
  "video",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

type Adapter = {
  /** Physical table the item lives in. */
  table: string;
  /** Column that holds the author/owner user id. */
  ownerColumn: string;
  /** Optional plain-text column for AI text moderation & duplicate detection. */
  textColumn?: string;
  /** Optional column (text[] or jsonb) with media URLs for image scans. */
  mediaColumn?: string;
  /** Column that flips to null / soft-delete when we remove the item, if any. */
  removeColumn?: string;
};

// Only tables that actually exist in the schema are wired here today. Add new
// content types by appending to this map — every engine function will pick
// them up automatically.
const ADAPTERS: Record<ContentType, Adapter> = {
  feed_post: { table: "posts", ownerColumn: "author_id", textColumn: "text", mediaColumn: "media_urls" },
  poetry_poem: { table: "mehfil_poems", ownerColumn: "author_id", textColumn: "body" },
  comment: { table: "comments", ownerColumn: "author_id", textColumn: "text" },
  competition_submission: { table: "competition_competitors", ownerColumn: "user_id", mediaColumn: "media_urls" },
  // Standalone media items — same physical rows as feed posts today, but
  // callers can address them explicitly as "meme" / "image" / "video".
  meme: { table: "posts", ownerColumn: "author_id", textColumn: "text", mediaColumn: "media_urls" },
  image: { table: "posts", ownerColumn: "author_id", textColumn: "text", mediaColumn: "media_urls" },
  video: { table: "posts", ownerColumn: "author_id", textColumn: "text", mediaColumn: "media_urls" },
};

export function getAdapter(type: ContentType): Adapter {
  const a = ADAPTERS[type];
  if (!a) throw new Error(`No moderation adapter registered for ${type}`);
  return a;
}

// ----- Helpers -------------------------------------------------------------

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

async function assertMod(userId: string) {
  const roles = await getRoles(userId);
  if (!roles.some((r) => (MOD_ROLES as readonly string[]).includes(r))) {
    throw new Error("Forbidden: moderator only");
  }
}

async function assertAdmin(userId: string) {
  const roles = await getRoles(userId);
  if (!roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r))) {
    throw new Error("Forbidden: admin only");
  }
}

async function logAction(params: {
  content_type?: ContentType | null;
  content_id?: string | null;
  action_taken: string;
  reason?: string | null;
  moderator_id?: string | null;
  target_user_id?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const sb = await admin();
  await sb.from("content_moderation_logs").insert({
    content_type: params.content_type ?? null,
    content_id: params.content_id ?? null,
    action_taken: params.action_taken,
    reason: params.reason ?? null,
    moderator_id: params.moderator_id ?? null,
    target_user_id: params.target_user_id ?? null,
    metadata: (params.metadata ?? {}) as never,
  } as never);
}

async function fetchOwner(type: ContentType, id: string): Promise<string | null> {
  const a = getAdapter(type);
  const sb = await admin();
  const { data } = await sb.from(a.table as never).select(a.ownerColumn as never).eq("id", id).maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any)?.[a.ownerColumn] ?? null;
}

// ----- Settings -------------------------------------------------------------

const DEFAULT_SETTINGS = {
  enabled: true,
  auto_hide_report_threshold: 5,
  auto_hide_ai_threshold: 0.8,
  duplicate_window_minutes: 10,
  max_posts_per_hour: 20,
  max_comments_per_minute: 10,
  ai_image_moderation_enabled: true,
  ai_text_moderation_enabled: true,
  ai_moderation_categories: [
    "nudity", "pornography", "violence", "gore", "child_safety", "drugs", "weapons",
    "hate_speech", "harassment", "self_harm",
  ],
};

export const getModerationSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const { data } = await sb.from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
  return { ...DEFAULT_SETTINGS, ...((data?.value as Record<string, unknown>) ?? {}) };
});

// ----- Reports --------------------------------------------------------------

const ReportInput = z.object({
  content_type: z.enum(CONTENT_TYPES),
  content_id: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

export const reportContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("moderation.report")])
  .inputValidator((raw) => ReportInput.parse(raw))
  .handler(async ({ data, context }) => {
    const sb = await admin();
    const owner = await fetchOwner(data.content_type, data.content_id);
    if (owner === context.userId) throw new Error("You cannot report your own content");

    // Map our engine content_type onto the legacy `reports.target_type` enum.
    const REPORT_TARGET_MAP: Record<ContentType, "post" | "comment" | "user" | "message" | "room"> = {
      feed_post: "post", meme: "post", image: "post", video: "post", poetry_poem: "post",
      competition_submission: "post", comment: "comment",
    };
    const target_type = REPORT_TARGET_MAP[data.content_type];

    // De-duplicate: same reporter + target within 24h
    const { data: existing } = await sb.from("reports")
      .select("id").eq("reporter_id", context.userId)
      .eq("target_type", target_type).eq("target_id", data.content_id)
      .gt("created_at", new Date(Date.now() - 86_400_000).toISOString())
      .maybeSingle();
    if (existing) return { ok: true, deduped: true };

    await sb.from("reports").insert({
      reporter_id: context.userId,
      target_type,
      target_id: data.content_id,
      reason: data.reason,
      status: "open",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Atomically bump the counter (trigger auto-hides at threshold)
    await sb.rpc("content_moderation_bump_report", {
      _content_type: data.content_type,
      _content_id: data.content_id,
      _owner_id: owner,
    } as never);

    return { ok: true, deduped: false };
  });

// ----- Queue ----------------------------------------------------------------

export const listModerationQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      content_type: z.enum([...CONTENT_TYPES, "all"] as const).default("all"),
      status: z.enum(["pending_review", "hidden", "removed", "all"]).default("pending_review"),
      limit: z.number().int().min(1).max(200).default(100),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const sb = await admin();
    let q = sb.from("content_moderation")
      .select("id, content_type, content_id, owner_id, status, reason, report_count, ai_flags, hidden_at, created_at, updated_at")
      .order("hidden_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .limit(data.limit);
    if (data.content_type !== "all") q = q.eq("content_type", data.content_type);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw error;

    // Hydrate a text/media preview per row from the adapter table.
    const enriched = await Promise.all((rows ?? []).map(async (row) => {
      const a = getAdapter(row.content_type as ContentType);
      const cols = ["id", a.ownerColumn, "created_at"];
      if (a.textColumn) cols.push(a.textColumn);
      if (a.mediaColumn) cols.push(a.mediaColumn);
      const { data: rec } = await sb.from(a.table as never)
        .select(cols.join(",") as never).eq("id", row.content_id).maybeSingle();
      return { ...row, preview: rec ?? null };
    }));
    return enriched;
  });

// ----- Status change --------------------------------------------------------

const StatusInput = z.object({
  content_type: z.enum(CONTENT_TYPES),
  content_id: z.string().uuid(),
  status: z.enum(["visible", "hidden", "removed"]),
  reason: z.string().max(500).optional(),
});

export const setContentModerationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => StatusInput.parse(raw))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const sb = await admin();
    const owner = await fetchOwner(data.content_type, data.content_id);

    const patch: Record<string, unknown> = {
      content_type: data.content_type,
      content_id: data.content_id,
      owner_id: owner,
      status: data.status,
      reason: data.reason ?? null,
      last_actor_id: context.userId,
      hidden_at: data.status === "visible" ? null : new Date().toISOString(),
    };
    await sb.from("content_moderation")
      .upsert(patch as never, { onConflict: "content_type,content_id" });

    // Mirror onto the underlying feed tables so existing views keep filtering.
    if (data.content_type === "feed_post" || data.content_type === "meme" || data.content_type === "image" || data.content_type === "video") {
      await sb.from("posts").update({
        moderation_status: data.status === "visible" ? "visible" : (data.status === "removed" ? "removed" : "hidden"),
        moderation_reason: data.reason ?? null,
        hidden_at: data.status === "visible" ? null : new Date().toISOString(),
      } as never).eq("id", data.content_id);
    } else if (data.content_type === "comment") {
      await sb.from("comments").update({
        moderation_status: data.status === "visible" ? "visible" : (data.status === "removed" ? "removed" : "hidden"),
        moderation_reason: data.reason ?? null,
        hidden_at: data.status === "visible" ? null : new Date().toISOString(),
      } as never).eq("id", data.content_id);
    }

    // Auto-resolve any open reports on this item.
    await sb.from("reports").update({ status: "resolved" } as never)
      .eq("target_type", data.content_type as never)
      .eq("target_id", data.content_id)
      .eq("status", "open");

    await logAction({
      content_type: data.content_type,
      content_id: data.content_id,
      action_taken: `set_${data.status}`,
      reason: data.reason,
      moderator_id: context.userId,
      target_user_id: owner,
    });

    return { ok: true };
  });

// ----- User actions: warn / ban / restore ----------------------------------

export const warnUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    user_id: z.string().uuid(),
    reason: z.string().min(1).max(500),
    severity: z.enum(["warning", "final_warning"]).default("warning"),
    scope: z.string().default("all"),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const sb = await admin();
    await sb.from("feed_mod_warnings").insert({
      user_id: data.user_id,
      moderator_id: context.userId,
      reason: data.reason,
      severity: data.severity,
      scope: data.scope,
    } as never);
    await logAction({
      action_taken: "warn_user",
      reason: data.reason,
      moderator_id: context.userId,
      target_user_id: data.user_id,
      metadata: { severity: data.severity, scope: data.scope },
    });
    return { ok: true };
  });

export const banPosting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    user_id: z.string().uuid(),
    reason: z.string().max(500).optional(),
    duration_hours: z.number().int().min(1).max(24 * 365).optional(),
    scope: z.string().default("all"),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const sb = await admin();
    const expires_at = data.duration_hours
      ? new Date(Date.now() + data.duration_hours * 3_600_000).toISOString()
      : null;
    await sb.from("feed_posting_bans").insert({
      user_id: data.user_id,
      moderator_id: context.userId,
      reason: data.reason ?? null,
      expires_at,
      active: true,
      scope: data.scope,
    } as never);
    await logAction({
      action_taken: expires_at ? "ban_temp" : "ban_permanent",
      reason: data.reason,
      moderator_id: context.userId,
      target_user_id: data.user_id,
      metadata: { duration_hours: data.duration_hours ?? null, scope: data.scope },
    });
    return { ok: true, expires_at };
  });

export const restorePosting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ user_id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await admin();
    await sb.from("feed_posting_bans").update({ active: false } as never)
      .eq("user_id", data.user_id).eq("active", true);
    await logAction({
      action_taken: "restore_posting",
      moderator_id: context.userId,
      target_user_id: data.user_id,
    });
    return { ok: true };
  });

export const listPostingBans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMod(context.userId);
    const sb = await admin();
    const { data } = await sb.from("feed_posting_bans")
      .select("id, user_id, moderator_id, reason, expires_at, active, scope, created_at")
      .order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

// ----- Logs ----------------------------------------------------------------

export const listModerationLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    limit: z.number().int().min(1).max(500).default(100),
    content_type: z.enum([...CONTENT_TYPES, "all"] as const).default("all"),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const sb = await admin();
    let q = sb.from("content_moderation_logs")
      .select("id, content_type, content_id, action_taken, reason, moderator_id, target_user_id, metadata, created_at")
      .order("created_at", { ascending: false }).limit(data.limit);
    if (data.content_type !== "all") q = q.eq("content_type", data.content_type);
    const { data: rows } = await q;
    return rows ?? [];
  });

// ----- AI moderation --------------------------------------------------------

const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAiJson(messages: unknown, model = "google/gemini-3.1-flash-lite") {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(LOVABLE_AI, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({ model, messages, response_format: { type: "json_object" } }),
  });
  if (!res.ok) throw new Error(`AI moderation failed: ${res.status}`);
  const j = await res.json();
  const raw = j.choices?.[0]?.message?.content ?? "{}";
  try { return JSON.parse(raw) as Record<string, number>; } catch { return {}; }
}

export const scanContentText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    content_type: z.enum(CONTENT_TYPES),
    content_id: z.string().uuid(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const settings = { ...DEFAULT_SETTINGS };
    const sb = await admin();
    const { data: cfg } = await sb.from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
    Object.assign(settings, (cfg?.value as Record<string, unknown>) ?? {});
    if (!settings.ai_text_moderation_enabled) return { ok: true, skipped: true };

    const a = getAdapter(data.content_type);
    if (!a.textColumn) return { ok: true, skipped: true, reason: "no text column" };
    const { data: rec } = await sb.from(a.table as never)
      .select(`${a.textColumn}, ${a.ownerColumn}` as never).eq("id", data.content_id).maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = ((rec as any)?.[a.textColumn] as string | null) ?? "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const owner = ((rec as any)?.[a.ownerColumn] as string | null) ?? null;
    if (!text.trim()) return { ok: true, skipped: true, reason: "empty" };

    const cats = settings.ai_moderation_categories;
    const scores = await callAiJson([
      { role: "system", content: `You are a strict content moderator. Score the following text for each category from 0 (safe) to 1 (severe): ${cats.join(", ")}. Respond ONLY with a JSON object mapping each category to its score.` },
      { role: "user", content: text.slice(0, 4000) },
    ]);
    const worst = Math.max(0, ...Object.values(scores).map((n) => Number(n) || 0));
    const threshold = settings.auto_hide_ai_threshold;

    const patch: Record<string, unknown> = {
      content_type: data.content_type,
      content_id: data.content_id,
      owner_id: owner,
      ai_flags: { text: { scanned_at: new Date().toISOString(), threshold, scores } },
    };
    if (worst >= threshold) {
      patch.status = "hidden";
      patch.reason = `AI text moderation: ${worst.toFixed(2)}`;
      patch.hidden_at = new Date().toISOString();
    }
    await sb.from("content_moderation")
      .upsert(patch as never, { onConflict: "content_type,content_id" });

    if (worst >= threshold) {
      await logAction({
        content_type: data.content_type, content_id: data.content_id,
        action_taken: "ai_auto_hide_text", reason: `worst=${worst.toFixed(2)}`,
        target_user_id: owner, metadata: { scores, threshold },
      });
    }
    return { ok: true, worst, threshold, scores };
  });

export const scanContentImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    content_type: z.enum(CONTENT_TYPES),
    content_id: z.string().uuid(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const settings = { ...DEFAULT_SETTINGS };
    const sb = await admin();
    const { data: cfg } = await sb.from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
    Object.assign(settings, (cfg?.value as Record<string, unknown>) ?? {});
    if (!settings.ai_image_moderation_enabled) return { ok: true, skipped: true };

    const a = getAdapter(data.content_type);
    if (!a.mediaColumn) return { ok: true, skipped: true, reason: "no media column" };
    const { data: rec } = await sb.from(a.table as never)
      .select(`${a.mediaColumn}, ${a.ownerColumn}` as never).eq("id", data.content_id).maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const media = ((rec as any)?.[a.mediaColumn] as string[] | null) ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const owner = ((rec as any)?.[a.ownerColumn] as string | null) ?? null;
    const images = media.filter((u) => /\.(png|jpe?g|webp|gif|bmp)(\?|$)/i.test(u));
    if (images.length === 0) return { ok: true, skipped: true, reason: "no images" };

    const cats = settings.ai_moderation_categories;
    const results: Array<{ url: string; scores: Record<string, number> }> = [];
    for (const url of images.slice(0, 4)) {
      const scores = await callAiJson([
        { role: "system", content: `Rate this image for each category (0 safe → 1 severe): ${cats.join(", ")}. Reply ONLY as JSON.` },
        { role: "user", content: [
          { type: "text", text: "Score the following image." },
          { type: "image_url", image_url: { url } },
        ] },
      ], "google/gemini-3.1-flash-lite");
      results.push({ url, scores });
    }
    const worst = Math.max(0, ...results.flatMap((r) => Object.values(r.scores).map((n) => Number(n) || 0)));
    const threshold = settings.auto_hide_ai_threshold;

    const patch: Record<string, unknown> = {
      content_type: data.content_type,
      content_id: data.content_id,
      owner_id: owner,
      ai_flags: { images: { scanned_at: new Date().toISOString(), threshold, results } },
    };
    if (worst >= threshold) {
      patch.status = "hidden";
      patch.reason = `AI image moderation: ${worst.toFixed(2)}`;
      patch.hidden_at = new Date().toISOString();
    }
    await sb.from("content_moderation")
      .upsert(patch as never, { onConflict: "content_type,content_id" });

    if (worst >= threshold) {
      await logAction({
        content_type: data.content_type, content_id: data.content_id,
        action_taken: "ai_auto_hide_image", reason: `worst=${worst.toFixed(2)}`,
        target_user_id: owner, metadata: { results, threshold },
      });
    }
    return { ok: true, worst, threshold, results };
  });
