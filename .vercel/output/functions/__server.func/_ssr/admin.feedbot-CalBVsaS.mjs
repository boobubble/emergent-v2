import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, aJ as AdminPageHeader, aG as AdminToggle } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { g as getFeedbotSettings, s as saveFeedbotSettings, p as provisionFeedbot, a as sendTestAnnouncement, l as listChatroomsForFeedbot } from "./feedbot.functions-DszEzFwO.mjs";
import { a as CATEGORY_LABELS } from "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { aj as Send, bj as BadgeCheck, M as Megaphone } from "../_libs/lucide-react.mjs";
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
import "../_libs/lovable.dev__email-js.mjs";
import "../_libs/react-i18next.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/zod.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
const DEFAULTS = {
  enabled: true,
  bot_user_id: null,
  event_flags: {
    feed_post: true,
    profile_avatar: true,
    profile_cover: true,
    profile_bio: true,
    new_member: true,
    competition_started: true,
    competition_vote: false,
    competition_winner: true,
    radio_live: true,
    chatroom_created: true,
    level_up: true
  },
  target_chatrooms: [],
  min_interval_seconds: 300,
  digest_mode: false,
  daily_summary_enabled: true,
  daily_summary_time: "21:00"
};
function AdminFeedbotPage() {
  const qc = useQueryClient();
  const getSettings = useServerFn(getFeedbotSettings);
  const saveSettings = useServerFn(saveFeedbotSettings);
  const provision = useServerFn(provisionFeedbot);
  const testFn = useServerFn(sendTestAnnouncement);
  const listRooms = useServerFn(listChatroomsForFeedbot);
  const settingsQ = useQuery({
    queryKey: ["feedbot-settings"],
    queryFn: () => getSettings()
  });
  const roomsQ = useQuery({
    queryKey: ["feedbot-rooms"],
    queryFn: () => listRooms()
  });
  const [state, setState] = reactExports.useState(DEFAULTS);
  reactExports.useEffect(() => {
    if (settingsQ.data) {
      setState({
        ...DEFAULTS,
        ...settingsQ.data,
        event_flags: {
          ...DEFAULTS.event_flags,
          ...settingsQ.data.event_flags ?? {}
        }
      });
    }
  }, [settingsQ.data]);
  const saveMut = useMutation({
    mutationFn: (patch) => saveSettings({
      data: patch
    }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["feedbot-settings"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const provisionMut = useMutation({
    mutationFn: () => provision(),
    onSuccess: (r) => {
      toast.success(r.existed ? "FeedBot already provisioned" : "FeedBot created");
      qc.invalidateQueries({
        queryKey: ["feedbot-settings"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const testMut = useMutation({
    mutationFn: () => testFn(),
    onSuccess: (r) => toast.success(`Sent to ${r.sent} chatroom${r.sent === 1 ? "" : "s"}`),
    onError: (e) => toast.error(e.message)
  });
  function toggleFlag(k, v) {
    const next = {
      ...state.event_flags,
      [k]: v
    };
    setState({
      ...state,
      event_flags: next
    });
    saveMut.mutate({
      event_flags: next
    });
  }
  function toggleRoom(id) {
    const set = new Set(state.target_chatrooms);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    const next = Array.from(set);
    setState({
      ...state,
      target_chatrooms: next
    });
    saveMut.mutate({
      target_chatrooms: next
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "FeedBot", description: "The official system bot that bridges the Feed with Chatrooms.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => testMut.mutate(), disabled: testMut.isPending || !state.bot_user_id || state.target_chatrooms.length === 0, className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3.5 w-3.5" }),
      " Test announcement"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mb-6 rounded-xl border border-border bg-card/50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-4 w-4 text-primary" }),
          " Bot account"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: state.bot_user_id ? "FeedBot is provisioned and ready." : "Provision the single official FeedBot account before enabling announcements." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => provisionMut.mutate(), disabled: provisionMut.isPending, className: "rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium disabled:opacity-50", children: state.bot_user_id ? "Refresh profile" : "Provision FeedBot" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mb-6 rounded-xl border border-border bg-card/50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Master switch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Turn FeedBot on or off." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: state.enabled, onCheckedChange: (v) => {
        setState({
          ...state,
          enabled: v
        });
        saveMut.mutate({
          enabled: v
        });
      } })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-6 rounded-xl border border-border bg-card/50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "mr-1 inline h-4 w-4" }),
        " Announcement categories"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: Object.entries(CATEGORY_LABELS).map(([key, label]) => {
        if (key === "daily_summary") return null;
        const on = state.event_flags[key] !== false;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: on, onCheckedChange: (v) => toggleFlag(key, v) })
        ] }, key);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-6 rounded-xl border border-border bg-card/50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-semibold", children: "Target chatrooms" }),
      roomsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Loading…" }) : !roomsQ.data || roomsQ.data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No chatrooms available yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: roomsQ.data.map((r) => {
        const active = state.target_chatrooms.includes(r.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleRoom(r.id), className: "rounded-full border px-3 py-1 text-xs transition " + (active ? "border-primary bg-primary/20 text-primary" : "border-border bg-background/50 text-muted-foreground hover:text-foreground"), children: r.name }, r.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-6 rounded-xl border border-border bg-card/50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-semibold", children: "Spam protection" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mb-3 flex flex-col gap-1 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Minimum time between the same category in the same chatroom (seconds)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 30, max: 3600, step: 30, value: state.min_interval_seconds, onChange: (e) => setState({
          ...state,
          min_interval_seconds: Number(e.target.value)
        }), onBlur: () => saveMut.mutate({
          min_interval_seconds: state.min_interval_seconds
        }), className: "w-40 rounded-lg border border-border bg-background px-2 py-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Combine multiple activities into a single digest post" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: state.digest_mode, onCheckedChange: (v) => {
          setState({
            ...state,
            digest_mode: v
          });
          saveMut.mutate({
            digest_mode: v
          });
        } })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-border bg-card/50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-semibold", children: "Daily AI summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Post daily community highlights at 21:00 IST" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: state.daily_summary_enabled, onCheckedChange: (v) => {
          setState({
            ...state,
            daily_summary_enabled: v
          });
          saveMut.mutate({
            daily_summary_enabled: v
          });
        } })
      ] })
    ] })
  ] });
}
export {
  AdminFeedbotPage as component
};
