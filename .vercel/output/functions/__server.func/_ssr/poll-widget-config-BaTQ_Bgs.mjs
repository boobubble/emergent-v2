const POLL_WIDGET_DEFAULTS = {
  enabled: false,
  showTrending: true,
  showPollOfDay: true,
  showCreatorPolls: true,
  showWeeklyVote: true,
  showVoteCounts: true,
  redirectToFeed: true,
  pollLifetimeDays: 7
};
function mergePollWidgetConfig(raw) {
  const p = raw ?? {};
  return { ...POLL_WIDGET_DEFAULTS, ...p };
}
const POLL_CATEGORY_META = {
  trending: { label: "Trending Poll", emoji: "🔥", tone: "text-orange-400" },
  poll_of_day: { label: "Poll of the Day", emoji: "⭐", tone: "text-yellow-400" },
  creator: { label: "Creator Poll", emoji: "🎙️", tone: "text-violet-400" },
  weekly: { label: "Weekly Community Vote", emoji: "🗳️", tone: "text-sky-400" }
};
function sumVotes(votes) {
  if (!votes) return 0;
  return Object.values(votes).reduce((a, b) => a + (Number(b) || 0), 0);
}
function formatRemaining(expiresAtMs, nowMs = Date.now()) {
  const diff = expiresAtMs - nowMs;
  if (diff <= 0) return "Closed";
  const m = Math.floor(diff / 6e4);
  if (m < 60) return `${m}m left`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h left`;
  const d = Math.floor(h / 24);
  return `${d}d left`;
}
export {
  POLL_WIDGET_DEFAULTS as P,
  POLL_CATEGORY_META as a,
  formatRemaining as f,
  mergePollWidgetConfig as m,
  sumVotes as s
};
