/**
 * Hero Homepage configuration. Stored in app_settings under `hero_page`.
 * Separate from /welcome (which has its own demo-focused config).
 *
 * The active default landing page (welcome vs hero) is stored in
 * `app_settings.home_page` as { mode: "welcome" | "hero" }.
 */

export const HERO_SETTINGS_KEY = "hero_page";
export const HOME_PAGE_KEY = "home_page";

export type HomePageMode = "welcome" | "hero";

export interface HeroShowcaseItem {
  emoji: string;
  title: string;
  description: string;
}

export interface FamousChatroom {
  emoji: string;
  name: string;
  topic: string;
  members: number;
}

export interface LiveUserCard {
  emoji: string;
  name: string;
  status: string;
  imageUrl?: string;
}

export interface DailyMissionCard {
  emoji: string;
  title: string;
  reward: string;
  description: string;
}

export type HeroSectionKey =
  | "hero"
  | "stats"
  | "chatrooms"
  | "feed"
  | "radio"
  | "games"
  | "famous_chatrooms"
  | "live_users"
  | "daily_missions"
  | "social_proof"
  | "final_cta";

export interface HeroSection {
  key: HeroSectionKey;
  enabled: boolean;
}

export interface HeroConfig {
  enabled: boolean;
  brandName: string;
  headline: string;
  subheadline: string;
  heroImageUrl: string;
  chatroomImageUrl: string;
  feedImageUrl: string;
  radioImageUrl: string;
  ctaJoinLabel: string;
  ctaLoginLabel: string;
  ctaGuestLabel: string;
  finalCtaTitle: string;
  finalCtaSubtitle: string;
  chatroomFeatures: HeroShowcaseItem[];
  feedFeatures: HeroShowcaseItem[];
  radioFeatures: HeroShowcaseItem[];
  gameFeatures: HeroShowcaseItem[];
  famousChatrooms: FamousChatroom[];
  liveUsers: LiveUserCard[];
  dailyMissions: DailyMissionCard[];
  /** Ordered list of sections. Admin can reorder via drag-and-drop and toggle each on/off. */
  sections: HeroSection[];
}

export const HERO_SECTION_LABELS: Record<HeroSectionKey, { label: string; emoji: string; description: string }> = {
  hero: { label: "Hero header", emoji: "✨", description: "Headline, subheadline and main CTAs." },
  stats: { label: "Live community stats", emoji: "📊", description: "Animated live counters." },
  chatrooms: { label: "Chatrooms showcase", emoji: "💬", description: "Chatroom features grid + image." },
  feed: { label: "Social feed showcase", emoji: "📰", description: "Feed features grid + image." },
  radio: { label: "Live radio showcase", emoji: "🎙️", description: "Radio features grid + image." },
  games: { label: "Games grid", emoji: "🎮", description: "Game features grid." },
  famous_chatrooms: { label: "Famous chatrooms", emoji: "🔥", description: "Cards of popular rooms with topics and member counts." },
  live_users: { label: "Live users", emoji: "🟢", description: "Avatar cards of users active right now." },
  daily_missions: { label: "Daily missions", emoji: "🎯", description: "Cards of today's missions with rewards." },
  social_proof: { label: "Social proof", emoji: "👑", description: "Top members, DJs, trending and rooms tiles." },
  final_cta: { label: "Final call-to-action", emoji: "💖", description: "Final signup/login/explore block." },
};

export const HERO_DEFAULTS: HeroConfig = {
  enabled: true,
  brandName: "Community",
  headline: "Connect, Chat, Share & Grow Together 💫",
  subheadline:
    "Join realtime chatrooms, discover social feeds, listen to live radio, play games, and become part of a thriving community.",
  heroImageUrl:
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1400&q=80",
  chatroomImageUrl:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  feedImageUrl:
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80",
  radioImageUrl:
    "https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=1200&q=80",
  ctaJoinLabel: "Join Now",
  ctaLoginLabel: "Login",
  ctaGuestLabel: "Explore as Guest",
  finalCtaTitle: "Ready to Join the Community? 🚀",
  finalCtaSubtitle: "Thousands of members are chatting, sharing and playing right now.",
  chatroomFeatures: [
    { emoji: "💬", title: "Public Chatrooms", description: "Hop into themed rooms and meet new friends instantly." },
    { emoji: "🔥", title: "3some Rooms", description: "Private invite-only mini rooms for tight crews." },
    { emoji: "🔒", title: "Private Chats", description: "Encrypted DMs with delivery & read receipts." },
    { emoji: "⚡", title: "Realtime Messaging", description: "Lightning fast, presence aware, mobile-first." },
    { emoji: "📻", title: "Radio Integration", description: "Tune into live DJs without leaving the chat." },
    { emoji: "🎮", title: "Games in Chat", description: "Trivia, hangman, fishing — all from chat commands." },
    { emoji: "🫶", title: "Friend Discovery", description: "Smart suggestions based on activity & vibes." },
    { emoji: "💖", title: "Reactions", description: "Express yourself with rich emoji reactions." },
  ],
  feedFeatures: [
    { emoji: "📝", title: "Posts", description: "Share thoughts, stories and moments." },
    { emoji: "🖼️", title: "Image Sharing", description: "Beautiful photo posts with previews." },
    { emoji: "💬", title: "Comments", description: "Real conversations under every post." },
    { emoji: "❤️", title: "Reactions", description: "Like, love, fire — your vibe, your reaction." },
    { emoji: "🔥", title: "Trending", description: "Discover what the community is talking about." },
    { emoji: "🏆", title: "XP Rewards", description: "Earn XP for posting, commenting and engaging." },
    { emoji: "🔥", title: "Streaks", description: "Daily streak bonuses keep you coming back." },
    { emoji: "📊", title: "Leaderboards", description: "Climb the ranks and become a community star." },
  ],
  radioFeatures: [
    { emoji: "🎙️", title: "Live DJs", description: "Real humans spinning real sets." },
    { emoji: "🎵", title: "Live Music", description: "Non-stop community-curated tracks." },
    { emoji: "👥", title: "Listener Count", description: "See who's tuned in right now." },
    { emoji: "🎶", title: "Song Requests", description: "Request your favorites live on air." },
    { emoji: "📅", title: "Upcoming Shows", description: "Never miss your favorite host." },
  ],
  gameFeatures: [
    { emoji: "🎲", title: "Casual Games", description: "Quick fun anytime, anywhere." },
    { emoji: "👯", title: "Multiplayer", description: "Challenge friends head to head." },
    { emoji: "🎁", title: "Rewards", description: "Win prizes and exclusive cosmetics." },
    { emoji: "🪙", title: "Coins", description: "Earn coins to spend in the shop." },
    { emoji: "⭐", title: "XP Boosts", description: "Level up faster by playing daily." },
  ],
  famousChatrooms: [
    { emoji: "💖", name: "Lounge", topic: "General hangout vibes", members: 412 },
    { emoji: "🎵", name: "Music Lovers", topic: "Share songs & discover tracks", members: 287 },
    { emoji: "🎮", name: "Gamers Hub", topic: "All things gaming", members: 354 },
    { emoji: "🌙", name: "Late Night", topic: "Cozy chats after midnight", members: 198 },
    { emoji: "🔥", name: "Trending", topic: "What's hot right now", members: 521 },
    { emoji: "💬", name: "Chit Chat", topic: "Random conversations", members: 245 },
  ],
  liveUsers: [
    { emoji: "🌸", name: "Aria", status: "Vibing in Lounge" },
    { emoji: "⚡", name: "Kai", status: "Spinning tracks on Radio" },
    { emoji: "🎨", name: "Mira", status: "Sharing art on Feed" },
    { emoji: "🎯", name: "Leo", status: "Crushing missions" },
    { emoji: "🌊", name: "Nova", status: "Hosting trivia" },
    { emoji: "🦋", name: "Sky", status: "Just joined Late Night" },
    { emoji: "🌟", name: "Zara", status: "Top of leaderboard" },
    { emoji: "🔥", name: "Rio", status: "On a 12 day streak" },
  ],
  dailyMissions: [
    { emoji: "💬", title: "Send 10 messages", reward: "+50 XP", description: "Chat with anyone in any room." },
    { emoji: "❤️", title: "React to 5 posts", reward: "+30 XP", description: "Spread the love on the feed." },
    { emoji: "🎮", title: "Play a game", reward: "+100 coins", description: "Try trivia, hangman or fishing." },
    { emoji: "🎙️", title: "Tune into Radio", reward: "+25 XP", description: "Listen for 10 minutes." },
    { emoji: "🫶", title: "Make a new friend", reward: "+150 XP", description: "Accept a friend request." },
    { emoji: "🔥", title: "Keep your streak", reward: "+2x XP boost", description: "Visit today to extend it." },
  ],
  sections: [
    { key: "hero", enabled: true },
    { key: "stats", enabled: true },
    { key: "famous_chatrooms", enabled: true },
    { key: "chatrooms", enabled: true },
    { key: "live_users", enabled: true },
    { key: "feed", enabled: true },
    { key: "daily_missions", enabled: true },
    { key: "radio", enabled: true },
    { key: "games", enabled: true },
    { key: "social_proof", enabled: true },
    { key: "final_cta", enabled: true },
  ],
};

/** Merge stored config with defaults, ensuring `sections` includes every known key (appending missing ones disabled). */
export function mergeHeroConfig(stored: Partial<HeroConfig> | null | undefined): HeroConfig {
  const merged: HeroConfig = { ...HERO_DEFAULTS, ...(stored || {}) };
  const known = HERO_DEFAULTS.sections.map((s) => s.key);
  const existing = Array.isArray(merged.sections) ? merged.sections.filter((s) => known.includes(s.key)) : [];
  const seen = new Set(existing.map((s) => s.key));
  for (const k of known) {
    if (!seen.has(k)) existing.push({ key: k, enabled: true });
  }
  merged.sections = existing;
  return merged;
}
