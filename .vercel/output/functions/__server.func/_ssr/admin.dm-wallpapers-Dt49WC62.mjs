import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { aJ as AdminPageHeader, ae as Card, ac as Label, a0 as Input, aM as Switch, B as Button } from "./router-CYWPFaDK.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { W as WALLPAPER_CATEGORIES, w as wallpaperBackground } from "./dm-wallpapers-DZuMN-3o.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { c as Plus, d as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
const sb = supabase;
function AdminDmWallpapersPage() {
  const [rows, setRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [creating, setCreating] = reactExports.useState(false);
  const [draft, setDraft] = reactExports.useState({
    wallpaper_key: "",
    name: "",
    category: "Romantic",
    kind: "gradient",
    css_value: "",
    price_coins: 0,
    is_premium: false,
    is_featured: false
  });
  const refresh = async () => {
    setLoading(true);
    const {
      data,
      error
    } = await sb.from("dm_wallpapers").select("*").order("sort_order", {
      ascending: true
    });
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    refresh();
  }, []);
  const update = async (id, patch) => {
    const {
      error
    } = await sb.from("dm_wallpapers").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };
  const remove = async (id) => {
    if (!confirm("Delete this wallpaper? Users who own it will keep access, but it won't appear in the catalog.")) return;
    const {
      error
    } = await sb.from("dm_wallpapers").update({
      enabled: false
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Disabled");
    refresh();
  };
  const create = async () => {
    if (!draft.wallpaper_key || !draft.name) return toast.error("Key and name are required");
    setCreating(true);
    const {
      error
    } = await sb.from("dm_wallpapers").insert({
      ...draft,
      enabled: true,
      sort_order: (rows[rows.length - 1]?.sort_order ?? 100) + 10
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Wallpaper added");
    setDraft({
      wallpaper_key: "",
      name: "",
      category: "Romantic",
      kind: "gradient",
      css_value: "",
      price_coins: 0,
      is_premium: false,
      is_featured: false
    });
    refresh();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "DM Wallpapers", description: "Catalog of private-chat wallpapers, prices, and premium flags." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Add a new wallpaper" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Key (unique)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.wallpaper_key, onChange: (e) => setDraft((d) => ({
            ...d,
            wallpaper_key: e.target.value
          })), placeholder: "grad-sunset" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.name, onChange: (e) => setDraft((d) => ({
            ...d,
            name: e.target.value
          })), placeholder: "Sunset Bloom" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.category, onValueChange: (v) => setDraft((d) => ({
            ...d,
            category: v
          })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: WALLPAPER_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kind" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.kind, onValueChange: (v) => setDraft((d) => ({
            ...d,
            kind: v
          })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "solid", children: "Solid color" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "gradient", children: "Gradient" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "image", children: "Static image URL" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "animated", children: "Animated (GIF/WebP)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 lg:col-span-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: draft.kind === "solid" || draft.kind === "gradient" ? "CSS value" : "Asset URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.css_value, onChange: (e) => setDraft((d) => ({
            ...d,
            css_value: e.target.value
          })), placeholder: draft.kind === "gradient" ? "linear-gradient(135deg,#ff8ab3,#ffb27a)" : draft.kind === "solid" ? "#0b1220" : "https://.../wall.webp" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price (coins)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: draft.price_coins, onChange: (e) => setDraft((d) => ({
            ...d,
            price_coins: Number(e.target.value) || 0
          })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: draft.is_premium, onCheckedChange: (v) => setDraft((d) => ({
              ...d,
              is_premium: v
            })) }),
            " Premium"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: draft.is_featured, onCheckedChange: (v) => setDraft((d) => ({
              ...d,
              is_featured: v
            })) }),
            " Featured"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: create, disabled: creating, className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Add wallpaper"
        ] }) })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading catalog…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "divide-y", children: rows.map((w) => {
      let assetField = null;
      if (w.kind === "solid" || w.kind === "gradient") assetField = w.css_value;
      else assetField = w.asset_url;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-20 shrink-0 rounded-lg border", style: {
          background: wallpaperBackground(w),
          backgroundSize: "cover"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: w.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground", children: w.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground", children: w.kind }),
            !w.enabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-destructive/20 px-1.5 py-0.5 text-[10px] uppercase text-destructive", children: "Disabled" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: assetField || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, className: "w-24", defaultValue: w.price_coins, onBlur: (e) => update(w.id, {
            price_coins: Number(e.target.value) || 0
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: w.is_premium, onCheckedChange: (v) => update(w.id, {
              is_premium: v
            }) }),
            " Prem"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: w.is_featured, onCheckedChange: (v) => update(w.id, {
              is_featured: v
            }) }),
            " Feat"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: w.enabled, onCheckedChange: (v) => update(w.id, {
              enabled: v
            }) }),
            " On"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => remove(w.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] }, w.id);
    }) })
  ] });
}
export {
  AdminDmWallpapersPage as component
};
