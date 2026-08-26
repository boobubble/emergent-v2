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
import type { LandingPayload, LandingStats } from "@/lib/landing-payload";

export const EMPTY_LIVE_STATS: LandingStats = {
  members: 0,
  online: 0,
  activeRooms: 0,
  messagesSent: 0,
  feedPosts: 0,
  gamesPlayed: 0,
};

export const DEMO_IDENTITY_NAMES = [
  "Amit Sharma",
  "Priya Kapoor",
  "Rohan Mehta",
  "Pooja Singh",
  "Rahul Verma",
  "Sneha Iyer",
  "Arjun Das",
  "Neha Reddy",
  "Vikram Joshi",
  "Aanya Sharma",
  "Kabir Singh",
  "Meera Nair",
  "Yash Patel",
  "Neha Patel",
  "Tara Sparks",
] as const;

const HIDDEN_MODERATION = new Set(["removed", "hidden", "deleted", "rejected"]);

export function formatLandingAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "just now";
  const m = Math.max(1, Math.round((now - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} hours ago`;
  return `${Math.round(m / 1440)} days ago`;
}

export function isEligiblePublicProfile(row: {
  username?: string | null;
  is_private?: boolean | null;
  is_bot?: boolean | null;
}): boolean {
  if (!row.username?.trim()) return false;
  if (row.is_private) return false;
  if (row.is_bot) return false;
  return true;
}

export function isEligiblePublicPost(row: {
  privacy?: string | null;
  hidden_at?: string | null;
  moderation_status?: string | null;
  text?: string | null;
  poll?: unknown;
}): boolean {
  if (row.privacy !== "public") return false;
  if (row.hidden_at) return false;
  const mod = (row.moderation_status ?? "visible").toLowerCase();
  if (HIDDEN_MODERATION.has(mod)) return false;
  const text = (row.text ?? "").trim();
  const hasPoll = row.poll != null && typeof row.poll === "object";
  if (!text && !hasPoll) return false;
  return true;
}

export function isEligiblePublicBlog(
  row: {
    status?: string | null;
    is_published?: boolean | null;
    published_at?: string | null;
    slug?: string | null;
    title?: string | null;
  },
  now = Date.now(),
): boolean {
  if (!row.slug?.trim() || !row.title?.trim()) return false;
  if ((row.status ?? "").toLowerCase() !== "published") return false;
  if (row.is_published === false) return false;
  if (!row.published_at) return false;
  if (new Date(row.published_at).getTime() > now) return false;
  return true;
}

export function publicDisplayName(opts: {
  isAnonymous?: boolean | null;
  username?: string | null;
}): string {
  if (opts.isAnonymous) return "Anonymous";
  return opts.username?.trim() || "Member";
}

export function featuredMemberRole(level: number | null | undefined): string {
  const n = typeof level === "number" && Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return `Level ${n}`;
}

const BLOG_GRADS = [
  "from-purple-600/40 to-blue-600/30",
  "from-pink-600/40 to-amber-600/30",
  "from-emerald-600/40 to-teal-600/30",
];
const BLOG_EMOJIS = ["📰", "✨", "🚀"];
const FEATURED_GRADS = [
  "from-purple-500/30 to-pink-500/20",
  "from-blue-500/30 to-cyan-500/20",
  "from-amber-500/30 to-orange-500/20",
  "from-emerald-500/30 to-teal-500/20",
];

export function mapLiveBlogPost(
  row: {
    title?: string | null;
    slug?: string | null;
    meta_description?: string | null;
    published_at?: string | null;
    author?: string | null;
    category?: string | null;
  },
  index: number,
): LandingBlogPost {
  const published = row.published_at ? new Date(row.published_at) : null;
  return {
    title: (row.title ?? "Untitled").trim(),
    excerpt: (row.meta_description ?? "").trim().slice(0, 180),
    tag: (row.category ?? "Blog").trim() || "Blog",
    read: "",
    author: (row.author ?? "").trim(),
    date: published
      ? published.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "",
    emoji: BLOG_EMOJIS[index % BLOG_EMOJIS.length],
    gradient: BLOG_GRADS[index % BLOG_GRADS.length],
    href: `/blog/${row.slug}`,
  };
}

export function mapLiveFeaturedMember(
  row: { username?: string | null; xp?: number | null; level?: number | null; avatarUrl?: string },
  index: number,
): LandingFeaturedMember {
  return {
    name: (row.username ?? "Member").trim(),
    role: featuredMemberRole(row.level),
    xp: row.xp ?? 0,
    badges: "",
    gradient: FEATURED_GRADS[index % FEATURED_GRADS.length],
    avatarUrl: row.avatarUrl,
  };
}

export type LandingViewCollections = {
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
};

export function resolveLandingView(
  cfg: LandingConfig,
  data: LandingPayload | null,
): { source: LandingPayload["source"] } & LandingViewCollections {
  const source: LandingPayload["source"] = data?.source ?? (cfg.useDemoData ? "demo" : "live");
  const demo = source === "demo";
  return {
    source,
    stats: data?.stats ?? (demo ? { ...cfg.demoStats } : { ...EMPTY_LIVE_STATS }),
    chatrooms: data?.chatrooms ?? (demo ? cfg.demoChatrooms : []),
    topMembers: data?.topMembers ?? (demo ? cfg.demoTopMembers : []),
    feedPost: data ? data.feedPost : demo ? cfg.demoFeedPost : null,
    poll: data ? data.poll : demo ? cfg.demoPoll : null,
    confession: data ? data.confession : demo ? cfg.demoConfession : null,
    trendingPosts: data?.trendingPosts ?? (demo ? cfg.trendingPosts : []),
    discussions: data?.discussions ?? (demo ? cfg.discussions : []),
    featuredMembers: data?.featuredMembers ?? (demo ? cfg.featuredMembers : []),
    recentConfessions: data?.recentConfessions ?? (demo ? cfg.recentConfessions : []),
    blogPosts: data?.blogPosts ?? (demo ? cfg.blogPosts : []),
    activities: data?.activities ?? (demo ? cfg.activities : []),
    newMembers: data?.newMembers ?? [],
  };
}

export function sortActivitiesNewest<T extends { at: number }>(items: T[], limit = 8): T[] {
  return [...items].sort((a, b) => b.at - a.at).slice(0, limit);
}
