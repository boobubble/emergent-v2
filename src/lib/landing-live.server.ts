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
  const now = new Date().toISOString();
  const { data } = await supabaseAdmin
    .from("user_bans")
    .select("user_id, expires_at")
    .eq("active", true)
    .limit(500);
  return (data ?? [])
    .filter((row) => !row.expires_at || row.expires_at > now)
    .map((row) => row.user_id)
    .filter((id): id is string => Boolean(id));
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

export async function fetchLiveLandingData(cfg: LandingConfig): Promise<{
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
  const last24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const bannedIds = await loadBannedUserIds();
  const banFilter = bannedIdFilter(bannedIds);

  const profileCountQ = () => {
    let q: any = applyPublicProfileFilter(
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
    );
    if (banFilter) q = q.not("id", "in", banFilter);
    return q;
  };

  const topProfileQ = (limit: number) => {
    let q = applyPublicProfileFilter(
      supabaseAdmin.from("profiles").select("id, username, xp, level, created_at, is_private, is_bot, avatar_url, avatar_moderation_status"),
    )
      .order("xp", { ascending: false })
      .limit(limit);
    if (banFilter) q = q.not("id", "in", banFilter);
    return q;
  };

  const newProfileQ = () => {
    let q = applyPublicProfileFilter(
      supabaseAdmin.from("profiles").select("id, username, created_at, is_private, is_bot, xp, level, avatar_url, avatar_moderation_status"),
    )
      .order("created_at", { ascending: false })
      .limit(6);
    if (banFilter) q = q.not("id", "in", banFilter);
    return q;
  };

  const [
    totalMembers,
    onlineMembers,
    totalPosts,
    dbRooms,
    publicRoomCount,
    channelSettings,
    loyaltyRows,
    topUsers,
    latestPosts,
    latestPolls,
    latestConfession,
    trendingRows,
    discussionRows,
    confessionRows,
    blogResult,
    newProfiles,
    newPosts,
    newConfessions,
  ] = await Promise.all([
    profileCountQ(),
    (() => {
      let q = applyPublicProfileFilter(
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen", onlineSince),
      );
      if (banFilter) q = q.not("id", "in", banFilter);
      return q;
    })(),
    applyPublicPostFilter(supabaseAdmin.from("posts").select("id", { count: "exact", head: true })),
    supabaseAdmin
      .from("chatrooms")
      .select("id, slug, name, description, featured, member_count, visibility, archived_at")
      .is("archived_at", null)
      .order("featured", { ascending: false })
      .order("member_count", { ascending: false })
      .limit(12),
    supabaseAdmin
      .from("chatrooms")
      .select("id", { count: "exact", head: true })
      .is("archived_at", null)
      .not("visibility", "in", "(private,hidden,unlisted)"),
    supabaseAdmin.from("app_settings").select("value").eq("key", "chat_channels").maybeSingle(),
    supabaseAdmin.from("room_loyalty").select("channel_id, user_id, updated_at").gte("updated_at", last24h).limit(200),
    topProfileQ(4),
    applyPublicPostFilter(
      supabaseAdmin
        .from("posts")
        .select("id, text, created_at, owner_id, is_anonymous, reaction_count, comment_count, poll, privacy, hidden_at, moderation_status")
        .order("created_at", { ascending: false })
        .limit(6),
    ),
    applyPublicPostFilter(
      supabaseAdmin
        .from("posts")
        .select("id, text, poll, created_at, privacy, hidden_at, moderation_status")
        .not("poll", "is", null)
        .order("created_at", { ascending: false })
        .limit(4),
    ),
    supabaseAdmin
      .from("confessions")
      .select("id, text, alias, avatar_emoji, created_at, expires_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(4),
    cfg.trendingPostsUseLive
      ? applyPublicPostFilter(
          supabaseAdmin
            .from("posts")
            .select("id, text, created_at, owner_id, is_anonymous, reaction_count, comment_count, hashtags, privacy, hidden_at, moderation_status, trending_score")
            .order("trending_score", { ascending: false })
            .limit(8),
        )
      : Promise.resolve({ data: [] as PostLite[] }),
    cfg.discussionsUseLive
      ? applyPublicPostFilter(
          supabaseAdmin
            .from("posts")
            .select("id, text, created_at, updated_at, owner_id, is_anonymous, comment_count, privacy, hidden_at, moderation_status")
            .order("comment_count", { ascending: false })
            .limit(8),
        )
      : Promise.resolve({ data: [] as PostLite[] }),
    cfg.recentConfessionsUseLive
      ? supabaseAdmin
          .from("confessions")
          .select("alias, avatar_emoji, text, created_at, like_count, expires_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
    cfg.blogPostsUseLive ? fetchPublishedBlogs(now) : Promise.resolve([] as LandingBlogPost[]),
    newProfileQ(),
    cfg.activitiesUseLive
      ? applyPublicPostFilter(
          supabaseAdmin
            .from("posts")
            .select("text, created_at, owner_id, is_anonymous, privacy, hidden_at, moderation_status, poll")
            .order("created_at", { ascending: false })
            .limit(4),
        )
      : Promise.resolve({ data: [] as PostLite[] }),
    cfg.activitiesUseLive
      ? supabaseAdmin
          .from("confessions")
          .select("alias, created_at, expires_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(2)
      : Promise.resolve({ data: [] }),
  ]);

  const publicRooms = (dbRooms.data ?? []).filter(
    (r) => !r.archived_at && !HIDDEN_ROOMS.has((r.visibility ?? "public").toLowerCase()) && r.name,
  );
  const platformRooms = platformChannelsFromSettings(channelSettings.data?.value)
    .filter((c) => c.id && c.name)
    .slice(0, 8);

  const onlineByChannel = new Map<string, Set<string>>();
  for (const row of loyaltyRows.data ?? []) {
    if (row.updated_at && row.updated_at < onlineSince) continue;
    const set = onlineByChannel.get(row.channel_id) ?? new Set<string>();
    set.add(row.user_id);
    onlineByChannel.set(row.channel_id, set);
  }

  const notBanned = (ownerId: string | null | undefined) => !ownerId || !bannedIds.includes(ownerId);

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

  const liveTopMembers: LandingTopMember[] = (topUsers.data ?? [])
    .filter((u) => isEligiblePublicProfile(u))
    .slice(0, 3)
    .map((u) => ({
      username: (u.username as string).trim(),
      xp: (u.xp as number) ?? 0,
      avatarUrl: cardAvatar(u),
    }));

  const eligibleFeed = ((latestPosts.data ?? []) as PostLite[]).filter(
    (row) => isEligiblePublicPost(row) && notBanned(row.owner_id),
  );
  const latest = eligibleFeed[0] ?? null;
  const feedOwnerMap = await loadPublicProfileMap(
    [
      latest && !latest.is_anonymous ? latest.owner_id : null,
      ...((trendingRows.data ?? []) as PostLite[])
        .filter((r) => !r.is_anonymous)
        .map((r) => r.owner_id),
      ...((discussionRows.data ?? []) as PostLite[])
        .filter((r) => !r.is_anonymous)
        .map((r) => r.owner_id),
      ...((newPosts.data ?? []) as PostLite[])
        .filter((r) => !r.is_anonymous)
        .map((r) => r.owner_id),
    ].filter((id): id is string => Boolean(id)),
  );

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

  const liveConfession = (latestConfession.data ?? []).find(
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
    ? ((topUsers.data ?? []) as ProfileLite[])
        .filter((u) => isEligiblePublicProfile(u))
        .slice(0, 4)
        .map((u, i) => mapLiveFeaturedMember({ ...u, avatarUrl: cardAvatar(u) }, i))
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

  const blogPosts: LandingBlogPost[] = cfg.blogPostsUseLive ? blogResult : [];

  const activities: LandingActivity[] = [];
  if (cfg.activitiesUseLive) {
    const drafts: Array<LandingActivity & { at: number }> = [];
    for (const p of (newProfiles.data ?? []) as ProfileLite[]) {
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
    for (const p of (newPosts.data ?? []) as PostLite[]) {
      if (!isEligiblePublicPost(p) || !notBanned(p.owner_id) || !p.created_at) continue;
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
    for (const c of newConfessions.data ?? []) {
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
    .filter((p) => isEligiblePublicProfile(p) && p.created_at)
    .slice(0, 6)
    .map((p) => ({
      username: p.username!.trim(),
      ago: formatLandingAgo(p.created_at, now),
      level: typeof p.level === "number" && Number.isFinite(p.level) ? Math.max(1, Math.floor(p.level)) : 1,
      xp: p.xp ?? 0,
      avatarUrl: cardAvatar(p),
    }));

  return {
    stats: {
      members: totalMembers.count ?? 0,
      online: onlineMembers.count ?? 0,
      activeRooms,
      messagesSent: 0,
      feedPosts: totalPosts.count ?? 0,
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

async function fetchPublishedBlogs(now: number): Promise<LandingBlogPost[]> {
  const db = supabaseAdmin as unknown as {
    from: (table: string) => ReturnType<typeof supabaseAdmin.from>;
  };
  const nowIso = new Date(now).toISOString();
  try {
    let { data, error } = await db
      .from("blog_posts")
      .select("title, slug, meta_description, published_at, status, is_published, author_id, categories(name)")
      .eq("status", "published")
      .lte("published_at", nowIso)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(3);

    if (error) {
      const retry = await db
        .from("blog_posts")
        .select("title, slug, meta_description, published_at, status, is_published, author_id")
        .eq("status", "published")
        .lte("published_at", nowIso)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(3);
      data = retry.data;
      error = retry.error;
    }

    if (error || !data?.length) return [];
    const rows = (data as Array<{
      title: string | null;
      slug: string | null;
      meta_description: string | null;
      published_at: string | null;
      status: string | null;
      is_published: boolean | null;
      author_id: string | null;
      categories: { name?: string | null } | { name?: string | null }[] | null;
    }>).filter((row) => isEligiblePublicBlog(row, now));

    const authorIds = rows.map((r) => r.author_id).filter((id): id is string => Boolean(id));
    const authors = await loadPublicProfileMap(authorIds);

    return rows.map((row, i) => {
      const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
      return mapLiveBlogPost(
        {
          title: row.title,
          slug: row.slug,
          meta_description: row.meta_description,
          published_at: row.published_at,
          author: row.author_id ? authors.get(row.author_id)?.username ?? "" : "",
          category: cat?.name ?? "Blog",
        },
        i,
      );
    });
  } catch {
    return [];
  }
}
