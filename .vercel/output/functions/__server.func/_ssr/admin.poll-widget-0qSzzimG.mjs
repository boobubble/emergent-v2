import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aK as useAdminSetting, aJ as AdminPageHeader, B as Button, ae as Card, af as CardContent, aG as AdminToggle, ac as Label, a0 as Input } from "./router-CYWPFaDK.mjs";
import { P as POLL_WIDGET_DEFAULTS } from "./poll-widget-config-BaTQ_Bgs.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { b as Save, V as Vote } from "../_libs/lucide-react.mjs";
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
function PollWidgetAdminPage() {
  const {
    values,
    set,
    save,
    saving
  } = useAdminSetting("poll_widget", POLL_WIDGET_DEFAULTS);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Chatroom Poll Widget", description: "Surface poll previews inside chatrooms to drive traffic to the Social Feed. Voting, comments and engagement remain on the feed — chatrooms only discover polls.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
      " ",
      saving ? "Saving…" : "Save changes"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4 p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-5 w-5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Master switch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Turn the chatroom poll discovery widget on or off across all rooms." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: values.enabled, onCheckedChange: (v) => set("enabled", v) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 font-semibold", children: "Poll categories" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Show Trending Polls", hint: "Highest trending score across the feed.", checked: values.showTrending, onChange: (v) => set("showTrending", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Show Poll of the Day", hint: "Best-performing poll posted in the last 24 hours.", checked: values.showPollOfDay, onChange: (v) => set("showPollOfDay", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Show Creator Polls", hint: "Top non-anonymous poll from a feed creator.", checked: values.showCreatorPolls, onChange: (v) => set("showCreatorPolls", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Show Weekly Community Vote", hint: "Most-voted poll in the past 7 days.", checked: values.showWeeklyVote, onChange: (v) => set("showWeeklyVote", v) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 font-semibold", children: "Preview behaviour" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Show vote counts", hint: "Display aggregate vote totals on each preview card.", checked: values.showVoteCounts, onChange: (v) => set("showVoteCounts", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Redirect to Feed for voting", hint: "Show the “Vote Now” button that links to the poll's page on the feed.", checked: values.redirectToFeed, onChange: (v) => set("redirectToFeed", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 pt-3 sm:max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lifetime", children: "Poll lifetime (days)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "lifetime", type: "number", min: 1, max: 60, value: values.pollLifetimeDays, onChange: (e) => set("pollLifetimeDays", Math.max(1, Math.min(60, Number(e.target.value) || 1))) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Used only to compute the “time remaining” / “Open vs Closed” label shown on the preview card." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: "How this works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-2 list-disc space-y-1 pl-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Polls are created and voted on inside the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Social Feed" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "This widget only previews polls inside chatrooms — no votes are recorded from chat." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "The CTA opens the poll's feed page, where the normal voting UI is shown." })
      ] })
    ] }) })
  ] });
}
function ToggleRow({
  label,
  hint,
  checked,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 border-b border-border/40 py-2 last:border-b-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: hint })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked, onCheckedChange: onChange })
  ] });
}
export {
  PollWidgetAdminPage as component
};
