import {
  LayoutDashboard, Settings, Palette, LayoutGrid, Puzzle, Shield,
  Lock, Search, Coins, Gavel, Gamepad2, Sparkles, BarChart3, Bot, Users2,
  FileText, MessageSquare, Newspaper,
} from "lucide-react";

export type AdminGroup =
  | "Overview"
  | "Chatrooms"
  | "Social Feed"
  | "Pages"
  | "Users"
  | "Games"
  | "Economy"
  | "AI"
  | "Appearance"
  | "Security"
  | "Modules";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: AdminGroup;
  badge?: string;
  description?: string;
}

// Order here drives both the sidebar section order and the hub pages.
export const ADMIN_NAV: AdminNavItem[] = [
  // 1. Overview / Dashboard
  { to: "/admin",               label: "Dashboard",     icon: LayoutDashboard, group: "Overview", description: "Platform-wide stats and realtime activity." },
  { to: "/admin/analytics",     label: "Analytics",     icon: BarChart3,       group: "Overview", description: "DAU, retention and traffic charts." },
  { to: "/admin/chatrooms",     label: "Chatrooms",     icon: MessageSquare,   group: "Overview", description: "Hub for all chatroom-only settings." },
  { to: "/admin/social-feed",   label: "Social Feed",   icon: Newspaper,       group: "Overview", description: "Hub for all social feed settings." },

  // 2. Chatroom-only settings
  { to: "/admin/moderation",    label: "Chat Moderation", icon: Gavel,         group: "Chatrooms",   description: "Bans, mutes, word filters and reports." },
  { to: "/admin/bots",          label: "Chat Bots",     icon: Bot,             group: "Chatrooms",   description: "Fish, wine, dig, trivia and AI bots." },
  

  // 3. Social feed-only settings
  { to: "/admin/social-layout", label: "Feed Layout",   icon: LayoutGrid,      group: "Social Feed", description: "Feed widgets, sidebars and layout." },

  // 4. Custom pages CMS
  { to: "/admin/pages",         label: "Custom Pages",  icon: FileText,        group: "Pages",       description: "SEO-friendly landing page CMS." },

  // 5. Users & permissions
  { to: "/admin/roles",         label: "Roles",         icon: Shield,          group: "Users",       description: "Admins, moderators and badges." },

  // 6. Games
  { to: "/admin/games",         label: "Games",         icon: Gamepad2,        group: "Games",       description: "Enable games, rewards and matchmaking." },

  // 7. Economy & rewards
  { to: "/admin/economy",       label: "Economy",       icon: Coins,           group: "Economy",     description: "XP, coins, shop and streaks." },

  // 9. AI settings
  { to: "/admin/ai-settings",   label: "AI Settings",   icon: Sparkles,        group: "AI",          badge: "Soon", description: "AI providers, prompts and limits." },

  // 10. Theme & appearance + general site
  { to: "/admin/general",       label: "General",       icon: Settings,        group: "Appearance",  description: "Site name, tagline and basics." },
  { to: "/admin/appearance",    label: "Appearance",    icon: Palette,         group: "Appearance",  description: "Theme, colors, logo and favicon." },

  // 11. Security & global SEO
  { to: "/admin/security",      label: "Security",      icon: Lock,            group: "Security",    badge: "Soon", description: "Captcha, rate limits, sessions." },
  { to: "/admin/seo",           label: "Global SEO",    icon: Search,          group: "Security",    description: "Sitemap, robots and meta defaults." },

  // 12. Modules toggle
  { to: "/admin/modules",       label: "Modules",       icon: Puzzle,          group: "Modules",     description: "Enable or disable platform modules." },
];
