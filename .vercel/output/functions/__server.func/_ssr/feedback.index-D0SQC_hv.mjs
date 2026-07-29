import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useAuth, b as useServerFn, D as Dialog, ab as DialogTrigger, B as Button, a0 as Input, Y as getAllSettings, c as DialogContent, d as DialogHeader, e as DialogTitle, ac as Label, ad as Textarea, aw as DialogFooter } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { C as Checkbox } from "./checkbox-Dkz64jvR.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { l as listFeedback, t as toggleVote, c as createFeedback, f as findSimilarFeedback } from "./feedback.functions-c6GuNUDn.mjs";
import { C as CATEGORY_META, b as FEEDBACK_CATEGORIES, S as STATUS_META, F as FEEDBACK_DEFAULTS, P as PRIORITY_META } from "./feedback-config-DIeqYcnl.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { bu as ChevronLeft, c as Plus, c9 as MessagesSquare, B as Bug, L as Lightbulb, a as Sparkles, N as Search, F as Flame, _ as Clock, bz as CircleCheck, a0 as LoaderCircle, j as ChevronUp, bv as Pin, bg as TrendingUp, h as MessageCircle, T as TriangleAlert, X, cG as ImagePlus, e as EyeOff } from "../_libs/lucide-react.mjs";
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
function useConfig() {
  const fetchSettings = useServerFn(getAllSettings);
  const {
    data
  } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => fetchSettings({})
  });
  return reactExports.useMemo(() => ({
    ...FEEDBACK_DEFAULTS,
    ...data?.feedback ?? {}
  }), [data]);
}
const TABS = [{
  id: "trending",
  label: "Trending",
  icon: Flame,
  tone: "text-orange-500"
}, {
  id: "latest",
  label: "Latest",
  icon: Clock,
  tone: "text-sky-500"
}, {
  id: "solved",
  label: "Solved",
  icon: CircleCheck,
  tone: "text-emerald-500"
}, {
  id: "features",
  label: "Most Requested",
  icon: Lightbulb,
  tone: "text-amber-500"
}, {
  id: "bugs",
  label: "Bug Reports",
  icon: Bug,
  tone: "text-rose-500"
}, {
  id: "ideas",
  label: "Popular Ideas",
  icon: Sparkles,
  tone: "text-violet-500"
}];
function tabToQuery(tab) {
  switch (tab) {
    case "latest":
      return {
        sort: "recent",
        category: "all",
        status: "all"
      };
    case "solved":
      return {
        sort: "top",
        category: "all",
        status: "fixed"
      };
    case "features":
      return {
        sort: "top",
        category: "feature",
        status: "all"
      };
    case "bugs":
      return {
        sort: "trending",
        category: "bug",
        status: "all"
      };
    case "ideas":
      return {
        sort: "top",
        category: "improvement",
        status: "all"
      };
    default:
      return {
        sort: "trending",
        category: "all",
        status: "all"
      };
  }
}
function ForumHome() {
  const cfg = useConfig();
  const {
    user
  } = useAuth();
  const qc = useQueryClient();
  useNavigate();
  const [tab, setTab] = reactExports.useState("trending");
  const [category, setCategory] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [composerOpen, setComposerOpen] = reactExports.useState(false);
  const list = useServerFn(listFeedback);
  const q = tabToQuery(tab);
  const effectiveCategory = category !== "all" ? category : q.category;
  const {
    data: items,
    isLoading
  } = useQuery({
    queryKey: ["forum", tab, effectiveCategory, search],
    queryFn: () => list({
      data: {
        sort: q.sort,
        category: effectiveCategory,
        status: q.status,
        search: search || void 0,
        limit: 60
      }
    }),
    enabled: cfg.enabled
  });
  const vote = useServerFn(toggleVote);
  const voteMut = useMutation({
    mutationFn: (reportId) => vote({
      data: {
        reportId
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["forum"]
    }),
    onError: (e) => toast.error(e.message)
  });
  reactExports.useEffect(() => {
    if (!cfg.enabled) return;
    const ch = supabase.channel("forum-rt").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "feedback_reports"
    }, () => qc.invalidateQueries({
      queryKey: ["forum"]
    })).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "feedback_votes"
    }, () => qc.invalidateQueries({
      queryKey: ["forum"]
    })).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "feedback_comments"
    }, () => qc.invalidateQueries({
      queryKey: ["forum"]
    })).subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [cfg.enabled, qc]);
  if (!cfg.enabled) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid min-h-[60vh] max-w-md place-items-center p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Forum is disabled" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "This module is currently turned off by the admin." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
        " Back home"
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl items-center gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "rounded-md p-1.5 hover:bg-muted", "aria-label": "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "truncate text-lg font-bold tracking-tight", children: "Community Forum" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-muted-foreground", children: "Discussions, bugs, features & ideas" })
      ] }),
      user && /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: composerOpen, onOpenChange: setComposerOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " New discussion"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Composer, { cfg, onClose: () => setComposerOpen(false) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-b border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesSquare, { className: "h-3 w-3" }),
            " Public forum"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: "Shape the platform together" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-xl text-sm text-muted-foreground", children: "Report bugs, request features, and discuss ideas with the community. Vote on what matters most." })
        ] }),
        !user && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90", children: "Sign in to join" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4", children: [{
        id: "bug",
        icon: Bug,
        label: "Bugs"
      }, {
        id: "feature",
        icon: Lightbulb,
        label: "Features"
      }, {
        id: "improvement",
        icon: Sparkles,
        label: "Ideas"
      }, {
        id: "other",
        icon: MessagesSquare,
        label: "General"
      }].map((c) => {
        const Meta = CATEGORY_META[c.id];
        const active = category === c.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCategory(active ? "all" : c.id), className: `group flex items-center gap-2 rounded-2xl border p-3 text-left transition ${active ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card/70 hover:border-primary/40 hover:bg-primary/5"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `grid h-9 w-9 place-items-center rounded-xl bg-muted ${Meta.tone}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(c.icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: c.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[10px] text-muted-foreground", children: Meta.label })
          ] })
        ] }, c.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-[57px] z-10 border-b border-border/40 bg-background/85 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-4 py-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-[200px] flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search discussions…", className: "h-9 pl-8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: category, onValueChange: (v) => setCategory(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-[160px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All categories" }),
            FEEDBACK_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: CATEGORY_META[c].label }, c))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex gap-1.5 overflow-x-auto pb-1", children: TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab(t.id), className: `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-primary bg-primary text-primary-foreground shadow" : "border-border bg-card text-foreground hover:border-primary/40"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-3.5 w-3.5 ${active ? "" : t.tone}` }),
          " ",
          t.label
        ] }, t.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-5xl space-y-3 p-4", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-16 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin" }) }),
      !isLoading && (items?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { tab, onNew: () => setComposerOpen(true), canPost: !!user }),
      (items ?? []).map((r) => {
        const Cat = CATEGORY_META[r.category] ?? CATEGORY_META.other;
        const St = STATUS_META[r.status] ?? STATUS_META.open;
        const trending = (r.upvote_count ?? 0) >= 10 || (r.comment_count ?? 0) >= 5;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/50 hover:shadow-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: (e) => {
            e.stopPropagation();
            if (!user) {
              toast.error("Sign in to vote");
              return;
            }
            voteMut.mutate(r.id);
          }, className: `flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded-xl border transition ${r.hasVoted ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:border-primary/60"}`, "aria-label": "Upvote", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold tabular-nums", children: r.upvote_count }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] uppercase text-muted-foreground", children: "votes" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feedback/$id", params: {
            id: r.id
          }, className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              r.is_pinned && /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-3.5 w-3.5 text-primary" }),
              trending && /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5 text-orange-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate font-semibold group-hover:text-primary", children: r.title })
            ] }),
            r.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-2 text-xs text-muted-foreground", children: r.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium ${Cat.tone}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Cat.icon, { className: "h-3 w-3" }),
                " ",
                Cat.label
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-[11px] font-medium ${St.tone}`, children: St.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3 w-3" }),
                " ",
                r.comment_count
              ] })
            ] })
          ] })
        ] }, r.id);
      })
    ] })
  ] });
}
function EmptyState({
  tab,
  onNew,
  canPost
}) {
  const meta = TABS.find((t) => t.id === tab);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-dashed border-border bg-card/30 p-10 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted ${meta.tone}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(meta.icon, { className: "h-6 w-6" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold", children: "Nothing here yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mx-auto mt-1 max-w-sm text-sm text-muted-foreground", children: [
      "Be the first to start a discussion in ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: meta.label }),
      "."
    ] }),
    canPost ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "mt-4 gap-1.5", onClick: onNew, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " New discussion"
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline", children: "Sign in to post" })
  ] });
}
function Composer({
  cfg,
  onClose
}) {
  const qc = useQueryClient();
  const create = useServerFn(createFeedback);
  const findSimilar = useServerFn(findSimilarFeedback);
  const [title, setTitle] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("bug");
  const [priority, setPriority] = reactExports.useState("normal");
  const [screenshots, setScreenshots] = reactExports.useState([]);
  const [uploading, setUploading] = reactExports.useState(false);
  const [anonymous, setAnonymous] = reactExports.useState(false);
  const [debouncedTitle, setDebouncedTitle] = reactExports.useState("");
  reactExports.useEffect(() => {
    const t = setTimeout(() => setDebouncedTitle(title.trim()), 350);
    return () => clearTimeout(t);
  }, [title]);
  const {
    data: similar
  } = useQuery({
    queryKey: ["forum-similar", debouncedTitle],
    queryFn: () => findSimilar({
      data: {
        title: debouncedTitle
      }
    }),
    enabled: cfg.duplicateDetection && debouncedTitle.length >= 4
  });
  const mut = useMutation({
    mutationFn: () => create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        screenshots,
        is_anonymous: anonymous,
        url: typeof window !== "undefined" ? window.location.href : void 0,
        device_info: typeof navigator !== "undefined" ? {
          ua: navigator.userAgent,
          lang: navigator.language
        } : void 0
      }
    }),
    onSuccess: () => {
      toast.success("Discussion posted. Thank you!");
      qc.invalidateQueries({
        queryKey: ["forum"]
      });
      onClose();
    },
    onError: (e) => toast.error(e.message)
  });
  const onUpload = async (file) => {
    if (!cfg.allowScreenshots) return;
    if (screenshots.length >= 6) {
      toast.error("Maximum 6 screenshots");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const path = `feedback/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const {
        error
      } = await supabase.storage.from("feed-media").upload(path, file, {
        upsert: false
      });
      if (error) throw error;
      const {
        data
      } = supabase.storage.from("feed-media").getPublicUrl(path);
      setScreenshots((s) => [...s, data.publicUrl]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Start a new discussion" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: category, onValueChange: (v) => setCategory(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FEEDBACK_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: CATEGORY_META[c].label }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Priority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: priority, onValueChange: (v) => setPriority(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.keys(PRIORITY_META).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: PRIORITY_META[p].label }, p)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), maxLength: 140, placeholder: "Short, descriptive summary" }),
        cfg.duplicateDetection && (similar?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
            "Similar discussions already exist — consider upvoting instead:"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1.5 space-y-1", children: (similar ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feedback/$id", params: {
              id: s.id
            }, className: "line-clamp-1 hover:underline", children: s.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground", children: [
              "▲ ",
              s.upvote_count
            ] })
          ] }, s.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: description, onChange: (e) => setDescription(e.target.value), maxLength: 8e3, rows: 6, placeholder: "Steps to reproduce, expected vs actual behavior, screenshots…" })
      ] }),
      cfg.allowScreenshots && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
          "Screenshots (",
          screenshots.length,
          "/6)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          screenshots.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-16 w-16 overflow-hidden rounded-md border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: `Screenshot ${i + 1}`, className: "h-full w-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setScreenshots((s) => s.filter((_, j) => j !== i)), className: "absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5 text-foreground hover:bg-background", "aria-label": "Remove screenshot", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
          ] }, url)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "grid h-16 w-16 cursor-pointer place-items-center rounded-md border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary", children: [
            uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
              const f = e.target.files?.[0];
              if (f) void onUpload(f);
              e.target.value = "";
            } })
          ] })
        ] })
      ] }),
      cfg.allowAnonymous && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2.5 text-sm cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: anonymous, onCheckedChange: (v) => setAnonymous(!!v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: "Post anonymously" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Your name will be hidden" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mut.mutate(), disabled: mut.isPending || title.trim().length < 4, children: [
        mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Post discussion"
      ] })
    ] })
  ] });
}
export {
  ForumHome as component
};
