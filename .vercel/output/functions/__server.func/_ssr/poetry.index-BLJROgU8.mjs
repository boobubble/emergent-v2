import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { R as RouteErrorBoundary, b as useServerFn, aE as getMehfilDiscovery, cY as listMehfilCategories, a as useAuth } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { M as MehfilShell } from "./MehfilShell-Czus6X_P.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { W as WriterRankBadge } from "./WriterRankBadge-Ct9hdIy_.mjs";
import { P as PoemCard } from "./PoemCard-DCMBI4oU.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { a4 as PenLine, a as Sparkles, N as Search, X, bF as Hash, F as Flame, bg as TrendingUp, aB as Crown, bj as BadgeCheck, _ as Clock, a3 as Swords, f as Heart, E as Eye, h as MessageCircle } from "../_libs/lucide-react.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "./use-mehfil-label-BWBPC7g6.mjs";
import "./mehfil-admin.functions-BntRjkJU.mjs";
const mehfilSearch = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("722e804184728be1990daea0856f5346808c09c428fbc6439d952af664553a5e"));
const getMehfilQuickPanel = createServerFn({
  method: "GET"
}).handler(createSsrRpc("1e9263a94064e968274b67a5b7a58e16d30d15feea34c6fb1c57da7bae57c0da"));
const FILTER_CHIPS = [
  { key: "all", label: "All" },
  { key: "love", label: "Love" },
  { key: "breakup", label: "Breakup" },
  { key: "life", label: "Life" },
  { key: "friendship", label: "Friendship" },
  { key: "motivation", label: "Motivation" },
  { key: "funny", label: "Funny" },
  { key: "urdu", label: "Urdu" },
  { key: "hindi", label: "Hindi" },
  { key: "english", label: "English" },
  { key: "battle", label: "Battle Poems" },
  { key: "trending", label: "Trending" }
];
const RECENT_KEY = "mehfil:recent-searches";
function useDebounced(value, delay = 250) {
  const [v, setV] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
function highlight(text, q) {
  if (!q) return [text];
  const clean = q.replace(/^[#@]/, "").trim();
  if (!clean) return [text];
  try {
    const re = new RegExp(`(${clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    const parts = text.split(re);
    return parts.map(
      (p, i) => re.test(p) ? /* @__PURE__ */ jsxRuntimeExports.jsx("mark", { className: "rounded bg-primary/25 px-0.5 text-primary-foreground/90", children: p }, i) : p
    );
  } catch {
    return [text];
  }
}
function pickMatchingLines(body, q, max = 3) {
  const clean = q.replace(/^[#@]/, "").trim().toLowerCase();
  const lines = body.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (!clean) return lines.slice(0, max);
  const matches = lines.filter((l) => l.toLowerCase().includes(clean));
  const rest = lines.filter((l) => !matches.includes(l));
  return [...matches, ...rest].slice(0, max);
}
function timeAgo(iso) {
  if (!iso) return "";
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 6e4);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  const mo = Math.floor(days / 30);
  return `${mo}mo ago`;
}
function MehfilSearchBar() {
  const auth = useAuth();
  const userId = auth?.user?.id ?? null;
  const [q, setQ] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  const [focused, setFocused] = reactExports.useState(false);
  const debounced = useDebounced(q, 250);
  const inputRef = reactExports.useRef(null);
  const [recents, setRecents] = reactExports.useState([]);
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(userId ? `${RECENT_KEY}:${userId}` : RECENT_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch {
    }
  }, [userId]);
  function pushRecent(term) {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recents.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 8);
    setRecents(next);
    try {
      localStorage.setItem(userId ? `${RECENT_KEY}:${userId}` : RECENT_KEY, JSON.stringify(next));
    } catch {
    }
  }
  function clearRecents() {
    setRecents([]);
    try {
      localStorage.removeItem(userId ? `${RECENT_KEY}:${userId}` : RECENT_KEY);
    } catch {
    }
  }
  const search = useServerFn(mehfilSearch);
  const quick = useServerFn(getMehfilQuickPanel);
  const results = useQuery({
    queryKey: ["mehfil-search", debounced, filter],
    queryFn: () => search({ data: { q: debounced, filter } }),
    enabled: debounced.trim().length >= 2,
    staleTime: 3e4,
    placeholderData: (prev) => prev
  });
  const panel = useQuery({
    queryKey: ["mehfil-search-quick"],
    queryFn: () => quick(),
    staleTime: 5 * 6e4
  });
  const hasQuery = debounced.trim().length >= 2;
  const showPanel = focused && !hasQuery;
  const data = results.data;
  const totalHits = data ? data.poems.length + data.writers.length + data.categories.length + data.hashtags.length : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative -mt-2 mb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-16 z-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card/95 p-3 shadow-lg backdrop-blur md:p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-5 w-5 shrink-0 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: inputRef,
            value: q,
            onChange: (e) => setQ(e.target.value),
            onFocus: () => setFocused(true),
            onBlur: () => setTimeout(() => setFocused(false), 200),
            onKeyDown: (e) => {
              if (e.key === "Enter" && q.trim()) pushRecent(q.trim());
              if (e.key === "Escape") {
                setQ("");
                e.target.blur();
              }
            },
            placeholder: "🔍 Search poems, keywords, writers or hashtags...",
            className: "flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground",
            "aria-label": "Search Poetry Hub"
          }
        ),
        q && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          setQ("");
          inputRef.current?.focus();
        }, className: "rounded-full p-1 hover:bg-muted", "aria-label": "Clear", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1", children: FILTER_CHIPS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setFilter(c.key),
          className: `whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition ${filter === c.key ? "border-primary bg-primary text-primary-foreground shadow" : "border-border bg-background hover:bg-muted"}`,
          children: c.label
        },
        c.key
      )) })
    ] }) }),
    showPanel && /* @__PURE__ */ jsxRuntimeExports.jsx(
      QuickPanel,
      {
        panel: panel.data,
        recents,
        onPick: (term) => {
          setQ(term);
          pushRecent(term);
          inputRef.current?.focus();
        },
        onClearRecents: clearRecents
      }
    ),
    hasQuery && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-6", children: [
      results.isFetching && !data && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-10 text-center text-sm text-muted-foreground", children: "Searching…" }),
      data && totalHits === 0 && !results.isFetching && /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { onPickTrending: () => setFilter("trending") }),
      data && data.writers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ResultsGroup, { title: "👑 Writers", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3", children: data.writers.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(WriterMiniCard, { writer: w, q: debounced }, w.id)) }) }),
      data && data.poems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ResultsGroup, { title: "🌹 Poems", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: data.poems.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PoemSearchCard, { poem: p, q: debounced }, p.id)) }) }),
      data && data.categories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ResultsGroup, { title: "📚 Categories", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: data.categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryChip, { cat: c }, c.id)) }) }),
      data && data.hashtags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ResultsGroup, { title: "🏷 Hashtags", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: data.hashtags.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            setQ(`#${h.tag}`);
            pushRecent(`#${h.tag}`);
          },
          className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "h-3 w-3" }),
            " ",
            h.tag,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-normal text-muted-foreground", children: [
              "· ",
              h.poem_count
            ] })
          ]
        },
        h.tag
      )) }) })
    ] })
  ] });
}
function ResultsGroup({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground", children: title }),
    children
  ] });
}
function QuickPanel({
  panel,
  recents,
  onPick,
  onClearRecents
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3.5 w-3.5 text-orange-500" }),
        " Trending Searches"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: (panel?.trending_searches ?? []).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onMouseDown: (e) => {
            e.preventDefault();
            onPick(t);
          },
          className: "rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary",
          children: t
        },
        t
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mt-4 mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5 text-primary" }),
        " Popular Keywords"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: (panel?.popular_keywords ?? []).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onMouseDown: (e) => {
            e.preventDefault();
            onPick(t);
          },
          className: "rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20",
          children: t
        },
        t
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mt-4 mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "h-3.5 w-3.5" }),
        " Trending Hashtags"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: (panel?.trending_hashtags ?? []).map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onMouseDown: (e) => {
            e.preventDefault();
            onPick(`#${h.tag}`);
          },
          className: "inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "h-3 w-3" }),
            " ",
            h.tag,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              "· ",
              h.poem_count
            ] })
          ]
        },
        h.tag
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3.5 w-3.5 text-amber-500" }),
        " Popular Writers"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1.5", children: (panel?.popular_writers ?? []).map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/u/$username",
          params: { username: w.username ?? w.id },
          className: "flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted",
          children: [
            w.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: w.avatar_url, alt: "", className: "h-8 w-8 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary", children: w.name.slice(0, 1).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 truncate text-sm font-semibold", children: [
                w.name,
                " ",
                w.is_verified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3.5 w-3.5 text-primary" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(WriterRankBadge, { rank: w.writer_rank })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              w.total_upvotes,
              " ❤"
            ] })
          ]
        },
        w.id
      )) }),
      recents.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
            " Recent Searches"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onMouseDown: (e) => {
                e.preventDefault();
                onClearRecents();
              },
              className: "text-[11px] text-muted-foreground hover:text-foreground",
              children: "Clear"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: recents.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onMouseDown: (e) => {
              e.preventDefault();
              onPick(r);
            },
            className: "rounded-full border border-dashed border-border px-3 py-1 text-xs hover:border-primary hover:text-primary",
            children: r
          },
          r
        )) })
      ] })
    ] })
  ] }) });
}
function PoemSearchCard({ poem, q }) {
  const lines = reactExports.useMemo(() => pickMatchingLines(poem.body_excerpt, q, 3), [poem.body_excerpt, q]);
  const author = poem.author;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group overflow-hidden rounded-2xl border border-border/60 bg-card p-4 transition hover:border-primary/50 hover:shadow-md md:p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        author?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: author.avatar_url, alt: "", className: "h-10 w-10 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary", children: (author?.name ?? "?").slice(0, 1).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 truncate text-sm font-semibold", children: [
            author ? highlight(author.name, q) : "Anonymous",
            author?.is_verified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3.5 w-3.5 text-primary" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(WriterRankBadge, { rank: author?.writer_rank }),
            poem.category && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full px-2 py-0.5 text-[10px] font-semibold", style: { backgroundColor: `${poem.category.color ?? "#6366f1"}22`, color: poem.category.color ?? "#6366f1" }, children: poem.category.name })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 flex-col items-end gap-1", children: [
        poem.is_battle && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[10px] font-bold text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-3 w-3" }),
          " Battle"
        ] }),
        poem.is_trending && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3" }),
          " Trending"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-serif text-lg font-bold leading-tight group-hover:text-primary", children: highlight(poem.title, q) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-0.5 font-serif text-sm leading-relaxed text-foreground/85", children: lines.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-1", children: highlight(l, q) }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5" }),
          " ",
          poem.upvotes
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
          " ",
          poem.reads
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
          " ",
          poem.comments
        ] }),
        poem.published_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "· ",
          timeAgo(poem.published_at)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/poetry/$slug",
          params: { slug: poem.slug },
          className: "inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90",
          children: "Read Full"
        }
      )
    ] })
  ] });
}
function WriterMiniCard({ writer, q }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/u/$username",
      params: { username: writer.username ?? writer.id },
      className: "flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 hover:border-primary/50",
      children: [
        writer.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: writer.avatar_url, alt: "", className: "h-11 w-11 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary", children: writer.name.slice(0, 1).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 truncate text-sm font-semibold", children: [
            highlight(writer.name, q),
            writer.is_verified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3.5 w-3.5 text-primary" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WriterRankBadge, { rank: writer.writer_rank }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-[11px] text-muted-foreground", children: [
            writer.poems_published,
            " poems · ",
            writer.total_upvotes,
            " ❤"
          ] })
        ] })
      ]
    }
  );
}
function CategoryChip({ cat }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/poetry/category/$slug",
      params: { slug: cat.slug },
      className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary",
      style: { borderLeftColor: cat.color ?? void 0, borderLeftWidth: 3 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: cat.color ?? void 0 }, children: cat.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-normal text-muted-foreground", children: [
          cat.poem_count,
          " poems"
        ] })
      ]
    }
  );
}
function EmptyState({ onPickTrending }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-border/60 bg-card/60 p-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: "📜" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-semibold", children: "No poems found." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Try another keyword, or explore what's popular." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/poetry", className: "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted", children: "Explore Categories" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onPickTrending, className: "inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3.5 w-3.5" }),
        " View Trending Poems"
      ] })
    ] })
  ] });
}
function MehfilDiscoveryPage() {
  const fetchDiscovery = useServerFn(getMehfilDiscovery);
  const fetchCats = useServerFn(listMehfilCategories);
  const disc = useQuery({
    queryKey: ["mehfil", "discovery"],
    queryFn: () => fetchDiscovery()
  });
  const cats = useQuery({
    queryKey: ["mehfil", "categories"],
    queryFn: () => fetchCats()
  });
  const heroPoem = reactExports.useMemo(() => disc.data?.sections[0]?.poems[0] ?? null, [disc.data]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MehfilShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative mb-10 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-amber-500/10 p-8 md:p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary", children: "Poetry Hub" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-3 font-serif text-4xl font-bold leading-tight md:text-5xl", children: [
          "Where every verse",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          " finds its audience"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-lg text-sm text-muted-foreground md:text-base", children: "A community of poets, storytellers and dreamers. Publish original poetry, join weekly battles, and rise from Fresh Writer to Hall of Fame." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/poetry/compose", className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "h-4 w-4" }),
            " Start Writing"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/poetry/challenges", className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-5 py-2.5 text-sm font-semibold hover:bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
            " Poetry Battles"
          ] })
        ] })
      ] }),
      heroPoem && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PoemCard, { poem: heroPoem, variant: "hero" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MehfilSearchBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-bold", children: "📚 Categories" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6", children: (cats.data ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/poetry/category/$slug", params: {
        slug: c.slug
      }, className: "group rounded-xl border border-border/60 bg-card p-3 text-center transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md", style: {
        borderTopColor: c.color ?? void 0,
        borderTopWidth: 3
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold group-hover:text-primary", style: {
          color: c.color ?? void 0
        }, children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 line-clamp-1 text-[10px] text-muted-foreground", children: c.description })
      ] }, c.id)) })
    ] }),
    disc.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-20 text-center text-sm text-muted-foreground", children: "Loading Poetry Hub…" }),
    disc.data?.sections.map((sec) => sec.poems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-bold", children: sec.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: sec.poems.slice(0, 6).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PoemCard, { poem: p }, p.id)) })
    ] }, sec.key)),
    disc.data?.rising && disc.data.rising.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-bold", children: "📈 Rising Writers" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4", children: disc.data.rising.slice(0, 8).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3", children: [
        r.profile?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: r.profile.avatar_url, alt: "", className: "h-11 w-11 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary", children: (r.profile?.display_name || r.profile?.username || "?").slice(0, 1).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: r.profile?.display_name || r.profile?.username || "Anonymous" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WriterRankBadge, { rank: r.stats.writer_rank }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-[11px] text-muted-foreground", children: [
            r.stats.poems_published,
            " poems · ",
            r.stats.total_upvotes,
            " upvotes"
          ] })
        ] })
      ] }, r.stats.user_id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-xs text-muted-foreground", children: "Poetry Hub · Phase 1 · Battles, leaderboard and Hall of Fame ship next." })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RouteErrorBoundary, { section: "Poetry", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MehfilDiscoveryPage, {}) });
export {
  SplitComponent as component
};
