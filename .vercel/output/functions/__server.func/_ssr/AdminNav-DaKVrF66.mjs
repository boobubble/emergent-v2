import { aQ as LayoutDashboard, aR as SlidersHorizontal, H as House, P as Palette, aS as ShieldAlert, aT as LayoutGrid, N as Search, aU as Link2, M as Megaphone, aG as Youtube, aV as Languages, p as Settings, aW as Puzzle, aB as Crown, Y as Coins, O as Trophy, F as Flame, Z as Zap, v as Bot, a as Sparkles, aX as PhoneCall, g as MessageSquare, ay as Newspaper, V as Vote, o as Gamepad2, aY as MessageSquareHeart, ac as Disc3, aZ as FileText, a_ as ScrollText, a$ as ChartColumn, B as Bug, J as UsersRound, S as Shield, s as UserPlus, aw as Gavel, b0 as Flag, b1 as Funnel, b2 as Rocket, x as Bell, b3 as MousePointerClick, b4 as Mail, b5 as History, b6 as KeyRound, b7 as ListOrdered, b8 as Server, i as Radio, b9 as Database, ba as HardDrive, aC as Activity, bb as WandSparkles, bc as PowerOff, bd as RefreshCw, a2 as Gift, aI as Download, W as Lock, be as Wrench } from "../_libs/lucide-react.mjs";
const ADMIN_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { to: "/admin/general", label: "General", icon: SlidersHorizontal, keywords: ["site name", "tagline", "basics"] },
      { to: "/admin/landing", label: "Landing Pages", icon: House, keywords: ["landing", "home", "homepage", "welcome", "hero", "heropage", "marketing", "public", "tabs"] },
      { to: "/admin/appearance", label: "Themes", icon: Palette, keywords: ["theme", "colors", "logo", "favicon"] },
      { to: "/admin/branding-check", label: "White Label Checker", icon: ShieldAlert, keywords: ["white label", "branding", "audit", "checker", "score", "readiness", "whitelabel"] },
      { to: "/admin/social-layout", label: "Layout", icon: LayoutGrid, keywords: ["layout", "sidebar", "widgets"] },
      { to: "/admin/feed-themes", label: "Feed Themes", icon: Palette, keywords: ["feed", "skins", "themes", "store", "coins", "premium", "layout"] },
      { to: "/admin/chat-themes", label: "Chatroom Themes", icon: Palette, keywords: ["chatroom", "chat", "skins", "themes", "store", "coins", "premium", "override", "event", "layout"] },
      { to: "/admin/seo", label: "SEO Manager", icon: Search, keywords: ["seo", "meta", "sitemap", "robots", "og", "twitter", "keywords", "canonical"] },
      { to: "/admin/search", label: "Search", icon: Search, keywords: ["search", "universal", "sources", "users", "poems", "mehfil", "battles", "categories", "toggle"] },
      { to: "/admin/internal-linking", label: "Internal Linking", icon: Link2, keywords: ["internal links", "seo hub", "linking", "cornerstone", "orphan", "anchors", "targets"] },
      { to: "/admin/ads-scripts", label: "Ads & Scripts", icon: Megaphone, keywords: ["ads", "adsense", "scripts", "header", "footer", "tracking", "analytics", "pixel"] },
      { to: "/admin/ad-placements", label: "Ad Placements", icon: Megaphone, keywords: ["ads", "placement", "monetization", "feed", "chatroom", "dm", "profile", "games", "banner", "sponsor", "affiliate", "premium", "guest"] },
      { to: "/admin/media-apis", label: "Media APIs", icon: Youtube, keywords: ["youtube", "giphy", "gif", "video", "embed", "api keys"] },
      { to: "/admin/languages", label: "Languages", icon: Languages, keywords: ["i18n", "language", "translation", "locale", "multilingual", "rtl"] }
    ]
  },
  {
    label: "Manage Features",
    icon: Puzzle,
    children: [
      { to: "/admin/modules", label: "Modules", icon: Puzzle, keywords: ["features", "toggles"] },
      { to: "/admin/subscriptions", label: "Subscriptions", icon: Crown, keywords: ["membership", "plans", "vip", "creator", "premium", "monetize", "pricing", "payments", "billing"] },
      { to: "/admin/economy", label: "Rewards", icon: Coins, keywords: ["xp", "coins", "shop", "missions", "streaks"] },
      { to: "/admin/progression", label: "Progression", icon: Trophy, keywords: ["levels", "unlocks", "permissions", "reputation", "creator", "ranks", "tiers", "gifting"] },
      { to: "/admin/retention", label: "Retention", icon: Flame, keywords: ["streaks", "momentum", "loyalty", "energy", "decay", "engagement"] },
      { to: "/admin/automation", label: "Automation", icon: Zap, keywords: ["rules", "auto"] },
      { to: "/admin/bots", label: "Chat Bots", icon: Bot, keywords: ["fish", "trivia", "commands"] },
      { to: "/admin/bot-events", label: "Bot Events", icon: Bot, keywords: ["fish", "dig", "wine", "event", "schedule", "global", "community", "golden", "cooldown"] },
      { to: "/admin/ai-chatbots", label: "AI Chat Bots", icon: Sparkles, keywords: ["ai", "openrouter", "gpt", "gemini", "claude", "auto reply", "assistant"] },
      { to: "/admin/boobubble", label: "AI Assistant", icon: Sparkles, keywords: ["assistant", "official", "verified", "welcome", "system", "bot", "boobubble"] },
      { to: "/admin/feedbot", label: "FeedBot", icon: Megaphone, keywords: ["feedbot", "bot", "announcements", "system", "feed", "auto", "digest", "summary"] },
      { to: "/admin/calls", label: "Call Settings", icon: PhoneCall, keywords: ["calls", "voice", "video", "audio", "livekit", "agora", "group call", "trio", "billing", "coins", "provider"] },
      { to: "/admin/voice-notes", label: "Voice Notes", icon: PhoneCall, keywords: ["voice", "note", "mic", "recording", "audio", "lobby", "dm", "trio", "duration"] }
    ]
  },
  {
    label: "Community",
    icon: MessageSquare,
    children: [
      { to: "/admin/chatrooms", label: "Chatrooms", icon: MessageSquare, keywords: ["chat", "rooms"] },
      { to: "/admin/social-feed", label: "Feed", icon: Newspaper, keywords: ["posts", "social"] },
      { to: "/admin/poll-widget", label: "Poll Widget", icon: Vote, keywords: ["poll", "polls", "vote", "voting", "chatroom widget", "discovery", "trending poll", "poll of the day"] },
      { to: "/admin/discovery-widgets", label: "Discovery Widgets", icon: Sparkles, keywords: ["discovery", "widgets", "feed", "promotion", "modules", "hall of fame", "poetry", "battle hub", "leaderboard", "feedback", "cta", "rotation"] },
      { to: "/admin/games", label: "Games", icon: Gamepad2, keywords: ["mini-games"] },
      { to: "/admin/confessions", label: "Confessions", icon: MessageSquareHeart, keywords: ["confess", "anonymous", "secrets", "community"] },
      { to: "/admin/stickers", label: "Stickers & Emojis", icon: Sparkles, keywords: ["stickers", "sticker", "emoji", "emojis", "animated", "gif", "webp", "apng", "upload", "custom", "pack"] },
      { to: "/broadcaster", label: "Broadcaster Studio", icon: Disc3, keywords: ["broadcaster", "studio", "music", "dj", "rj", "player", "radio", "live", "audio", "stream", "youtube", "widgets", "queue", "mic", "schedule", "announcements"] },
      { to: "/admin/pages", label: "Custom Pages", icon: FileText, keywords: ["cms", "landing"] },
      { to: "/admin/competitions", label: "Competitions", icon: Trophy, keywords: ["competitions", "voting", "contest", "winners", "rewards", "category", "categories", "feed", "bot", "announcements", "analytics", "stats", "metrics"] },
      { to: "/admin/mehfil", label: "Poetry Hub (Poetry)", icon: ScrollText, keywords: ["mehfil", "poetry", "poem", "verse", "writer", "battle", "hall of fame"] },
      { to: "/admin/community-verification", label: "Community Verification", icon: ShieldAlert, keywords: ["community", "verification", "verified", "official", "partner", "trusted", "badges", "trust"] },
      { to: "/admin/premium-slugs", label: "Premium URLs", icon: Link2, keywords: ["premium", "slug", "url", "vanity", "custom", "community", "claim", "reserved"] },
      { to: "/admin/community-reports", label: "Community Reports", icon: ChartColumn, keywords: ["community", "reports", "analytics", "stats", "totals", "archived", "verified", "top", "featured"] },
      { to: "/admin/feedback", label: "Feedback", icon: Bug, keywords: ["bug", "bugs", "feedback", "feature request", "ui issue", "performance", "security", "reports"] }
    ]
  },
  {
    label: "Users",
    icon: UsersRound,
    children: [
      { to: "/admin/users", label: "All Users", icon: UsersRound, keywords: ["members", "accounts"] },
      { to: "/admin/roles", label: "Roles", icon: Shield, keywords: ["permissions", "admin", "moderator"] },
      { to: "/admin/signup-access", label: "Sign-Up Access", icon: UserPlus, keywords: ["signup", "sign up", "registration", "new accounts", "stop signup", "disable signup", "block"] },
      { to: "/admin/auth-background", label: "Login Background", icon: Sparkles, keywords: ["auth", "authentication", "login", "signup", "background", "live community", "blur", "glassmorphism", "stats"] }
    ]
  },
  {
    label: "Moderation",
    icon: Gavel,
    children: [
      { to: "/admin/moderation", label: "Bans & Mutes", icon: Gavel, keywords: ["bans", "mutes"] },
      { to: "/admin/staff-permissions", label: "Staff Permissions", icon: Shield, keywords: ["moderator", "kick", "mute", "ban", "permissions", "toggle"] },
      { to: "/admin/reports", label: "Reports", icon: Flag, keywords: ["queue", "abuse"] },
      { to: "/admin/filters", label: "Word Filters", icon: Funnel, keywords: ["blocklist", "words"] },
      { to: "/admin/safety", label: "Safety Review", icon: ShieldAlert, keywords: ["safety", "moderation", "auto", "detection", "harmful", "illegal", "extremist", "violence", "threats", "keywords", "flagged"] },
      { to: "/admin/abuse-protection", label: "Abuse Protection", icon: ShieldAlert, keywords: ["rate limit", "abuse", "spam", "throttle", "flood", "429", "bans", "temporary", "restrictions", "offenders"] },
      { to: "/admin/feed-moderation", label: "Feed Moderation", icon: ShieldAlert, keywords: ["feed", "queue", "reports", "ai", "images", "nudity", "posts", "comments", "spam", "duplicates"] },
      { to: "/admin/trust-safety", label: "Trust & Safety", icon: Shield, keywords: ["trust", "safety", "dm", "privacy", "message requests", "bad words", "url filter", "violations", "penalties", "unlock", "level", "score"] }
    ]
  },
  { label: "Reports", icon: ChartColumn, to: "/admin/analytics" },
  { label: "Upcoming", icon: Rocket, to: "/admin/upcoming", badge: "Soon" },
  {
    label: "Communications",
    icon: Megaphone,
    children: [
      { to: "/admin/announcements", label: "Announcements", icon: Bell, keywords: ["banner", "broadcast", "notice"] },
      { to: "/admin/popups", label: "Popups", icon: MousePointerClick, keywords: ["modal", "welcome", "cta"] },
      { to: "/admin/email", label: "Email & SMTP", icon: Mail, keywords: ["smtp", "email", "templates", "notifications"] }
    ]
  },
  {
    label: "Logs",
    icon: ScrollText,
    children: [
      { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, keywords: ["admin", "actions", "history", "mod_logs"] },
      { to: "/admin/activity-logs", label: "User Activity", icon: History, keywords: ["login", "sessions", "devices", "ip"] }
    ]
  },
  {
    label: "System",
    icon: Server,
    advanced: true,
    superOnly: true,
    children: [
      { to: "/admin/error-logs", label: "Error Logs", icon: Bug, keywords: ["error", "crash", "client", "stack", "runtime", "monitoring"] },
      { to: "/admin/api", label: "API Logs", icon: KeyRound, keywords: ["api", "webhooks", "requests"] },
      { to: "/admin/activity-logs", label: "Auth Logs", icon: History, keywords: ["auth", "login", "sessions"] },
      { to: "/admin/system/queue", label: "Queue Status", icon: ListOrdered, keywords: ["queue", "jobs", "background"] },
      { to: "/admin/system/jobs", label: "Background Jobs", icon: Server, keywords: ["cron", "scheduled", "workers"] },
      { to: "/admin/realtime", label: "Realtime Status", icon: Radio, keywords: ["websocket", "presence", "live"] },
      { to: "/admin/system/database", label: "Database Health", icon: Database, keywords: ["database", "postgres", "schema"] },
      { to: "/admin/system/storage", label: "Storage Health", icon: HardDrive, keywords: ["storage", "bucket", "media"] },
      { to: "/admin/performance", label: "Performance Metrics", icon: Activity, keywords: ["performance", "cache", "latency"] },
      { to: "/admin/system", label: "Installer & Backend", icon: Server, keywords: ["installer", "system", "reset"] }
    ]
  },
  {
    label: "Tools",
    icon: Wrench,
    advanced: true,
    children: [
      { to: "/admin/setup-wizard", label: "Setup Wizard", icon: WandSparkles, keywords: ["onboarding", "first run", "wizard"] },
      { to: "/admin/demo", label: "Demo Data", icon: Database, keywords: ["import", "reset", "seed", "sample"] },
      { to: "/admin/maintenance", label: "Maintenance", icon: PowerOff, keywords: ["offline", "downtime"] },
      { to: "/admin/cache", label: "Cache", icon: RefreshCw, keywords: ["cache", "purge", "clear"] },
      { to: "/admin/referrals", label: "Referrals", icon: Gift, keywords: ["invite", "referral", "reward"] },
      { to: "/admin/export", label: "Export", icon: Download, keywords: ["csv", "excel", "download"] },
      { to: "/admin/security", label: "Security", icon: Lock, badge: "Soon", advanced: true, keywords: ["captcha", "rate", "sessions"] },
      { to: "/admin/performance", label: "Performance", icon: Activity, advanced: true, keywords: ["cache", "cdn"] },
      { to: "/admin/realtime", label: "Realtime", icon: Radio, advanced: true, keywords: ["websocket", "presence", "live"] },
      { to: "/admin/updates", label: "Updates", icon: Sparkles, superOnly: true, keywords: ["update", "upgrade", "version", "release", "changelog", "migration"] },
      { to: "/admin/backup", label: "Backup", icon: Download, superOnly: true, keywords: ["backup", "restore", "database", "media", "zip"] },
      { to: "/admin/api", label: "API & Webhooks", icon: KeyRound, advanced: true, superOnly: true, keywords: ["api", "keys", "webhooks"] },
      { to: "/admin/licenses", label: "Licenses", icon: KeyRound, superOnly: true, keywords: ["license", "licenses", "envato", "codester", "codecanyon", "activation", "purchase code"] }
    ]
  }
];
function flattenAdminNav(nav = ADMIN_NAV) {
  const out = [];
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
export {
  ADMIN_NAV as A,
  flattenAdminNav as f
};
