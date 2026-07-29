import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { g as useChat, Q as BADGES, S as TIER_COLOR, u as useAppSettings, b as useServerFn, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, f as DialogDescription } from "./router-CYWPFaDK.mjs";
import { P as PROGRESSION_DEFAULTS, U as UNLOCKS, r as resolveUnlock } from "./progression-config-C9tZ2eSd.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { g as getTodayMissions, c as claimMission } from "./missions.functions-CjvjLerV.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { a as Sparkles, O as Trophy, m as Award, a1 as Target, b2 as Rocket, bz as CircleCheck, a6 as ChevronRight, W as Lock, a0 as LoaderCircle, F as Flame, Z as Zap, z as Check, a2 as Gift, Y as Coins } from "../_libs/lucide-react.mjs";
import { o as objectType, e as enumType } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./client-H8IXbXWR.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./feedback-config-DIeqYcnl.mjs";
import "./app-version-8YDb-xNu.mjs";
import "../_libs/i18next-http-backend.mjs";
import "./client.server-BXCYxJZY.mjs";
import "./env.server-Bcmcot3M.mjs";
import "./sitemap-Dl8Aqg_O.mjs";
import "./reserved-routes-BWsWje6t.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "./mehfil-types-okfUX99d.mjs";
import "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "../_libs/react-i18next.mjs";
import "../_libs/use-sync-external-store.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
function mergeDeep(base, override) {
  if (!override) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(override)) {
    const v = override[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = mergeDeep(base[k] ?? {}, v);
    } else if (v !== void 0) {
      out[k] = v;
    }
  }
  return out;
}
function useProgressionConfig() {
  const { raw } = useAppSettings();
  return reactExports.useMemo(
    () => mergeDeep(PROGRESSION_DEFAULTS, raw.progression),
    [raw]
  );
}
const XP_PER_LEVEL = 50;
const JOURNEY_STAGES = [
  { id: "explorer", emoji: "🌱", name: "Explorer", minLevel: 1, accent: "from-emerald-500/20 to-teal-500/10 text-emerald-700 dark:text-emerald-300", description: "Browse the platform and get familiar with the community." },
  { id: "socializer", emoji: "🤝", name: "Socializer", minLevel: 5, accent: "from-sky-500/20 to-indigo-500/10 text-sky-700 dark:text-sky-300", description: "React, reply and connect with other members." },
  { id: "creator", emoji: "✍", name: "Creator", minLevel: 10, accent: "from-violet-500/20 to-purple-500/10 text-violet-700 dark:text-violet-300", description: "Publish posts, polls and poetry to the community." },
  { id: "challenger", emoji: "⚔", name: "Challenger", minLevel: 20, accent: "from-orange-500/20 to-amber-500/10 text-orange-700 dark:text-orange-300", description: "Enter competitions, battles and community events." },
  { id: "champion", emoji: "🏆", name: "Champion", minLevel: 50, accent: "from-yellow-500/25 to-amber-500/10 text-yellow-700 dark:text-yellow-300", description: "Earn recognition, veteran rooms and elite cosmetics." },
  { id: "legend", emoji: "👑", name: "Legend", minLevel: 100, accent: "from-fuchsia-500/25 to-violet-500/15 text-fuchsia-700 dark:text-fuchsia-200", description: "Platform-wide recognition and early access privileges." }
];
function stageForLevel(level) {
  let out = JOURNEY_STAGES[0];
  for (const s of JOURNEY_STAGES) if (level >= s.minLevel) out = s;
  return out;
}
function nextStage(level) {
  return JOURNEY_STAGES.find((s) => s.minLevel > level) ?? null;
}
function xpBreakdown(xp, level) {
  const floor = (level - 1) * XP_PER_LEVEL;
  const xpIntoLevel = Math.max(0, xp - floor);
  const xpForLevel = XP_PER_LEVEL;
  const xpToNext = Math.max(0, xpForLevel - xpIntoLevel);
  return {
    level,
    xp,
    xpIntoLevel,
    xpForLevel,
    xpToNext,
    pct: Math.min(100, Math.round(xpIntoLevel / xpForLevel * 100))
  };
}
function resolveAllUnlocks(userLevel, userXp, cfg) {
  return UNLOCKS.map((def) => {
    const { level, enabled } = resolveUnlock(def.key, cfg);
    const requiredXp = (level - 1) * XP_PER_LEVEL;
    const xpRemaining = Math.max(0, requiredXp - userXp);
    const unlocked = enabled && userLevel >= level;
    const progressPct = requiredXp <= 0 ? 100 : Math.min(100, Math.round(userXp / requiredXp * 100));
    return { def, requiredLevel: level, enabled, unlocked, xpRemaining, progressPct };
  });
}
function nextUnlock(userLevel, userXp, cfg) {
  const locked = resolveAllUnlocks(userLevel, userXp, cfg).filter((u) => u.enabled && !u.unlocked).sort((a, b) => a.requiredLevel - b.requiredLevel || a.xpRemaining - b.xpRemaining);
  return locked[0] ?? null;
}
function upcomingUnlocks(userLevel, userXp, cfg, count = 5) {
  return resolveAllUnlocks(userLevel, userXp, cfg).filter((u) => u.enabled && !u.unlocked).sort((a, b) => a.requiredLevel - b.requiredLevel).slice(0, count);
}
const DISCOVERY_MISSIONS = [
  { id: "upload_avatar", label: "Upload your avatar", description: "Give your profile a face.", cta: { label: "Edit profile", to: "/settings" }, done: (u) => Boolean(u.avatarUrl) },
  { id: "first_message", label: "Send your first message", description: "Say hi in any chatroom.", cta: { label: "Open chatrooms", to: "/chatrooms" }, done: (u) => (u.messageCount ?? 0) >= 1 },
  { id: "follow_creator", label: "Follow a creator", description: "Discover writers you love.", cta: { label: "Open Poetry", to: "/poetry" }, done: (u) => (u.friends?.length ?? 0) >= 1 },
  { id: "visit_hof", label: "Visit Hall of Fame", description: "See the platform's champions.", cta: { label: "Hall of Fame", to: "/hall-of-fame" }, done: () => false },
  { id: "visit_battle_hub", label: "Open the Battle Hub", description: "See what competitions are live.", cta: { label: "Battle Hub", to: "/competitions" }, done: () => false },
  { id: "read_poem", label: "Read a poem", description: "Explore the Poetry Hub.", cta: { label: "Open Poetry", to: "/poetry" }, done: () => false }
];
const getTodayChallenges = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).handler(createSsrRpc("9e21f6b52db7c210591546575a5cdec3139053f97c3e99931bbe7fda7757e396"));
const claimChallenge = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((i) => objectType({
  challengeId: enumType(["post", "react5", "comment3", "friend", "login"])
}).parse(i)).handler(createSsrRpc("3448df33adf161d13a6994b0d5897bc3a9618c7ea3aa14d6759593a4fec1041c"));
const HOW_TO_FOR_MISSION = {
  react_5: ["Open the Feed", "Tap ❤ on 5 different posts"],
  comment_3: ["Open any Feed post", "Leave a comment on 3 different posts"],
  chat_10: ["Open a chat room or DM", "Send 10 messages today"],
  post_1: ["Open the composer at the top of the Feed", "Publish 1 post"],
  engage_15: [
    "Publish or revive a post today",
    "Others react to or comment on it",
    "Reach 15 total engagements across your posts"
  ]
};
function JourneyDaily({ meId }) {
  const fetchMissions = useServerFn(getTodayMissions);
  const claimMissionFn = useServerFn(claimMission);
  const fetchChallenges = useServerFn(getTodayChallenges);
  const claimChallengeFn = useServerFn(claimChallenge);
  const [missions, setMissions] = reactExports.useState([]);
  const [challenges, setChallenges] = reactExports.useState([]);
  const [streak, setStreak] = reactExports.useState(0);
  const [longestStreak, setLongestStreak] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(true);
  const [claimingId, setClaimingId] = reactExports.useState(null);
  const [selected, setSelected] = reactExports.useState(null);
  const load = reactExports.useCallback(async () => {
    try {
      const [m, c] = await Promise.all([fetchMissions(), fetchChallenges()]);
      setMissions(m.missions);
      setChallenges(c.challenges);
      setStreak(c.streak ?? 0);
      setLongestStreak(c.longestStreak ?? 0);
    } catch (e) {
      console.error("journey daily load failed", e);
    } finally {
      setLoading(false);
    }
  }, [fetchMissions, fetchChallenges]);
  reactExports.useEffect(() => {
    void load();
  }, [load, meId]);
  reactExports.useEffect(() => {
    if (!selected) return;
    if (selected.kind === "mission") {
      const fresh = missions.find((m) => m.id === selected.item.id);
      if (fresh && fresh !== selected.item) setSelected({ kind: "mission", item: fresh });
    } else {
      const fresh = challenges.find((c) => c.id === selected.item.id);
      if (fresh && fresh !== selected.item) setSelected({ kind: "challenge", item: fresh });
    }
  }, [missions, challenges]);
  async function onClaimMission(id) {
    const target = missions.find((m) => m.id === id);
    if (!target || target.claimed || !target.completed) return;
    setClaimingId(id);
    setMissions((prev) => prev.map((m) => m.id === id ? { ...m, claimed: true } : m));
    try {
      const res = await claimMissionFn({ data: { missionId: id } });
      toast.success(`+${res.xp} XP · +${res.coins} coins`);
      void load();
    } catch (e) {
      setMissions((prev) => prev.map((m) => m.id === id ? { ...m, claimed: false } : m));
      toast.error(e instanceof Error ? e.message : "Could not claim");
    } finally {
      setClaimingId(null);
    }
  }
  async function onClaimChallenge(id) {
    const target = challenges.find((c) => c.id === id);
    if (!target || target.claimed || !target.completed) return;
    setClaimingId(id);
    setChallenges((prev) => prev.map((c) => c.id === id ? { ...c, claimed: true } : c));
    try {
      const res = await claimChallengeFn({ data: { challengeId: id } });
      toast.success(`+${res.xp} XP · +${res.coins} coins`);
      void load();
    } catch (e) {
      setChallenges((prev) => prev.map((c) => c.id === id ? { ...c, claimed: false } : c));
      toast.error(e instanceof Error ? e.message : "Could not claim");
    } finally {
      setClaimingId(null);
    }
  }
  const missionDone = missions.filter((m) => m.claimed).length;
  const challengeDone = challenges.filter((c) => c.completed).length;
  const totalXpAvailable = reactExports.useMemo(
    () => missions.filter((m) => !m.claimed).reduce((s, m) => s + m.xp, 0) + challenges.filter((c) => !c.claimed).reduce((s, c) => s + c.xp, 0),
    [missions, challenges]
  );
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center rounded-3xl border border-border bg-background/50 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StripStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3.5 w-3.5" }), label: "Missions", value: `${missionDone}/${missions.length}`, tone: "from-indigo-500/20 to-fuchsia-500/10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StripStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5" }), label: "Challenges", value: `${challengeDone}/${challenges.length}`, tone: "from-amber-500/20 to-rose-500/10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StripStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3.5 w-3.5" }), label: "Streak", value: `${streak}d${longestStreak > streak ? ` · best ${longestStreak}` : ""}`, tone: "from-orange-500/20 to-red-500/10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StripStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5" }), label: "XP up for grabs", value: `+${totalXpAvailable}`, tone: "from-amber-500/20 to-yellow-500/10" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Column,
        {
          title: "Daily Missions",
          subtitle: "Resets every 24h",
          accent: "from-indigo-500/25 via-fuchsia-500/15 to-transparent",
          badgeIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: missions.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ItemCard,
            {
              icon: m.icon,
              title: m.title,
              subtitle: m.description,
              progress: m.progress,
              goal: m.target,
              xp: m.xp,
              coins: m.coins,
              completed: m.completed,
              claimed: m.claimed,
              claiming: claimingId === m.id,
              onOpen: () => setSelected({ kind: "mission", item: m }),
              onClaim: () => onClaimMission(m.id)
            },
            m.id
          )) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Column,
        {
          title: "Daily Challenges",
          subtitle: "Scale with your level",
          accent: "from-amber-500/25 via-rose-500/15 to-transparent",
          badgeIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5" }),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: challenges.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ItemCard,
            {
              icon: c.emoji,
              title: c.title,
              subtitle: c.description,
              progress: c.progress,
              goal: c.goal,
              xp: c.xp,
              coins: c.coins,
              completed: c.completed,
              claimed: c.claimed,
              claiming: claimingId === c.id,
              onOpen: () => setSelected({ kind: "challenge", item: c }),
              onClaim: () => onClaimChallenge(c.id)
            },
            c.id
          )) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!selected, onOpenChange: (open) => !open && setSelected(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "max-w-md", children: selected && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DetailModal,
      {
        selection: selected,
        claiming: claimingId === selected.item.id,
        onClaim: () => {
          if (selected.kind === "mission") void onClaimMission(selected.item.id);
          else void onClaimChallenge(selected.item.id);
        }
      }
    ) }) })
  ] });
}
function StripStat({ icon, label, value, tone }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border border-border bg-gradient-to-br ${tone} p-2.5`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: [
      icon,
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-sm font-bold", children: value })
  ] });
}
function Column({ title, subtitle, accent, badgeIcon, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${accent} p-4`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-xl bg-background/70 text-primary shadow-sm", children: badgeIcon }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: subtitle })
      ] })
    ] }),
    children
  ] });
}
function ItemCard({
  icon,
  title,
  subtitle,
  progress,
  goal,
  xp,
  coins,
  completed,
  claimed,
  claiming,
  onOpen,
  onClaim
}) {
  const pct = Math.min(100, Math.round(progress / Math.max(goal, 1) * 100));
  const ready = completed && !claimed;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onOpen,
        className: `group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${claimed ? "border-emerald-500/30 bg-emerald-500/5" : ready ? "border-amber-400/50 bg-gradient-to-r from-amber-500/15 via-fuchsia-500/10 to-transparent shadow-sm hover:shadow-md" : "border-border bg-background/50 hover:bg-accent/40"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl ${claimed ? "bg-emerald-500/15" : ready ? "bg-amber-500/20" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: claimed ? "opacity-60 grayscale" : "", children: icon }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `truncate text-sm font-bold ${claimed ? "text-muted-foreground line-through" : ""}`, children: title }),
              claimed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
                " Claimed"
              ] }) : ready ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-3 w-3" }),
                " Ready"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto shrink-0 text-[10px] font-semibold text-muted-foreground", children: [
                progress,
                "/",
                goal
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 truncate text-[11px] text-muted-foreground", children: subtitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-1 overflow-hidden rounded-full bg-muted/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `h-full transition-all duration-500 ${claimed ? "bg-emerald-500/60" : ready ? "bg-gradient-to-r from-amber-400 to-fuchsia-500" : "bg-primary/70"}`,
                style: { width: `${pct}%` }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center gap-3 text-[10px] font-semibold text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-amber-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3" }),
                " +",
                xp,
                " XP"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-amber-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3 w-3" }),
                " +",
                coins
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto inline-flex items-center gap-0.5 text-primary opacity-0 transition-opacity group-hover:opacity-100", children: [
                "Details ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" })
              ] })
            ] })
          ] })
        ]
      }
    ),
    ready && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onClaim,
        disabled: claiming,
        className: "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-500 px-3 py-1 text-[11px] font-extrabold text-white shadow hover:brightness-110 disabled:opacity-60",
        children: [
          claiming ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-3 w-3" }),
          "Claim +",
          xp,
          " XP"
        ]
      }
    ) })
  ] });
}
function DetailModal({ selection, claiming, onClaim }) {
  const item = selection.item;
  const goal = selection.kind === "mission" ? item.target : item.goal;
  const emoji = selection.kind === "mission" ? item.icon : item.emoji;
  const howTo = selection.kind === "challenge" ? item.howTo : HOW_TO_FOR_MISSION[item.id] ?? ["Complete this action across the platform.", "Progress updates automatically."];
  const pct = Math.min(100, Math.round(item.progress / Math.max(goal, 1) * 100));
  const ready = item.completed && !item.claimed;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400/30 to-fuchsia-500/30 text-2xl", children: emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-base", children: item.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-xs", children: [
          selection.kind === "mission" ? "Daily mission" : "Daily challenge",
          " · resets at midnight UTC"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: item.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-muted/30 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between text-[11px] font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Progress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            item.progress,
            "/",
            goal
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full ${item.claimed ? "bg-emerald-500" : ready ? "bg-gradient-to-r from-amber-400 to-fuchsia-500" : "bg-primary"}`, style: { width: `${pct}%` } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: "How to complete" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-1.5 text-sm", children: howTo.map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary", children: i + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: step })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl border border-amber-400/30 bg-amber-500/5 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300", children: "Reward on claim" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-amber-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5" }),
            " +",
            item.xp,
            " XP"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-amber-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3.5 w-3.5" }),
            " +",
            item.coins
          ] })
        ] })
      ] }),
      item.claimed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex w-full items-center justify-center gap-1 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
        " Already claimed today"
      ] }) : ready ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: onClaim,
          disabled: claiming,
          className: "inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg hover:brightness-110 disabled:opacity-60",
          children: [
            claiming ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-4 w-4" }),
            "Claim +",
            item.xp,
            " XP · +",
            item.coins,
            " coins"
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-muted px-4 py-2 text-center text-xs font-semibold text-muted-foreground", children: "Complete the steps above to unlock this reward." })
    ] })
  ] });
}
function JourneyPage() {
  const {
    state
  } = useChat();
  const cfg = useProgressionConfig();
  const me = state.me;
  const level = me?.level ?? 1;
  const xp = me?.xp ?? 0;
  const breakdown = reactExports.useMemo(() => xpBreakdown(xp, level), [xp, level]);
  const stage = reactExports.useMemo(() => stageForLevel(level), [level]);
  const nStage = reactExports.useMemo(() => nextStage(level), [level]);
  const nUnlock = reactExports.useMemo(() => nextUnlock(level, xp, cfg), [level, xp, cfg]);
  const roadmap = reactExports.useMemo(() => upcomingUnlocks(level, xp, cfg, 6), [level, xp, cfg]);
  const all = reactExports.useMemo(() => resolveAllUnlocks(level, xp, cfg), [level, xp, cfg]);
  const unlockedCount = all.filter((u) => u.unlocked).length;
  const totalCount = all.length;
  const earnedBadges = new Set(me?.badges ?? []);
  const missions = DISCOVERY_MISSIONS.map((m) => ({
    ...m,
    done: m.done(me ?? {})
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl space-y-5 p-4 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br ${stage.accent} p-5`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-4xl backdrop-blur", children: stage.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-wider opacity-80", children: "Your Journey" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: stage.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-80", children: stage.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider opacity-80", children: "Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold", children: level })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between text-[11px] opacity-80", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            breakdown.xpIntoLevel,
            " / ",
            breakdown.xpForLevel,
            " XP"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            breakdown.pct,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-black/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-white/70 transition-all", style: {
          width: `${breakdown.pct}%`
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 text-[11px] opacity-80", children: breakdown.xpToNext > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Only ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
            breakdown.xpToNext,
            " XP"
          ] }),
          " to Level ",
          level + 1,
          "."
        ] }) : "Ready to level up!" })
      ] }),
      nStage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 inline-flex items-center gap-2 rounded-full bg-white/25 px-3 py-1 text-[11px] font-semibold backdrop-blur", children: [
        "Next stage ",
        nStage.emoji,
        " ",
        nStage.name,
        " · Level ",
        nStage.minLevel
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }), label: "XP", value: xp.toLocaleString() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }), label: "Unlocked", value: `${unlockedCount}/${totalCount}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }), label: "Badges", value: `${earnedBadges.size}/${BADGES.length}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }), label: "Missions", value: `${missions.filter((m) => m.done).length}/${missions.length}` })
    ] }),
    nUnlock && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl border border-primary/30 bg-primary/5 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-wider text-primary", children: "Next reward" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: nUnlock.def.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          nUnlock.def.description,
          " · Unlocks at Level ",
          nUnlock.requiredLevel
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between text-[11px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Level ",
              level,
              " → Level ",
              nUnlock.requiredLevel
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              nUnlock.progressPct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all", style: {
            width: `${nUnlock.progressPct}%`
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 text-[11px] text-muted-foreground", children: [
            "Only ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
              nUnlock.xpRemaining,
              " XP"
            ] }),
            " remaining."
          ] })
        ] })
      ] })
    ] }) }),
    me?.id && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Today's Missions & Challenges", hint: "Reset every 24 hours · tap any item for details and to claim XP.", children: /* @__PURE__ */ jsxRuntimeExports.jsx(JourneyDaily, { meId: me.id }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Discovery Missions", hint: "Guided steps to explore the platform.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: missions.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 rounded-2xl border p-3 ${m.done ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-background/50"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-9 w-9 shrink-0 place-items-center rounded-xl ${m.done ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`, children: m.done ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: m.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: m.description })
      ] }),
      !m.done && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: m.cta.to, className: "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/15", children: [
        m.cta.label,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" })
      ] })
    ] }, m.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Upcoming Roadmap", hint: "What unlocks as you level up next.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-background/50 p-2", children: [
      roadmap.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-center text-xs text-muted-foreground", children: "You've unlocked everything available. 🎉" }),
      roadmap.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-medium", children: u.def.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] text-muted-foreground", children: u.def.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary", children: [
          "Lv ",
          u.requiredLevel
        ] })
      ] }, u.def.key))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Journey Stages", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2 md:grid-cols-3", children: JOURNEY_STAGES.map((s) => {
      const reached = level >= s.minLevel;
      const isCurrent = s.id === stage.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border p-3 transition-all ${reached ? `bg-gradient-to-br ${s.accent} border-transparent` : "border-border bg-white/[0.02] text-muted-foreground"} ${isCurrent ? "ring-2 ring-primary/50" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: s.emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: s.name }),
          isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto rounded-full bg-black/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", children: "You" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[11px] opacity-80", children: [
          "Level ",
          s.minLevel,
          "+"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs opacity-80", children: s.description })
      ] }, s.id);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Unlocked Features", hint: `${unlockedCount} of ${totalCount} available.`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: all.filter((u) => u.unlocked).slice(0, 12).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-medium", children: u.def.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] text-muted-foreground", children: u.def.description })
      ] })
    ] }, u.def.key)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Achievements", hint: `${earnedBadges.size} of ${BADGES.length} earned.`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: BADGES.map((b) => {
      const has = earnedBadges.has(b.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 rounded-2xl border p-3 ${has ? `bg-gradient-to-br ${TIER_COLOR[b.tier]}` : "border-border bg-white/[0.02] text-muted-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xl ${has ? "bg-black/20" : "bg-white/5"}`, children: has ? b.emoji : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-bold", children: [
            b.name,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-black/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", children: b.tier })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-80", children: b.description })
        ] })
      ] }, b.id);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 text-center text-[11px] text-muted-foreground", children: [
      "Every ",
      XP_PER_LEVEL,
      " XP = 1 level · Admins can tune unlocks under Progression settings."
    ] })
  ] });
}
function Stat({
  icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-background/50 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: [
      icon,
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xl font-bold", children: value })
  ] });
}
function Section({
  title,
  hint,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-end justify-between px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold", children: title }),
      hint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: hint })
    ] }),
    children
  ] });
}
export {
  JourneyPage as component
};
