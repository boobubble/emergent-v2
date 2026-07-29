import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppSettings, b as useServerFn, aF as updateSetting, aJ as AdminPageHeader, ae as Card, af as CardContent, aG as AdminToggle, ac as Label, B as Button, a0 as Input } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { F as Flame, bg as TrendingUp, f as Heart, ca as Battery, b as Save } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "./env.server-Bcmcot3M.mjs";
import "./rate-limit-middleware-CAVrvtrO.mjs";
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
import "../_libs/zod.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
const STREAK_MILESTONES = [
  { day: 1, label: "Welcome back", reward: { kind: "xp", amount: 10 } },
  { day: 3, label: "Warming up", reward: { kind: "coins", amount: 25 } },
  { day: 7, label: "One week strong", reward: { kind: "coins", amount: 100 } },
  { day: 30, label: "Loyal member", reward: { kind: "badge", badgeId: "streak_30", label: "30-day streak" } },
  { day: 100, label: "Centurion", reward: { kind: "achievement", achievementId: "streak_100", label: "100-day streak" } }
];
const STREAK_DEFAULTS = {
  /** Hours of grace beyond local midnight before a streak is considered broken. */
  graceHours: 6,
  /** Show a "your streak is at risk" prompt this many hours before reset. */
  riskWindowHours: 12
};
const MOMENTUM_DEFAULTS = {
  /** Score gained per action. Server enforces caps to prevent farming. */
  gains: {
    post: 5,
    reaction_received: 1,
    comment_received: 3,
    room_message: 0.2,
    mission_completed: 4
  },
  /** Hard cap so a single viral day can't dwarf weeks of work. */
  dailyCap: 200,
  /** Soft decay — % of score removed per day of inactivity. */
  decayPerDayPct: 5,
  /** Days of inactivity before decay starts ("grace period"). */
  decayGraceDays: 2,
  /** Score floor — momentum never decays below this. */
  floor: 0
};
const MOMENTUM_TIERS = [
  { key: "cold", label: "Cold", minScore: 0, visibilityBoostPct: 0, chip: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  { key: "warming", label: "Warming", minScore: 25, visibilityBoostPct: 5, chip: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  { key: "hot", label: "Hot", minScore: 100, visibilityBoostPct: 15, chip: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  { key: "blazing", label: "Blazing", minScore: 300, visibilityBoostPct: 25, chip: "bg-orange-500/15 text-orange-600 dark:text-orange-300" },
  { key: "supernova", label: "Supernova", minScore: 800, visibilityBoostPct: 40, chip: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300" }
];
const LOYALTY_RANKS = [
  { level: 1, name: "Newcomer", minPoints: 0, chip: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  { level: 2, name: "Regular", minPoints: 100, chip: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  { level: 3, name: "Devoted", minPoints: 500, chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  { level: 4, name: "Veteran", minPoints: 1500, chip: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  { level: 5, name: "Legend", minPoints: 5e3, chip: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300" }
];
const LOYALTY_DEFAULTS = {
  /** Points per action, per scope. Reuses existing message/feed/comment events. */
  gains: {
    chatroom: { message: 1, dailyCap: 80 },
    feed: { post: 5, reaction: 1, comment: 2, dailyCap: 60 },
    community: { daily_login: 5, mission: 5, dailyCap: 50 }
  },
  /** Loyalty NEVER decays. Inactivity only pauses growth. */
  pausesAfterDays: 7
};
const ENERGY_DEFAULTS = {
  max: 100,
  /** Energy per hour of activity (capped at max). */
  regenPerHour: 10,
  /** Energy lost per full day of inactivity. */
  decayPerDay: 15,
  /** Restore sources — single-shot boosts when these events fire. */
  restore: {
    login_daily: 25,
    post: 5,
    chat_message: 1,
    mission_completed: 10
  }
};
const ENERGY_TIERS = [
  { minEnergy: 100, bonusMultiplier: 1.5, label: "Full Bonus" },
  { minEnergy: 75, bonusMultiplier: 1.25, label: "Normal" },
  { minEnergy: 50, bonusMultiplier: 1.1, label: "Reduced Bonus" },
  { minEnergy: 25, bonusMultiplier: 1.05, label: "Minimal Bonus" },
  { minEnergy: 0, bonusMultiplier: 1, label: "Base Only" }
];
const RETENTION_DEFAULTS = {
  modules: {
    activity: true,
    momentum: false,
    loyalty: true,
    energy: false
  },
  streaks: STREAK_DEFAULTS,
  momentum: MOMENTUM_DEFAULTS,
  loyalty: LOYALTY_DEFAULTS,
  energy: ENERGY_DEFAULTS
};
const MODULES = [{
  key: "activity",
  label: "Activity & Streaks",
  icon: Flame,
  description: "Daily login, chat, feed and room streaks with positive milestone rewards."
}, {
  key: "momentum",
  label: "Momentum",
  icon: TrendingUp,
  description: "Rolling creator score that grows with engagement and decays softly when idle."
}, {
  key: "loyalty",
  label: "Loyalty",
  icon: Heart,
  description: "Per-scope loyalty ranks. Growth pauses on inactivity — points never decrease."
}, {
  key: "energy",
  label: "Energy",
  icon: Battery,
  description: "Optional bonus multiplier that fades when idle. Affects bonus rewards only — never base coins."
}];
function RetentionPage() {
  const {
    raw,
    refresh
  } = useAppSettings();
  const qc = useQueryClient();
  const saveSetting = useServerFn(updateSetting);
  const persisted = raw.retention ?? {};
  const [draft, setDraft] = reactExports.useState(() => ({
    ...RETENTION_DEFAULTS,
    ...persisted,
    modules: {
      ...RETENTION_DEFAULTS.modules,
      ...persisted.modules ?? {}
    },
    streaks: {
      ...RETENTION_DEFAULTS.streaks,
      ...persisted.streaks ?? {}
    },
    momentum: {
      ...RETENTION_DEFAULTS.momentum,
      ...persisted.momentum ?? {}
    },
    loyalty: {
      ...RETENTION_DEFAULTS.loyalty,
      ...persisted.loyalty ?? {}
    },
    energy: {
      ...RETENTION_DEFAULTS.energy,
      ...persisted.energy ?? {}
    }
  }));
  reactExports.useEffect(() => {
    setDraft((d) => ({
      ...d,
      ...persisted,
      modules: {
        ...d.modules,
        ...persisted.modules ?? {}
      }
    }));
  }, [JSON.stringify(persisted.modules ?? {})]);
  const mut = useMutation({
    mutationFn: (next) => saveSetting({
      data: {
        key: "retention",
        value: next
      }
    }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
      toast.success("Saved");
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const toggleModule = (key, v) => {
    const next = {
      ...draft,
      modules: {
        ...draft.modules,
        [key]: v
      }
    };
    setDraft(next);
    mut.mutate(next);
  };
  const setNum = (path) => {
    const next = structuredClone(draft);
    path(next);
    setDraft(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Retention & Engagement", description: "Activity, Momentum, Loyalty and Energy. Inactivity reduces growth — earned coins, XP and past rewards are never removed." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground", children: [
      "Saved to ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-background px-1 py-0.5", children: "app_settings.retention" }),
      ". Disabling a module hides its UI and pauses its service hooks — historical data is preserved."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Modules" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "divide-y p-0", children: MODULES.map((m) => {
        const Icon = m.icon;
        const on = draft.modules[m.key];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-9 w-9 place-items-center rounded-md ${on ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: m.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: m.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: on, onCheckedChange: (v) => toggleModule(m.key, v), disabled: mut.isPending })
        ] }, m.key);
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Activity & Streaks", disabled: !draft.modules.activity, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Grace period (hours)", hint: "Hours past local midnight before a missed day breaks the streak.", value: draft.streaks.graceHours, onChange: (v) => setNum((c) => {
        c.streaks.graceHours = v;
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Risk warning window (hours)", hint: 'Show a "streak at risk" prompt this many hours before reset.', value: draft.streaks.riskWindowHours, onChange: (v) => setNum((c) => {
        c.streaks.riskWindowHours = v;
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Milestones (read-only preview)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: STREAK_MILESTONES.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
          "Day ",
          m.day,
          " · ",
          m.reward.kind
        ] }, m.day)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Momentum", disabled: !draft.modules.momentum, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Decay per idle day (%)", hint: "Percent of score removed per day of inactivity. Never affects coins.", value: draft.momentum.decayPerDayPct, onChange: (v) => setNum((c) => {
        c.momentum.decayPerDayPct = v;
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Grace period before decay (days)", value: draft.momentum.decayGraceDays, onChange: (v) => setNum((c) => {
        c.momentum.decayGraceDays = v;
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Daily gain cap", value: draft.momentum.dailyCap, onChange: (v) => setNum((c) => {
        c.momentum.dailyCap = v;
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Score floor", value: draft.momentum.floor, onChange: (v) => setNum((c) => {
        c.momentum.floor = v;
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tiers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: MOMENTUM_TIERS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `text-[10px] ${t.chip}`, children: [
          t.label,
          " ≥ ",
          t.minScore,
          " · +",
          t.visibilityBoostPct,
          "%"
        ] }, t.key)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Loyalty", disabled: !draft.modules.loyalty, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Pause growth after idle (days)", hint: "After this many idle days, loyalty stops accruing until the user returns. Points are not removed.", value: draft.loyalty.pausesAfterDays, onChange: (v) => setNum((c) => {
        c.loyalty.pausesAfterDays = v;
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Ranks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: LOYALTY_RANKS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `text-[10px] ${r.chip}`, children: [
          "Lv",
          r.level,
          " ",
          r.name,
          " ≥ ",
          r.minPoints
        ] }, r.level)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Energy", disabled: !draft.modules.energy, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Max energy", value: draft.energy.max, onChange: (v) => setNum((c) => {
        c.energy.max = v;
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Regen per active hour", value: draft.energy.regenPerHour, onChange: (v) => setNum((c) => {
        c.energy.regenPerHour = v;
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Decay per idle day", value: draft.energy.decayPerDay, onChange: (v) => setNum((c) => {
        c.energy.decayPerDay = v;
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Bonus tiers (multiplier applies to bonus rewards only)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: ENERGY_TIERS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
          "≥ ",
          t.minEnergy,
          "% · ×",
          t.bonusMultiplier,
          " (",
          t.label,
          ")"
        ] }, t.minEnergy)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-3 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mut.mutate(draft), disabled: mut.isPending, className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
      " Save changes"
    ] }) })
  ] });
}
function Section({
  title,
  disabled,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-3 p-4", children }) })
  ] });
}
function NumberRow({
  label,
  hint,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid items-start gap-2 sm:grid-cols-[1fr_8rem]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium", children: label }),
      hint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: hint })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value, onChange: (e) => onChange(Number(e.target.value)), className: "h-8 text-xs" })
  ] });
}
export {
  RetentionPage as component
};
