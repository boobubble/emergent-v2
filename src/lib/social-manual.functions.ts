import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { withRateLimit } from "./rate-limit-middleware";
import {
  AUTO_PLATFORMS,
  MANUAL_PLATFORMS,
  buildProfileUrl,
  describeAutoStatus,
  isWelcomeFeedPost,
  manualCompletionKind,
  pinterestTitle,
  resolveManualShareMedia,
  shortenForBluesky,
  type AutoLogStatus,
  type AutoSocialPlatform,
  type ManualInboxFilter,
  type ManualPlatformStatus,
  type ManualSocialPlatform,
} from "./social-manual-distribution";

/** Untyped access until generated Database types include social_manual_distribution. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function socialDb(): any {
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
  return data.map((r) => r.role);
}

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  allow_social_feature: boolean | null;
  avatar_moderation_status: string | null;
};

type PostRow = {
  id: string;
  owner_id: string;
  author_id: string | null;
  text: string | null;
  slug: string | null;
  media_urls: string[] | null;
  category: string | null;
  created_at: string;
};

type DistRow = {
  id: string;
  feed_post_id: string;
  user_id: string | null;
  platform: ManualSocialPlatform;
  status: ManualPlatformStatus;
  published_url: string | null;
  posted_at: string | null;
  posted_by: string | null;
};

type LogRow = {
  user_id: string | null;
  platform: string;
  status: string;
  created_at: string;
  error_message: string | null;
};

export type ManualSharePayload = {
  feed_post_id: string;
  user_id: string;
  display_name: string;
  username: string;
  profile_url: string;
  caption: string;
  media_url: string | null;
  media_source: "user_avatar" | "default_image" | "none";
  created_at: string;
  pinterest_title: string;
  bluesky_text: string;
  consent: boolean;
};

export type ManualInboxCard = ManualSharePayload & {
  auto: Record<AutoSocialPlatform, { status: AutoLogStatus; label: string; published: boolean }>;
  manual: Record<
    ManualSocialPlatform,
    { status: ManualPlatformStatus; published_url: string | null; posted_at: string | null }
  >;
  completion: ManualInboxFilter;
};

function emptyManualStatus(): ManualInboxCard["manual"] {
  return {
    facebook: { status: "not_posted", published_url: null, posted_at: null },
    pinterest: { status: "not_posted", published_url: null, posted_at: null },
    bluesky: { status: "not_posted", published_url: null, posted_at: null },
    youtube: { status: "not_posted", published_url: null, posted_at: null },
  };
}

function emptyAutoStatus(): ManualInboxCard["auto"] {
  const pending = describeAutoStatus("none");
  return {
    instagram: { status: "none", label: pending.label, published: false },
    x: { status: "none", label: pending.label, published: false },
    tiktok: { status: "none", label: pending.label, published: false },
  };
}

async function loadSettings() {
  const db = socialDb();
  const { data } = await db
    .from("social_automation_settings")
    .select("default_media_url, site_base_url")
    .eq("id", true)
    .maybeSingle();
  return {
    default_media_url: (data?.default_media_url as string | null) ?? null,
    site_base_url: (data?.site_base_url as string | null) ?? "https://yaarzo.com",
  };
}

async function ensureDistributionRows(feedPostId: string, userId: string) {
  const db = socialDb();
  await db.from("social_manual_distribution").upsert(
    MANUAL_PLATFORMS.map((platform) => ({
      feed_post_id: feedPostId,
      user_id: userId,
      platform,
      status: "not_posted",
    })),
    { onConflict: "feed_post_id,platform", ignoreDuplicates: true },
  );
}

function buildPayload(
  post: PostRow,
  profile: ProfileRow,
  settings: { default_media_url: string | null; site_base_url: string },
): ManualSharePayload {
  const username = profile.username || "member";
  const displayName = profile.display_name?.trim() || username;
  const profileUrl = buildProfileUrl(settings.site_base_url, username);
  const caption = (post.text ?? "").trim();
  const consent = profile.allow_social_feature === true;
  const media = resolveManualShareMedia({
    avatarUrl: profile.avatar_url,
    avatarModerationStatus: profile.avatar_moderation_status,
    allowSocialFeature: consent,
    defaultMediaUrl: settings.default_media_url,
  });
  return {
    feed_post_id: post.id,
    user_id: profile.id,
    display_name: displayName,
    username,
    profile_url: profileUrl,
    caption,
    media_url: media.mediaUrl,
    media_source: media.mediaSource,
    created_at: post.created_at,
    pinterest_title: pinterestTitle(displayName),
    bluesky_text: shortenForBluesky(caption, profileUrl),
    consent,
  };
}

function pickLatestAuto(
  logs: LogRow[],
  userId: string,
): ManualInboxCard["auto"] {
  const auto = emptyAutoStatus();
  const latest = new Map<AutoSocialPlatform, LogRow>();
  for (const log of logs) {
    if (log.user_id !== userId) continue;
    const platform = log.platform === "twitter" ? "x" : log.platform;
    if (platform !== "instagram" && platform !== "x" && platform !== "tiktok") continue;
    const prev = latest.get(platform);
    if (!prev || new Date(log.created_at).getTime() > new Date(prev.created_at).getTime()) {
      latest.set(platform, log);
    }
  }
  for (const platform of AUTO_PLATFORMS) {
    const row = latest.get(platform);
    if (!row) continue;
    const desc = describeAutoStatus(row.status);
    auto[platform] = {
      status: desc.kind === "none" ? "none" : (row.status as AutoLogStatus),
      label: desc.label,
      published: desc.published,
    };
  }
  return auto;
}

export const listSocialManualPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z
      .object({
        filter: z.enum(["all", "needs_manual", "partial", "completed"]).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .optional()
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdminOrModerator(context.userId);
    const db = socialDb();
    const filter = (data?.filter ?? "all") as ManualInboxFilter;
    const limit = data?.limit ?? 60;
    const settings = await loadSettings();

    const { data: postsRaw, error: postsErr } = await db
      .from("posts")
      .select("id, owner_id, author_id, text, slug, media_urls, category, created_at")
      .or("category.eq.new_member,slug.ilike.welcome-%")
      .eq("privacy", "public")
      .order("created_at", { ascending: false })
      .limit(120);
    if (postsErr) throw new Error(postsErr.message ?? "Failed to load welcome posts");

    const posts = ((postsRaw ?? []) as PostRow[]).filter(isWelcomeFeedPost);
    const ownerIds = Array.from(new Set(posts.map((p) => p.owner_id)));
    if (ownerIds.length === 0) {
      return { posts: [] as ManualInboxCard[], settings };
    }

    const [{ data: profilesRaw }, { data: distRaw }, { data: logsRaw }] = await Promise.all([
      db
        .from("profiles")
        .select("id, username, display_name, avatar_url, allow_social_feature, avatar_moderation_status")
        .in("id", ownerIds),
      db
        .from("social_manual_distribution")
        .select("id, feed_post_id, user_id, platform, status, published_url, posted_at, posted_by")
        .in(
          "feed_post_id",
          posts.map((p) => p.id),
        ),
      db
        .from("social_post_logs")
        .select("user_id, platform, status, created_at, error_message")
        .eq("event_type", "new_signup")
        .in("user_id", ownerIds)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    const profiles = new Map(
      ((profilesRaw ?? []) as ProfileRow[]).map((p) => [p.id, p]),
    );
    const distByPost = new Map<string, DistRow[]>();
    for (const row of (distRaw ?? []) as DistRow[]) {
      const list = distByPost.get(row.feed_post_id) ?? [];
      list.push(row);
      distByPost.set(row.feed_post_id, list);
    }
    const logs = (logsRaw ?? []) as LogRow[];

    const cards: ManualInboxCard[] = [];
    for (const post of posts) {
      const profile = profiles.get(post.owner_id);
      if (!profile || profile.allow_social_feature !== true) continue;

      const payload = buildPayload(post, profile, settings);
      const manual = emptyManualStatus();
      const distRows = distByPost.get(post.id) ?? [];
      for (const row of distRows) {
        if (!MANUAL_PLATFORMS.includes(row.platform)) continue;
        manual[row.platform] = {
          status: row.status,
          published_url: row.published_url,
          posted_at: row.posted_at,
        };
      }
      if (distRows.length === 0) {
        await ensureDistributionRows(post.id, profile.id);
      }
      const completion = manualCompletionKind(MANUAL_PLATFORMS.map((p) => manual[p].status));
      if (filter !== "all" && completion !== filter) continue;
      cards.push({
        ...payload,
        auto: pickLatestAuto(logs, profile.id),
        manual,
        completion,
      });
      if (cards.length >= limit) break;
    }

    return { posts: cards, settings };
  });

export const getSocialManualSharePayload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ feedPostId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminOrModerator(context.userId);
    const db = socialDb();
    const settings = await loadSettings();

    const { data: post, error: postErr } = await db
      .from("posts")
      .select("id, owner_id, author_id, text, slug, media_urls, category, created_at")
      .eq("id", data.feedPostId)
      .maybeSingle();
    if (postErr) throw new Error(postErr.message ?? "Lookup failed");
    if (!post) throw new Error("Feed post not found");
    if (!isWelcomeFeedPost(post as PostRow)) {
      throw new Error("This is not a Yaarzo welcome feed post");
    }

    const { data: profile, error: profErr } = await db
      .from("profiles")
      .select("id, username, display_name, avatar_url, allow_social_feature, avatar_moderation_status")
      .eq("id", (post as PostRow).owner_id)
      .maybeSingle();
    if (profErr) throw new Error(profErr.message ?? "Profile lookup failed");
    if (!profile) throw new Error("Member profile not found");

    const payload = buildPayload(post as PostRow, profile as ProfileRow, settings);
    if (!payload.consent) {
      return {
        ok: false as const,
        reason: "social_feature_not_allowed" as const,
        payload,
      };
    }

    await ensureDistributionRows(payload.feed_post_id, payload.user_id);

    const { data: distRaw } = await db
      .from("social_manual_distribution")
      .select("id, feed_post_id, user_id, platform, status, published_url, posted_at, posted_by")
      .eq("feed_post_id", payload.feed_post_id);
    const { data: logsRaw } = await db
      .from("social_post_logs")
      .select("user_id, platform, status, created_at, error_message")
      .eq("event_type", "new_signup")
      .eq("user_id", payload.user_id)
      .order("created_at", { ascending: false })
      .limit(40);

    const manual = emptyManualStatus();
    for (const row of (distRaw ?? []) as DistRow[]) {
      if (!MANUAL_PLATFORMS.includes(row.platform)) continue;
      manual[row.platform] = {
        status: row.status,
        published_url: row.published_url,
        posted_at: row.posted_at,
      };
    }

    return {
      ok: true as const,
      payload,
      auto: pickLatestAuto((logsRaw ?? []) as LogRow[], payload.user_id),
      manual,
      completion: manualCompletionKind(MANUAL_PLATFORMS.map((p) => manual[p].status)),
    };
  });

export const updateSocialManualStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z
      .object({
        feedPostId: z.string().uuid(),
        platform: z.enum(["facebook", "pinterest", "bluesky", "youtube"]),
        status: z.enum(["not_posted", "posted", "skipped"]),
        publishedUrl: z.string().url().max(2000).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdminOrModerator(context.userId);
    const db = socialDb();

    const { data: post, error: postErr } = await db
      .from("posts")
      .select("id, owner_id, slug, category, text")
      .eq("id", data.feedPostId)
      .maybeSingle();
    if (postErr) throw new Error(postErr.message ?? "Lookup failed");
    if (!post) throw new Error("Feed post not found");
    if (!isWelcomeFeedPost(post as PostRow)) {
      throw new Error("This is not a Yaarzo welcome feed post");
    }

    const { data: profile } = await db
      .from("profiles")
      .select("id, allow_social_feature")
      .eq("id", (post as { owner_id: string }).owner_id)
      .maybeSingle();
    if (!profile || profile.allow_social_feature !== true) {
      throw new Error("Member has not allowed external social featuring");
    }

    await ensureDistributionRows(data.feedPostId, profile.id);

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      status: data.status,
      updated_at: now,
      posted_by: context.userId,
    };
    if (data.status === "posted") {
      patch.posted_at = now;
      if (data.publishedUrl) patch.published_url = data.publishedUrl;
    } else if (data.status === "skipped") {
      patch.posted_at = null;
    } else {
      patch.posted_at = null;
      patch.published_url = null;
    }
    if (data.status === "posted" && data.publishedUrl === null) {
      // keep existing URL
      delete patch.published_url;
    }
    if (typeof data.publishedUrl === "string") {
      patch.published_url = data.publishedUrl;
    }

    const { error } = await db
      .from("social_manual_distribution")
      .update(patch)
      .eq("feed_post_id", data.feedPostId)
      .eq("platform", data.platform);
    if (error) throw new Error(error.message ?? "Update failed");
    return { ok: true };
  });
