/**
 * Landing / Home page configuration. Stored in app_settings under
 * `landing_page`. Pure presentational config — does not affect any
 * existing feature.
 */

export interface LandingFeatureCard {
  emoji: string;
  title: string;
  description: string;
}

export interface LandingGameCard {
  emoji: string;
  name: string;
  reward: string;
}

export interface LandingMissionCard {
  emoji: string;
  title: string;
  progress: number; // 0..100
  reward: string;
}

export interface LandingFooterLink {
  label: string;
  href: string;
}

export interface LandingFooterColumn {
  title: string;
  links: LandingFooterLink[];
}

export interface LandingConfig {
  enabled: boolean;

  // Hero
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadges: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;

  // Stats strip — labels only; counts come from the live API
  showStats: boolean;
  showMessageCount: boolean;
  showGameCount: boolean;
  showGrowth: boolean;
  fallbackMessagesSent: number;
  fallbackGamesPlayed: number;
  growthLabel: string;

  // Sections
  featureCards: LandingFeatureCard[];
  games: LandingGameCard[];
  missions: LandingMissionCard[];

  // Sample content shown if no live items exist yet
  samplePollQuestion: string;
  samplePollYesLabel: string;
  samplePollNoLabel: string;

  // Referral
  referralHeadline: string;
  referralDescription: string;
  referralCoinReward: number;
  referralXpReward: number;

  // Final CTA
  finalCtaTitle: string;
  finalCtaSubtitle: string;

  // Footer
  brandTagline: string;
  footerColumns: LandingFooterColumn[];
  copyrightOwner: string;

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageUrl: string;
  enableStructuredData: boolean;
}

export const LANDING_DEFAULTS: LandingConfig = {
  enabled: true,

  heroEyebrow: "A live social community",
  heroTitle: "Join The Ultimate Social Community",
  heroSubtitle:
    "Chat in real-time, share posts, play games, earn rewards and make new friends.",
  heroBadges: ["💬 Chatrooms", "📱 Social Feed", "🎮 Games", "🏆 Rewards"],
  primaryCtaLabel: "Start Chatting",
  primaryCtaHref: "/",
  secondaryCtaLabel: "Create Account",
  secondaryCtaHref: "/",

  showStats: true,
  showMessageCount: true,
  showGameCount: true,
  showGrowth: true,
  fallbackMessagesSent: 128_400,
  fallbackGamesPlayed: 24_900,
  growthLabel: "+38% this month",

  featureCards: [
    { emoji: "💬", title: "Live Chatrooms", description: "Public rooms, private DMs, threaded replies and real-time presence." },
    { emoji: "📱", title: "Social Feed",   description: "Share posts, photos, memes and polls. React, comment and follow." },
    { emoji: "🎮", title: "Games & Rewards", description: "Play Ludo, Fish, Wine and Dig. Earn XP, coins and badges as you go." },
    { emoji: "👥", title: "Find Friends",  description: "Discover people who share your interests and start a conversation." },
    { emoji: "🏆", title: "Leaderboards",  description: "Climb XP, streak and creator boards. Show off your community impact." },
    { emoji: "🎯", title: "Daily Missions", description: "Bite-sized goals refresh every day. Stack rewards for showing up." },
  ],

  games: [
    { emoji: "🎲", name: "Ludo",      reward: "+50 coins · +20 XP" },
    { emoji: "🐟", name: "Fish Game", reward: "+30 coins · +15 XP" },
    { emoji: "🍷", name: "Wine Game", reward: "+40 coins · +18 XP" },
    { emoji: "⛏️", name: "Dig Game",  reward: "+25 coins · +12 XP" },
  ],

  missions: [
    { emoji: "💬", title: "Send 10 chat messages",  progress: 70, reward: "+15 XP" },
    { emoji: "📝", title: "React to 5 feed posts",  progress: 40, reward: "+10 coins" },
    { emoji: "🎮", title: "Play 1 game today",      progress: 100, reward: "+20 XP · +25 coins" },
    { emoji: "🔥", title: "Keep your 7-day streak", progress: 85, reward: "+50 XP" },
  ],

  samplePollQuestion: "Should Voice Rooms be added?",
  samplePollYesLabel: "Yes — bring them on",
  samplePollNoLabel: "No, keep text only",

  referralHeadline: "Invite friends, earn together",
  referralDescription: "Every friend who joins boosts both of you with coins and XP — no caps, no catch.",
  referralCoinReward: 200,
  referralXpReward: 100,

  finalCtaTitle: "Ready To Join The Community?",
  finalCtaSubtitle: "Create your free account or jump straight into a chatroom — your call.",

  brandTagline: "A modern social community for chats, posts, games and friendships.",
  footerColumns: [
    {
      title: "Community",
      links: [
        { label: "Chatrooms", href: "/" },
        { label: "Feed", href: "/feed" },
        { label: "Confessions", href: "/confessions" },
        { label: "Leaderboard", href: "/leaderboard" },
      ],
    },
    {
      title: "Features",
      links: [
        { label: "Games", href: "/games" },
        { label: "Achievements", href: "/achievements" },
        { label: "Find Friends", href: "/find-friends" },
        { label: "Feedback", href: "/feedback" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/pages" },
        { label: "Contact", href: "/feedback" },
        { label: "Report a bug", href: "/feedback" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms", href: "/pages" },
        { label: "Privacy", href: "/pages" },
        { label: "Cookies", href: "/pages" },
      ],
    },
  ],
  copyrightOwner: "Palrgo",

  seoTitle: "Palrgo — Join the Ultimate Social Community",
  seoDescription:
    "Live chatrooms, social feed, games, rewards and friends — all in one premium community platform.",
  seoKeywords: "social community, chatrooms, social feed, online games, rewards, friends",
  ogImageUrl: "",
  enableStructuredData: true,
};

export const LANDING_SETTINGS_KEY = "landing_page";
