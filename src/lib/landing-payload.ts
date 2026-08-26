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
import { resolvePublicDisplayName } from "@/lib/branding";

export interface LandingStats {
  members: number;
  online: number;
  activeRooms: number;
  messagesSent: number;
  feedPosts: number;
  gamesPlayed: number;
}

export interface LandingPayload {
  config: LandingConfig;
  source: "live" | "demo";
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
}

export const fmtCount = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`
      : n.toLocaleString();

export function brandNameFromConfig(cfg: LandingConfig): string {
  return resolvePublicDisplayName({ copyrightOwner: cfg.copyrightOwner });
}
