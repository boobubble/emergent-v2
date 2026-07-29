import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, a_ as adminListVerificationRequests, aJ as AdminPageHeader, B as Button, O as isNavigableSlug, a$ as adminDecideVerificationRequest, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, f as DialogDescription, ad as Textarea, aw as DialogFooter } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { C as Checkbox } from "./checkbox-Dkz64jvR.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { C as CommunityBadges } from "./CommunityBadges-BE2_BUKN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { ax as ExternalLink } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-checkbox.mjs";
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
function AdminCommunityVerification() {
  const [filter, setFilter] = reactExports.useState("pending");
  const listFn = useServerFn(adminListVerificationRequests);
  const {
    data: rows = [],
    refetch,
    isLoading
  } = useQuery({
    queryKey: ["admin-verification", filter],
    queryFn: () => listFn({
      data: {
        status: filter
      }
    })
  });
  const [reviewing, setReviewing] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl space-y-4 px-4 py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Community Verification", description: "Review requests and grant Verified / Official / Partner / Trusted badges." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Filter:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filter, onValueChange: (v) => setFilter(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "needs_changes", children: "Needs changes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Rejected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => refetch(), children: "Refresh" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border bg-card", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "Loading…" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "No requests." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-muted text-sm font-bold", style: r.community?.logo_url ? {
        backgroundImage: `url(${r.community.logo_url})`,
        backgroundSize: "cover"
      } : {
        background: r.community?.accent_color ?? "#7c3aed",
        color: "#fff"
      }, children: !r.community?.logo_url && (r.community?.name?.[0]?.toUpperCase() ?? "?") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          isNavigableSlug(r.community?.slug) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/community/$slug", params: {
            slug: r.community.slug
          }, className: "truncate text-sm font-semibold hover:underline", children: r.community?.name ?? r.community_name }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-semibold", children: r.community?.name ?? r.community_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityBadges, { c: r.community ?? {} }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-xs text-muted-foreground", children: [
          r.community?.member_count ?? 0,
          " members · submitted ",
          new Date(r.created_at).toLocaleDateString()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => setReviewing(r), children: "Review" })
    ] }, r.id)) }) }),
    reviewing && /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewDialog, { request: reviewing, onClose: () => {
      setReviewing(null);
      refetch();
    } })
  ] });
}
function ReviewDialog({
  request,
  onClose
}) {
  const [notes, setNotes] = reactExports.useState(request.admin_notes ?? "");
  const [flags, setFlags] = reactExports.useState({
    is_verified: !!request.community?.is_verified,
    is_official: !!request.community?.is_official,
    is_partner: !!request.community?.is_partner,
    is_trusted: !!request.community?.is_trusted
  });
  const decideFn = useServerFn(adminDecideVerificationRequest);
  const mut = useMutation({
    mutationFn: (action) => decideFn({
      data: {
        requestId: request.id,
        action,
        admin_notes: notes || void 0,
        ...flags
      }
    }),
    onSuccess: (r) => {
      toast.success(`Marked as ${r.status}`);
      onClose();
    },
    onError: (e) => toast.error(e.message)
  });
  const s = request.socials ?? {};
  const socialEntries = Object.entries(s);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o ? onClose() : null, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Review verification — ",
        request.community?.name ?? request.community_name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Submitted ",
        new Date(request.created_at).toLocaleString()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[60vh] space-y-3 overflow-y-auto pr-1 text-sm", children: [
      request.website && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Website", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLinkCell, { href: request.website }) }),
      request.business_email && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Business email", children: request.business_email }),
      socialEntries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Socials", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: socialEntries.map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-20 text-xs capitalize text-muted-foreground", children: k }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLinkCell, { href: v })
      ] }, k)) }) }),
      request.reason && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Reason", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-xs", children: request.reason }) }),
      request.doc_urls?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Documents", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: request.doc_urls.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLinkCell, { href: u }, i)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border bg-muted/40 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Grant badges on approve" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ["is_verified", "is_official", "is_partner", "is_trusted"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: flags[k], onCheckedChange: (v) => setFlags({
            ...flags,
            [k]: !!v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: k.replace("is_", "") })
        ] }, k)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-medium", children: "Reviewer notes (visible to the owner)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Optional message…" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => mut.mutate("needs_changes"), disabled: mut.isPending, children: "Request changes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => mut.mutate("reject"), disabled: mut.isPending, children: "Reject" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate("approve"), disabled: mut.isPending, children: "Approve" })
    ] })
  ] }) });
}
function Row({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children })
  ] });
}
function ExternalLinkCell({
  href
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-primary hover:underline", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-md truncate", children: href }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
  ] });
}
function StatusBadge({
  status
}) {
  const map = {
    pending: {
      label: "Pending",
      cls: "bg-amber-500/90 text-white"
    },
    needs_changes: {
      label: "Needs changes",
      cls: "bg-orange-500/90 text-white"
    },
    rejected: {
      label: "Rejected",
      cls: "bg-red-600/90 text-white"
    },
    approved: {
      label: "Approved",
      cls: "bg-emerald-600/90 text-white"
    }
  };
  const m = map[status] ?? {
    label: status,
    cls: "bg-muted"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `${m.cls} text-[10px]`, children: m.label });
}
export {
  AdminCommunityVerification as component
};
