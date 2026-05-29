import {
  LayoutDashboard, Settings, Palette, LayoutGrid, Puzzle, Shield,
  Lock, Search, Coins, Gavel, Gamepad2, Sparkles, BarChart3, Bot, Users2,
} from "lucide-react";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "Overview" | "Configuration" | "Advanced";
  badge?: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin",               label: "Dashboard",     icon: LayoutDashboard, group: "Overview" },
  { to: "/admin/analytics",     label: "Analytics",     icon: BarChart3,       group: "Overview" },
  { to: "/admin/general",       label: "General",       icon: Settings,        group: "Configuration" },
  { to: "/admin/appearance",    label: "Appearance",    icon: Palette,         group: "Configuration" },
  { to: "/admin/social-layout", label: "Social Layout", icon: LayoutGrid,      group: "Configuration" },
  { to: "/admin/modules",       label: "Modules",       icon: Puzzle,          group: "Configuration" },
  { to: "/admin/roles",         label: "Roles",         icon: Shield,          group: "Configuration" },
  { to: "/admin/security",      label: "Security",      icon: Lock,            group: "Advanced", badge: "Soon" },
  { to: "/admin/seo",           label: "SEO",           icon: Search,          group: "Advanced" },
  { to: "/admin/economy",       label: "Economy",       icon: Coins,           group: "Advanced" },
  { to: "/admin/moderation",    label: "Moderation",    icon: Gavel,           group: "Advanced" },
  { to: "/admin/games",         label: "Games",         icon: Gamepad2,        group: "Advanced" },
  { to: "/admin/bots",          label: "Bots",          icon: Bot,             group: "Advanced" },
  { to: "/admin/fake-activity", label: "Fake Activity", icon: Users2,          group: "Advanced" },
  { to: "/admin/ai-settings",   label: "AI Settings",   icon: Sparkles,        group: "Advanced", badge: "Soon" },
];
