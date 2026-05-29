import type { ModulesFlags } from "@/lib/app-settings";
import {
  MessageSquare, Gamepad2, Wallet, ImageIcon, Sparkles, Award,
  Smile, Mic, Bell, Flame, UserPlus, Heart,
} from "lucide-react";

export interface ModuleDef {
  key: keyof ModulesFlags;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "social" | "engagement" | "media" | "system";
}

export const MODULE_REGISTRY: ModuleDef[] = [
  { key: "feed",         label: "Social Feed",   description: "Posts, comments and timeline.",         icon: MessageSquare, group: "social" },
  { key: "games",        label: "Games",         description: "In-app mini games and competitions.",   icon: Gamepad2,      group: "engagement" },
  { key: "wallet",       label: "Wallet",        description: "Coins, balance and transactions.",      icon: Wallet,        group: "system" },
  { key: "gif",          label: "GIF System",    description: "GIF picker inside chat & feed.",        icon: ImageIcon,     group: "media" },
  { key: "ai",           label: "AI Tools",      description: "AI assistant & generators.",            icon: Sparkles,      group: "system" },
  { key: "badges",       label: "Badges",        description: "Achievements and profile badges.",      icon: Award,         group: "engagement" },
  { key: "emojis",       label: "Emojis",        description: "Custom emoji packs.",                   icon: Smile,         group: "media" },
  { key: "voice",        label: "Voice Rooms",   description: "Realtime voice channels.",              icon: Mic,           group: "social" },
  { key: "notifications",label: "Notifications", description: "In-app and push notifications.",        icon: Bell,          group: "system" },
  { key: "reactions",    label: "Reactions",     description: "Quick reactions on posts & messages.",  icon: Heart,         group: "engagement" },
  { key: "streaks",      label: "Streaks",       description: "Daily login streaks.",                  icon: Flame,         group: "engagement" },
  { key: "referrals",    label: "Referrals",     description: "Invite & reward system.",               icon: UserPlus,      group: "engagement" },
];
