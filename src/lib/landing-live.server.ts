import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { platformChannelsFromSettings } from "@/lib/discovery/channels";
import type {
  LandingActivity,
  LandingBlogPost,
  LandingChatroom,
  LandingConfessionItem,
  LandingConfig,
  LandingDemoConfession,
  LandingDemoFeedPost,
  LandingDemoPoll,
  LandingDiscussion,
  LandingFeaturedMember,
  LandingNewMember,
  LandingTopMember,
  LandingTrendingPost,
} from "@/lib/landing-config";
import type { LandingStats } from "@/lib/landing-payload";
import {
  formatLandingAgo,
  isEligiblePublicBlog,
  isEligiblePublicPost,
  isEligiblePublicProfile,
  mapLiveBlogPost,
  mapLiveFeaturedMember,
  publicDisplayName,
  sortActivitiesNewest,
} from "@/lib/landing-live";
import { resolvePublicAvatarUrl } from "@/lib/public-avatar";
import { logger } from "@/lib/logger";

type ProfileLite = {
  id: string;
  username: string | null;
  xp: number | null;
  level: number | null;
  created_at?: string;
  is_private?: boolean | null;
  is_bot?: boolean | null;
  avatar_url?: string | null;
  avatar_moderation_status?: string | null;
};

type PublicProfileCard = {
  username: string;
  avatarUrl?: string;
};

type PostLite = {
  id?: string;
  text: string | null;
  created_at: string;
  updated_at?: string | null;
  owner_id: string | null;
  is_anonymous: boolean | null;
  reaction_count: number | null;
  comment_count: number | null;
  hashtags?: string[] | null;
  poll?: unknown;
  privacy?: string | null;
  hidden_at?: string | null;
  moderation_status?: string | null;
};

const HIDDEN_ROOMS = new Set(["private", "hidden", "unlisted"]);

function applyPublicProfileFilter(q: any) {
  return q.eq("is_private", false).eq("is_bot", false).not("username", "is", null);
}

function applyPublicPostFilter(q: any) {
  return q
    .eq("privacy", "public")
    .is("hidden_at", null)
    .not("moderation_status", "in", "(removed,hidden,deleted,rejected)");
}

function bannedIdFilter(ids: string[]): string | null {
  const clean = ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (!clean.length) return null;
  return `(${clean.join(",")})`;
}

async function loadBannedUserIds(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("user_bans")
    .select("user_id, expires_at")
    .eq("active", true)
    .limit(100);
  if (error) {
    logger.warn("landing.user_bans", error);
    return [];
  }
  const now = new Date().toISOString();
  return (data ?? [])
    .filter((row) => !row.expires_at || row.expires_at > now)
    .map((row) => row.user_id)
    .filter((id): id is string => Boolean(id));
}

type SbResult<T> = { data: T | null; error: unknown; count?: number | null };

async function isolate<T>(
  name: string,
  run: PromiseLike<SbResult<T>>,
  fallback: T,
): Promise<{ data: T; count: number }> {
  try {
    const res = await run;
    if (res.error) {
      logger.warn(`landing.query.${name}`, res.error);
      return { data: fallback, count: 0 };
    }
    return { data: (res.data ?? fallback) as T, count: res.count ?? 0 };
  } catch (err) {
    logger.warn(`landing.query.${name}`, err);
    return { data: fallback, count: 0 };
  }
}

function timed<T>(name: string, timings: Record<string, number>, p: Promise<T>): Promise<T> {
  const t0 = Date.now();
  return p.finally(() => {
    timings[name] = Date.now() - t0;
  });
}

async function loadCategoryNames(ids: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const map = new Map<string, string>();
  if (!unique.length) return map;
  const { data, error } = await supabaseAdmin.from("categories").select("id, name").in("id", unique);
  if (error) {
    logger.warn("landing.categories", error);
    return map;
  }
  for (const row of data ?? []) {
    if (row.id && row.name) map.set(row.id, row.name);
  }
  return map;
}

async function loadPublicProfileMap(ownerIds: string[]): Promise<Map<string, PublicProfileCard>> {
  const ids = Array.from(new Set(ownerIds.filter(Boolean)));
  const map = new Map<string, PublicProfileCard>();
  if (!ids.length) return map;
  let q = supabaseAdmin
    .from("profiles")
    .select("id, username, is_private, is_bot, avatar_url, avatar_moderation_status")
    .in("id", ids);
  q = applyPublicProfileFilter(q);
  const { data } = await q;
  for (const p of data ?? []) {
    if (!isEligiblePublicProfile(p) || !p.username) continue;
    map.set(p.id, {
      username: p.username,
      avatarUrl: resolvePublicAvatarUrl({
        avatarUrl: p.avatar_url,
        avatarModerationStatus: p.avatar_moderation_status,
      }),
    });
  }
  return map;
}

function cardAvatar(row: {
  avatar_url?: string | null;
  avatar_moderation_status?: string | null;
}): string | undefined {
  return resolvePublicAvatarUrl({
    avatarUrl: row.avatar_url,
    avatarModerationStatus: row.avatar_moderation_status,
  });
}

function roomEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("india")) return "🇮🇳";
  if (n.includes("pakistan")) return "🇵🇰";
  if (n.includes("game")) return "🎮";
  if (n.includes("music")) return "🎵";
  return "💬";
}

type BlogRow = {
  title: string | null;
  slug: string | null;
  meta_description: string | null;
  published_at: string | null;
  status: string | null;
  is_published: boolean | null;
  author_id: string | null;
  category_id: string | null;
};

type ConfessionLite = {
  alias: string | null;
  avatar_emoji?: string | null;
  text?: string | null;
  created_at: string;
  like_count?: number | null;
  expires_at: string | null;
};

export async function fetchLiveLandingData(
  cfg: LandingConfig,
  extras?: { channelSettings?: unknown },
): Promise<{
  stats: LandingStats;
  chatrooms: LandingChatroom[];
  topMembers: LandingTopMember[];
  feedPost: LandingDemoFeedPost | null;
  poll: LandingDemoPoll | null;
  confession: LandingDemoConfession | null;
  trendingPosts: LandingTrendingPost[];
  discussions: LandingDiscussion[];
  featuredMembers: LandingFeaturedMember[];
  recentConfessions: LandingConfessionItem[];
  blogPosts: LandingBlogPost[];
  activities: LandingActivity[];
  newMembers: LandingNewMember[];
}> {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const onlineSince = new Date(now - 10 * 60 * 1000).toISOString();
  const timings: Record<string, number> = {};

  const newProfileQ = () =>
    applyPublicProfileFilter(
      supabaseAdmin.from("profiles").select("id, username, created_at, is_private, is_bot, xp, level, avatar_url, avatar_moderation_status"),
    )
      .order("created_at", { ascending: false })
      .limit(8);

  const [
    bannedIds,
    totalMembers,
    onlineMembers,
    totalPosts,
    dbRooms,
    publicRoomCount,
    loyaltyRows,
    topUsers,
    latestPosts,
    latestPolls,
    trendingRows,
    discussionRows,
    confessionRows,
    blogRows,
    newProfiles,
  ] = await Promise.all([
    timed("user_bans", timings, loadBannedUserIds()),
    timed(
      "profiles_count",
      timings,
      isolate("profiles_count", applyPublicProfileFilter(
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      ), [] as { id: string }[]),
    ),
    timed(
      "profiles_online",
      timings,
      isolate("profiles_online", applyPublicProfileFilter(
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen", onlineSince),
      ), [] as { id: string }[]),
    ),
    timed(
      "posts_count",
      timings,
      isolate("posts_count", applyPublicPostFilter(
        supabaseAdmin.from("posts").select("id", { count: "exact", head: true }),
      ), [] as { id: string }[]),
    ),
    timed(
      "chatrooms",
      timings,
      isolate(
        "chatrooms",
        supabaseAdmin
          .from("chatrooms")
          .select("id, slug, name, description, featured, member_count, visibility, archived_at")
          .is("archived_at", null)
          .not("visibility", "in", "(private,hidden,unlisted)")
          .order("featured", { ascending: false })
          .order("member_count", { ascending: false })
          .limit(5),
        [] as Array<{
          id: string;
          slug: string | null;
          name: string | null;
          description: string | null;
          featured: boolean | null;
          member_count: number | null;
          visibility: string | null;
          archived_at: string | null;
        }>,
      ),
    ),
    timed(
      "chatrooms_count",
      timings,
      isolate(
        "chatrooms_count",
        supabaseAdmin
          .from("chatrooms")
          .select("id", { count: "exact", head: true })
          .is("archived_at", null)
          .not("visibility", "in", "(private,hidden,unlisted)"),
        [] as { id: string }[],
      ),
    ),
    timed(
      "room_loyalty",
      timings,
      isolate(
        "room_loyalty",
        supabaseAdmin.from("room_loyalty").select("channel_id, user_id, updated_at").gte("updated_at", onlineSince).limit(40),
        [] as Array<{ channel_id: string; user_id: string; updated_at: string | null }>,
      ),
    ),
    timed(
      "profiles_top",
      timings,
      isolate(
        "profiles_top",
        applyPublicProfileFilter(
          supabaseAdmin.from("profiles").select("id, username, xp, level, created_at, is_private, is_bot, avatar_url, avatar_moderation_status"),
        )
          .order("xp", { ascending: false })
          .limit(8),
        [] as ProfileLite[],
      ),
    ),
    timed(
      "posts_latest",
      timings,
      isolate(
        "posts_latest",
        applyPublicPostFilter(
          supabaseAdmin
            .from("posts")
            .select("id, text, created_at, owner_id, is_anonymous, reaction_count, comment_count, poll, privacy, hidden_at, moderation_status")
            .order("created_at", { ascending: false })
            .limit(8),
        ),
        [] as PostLite[],
      ),
    ),
    timed(
      "posts_poll",
      timings,
      isolate(
        "posts_poll",
        applyPublicPostFilter(
          supabaseAdmin
            .from("posts")
            .select("id, text, poll, created_at, privacy, hidden_at, moderation_status")
            .not("poll", "is", null)
            .order("created_at", { ascending: false })
            .limit(1),
        ),
        [] as PostLite[],
      ),
    ),
    timed(
      "posts_trending",
      timings,
      cfg.trendingPostsUseLive
        ? isolate(
            "posts_trending",
            applyPublicPostFilter(
              supabaseAdmin
                .from("posts")
                .select("id, text, created_at, owner_id, is_anonymous, reaction_count, comment_count, hashtags, privacy, hidden_at, moderation_status, trending_score")
                .order("trending_score", { ascending: false })
                .limit(6),
            ),
            [] as PostLite[],
          )
        : Promise.resolve({ data: [] as PostLite[], count: 0 }),
    ),
    timed(
      "posts_discussions",
      timings,
      cfg.discussionsUseLive
        ? isolate(
            "posts_discussions",
            applyPublicPostFilter(
              supabaseAdmin
                .from("posts")
                .select("id, text, created_at, updated_at, owner_id, is_anonymous, comment_count, privacy, hidden_at, moderation_status")
                .order("comment_count", { ascending: false })
                .limit(5),
            ),
            [] as PostLite[],
          )
        : Promise.resolve({ data: [] as PostLite[], count: 0 }),
    ),
    timed(
      "confessions",
      timings,
      isolate(
        "confessions",
        supabaseAdmin
          .from("confessions")
          .select("alias, avatar_emoji, text, created_at, like_count, expires_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(6),
        [] as ConfessionLite[],
      ),
    ),
    timed(
      "blog_posts",
      timings,
      cfg.blogPostsUseLive ? fetchPublishedBlogRows(now) : Promise.resolve([] as BlogRow[]),
    ),
    timed(
      "profiles_new",
      timings,
      isolate("profiles_new", newProfileQ(), [] as ProfileLite[]),
    ),
  ]);

  let memberCount = totalMembers.count;
  let onlineCount = onlineMembers.count;
  if (bannedIds.length) {
    const filter = bannedIdFilter(bannedIds);
    if (filter) {
      const [bannedMembers, bannedOnline] = await Promise.all([
        isolate(
          "profiles_banned_count",
          applyPublicProfileFilter(
            supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).in("id", bannedIds),
          ),
          [] as { id: string }[],
        ),
        isolate(
          "profiles_banned_online",
          applyPublicProfileFilter(
            supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).in("id", bannedIds).gte("last_seen", onlineSince),
          ),
          [] as { id: string }[],
        ),
      ]);
      memberCount = Math.max(0, memberCount - bannedMembers.count);
      onlineCount = Math.max(0, onlineCount - bannedOnline.count);
    }
  }

  const publicRooms = (dbRooms.data ?? []).filter(
    (r) => !r.archived_at && !HIDDEN_ROOMS.has((r.visibility ?? "public").toLowerCase()) && r.name,
  );
  const platformRooms = platformChannelsFromSettings(extras?.channelSettings)
    .filter((c) => c.id && c.name)
    .slice(0, 8);

  const onlineByChannel = new Map<string, Set<string>>();
  for (const row of loyaltyRows.data ?? []) {
    if (row.updated_at && row.updated_at < onlineSince) continue;
    const set = onlineByChannel.get(row.channel_id) ?? new Set<string>();
    set.add(row.user_id);
    onlineByChannel.set(row.channel_id, set);
  }

  const bannedSet = new Set(bannedIds);
  const notBanned = (ownerId: string | null | undefined) => !ownerId || !bannedSet.has(ownerId);

  const liveChatrooms: LandingChatroom[] = [];
  const seenRoom = new Set<string>();
  for (const r of publicRooms) {
    const key = r.slug || r.id;
    if (seenRoom.has(key)) continue;
    seenRoom.add(key);
    const online =
      (onlineByChannel.get(r.slug)?.size ?? 0) ||
      (onlineByChannel.get(r.id)?.size ?? 0);
    liveChatrooms.push({
      emoji: roomEmoji(r.name),
      name: r.name,
      online,
      topic: r.description?.slice(0, 60) || (r.featured ? "Featured" : "Open now"),
    });
  }
  if (!liveChatrooms.length) {
    for (const c of platformRooms) {
      liveChatrooms.push({
        emoji: roomEmoji(c.name),
        name: c.name,
        online: onlineByChannel.get(c.id)?.size ?? 0,
        topic: c.topic?.slice(0, 60) || "Open now",
      });
    }
  }
  liveChatrooms.sort((a, b) => b.online - a.online);
  const chatrooms = liveChatrooms.slice(0, 5);
  const activeRooms = publicRoomCount.count ?? (publicRooms.length || platformRooms.length);

  const eligibleTop = ((topUsers.data ?? []) as ProfileLite[]).filter(
    (u) => isEligiblePublicProfile(u) && notBanned(u.id),
  );
  const liveTopMembers: LandingTopMember[] = eligibleTop.slice(0, 3).map((u) => ({
    username: (u.username as string).trim(),
    xp: (u.xp as number) ?? 0,
    avatarUrl: cardAvatar(u),
  }));

  const eligibleFeed = ((latestPosts.data ?? []) as PostLite[]).filter(
    (row) => isEligiblePublicPost(row) && notBanned(row.owner_id),
  );
  const latest = eligibleFeed[0] ?? null;
  const blogAuthorIds = blogRows.map((r) => r.author_id).filter((id): id is string => Boolean(id));
  const categoryIds = blogRows.map((r) => r.category_id).filter((id): id is string => Boolean(id));
  const [feedOwnerMap, categoryNames] = await Promise.all([
    timed(
      "profiles_authors",
      timings,
      loadPublicProfileMap(
        [
          latest && !latest.is_anonymous ? latest.owner_id : null,
          ...((trendingRows.data ?? []) as PostLite[]).filter((r) => !r.is_anonymous).map((r) => r.owner_id),
          ...((discussionRows.data ?? []) as PostLite[]).filter((r) => !r.is_anonymous).map((r) => r.owner_id),
          ...eligibleFeed.filter((r) => !r.is_anonymous).map((r) => r.owner_id),
          ...blogAuthorIds,
        ].filter((id): id is string => Boolean(id)),
      ),
    ),
    timed("blog_categories", timings, loadCategoryNames(categoryIds)),
  ]);

  const ownerCard = (ownerId: string | null | undefined, anonymous?: boolean | null) =>
    anonymous ? undefined : ownerId ? feedOwnerMap.get(ownerId) : undefined;

  const feedPost: LandingDemoFeedPost | null = latest
    ? {
        username: publicDisplayName({
          isAnonymous: latest.is_anonymous,
          username: ownerCard(latest.owner_id, latest.is_anonymous)?.username,
        }),
        ago: formatLandingAgo(latest.created_at, now),
        text: (latest.text ?? "").trim().slice(0, 220),
        likes: latest.reaction_count ?? 0,
        comments: latest.comment_count ?? 0,
        coins: 0,
        anonymous: Boolean(latest.is_anonymous),
        avatarUrl: latest.is_anonymous ? undefined : ownerCard(latest.owner_id)?.avatarUrl,
      }
    : null;

  let poll: LandingDemoPoll | null = null;
  for (const row of (latestPolls.data ?? []) as PostLite[]) {
    if (!isEligiblePublicPost(row) || !row.poll || typeof row.poll !== "object") continue;
    const p = row.poll as { question?: string; options?: Array<{ label?: string; votes?: number }> };
    if (!p.question || !Array.isArray(p.options) || p.options.length < 2) continue;
    poll = {
      question: p.question.slice(0, 160),
      ago: formatLandingAgo(row.created_at, now),
      options: p.options.slice(0, 4).map((o) => ({
        label: (o.label ?? "Option").slice(0, 60),
        votes: typeof o.votes === "number" ? o.votes : 0,
      })),
      daysLeft: 0,
    };
    break;
  }

  const liveConfession = (confessionRows.data ?? []).find(
    (c) => (!c.expires_at || c.expires_at > nowIso) && (c.text ?? "").trim(),
  );
  const confession: LandingDemoConfession | null = liveConfession
    ? {
        alias: liveConfession.alias || "Anonymous",
        ago: formatLandingAgo(liveConfession.created_at, now),
        text: (liveConfession.text ?? "").trim().slice(0, 220),
        emoji: liveConfession.avatar_emoji || "🎭",
      }
    : null;

  const trendingPosts: LandingTrendingPost[] = cfg.trendingPostsUseLive
    ? ((trendingRows.data ?? []) as PostLite[])
        .filter((r) => isEligiblePublicPost(r) && notBanned(r.owner_id))
        .slice(0, 6)
        .map((r) => ({
          user: publicDisplayName({
            isAnonymous: r.is_anonymous,
            username: ownerCard(r.owner_id, r.is_anonymous)?.username,
          }),
          ago: formatLandingAgo(r.created_at, now),
          text: (r.text ?? "").trim().slice(0, 220),
          likes: r.reaction_count ?? 0,
          comments: r.comment_count ?? 0,
          tag: Array.isArray(r.hashtags) && r.hashtags[0] ? `#${r.hashtags[0]}` : "#trending",
          anonymous: Boolean(r.is_anonymous),
          avatarUrl: r.is_anonymous ? undefined : ownerCard(r.owner_id)?.avatarUrl,
        }))
    : [];

  const discussions: LandingDiscussion[] = cfg.discussionsUseLive
    ? ((discussionRows.data ?? []) as PostLite[])
        .filter((r) => isEligiblePublicPost(r) && notBanned(r.owner_id))
        .slice(0, 5)
        .map((r, i) => ({
          topic: ((r.text as string) ?? "Discussion").trim().slice(0, 110) || "Discussion",
          room: "Public feed",
          author: publicDisplayName({
            isAnonymous: r.is_anonymous,
            username: ownerCard(r.owner_id, r.is_anonymous)?.username,
          }),
          replies: r.comment_count ?? 0,
          last: formatLandingAgo((r.updated_at as string) ?? r.created_at, now),
          hot: i < 2,
        }))
    : [];

  const featuredMembers: LandingFeaturedMember[] = cfg.featuredMembersUseLive
    ? eligibleTop.slice(0, 4).map((u, i) => mapLiveFeaturedMember({ ...u, avatarUrl: cardAvatar(u) }, i))
    : [];

  const recentConfessions: LandingConfessionItem[] = cfg.recentConfessionsUseLive
    ? (confessionRows.data ?? [])
        .filter((c) => (!c.expires_at || c.expires_at > nowIso) && (c.text ?? "").trim())
        .slice(0, 6)
        .map((c) => ({
          alias: c.alias || "Anonymous",
          emoji: c.avatar_emoji || "🎭",
          ago: formatLandingAgo(c.created_at, now),
          text: (c.text ?? "").trim().slice(0, 200),
          reacts: c.like_count ?? 0,
        }))
    : [];

  const blogPosts: LandingBlogPost[] = cfg.blogPostsUseLive
    ? blogRows.map((row, i) =>
        mapLiveBlogPost(
          {
            title: row.title,
            slug: row.slug,
            meta_description: row.meta_description,
            published_at: row.published_at,
            author: row.author_id ? feedOwnerMap.get(row.author_id)?.username ?? "" : "",
            category: row.category_id ? categoryNames.get(row.category_id) ?? "Blog" : "Blog",
          },
          i,
        ),
      )
    : [];

  const activities: LandingActivity[] = [];
  if (cfg.activitiesUseLive) {
    const drafts: Array<LandingActivity & { at: number }> = [];
    for (const p of ((newProfiles.data ?? []) as ProfileLite[]).filter((u) => notBanned(u.id))) {
      if (!isEligiblePublicProfile(p) || !p.created_at) continue;
      drafts.push({
        who: p.username!.trim(),
        action: "joined",
        target: "the community",
        ago: formatLandingAgo(p.created_at, now),
        emoji: "👋",
        tint: "from-blue-500/30 to-cyan-500/20",
        accent: "text-cyan-200",
        href: "/",
        avatarUrl: cardAvatar(p),
        at: new Date(p.created_at).getTime(),
      });
    }
    for (const p of eligibleFeed.slice(0, 4)) {
      if (!p.created_at) continue;
      drafts.push({
        who: publicDisplayName({
          isAnonymous: p.is_anonymous,
          username: ownerCard(p.owner_id, p.is_anonymous)?.username,
        }),
        action: "posted",
        target: ((p.text as string) ?? "a new update").trim().slice(0, 40) || "a new update",
        ago: formatLandingAgo(p.created_at, now),
        emoji: "📝",
        tint: "from-purple-500/30 to-pink-500/20",
        accent: "text-pink-200",
        href: "/feed",
        avatarUrl: p.is_anonymous ? undefined : ownerCard(p.owner_id)?.avatarUrl,
        at: new Date(p.created_at).getTime(),
      });
    }
    for (const c of (confessionRows.data ?? []).slice(0, 2)) {
      if (c.expires_at && c.expires_at <= nowIso) continue;
      drafts.push({
        who: c.alias || "Anonymous",
        action: "shared",
        target: "a confession",
        ago: formatLandingAgo(c.created_at, now),
        emoji: "🤫",
        tint: "from-rose-500/30 to-fuchsia-500/20",
        accent: "text-rose-200",
        href: "/confessions",
        at: new Date(c.created_at).getTime(),
      });
    }
    activities.push(
      ...sortActivitiesNewest(drafts, 8).map(({ at: _at, ...rest }) => rest),
    );
  }

  const newMembers: LandingNewMember[] = ((newProfiles.data ?? []) as ProfileLite[])
    .filter((p) => isEligiblePublicProfile(p) && notBanned(p.id) && p.created_at)
    .slice(0, 6)
    .map((p) => ({
      username: p.username!.trim(),
      ago: formatLandingAgo(p.created_at, now),
      level: typeof p.level === "number" && Number.isFinite(p.level) ? Math.max(1, Math.floor(p.level)) : 1,
      xp: p.xp ?? 0,
      avatarUrl: cardAvatar(p),
    }));

  const wallMs = Math.max(0, ...Object.values(timings));
  logger.info("landing.timing", { wallMs, timings });

  return {
    stats: {
      members: memberCount,
      online: onlineCount,
      activeRooms,
      messagesSent: 0,
      feedPosts: totalPosts.count,
      gamesPlayed: 0,
    },
    chatrooms,
    topMembers: liveTopMembers,
    feedPost,
    poll,
    confession,
    trendingPosts,
    discussions,
    featuredMembers,
    recentConfessions,
    blogPosts,
    activities,
    newMembers,
  };
}

async function fetchPublishedBlogRows(now: number): Promise<BlogRow[]> {
  const nowIso = new Date(now).toISOString();
  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("title, slug, meta_description, published_at, status, is_published, author_id, category_id")
      .eq("status", "published")
      .lte("published_at", nowIso)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(3);
    if (error) {
      logger.warn("landing.query.blog_posts", error);
      return [];
    }
    if (!data?.length) return [];
    return (data as BlogRow[]).filter((row) => isEligiblePublicBlog(row, now));
  } catch (err) {
    logger.warn("landing.query.blog_posts", err);
    return [];
  }
}
