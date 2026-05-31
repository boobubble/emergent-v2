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
  /** Optional: shown when rendering the "Popular Games" list (e.g. "12.5K plays"). */
  plays?: string;
}

export interface LandingMissionCard {
  emoji: string;
  title: string;
  progress: number; // 0..100
  reward: string;
  /** Optional explicit progress like "20/20" — overrides the % bar label. */
  progressLabel?: string;
  complete?: boolean;
}

export interface LandingFooterLink {
  label: string;
  href: string;
}

export interface LandingFooterColumn {
  title: string;
  links: LandingFooterLink[];
}

export interface LandingChatroom {
  emoji: string;
  name: string;
  online: number;
  topic?: string;
}

export interface LandingTopMember {
  username: string;
  xp: number;
  emoji?: string;
}

export interface LandingDemoFeedPost {
  username: string;
  ago: string;
  text: string;
  badge?: string;
  likes: number;
  comments: number;
  coins: number;
}

export interface LandingDemoPoll {
  question: string;
  ago: string;
  options: Array<{ label: string; votes: number }>;
  daysLeft: number;
}

export interface LandingDemoConfession {
  alias: string;
  ago: string;
  text: string;
  emoji: string;
}

export interface LandingDemoStats {
  members: number;
  online: number;
  activeRooms: number;
  messagesSent: number;
  feedPosts: number;
  gamesPlayed: number;
}

export interface LandingConfig {
  enabled: boolean;

  /** When true the homepage shows admin-curated demo data instead of live community data. */
  useDemoData: boolean;

  // Hero
  heroEyebrow: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroBadges: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  heroSocialProof: string;

  // Stats strip
  showStats: boolean;
  showMessageCount: boolean;
  showGameCount: boolean;
  showGrowth: boolean;
  growthLabel: string;
  /** Demo-mode stat values shown on the stat strip. Real-mode falls back to these when live counts are zero. */
  demoStats: LandingDemoStats;
  /** Back-compat aliases — keep so old saved settings continue to work. */
  fallbackMessagesSent: number;
  fallbackGamesPlayed: number;

  // Sections
  featureCards: LandingFeatureCard[];
  games: LandingGameCard[];
  missions: LandingMissionCard[];

  // Demo content (also acts as fallback when DB has none)
  demoChatrooms: LandingChatroom[];
  demoTopMembers: LandingTopMember[];
  demoFeedPost: LandingDemoFeedPost;
  demoPoll: LandingDemoPoll;
  demoConfession: LandingDemoConfession;

  // Referral
  referralHeadline: string;
  referralDescription: string;
  referralCoinReward: number;
  referralXpReward: number;

  // Final CTA
  finalCtaTitle: string;
  finalCtaSubtitle: string;
  /** Optional illustration shown inside the "Ready to Join the Fun?" card. Admin-editable. */
  finalCtaImageUrl: string;
  finalCtaImageAlt: string;

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
  useDemoData: true,

  heroEyebrow: "A live social community",
  heroTitle: "Join The Ultimate",
  heroTitleHighlight: "Active Community",
  heroSubtitle:
    "Chat in real-time, share your thoughts, play games, earn rewards and make new friends.",
  heroBadges: ["💬 Chatrooms", "📱 Social Feed", "🎮 Games", "⭐ Rewards"],
  primaryCtaLabel: "Start Chatting",
  primaryCtaHref: "/login",
  secondaryCtaLabel: "Create Account",
  secondaryCtaHref: "/login",
  heroSocialProof: "15,240+ members joined this week",

  showStats: true,
  showMessageCount: true,
  showGameCount: true,
  showGrowth: false,
  growthLabel: "+38% this month",
  demoStats: {
    members: 15240,
    online: 512,
    activeRooms: 85,
    messagesSent: 2_100_000,
    feedPosts: 125_000,
    gamesPlayed: 35_000,
  },
  fallbackMessagesSent: 128_400,
  fallbackGamesPlayed: 24_900,

  featureCards: [
    { emoji: "💬", title: "Live Chatrooms",   description: "Join active chatrooms and meet new people." },
    { emoji: "📱", title: "Social Feed",      description: "Share posts, photos, memes and polls." },
    { emoji: "🎮", title: "Games & Rewards",  description: "Play games, earn coins, XP and unlock badges." },
    { emoji: "👥", title: "Find Friends",     description: "Connect with people and build friendships." },
    { emoji: "🏆", title: "Leaderboards",     description: "Compete and rank on leaderboards." },
    { emoji: "🎯", title: "Daily Missions",   description: "Complete daily missions and earn rewards." },
  ],

  games: [
    { emoji: "🎲", name: "Ludo",      reward: "+50 coins · +20 XP", plays: "12.5K plays" },
    { emoji: "🐟", name: "Fish Game", reward: "+30 coins · +15 XP", plays: "8.7K plays" },
    { emoji: "🍷", name: "Wine Game", reward: "+40 coins · +18 XP", plays: "5.3K plays" },
    { emoji: "⛏️", name: "Dig Game",  reward: "+25 coins · +12 XP", plays: "3.2K plays" },
  ],

  missions: [
    { emoji: "✅", title: "Send 20 Messages",  progress: 100, progressLabel: "20/20", reward: "+15 XP", complete: true  },
    { emoji: "✅", title: "Create 1 Feed Post", progress: 100, progressLabel: "1/1",   reward: "+10 coins", complete: true },
    { emoji: "🎯", title: "React to 5 Posts",   progress: 60,  progressLabel: "3/5",   reward: "+20 XP · +25 coins", complete: false },
  ],

  demoChatrooms: [
    { emoji: "🇮🇳", name: "India Chat",    online: 128, topic: "General" },
    { emoji: "🌆", name: "Mumbai Chat",    online: 96,  topic: "Locals"  },
    { emoji: "🎮", name: "Gaming Lounge",  online: 75,  topic: "Gaming"  },
    { emoji: "🎓", name: "College Chat",   online: 64,  topic: "Students" },
    { emoji: "💭", name: "Dil Se",         online: 52,  topic: "Confessions" },
  ],

  demoTopMembers: [
    { username: "Amit Sharma",  xp: 2450, emoji: "👨" },
    { username: "Pooja Singh",  xp: 1980, emoji: "👩" },
    { username: "Rahul Verma",  xp: 1650, emoji: "🧔" },
  ],

  demoFeedPost: {
    username: "Amit Sharma",
    ago: "2 hours ago",
    text: "Just completed my 7 day streak! 🔥 Feeling amazing today!",
    badge: "🔥 7 Day Streak",
    likes: 128,
    comments: 42,
    coins: 12,
  },

  demoPoll: {
    question: "Should we add Voice Rooms to our community?",
    ago: "1 hour ago",
    options: [
      { label: "Yes, definitely!", votes: 334 },
      { label: "Not now",          votes: 94  },
    ],
    daysLeft: 2,
  },

  demoConfession: {
    alias: "Panda #23",
    ago: "3 hours ago",
    text: "Me in every online class be like 😂",
    emoji: "🐼",
  },

  referralHeadline: "Invite Friends & Earn",
  referralDescription: "Invite your friends and earn 100 Coins for each sign up!",
  referralCoinReward: 100,
  referralXpReward: 50,

  finalCtaTitle: "Ready to Join the Fun?",
  finalCtaSubtitle: "Create your free account now and be part of our amazing community!",
  finalCtaImageUrl: "",
  finalCtaImageAlt: "Join the community",

  brandTagline: "A place to chat, connect, play and build your social world.",
  footerColumns: [
    {
      title: "Community",
      links: [
        { label: "About Us",   href: "/pages" },
        { label: "Safety",     href: "/pages" },
        { label: "Guidelines", href: "/pages" },
        { label: "Blog",       href: "/pages" },
      ],
    },
    {
      title: "Features",
      links: [
        { label: "Chatrooms", href: "/" },
        { label: "Feed",      href: "/feed" },
        { label: "Games",     href: "/games" },
        { label: "Rewards",   href: "/achievements" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center",    href: "/pages" },
        { label: "Contact Us",     href: "/feedback" },
        { label: "Privacy Policy", href: "/pages" },
        { label: "Terms of Service", href: "/pages" },
      ],
    },
  ],
  copyrightOwner: "ChitChat",

  seoTitle: "ChitChat — Join the Active Community",
  seoDescription:
    "Live chatrooms, social feed, games, rewards and friends — all in one premium community platform.",
  seoKeywords: "social community, chatrooms, social feed, online games, rewards, friends",
  ogImageUrl: "",
  enableStructuredData: true,
};

export const LANDING_SETTINGS_KEY = "landing_page";
