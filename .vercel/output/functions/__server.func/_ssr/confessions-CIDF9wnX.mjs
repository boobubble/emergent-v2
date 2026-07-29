import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useAuth, b as useServerFn, D as Dialog, ab as DialogTrigger, B as Button, c as DialogContent, d as DialogHeader, e as DialogTitle, Y as getAllSettings, ac as Label, a0 as Input, ad as Textarea, ae as Card, af as CardContent } from "./router-CYWPFaDK.mjs";
import { u as useQuery, a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { l as listConfessions, c as createConfession, t as toggleReaction, m as moderateConfession, a as listReplies, b as createReply } from "./confessions.functions-BBpBF4R_.mjs";
import { C as CONFESSIONS_DEFAULTS, R as REACTION_META } from "./confessions-config-OPhfPAXP.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { bu as ChevronLeft, c as Plus, a0 as LoaderCircle, aj as Send, a as Sparkles, bv as Pin, h as MessageCircle, b0 as Flag, S as Shield } from "../_libs/lucide-react.mjs";
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
function useConfig() {
  const fetchSettings = useServerFn(getAllSettings);
  const {
    data
  } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => fetchSettings({})
  });
  return reactExports.useMemo(() => ({
    ...CONFESSIONS_DEFAULTS,
    ...data?.confessions ?? {}
  }), [data]);
}
function ConfessionsPage() {
  const cfg = useConfig();
  const {
    user
  } = useAuth();
  const [sort, setSort] = reactExports.useState("trending");
  const [category, setCategory] = reactExports.useState("all");
  const [composerOpen, setComposerOpen] = reactExports.useState(false);
  const list = useServerFn(listConfessions);
  const {
    data: items,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["confessions", sort, category],
    queryFn: () => list({
      data: {
        sort,
        category,
        limit: 50
      }
    }),
    enabled: cfg.enabled
  });
  if (!cfg.enabled) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid min-h-[60vh] max-w-md place-items-center p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Confessions are disabled" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "This module is currently turned off by the admin." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/", className: "mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
        " Back home"
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-3xl items-center gap-2 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", className: "rounded-full p-2 hover:bg-accent", "aria-label": "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold tracking-tight", children: "Confessions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Share anything, anonymously." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: composerOpen, onOpenChange: setComposerOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            " Confess"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New confession" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Composer, { cfg, onPosted: () => {
              setComposerOpen(false);
              refetch();
            } })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryChip, { active: category === "all", onClick: () => setCategory("all"), label: "✨ All" }),
        cfg.categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryChip, { active: category === c.key, onClick: () => setCategory(c.key), label: `${c.emoji ?? ""} ${c.label}` }, c.key))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl px-4 pb-24 pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: [
        cfg.leaderboards.trending && /* @__PURE__ */ jsxRuntimeExports.jsx(SortChip, { active: sort === "trending", onClick: () => setSort("trending"), label: "🔥 Trending" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortChip, { active: sort === "recent", onClick: () => setSort("recent"), label: "🆕 Recent" }),
        cfg.leaderboards.mostLiked && /* @__PURE__ */ jsxRuntimeExports.jsx(SortChip, { active: sort === "most_liked", onClick: () => setSort("most_liked"), label: "❤️ Most liked" }),
        cfg.leaderboards.mostReplied && /* @__PURE__ */ jsxRuntimeExports.jsx(SortChip, { active: sort === "most_replied", onClick: () => setSort("most_replied"), label: "💬 Most replied" })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : (items ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { onCompose: () => setComposerOpen(true) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: (items ?? []).map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx(ConfessionCard, { item: it, cfg, viewerIsAuthor: it.author_id === user?.id }, it.id)) })
    ] })
  ] });
}
function CategoryChip({
  active,
  onClick,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: `shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-accent"}`, children: label });
}
function SortChip({
  active,
  onClick,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: `rounded-full px-3 py-1.5 text-xs font-semibold transition ${active ? "bg-foreground text-background" : "bg-accent text-foreground hover:bg-accent/80"}`, children: label });
}
function EmptyState({
  onCompose
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-dashed border-border bg-card p-10 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mx-auto h-10 w-10 text-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-lg font-bold", children: "No confessions yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Be the first to share something." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-4 gap-1.5", onClick: onCompose, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " Post the first one"
    ] })
  ] });
}
function Composer({
  cfg,
  onPosted
}) {
  const enabledKinds = Object.keys(cfg.kinds).filter((k) => cfg.kinds[k]);
  const enabledModes = Object.keys(cfg.anonymousModes).filter((m) => cfg.anonymousModes[m]);
  const [kind, setKind] = reactExports.useState(enabledKinds[0] ?? "text");
  const [mode, setMode] = reactExports.useState(enabledModes[0] ?? "fully_anonymous");
  const [category, setCategory] = reactExports.useState(cfg.categories[0]?.key ?? "secrets");
  const [text, setText] = reactExports.useState("");
  const [imageUrl, setImageUrl] = reactExports.useState("");
  const [pollQ, setPollQ] = reactExports.useState("");
  const [pollOpts, setPollOpts] = reactExports.useState(["", ""]);
  const [expiry, setExpiry] = reactExports.useState(cfg.expiry.defaultMode);
  const create = useServerFn(createConfession);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => create({
      data: {
        kind,
        category,
        text,
        image_url: kind === "image" ? imageUrl || void 0 : void 0,
        poll: kind === "poll" ? {
          question: pollQ,
          options: pollOpts.filter(Boolean)
        } : void 0,
        display_mode: mode,
        expiry
      }
    }),
    onSuccess: () => {
      toast.success(cfg.moderation.approvalRequired ? "Submitted for review" : "Posted!");
      qc.invalidateQueries({
        queryKey: ["confessions"]
      });
      onPosted();
    },
    onError: (e) => toast.error(e?.message ?? "Failed to post")
  });
  const MODE_LABEL = {
    fully_anonymous: "Anonymous",
    random_id: "Confessor #",
    random_avatar: "Random animal",
    username: "My username"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kind, onValueChange: (v) => setKind(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: enabledKinds.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: k[0].toUpperCase() + k.slice(1) }, k)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: category, onValueChange: setCategory, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: cfg.categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.key, children: [
            c.emoji,
            " ",
            c.label
          ] }, c.key)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Identity" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex flex-wrap gap-1.5", children: enabledModes.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMode(m), className: `rounded-full px-3 py-1.5 text-xs font-semibold transition ${mode === m ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"}`, children: MODE_LABEL[m] }, m)) })
    ] }),
    kind === "poll" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-xl border border-border p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Poll question", value: pollQ, onChange: (e) => setPollQ(e.target.value) }),
      pollOpts.map((opt, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: `Option ${i + 1}`, value: opt, onChange: (e) => setPollOpts((p) => p.map((v, idx) => idx === i ? e.target.value : v)) }, i)),
      pollOpts.length < 6 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPollOpts((p) => [...p, ""]), className: "text-xs font-medium text-primary hover:underline", children: "+ Add option" })
    ] }),
    kind === "image" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Image URL (https://…)", value: imageUrl, onChange: (e) => setImageUrl(e.target.value) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: kind === "question" ? "What do you want to ask?" : kind === "advice" ? "What advice are you looking for?" : "Share what's on your mind…", rows: 5, value: text, onChange: (e) => setText(e.target.value), maxLength: 4e3 }),
    cfg.expiry.userSelectable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Expires" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: expiry, onValueChange: (v) => setExpiry(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "never", children: "Never" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "24h", children: "24 hours" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "7d", children: "7 days" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "30d", children: "30 days" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mut.mutate(), disabled: mut.isPending || (kind === "poll" ? !pollQ : !text.trim()), className: "w-full gap-1.5", children: [
      mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
      cfg.moderation.approvalRequired ? "Submit for review" : "Post confession"
    ] })
  ] });
}
function ConfessionCard({
  item,
  cfg,
  viewerIsAuthor
}) {
  const [showReplies, setShowReplies] = reactExports.useState(false);
  const fetchSettings = useServerFn(getAllSettings);
  const {
    data: settings
  } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => fetchSettings({})
  });
  const react = useServerFn(toggleReaction);
  const moderate = useServerFn(moderateConfession);
  const qc = useQueryClient();
  const reactMut = useMutation({
    mutationFn: (type) => react({
      data: {
        confessionId: item.id,
        type
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["confessions"]
    })
  });
  const modMut = useMutation({
    mutationFn: (action) => moderate({
      data: {
        id: item.id,
        action
      }
    }),
    onSuccess: () => {
      toast.success("Done");
      qc.invalidateQueries({
        queryKey: ["confessions"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const cat = cfg.categories.find((c) => c.key === item.category);
  const enabledReactions = Object.keys(cfg.reactions).filter((r) => cfg.reactions[r]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: item.is_pinned ? "ring-2 ring-primary/40" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-xl", children: item.avatar_emoji ?? (item.display_mode === "fully_anonymous" ? "🕶️" : "👤") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-semibold", children: item.alias ?? "Anonymous" }),
          item.is_pinned && /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-3.5 w-3.5 text-primary" }),
          item.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-amber-500" }),
          item.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600", children: "Pending" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
          cat ? `${cat.emoji} ${cat.label}` : item.category,
          " · ",
          new Date(item.created_at).toLocaleString()
        ] })
      ] })
    ] }),
    item.kind === "image" && item.image_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.image_url, alt: "Confession", className: "max-h-96 w-full rounded-xl object-cover", loading: "lazy" }),
    item.text && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words text-sm leading-relaxed", children: item.text }),
    item.kind === "poll" && item.poll && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 rounded-xl bg-accent/40 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold", children: [
        "📊 ",
        item.poll.question
      ] }),
      item.poll.options.map((opt, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border bg-background px-3 py-2 text-sm", children: opt }, i))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
      enabledReactions.map((r) => {
        const meta = REACTION_META[r];
        const active = item.myReactions.includes(r);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => reactMut.mutate(r), className: `flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-accent"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: meta.emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r === "like" ? item.like_count || "" : meta.label })
        ] }, r);
      }),
      cfg.allowReplies && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowReplies((v) => !v), className: "ml-auto flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold hover:bg-accent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
        " ",
        item.reply_count || "",
        " Reply"
      ] }),
      cfg.allowReports && !viewerIsAuthor && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-full border border-border bg-card p-1.5 hover:bg-accent", "aria-label": "Report", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminActions, { item, onAction: (a) => modMut.mutate(a) }),
    showReplies && cfg.allowReplies && /* @__PURE__ */ jsxRuntimeExports.jsx(RepliesPanel, { confessionId: item.id, cfg })
  ] }) });
}
function AdminActions({
  item,
  onAction
}) {
  const fetchSettings = useServerFn(getAllSettings);
  const {
    data
  } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => fetchSettings({})
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "group rounded-lg border border-dashed border-border px-3 py-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "flex cursor-pointer items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
      " Mod"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap gap-1.5", children: [
      item.status !== "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(ModBtn, { onClick: () => onAction("approve"), children: "Approve" }),
      item.status !== "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsx(ModBtn, { onClick: () => onAction("reject"), children: "Reject" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ModBtn, { onClick: () => onAction(item.is_pinned ? "unpin" : "pin"), children: item.is_pinned ? "Unpin" : "Pin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ModBtn, { onClick: () => onAction(item.is_featured ? "unfeature" : "feature"), children: item.is_featured ? "Unfeature" : "Feature" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ModBtn, { onClick: () => onAction("remove"), danger: true, children: "Remove" })
    ] })
  ] });
}
function ModBtn({
  children,
  onClick,
  danger
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: `rounded-full px-2.5 py-1 text-[11px] font-bold ${danger ? "bg-destructive/15 text-destructive hover:bg-destructive/25" : "bg-accent text-foreground hover:bg-accent/80"}`, children });
}
function RepliesPanel({
  confessionId,
  cfg
}) {
  const fetchReplies = useServerFn(listReplies);
  const post = useServerFn(createReply);
  const qc = useQueryClient();
  const {
    data,
    refetch
  } = useQuery({
    queryKey: ["confession-replies", confessionId],
    queryFn: () => fetchReplies({
      data: {
        confessionId
      }
    })
  });
  const [text, setText] = reactExports.useState("");
  const [anon, setAnon] = reactExports.useState(cfg.allowAnonymousReplies);
  const mut = useMutation({
    mutationFn: () => post({
      data: {
        confessionId,
        text,
        anonymous: anon
      }
    }),
    onSuccess: () => {
      setText("");
      refetch();
      qc.invalidateQueries({
        queryKey: ["confessions"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t border-border pt-3", children: [
    (data ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-lg bg-accent/30 p-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-background text-sm", children: r.avatar_emoji ?? "👤" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold", children: r.alias ?? "Anonymous" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-sm", children: r.text })
      ] })
    ] }, r.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 pt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Reply…", value: text, onChange: (e) => setText(e.target.value), className: "resize-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1", children: [
        cfg.allowAnonymousReplies && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 text-[10px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: anon, onChange: (e) => setAnon(e.target.checked) }),
          " Anon"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: mut.isPending || !text.trim(), onClick: () => mut.mutate(), children: mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
      ] })
    ] })
  ] });
}
export {
  ConfessionsPage as component
};
