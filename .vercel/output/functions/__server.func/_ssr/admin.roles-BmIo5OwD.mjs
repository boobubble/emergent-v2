import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aJ as AdminPageHeader, ae as Card, af as CardContent } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { S as Shield } from "../_libs/lucide-react.mjs";
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
const ROLE_REGISTRY = [
  {
    id: "super_admin",
    label: "Super Admin",
    description: "Full access to every module and setting. Cannot be revoked from UI.",
    color: "text-rose-500",
    permissions: [
      "admin.access",
      "admin.settings.write",
      "admin.modules.toggle",
      "admin.roles.assign",
      "admin.seo.write",
      "moderation.global",
      "moderation.room",
      "content.create",
      "content.boost"
    ]
  },
  {
    id: "admin",
    label: "Admin",
    description: "Manage settings, modules, SEO, and moderation.",
    color: "text-orange-500",
    permissions: [
      "admin.access",
      "admin.settings.write",
      "admin.modules.toggle",
      "admin.seo.write",
      "moderation.global",
      "moderation.room",
      "content.create"
    ]
  },
  {
    id: "moderator",
    label: "Moderator",
    description: "Global moderation across rooms and feed.",
    color: "text-amber-500",
    permissions: ["moderation.global", "moderation.room", "content.create"]
  },
  {
    id: "room_moderator",
    label: "Room Moderator",
    description: "Moderate specific rooms only.",
    color: "text-yellow-500",
    permissions: ["moderation.room", "content.create"]
  },
  {
    id: "dj",
    label: "DJ",
    description: "Broadcaster Studio access: manage widgets, queue, mic, schedule, and go live.",
    color: "text-fuchsia-500",
    permissions: ["broadcaster.access", "broadcaster.manage", "content.create"]
  },
  {
    id: "rj",
    label: "RJ",
    description: "Radio jockey: host shows, run the queue, and post broadcaster announcements.",
    color: "text-cyan-500",
    permissions: ["broadcaster.access", "broadcaster.manage", "content.create"]
  },
  {
    id: "vip",
    label: "VIP",
    description: "Premium perks, badges, and boosted reach.",
    color: "text-violet-500",
    permissions: ["content.create", "content.boost"]
  },
  {
    id: "verified_creator",
    label: "Verified Creator",
    description: "Verified badge and creator tools access.",
    color: "text-sky-500",
    permissions: ["content.create", "content.boost"]
  },
  {
    id: "user",
    label: "User",
    description: "Standard authenticated member.",
    color: "text-muted-foreground",
    permissions: ["content.create"]
  }
];
function RolesPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Roles", description: "Permission architecture used across the platform. Assignment UI ships in a later step." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: ROLE_REGISTRY.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: `h-4 w-4 ${r.color}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: r.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-auto h-5 px-1.5 text-[10px] font-mono", children: r.id })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: r.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: r.permissions.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground", children: p }, p)) })
    ] }) }, r.id)) })
  ] });
}
export {
  RolesPage as component
};
