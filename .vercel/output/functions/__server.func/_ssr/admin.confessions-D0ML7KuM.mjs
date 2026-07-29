import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { aK as useAdminSetting, b as useServerFn, aJ as AdminPageHeader, B as Button, ae as Card, af as CardContent, aG as AdminToggle, ac as Label, a0 as Input } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { C as CONFESSIONS_DEFAULTS, R as REACTION_META } from "./confessions-config-OPhfPAXP.mjs";
import { g as getConfessionStats } from "./confessions.functions-BBpBF4R_.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { b as Save, aY as MessageSquareHeart, d as Trash2, c as Plus } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
const MODE_LABEL = {
  fully_anonymous: "Fully Anonymous (Anonymous User)",
  random_id: "Random Identity (Confessor #145)",
  random_avatar: "Random Avatar Identity (🐼 Panda #23)",
  username: "Registered Username"
};
const KIND_LABEL = {
  text: "Text",
  poll: "Poll",
  image: "Image",
  question: "Question",
  advice: "Advice"
};
function AdminConfessionsPage() {
  const {
    values,
    set,
    patch,
    save,
    saving
  } = useAdminSetting("confessions", CONFESSIONS_DEFAULTS);
  const statsFn = useServerFn(getConfessionStats);
  const {
    data: stats
  } = useQuery({
    queryKey: ["confession-stats"],
    queryFn: () => statsFn({})
  });
  const setMode = (m, v) => patch({
    anonymousModes: {
      ...values.anonymousModes,
      [m]: v
    }
  });
  const setKind = (k, v) => patch({
    kinds: {
      ...values.kinds,
      [k]: v
    }
  });
  const setReaction = (r, v) => patch({
    reactions: {
      ...values.reactions,
      [r]: v
    }
  });
  const setCoins = (k, v) => patch({
    coins: {
      ...values.coins,
      [k]: v
    }
  });
  const setLevel = (k, v) => patch({
    level: {
      ...values.level,
      [k]: v
    }
  });
  const setMod = (k, v) => patch({
    moderation: {
      ...values.moderation,
      [k]: v
    }
  });
  const setLb = (k, v) => patch({
    leaderboards: {
      ...values.leaderboards,
      [k]: v
    }
  });
  const setExpiry = (k, v) => patch({
    expiry: {
      ...values.expiry,
      [k]: v
    }
  });
  const [newCatLabel, setNewCatLabel] = reactExports.useState("");
  const [newCatEmoji, setNewCatEmoji] = reactExports.useState("✨");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Confessions", description: "Standalone anonymous-confession community. Configure identity modes, categories, moderation and rewards.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
      " ",
      saving ? "Saving…" : "Save changes"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquareHeart, { className: "h-5 w-5 text-primary" }), title: "Enable Confessions module", desc: "Master switch. When off, the /confessions page returns a disabled notice.", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: values.enabled, onCheckedChange: (v) => set("enabled", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Route slug" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: values.routeSlug, onValueChange: (v) => set("routeSlug", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "confessions", children: "/confessions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "confess", children: "/confess" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: "UI uses /confessions; label is for display references." })
      ] }) })
    ] }) }),
    stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Total", value: stats.total }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Today", value: stats.today }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Top category", value: stats.byCategory[0]?.category ?? "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Most liked", value: stats.topConfessions[0]?.like_count ?? 0 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Anonymous Modes", desc: "Identity options available when posting.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border rounded-lg border border-border", children: Object.keys(MODE_LABEL).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: MODE_LABEL[m], compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.anonymousModes[m], onCheckedChange: (v) => setMode(m, v) }) }, m)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Confession Types", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border rounded-lg border border-border", children: Object.keys(KIND_LABEL).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: KIND_LABEL[k], compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.kinds[k], onCheckedChange: (v) => setKind(k, v) }) }, k)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Categories", desc: "Used for filtering and the composer.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      values.categories.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-border p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "w-20 text-center", value: c.emoji ?? "", onChange: (e) => patch({
          categories: values.categories.map((x, idx) => idx === i ? {
            ...x,
            emoji: e.target.value
          } : x)
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "flex-1", value: c.label, onChange: (e) => patch({
          categories: values.categories.map((x, idx) => idx === i ? {
            ...x,
            label: e.target.value,
            key: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_")
          } : x)
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => patch({
          categories: values.categories.filter((_, idx) => idx !== i)
        }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
      ] }, c.key)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-dashed border-border p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "w-20 text-center", value: newCatEmoji, onChange: (e) => setNewCatEmoji(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "flex-1", placeholder: "New category…", value: newCatLabel, onChange: (e) => setNewCatLabel(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1", disabled: !newCatLabel.trim(), onClick: () => {
          patch({
            categories: [...values.categories, {
              emoji: newCatEmoji,
              label: newCatLabel.trim(),
              key: newCatLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")
            }]
          });
          setNewCatLabel("");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " Add"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Reactions", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border rounded-lg border border-border", children: Object.keys(REACTION_META).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: `${REACTION_META[r].emoji} ${REACTION_META[r].label}`, compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.reactions[r], onCheckedChange: (v) => setReaction(r, v) }) }, r)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Engagement", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-border rounded-lg border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Allow Replies", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.allowReplies, onCheckedChange: (v) => set("allowReplies", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Allow Anonymous Replies", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.allowAnonymousReplies, onCheckedChange: (v) => set("allowAnonymousReplies", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Allow Reports", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.allowReports, onCheckedChange: (v) => set("allowReports", v) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Coin Integration", desc: "Costs use the existing economy/coin wallet.", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Enable coin costs", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.coins.enabled, onCheckedChange: (v) => setCoins("enabled", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Post cost", value: values.coins.postCost, onChange: (v) => setCoins("postCost", v), disabled: !values.coins.enabled }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Pin cost", value: values.coins.pinCost, onChange: (v) => setCoins("pinCost", v), disabled: !values.coins.enabled }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Highlight cost", value: values.coins.highlightCost, onChange: (v) => setCoins("highlightCost", v), disabled: !values.coins.enabled })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Level / XP Integration", desc: "Reuses existing user levels.", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Enable level requirements", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.level.enabled, onCheckedChange: (v) => setLevel("enabled", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Min level to post", value: values.level.minLevelToPost, onChange: (v) => setLevel("minLevelToPost", v), disabled: !values.level.enabled }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Min level for anon reply", value: values.level.minLevelForAnonReply, onChange: (v) => setLevel("minLevelForAnonReply", v), disabled: !values.level.enabled }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Min level for images", value: values.level.minLevelForImages, onChange: (v) => setLevel("minLevelForImages", v), disabled: !values.level.enabled })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Moderation", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-border rounded-lg border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Approval required", desc: "Confessions go to a queue until approved.", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.moderation.approvalRequired, onCheckedChange: (v) => setMod("approvalRequired", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Auto moderation", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.moderation.autoModeration, onCheckedChange: (v) => setMod("autoModeration", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Bad word filter", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.moderation.badWordFilter, onCheckedChange: (v) => setMod("badWordFilter", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Link filter", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.moderation.linkFilter, onCheckedChange: (v) => setMod("linkFilter", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Spam detection", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.moderation.spamDetection, onCheckedChange: (v) => setMod("spamDetection", v) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Expiry", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Default expiry" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: values.expiry.defaultMode, onValueChange: (v) => setExpiry("defaultMode", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "never", children: "Never" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "24h", children: "24 hours" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "7d", children: "7 days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "30d", children: "30 days" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "User-selectable per post", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.expiry.userSelectable, onCheckedChange: (v) => setExpiry("userSelectable", v) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Leaderboards", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-border rounded-lg border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Trending", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.leaderboards.trending, onCheckedChange: (v) => setLb("trending", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Most replied", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.leaderboards.mostReplied, onCheckedChange: (v) => setLb("mostReplied", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Most liked", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.leaderboards.mostLiked, onCheckedChange: (v) => setLb("mostLiked", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Confession of the day", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.leaderboards.dailyPick, onCheckedChange: (v) => setLb("dailyPick", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { title: "Confession of the week", compact: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { size: "sm", checked: values.leaderboards.weeklyPick, onCheckedChange: (v) => setLb("weeklyPick", v) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "SEO", desc: "Page metadata for /confessions is managed in SEO Manager.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Edit title, description, keywords, OG tags, and robots for the Confessions page in",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/seo", className: "text-primary underline font-medium", children: "SEO Manager" }),
      " ",
      "(Page SEO → Confessions)."
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
      " ",
      saving ? "Saving…" : "Save changes"
    ] }) })
  ] });
}
function Row({
  icon,
  title,
  desc,
  compact,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 ${compact ? "px-3 py-2.5" : ""}`, children: [
    icon,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: compact ? "text-sm font-medium" : "text-sm font-semibold", children: title }),
      desc && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: desc })
    ] }),
    children
  ] });
}
function Section({
  title,
  desc,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: title }),
      desc && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: desc })
    ] }),
    children
  ] }) });
}
function NumberField({
  label,
  value,
  onChange,
  disabled
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value, disabled, onChange: (e) => onChange(Math.max(0, Number(e.target.value) || 0)), className: "mt-1" })
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-bold", children: value })
  ] });
}
export {
  AdminConfessionsPage as component
};
