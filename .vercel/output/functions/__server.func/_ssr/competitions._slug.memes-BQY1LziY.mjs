import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { du as Route$g, a as useAuth, cO as listCompetitionNominees, cr as listCompetitionMemes } from "./router-CYWPFaDK.mjs";
import { P as PostCard } from "./PostCard-DLZQjCkW.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, bo as Laugh } from "../_libs/lucide-react.mjs";
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
function CompetitionMemesPage() {
  const {
    competition
  } = Route$g.useLoaderData();
  const {
    nominee
  } = Route$g.useSearch();
  const {
    user
  } = useAuth();
  const meId = user?.id ?? "";
  const [memes, setMemes] = reactExports.useState([]);
  const [nominees, setNominees] = reactExports.useState([]);
  const [profiles, setProfiles] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (!competition?.id) return;
    listCompetitionNominees(competition.id).then(setNominees);
  }, [competition?.id]);
  reactExports.useEffect(() => {
    if (!competition?.id) return;
    let alive = true;
    async function load() {
      const data = await listCompetitionMemes({
        competitionId: competition.id,
        nomineeId: nominee || null,
        limit: 100
      });
      if (alive) setMemes(data);
    }
    load();
    const ch = supabase.channel(`comp-memes-page-${competition.id}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "posts",
      filter: `competition_id=eq.${competition.id}`
    }, () => load()).subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [competition?.id, nominee]);
  reactExports.useEffect(() => {
    const ids = Array.from(new Set(memes.map((p) => p.author_id).filter(Boolean)));
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
  }, [memes]);
  if (!competition) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-2xl p-8 text-center text-sm text-muted-foreground", children: "Competition not found." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl space-y-4 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/competitions/$slug", params: {
      slug: competition.slug
    }, className: "inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3 w-3" }),
      " Back to ",
      competition.name
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "rounded-2xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "inline-flex items-center gap-2 text-lg font-black", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Laugh, { className: "h-5 w-5 text-amber-500" }),
        " Trending Battle Memes"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
        "Feed memes tagged with ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: competition.name }),
        ". Ranked by engagement, newest first when tied."
      ] }),
      nominees.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/competitions/$slug/memes", params: {
          slug: competition.slug
        }, search: {
          nominee: ""
        }, className: `rounded-full border px-2.5 py-1 text-[11px] font-semibold ${!nominee ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`, children: "All memes" }),
        nominees.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/competitions/$slug/memes", params: {
          slug: competition.slug
        }, search: {
          nominee: n.id
        }, className: `rounded-full border px-2.5 py-1 text-[11px] font-semibold ${nominee === n.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`, children: n.name }, n.id))
      ] })
    ] }),
    memes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground", children: [
      "No memes yet. Head to the Feed composer, pick ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "😂 Meme" }),
      ", and tag this competition."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: memes.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PostCard, { post: p, profiles, meId }, p.id)) })
  ] });
}
export {
  CompetitionMemesPage as component
};
