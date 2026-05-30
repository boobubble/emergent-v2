import {
  LayoutDashboard, Settings, Palette, LayoutGrid, Puzzle, Shield,
  Lock, Search, Coins, Gavel, Gamepad2, Sparkles, BarChart3, Bot, Users2,
  FileText, MessageSquare, Newspaper, Zap, Flag,
  Filter, Server, KeyRound, Activity, SlidersHorizontal, Wrench, Megaphone,
  Rocket, Flame, Radio,
} from "lucide-react";

export interface AdminLeaf {
  to: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  /** When true, only shown when admin is in "advanced" mode (and is super admin). */
  advanced?: boolean;
  /** When true, only super admins ever see this entry. */
  superOnly?: boolean;
  /** Extra search terms for the settings search box. */
  keywords?: string[];
}

export interface AdminGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** If set, the group acts as a direct link (no children dropdown). */
  to?: string;
  children?: AdminLeaf[];
  superOnly?: boolean;
  advanced?: boolean;
  badge?: string;
}

// WoWonder-style: a small set of top-level groups, each expandable into a few
// focused settings. Direct links (no `children`) are top-level items.
export const ADMIN_NAV: AdminGroup[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },

  {
    label: "Settings", icon: Settings, children: [
      { to: "/admin/general",       label: "General",       icon: SlidersHorizontal, keywords: ["site name", "tagline", "basics"] },
      { to: "/admin/appearance",    label: "Themes",        icon: Palette,           keywords: ["theme", "colors", "logo", "favicon"] },
      { to: "/admin/social-layout", label: "Layout",        icon: LayoutGrid,        keywords: ["layout", "sidebar", "widgets"] },
      { to: "/admin/seo",           label: "SEO",           icon: Search,            keywords: ["seo", "meta", "sitemap"] },
      { to: "/admin/ads-scripts",   label: "Ads & Scripts", icon: Megaphone,         keywords: ["ads", "adsense", "scripts", "header", "footer", "tracking", "analytics", "pixel"] },
    ],
  },

  {
    label: "Manage Features", icon: Puzzle, children: [
      { to: "/admin/modules",     label: "Modules",     icon: Puzzle,    keywords: ["features", "toggles"] },
      { to: "/admin/economy",     label: "Rewards",     icon: Coins,     keywords: ["xp", "coins", "shop", "missions", "streaks"] },
      { to: "/admin/retention",   label: "Retention",   icon: Flame,     keywords: ["streaks", "momentum", "loyalty", "energy", "decay", "engagement"] },
      { to: "/admin/automation",  label: "Automation",  icon: Zap,       keywords: ["rules", "auto"] },
      { to: "/admin/ai-settings", label: "AI Settings", icon: Sparkles,  badge: "Soon", keywords: ["ai"] },
      { to: "/admin/bots",        label: "Chat Bots",   icon: Bot,       keywords: ["fish", "trivia", "commands"] },
    ],
  },

  {
    label: "Community", icon: MessageSquare, children: [
      { to: "/admin/chatrooms",   label: "Chatrooms",    icon: MessageSquare, keywords: ["chat", "rooms"] },
      { to: "/admin/social-feed", label: "Feed",         icon: Newspaper,     keywords: ["posts", "social"] },
      { to: "/admin/games",       label: "Games",        icon: Gamepad2,      keywords: ["mini-games"] },
      { to: "/admin/pages",       label: "Custom Pages", icon: FileText,      keywords: ["cms", "landing"] },
    ],
  },

  {
    label: "Users", icon: Users2, children: [
      { to: "/admin/users", label: "All Users", icon: Users2,  keywords: ["members", "accounts"] },
      { to: "/admin/roles", label: "Roles",     icon: Shield,  keywords: ["permissions", "admin", "moderator"] },
    ],
  },

  {
    label: "Moderation", icon: Gavel, children: [
      { to: "/admin/moderation", label: "Bans & Mutes", icon: Gavel,   keywords: ["bans", "mutes"] },
      { to: "/admin/reports",    label: "Reports",      icon: Flag,    keywords: ["queue", "abuse"] },
      { to: "/admin/filters",    label: "Word Filters", icon: Filter,  keywords: ["blocklist", "words"] },
    ],
  },

  { label: "Reports",  icon: BarChart3, to: "/admin/analytics" },
  { label: "Upcoming", icon: Rocket,    to: "/admin/upcoming", badge: "Soon" },

  {
    label: "Tools", icon: Wrench, advanced: true, children: [
      { to: "/admin/security",    label: "Security",    icon: Lock,     badge: "Soon", advanced: true,                   keywords: ["captcha", "rate", "sessions"] },
      { to: "/admin/performance", label: "Performance", icon: Activity, advanced: true,                                  keywords: ["cache", "cdn"] },
      { to: "/admin/system",      label: "System",      icon: Server,   advanced: true, superOnly: true,                 keywords: ["database", "jobs"] },
      { to: "/admin/api",         label: "API & Webhooks", icon: KeyRound, advanced: true, superOnly: true,              keywords: ["api", "keys", "webhooks"] },
    ],
  },
];

// Flat list (for search + matching current path → group)
export interface FlatAdminItem extends AdminLeaf {
  groupLabel: string;
}
export function flattenAdminNav(nav: AdminGroup[] = ADMIN_NAV): FlatAdminItem[] {
  const out: FlatAdminItem[] = [];
  for (const g of nav) {
    if (g.to && !g.children) {
      out.push({ to: g.to, label: g.label, icon: g.icon, groupLabel: g.label, advanced: g.advanced, superOnly: g.superOnly, badge: g.badge });
    }
    for (const c of g.children ?? []) {
      out.push({ ...c, groupLabel: g.label, advanced: c.advanced ?? g.advanced, superOnly: c.superOnly ?? g.superOnly });
    }
  }
  return out;
}
