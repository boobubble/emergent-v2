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
}

export const HERO_DEFAULTS: HeroConfig = {
  enabled: true,
  brandName: "Palrgo",
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
};
