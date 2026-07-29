import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, bS as adminListPremiumSlugRequests, bT as reviewPremiumSlugRequest, aJ as AdminPageHeader, B as Button, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, f as DialogDescription, ad as Textarea, aw as DialogFooter } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { C as CommunityBadges } from "./CommunityBadges-BE2_BUKN.mjs";
import { classifySlug } from "./premium-slugs-D4Q35qvA.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { ab as ArrowRight, ax as ExternalLink } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-tooltip.mjs";
function AdminPremiumSlugs() {
  const [filter, setFilter] = reactExports.useState("pending");
  const listFn = useServerFn(adminListPremiumSlugRequests);
  const reviewFn = useServerFn(reviewPremiumSlugRequest);
  const {
    data: rows = [],
    refetch,
    isLoading
  } = useQuery({
    queryKey: ["admin-premium-slugs", filter],
    queryFn: () => listFn({
      data: {
        status: filter
      }
    })
  });
  const [reviewing, setReviewing] = reactExports.useState(null);
  const [note, setNote] = reactExports.useState("");
  const decide = useMutation({
    mutationFn: async (decision) => reviewFn({
      data: {
        requestId: reviewing.id,
        decision,
        note: note || void 0
      }
    }),
    onSuccess: (res) => {
      toast.success(res.applied ? `Approved — community moved to /community/${res.newSlug}` : "Request rejected");
      setReviewing(null);
      setNote("");
      refetch();
    },
    onError: (e) => toast.error(e?.message ?? "Failed to review")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl space-y-4 px-4 py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Premium URL Claims", description: "Review requests from community owners to claim short, generic, or geographic slugs." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Filter:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filter, onValueChange: (v) => setFilter(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Rejected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => refetch(), children: "Refresh" })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground", children: "No requests here." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: rows.map((r) => {
      const c = r.community ?? {};
      const cls = classifySlug(r.requested_slug);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border bg-card p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/community/$slug", params: {
              slug: c.slug ?? r.current_slug
            }, className: "font-semibold hover:underline", children: c.name ?? "(community)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityBadges, { c }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
              c.member_count ?? 0,
              " members"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { className: "rounded bg-muted px-1.5 py-0.5 text-xs", children: [
              "/community/",
              r.current_slug
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { className: "rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary", children: [
              "/community/",
              r.requested_slug
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: cls === "premium" ? "default" : cls === "reserved" ? "destructive" : "secondary", className: "text-[10px] capitalize", children: cls })
          ] }),
          r.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 whitespace-pre-wrap text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Reason:" }),
            " ",
            r.reason
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-[11px] text-muted-foreground", children: [
            "Requested ",
            new Date(r.created_at).toLocaleString(),
            r.reviewed_at && ` · reviewed ${new Date(r.reviewed_at).toLocaleString()}`
          ] }),
          r.review_note && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs italic text-muted-foreground", children: [
            "Review note: ",
            r.review_note
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "capitalize", variant: r.status === "pending" ? "default" : r.status === "approved" ? "secondary" : r.status === "rejected" ? "destructive" : "outline", children: r.status }),
          r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
            setReviewing(r);
            setNote("");
          }, children: "Review" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/community/$slug", params: {
            slug: c.slug ?? r.current_slug
          }, className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground", children: [
            "Visit ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
          ] })
        ] })
      ] }) }, r.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!reviewing, onOpenChange: (o) => !o && setReviewing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Review premium URL request" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: reviewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Move ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs", children: reviewing.community?.name ?? "community" }),
          " from",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { className: "text-xs", children: [
            "/community/",
            reviewing.current_slug
          ] }),
          " to",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { className: "text-xs font-semibold", children: [
            "/community/",
            reviewing.requested_slug
          ] }),
          "? The old URL will continue to redirect."
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Optional review note (visible to the owner)…", value: note, onChange: (e) => setNote(e.target.value), rows: 3 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setReviewing(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => decide.mutate("rejected"), disabled: decide.isPending, children: "Reject" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => decide.mutate("approved"), disabled: decide.isPending, children: "Approve & Rename" })
      ] })
    ] }) })
  ] });
}
export {
  AdminPremiumSlugs as component
};
