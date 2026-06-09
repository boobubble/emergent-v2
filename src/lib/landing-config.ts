/**
 * Landing / Home page configuration. Stored in app_settings under
 * `landing_page`. Pure presentational config — does not affect any
 * existing feature.
 */

export interface LandingFeatureCard {
  emoji: string;
  title: string;
  description: string;
  /** Optional link applied to the whole card on the welcome page. */
  href?: string;
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

export interface LandingTrendingPost {
  user: string; ago: string; text: string; likes: number; comments: number; tag: string;
}
export interface LandingDiscussion {
  topic: string; room: string; author: string; replies: number; last: string; hot?: boolean;
}
export interface LandingFeaturedMember {
  name: string; role: string; xp: number; badges: string; // space-separated emojis
  gradient?: string;
}
export interface LandingConfessionItem {
  alias: string; emoji: string; ago: string; text: string; reacts: number;
}
export interface LandingBlogPost {
  title: string; excerpt: string; tag: string; read: string; author: string; date: string;
  emoji: string; gradient?: string; href?: string;
}
export interface LandingActivity {
  who: string; action: string; target: string; ago: string; emoji: string;
  tint?: string; accent?: string; href?: string;
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

  // ── Extra landing sections (admin curated, with per-section live toggle) ──
  trendingPosts: LandingTrendingPost[];
  trendingPostsUseLive: boolean;
  discussions: LandingDiscussion[];
  discussionsUseLive: boolean;
  featuredMembers: LandingFeaturedMember[];
  featuredMembersUseLive: boolean;
  recentConfessions: LandingConfessionItem[];
  recentConfessionsUseLive: boolean;
  blogPosts: LandingBlogPost[];
  blogPostsUseLive: boolean;
  activities: LandingActivity[];
  activitiesUseLive: boolean;

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

  trendingPosts: [
    { user: "Priya Kapoor",  ago: "12 min ago", text: "Just unlocked the Legendary badge! 🏆 Took me 3 months of daily grind.", likes: 842, comments: 156, tag: "#achievement" },
    { user: "Rohan Mehta",   ago: "34 min ago", text: "Hot take: voice rooms > text chat. Change my mind 🎙️", likes: 612, comments: 289, tag: "#discussion" },
    { user: "Sneha Iyer",    ago: "1 hr ago",   text: "Made some new friends from the Mumbai chat today. This community is wholesome ❤️", likes: 524, comments: 92, tag: "#community" },
    { user: "Arjun Das",     ago: "2 hr ago",   text: "Beat the Ludo champion 5 times in a row 🎲 who's next?", likes: 438, comments: 76, tag: "#gaming" },
    { user: "Neha Reddy",    ago: "3 hr ago",   text: "Daily streak: 30 days 🔥 The grind is real!", likes: 389, comments: 54, tag: "#streak" },
    { user: "Vikram Joshi",  ago: "4 hr ago",   text: "Anyone else loving the new emoji effects? 🎉✨", likes: 312, comments: 48, tag: "#feature" },
  ],
  trendingPostsUseLive: false,

  discussions: [
    { topic: "Best strategies for the new Fish Game?", room: "Gaming Lounge", author: "Karan",  replies: 47,  last: "2 min ago",  hot: true },
    { topic: "Weekend Mumbai meetup — who's in?",      room: "Mumbai Chat",   author: "Aisha",  replies: 89,  last: "18 min ago", hot: true },
    { topic: "Tips for keeping a 100-day streak alive 🔥", room: "General",   author: "Devansh", replies: 32, last: "1 hr ago" },
    { topic: "Drop your favorite playlist below 🎵",   room: "Music Room",    author: "Tanya",  replies: 124, last: "2 hr ago" },
    { topic: "Coding bootcamp — share your roadmap!",  room: "College Chat",  author: "Riya",   replies: 56,  last: "3 hr ago" },
  ],
  discussionsUseLive: false,

  featuredMembers: [
    { name: "Aanya Sharma", role: "Top Creator",    xp: 4820, badges: "👑 🔥 🏆", gradient: "from-purple-500/30 to-pink-500/20" },
    { name: "Kabir Singh",  role: "Mod Hero",       xp: 4210, badges: "🛡️ ⭐ 💎", gradient: "from-blue-500/30 to-cyan-500/20" },
    { name: "Meera Nair",   role: "Game Champion",  xp: 3890, badges: "🎮 🏆 🔥", gradient: "from-amber-500/30 to-orange-500/20" },
    { name: "Yash Patel",   role: "Streak Master",  xp: 3650, badges: "🔥 ⚡ 🌟", gradient: "from-emerald-500/30 to-teal-500/20" },
  ],
  featuredMembersUseLive: false,

  recentConfessions: [
    { alias: "Kitten #07",    emoji: "🐱", ago: "8 min ago",  text: "That cute boy from the Mumbai chat asked for my number… I'm not okay 😳💕", reacts: 482 },
    { alias: "Bunny #21",     emoji: "🐰", ago: "22 min ago", text: "Online crush update: he replied with TWO heart emojis tonight 🫠❤️", reacts: 367 },
    { alias: "Fox #71",       emoji: "🦊", ago: "45 min ago", text: "I keep refreshing his profile like a maniac. Help. 🦊💘", reacts: 298 },
    { alias: "Butterfly #14", emoji: "🦋", ago: "1 hr ago",   text: "We've been DMing till 4am every night this week. I might be in trouble 😈", reacts: 521 },
    { alias: "Panda #23",     emoji: "🐼", ago: "2 hr ago",   text: "He called me 'cutie' in the lobby and I screamed into my pillow 🥹🔥", reacts: 412 },
    { alias: "Cherry #88",    emoji: "🍒", ago: "3 hr ago",   text: "Voice room with him last night >>> any date I've ever been on 🎙️💋", reacts: 634 },
  ],
  recentConfessionsUseLive: false,

  blogPosts: [
    { tag: "Guide",     read: "5 min read", title: "How to Build a 100-Day Streak Without Burning Out", excerpt: "Practical habits and tools our top members use to stay consistent every single day.", author: "Editorial Team", date: "Jun 2",  gradient: "from-purple-600/40 to-blue-600/30",  emoji: "🔥", href: "/blog" },
    { tag: "Spotlight", read: "8 min read", title: "Meet the Mods: The People Behind Our Best Chatrooms", excerpt: "An inside look at the volunteers keeping our community safe, fun, and welcoming.",     author: "Sneha Iyer",    date: "May 30", gradient: "from-pink-600/40 to-amber-600/30",   emoji: "🛡️", href: "/blog" },
    { tag: "Update",    read: "3 min read", title: "What's New This Month: Voice Rooms, Emoji Effects & More",      excerpt: "A full roundup of the features we shipped in May plus a sneak peek at what's coming next.",        author: "Product Team",  date: "May 28", gradient: "from-emerald-600/40 to-teal-600/30", emoji: "🚀", href: "/blog" },
  ],
  blogPostsUseLive: false,

  activities: [
    { who: "Amit",  action: "joined",            target: "India Chat",       ago: "just now", emoji: "💬", tint: "from-blue-500/30 to-cyan-500/20",     accent: "text-cyan-200",    href: "/" },
    { who: "Pooja", action: "earned",            target: "Gold Badge",       ago: "2m ago",   emoji: "🏆", tint: "from-amber-500/35 to-yellow-500/20",  accent: "text-amber-200",   href: "/achievements" },
    { who: "Rahul", action: "posted",            target: "a new discussion", ago: "5m ago",   emoji: "📝", tint: "from-purple-500/30 to-pink-500/20",   accent: "text-pink-200",    href: "/discussions" },
    { who: "Sneha", action: "started a DM with", target: "Aanya",            ago: "8m ago",   emoji: "💌", tint: "from-rose-500/30 to-fuchsia-500/20",  accent: "text-rose-200",    href: "/feed" },
    { who: "Kabir", action: "won",               target: "a Ludo match",     ago: "12m ago",  emoji: "🎲", tint: "from-emerald-500/30 to-teal-500/20",  accent: "text-emerald-200", href: "/games" },
    { who: "Meera", action: "hit a",             target: "7-day streak 🔥",  ago: "18m ago",  emoji: "🔥", tint: "from-orange-500/35 to-red-500/20",    accent: "text-orange-200",  href: "/achievements" },
    { who: "Yash",  action: "created room",      target: "Late Night Vibes", ago: "25m ago",  emoji: "🌙", tint: "from-indigo-500/30 to-violet-500/20", accent: "text-indigo-200",  href: "/" },
    { who: "Riya",  action: "leveled up to",     target: "Level 12",         ago: "32m ago",  emoji: "⭐", tint: "from-yellow-500/30 to-amber-500/20",  accent: "text-yellow-200",  href: "/leaderboard" },
  ],
  activitiesUseLive: false,


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
