import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { dw as Route$d, b as useServerFn, dy as listPoemsByCategory, dx as cap } from "./router-CYWPFaDK.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { S as notFound } from "../_libs/tanstack__router-core.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { M as MehfilShell } from "./MehfilShell-Czus6X_P.mjs";
import { P as PoemCard } from "./PoemCard-DCMBI4oU.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
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
import "node:stream";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
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
import "./use-mehfil-label-BWBPC7g6.mjs";
import "./mehfil-admin.functions-BntRjkJU.mjs";
import "./WriterRankBadge-Ct9hdIy_.mjs";
function CategoryPage() {
  const {
    slug
  } = Route$d.useParams();
  const [sort, setSort] = reactExports.useState("new");
  const fetchList = useServerFn(listPoemsByCategory);
  const q = useQuery({
    queryKey: ["mehfil", "category", slug, sort],
    queryFn: () => fetchList({
      data: {
        slug,
        sort
      }
    })
  });
  if (q.data && !q.data.category) throw notFound();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MehfilShell, { showBack: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Poetry Hub Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl font-bold", style: {
          color: q.data?.category?.color ?? void 0
        }, children: q.data?.category?.name ?? cap(slug) }),
        q.data?.category?.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: q.data.category.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex overflow-hidden rounded-lg border border-border", children: ["new", "trending", "top"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSort(s), className: `px-3 py-1.5 text-xs font-semibold capitalize ${sort === s ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`, children: s }, s)) })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-sm text-muted-foreground", children: "Loading…" }) : (q.data?.poems.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground", children: [
      "No poems here yet. ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/poetry/compose", className: "font-semibold text-primary underline", children: "Be the first to write" }),
      "."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: q.data?.poems.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PoemCard, { poem: p }, p.id)) })
  ] });
}
export {
  CategoryPage as component
};
