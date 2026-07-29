import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { cJ as useFeedPrefs, L as useSoundPrefs, M as setSoundPref } from "./router-CYWPFaDK.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { R as RotateCcw, c as Plus, X } from "../_libs/lucide-react.mjs";
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
function FeedSettingsPanel() {
  const { prefs, setPrefs, reset } = useFeedPrefs();
  const soundPrefs = useSoundPrefs();
  const soundItems = [
    { key: "public_chat", label: "Public chatroom sounds" },
    { key: "private_chat", label: "Private message sounds" },
    { key: "notifications", label: "Notification sounds" },
    { key: "username_mention", label: "Username mention sound" },
    { key: "calls", label: "Voice / video call sounds" },
    { key: "radio_announcements", label: "Radio announcements & alerts" }
  ];
  const [kw, setKw] = reactExports.useState("");
  const [tag, setTag] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Feed settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Saved on this device." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            if (confirm("Reset feed settings to defaults?")) reset();
          },
          className: "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
            " Reset"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Display", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Select,
        {
          label: "Default tab",
          value: prefs.defaultTab,
          onChange: (v) => setPrefs({ defaultTab: v }),
          options: [
            { v: "foryou", l: "For You" },
            { v: "trending", l: "Trending" },
            { v: "latest", l: "Latest" },
            { v: "friends", l: "Friends" }
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Select,
        {
          label: "Sort posts by",
          value: prefs.sortOverride,
          onChange: (v) => setPrefs({ sortOverride: v }),
          options: [
            { v: "smart", l: "Smart (follow tab)" },
            { v: "latest", l: "Latest" },
            { v: "trending", l: "Trending" }
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Compact post cards", checked: prefs.compactCards, onChange: (b) => setPrefs({ compactCards: b }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Hide reaction & comment counts", checked: prefs.hideCounts, onChange: (b) => setPrefs({ hideCounts: b }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Hide media posts", checked: prefs.hideMedia, onChange: (b) => setPrefs({ hideMedia: b }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Autoplay videos", checked: prefs.autoplayVideos, onChange: (b) => setPrefs({ autoplayVideos: b }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Floating emoji effects", checked: prefs.emojiEffects, onChange: (b) => setPrefs({ emojiEffects: b }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Posting", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Select,
        {
          label: "Default post privacy",
          value: prefs.defaultPrivacy,
          onChange: (v) => setPrefs({ defaultPrivacy: v }),
          options: [
            { v: "public", l: "Public" },
            { v: "friends", l: "Friends only" }
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Post anonymously by default", checked: prefs.anonymousByDefault, onChange: (b) => setPrefs({ anonymousByDefault: b }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Notifications", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Sound on new posts", checked: prefs.postSound, onChange: (b) => setPrefs({ postSound: b }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Friend posts", checked: prefs.notifyFriendPosts, onChange: (b) => setPrefs({ notifyFriendPosts: b }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Comments on my posts", checked: prefs.notifyComments, onChange: (b) => setPrefs({ notifyComments: b }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Reactions on my posts", checked: prefs.notifyReactions, onChange: (b) => setPrefs({ notifyReactions: b }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Direct messages", checked: prefs.notifyDMs, onChange: (b) => setPrefs({ notifyDMs: b }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Sounds", children: soundItems.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Toggle,
      {
        label: s.label,
        checked: soundPrefs[s.key] !== false,
        onChange: (b) => setSoundPref(s.key, b)
      },
      s.key
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Muted keywords", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Hide posts containing these words." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChipInput,
        {
          placeholder: "Add a word and press Enter",
          value: kw,
          setValue: setKw,
          items: prefs.mutedKeywords,
          onAdd: (v) => {
            const w = v.trim().toLowerCase();
            if (!w || prefs.mutedKeywords.includes(w)) return;
            setPrefs({ mutedKeywords: [...prefs.mutedKeywords, w] });
          },
          onRemove: (w) => setPrefs({ mutedKeywords: prefs.mutedKeywords.filter((x) => x !== w) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Muted hashtags", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Hide posts with these tags. Without the #." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChipInput,
        {
          placeholder: "e.g. spoilers",
          value: tag,
          setValue: setTag,
          items: prefs.mutedHashtags,
          prefix: "#",
          onAdd: (v) => {
            const w = v.trim().toLowerCase().replace(/^#/, "");
            if (!w || prefs.mutedHashtags.includes(w)) return;
            setPrefs({ mutedHashtags: [...prefs.mutedHashtags, w] });
          },
          onRemove: (w) => setPrefs({ mutedHashtags: prefs.mutedHashtags.filter((x) => x !== w) })
        }
      )
    ] })
  ] });
}
function Section({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2 rounded-xl border border-border bg-background/40 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children })
  ] });
}
function Toggle({ label, checked, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-accent/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        role: "switch",
        "aria-checked": checked,
        onClick: () => onChange(!checked),
        className: `relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}` })
      }
    )
  ] });
}
function Select({ label, value, onChange, options }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "select",
      {
        value,
        onChange: (e) => onChange(e.target.value),
        className: "rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring",
        children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.v, children: o.l }, o.v))
      }
    )
  ] });
}
function ChipInput({
  placeholder,
  value,
  setValue,
  items,
  onAdd,
  onRemove,
  prefix
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: (e) => {
          e.preventDefault();
          onAdd(value);
          setValue("");
        },
        className: "flex items-center gap-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value,
              onChange: (e) => setValue(e.target.value),
              placeholder,
              className: "flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: "inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
            " Add"
          ] })
        ]
      }
    ),
    items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs", children: [
      prefix,
      it,
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onRemove(it), className: "rounded-full p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive", "aria-label": "Remove", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
    ] }, it)) })
  ] });
}
export {
  FeedSettingsPanel
};
