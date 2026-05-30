import {
  LayoutDashboard, Settings, Palette, LayoutGrid, Puzzle, Shield,
  Lock, Search, Coins, Gavel, Gamepad2, Sparkles, BarChart3, Bot, Users2,
  FileText, MessageSquare, Newspaper, Zap, Trophy, Calendar, Flag,
  Filter, Layers, Server, KeyRound, Activity,
} from "lucide-react";

export type AdminGroup =
  | "Community"
  | "Engagement"
  | "Moderation"
  | "Appearance"
  | "Advanced";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: AdminGroup;
  badge?: string;
  description?: string;
  /** When true, only shown when admin is in "advanced" mode (and is super admin). */
  advanced?: boolean;
  /** When true, only super admins ever see this entry. */
  superOnly?: boolean;
  /** Extra search terms for the settings search box. */
  keywords?: string[];
}

// Top-level structure inspired by Discord / modern SaaS: a few clean buckets,
// not 20 sidebar groups. Each entry belongs to ONE bucket.
export const ADMIN_NAV: AdminNavItem[] = [
  // ---- Community (the daily basics) ----
  { to: "/admin",               label: "Dashboard",      icon: LayoutDashboard, group: "Community",
    description: "Overview, quick toggles and presets.",
    keywords: ["home", "overview", "quick", "presets"] },
  { to: "/admin/analytics",     label: "Analytics",      icon: BarChart3,       group: "Community",
    description: "DAU, retention and traffic charts.",
    keywords: ["stats", "metrics", "dau", "traffic", "retention"] },
  { to: "/admin/chatrooms",     label: "Chatrooms",      icon: MessageSquare,   group: "Community",
    description: "Realtime rooms, bots and limits.",
    keywords: ["chat", "rooms", "realtime", "messages"] },
  { to: "/admin/social-feed",   label: "Feed",           icon: Newspaper,       group: "Community",
    description: "Posts, comments and timeline.",
    keywords: ["feed", "posts", "social", "timeline"] },
  { to: "/admin/games",         label: "Games",          icon: Gamepad2,        group: "Community",
    description: "Mini-games, rewards and matchmaking.",
    keywords: ["games", "play", "matchmaking", "minigames"] },
  { to: "/admin/pages",         label: "Custom Pages",   icon: FileText,        group: "Community",
    description: "SEO-friendly landing page CMS.",
    keywords: ["cms", "pages", "landing", "marketing"] },

  // ---- Engagement (growth loops) ----
  { to: "/admin/economy",       label: "Rewards",        icon: Coins,           group: "Engagement",
    description: "XP, coins, shop and streaks.",
    keywords: ["economy", "coins", "xp", "shop", "rewards", "streaks", "missions"] },
  { to: "/admin/automation",    label: "Automation",     icon: Zap,             group: "Engagement",
    description: "Smart automation level and rules.",
    keywords: ["automation", "rules", "schedule", "ai", "auto"] },
  { to: "/admin/ai-settings",   label: "AI Settings",    icon: Sparkles,        group: "Engagement", badge: "Soon",
    description: "AI providers, prompts and limits.",
    keywords: ["ai", "openai", "gemini", "prompt"] },
  { to: "/admin/bots",          label: "Chat Bots",      icon: Bot,             group: "Engagement",
    description: "Fish, wine, dig, trivia and AI bots.",
    keywords: ["bots", "fish", "trivia", "commands"] },

  // ---- Moderation & users ----
  { to: "/admin/users",         label: "Users",          icon: Users2,          group: "Moderation",
    description: "Search, manage and message users.",
    keywords: ["users", "members", "accounts"] },
  { to: "/admin/roles",         label: "Roles",          icon: Shield,          group: "Moderation",
    description: "Admins, moderators and badges.",
    keywords: ["roles", "permissions", "admin", "moderator"] },
  { to: "/admin/moderation",    label: "Moderation",     icon: Gavel,           group: "Moderation",
    description: "Bans, mutes, word filters and reports.",
    keywords: ["bans", "mutes", "filters", "reports", "abuse"] },
  { to: "/admin/reports",       label: "Reports",        icon: Flag,            group: "Moderation",
    description: "User-submitted reports queue.",
    keywords: ["reports", "queue", "abuse"] },
  { to: "/admin/filters",       label: "Filters",        icon: Filter,          group: "Moderation",
    description: "Word filters and content rules.",
    keywords: ["filters", "blocklist", "words", "content"] },

  // ---- Appearance ----
  { to: "/admin/general",       label: "General",        icon: Settings,        group: "Appearance",
    description: "Site name, tagline and basics.",
    keywords: ["general", "name", "tagline", "site"] },
  { to: "/admin/appearance",    label: "Themes",         icon: Palette,         group: "Appearance",
    description: "Theme, colors, logo and favicon.",
    keywords: ["theme", "colors", "logo", "favicon", "branding"] },
  { to: "/admin/social-layout", label: "Layout",         icon: LayoutGrid,      group: "Appearance",
    description: "Feed widgets, sidebars and layout.",
    keywords: ["layout", "widgets", "sidebar"] },
  { to: "/admin/seo",           label: "SEO",            icon: Search,          group: "Appearance",
    description: "Sitemap, robots and meta defaults.",
    keywords: ["seo", "sitemap", "robots", "meta", "og"] },

  // ---- Advanced (super admin + advanced mode only) ----
  { to: "/admin/modules",       label: "Modules",        icon: Puzzle,          group: "Advanced",
    advanced: true,
    description: "Enable or disable platform modules.",
    keywords: ["modules", "features", "toggles"] },
  { to: "/admin/security",      label: "Security",       icon: Lock,            group: "Advanced", badge: "Soon",
    advanced: true,
    description: "Captcha, rate limits, sessions.",
    keywords: ["security", "captcha", "rate", "sessions"] },
  { to: "/admin/system",        label: "System",         icon: Server,          group: "Advanced",
    advanced: true, superOnly: true,
    description: "Database, jobs and websocket settings.",
    keywords: ["system", "database", "jobs", "websocket"] },
  { to: "/admin/api",           label: "API & Webhooks", icon: KeyRound,        group: "Advanced",
    advanced: true, superOnly: true,
    description: "API keys and outbound webhooks.",
    keywords: ["api", "keys", "webhooks", "tokens"] },
  { to: "/admin/performance",   label: "Performance",    icon: Activity,        group: "Advanced",
    advanced: true,
    description: "Caching, prefetch and CDN tuning.",
    keywords: ["performance", "cache", "cdn", "prefetch"] },
];
