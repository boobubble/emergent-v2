import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { at as usePlans, au as useMySubscription, av as useSubscriptionMode, a as useAuth, b as useServerFn, ax as requestSubscription, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, f as DialogDescription, ac as Label, a0 as Input, aw as DialogFooter, B as Button } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { A as ArrowLeft, l as Star, z as Check, a0 as LoaderCircle, aB as Crown, a as Sparkles } from "../_libs/lucide-react.mjs";
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
const tierIcon = {
  free: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-5 w-5" }),
  vip: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5" }),
  creator: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-5 w-5" })
};
function PricingPage() {
  const {
    data: plans,
    isLoading
  } = usePlans();
  const {
    data: mySub
  } = useMySubscription();
  const {
    data: cfg
  } = useSubscriptionMode();
  const {
    user
  } = useAuth();
  const [cycle, setCycle] = reactExports.useState("monthly");
  const [chosen, setChosen] = reactExports.useState(null);
  const [proof, setProof] = reactExports.useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const requestFn = useServerFn(requestSubscription);
  const submit = useMutation({
    mutationFn: () => requestFn({
      data: {
        planId: chosen.id,
        cycle,
        proofReference: proof || void 0
      }
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({
        queryKey: ["my-subscription"]
      });
      setChosen(null);
      setProof("");
      if (res.mode === "free") {
        toast.success("You're on the Free plan");
        navigate({
          to: "/feed"
        });
      } else {
        toast.success("Payment submitted — awaiting admin approval");
      }
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  if (cfg?.mode === "off") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen bg-background p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-2 text-3xl font-bold", children: "Subscriptions are currently disabled" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Check back later." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed", className: "mt-4 inline-block text-primary underline", children: "Go to feed" })
    ] }) });
  }
  const currentPlanId = mySub?.subscription?.plan_id;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feed", className: "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
          " Back"
        ] }),
        user && mySub?.isActive && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
          "Current plan: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: mySub.subscription?.plan?.name })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-3 bg-gradient-to-r from-primary via-pink-500 to-amber-400 bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl", children: "Choose your membership" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto max-w-xl text-muted-foreground", children: "Unlock premium chatrooms, exclusive themes, no ads and creator perks. Cancel anytime." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-6 inline-flex rounded-full border bg-card p-1", children: ["monthly", "yearly"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCycle(c), className: `rounded-full px-5 py-2 text-sm font-semibold capitalize transition ${cycle === c ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`, children: [
          c,
          c === "yearly" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-600", children: "Save" })
        ] }, c)) })
      ] }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground", children: "Loading plans…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 md:grid-cols-3", children: (plans ?? []).map((p) => {
        const isCurrent = currentPlanId === p.id;
        const price = cycle === "yearly" ? Number(p.yearly_price) : Number(p.monthly_price);
        const isFree = p.is_default || Number(p.monthly_price) === 0 && Number(p.yearly_price) === 0;
        const highlight = p.tier === "vip";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative overflow-hidden rounded-3xl border bg-card/80 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl ${highlight ? "border-primary/60 ring-2 ring-primary/30" : "border-border"}`, children: [
          highlight && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-4 top-4 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 px-3 py-1 text-xs font-bold text-white", children: "Most popular" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2 text-primary", children: [
            tierIcon[p.tier] ?? /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground", children: p.name }),
            p.badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary", children: p.badge })
          ] }),
          p.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: p.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-4xl font-extrabold", children: [
              p.currency_symbol,
              price
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-sm text-muted-foreground", children: [
              "/ ",
              cycle === "yearly" ? "year" : "month"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mb-6 space-y-2", children: (p.features ?? []).map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f })
          ] }, i)) }),
          isCurrent ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: true, className: "w-full rounded-full border bg-muted py-3 text-sm font-bold text-muted-foreground", children: "Current plan" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            if (!user) {
              navigate({
                to: "/login"
              });
              return;
            }
            if (isFree) {
              setChosen(p);
              submit.mutate();
            } else {
              setChosen(p);
            }
          }, className: `w-full rounded-full py-3 text-sm font-bold transition ${highlight ? "bg-gradient-to-r from-primary to-pink-500 text-white shadow hover:opacity-90" : "bg-primary text-primary-foreground hover:opacity-90"}`, children: isFree ? "Continue free" : `Upgrade to ${p.name}` })
        ] }, p.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!chosen && !(chosen?.is_default || Number(chosen?.monthly_price) === 0 && Number(chosen?.yearly_price) === 0), onOpenChange: (o) => !o && setChosen(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Activate ",
          chosen?.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: cfg?.payment_instructions || "Send your payment to the configured account, then enter the transaction reference below for admin approval." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/30 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Plan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
              chosen?.name,
              " (",
              cycle,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
              chosen?.currency_symbol,
              cycle === "yearly" ? chosen?.yearly_price : chosen?.monthly_price
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "proof", children: "Transaction reference / UTR / note" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "proof", value: proof, onChange: (e) => setProof(e.target.value), placeholder: "e.g. UPI ref 123456789" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setChosen(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => submit.mutate(), disabled: submit.isPending, children: [
          submit.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
          "Submit for approval"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  PricingPage as component
};
