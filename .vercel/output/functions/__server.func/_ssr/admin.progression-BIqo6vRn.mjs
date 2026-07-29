import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppSettings, b as useServerFn, aF as updateSetting, aJ as AdminPageHeader, ae as Card, af as CardContent, aG as AdminToggle, a0 as Input, B as Button, ac as Label } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { P as PROGRESSION_DEFAULTS, U as UNLOCKS, L as LEVEL_TIERS, r as resolveUnlock } from "./progression-config-C9tZ2eSd.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { W as Lock, g as MessageSquare, O as Trophy, a2 as Gift, N as Search, b as Save } from "../_libs/lucide-react.mjs";
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
const MODULES = [{
  key: "unlocks",
  label: "Level Unlocks",
  icon: Lock,
  description: "Master switch for the level-gated feature map. When off, all unlocks are open."
}, {
  key: "messageControl",
  label: "Message Control",
  icon: MessageSquare,
  description: "Surface reply / edit / delete / quote / copy-link affordances on chat messages."
}, {
  key: "creatorRanks",
  label: "Creator Ranks",
  icon: Trophy,
  description: "Show creator badge, leaderboard and rank progression."
}, {
  key: "socialStatus",
  label: "Social Status",
  icon: Gift,
  description: "Show reputation, loyalty and veteran badges."
}];
function ProgressionPage() {
  const {
    raw,
    refresh
  } = useAppSettings();
  const qc = useQueryClient();
  const saveSetting = useServerFn(updateSetting);
  const persisted = raw.progression ?? {};
  const [draft, setDraft] = reactExports.useState(() => ({
    ...PROGRESSION_DEFAULTS,
    ...persisted,
    modules: {
      ...PROGRESSION_DEFAULTS.modules,
      ...persisted.modules ?? {}
    },
    message: {
      ...PROGRESSION_DEFAULTS.message,
      ...persisted.message ?? {}
    },
    gifting: {
      ...PROGRESSION_DEFAULTS.gifting,
      ...persisted.gifting ?? {}
    },
    unlocks: {
      ...persisted.unlocks ?? {}
    }
  }));
  reactExports.useEffect(() => {
    setDraft((d) => ({
      ...d,
      modules: {
        ...d.modules,
        ...persisted.modules ?? {}
      }
    }));
  }, [JSON.stringify(persisted.modules ?? {})]);
  const mut = useMutation({
    mutationFn: (next) => saveSetting({
      data: {
        key: "progression",
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
  const toggleModule = (k, v) => {
    const next = {
      ...draft,
      modules: {
        ...draft.modules,
        [k]: v
      }
    };
    setDraft(next);
    mut.mutate(next);
  };
  const setMessage = (k, v) => setDraft((d) => ({
    ...d,
    message: {
      ...d.message,
      [k]: v
    }
  }));
  const setGifting = (k, v) => setDraft((d) => ({
    ...d,
    gifting: {
      ...d.gifting,
      [k]: v
    }
  }));
  const setUnlock = (key, patch) => setDraft((d) => ({
    ...d,
    unlocks: {
      ...d.unlocks,
      [key]: {
        ...d.unlocks[key] ?? {},
        ...patch
      }
    }
  }));
  const [query, setQuery] = reactExports.useState("");
  const grouped = reactExports.useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = /* @__PURE__ */ new Map();
    for (const u of UNLOCKS) {
      if (q && !`${u.label} ${u.description} ${u.key}`.toLowerCase().includes(q)) continue;
      const arr = out.get(u.tier) ?? [];
      arr.push(u);
      out.set(u.tier, arr);
    }
    return Array.from(out.entries()).sort((a, b) => a[0] - b[0]);
  }, [query]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Progression & Unlocks", description: "Centralized Level, Reputation, Permissions and Unlocks. Configure what every level can do without touching working features." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground", children: [
      "Saved to ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-background px-1 py-0.5", children: "app_settings.progression" }),
      ". Existing XP, coins, levels and rewards are untouched — this page only controls which features are gated by level and when."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Modules", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "divide-y p-0", children: MODULES.map((m) => {
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
    }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Level Tiers", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "flex flex-wrap gap-1.5 p-4", children: LEVEL_TIERS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `text-[10px] ${t.chip}`, children: [
      "Lv ",
      t.level,
      " · ",
      t.name
    ] }, t.level)) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Message Control", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Edit time limit (minutes)", hint: "Window after sending in which the author can still edit. 0 = unlimited.", value: draft.message.editTimeLimitMins, onChange: (v) => setMessage("editTimeLimitMins", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Delete time limit (minutes)", hint: "Window after sending in which the author can still delete. 0 = unlimited.", value: draft.message.deleteTimeLimitMins, onChange: (v) => setMessage("deleteTimeLimitMins", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium", children: "Unsend (recall) support" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Reserved for a future build. Off by default." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: draft.message.unsendEnabled, onCheckedChange: (v) => setMessage("unsendEnabled", v) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Coin Gifting", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Daily gifting cap (coins)", value: draft.gifting.dailyCap, onChange: (v) => setGifting("dailyCap", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Legend multiplier", value: draft.gifting.legendMultiplier, onChange: (v) => setGifting("legendMultiplier", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberRow, { label: "Min level override", hint: "Force a min level for gifting (0 = follow the unlocks table).", value: draft.gifting.minLevelOverride, onChange: (v) => setGifting("minLevelOverride", v) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Unlocks", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search unlocks…", className: "h-8 pl-8 text-xs" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        grouped.map(([tier, items]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b bg-muted/30 px-4 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: [
              "Tier ",
              tier,
              " · ",
              LEVEL_TIERS.find((t) => t.level === tier)?.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: items.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: items.map((u) => {
            const {
              level,
              enabled
            } = resolveUnlock(u.key, draft);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid items-center gap-2 px-4 py-2.5 sm:grid-cols-[1fr_5rem_3rem]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium", children: u.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: u.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 font-mono text-[10px] text-muted-foreground/70", children: u.key })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: level, onChange: (e) => setUnlock(u.key, {
                level: Number(e.target.value)
              }), className: "h-7 text-xs" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: enabled, onCheckedChange: (v) => setUnlock(u.key, {
                enabled: v
              }) })
            ] }, u.key);
          }) })
        ] }) }, tier)),
        grouped.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground", children: [
          "No unlocks match “",
          query,
          "”."
        ] })
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
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: title }),
    children
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
  ProgressionPage as component
};
