import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { aJ as AdminPageHeader, ae as Card, ac as Label, aM as Switch, a0 as Input, B as Button } from "./router-CYWPFaDK.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
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
import "../_libs/lucide-react.mjs";
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
function AdminChatThemesPage() {
  const [rows, setRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [override, setOverride] = reactExports.useState("");
  const [grantUser, setGrantUser] = reactExports.useState("");
  const [grantTheme, setGrantTheme] = reactExports.useState("");
  const [grantDays, setGrantDays] = reactExports.useState("");
  const refresh = async () => {
    setLoading(true);
    const [{
      data,
      error
    }, {
      data: settingRow
    }] = await Promise.all([sb.from("chat_themes").select("*").order("sort_order", {
      ascending: true
    }), sb.from("app_settings").select("value").eq("key", "chat_theme_override").maybeSingle()]);
    if (error) toast.error(error.message);
    setRows(data ?? []);
    let raw = settingRow?.value;
    if (typeof raw === "string") raw = raw.replace(/"/g, "");
    setOverride(raw && raw !== "null" ? String(raw) : "");
    setLoading(false);
  };
  reactExports.useEffect(() => {
    refresh();
  }, []);
  const update = async (id, patch) => {
    const {
      error
    } = await sb.from("chat_themes").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    refresh();
  };
  const saveOverride = async (next) => {
    setOverride(next);
    const value = next ? JSON.stringify(next) : JSON.stringify(null);
    const {
      error
    } = await sb.from("app_settings").upsert({
      key: "chat_theme_override",
      value
    });
    if (error) return toast.error(error.message);
    toast.success(next ? `Forcing ${next} platform-wide` : "Override cleared");
  };
  const grant = async () => {
    if (!grantUser || !grantTheme) return toast.error("User ID and theme are required");
    const days = grantDays ? parseInt(grantDays, 10) : null;
    const {
      error
    } = await sb.rpc("admin_grant_chat_theme", {
      _user: grantUser,
      _theme_key: grantTheme,
      _days: days
    });
    if (error) return toast.error(error.message);
    toast.success("Theme granted");
    setGrantUser("");
    setGrantTheme("");
    setGrantDays("");
  };
  const revoke = async () => {
    if (!grantUser || !grantTheme) return toast.error("User ID and theme are required");
    const {
      error
    } = await sb.rpc("admin_revoke_chat_theme", {
      _user: grantUser,
      _theme_key: grantTheme
    });
    if (error) return toast.error(error.message);
    toast.success("Theme revoked");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Chatroom Themes", description: "Manage premium chatroom skins, pricing, unlock modes, and platform-wide overrides for events." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 font-semibold", children: "Platform-wide theme override" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "Force every user into a single theme (e.g. New Year, Festival, Anniversary). Leave blank to let each user use their own pick." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: override || "__none__", onValueChange: (v) => saveOverride(v === "__none__" ? "" : v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-72", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "No override" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No override (use per-user theme)" }),
          rows.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.theme_key, children: t.name }, t.theme_key))
        ] })
      ] }) })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: rows.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[200px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: t.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs text-muted-foreground", children: t.theme_key })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Enabled" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: t.enabled, onCheckedChange: (v) => update(t.id, {
          enabled: v
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "w-28", defaultValue: t.price_coins, disabled: t.is_default, onBlur: (e) => {
          const v = parseInt(e.target.value, 10);
          if (!Number.isNaN(v) && v !== t.price_coins) update(t.id, {
            price_coins: v
          });
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Unlock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: t.unlock_mode, onValueChange: (v) => update(t.id, {
          unlock_mode: v
        }), disabled: t.is_default, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "lifetime", children: "Lifetime" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "days_30", children: "30 days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "days_7", children: "7 days" })
          ] })
        ] })
      ] })
    ] }) }, t.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 font-semibold", children: "Grant / revoke theme for a user" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[260px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "User ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: grantUser, onChange: (e) => setGrantUser(e.target.value), placeholder: "uuid…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[200px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Theme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: grantTheme, onValueChange: setGrantTheme, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select theme" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: rows.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.theme_key, children: t.name }, t.theme_key)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-28", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Days (blank = lifetime)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: grantDays, onChange: (e) => setGrantDays(e.target.value), placeholder: "30" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: grant, children: "Grant" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: revoke, children: "Revoke" })
      ] })
    ] })
  ] });
}
export {
  AdminChatThemesPage as component
};
