const EARN = {
  // Chat
  chat_message: { coins: 1, xp: 1, cooldownMs: 8e3, dailyCap: 80 },
  chat_reply: { coins: 2, xp: 1, cooldownMs: 8e3, dailyCap: 40 },
  // reply to another user
  // Feed (actor side — the one doing the action)
  feed_reaction_actor: { coins: 0, xp: 1, dailyCap: 50 },
  feed_comment_actor: { coins: 1, xp: 2, dailyCap: 30 },
  // Feed (owner side — author of the post receiving engagement)
  feed_reaction_owner: { coins: 1, xp: 1, dailyCapPerPost: 30 },
  feed_comment_owner: { coins: 2, xp: 2, dailyCapPerPost: 20 },
  feed_share_owner: { coins: 5, xp: 3, dailyCapPerPost: 10 }
};
const SPEND = {
  highlight_message: { coins: 15, durationMs: 60 * 60 * 1e3 },
  // 1h
  boost_post: { coins: 25, scoreDelta: 30 }
};
const ROOM_LOYALTY_LEVELS = [
  { level: 1, name: "Newcomer", minMsgs: 0, chip: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  { level: 2, name: "Regular", minMsgs: 50, chip: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  { level: 3, name: "Local", minMsgs: 200, chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  { level: 4, name: "Veteran", minMsgs: 500, chip: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  { level: 5, name: "Legend", minMsgs: 1500, chip: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300" }
];
function roomLoyaltyFor(totalMessages) {
  let r = ROOM_LOYALTY_LEVELS[0];
  for (const l of ROOM_LOYALTY_LEVELS) if (totalMessages >= l.minMsgs) r = l;
  return r;
}
const CREATOR_RANKS = [
  { title: "Newcomer", minScore: 0, chip: "bg-slate-500/15 text-slate-600 dark:text-slate-300", color: "text-slate-500" },
  { title: "Rising Creator", minScore: 25, chip: "bg-sky-500/15 text-sky-600 dark:text-sky-300", color: "text-sky-500" },
  { title: "Trending Creator", minScore: 100, chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300", color: "text-emerald-500" },
  { title: "Viral Creator", minScore: 300, chip: "bg-amber-500/15 text-amber-600 dark:text-amber-300", color: "text-amber-500" },
  { title: "Elite Poster", minScore: 800, chip: "bg-orange-500/15 text-orange-600 dark:text-orange-300", color: "text-orange-500" },
  { title: "Legendary", minScore: 2e3, chip: "bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-fuchsia-600 dark:text-fuchsia-300", color: "text-fuchsia-500" }
];
function creatorRankFor(score) {
  let r = CREATOR_RANKS[0];
  for (const x of CREATOR_RANKS) if (score >= x.minScore) r = x;
  return r;
}
const SCORE_WEIGHTS = {
  reaction: 1,
  comment: 3
};
const DAILY_MISSIONS = [
  { id: "react_5", title: "Show some love", description: "React to 5 posts", target: 5, coins: 10, xp: 10, icon: "❤️" },
  { id: "comment_3", title: "Join the chat", description: "Comment on 3 posts", target: 3, coins: 15, xp: 15, icon: "💬" },
  { id: "chat_10", title: "Stay social", description: "Send 10 chat messages", target: 10, coins: 10, xp: 10, icon: "💭" },
  { id: "post_1", title: "Share something", description: "Create 1 post", target: 1, coins: 20, xp: 20, icon: "📝" },
  { id: "engage_15", title: "Community builder", description: "Earn 15 engagements on your posts (reactions+comments)", target: 15, coins: 30, xp: 25, icon: "🚀" }
];
const MISSION_BY_ID = Object.fromEntries(
  DAILY_MISSIONS.map((m) => [m.id, m])
);
const VIRAL_JACKPOT = {
  coins: 250,
  xp: 100,
  minScore: 50
  // post must be at least somewhat trending
};
export {
  DAILY_MISSIONS as D,
  EARN as E,
  MISSION_BY_ID as M,
  SPEND as S,
  VIRAL_JACKPOT as V,
  SCORE_WEIGHTS as a,
  creatorRankFor as c,
  roomLoyaltyFor as r
};
