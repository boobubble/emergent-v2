import { Bug, Lightbulb, Sparkles, Palette, Zap, Shield, HelpCircle, type LucideIcon } from "lucide-react";

export type FeedbackCategory = "bug" | "feature" | "improvement" | "ui" | "performance" | "security" | "other";
export type FeedbackStatus =
  | "open" | "investigating" | "planned" | "in_progress" | "fixed" | "closed" | "rejected";
export type FeedbackPriority = "low" | "normal" | "high" | "critical";

export const CATEGORY_META: Record<FeedbackCategory, { label: string; icon: LucideIcon; tone: string }> = {
  bug:         { label: "Bug Report",        icon: Bug,         tone: "text-rose-500" },
  feature:     { label: "Feature Request",   icon: Lightbulb,   tone: "text-amber-500" },
  improvement: { label: "Improvement",       icon: Sparkles,    tone: "text-indigo-500" },
  ui:          { label: "UI Issue",          icon: Palette,     tone: "text-violet-500" },
  performance: { label: "Performance Issue", icon: Zap,         tone: "text-sky-500" },
  security:    { label: "Security Concern",  icon: Shield,      tone: "text-emerald-500" },
  other:       { label: "Other",             icon: HelpCircle,  tone: "text-muted-foreground" },
};

export const STATUS_META: Record<FeedbackStatus, { label: string; tone: string }> = {
  open:          { label: "Open",          tone: "bg-blue-500/15 text-blue-600 dark:text-blue-300" },
  investigating: { label: "Under Review",  tone: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  planned:       { label: "Planned",       tone: "bg-purple-500/15 text-purple-600 dark:text-purple-300" },
  in_progress:   { label: "In Progress",   tone: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  fixed:         { label: "Completed",     tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  closed:        { label: "Closed",        tone: "bg-muted text-muted-foreground" },
  rejected:      { label: "Rejected",      tone: "bg-rose-500/15 text-rose-600 dark:text-rose-300" },
};

export const PRIORITY_META: Record<FeedbackPriority, { label: string; tone: string }> = {
  low:      { label: "Low",      tone: "text-muted-foreground" },
  normal:   { label: "Normal",   tone: "text-foreground" },
  high:     { label: "High",     tone: "text-amber-500" },
  critical: { label: "Critical", tone: "text-rose-500" },
};

export interface FeedbackConfig {
  enabled: boolean;
  allowGuestSubmit: boolean;
  allowComments: boolean;
  allowUpvotes: boolean;
  allowScreenshots: boolean;
  allowAnonymous: boolean;
  duplicateDetection: boolean;
  rewardOnSubmit: { xp: number; coins: number };
  rewardOnFixed:  { xp: number; coins: number };
  notifyOnStatusChange: boolean;
  showcaseOnHome: boolean;
  showcaseOnSignup: boolean;
  showcaseLimit: number;
  showcaseTitle: string;
}

export const FEEDBACK_DEFAULTS: FeedbackConfig = {
  enabled: true,
  allowGuestSubmit: false,
  allowComments: true,
  allowUpvotes: true,
  allowScreenshots: true,
  allowAnonymous: true,
  duplicateDetection: true,
  rewardOnSubmit: { xp: 5, coins: 2 },
  rewardOnFixed:  { xp: 25, coins: 15 },
  notifyOnStatusChange: true,
  showcaseOnHome: true,
  showcaseOnSignup: true,
  showcaseLimit: 6,
  showcaseTitle: "What our community is saying",
};

export const FEEDBACK_CATEGORIES: FeedbackCategory[] =
  ["bug", "feature", "improvement", "ui", "performance", "security", "other"];

export const FEEDBACK_STATUSES: FeedbackStatus[] =
  ["open", "investigating", "planned", "in_progress", "fixed", "closed", "rejected"];
