import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { withRateLimit } from "./rate-limit-middleware";
import {
  API_PUBLISH_PLATFORMS,
  shouldConfirmDuplicate,
  type ApiPublishPlatform,
} from "./social-connections";
import {
  isWelcomeFeedPost,
  pinterestTitle,
  resolveManualShareMedia,
  buildProfileUrl,
  type ManualPlatformStatus,
} from "./social-manual-distribution";
import {
  publishBluesky,
  publishFacebook,
  publishPinterest,
  type PublishInput,
} from "./social-connections.server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any {
  return supabaseAdmin;
}

async function assertAdminOrModerator(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin", "moderator"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden");
  return data.map((r) => r.role as string);
}

async function loadPublishContext(feedPostId: string) {
  const { data: post, error: postErr } = await db()
    .from("posts")
    .select("id, owner_id, text, slug, category, created_at, privacy")
    .eq("id", feedPostId)
    .maybeSingle();
  if (postErr) throw new Error(postErr.message ?? "Lookup failed");
  if (!post) throw new Error("Feed post not found");
  if (!isWelcomeFeedPost(post)) throw new Error("This is not a Yaarzo welcome feed post");

  const { data: profile } = await db()
    .from("profiles")
    .select("id, username, display_name, avatar_url, allow_social_feature, avatar_moderation_status")
    .eq("id", post.owner_id)
    .maybeSingle();
  if (!profile) throw new Error("Member profile not found");
  if (profile.allow_social_feature !== true) {
    throw new Error("Member has not allowed external social featuring");
  }

  const { data: settings } = await db()
    .from("social_automation_settings")
    .select("default_media_url, site_base_url")
    .eq("id", true)
    .maybeSingle();

  const username = profile.username || "member";
  const displayName = profile.display_name?.trim() || username;
  const profileUrl = buildProfileUrl(settings?.site_base_url || "https://yaarzo.com", username);
  const caption = String(post.text ?? "").trim();
  const media = resolveManualShareMedia({
    avatarUrl: profile.avatar_url,
    avatarModerationStatus: profile.avatar_moderation_status,
    allowSocialFeature: true,
    defaultMediaUrl: settings?.default_media_url ?? null,
  });

  const input: PublishInput = {
    caption,
    profileUrl,
    mediaUrl: media.mediaUrl,
    displayName,
    pinterestTitle: pinterestTitle(displayName),
  };

  return { post, profile, input };
}

async function loadDistRow(feedPostId: string, platform: ApiPublishPlatform) {
  const { data } = await db()
    .from("social_manual_distribution")
    .select("id, status, published_url, external_post_id, attempt_count")
    .eq("feed_post_id", feedPostId)
    .eq("platform", platform)
    .maybeSingle();
  return data as {
    id: string;
    status: ManualPlatformStatus;
    published_url: string | null;
    external_post_id: string | null;
    attempt_count: number;
  } | null;
}

async function markAttempt(
  feedPostId: string,
  userId: string,
  platform: ApiPublishPlatform,
) {
  const now = new Date().toISOString();
  const existing = await loadDistRow(feedPostId, platform);
  if (!existing) {
    await db().from("social_manual_distribution").upsert(
      {
        feed_post_id: feedPostId,
        user_id: userId,
        platform,
        status: "not_posted",
        last_attempt_at: now,
        attempt_count: 1,
        last_error: null,
      },
      { onConflict: "feed_post_id,platform" },
    );
    return;
  }
  await db()
    .from("social_manual_distribution")
    .update({
      last_attempt_at: now,
      attempt_count: (existing.attempt_count ?? 0) + 1,
      updated_at: now,
    })
    .eq("feed_post_id", feedPostId)
    .eq("platform", platform);
}

async function markPosted(
  feedPostId: string,
  platform: ApiPublishPlatform,
  adminUserId: string,
  result: { externalPostId: string | null; publishedUrl: string | null },
) {
  const now = new Date().toISOString();
  await db()
    .from("social_manual_distribution")
    .update({
      status: "posted",
      posted_at: now,
      posted_by: adminUserId,
      published_url: result.publishedUrl,
      external_post_id: result.externalPostId,
      last_error: null,
      updated_at: now,
    })
    .eq("feed_post_id", feedPostId)
    .eq("platform", platform);
}

async function markFailed(feedPostId: string, platform: ApiPublishPlatform, errorMessage: string) {
  const now = new Date().toISOString();
  await db()
    .from("social_manual_distribution")
    .update({
      last_error: errorMessage.slice(0, 1000),
      last_attempt_at: now,
      updated_at: now,
    })
    .eq("feed_post_id", feedPostId)
    .eq("platform", platform);
}

async function publishOne(
  platform: ApiPublishPlatform,
  input: PublishInput,
) {
  if (platform === "facebook") return publishFacebook(input);
  if (platform === "pinterest") return publishPinterest(input);
  return publishBluesky(input);
}

export const publishSocialManualPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z
      .object({
        feedPostId: z.string().uuid(),
        platform: z.enum(["facebook", "pinterest", "bluesky"]),
        force: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminOrModerator(context.userId);
    const { profile, input } = await loadPublishContext(data.feedPostId);
    const row = await loadDistRow(data.feedPostId, data.platform);
    if (shouldConfirmDuplicate(row?.status, data.force === true)) {
      return {
        ok: false as const,
        reason: "already_posted" as const,
        publishedUrl: row?.published_url ?? null,
      };
    }

    await markAttempt(data.feedPostId, profile.id, data.platform);
    try {
      const result = await publishOne(data.platform, input);
      await markPosted(data.feedPostId, data.platform, context.userId, result);
      return {
        ok: true as const,
        platform: data.platform,
        publishedUrl: result.publishedUrl,
        externalPostId: result.externalPostId,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Publish failed";
      await markFailed(data.feedPostId, data.platform, message);
      return { ok: false as const, reason: "publish_failed" as const, error: message };
    }
  });

export const publishSocialManualAllConnected = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z
      .object({
        feedPostId: z.string().uuid(),
        force: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminOrModerator(context.userId);
    const { profile, input } = await loadPublishContext(data.feedPostId);
    const { data: conns } = await db()
      .from("social_connections")
      .select("platform, status")
      .eq("status", "connected")
      .in("platform", [...API_PUBLISH_PLATFORMS]);

    const connected = new Set(
      ((conns ?? []) as Array<{ platform: string }>).map((c) => c.platform),
    );
    const results: Array<Record<string, unknown>> = [];

    for (const platform of API_PUBLISH_PLATFORMS) {
      if (!connected.has(platform)) {
        results.push({ platform, ok: false, skipped: "not_connected" });
        continue;
      }
      const row = await loadDistRow(data.feedPostId, platform);
      if (shouldConfirmDuplicate(row?.status, data.force === true)) {
        results.push({
          platform,
          ok: false,
          reason: "already_posted",
          publishedUrl: row?.published_url ?? null,
        });
        continue;
      }
      await markAttempt(data.feedPostId, profile.id, platform);
      try {
        const result = await publishOne(platform, input);
        await markPosted(data.feedPostId, platform, context.userId, result);
        results.push({
          platform,
          ok: true,
          publishedUrl: result.publishedUrl,
          externalPostId: result.externalPostId,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Publish failed";
        await markFailed(data.feedPostId, platform, message);
        results.push({ platform, ok: false, reason: "publish_failed", error: message });
      }
    }

    return { ok: true as const, results };
  });
