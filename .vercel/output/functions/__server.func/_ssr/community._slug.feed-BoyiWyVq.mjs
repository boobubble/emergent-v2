import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { a as useAuth, N as postsSafe } from "./router-CYWPFaDK.mjs";
import { C as Composer } from "./Composer-B7ERp76N.mjs";
import { P as PostCard } from "./PostCard-DLZQjCkW.mjs";
import { u as useCommunity } from "./community-context-Bgy_g-7B.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/react-dom.mjs";
import { N as Search, cx as Rss } from "../_libs/lucide-react.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
import "./confessions.functions-BBpBF4R_.mjs";
import "./focus-composer-config-C2kdKn7r.mjs";
import "./cache-manager-cID9K-3q.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "./boobubble.functions-BRP0x1de.mjs";
import "./economy-config-CPZpIbo-.mjs";
function normalizePost(row) {
  return {
    id: row.id ?? "",
    author_id: row.author_id ?? "",
    owner_id: row.owner_id ?? row.author_id ?? "",
    kind: row.kind ?? "text",
    text: row.text ?? "",
    slug: row.slug ?? row.id ?? "post",
    media_urls: Array.isArray(row.media_urls) ? row.media_urls : [],
    poll: row.poll ?? null,
    privacy: row.privacy ?? "public",
    is_anonymous: Boolean(row.is_anonymous),
    hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
    reaction_count: row.reaction_count ?? 0,
    comment_count: row.comment_count ?? 0,
    trending_score: row.trending_score ?? 0,
    created_at: row.created_at ?? (/* @__PURE__ */ new Date()).toISOString()
  };
}
function CommunityFeed() {
  const {
    community,
    communityId,
    isMember,
    isOwner
  } = useCommunity();
  const {
    user
  } = useAuth();
  const meId = user?.id ?? "";
  const canPost = !!user && (isMember || isOwner);
  const [posts, setPosts] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [query, setQuery] = reactExports.useState("");
  const [profiles, setProfiles] = reactExports.useState({});
  async function load() {
    setLoading(true);
    const {
      data
    } = await postsSafe().select("*").eq("community_id", communityId).order("created_at", {
      ascending: false
    }).limit(50);
    setPosts((data ?? []).map(normalizePost));
    setLoading(false);
  }
  reactExports.useEffect(() => {
    load();
    const ch = supabase.channel(`feed-community-${communityId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "posts",
      filter: `community_id=eq.${communityId}`
    }, (payload) => {
      if (payload.eventType === "INSERT") setPosts((p) => [normalizePost(payload.new), ...p]);
      else if (payload.eventType === "DELETE") setPosts((p) => p.filter((x) => x.id !== payload.old.id));
      else if (payload.eventType === "UPDATE") setPosts((p) => p.map((x) => x.id === payload.new.id ? normalizePost(payload.new) : x));
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [communityId]);
  reactExports.useEffect(() => {
    const ids = Array.from(new Set(posts.map((p) => p.author_id).filter(Boolean)));
    if (!ids.length) return;
    (async () => {
      const {
        data
      } = await supabase.from("profiles").select("id,username,display_name,avatar_url,avatar_color").in("id", ids);
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
  }, [posts]);
  const filtered = reactExports.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const text = (p.text || "").toLowerCase();
      const tags = (p.hashtags || []).map((t) => t.toLowerCase());
      return text.includes(q) || tags.some((t) => t.includes(q));
    });
  }, [posts, query]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg border bg-card px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: `Search ${community.name}…`, className: "flex-1 bg-transparent text-sm outline-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary", children: "Community" })
    ] }),
    canPost && /* @__PURE__ */ jsxRuntimeExports.jsx(Composer, { authorId: meId, communityId, onPosted: load }),
    !user && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground", children: "Sign in to post in this community." }),
    user && !canPost && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground", children: "Join this community to post here." }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-sm text-muted-foreground", children: "Loading community posts…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Rss, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-semibold", children: "No posts yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: canPost ? "Be the first to post in this community." : "Come back soon — this community is just getting started." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PostCard, { post: p, profiles, meId }, p.id)) })
  ] });
}
export {
  CommunityFeed as component
};
