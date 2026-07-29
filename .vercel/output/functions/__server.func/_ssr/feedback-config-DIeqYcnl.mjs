import { C as CircleQuestionMark, S as Shield, Z as Zap, P as Palette, a as Sparkles, L as Lightbulb, B as Bug } from "../_libs/lucide-react.mjs";
const CATEGORY_META = {
  bug: { label: "Bug Report", icon: Bug, tone: "text-rose-500" },
  feature: { label: "Feature Request", icon: Lightbulb, tone: "text-amber-500" },
  improvement: { label: "Improvement", icon: Sparkles, tone: "text-indigo-500" },
  ui: { label: "UI Issue", icon: Palette, tone: "text-violet-500" },
  performance: { label: "Performance Issue", icon: Zap, tone: "text-sky-500" },
  security: { label: "Security Concern", icon: Shield, tone: "text-emerald-500" },
  other: { label: "Other", icon: CircleQuestionMark, tone: "text-muted-foreground" }
};
const STATUS_META = {
  open: { label: "Open", tone: "bg-blue-500/15 text-blue-600 dark:text-blue-300" },
  investigating: { label: "Under Review", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  planned: { label: "Planned", tone: "bg-purple-500/15 text-purple-600 dark:text-purple-300" },
  in_progress: { label: "In Progress", tone: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  fixed: { label: "Completed", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  closed: { label: "Closed", tone: "bg-muted text-muted-foreground" },
  rejected: { label: "Rejected", tone: "bg-rose-500/15 text-rose-600 dark:text-rose-300" }
};
const PRIORITY_META = {
  low: { label: "Low", tone: "text-muted-foreground" },
  normal: { label: "Normal", tone: "text-foreground" },
  high: { label: "High", tone: "text-amber-500" },
  critical: { label: "Critical", tone: "text-rose-500" }
};
const FEEDBACK_DEFAULTS = {
  enabled: true,
  allowGuestSubmit: false,
  allowComments: true,
  allowUpvotes: true,
  allowScreenshots: true,
  allowAnonymous: true,
  duplicateDetection: true,
  rewardOnSubmit: { xp: 5, coins: 2 },
  rewardOnFixed: { xp: 25, coins: 15 },
  notifyOnStatusChange: true,
  showcaseOnHome: true,
  showcaseOnSignup: true,
  showcaseLimit: 6,
  showcaseTitle: "What our community is saying"
};
const FEEDBACK_CATEGORIES = ["bug", "feature", "improvement", "ui", "performance", "security", "other"];
const FEEDBACK_STATUSES = ["open", "investigating", "planned", "in_progress", "fixed", "closed", "rejected"];
export {
  CATEGORY_META as C,
  FEEDBACK_DEFAULTS as F,
  PRIORITY_META as P,
  STATUS_META as S,
  FEEDBACK_STATUSES as a,
  FEEDBACK_CATEGORIES as b
};
