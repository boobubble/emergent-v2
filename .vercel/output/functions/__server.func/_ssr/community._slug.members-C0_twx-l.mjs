import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useAuth, b as useServerFn, ds as listCommunityMembersPublic, dt as listCommunityMembersAuthed } from "./router-CYWPFaDK.mjs";
import { u as useCommunity } from "./community-context-Bgy_g-7B.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { U as Users, aB as Crown, S as Shield } from "../_libs/lucide-react.mjs";
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
function CommunityMembers() {
  const {
    community,
    communityId,
    isMember,
    isOwner
  } = useCommunity();
  const {
    user
  } = useAuth();
  const publicFn = useServerFn(listCommunityMembersPublic);
  const authedFn = useServerFn(listCommunityMembersAuthed);
  const isPublicCommunity = community.privacy_mode === "public";
  const canFetchAuthed = !!user && (isMember || isOwner);
  const shouldFetchPublic = isPublicCommunity;
  const shouldFetchAuthed = !isPublicCommunity && canFetchAuthed;
  const {
    data: members = [],
    isLoading
  } = useQuery({
    queryKey: ["community-members", communityId, shouldFetchAuthed ? "authed" : "public"],
    queryFn: () => shouldFetchAuthed ? authedFn({
      data: {
        communityId
      }
    }) : publicFn({
      data: {
        communityId
      }
    }),
    enabled: shouldFetchPublic || shouldFetchAuthed,
    staleTime: 3e4
  });
  if (!isPublicCommunity && !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-semibold", children: "Sign in to see members" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
        community.name,
        " is a private community. Members are visible to signed-in members only."
      ] })
    ] });
  }
  if (!isPublicCommunity && user && !canFetchAuthed) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-semibold", children: "Members only" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
        "Join ",
        community.name,
        " to see its members."
      ] })
    ] });
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-sm text-muted-foreground", children: "Loading members…" });
  if (!members.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-semibold", children: "No members yet" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold", children: [
          members.length,
          " member",
          members.length === 1 ? "" : "s"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "People who joined ",
          community.name,
          "."
        ] })
      ] }),
      isPublicCommunity && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary", children: "Public directory" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: members.map((m) => {
      const p = m.user;
      const name = p?.display_name || p?.username || "member";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-bold text-white", style: {
          backgroundColor: p?.avatar_color || "#7c3aed"
        }, children: p?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.avatar_url, alt: name, className: "h-full w-full object-cover" }) : name[0]?.toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            p?.username ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$username", params: {
              username: p.username
            }, className: "truncate text-sm font-medium hover:underline", children: name }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-medium", children: name }),
            m.role === "owner" && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3 text-amber-400", "aria-label": "Owner" }),
            m.role === "moderator" && /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3 text-sky-400", "aria-label": "Moderator" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground capitalize", children: m.role })
        ] })
      ] }, m.id);
    }) }),
    !user && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[11px] text-muted-foreground", children: "Sign in to follow, message, or interact with members." })
  ] });
}
export {
  CommunityMembers as component
};
