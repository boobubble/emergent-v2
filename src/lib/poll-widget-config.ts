// Chatroom Poll Discovery Widget — config schema.
//
// Polls themselves live in the Social Feed (posts.kind = "poll"). This widget
// only PREVIEWS polls inside chatrooms and links voters back to the feed.
// No voting / commenting happens in chat — those continue to live in the feed.
// Persisted under app_settings.poll_widget.

export interface PollWidgetConfig {
  /** Master switch — when off the chatroom poll widget is hidden everywhere. */
  enabled: boolean;
  /** Show the "Trending Poll" card. */
  showTrending: boolean;
  /** Show the "Poll of the Day" card. */
  showPollOfDay: boolean;
  /** Show the "Creator Poll" card. */
  showCreatorPolls: boolean;
  /** Show the "Weekly Community Vote" card. */
  showWeeklyVote: boolean;
  /** Whether the preview card displays the aggregate vote count. */
  showVoteCounts: boolean;
  /** Whether the CTA button is shown (sending users to the feed to vote). */
  redirectToFeed: boolean;
  /** Days a poll stays "Open" before being labelled "Closed". */
  pollLifetimeDays: number;
}

export const POLL_WIDGET_DEFAULTS: PollWidgetConfig = {
  enabled: false,
  showTrending: true,
  showPollOfDay: true,
  showCreatorPolls: true,
  showWeeklyVote: true,
  showVoteCounts: true,
  redirectToFeed: true,
  pollLifetimeDays: 7,
};

export function mergePollWidgetConfig(raw: unknown): PollWidgetConfig {
  const p = (raw ?? {}) as Partial<PollWidgetConfig>;
  return { ...POLL_WIDGET_DEFAULTS, ...p };
}

export type PollCategory = "trending" | "poll_of_day" | "creator" | "weekly";

export const POLL_CATEGORY_META: Record<
  PollCategory,
  { label: string; emoji: string; tone: string }
> = {
  trending:    { label: "Trending Poll",          emoji: "🔥", tone: "text-orange-400" },
  poll_of_day: { label: "Poll of the Day",        emoji: "⭐", tone: "text-yellow-400" },
  creator:     { label: "Creator Poll",           emoji: "🎙️", tone: "text-violet-400" },
  weekly:      { label: "Weekly Community Vote",  emoji: "🗳️", tone: "text-sky-400" },
};

export interface PollPreview {
  id: string;
  slug: string;
  question: string;
  voteCount: number;
  creatorName: string;
  isAnonymous: boolean;
  createdAt: string;
  expiresAt: number; // epoch ms
  status: "open" | "closed";
  category: PollCategory;
}

export function sumVotes(votes: Record<string, number> | undefined): number {
  if (!votes) return 0;
  return Object.values(votes).reduce((a, b) => a + (Number(b) || 0), 0);
}

export function formatRemaining(expiresAtMs: number, nowMs: number = Date.now()): string {
  const diff = expiresAtMs - nowMs;
  if (diff <= 0) return "Closed";
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m left`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h left`;
  const d = Math.floor(h / 24);
  return `${d}d left`;
}
