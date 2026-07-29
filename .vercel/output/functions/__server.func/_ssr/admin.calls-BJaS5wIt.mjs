import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, Y as getAllSettings, aF as updateSetting, aJ as AdminPageHeader, a0 as Input, B as Button, ae as Card, af as CardContent, aG as AdminToggle, ac as Label, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, aw as DialogFooter } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { T as Tabs, a as TabsList, c as TabsContent, b as TabsTrigger } from "./tabs-CwEa0x2C.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { N as Search, p as Settings, bV as Plug, aX as PhoneCall, U as Users, Y as Coins, aC as Activity, ak as Mic, bW as Video, bX as MonitorPlay, bY as CircleDot, bz as CircleCheck, T as TriangleAlert, Z as Zap, au as ShieldCheck, a as Sparkles, R as RotateCcw, b as Save, aB as Crown, bj as BadgeCheck } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
const DEFAULTS = {
  enabled: true,
  mode: "both",
  default_max_duration_min: 60,
  idle_timeout_sec: 45,
  auto_disconnect_min: 120,
  active_provider: "livekit",
  smart_routing: true,
  providers: {
    livekit: {
      configured: false,
      url: "",
      api_key: "",
      secret: ""
    },
    agora: {
      configured: false,
      app_id: "",
      certificate: ""
    }
  },
  one_to_one: {
    audio: {
      who: "all",
      coin_cost: 2,
      max_duration_min: 30
    },
    video: {
      who: "verified",
      coin_cost: 5,
      max_duration_min: 30
    }
  },
  group: {
    audio: {
      create: "premium",
      join: "all",
      participant_limit: 20,
      lifespan_min: 180
    },
    video: {
      create: "premium",
      join: "verified",
      participant_limit: 10,
      lifespan_min: 120
    },
    allow_screen_share: true,
    allow_recording: false,
    auto_mute_new: true
  },
  billing: {
    audio: {
      mode: "per_minute",
      cost: 2
    },
    video: {
      mode: "per_minute",
      cost: 5
    },
    group_create: {
      mode: "fixed",
      cost: 25
    },
    trio_room: {
      mode: "fixed",
      cost: 50
    }
  }
};
const ROLE_OPTIONS = [{
  id: "owner",
  label: "Owner",
  icon: Crown
}, {
  id: "admin",
  label: "Admin",
  icon: ShieldCheck
}, {
  id: "premium",
  label: "Premium",
  icon: Sparkles
}, {
  id: "verified",
  label: "Verified",
  icon: BadgeCheck
}, {
  id: "all",
  label: "All users",
  icon: Users
}];
const PROVIDERS = [{
  id: "livekit",
  name: "LiveKit",
  gradient: "from-cyan-500 to-blue-600",
  tagline: "Open-source · WebRTC SFU",
  bestFor: "DM & Trio rooms"
}, {
  id: "agora",
  name: "Agora",
  gradient: "from-fuchsia-500 to-orange-500",
  tagline: "Global RTC network",
  bestFor: "Large rooms / Stage"
}];
function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object") return base;
  const out = Array.isArray(base) ? [...base] : {
    ...base
  };
  for (const k of Object.keys(patch)) {
    const bv = base?.[k];
    const pv = patch[k];
    out[k] = pv && typeof pv === "object" && !Array.isArray(pv) && bv && typeof bv === "object" ? deepMerge(bv, pv) : pv;
  }
  return out;
}
function CallsAdmin() {
  const fetchSettings = useServerFn(getAllSettings);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const {
    data
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings({})
  });
  const [values, setValues] = reactExports.useState(DEFAULTS);
  const [initial, setInitial] = reactExports.useState(DEFAULTS);
  const [tab, setTab] = reactExports.useState("general");
  const [search, setSearch] = reactExports.useState("");
  const [providerModal, setProviderModal] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!data) return;
    const remote = data.calls;
    const merged = deepMerge(DEFAULTS, remote ?? {});
    setValues(merged);
    setInitial(merged);
  }, [data]);
  const dirty = reactExports.useMemo(() => JSON.stringify(values) !== JSON.stringify(initial), [values, initial]);
  reactExports.useEffect(() => {
    if (!dirty) return;
    const h = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  const mut = useMutation({
    mutationFn: () => saveSetting({
      data: {
        key: "calls",
        value: values
      }
    }),
    onSuccess: () => {
      toast.success("Call settings saved");
      setInitial(values);
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed to save")
  });
  const patch = (p) => setValues((s) => typeof p === "function" ? p(s) : deepMerge(s, p));
  const showTab = (keywords) => !search || keywords.toLowerCase().includes(search.toLowerCase());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-28", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Call Settings", description: "Audio · Video · Group calls — provider, permissions, monetization & analytics.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search settings…", className: "h-9 w-56 pl-8" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 z-20 -mx-4 mb-4 border-b border-border/60 bg-background/80 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex w-full justify-start gap-1 overflow-x-auto bg-transparent p-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabTrigger, { value: "general", icon: Settings, label: "General" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabTrigger, { value: "providers", icon: Plug, label: "Providers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabTrigger, { value: "one2one", icon: PhoneCall, label: "1-to-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabTrigger, { value: "group", icon: Users, label: "Group" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabTrigger, { value: "billing", icon: Coins, label: "Billing & Coins" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabTrigger, { value: "analytics", icon: Activity, label: "Analytics" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "general", className: "space-y-4", children: [
        showTab("call system enable disable mode audio video duration timeout") && /* @__PURE__ */ jsxRuntimeExports.jsxs(GlassCard, { title: "Call System", icon: PhoneCall, right: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { ok: values.enabled, okText: "Active", badText: "Disabled" }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enable call system", description: "Master switch for all audio & video calls", checked: values.enabled, onCheckedChange: (v) => patch({
              enabled: v
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Call mode", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SegmentedControl, { value: values.mode, onChange: (v) => patch({
              mode: v
            }), options: [{
              value: "audio",
              label: "Audio",
              icon: Mic
            }, {
              value: "video",
              label: "Video",
              icon: Video
            }, {
              value: "both",
              label: "Both",
              icon: MonitorPlay
            }] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Max duration (min)", value: values.default_max_duration_min, onChange: (n) => patch({
              default_max_duration_min: n
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Idle timeout (sec)", value: values.idle_timeout_sec, onChange: (n) => patch({
              idle_timeout_sec: n
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Auto disconnect (min)", value: values.auto_disconnect_min, onChange: (n) => patch({
              auto_disconnect_min: n
            }) })
          ] })
        ] }),
        showTab("system status active provider health") && /* @__PURE__ */ jsxRuntimeExports.jsx(GlassCard, { title: "System Status", icon: Activity, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Active provider", value: values.active_provider.toUpperCase(), tone: "sky", icon: Plug }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Active calls", value: "—", tone: "emerald", icon: CircleDot }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Calls today", value: "—", tone: "violet", icon: PhoneCall }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Provider health", value: values.providers[values.active_provider].configured ? "Healthy" : "Not configured", tone: values.providers[values.active_provider].configured ? "emerald" : "amber", icon: values.providers[values.active_provider].configured ? CircleCheck : TriangleAlert })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "providers", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GlassCard, { title: "Smart Provider Routing", icon: Zap, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enable smart routing", description: "Auto-select provider based on participant count. 1–3 → LiveKit, 4+ → Agora.", checked: values.smart_routing, onCheckedChange: (v) => patch({
          smart_routing: v
        }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: PROVIDERS.map((p) => {
          const cfg = values.providers[p.id];
          const isActive = values.active_provider === p.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur transition hover:shadow-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${p.gradient} opacity-20 blur-2xl` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${p.gradient} text-white shadow-lg`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plug, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold", children: p.name }),
                    isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300", children: "Active" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: p.tagline })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { ok: cfg.configured, okText: "Configured", badText: "Setup needed" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-4 grid grid-cols-2 gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { mini: true, label: "Best for", value: p.bestFor }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { mini: true, label: "Connections", value: "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-4 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setProviderModal(p.id), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "mr-1.5 h-3.5 w-3.5" }),
                "Configure"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: !cfg.configured, onClick: () => toast.success(`${p.name} reachable`), children: "Test connection" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: isActive || !cfg.configured, onClick: () => patch({
                active_provider: p.id
              }), children: isActive ? "In use" : "Activate" })
            ] })
          ] }, p.id);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProviderConfigDialog, { providerId: providerModal, value: providerModal ? values.providers[providerModal] : null, onClose: () => setProviderModal(null), onSave: (id, cfg) => {
          patch((s) => ({
            ...s,
            providers: {
              ...s.providers,
              [id]: {
                ...cfg,
                configured: true
              }
            }
          }));
          setProviderModal(null);
          toast.success("Provider configuration updated");
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "one2one", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CallPermCard, { title: "Audio Calls", icon: PhoneCall, tint: "from-emerald-500 to-teal-500", who: values.one_to_one.audio.who, cost: values.one_to_one.audio.coin_cost, duration: values.one_to_one.audio.max_duration_min, onChange: (p) => patch({
          one_to_one: {
            ...values.one_to_one,
            audio: {
              ...values.one_to_one.audio,
              ...p
            }
          }
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CallPermCard, { title: "Video Calls", icon: Video, tint: "from-violet-500 to-fuchsia-500", who: values.one_to_one.video.who, cost: values.one_to_one.video.coin_cost, duration: values.one_to_one.video.max_duration_min, onChange: (p) => patch({
          one_to_one: {
            ...values.one_to_one,
            video: {
              ...values.one_to_one.video,
              ...p
            }
          }
        }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "group", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GroupCallCard, { title: "Audio Group Calls", icon: Mic, tint: "from-emerald-500 to-cyan-500", cfg: values.group.audio, onChange: (p) => patch({
            group: {
              ...values.group,
              audio: {
                ...values.group.audio,
                ...p
              }
            }
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(GroupCallCard, { title: "Video Group Calls", icon: Video, tint: "from-rose-500 to-fuchsia-500", cfg: values.group.video, onChange: (p) => patch({
            group: {
              ...values.group,
              video: {
                ...values.group.video,
                ...p
              }
            }
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GlassCard, { title: "Moderator controls", icon: ShieldCheck, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Allow screen share", checked: values.group.allow_screen_share, onCheckedChange: (v) => patch({
            group: {
              ...values.group,
              allow_screen_share: v
            }
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Allow recording", checked: values.group.allow_recording, onCheckedChange: (v) => patch({
            group: {
              ...values.group,
              allow_recording: v
            }
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Auto-mute new users", checked: values.group.auto_mute_new, onCheckedChange: (v) => patch({
            group: {
              ...values.group,
              auto_mute_new: v
            }
          }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "billing", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BillingCard, { label: "Audio call", icon: PhoneCall, tint: "from-emerald-500 to-teal-500", cfg: values.billing.audio, onChange: (p) => patch({
            billing: {
              ...values.billing,
              audio: {
                ...values.billing.audio,
                ...p
              }
            }
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BillingCard, { label: "Video call", icon: Video, tint: "from-violet-500 to-fuchsia-500", cfg: values.billing.video, onChange: (p) => patch({
            billing: {
              ...values.billing,
              video: {
                ...values.billing.video,
                ...p
              }
            }
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BillingCard, { label: "Group call creation", icon: Users, tint: "from-amber-500 to-orange-500", cfg: values.billing.group_create, onChange: (p) => patch({
            billing: {
              ...values.billing,
              group_create: {
                ...values.billing.group_create,
                ...p
              }
            }
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BillingCard, { label: "Trio room call", icon: Sparkles, tint: "from-pink-500 to-rose-500", cfg: values.billing.trio_room, onChange: (p) => patch({
            billing: {
              ...values.billing,
              trio_room: {
                ...values.billing.trio_room,
                ...p
              }
            }
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RevenueCalculator, { settings: values })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "analytics", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Calls today", value: "—", tone: "sky", icon: PhoneCall }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Avg duration", value: "—", tone: "violet", icon: Activity }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Top provider", value: values.active_provider.toUpperCase(), tone: "emerald", icon: Plug }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Revenue (coins)", value: "—", tone: "amber", icon: Coins })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GlassCard, { title: "Peak concurrent calls", icon: Activity, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-32 place-items-center text-sm text-muted-foreground", children: "Live analytics will appear here once calls start." }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur transition ${dirty ? "translate-y-0" : "translate-y-full"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
        " You have unsaved changes"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setValues(initial), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-1.5 h-3.5 w-3.5" }),
          "Reset"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => mut.mutate(), disabled: mut.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1.5 h-3.5 w-3.5" }),
          mut.isPending ? "Saving…" : "Save changes"
        ] })
      ] })
    ] }) })
  ] });
}
function TabTrigger({
  value,
  icon: Icon,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value, className: "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
  ] });
}
function GlassCard({
  title,
  icon: Icon,
  right,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden border-border/60 bg-card/60 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold tracking-tight", children: title })
      ] }),
      right
    ] }),
    children
  ] }) });
}
function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: label }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked, onCheckedChange })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: label }),
    children
  ] });
}
function NumberField({
  label,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value, onChange: (e) => onChange(Number(e.target.value) || 0) }) });
}
function SegmentedControl({
  value,
  onChange,
  options
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex rounded-lg border border-border bg-muted/40 p-1", children: options.map((o) => {
    const active = o.value === value;
    const Icon = o.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => onChange(o.value), className: `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: [
      Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
      o.label
    ] }, o.value);
  }) });
}
function RolePicker({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-5", children: ROLE_OPTIONS.map((r) => {
    const active = r.id === value;
    const Icon = r.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => onChange(r.id), className: `group flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition ${active ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}` }),
      r.label
    ] }, r.id);
  }) });
}
function StatusPill({
  ok,
  okText,
  badText
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${ok ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"} animate-pulse` }),
    ok ? okText : badText
  ] });
}
function StatTile({
  label,
  value,
  tone,
  icon: Icon
}) {
  const tones = {
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-7 w-7 place-items-center rounded-lg ${tones[tone]}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xl font-semibold tabular-nums", children: value })
  ] });
}
function Stat({
  label,
  value,
  mini
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border border-border/60 bg-muted/30 ${mini ? "px-2.5 py-1.5" : "p-3"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: value })
  ] });
}
function ProviderConfigDialog({
  providerId,
  value,
  onClose,
  onSave
}) {
  const [local, setLocal] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setLocal(value ? {
      ...value
    } : null);
  }, [value, providerId]);
  if (!providerId || !local) return null;
  const isLk = providerId === "livekit";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!providerId, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "capitalize", children: [
      providerId,
      " configuration"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      isLk ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Server URL", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: local.url ?? "", onChange: (e) => setLocal({
          ...local,
          url: e.target.value
        }), placeholder: "wss://example.livekit.cloud" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "API key", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: local.api_key ?? "", onChange: (e) => setLocal({
          ...local,
          api_key: e.target.value
        }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "API secret", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", value: local.secret ?? "", onChange: (e) => setLocal({
          ...local,
          secret: e.target.value
        }) }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "App ID", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: local.app_id ?? "", onChange: (e) => setLocal({
          ...local,
          app_id: e.target.value
        }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Certificate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", value: local.certificate ?? "", onChange: (e) => setLocal({
          ...local,
          certificate: e.target.value
        }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "w-full", onClick: () => {
        const ok = isLk ? !!(local.url && local.api_key && local.secret) : !!(local.app_id && local.certificate);
        ok ? toast.success("Connection successful") : toast.error("Missing credentials");
      }, children: "Test connection" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => onSave(providerId, local), children: "Save" })
    ] })
  ] }) });
}
function CallPermCard({
  title,
  icon: Icon,
  tint,
  who,
  cost,
  duration,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden border-border/60 bg-card/60 backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1.5 w-full bg-gradient-to-r ${tint}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${tint} text-white`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Who can initiate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RolePicker, { value: who, onChange: (r) => onChange({
        who: r
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Coin cost / min", value: cost, onChange: (n) => onChange({
          coin_cost: n
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Max duration (min)", value: duration, onChange: (n) => onChange({
          max_duration_min: n
        }) })
      ] })
    ] })
  ] });
}
function GroupCallCard({
  title,
  icon: Icon,
  tint,
  cfg,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden border-border/60 bg-card/60 backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1.5 w-full bg-gradient-to-r ${tint}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${tint} text-white`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Who can create", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RolePicker, { value: cfg.create, onChange: (r) => onChange({
        create: r
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Who can join", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RolePicker, { value: cfg.join, onChange: (r) => onChange({
        join: r
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Participant limit", value: cfg.participant_limit, onChange: (n) => onChange({
          participant_limit: n
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Lifespan (min)", value: cfg.lifespan_min, onChange: (n) => onChange({
          lifespan_min: n
        }) })
      ] })
    ] })
  ] });
}
function BillingCard({
  label,
  icon: Icon,
  tint,
  cfg,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden border-border/60 bg-card/60 backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1.5 w-full bg-gradient-to-r ${tint}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${tint} text-white`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Billing mode", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SegmentedControl, { value: cfg.mode, onChange: (m) => onChange({
        mode: m
      }), options: [{
        value: "free",
        label: "Free"
      }, {
        value: "per_minute",
        label: "Per minute"
      }, {
        value: "fixed",
        label: "Fixed"
      }] }) }),
      cfg.mode !== "free" && /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: cfg.mode === "per_minute" ? "Coins per minute" : "Fixed cost (coins)", value: cfg.cost, onChange: (n) => onChange({
        cost: n
      }) })
    ] })
  ] });
}
function RevenueCalculator({
  settings
}) {
  const [calls, setCalls] = reactExports.useState(100);
  const [avgMin, setAvgMin] = reactExports.useState(5);
  const est = reactExports.useMemo(() => {
    const audio = settings.billing.audio.mode === "per_minute" ? avgMin * settings.billing.audio.cost : settings.billing.audio.mode === "fixed" ? settings.billing.audio.cost : 0;
    const video = settings.billing.video.mode === "per_minute" ? avgMin * settings.billing.video.cost : settings.billing.video.mode === "fixed" ? settings.billing.video.cost : 0;
    return {
      audio: audio * calls,
      video: video * calls,
      total: (audio + video) * calls
    };
  }, [calls, avgMin, settings]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(GlassCard, { title: "Revenue Preview", icon: Coins, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Calls / day", value: calls, onChange: setCalls }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Avg duration (min)", value: avgMin, onChange: setAvgMin })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 rounded-xl border border-border/60 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Audio earnings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold tabular-nums", children: [
          est.audio.toLocaleString(),
          " 🪙"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Video earnings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold tabular-nums", children: [
          est.video.toLocaleString(),
          " 🪙"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-1 h-px bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-base", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Total / day" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold tabular-nums text-amber-600 dark:text-amber-400", children: [
          est.total.toLocaleString(),
          " 🪙"
        ] })
      ] })
    ] })
  ] }) });
}
export {
  CallsAdmin as component
};
