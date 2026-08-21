import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { withRateLimit } from "./rate-limit-middleware";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin", "moderator"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any {
  return supabaseAdmin;
}

export type AvatarModerationStatus =
  | "none"
  | "pending"
  | "approved"
  | "needs_review"
  | "rejected";

type VisionResult = {
  flagged: boolean;
  max_score: number;
  categories: Record<string, number>;
  reasons: string[];
  error?: string;
};

async function callAvatarVision(imageUrl: string): Promise<VisionResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    // Fail closed for external social use — do not approve without a scan.
    return {
      flagged: true,
      max_score: 1,
      categories: {},
      reasons: ["moderation_unavailable"],
      error: "LOVABLE_API_KEY missing",
    };
  }

  const prompt = `You are a profile-picture safety classifier for a social chat app.
Analyze the image and return STRICT JSON only.
Categories (0.0–1.0): nudity, pornography, sexual_content, child_safety, violence, gore.
Flag clear adult nudity / explicit sexual imagery strongly.
Respond exactly:
{"categories":{"nudity":0.0,"pornography":0.0,"sexual_content":0.0,"child_safety":0.0,"violence":0.0,"gore":0.0},"reasons":["short reason"]}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-lite",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return {
      flagged: true,
      max_score: 1,
      categories: {},
      reasons: [`ai_gateway_${res.status}`],
      error: t.slice(0, 200),
    };
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content ?? "{}";
  const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
  let parsed: { categories?: Record<string, number>; reasons?: string[] } = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return {
      flagged: true,
      max_score: 0.6,
      categories: {},
      reasons: ["unparseable_ai_response"],
      error: "parse_failed",
    };
  }

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

function isYaarzoAvatarsPublicUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    // Typical: https://<project>.supabase.co/storage/v1/object/public/avatars/...
    return (
      u.pathname.includes("/storage/v1/object/public/avatars/") ||
      u.pathname.includes("/object/public/avatars/")
    );
  } catch {
    return false;
  }
}

function storagePathFromPublicAvatarUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const marker = "/object/public/avatars/";
    const idx = u.pathname.indexOf(marker);
    if (idx < 0) return null;
    return decodeURIComponent(u.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

async function writeAudit(row: {
  user_id: string;
  avatar_url?: string | null;
  action: string;
  reason?: string | null;
  moderator_id?: string | null;
  source: "automatic" | "admin";
  metadata?: Record<string, unknown>;
}) {
  await db().from("profile_image_moderation_logs").insert({
    user_id: row.user_id,
    avatar_url: row.avatar_url ?? null,
    action: row.action,
    reason: row.reason ?? null,
    moderator_id: row.moderator_id ?? null,
    source: row.source,
    metadata: row.metadata ?? {},
  });
}

async function maybeDeleteOwnedAvatarObject(url: string | null | undefined) {
  if (!url || !isYaarzoAvatarsPublicUrl(url)) return { deleted: false };
  const path = storagePathFromPublicAvatarUrl(url);
  if (!path) return { deleted: false };
  const { error } = await supabaseAdmin.storage.from("avatars").remove([path]);
  return { deleted: !error, path };
}

function classifyVision(result: VisionResult): {
  status: AvatarModerationStatus;
  reason: string;
} {
  if (result.error === "LOVABLE_API_KEY missing" || result.reasons.includes("moderation_unavailable")) {
    return { status: "needs_review", reason: "moderation_unavailable_fail_closed" };
  }
  if (result.error || result.reasons.some((r) => r.startsWith("ai_gateway_") || r === "parse_failed" || r === "unparseable_ai_response")) {
    return { status: "needs_review", reason: result.error || result.reasons[0] || "moderation_error" };
  }

  const nudity = Number(result.categories.nudity ?? 0);
  const porn = Number(result.categories.pornography ?? 0);
  const sexual = Number(result.categories.sexual_content ?? 0);
  const child = Number(result.categories.child_safety ?? 0);
  const explicitScore = Math.max(nudity, porn, sexual, child);

  // Clear explicit / child-safety risk → reject
  if (explicitScore >= 0.8 || child >= 0.5) {
    return {
      status: "rejected",
      reason: `automatic_reject:score=${explicitScore.toFixed(2)}`,
    };
  }
  // Borderline → admin review
  if (explicitScore >= 0.45 || result.max_score >= 0.55) {
    return {
      status: "needs_review",
      reason: `automatic_needs_review:score=${Math.max(explicitScore, result.max_score).toFixed(2)}`,
    };
  }
  return { status: "approved", reason: "automatic_approved" };
}

/**
 * Run after avatar upload. Fail-closed for Buffer (non-approved never sent).
 * Signup/upload path must not throw to the user for moderation failures.
 */
export async function runAvatarModerationScan(opts: {
  userId: string;
  avatarUrl: string;
  actorId?: string | null;
}): Promise<{ status: AvatarModerationStatus; reason: string }> {
  const avatarUrl = opts.avatarUrl?.trim();
  if (!avatarUrl) {
    await db()
      .from("profiles")
      .update({
        avatar_moderation_status: "none",
        avatar_moderation_reason: null,
        avatar_moderated_at: new Date().toISOString(),
        avatar_quarantine_url: null,
      })
      .eq("id", opts.userId);
    return { status: "none", reason: "no_avatar" };
  }

  // data: URLs cannot be scanned safely for Buffer — quarantine for review
  if (avatarUrl.toLowerCase().startsWith("data:") || avatarUrl.toLowerCase().startsWith("blob:")) {
    await db()
      .from("profiles")
      .update({
        avatar_url: null,
        avatar_quarantine_url: null,
        avatar_moderation_status: "needs_review",
        avatar_moderation_reason: "non_public_avatar_url",
        avatar_moderated_at: new Date().toISOString(),
        avatar_moderated_by: opts.actorId ?? null,
      })
      .eq("id", opts.userId);
    await writeAudit({
      user_id: opts.userId,
      avatar_url: "[data-or-blob]",
      action: "needs_review",
      reason: "non_public_avatar_url",
      moderator_id: opts.actorId ?? null,
      source: "automatic",
    });
    return { status: "needs_review", reason: "non_public_avatar_url" };
  }

  await db()
    .from("profiles")
    .update({
      avatar_moderation_status: "pending",
      avatar_moderation_reason: "scanning",
      avatar_moderated_at: null,
      avatar_moderated_by: null,
    })
    .eq("id", opts.userId);

  await writeAudit({
    user_id: opts.userId,
    avatar_url: avatarUrl,
    action: "pending",
    reason: "upload_scan_started",
    moderator_id: opts.actorId ?? null,
    source: "automatic",
  });

  let vision: VisionResult;
  try {
    vision = await callAvatarVision(avatarUrl);
  } catch (e) {
    vision = {
      flagged: true,
      max_score: 1,
      categories: {},
      reasons: ["scan_exception"],
      error: e instanceof Error ? e.message.slice(0, 200) : "scan_exception",
    };
  }

  const { status, reason } = classifyVision(vision);
  const now = new Date().toISOString();

  if (status === "approved") {
    await db()
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        avatar_quarantine_url: null,
        avatar_moderation_status: "approved",
        avatar_moderation_reason: reason,
        avatar_moderated_at: now,
        avatar_moderated_by: null,
      })
      .eq("id", opts.userId);
    await writeAudit({
      user_id: opts.userId,
      avatar_url: avatarUrl,
      action: "approved",
      reason,
      source: "automatic",
      metadata: { categories: vision.categories, max_score: vision.max_score },
    });
    return { status, reason };
  }

  if (status === "rejected") {
    await maybeDeleteOwnedAvatarObject(avatarUrl);
    await db()
      .from("profiles")
      .update({
        avatar_url: null,
        avatar_quarantine_url: null,
        avatar_moderation_status: "rejected",
        avatar_moderation_reason: reason,
        avatar_moderated_at: now,
        avatar_moderated_by: null,
      })
      .eq("id", opts.userId);
    await writeAudit({
      user_id: opts.userId,
      avatar_url: avatarUrl,
      action: "rejected",
      reason,
      source: "automatic",
      metadata: { categories: vision.categories, max_score: vision.max_score },
    });
    return { status, reason };
  }

  // needs_review — quarantine, hide from public profile
  await db()
    .from("profiles")
    .update({
      avatar_url: null,
      avatar_quarantine_url: avatarUrl,
      avatar_moderation_status: "needs_review",
      avatar_moderation_reason: reason,
      avatar_moderated_at: now,
      avatar_moderated_by: null,
    })
    .eq("id", opts.userId);
  await writeAudit({
    user_id: opts.userId,
    avatar_url: avatarUrl,
    action: "needs_review",
    reason,
    source: "automatic",
    metadata: { categories: vision.categories, max_score: vision.max_score },
  });
  return { status, reason };
}

/** Fire-and-forget wrapper for client upload paths (never throws to caller). */
export async function enqueueAvatarModerationSafe(userId: string, avatarUrl: string) {
  try {
    await runAvatarModerationScan({ userId, avatarUrl });
  } catch (e) {
    console.error("[avatar-moderation]", e instanceof Error ? e.message : e);
    try {
      await db()
        .from("profiles")
        .update({
          avatar_url: null,
          avatar_quarantine_url: avatarUrl.startsWith("http") ? avatarUrl : null,
          avatar_moderation_status: "needs_review",
          avatar_moderation_reason: "scan_failed_fail_closed",
          avatar_moderated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      await writeAudit({
        user_id: userId,
        avatar_url: avatarUrl.startsWith("http") ? avatarUrl : "[unavailable]",
        action: "needs_review",
        reason: "scan_failed_fail_closed",
        source: "automatic",
      });
    } catch {
      /* ignore */
    }
  }
}

export const moderateMyAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ avatarUrl: z.string().min(1).max(4000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    // Set pending + avatar immediately, then scan
    const url = data.avatarUrl.trim();
    if (!url.toLowerCase().startsWith("data:") && !url.toLowerCase().startsWith("blob:")) {
      await db()
        .from("profiles")
        .update({
          avatar_url: url,
          avatar_moderation_status: "pending",
          avatar_moderation_reason: "scanning",
        })
        .eq("id", context.userId);
    }
    const result = await runAvatarModerationScan({
      userId: context.userId,
      avatarUrl: url,
      actorId: context.userId,
    });
    return { ok: true, ...result };
  });

export const listAvatarModerationQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z
      .object({
        status: z
          .enum(["pending", "needs_review", "rejected", "approved", "all"])
          .optional()
          .default("needs_review"),
        limit: z.number().int().min(1).max(100).optional().default(50),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    let q = db()
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, avatar_quarantine_url, avatar_moderation_status, avatar_moderation_reason, avatar_moderated_at, updated_at, allow_social_feature, created_at",
      )
      .order("updated_at", { ascending: false })
      .limit(data.limit);

    if (data.status && data.status !== "all") {
      q = q.eq("avatar_moderation_status", data.status);
    } else {
      q = q.in("avatar_moderation_status", [
        "pending",
        "needs_review",
        "rejected",
        "approved",
      ]);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminApproveAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: prof } = await db()
      .from("profiles")
      .select("id, avatar_url, avatar_quarantine_url")
      .eq("id", data.userId)
      .maybeSingle();
    if (!prof) throw new Error("User not found");
    const url = prof.avatar_quarantine_url || prof.avatar_url;
    if (!url) throw new Error("No avatar image to approve");

    await db()
      .from("profiles")
      .update({
        avatar_url: url,
        avatar_quarantine_url: null,
        avatar_moderation_status: "approved",
        avatar_moderation_reason: "admin_approved",
        avatar_moderated_at: new Date().toISOString(),
        avatar_moderated_by: context.userId,
      })
      .eq("id", data.userId);

    await writeAudit({
      user_id: data.userId,
      avatar_url: url,
      action: "approved",
      reason: "admin_approved",
      moderator_id: context.userId,
      source: "admin",
    });
    return { ok: true };
  });

export const adminRejectAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z
      .object({
        userId: z.string().uuid(),
        reason: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: prof } = await db()
      .from("profiles")
      .select("id, avatar_url, avatar_quarantine_url")
      .eq("id", data.userId)
      .maybeSingle();
    if (!prof) throw new Error("User not found");
    const url = prof.avatar_url || prof.avatar_quarantine_url;
    await maybeDeleteOwnedAvatarObject(url);
    await db()
      .from("profiles")
      .update({
        avatar_url: null,
        avatar_quarantine_url: null,
        avatar_moderation_status: "rejected",
        avatar_moderation_reason: data.reason?.trim() || "admin_rejected",
        avatar_moderated_at: new Date().toISOString(),
        avatar_moderated_by: context.userId,
      })
      .eq("id", data.userId);
    await writeAudit({
      user_id: data.userId,
      avatar_url: url,
      action: "rejected",
      reason: data.reason?.trim() || "admin_rejected",
      moderator_id: context.userId,
      source: "admin",
    });
    return { ok: true };
  });

export const adminRemoveProfilePicture = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: prof } = await db()
      .from("profiles")
      .select("id, avatar_url, avatar_quarantine_url")
      .eq("id", data.userId)
      .maybeSingle();
    if (!prof) throw new Error("User not found");
    await maybeDeleteOwnedAvatarObject(prof.avatar_url);
    await maybeDeleteOwnedAvatarObject(prof.avatar_quarantine_url);
    await db()
      .from("profiles")
      .update({
        avatar_url: null,
        avatar_quarantine_url: null,
        avatar_moderation_status: "none",
        avatar_moderation_reason: "admin_removed",
        avatar_moderated_at: new Date().toISOString(),
        avatar_moderated_by: context.userId,
      })
      .eq("id", data.userId);
    await writeAudit({
      user_id: data.userId,
      avatar_url: prof.avatar_url || prof.avatar_quarantine_url,
      action: "removed",
      reason: "admin_removed",
      moderator_id: context.userId,
      source: "admin",
    });
    return { ok: true };
  });

export const adminDisableSocialFeaturing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z.object({ userId: z.string().uuid(), allow: z.boolean().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const allow = data.allow === true;
    await db()
      .from("profiles")
      .update({ allow_social_feature: allow })
      .eq("id", data.userId);
    await writeAudit({
      user_id: data.userId,
      action: allow ? "social_feature_enabled" : "social_feature_disabled",
      reason: "admin_toggle",
      moderator_id: context.userId,
      source: "admin",
    });
    return { ok: true, allow_social_feature: allow };
  });

export const getUserAvatarModeration = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: prof, error } = await db()
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, avatar_quarantine_url, avatar_moderation_status, avatar_moderation_reason, avatar_moderated_at, avatar_moderated_by, allow_social_feature, updated_at, created_at",
      )
      .eq("id", data.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return prof;
  });
