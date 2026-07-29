import { j as jsxRuntimeExports } from "./_libs/react.mjs";
import { b as useServerFn, ae as Card, ag as CardHeader, ah as CardTitle, af as CardContent, aG as AdminToggle, B as Button } from "./_ssr/router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery } from "./_libs/tanstack__react-query.mjs";
import { S as Skeleton } from "./_ssr/skeleton-CsqSgU8F.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { e as getDmPrivacy, s as setDmPrivacy, f as getTrustScore, h as listMessageRequests, r as respondMessageRequest } from "./_ssr/trust-safety.functions-CIMNTEvE.mjs";
import "./_libs/seroval.mjs";
import "./_libs/i18next.mjs";
import "./_libs/i18next-browser-languagedetector+[...].mjs";
import "./_libs/i18next-chained-backend.mjs";
import "./_libs/i18next-localstorage-backend.mjs";
import "./_libs/dnd-kit__core.mjs";
import "./_libs/dnd-kit__sortable.mjs";
import { S as Shield, cX as MailWarning } from "./_libs/lucide-react.mjs";
import "./_libs/tanstack__react-router.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_ssr/client-H8IXbXWR.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_ssr/createSsrRpc-wK30bc3J.mjs";
import "./_ssr/server-DxoLgaf4.mjs";
import "node:async_hooks";
import "./_libs/h3-v2.mjs";
import "./_libs/rou3.mjs";
import "./_libs/srvx.mjs";
import "./_ssr/auth-middleware-B-ZvcUuj.mjs";
import "./_ssr/env.server-Bcmcot3M.mjs";
import "./_ssr/rate-limit-middleware-CAVrvtrO.mjs";
import "./_libs/radix-ui__react-dialog.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_ssr/feedback-config-DIeqYcnl.mjs";
import "./_ssr/app-version-8YDb-xNu.mjs";
import "./_libs/i18next-http-backend.mjs";
import "./_ssr/client.server-BXCYxJZY.mjs";
import "./_ssr/sitemap-Dl8Aqg_O.mjs";
import "./_ssr/reserved-routes-BWsWje6t.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-switch.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/dnd-kit__utilities.mjs";
import "./_ssr/mehfil-types-okfUX99d.mjs";
import "./_ssr/feedbot-format-CFiGnWo6.mjs";
import "./_libs/lovable.dev__email-js.mjs";
import "./_libs/react-i18next.mjs";
import "./_libs/use-sync-external-store.mjs";
import "./_libs/zod.mjs";
import "./_libs/babel__runtime.mjs";
import "./_libs/dnd-kit__accessibility.mjs";
const CHOICES = [{
  v: "everyone",
  label: "Everyone",
  desc: "Anyone can DM you. Non-friends may appear as message requests."
}, {
  v: "friends",
  label: "Friends only",
  desc: "Only accepted friends can start a DM."
}, {
  v: "nobody",
  label: "Nobody",
  desc: "Nobody can DM you. Existing chats stay open."
}];
function PrivacySettings() {
  const qc = useQueryClient();
  const getFn = useServerFn(getDmPrivacy);
  const setFn = useServerFn(setDmPrivacy);
  const scoreFn = useServerFn(getTrustScore);
  const reqFn = useServerFn(listMessageRequests);
  const respondFn = useServerFn(respondMessageRequest);
  const priv = useQuery({
    queryKey: ["dm-privacy"],
    queryFn: () => getFn()
  });
  const score = useQuery({
    queryKey: ["trust-score"],
    queryFn: () => scoreFn()
  });
  const requests = useQuery({
    queryKey: ["dm-requests"],
    queryFn: () => reqFn()
  });
  const choose = async (v) => {
    try {
      await setFn({
        data: {
          who_can_dm: v
        }
      });
      toast.success("Updated");
      qc.invalidateQueries({
        queryKey: ["dm-privacy"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const setRequests = async (allow) => {
    try {
      await setFn({
        data: {
          who_can_dm: priv.data?.who_can_dm ?? "everyone",
          allow_message_requests: allow
        }
      });
      qc.invalidateQueries({
        queryKey: ["dm-privacy"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const respond = async (id, action) => {
    try {
      await respondFn({
        data: {
          id,
          action
        }
      });
      qc.invalidateQueries({
        queryKey: ["dm-requests"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl space-y-4 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5" }),
        " Privacy"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Control who can DM you and manage message requests." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Who can DM you" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
        priv.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full" }),
        priv.data && CHOICES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => choose(c.v), className: `w-full rounded-lg border p-3 text-left transition ${priv.data.who_can_dm === c.v ? "border-primary bg-primary/5" : "hover:bg-muted"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: c.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: c.desc })
        ] }, c.v)),
        priv.data?.who_can_dm === "everyone" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Allow message requests from non-friends" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "First message from a non-friend goes to a Requests inbox until you accept." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: priv.data.allow_message_requests ?? true, onCheckedChange: setRequests })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MailWarning, { className: "h-4 w-4" }),
        " Message Requests"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
        requests.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" }),
        (requests.data ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium", children: [
              "Request from ",
              String(r.sender_id).slice(0, 8)
            ] }),
            r.preview && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-xs text-muted-foreground", children: [
              '"',
              String(r.preview),
              '"'
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => respond(r.id, "accept"), children: "Accept" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => respond(r.id, "decline"), children: "Decline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "destructive", onClick: () => respond(r.id, "block"), children: "Block" })
          ] })
        ] }, r.id)),
        requests.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No pending requests." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Trust Score" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        score.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-32" }),
        score.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Current violation points:" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold", children: String(score.data.points ?? 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Points decay over time. High scores can trigger automatic warnings, mutes, or suspensions." })
        ] })
      ] })
    ] })
  ] });
}
export {
  PrivacySettings as component
};
