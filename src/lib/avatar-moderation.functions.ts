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

function isYaarzoAvatarsPublicUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
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

/**
 * Mark an uploaded avatar live immediately. No approval queue or automated scan.
 */
export async function runAvatarModerationScan(opts: {
  userId: string;
  avatarUrl: string;
  actorId?: string | null;
}): Promise<{ status: AvatarModerationStatus; reason: string }> {
  const avatarUrl = opts.avatarUrl?.trim();
  const now = new Date().toISOString();

  if (!avatarUrl) {
    await db()
      .from("profiles")
      .update({
        avatar_moderation_status: "none",
        avatar_moderation_reason: null,
        avatar_moderated_at: now,
        avatar_quarantine_url: null,
      })
      .eq("id", opts.userId);
    return { status: "none", reason: "no_avatar" };
  }

  if (avatarUrl.toLowerCase().startsWith("data:") || avatarUrl.toLowerCase().startsWith("blob:")) {
    await db()
      .from("profiles")
      .update({
        avatar_url: null,
        avatar_quarantine_url: null,
        avatar_moderation_status: "none",
        avatar_moderation_reason: "non_public_avatar_url",
        avatar_moderated_at: now,
        avatar_moderated_by: opts.actorId ?? null,
      })
      .eq("id", opts.userId);
    await writeAudit({
      user_id: opts.userId,
      avatar_url: "[data-or-blob]",
      action: "rejected",
      reason: "non_public_avatar_url",
      moderator_id: opts.actorId ?? null,
      source: "automatic",
    });
    return { status: "none", reason: "non_public_avatar_url" };
  }

  await db()
    .from("profiles")
    .update({
      avatar_url: avatarUrl,
      avatar_quarantine_url: null,
      avatar_moderation_status: "approved",
      avatar_moderation_reason: "auto_approved",
      avatar_moderated_at: now,
      avatar_moderated_by: null,
    })
    .eq("id", opts.userId);

  await writeAudit({
    user_id: opts.userId,
    avatar_url: avatarUrl,
    action: "approved",
    reason: "auto_approved",
    moderator_id: opts.actorId ?? null,
    source: "automatic",
  });

  return { status: "approved", reason: "auto_approved" };
}

/** Fire-and-forget wrapper for client upload paths (never throws to caller). */
export async function enqueueAvatarModerationSafe(userId: string, avatarUrl: string) {
  try {
    await runAvatarModerationScan({ userId, avatarUrl });
  } catch (e) {
    console.error("[avatar-moderation]", e instanceof Error ? e.message : e);
  }
}

export const moderateMyAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ avatarUrl: z.string().min(1).max(4000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const result = await runAvatarModerationScan({
      userId: context.userId,
      avatarUrl: data.avatarUrl.trim(),
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
          .default("all"),
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
      .not("avatar_url", "is", null)
      .order("updated_at", { ascending: false })
      .limit(data.limit);

    if (data.status && data.status !== "all") {
      q = q.eq("avatar_moderation_status", data.status);
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
