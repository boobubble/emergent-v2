import {
  LayoutDashboard, Settings, Palette, LayoutGrid, Puzzle, Shield,
  Lock, Search, Coins, Gavel, Gamepad2, Sparkles, BarChart3, Bot, Users2,
  FileText, MessageSquare, Newspaper,
} from "lucide-react";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "Overview" | "Platform" | "Chatrooms" | "Social Feed" | "Advanced";
  badge?: string;
  /** Short description shown on hub landing pages. */
  description?: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  // Overview
  { to: "/admin",               label: "Dashboard",      icon: LayoutDashboard, group: "Overview" },
  { to: "/admin/analytics",     label: "Analytics",      icon: BarChart3,       group: "Overview" },

  // Hubs (Chatrooms & Social Feed landing pages)
  { to: "/admin/chatrooms",     label: "Chatrooms",      icon: MessageSquare,   group: "Overview", description: "Rooms, bots, games and chat moderation." },
  { to: "/admin/social-feed",   label: "Social Feed",    icon: Newspaper,       group: "Overview", description: "Posts feed, layout, pages and rewards." },

  // Platform (shared across both)
  { to: "/admin/general",       label: "General",        icon: Settings,        group: "Platform" },
  { to: "/admin/appearance",    label: "Appearance",     icon: Palette,         group: "Platform" },
  { to: "/admin/modules",       label: "Modules",        icon: Puzzle,          group: "Platform" },
  { to: "/admin/roles",         label: "Roles",          icon: Shield,          group: "Platform" },
  { to: "/admin/security",      label: "Security",       icon: Lock,            group: "Platform", badge: "Soon" },
  { to: "/admin/seo",           label: "SEO",            icon: Search,          group: "Platform" },
  { to: "/admin/ai-settings",   label: "AI Settings",    icon: Sparkles,        group: "Platform", badge: "Soon" },

  // Chatrooms section
  { to: "/admin/moderation",    label: "Moderation",     icon: Gavel,           group: "Chatrooms", description: "Bans, mutes, reports and word filters." },
  { to: "/admin/games",         label: "Games",          icon: Gamepad2,        group: "Chatrooms", description: "Enable, configure and monitor in-room games." },
  { to: "/admin/bots",          label: "Bots",           icon: Bot,             group: "Chatrooms", description: "Chat bots, names, intervals and messages." },
  { to: "/admin/fake-activity", label: "Fake Activity",  icon: Users2,          group: "Chatrooms", description: "Simulated users, auto joins and reactions." },

  // Social Feed section
  { to: "/admin/social-layout", label: "Social Layout",  icon: LayoutGrid,      group: "Social Feed", description: "Feed layout, widgets and composer." },
  { to: "/admin/pages",         label: "Custom Pages",   icon: FileText,        group: "Social Feed", description: "SEO-friendly landing pages and redirects." },
  { to: "/admin/economy",       label: "Economy",        icon: Coins,           group: "Social Feed", description: "XP, coins, shop pricing and rewards." },
];
