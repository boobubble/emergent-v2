const DEFAULT_CATEGORIES = [
  { key: "love", label: "Love", emoji: "❤️" },
  { key: "relationships", label: "Relationships", emoji: "💞" },
  { key: "friendship", label: "Friendship", emoji: "🤝" },
  { key: "family", label: "Family", emoji: "👪" },
  { key: "secrets", label: "Secrets", emoji: "🤫" },
  { key: "advice", label: "Advice", emoji: "💡" },
  { key: "funny", label: "Funny", emoji: "😂" },
  { key: "school", label: "School/College", emoji: "🎓" },
  { key: "work", label: "Work", emoji: "💼" },
  { key: "polls", label: "Polls", emoji: "📊" }
];
const REACTION_META = {
  like: { emoji: "❤️", label: "Like" },
  funny: { emoji: "😂", label: "Funny" },
  shock: { emoji: "😮", label: "Shocking" },
  sad: { emoji: "😢", label: "Sad" },
  hot: { emoji: "🔥", label: "Hot" },
  love: { emoji: "🥰", label: "Love" }
};
const ANIMAL_AVATARS = [
  "🐼",
  "🦊",
  "🐯",
  "🦁",
  "🐸",
  "🐵",
  "🐨",
  "🐰",
  "🐻",
  "🦝",
  "🦄",
  "🐲",
  "🐧",
  "🦉",
  "🐙",
  "🦋"
];
const CONFESSIONS_DEFAULTS = {
  enabled: true,
  routeSlug: "confessions",
  anonymousModes: {
    fully_anonymous: true,
    random_id: true,
    random_avatar: true,
    username: false
  },
  kinds: {
    text: true,
    poll: true,
    image: false,
    question: true,
    advice: true
  },
  categories: DEFAULT_CATEGORIES,
  reactions: {
    like: true,
    funny: true,
    shock: true,
    sad: true,
    hot: true,
    love: false
  },
  allowReplies: true,
  allowAnonymousReplies: true,
  allowReports: true,
  coins: { enabled: true, postCost: 0, pinCost: 20, highlightCost: 50 },
  level: {
    enabled: false,
    minLevelToPost: 1,
    minLevelForAnonReply: 1,
    minLevelForImages: 3
  },
  moderation: {
    approvalRequired: false,
    autoModeration: true,
    badWordFilter: true,
    linkFilter: true,
    spamDetection: true
  },
  expiry: { defaultMode: "never", userSelectable: true },
  leaderboards: {
    trending: true,
    mostReplied: true,
    mostLiked: true,
    dailyPick: true,
    weeklyPick: true
  },
  seo: {
    metaTitle: "Confessions — Share anonymously",
    metaDescription: "A safe space to share secrets, ask for advice, and connect anonymously.",
    keywords: "confessions, anonymous, secrets, advice, community",
    ogTitle: "Confessions",
    ogDescription: "Anonymous community confessions, polls, and questions.",
    ogImage: "",
    noindex: false
  }
};
function expiryToTimestamp(mode) {
  if (mode === "never") return null;
  const now = Date.now();
  const ms = mode === "24h" ? 864e5 : mode === "7d" ? 7 * 864e5 : 30 * 864e5;
  return new Date(now + ms).toISOString();
}
function pickRandomAvatar(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = h * 31 + seed.charCodeAt(i) | 0;
  return ANIMAL_AVATARS[Math.abs(h) % ANIMAL_AVATARS.length];
}
function randomConfessorNumber(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = h * 131 + seed.charCodeAt(i) | 0;
  return Math.abs(h) % 9e3 + 100;
}
export {
  CONFESSIONS_DEFAULTS as C,
  REACTION_META as R,
  expiryToTimestamp as e,
  pickRandomAvatar as p,
  randomConfessorNumber as r
};
