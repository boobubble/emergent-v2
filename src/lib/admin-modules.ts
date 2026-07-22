import type { ModulesFlags } from "@/lib/app-settings";
import {
  MessageSquare, Gamepad2, Wallet, ImageIcon, Sparkles, Award,
  Smile, Mic, Bell, Flame, UserPlus, Heart, Laugh, Trophy, Tag,
  Palette, Camera, Film, PartyPopper, Sparkle, ScrollText,
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
  { key: "competitionMemes",    label: "Competition Memes",     description: "Let users tag Feed memes with a competition.",           icon: Laugh,   group: "engagement" },
  { key: "nomineeMemeTagging",  label: "Nominee Meme Tagging",  description: "Show meme counts on nominee cards and allow supporting a nominee.", icon: Tag,     group: "engagement" },
  { key: "trendingMemeSection", label: "Trending Meme Section", description: "Show the 😂 Trending Battle Memes carousel on competition pages.",  icon: Trophy,  group: "engagement" },
  { key: "funZone",             label: "Fun Zone",              description: "Master switch for the 🎉 Fun Zone hub on competition pages.",     icon: PartyPopper, group: "engagement" },
  { key: "funZoneMemes",        label: "Fun Zone · Memes",      description: "Show the 😂 Memes card inside the Fun Zone.",                     icon: Laugh,   group: "engagement" },
  { key: "funZoneFanArts",      label: "Fun Zone · Fan Arts",   description: "Show the 🎨 Fan Arts card inside the Fun Zone.",                  icon: Palette, group: "engagement" },
  { key: "funZonePosters",      label: "Fun Zone · Posters",    description: "Show the 📸 Campaign Posters card inside the Fun Zone.",          icon: Camera,  group: "engagement" },
  { key: "funZoneFanEdits",     label: "Fun Zone · Fan Edits",  description: "Show the 🎥 Fan Edits card inside the Fun Zone.",                 icon: Film,    group: "engagement" },
  { key: "battleRecap",         label: "Battle Recap",          description: "Enable the premium recap page for completed competitions.",       icon: ScrollText, group: "engagement" },
  { key: "autoAwards",          label: "Auto Fun Zone Awards",  description: "Auto-select Meme / Fan Art / Poster winner on competition finish.", icon: Sparkle, group: "engagement" },
];
