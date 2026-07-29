import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, a3 as listCompetitionsEnriched, B as Button } from "./router-CYWPFaDK.mjs";
import { C as CompetitionProfileCard } from "./CompetitionProfileCard-9XMBa8Lg.mjs";
import { e as emptyCompetition, C as CompetitionEditorDialog } from "./CompetitionEditorDialog-DDvLOlrZ.mjs";
import { u as useCommunity } from "./community-context-Bgy_g-7B.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { c as Plus, O as Trophy } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "./badge-CCbPDVfk.mjs";
import "./Countdown-s9YaTID_.mjs";
import "./select-sTNVlCXy.mjs";
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
function CommunityCompetitions() {
  const {
    community,
    communityId,
    isOwner
  } = useCommunity();
  const qc = useQueryClient();
  const list = useServerFn(listCompetitionsEnriched);
  const [editing, setEditing] = reactExports.useState(null);
  const {
    data: comps = [],
    isLoading
  } = useQuery({
    queryKey: ["competitions-community", communityId],
    queryFn: () => list({
      data: {
        communityId
      }
    })
  });
  const live = comps.filter((c) => c.status === "live");
  const upcoming = comps.filter((c) => c.status === "upcoming");
  const ended = comps.filter((c) => c.status === "completed");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Community competitions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Hosted by ",
          community.name,
          "."
        ] })
      ] }),
      isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setEditing({
        ...emptyCompetition(),
        community_id: communityId
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        " New competition"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CompetitionEditorDialog, { value: editing, onChange: setEditing, invalidateKeys: [["competitions-community", communityId]], onSaved: () => qc.invalidateQueries({
      queryKey: ["competitions-community", communityId]
    }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-sm text-muted-foreground", children: "Loading…" }) : comps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-semibold", children: "No community competitions yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: isOwner ? "Start one and rally your members." : "Come back soon — competitions are coming." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Live", items: live, onEdit: isOwner ? (c) => setEditing(c) : void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Upcoming", items: upcoming, onEdit: isOwner ? (c) => setEditing(c) : void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Ended", items: ended, onEdit: isOwner ? (c) => setEditing(c) : void 0 })
    ] })
  ] });
}
function Section({
  title,
  items,
  onEdit
}) {
  if (!items.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: items.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(CompetitionProfileCard, { c, onEdit }, c.id)) })
  ] });
}
export {
  CommunityCompetitions as component
};
