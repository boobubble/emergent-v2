import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { aQ as useAccent, aJ as AdminPageHeader, ae as Card, af as CardContent, ac as Label, aR as ACCENTS, aK as useAdminSetting, B as Button, a0 as Input, g as useChat } from "./router-CYWPFaDK.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { u as useThemeMode } from "./use-theme-mode-DLsH6S68.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a7 as Sun, a8 as Moon, aO as Monitor, a0 as LoaderCircle, c as Plus, X, I as Image, bH as Upload, d as Trash2 } from "../_libs/lucide-react.mjs";
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
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
const BRAND_DEFAULTS = {
  logo_light: "",
  logo_dark: "",
  favicon_light: "",
  favicon_dark: "",
  feed_light: "",
  feed_dark: "",
  chat_light: "",
  chat_dark: "",
  sizes: {
    logo: {
      w: 160,
      h: 48
    },
    favicon: {
      w: 32,
      h: 32
    },
    feed: {
      w: 140,
      h: 40
    },
    chat: {
      w: 120,
      h: 36
    }
  },
  rooms: {}
};
const SIGNED_TTL = 60 * 60 * 24 * 365 * 10;
const GLOBAL_GROUPS = [{
  title: "Main Logo",
  description: "Shown across header and auth screens.",
  key: "logo",
  hint: "SVG or PNG, up to 2MB"
}, {
  title: "Favicon",
  description: "Browser tab icon (fallback when no room favicon).",
  key: "favicon",
  hint: "32×32 PNG or ICO"
}, {
  title: "Feed Page Logo",
  description: "Top bar of the Feed.",
  key: "feed",
  hint: "Square PNG/SVG"
}, {
  title: "Chatroom Logo",
  description: "Sidebar logo (fallback when room has none).",
  key: "chat",
  hint: "Square PNG/SVG"
}];
const ROOM_GROUPS = [{
  title: "Chat Logo",
  key: "chat",
  hint: "Shown in this room's header"
}, {
  title: "Favicon",
  key: "favicon",
  hint: "Browser tab icon while in this room"
}, {
  title: "Feed Banner",
  key: "feed",
  hint: "Optional per-room feed branding"
}];
function Appearance() {
  const {
    accent,
    setAccent
  } = useAccent();
  const {
    mode,
    setMode
  } = useThemeMode();
  const modes = [{
    id: "light",
    label: "Light",
    icon: Sun
  }, {
    id: "dark",
    label: "Dark",
    icon: Moon
  }, {
    id: "system",
    label: "System",
    icon: Monitor
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Appearance", description: "Theme mode, accent color, brand assets, and per-room branding." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Theme mode" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 sm:max-w-sm", children: modes.map((m) => {
        const I = m.icon;
        const active = mode === m.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setMode(m.id), className: `flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition ${active ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted/40"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "h-4 w-4" }),
          m.label
        ] }, m.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Accent color" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-6", children: ACCENTS.map((a) => {
        const active = accent === a.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setAccent(a.id), className: `flex flex-col items-center gap-2 rounded-lg border p-3 text-[11px] transition ${active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-8 w-8 rounded-full", style: {
            background: a.gradient
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: a.label })
        ] }, a.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WhiteLabelCard, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BrandAssetsCard, {})
  ] });
}
const WHITELABEL_DEFAULTS = {
  name: "",
  shortName: "",
  tagline: "",
  company: "",
  supportEmail: "",
  supportUrl: "",
  privacyUrl: "",
  termsUrl: "",
  copyright: "",
  footerText: "",
  themeColor: "#3B82F6",
  accentColor: "#3B82F6",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: "",
  placeholderImage: "",
  appleTouchIcon: "",
  senderName: "",
  replyTo: "",
  defaultLanguage: "en",
  timezone: "UTC",
  currency: "USD",
  assistantName: ""
};
function WhiteLabelCard() {
  const {
    values,
    set,
    save,
    saving
  } = useAdminSetting("whitelabel", WHITELABEL_DEFAULTS);
  const field = (k, label, placeholder = "", type = "text") => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `wl-${String(k)}`, className: "text-xs", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `wl-${String(k)}`, type, value: values[k] ?? "", placeholder, onChange: (e) => set(k, e.target.value) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: "White-Label Branding" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Rename the platform, set legal URLs, meta tags and email sender." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => save(), disabled: saving, children: saving ? "Saving…" : "Save" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      field("name", "Platform name", "Acme"),
      field("shortName", "Short name (PWA)", "Acme")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      field("tagline", "Tagline"),
      field("company", "Company / legal entity")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      field("supportEmail", "Support email", "support@acme.com", "email"),
      field("supportUrl", "Support URL", "https://help.acme.com", "url")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      field("privacyUrl", "Privacy URL", "/p/privacy", "url"),
      field("termsUrl", "Terms URL", "/p/terms", "url")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      field("copyright", "Copyright text", "© 2026 Acme Inc."),
      field("footerText", "Extra footer text")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Theme color" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "color", className: "h-9 w-14 p-1", value: values.themeColor || "#3B82F6", onChange: (e) => set("themeColor", e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.themeColor, onChange: (e) => set("themeColor", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Accent color" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "color", className: "h-9 w-14 p-1", value: values.accentColor || "#3B82F6", onChange: (e) => set("accentColor", e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.accentColor, onChange: (e) => set("accentColor", e.target.value) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs font-semibold text-muted-foreground", children: "SEO / Social" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mb-3", children: [
        "Meta titles, descriptions, keywords, and OG tags are managed in",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/seo", className: "text-primary underline font-medium", children: "SEO Manager" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        field("appleTouchIcon", "Apple touch icon URL", "/apple-touch-icon.png", "url"),
        field("placeholderImage", "Default placeholder image URL", "https://…/placeholder.png", "url")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs font-semibold text-muted-foreground", children: "Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        field("senderName", "Email sender name"),
        field("replyTo", "Reply-To address", "support@acme.com", "email")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs font-semibold text-muted-foreground", children: "Locale" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
        field("defaultLanguage", "Default language", "en"),
        field("timezone", "Timezone", "UTC"),
        field("currency", "Currency", "USD")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs font-semibold text-muted-foreground", children: "AI Assistant" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: field("assistantName", "Assistant display name", "Aria") })
    ] })
  ] }) });
}
function BrandAssetsCard() {
  const {
    values,
    patch,
    save,
    saving
  } = useAdminSetting("branding", BRAND_DEFAULTS);
  const sizes = values.sizes ?? {};
  const rooms = values.rooms ?? {};
  const {
    state
  } = useChat();
  const availableRooms = reactExports.useMemo(() => Object.values(state.rooms || {}).map((r) => ({
    id: r.id,
    name: r.name
  })), [state.rooms]);
  const [selectedRoom, setSelectedRoom] = reactExports.useState("");
  function getCfg(key) {
    const v = sizes[key];
    if (v == null) return {};
    if (typeof v === "number") return {
      w: v,
      h: v
    };
    return v;
  }
  function setWH(key, axis, n) {
    const cur = getCfg(key);
    patch({
      sizes: {
        ...sizes,
        [key]: {
          ...cur,
          [axis]: n || void 0
        }
      }
    });
  }
  function setFit(key, fit) {
    const cur = getCfg(key);
    patch({
      sizes: {
        ...sizes,
        [key]: {
          ...cur,
          fit
        }
      }
    });
  }
  function setLock(key, lock) {
    const cur = getCfg(key);
    patch({
      sizes: {
        ...sizes,
        [key]: {
          ...cur,
          lock
        }
      }
    });
  }
  function setPad(key, side, n) {
    const cur = getCfg(key);
    const nextPad = {
      ...cur.pad ?? {},
      [side]: Number.isFinite(n) && n > 0 ? n : void 0
    };
    patch({
      sizes: {
        ...sizes,
        [key]: {
          ...cur,
          pad: nextPad
        }
      }
    });
  }
  function setRoom(roomId, partial) {
    const next = {
      ...rooms[roomId] ?? {},
      ...partial
    };
    patch({
      rooms: {
        ...rooms,
        [roomId]: next
      }
    });
  }
  function removeRoom(roomId) {
    const next = {
      ...rooms
    };
    delete next[roomId];
    patch({
      rooms: next
    });
  }
  const configuredRoomIds = Object.keys(rooms);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Brand assets" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: save, disabled: saving, children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }),
        "Saving"
      ] }) : "Save changes" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Upload light/dark variants for each section. The correct variant is chosen automatically based on the active theme. Sizes apply uniformly to every place that section renders." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 text-sm font-semibold", children: "Section sizes (px)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 text-xs text-muted-foreground", children: [
        "Set width × height for each slot. Enable ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Lock" }),
        " to keep the original layout — the logo fits inside the existing box and never shifts the UI, regardless of upload dimensions."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: GLOBAL_GROUPS.map((g) => {
        const cfg = getCfg(g.key);
        const lightUrl = values[`${g.key}_light`] || "";
        const darkUrl = values[`${g.key}_dark`] || "";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] uppercase tracking-wide text-muted-foreground", children: g.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 8, max: 1024, value: cfg.w ?? "", placeholder: "W", disabled: !!cfg.lock, onChange: (e) => setWH(g.key, "w", Number(e.target.value)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "×" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 8, max: 1024, value: cfg.h ?? "", placeholder: "H", disabled: !!cfg.lock, onChange: (e) => setWH(g.key, "h", Number(e.target.value)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cfg.fit ?? "contain", onValueChange: (v) => setFit(g.key, v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-[110px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "contain", children: "Contain" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cover", children: "Cover (crop)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fill", children: "Stretch" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-[11px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "h-3.5 w-3.5 accent-primary", checked: !!cfg.lock, onChange: (e) => setLock(g.key, e.target.checked) }),
            "Lock to layout (don't change UI — fit logo inside existing slot)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 text-[10px] uppercase tracking-wide text-muted-foreground", children: "Padding (px)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-1.5", children: ["t", "r", "b", "l"].map((side) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 text-[10px] uppercase text-muted-foreground", children: side }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 128, value: cfg.pad?.[side] ?? "", placeholder: "0", className: "h-8 px-1.5 text-xs", onChange: (e) => setPad(g.key, side, Number(e.target.value)) })
            ] }, side)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(LivePreview, { label: cfg.lock ? "Preview (lock-to-layout)" : "Live preview", cfg, lightUrl, darkUrl })
        ] }, g.key);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 text-sm font-semibold", children: "Brand text (per page)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-xs text-muted-foreground", children: "Custom wordmark text for each page. Automatically hidden when a logo image is uploaded for the same section." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: [{
        key: "logo",
        label: "Header / Auth & Welcome"
      }, {
        key: "feed",
        label: "Feed page"
      }, {
        key: "chat",
        label: "Chat sidebar"
      }].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] uppercase tracking-wide text-muted-foreground", children: t.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.texts?.[t.key] ?? "", placeholder: "e.g. Palrgo", maxLength: 32, onChange: (e) => patch({
          texts: {
            ...values.texts ?? {},
            [t.key]: e.target.value
          }
        }) })
      ] }, t.key)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: GLOBAL_GROUPS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: g.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: g.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UploadSlot, { theme: "light", scope: "global", slotKey: g.key, value: values[`${g.key}_light`] || "", hint: g.hint, onChange: (url) => patch({
          [`${g.key}_light`]: url
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(UploadSlot, { theme: "dark", scope: "global", slotKey: g.key, value: values[`${g.key}_dark`] || "", hint: g.hint, onChange: (url) => patch({
          [`${g.key}_dark`]: url
        }) })
      ] })
    ] }, g.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Per-room branding" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Override logos and favicon per chat room (space)." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedRoom, onValueChange: setSelectedRoom, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-44 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select room…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              availableRooms.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5 text-xs text-muted-foreground", children: "No rooms loaded." }),
              availableRooms.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: r.id, children: [
                "#",
                r.name
              ] }, r.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: !selectedRoom || !!rooms[selectedRoom], onClick: () => {
            if (selectedRoom && !rooms[selectedRoom]) setRoom(selectedRoom, {});
          }, className: "gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
            "Add"
          ] })
        ] })
      ] }),
      configuredRoomIds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground", children: "No room overrides yet. Pick a room above and click Add." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: configuredRoomIds.map((rid) => {
        const meta = availableRooms.find((r) => r.id === rid);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-background p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-sm font-semibold", children: [
                "#",
                meta?.name ?? rid
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[10px] text-muted-foreground", children: rid })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => removeRoom(rid), title: "Remove room overrides", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) })
          ] }),
          ROOM_GROUPS.map((rg) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", children: rg.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UploadSlot, { theme: "light", scope: `room/${rid}`, slotKey: rg.key, value: rooms[rid]?.[`${rg.key}_light`] || "", hint: rg.hint, onChange: (url) => setRoom(rid, {
                [`${rg.key}_light`]: url
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(UploadSlot, { theme: "dark", scope: `room/${rid}`, slotKey: rg.key, value: rooms[rid]?.[`${rg.key}_dark`] || "", hint: rg.hint, onChange: (url) => setRoom(rid, {
                [`${rg.key}_dark`]: url
              }) })
            ] })
          ] }, rg.key))
        ] }, rid);
      }) })
    ] })
  ] }) });
}
function UploadSlot({
  theme,
  scope,
  slotKey,
  value,
  hint,
  onChange
}) {
  const inputRef = reactExports.useRef(null);
  const [busy, setBusy] = reactExports.useState(false);
  async function handleFile(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large (max 2MB)");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const safeScope = scope.replace(/[^a-zA-Z0-9/_-]/g, "_");
      const path = `${safeScope}/${slotKey}/${theme}-${Date.now()}.${ext}`;
      const {
        error: upErr
      } = await supabase.storage.from("brand-assets").upload(path, file, {
        upsert: true,
        contentType: file.type
      });
      if (upErr) throw upErr;
      const {
        data: signed,
        error: sErr
      } = await supabase.storage.from("brand-assets").createSignedUrl(path, SIGNED_TTL);
      if (sErr || !signed) throw sErr ?? new Error("Failed to sign URL");
      onChange(signed.signedUrl);
      toast.success(`Uploaded ${theme} ${slotKey}`);
    } catch (e) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border ${theme === "dark" ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white"}`, children: value ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: value, alt: "", className: "h-full w-full object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-5 w-5 text-muted-foreground" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: [
        theme,
        " theme"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] text-muted-foreground", children: value ? "Uploaded" : hint })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: inputRef, type: "file", accept: "image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon,image/vnd.microsoft.icon", className: "hidden", onChange: (e) => {
      const f = e.target.files?.[0];
      if (f) void handleFile(f);
      e.target.value = "";
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: busy, onClick: () => inputRef.current?.click(), className: "gap-1.5", children: [
      busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
      value ? "Replace" : "Upload"
    ] }),
    value && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", disabled: busy, onClick: () => onChange(""), title: "Remove", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
  ] });
}
function LivePreview({
  label,
  cfg,
  lightUrl,
  darkUrl
}) {
  const fit = cfg.fit ?? "contain";
  const padStyle = {
    paddingTop: cfg.pad?.t || void 0,
    paddingRight: cfg.pad?.r || void 0,
    paddingBottom: cfg.pad?.b || void 0,
    paddingLeft: cfg.pad?.l || void 0,
    boxSizing: "border-box"
  };
  const SLOT_W = 180;
  const SLOT_H = 56;
  function Tile({
    theme,
    url
  }) {
    const bg = theme === "dark" ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-200";
    const imgStyle = cfg.lock ? {
      width: "100%",
      height: "100%",
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: fit,
      objectPosition: "center",
      ...padStyle
    } : {
      width: cfg.w,
      height: cfg.h,
      maxWidth: "100%",
      objectFit: fit,
      objectPosition: "center",
      ...padStyle
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: theme }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative grid place-items-center overflow-hidden rounded-md border ${bg}`, style: {
        width: SLOT_W,
        height: SLOT_H
      }, children: [
        cfg.lock && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 rounded-md border border-dashed border-primary/40" }),
        url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: "", style: imgStyle }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
          "no ",
          theme,
          " logo"
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 rounded-md border border-border bg-muted/10 p-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1.5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
        "slot ",
        SLOT_W,
        "×",
        SLOT_H,
        " · ",
        cfg.lock ? "locked" : `${cfg.w ?? "?"}×${cfg.h ?? "?"}`,
        " · ",
        fit
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tile, { theme: "light", url: lightUrl }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tile, { theme: "dark", url: darkUrl })
    ] })
  ] });
}
export {
  Appearance as component
};
