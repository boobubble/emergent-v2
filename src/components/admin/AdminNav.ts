import {
  LayoutDashboard, Settings, Palette, LayoutGrid, Puzzle, Shield,
  Lock, Search, Coins, Gavel, Gamepad2, Sparkles, BarChart3, Bot, Users2,
  FileText, MessageSquare, Newspaper,
} from "lucide-react";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "Overview" | "Configuration" | "Advanced";
  badge?: string;
  description?: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin",               label: "Dashboard",     icon: LayoutDashboard, group: "Overview" },
  { to: "/admin/analytics",     label: "Analytics",     icon: BarChart3,       group: "Overview" },
  { to: "/admin/chatrooms",     label: "Chatrooms",     icon: MessageSquare,   group: "Overview", description: "All chatroom & platform settings." },
  { to: "/admin/social-feed",   label: "Social Feed",   icon: Newspaper,       group: "Overview", description: "Social feed settings (coming soon)." },

  { to: "/admin/general",       label: "General",       icon: Settings,        group: "Configuration", description: "App name, defaults and basics." },
  { to: "/admin/appearance",    label: "Appearance",    icon: Palette,         group: "Configuration", description: "Theme, colors and branding." },
  { to: "/admin/social-layout", label: "Social Layout", icon: LayoutGrid,      group: "Configuration", description: "Feed layout and widget controls." },
  { to: "/admin/modules",       label: "Modules",       icon: Puzzle,          group: "Configuration", description: "Enable or disable platform modules." },
  { to: "/admin/roles",         label: "Roles",         icon: Shield,          group: "Configuration", description: "Admin and moderator roles." },

  { to: "/admin/security",      label: "Security",      icon: Lock,            group: "Advanced", badge: "Soon", description: "Authentication and protection." },
  { to: "/admin/seo",           label: "SEO",           icon: Search,          group: "Advanced", description: "Sitemap, meta defaults and indexing." },
  { to: "/admin/pages",         label: "Custom Pages",  icon: FileText,        group: "Advanced", description: "SEO-friendly landing pages CMS." },
  { to: "/admin/economy",       label: "Economy",       icon: Coins,           group: "Advanced", description: "XP, coins, shop pricing and rewards." },
  { to: "/admin/moderation",    label: "Moderation",    icon: Gavel,           group: "Advanced", description: "Bans, reports and word filters." },
  { to: "/admin/games",         label: "Games",         icon: Gamepad2,        group: "Advanced", description: "Enable and configure in-room games." },
  { to: "/admin/bots",          label: "Bots",          icon: Bot,             group: "Advanced", description: "Chat bots, names and messages." },
  { to: "/admin/fake-activity", label: "Fake Activity", icon: Users2,          group: "Advanced", description: "Simulated users, auto joins and reactions." },
  { to: "/admin/ai-settings",   label: "AI Settings",   icon: Sparkles,        group: "Advanced", badge: "Soon", description: "AI provider and prompts." },
];
