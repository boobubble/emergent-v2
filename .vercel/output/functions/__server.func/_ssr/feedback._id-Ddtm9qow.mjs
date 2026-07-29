import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { cQ as Route$W, a as useAuth, b as useServerFn, B as Button, ad as Textarea } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { d as getFeedback, p as postComment, t as toggleVote, f as findSimilarFeedback } from "./feedback.functions-c6GuNUDn.mjs";
import { C as CATEGORY_META, S as STATUS_META } from "./feedback-config-DIeqYcnl.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a0 as LoaderCircle, bu as ChevronLeft, bh as Share2, j as ChevronUp, e as EyeOff, aq as Calendar, h as MessageCircle, aj as Send } from "../_libs/lucide-react.mjs";
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
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return "";
  }
}
function DiscussionPage() {
  const {
    id
  } = Route$W.useParams();
  const {
    user
  } = useAuth();
  const qc = useQueryClient();
  useNavigate();
  const get = useServerFn(getFeedback);
  const comment = useServerFn(postComment);
  const vote = useServerFn(toggleVote);
  const findSimilar = useServerFn(findSimilarFeedback);
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["forum", "detail", id],
    queryFn: () => get({
      data: {
        id
      }
    })
  });
  const {
    data: related
  } = useQuery({
    queryKey: ["forum", "related", data?.report?.title ?? ""],
    queryFn: () => findSimilar({
      data: {
        title: data.report.title
      }
    }),
    enabled: !!data?.report?.title
  });
  const [text, setText] = reactExports.useState("");
  const postMut = useMutation({
    mutationFn: () => comment({
      data: {
        reportId: id,
        text: text.trim()
      }
    }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({
        queryKey: ["forum", "detail", id]
      });
      qc.invalidateQueries({
        queryKey: ["forum"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const voteMut = useMutation({
    mutationFn: () => vote({
      data: {
        reportId: id
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["forum", "detail", id]
      });
      qc.invalidateQueries({
        queryKey: ["forum"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  reactExports.useEffect(() => {
    const ch = supabase.channel(`forum-discussion-${id}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "feedback_comments",
      filter: `report_id=eq.${id}`
    }, () => qc.invalidateQueries({
      queryKey: ["forum", "detail", id]
    })).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "feedback_reports",
      filter: `id=eq.${id}`
    }, () => qc.invalidateQueries({
      queryKey: ["forum", "detail", id]
    })).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "feedback_votes",
      filter: `report_id=eq.${id}`
    }, () => qc.invalidateQueries({
      queryKey: ["forum", "detail", id]
    })).subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [id, qc]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-[60vh] place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  if (error || !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid min-h-[60vh] max-w-md place-items-center p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Discussion not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "It may have been deleted or made private." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feedback", className: "mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
        " Back to forum"
      ] })
    ] }) });
  }
  const r = data.report;
  const Cat = CATEGORY_META[r.category] ?? CATEGORY_META.other;
  const St = STATUS_META[r.status] ?? STATUS_META.open;
  const relatedList = (related ?? []).filter((x) => x.id !== id).slice(0, 4);
  const share = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({
        title: r.title,
        url
      });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl items-center gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feedback", className: "rounded-md p-1.5 hover:bg-muted", "aria-label": "Back to forum", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "truncate text-sm font-semibold", children: r.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Discussion" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "gap-1.5", onClick: share, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
        " Share"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto grid max-w-5xl gap-4 p-4 lg:grid-cols-[1fr_260px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
              if (!user) {
                toast.error("Sign in to vote");
                return;
              }
              voteMut.mutate();
            }, className: `flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded-xl border transition ${data.hasVoted ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:border-primary/60"}`, "aria-label": "Upvote", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold tabular-nums", children: r.upvote_count }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] uppercase text-muted-foreground", children: "votes" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold leading-tight sm:text-2xl", children: r.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium ${Cat.tone}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Cat.icon, { className: "h-3 w-3" }),
                  " ",
                  Cat.label
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-[11px] font-medium ${St.tone}`, children: St.label }),
                r.is_anonymous && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-3 w-3" }),
                  " Anonymous"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
                  " ",
                  fmtDate(r.created_at)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3 w-3" }),
                  " ",
                  data.comments.length,
                  " replies"
                ] })
              ] })
            ] })
          ] }),
          r.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-3 text-sm leading-relaxed", children: r.description }),
          (r.screenshots ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3", children: r.screenshots.map((url) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, target: "_blank", rel: "noreferrer", className: "overflow-hidden rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: "Screenshot", className: "h-28 w-full object-cover" }) }, url)) }),
          r.admin_note && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 text-xs font-semibold text-primary", children: "Official response" }),
            r.admin_note
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-3 text-sm font-semibold", children: [
            "Replies ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "(",
              data.comments.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            data.comments.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-3 text-sm ${c.is_admin_response ? "border-primary/40 bg-primary/5" : "border-border bg-background/60"}`, children: [
              c.is_admin_response && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary", children: "Official response" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: c.text }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: fmtDate(c.created_at) })
            ] }, c.id)),
            data.comments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground", children: "No replies yet. Be the first to respond." })
          ] }),
          user ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-end gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: text, onChange: (e) => setText(e.target.value), rows: 2, maxLength: 2e3, placeholder: "Write a reply…", className: "flex-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", onClick: () => postMut.mutate(), disabled: postMut.isPending || text.trim().length === 0, children: postMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-sm font-medium text-primary hover:bg-primary/10", children: "Sign in to reply" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "space-y-1.5 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium", children: St.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium", children: Cat.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Votes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium", children: r.upvote_count })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Replies" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium", children: data.comments.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Created" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium", children: fmtDate(r.created_at) })
            ] })
          ] })
        ] }),
        relatedList.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Related discussions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: relatedList.map((s) => {
            const RSt = STATUS_META[s.status] ?? STATUS_META.open;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feedback/$id", params: {
              id: s.id
            }, className: "block rounded-lg border border-border/70 bg-background/40 p-2 text-xs hover:border-primary/40 hover:bg-primary/5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-2 font-medium", children: s.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-2 text-[10px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 py-0.5 ${RSt.tone}`, children: RSt.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3 w-3" }),
                  " ",
                  s.upvote_count
                ] })
              ] })
            ] }) }, s.id);
          }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  DiscussionPage as component
};
