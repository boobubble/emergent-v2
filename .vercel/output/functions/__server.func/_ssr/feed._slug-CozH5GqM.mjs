import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { cP as Route$Y, a as useAuth, N as postsSafe } from "./router-CYWPFaDK.mjs";
import { P as PostCard, p as postSlug } from "./PostCard-DLZQjCkW.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
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
import "./EmojiPicker-DcAQqNHO.mjs";
import "./Avatar-CAZashHQ.mjs";
import "./shop-catalog-QoXq-K4P.mjs";
import "./country-flag-Bsg6nfgK.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "./boobubble.functions-BRP0x1de.mjs";
import "./economy-config-CPZpIbo-.mjs";
function PostPage() {
  const {
    slug
  } = Route$Y.useParams();
  const {
    user
  } = useAuth();
  const meId = user?.id ?? "";
  const [post, setPost] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [notFound, setNotFound] = reactExports.useState(false);
  const [profiles, setProfiles] = reactExports.useState({});
  const [related, setRelated] = reactExports.useState({
    moreFromAuthor: [],
    trending: []
  });
  const [relatedLoaded, setRelatedLoaded] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);
    (async () => {
      const {
        data
      } = await postsSafe().select("*").eq("slug", slug).maybeSingle();
      if (!alive) return;
      if (!data) {
        setNotFound(true);
        setPost(null);
      } else {
        setPost(data);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [slug]);
  reactExports.useEffect(() => {
    if (!post) return;
    (async () => {
      const ids = /* @__PURE__ */ new Set();
      if (post.author_id) ids.add(post.author_id);
      if (!ids.size) return;
      const {
        data
      } = await supabase.from("profiles").select("id,username,display_name,avatar_url,avatar_color").in("id", Array.from(ids));
      const map = {};
      for (const p of data ?? []) {
        map[p.id] = {
          id: p.id,
          name: p.display_name || p.username || "user",
          avatarUrl: p.avatar_url ?? void 0,
          avatarColor: p.avatar_color ?? void 0,
          status: "offline",
          xp: 0,
          level: 1,
          streak: 0,
          longestStreak: 0,
          coins: 0,
          badges: [],
          isBot: false,
          isGuest: false
        };
      }
      setProfiles(map);
    })();
  }, [post]);
  reactExports.useEffect(() => {
    if (!post || relatedLoaded) return;
    const id = setTimeout(async () => {
      try {
        const [author, trending] = await Promise.all([post.author_id && !post.is_anonymous ? postsSafe().select("*").eq("author_id", post.author_id).eq("privacy", "public").neq("id", post.id).order("created_at", {
          ascending: false
        }).limit(4) : Promise.resolve({
          data: []
        }), postsSafe().select("*").eq("privacy", "public").neq("id", post.id).order("trending_score", {
          ascending: false
        }).limit(6)]);
        setRelated({
          moreFromAuthor: author.data ?? [],
          trending: trending.data ?? []
        });
      } finally {
        setRelatedLoaded(true);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [post, relatedLoaded]);
  reactExports.useEffect(() => {
    if (!post || typeof window === "undefined") return;
    if (window.location.hash === "#comments") {
      const el = document.getElementById("comments");
      if (el) el.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [post]);
  const authorName = reactExports.useMemo(() => {
    if (!post) return "";
    if (post.is_anonymous) return "Anonymous";
    return profiles[post.author_id]?.name ?? "Someone";
  }, [post, profiles]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-2xl items-center gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feed", className: "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Feed"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold", children: "Post" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-2xl px-4 py-6", children: [
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 animate-pulse rounded-3xl border border-border bg-card" }),
      !loading && notFound && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This post doesn't exist or was deleted." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feed", className: "mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
          " Back to feed"
        ] })
      ] }),
      !loading && post && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PostCard, { post, profiles, meId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "comments", "aria-hidden": true, className: "h-0" }),
        relatedLoaded && related.moreFromAuthor.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide", children: [
            "More from ",
            authorName
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: related.moreFromAuthor.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feed/$slug", params: {
            slug: postSlug(p)
          }, className: "block rounded-2xl border border-border bg-card p-4 text-sm hover:border-primary/40 hover:bg-accent/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2", children: p.text || "(media post)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-[11px] text-muted-foreground", children: [
              p.reaction_count,
              " reactions · ",
              p.comment_count,
              " comments"
            ] })
          ] }) }, p.id)) })
        ] }),
        relatedLoaded && related.trending.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide", children: "Trending posts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: related.trending.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feed/$slug", params: {
            slug: postSlug(p)
          }, className: "block rounded-2xl border border-border bg-card p-4 text-sm hover:border-primary/40 hover:bg-accent/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2", children: p.text || "(media post)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-[11px] text-muted-foreground", children: [
              p.reaction_count,
              " reactions · ",
              p.comment_count,
              " comments"
            ] })
          ] }) }, p.id)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  PostPage as component
};
