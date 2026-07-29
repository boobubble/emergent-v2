import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { R as RouteErrorBoundary, a as useAuth } from "./router-CYWPFaDK.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { o as Gamepad2, A as ArrowLeft, a as Sparkles, af as Play, b5 as History, a$ as ChartColumn, O as Trophy, m as Award, a1 as Target, F as Flame, aW as Puzzle } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
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
import "./env.server-Bcmcot3M.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
const REGISTRY = /* @__PURE__ */ new Map();
function registerGame(game) {
  REGISTRY.set(game.id, game);
}
function getGame(id) {
  return REGISTRY.get(id);
}
function listGames() {
  return Array.from(REGISTRY.values());
}
function listFeatured() {
  return listGames().filter((g) => g.featured);
}
registerGame({
  id: "premium-2048",
  name: "Premium 2048",
  icon: Puzzle,
  description: "Slide tiles, combine matching numbers, and reach 2048. Auto-saves your progress.",
  category: "puzzle",
  launchUrl: "https://premium-2048.boobubble.app",
  supportsCloudSave: true,
  supportsAchievements: true,
  supportsLeaderboards: true,
  featured: true,
  accent: "from-amber-500 via-orange-500 to-rose-500"
});
const KEY = "bb.gamesHub.recent.v1";
function safeRead() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function getRecent(limit = 8) {
  return safeRead().slice(0, limit);
}
function getContinuePlaying(limit = 8) {
  return safeRead().filter((e) => e.hasProgress).slice(0, limit);
}
const InputSchema = objectType({
  gameId: stringType().trim().min(1).max(64).regex(/^[a-z0-9][a-z0-9-]*$/i, "invalid gameId")
});
const mintGameSession = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => InputSchema.parse(input)).handler(createSsrRpc("3743151ef5cd2723264f92bef2bf0527a6a051c8fe75a4444e74ccbec01e2bec"));
class GameLaunchError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "GameLaunchError";
  }
  code;
}
function appendSession(launchUrl, token) {
  let url;
  try {
    url = new URL(launchUrl);
  } catch {
    throw new GameLaunchError("Invalid launchUrl", "BAD_URL");
  }
  url.searchParams.set("session", token);
  return url.toString();
}
const GameLaunchService = {
  /**
   * Build the launch URL with a signed session token. Callers should
   * confirm the user is authenticated before invoking this.
   */
  async prepare(game, opts) {
    if (opts?.isAuthenticated === false) {
      throw new GameLaunchError("Sign in required to launch this game", "NOT_AUTHENTICATED");
    }
    let token;
    let expiresAt;
    try {
      const res = await mintGameSession({ data: { gameId: game.id } });
      token = res.token;
      expiresAt = res.expiresAt;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/unauthor/i.test(msg) || /401/.test(msg)) {
        throw new GameLaunchError("Sign in required to launch this game", "NOT_AUTHENTICATED");
      }
      throw new GameLaunchError(`Could not start game session: ${msg}`, "MINT_FAILED");
    }
    return { url: appendSession(game.launchUrl, token), token, expiresAt };
  },
  /**
   * Prepare and open the game in a new tab. Returns the launch result
   * for logging/telemetry.
   */
  async launch(game, opts) {
    const result = await GameLaunchService.prepare(game, opts);
    if (typeof window !== "undefined") {
      const target = opts?.target ?? "_blank";
      window.open(result.url, target, target === "_blank" ? "noopener,noreferrer" : void 0);
    }
    return result;
  }
};
async function handleGameLaunch(e, game) {
  e.preventDefault();
  try {
    await GameLaunchService.launch({
      id: game.id,
      launchUrl: game.launchUrl
    });
  } catch (err) {
    console.error("game launch failed", err);
    const msg = err instanceof Error ? err.message : "Could not start game";
    if (typeof window !== "undefined") window.alert(msg);
  }
}
function GamesHub() {
  const {
    user
  } = useAuth();
  if (!user || user.isGuest) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: "mx-auto mb-3 h-10 w-10 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Sign in to enter the Games Hub" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Track progress, unlock achievements, and climb the leaderboard." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground", children: "Back" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(HubInner, { userId: user.id });
}
function HubInner({
  userId
}) {
  const games = reactExports.useMemo(() => listGames(), []);
  const featured = reactExports.useMemo(() => listFeatured(), []);
  const [recent, setRecent] = reactExports.useState([]);
  const [continueList, setContinueList] = reactExports.useState([]);
  const [achievements, setAchievements] = reactExports.useState([]);
  const [stats, setStats] = reactExports.useState(null);
  const [challenges, setChallenges] = reactExports.useState([]);
  const [leaderboard, setLeaderboard] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    setRecent(getRecent());
    setContinueList(getContinuePlaying());
  }, []);
  reactExports.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString();
      const [achRes, savesRes, xpRes, sessionRes, missionsRes, boardRes] = await Promise.all([supabase.from("gam_user_achievements").select("achievement_id, completed_at, gam_achievements(name, icon, category)").eq("user_id", userId).not("completed_at", "is", null).order("completed_at", {
        ascending: false
      }).limit(12), supabase.from("game_saves").select("id", {
        count: "exact",
        head: true
      }).eq("user_id", userId), supabase.from("gam_event_log").select("amount").eq("user_id", userId).eq("event_type", "game.xp"), supabase.from("gam_event_log").select("id", {
        count: "exact",
        head: true
      }).eq("user_id", userId).in("event_type", ["game.started", "game.finished"]), supabase.from("gam_quests").select("id, name, description, reward_xp, reward_coins").eq("cadence", "daily").eq("active", true).order("sort_order", {
        ascending: true
      }).limit(4), supabase.from("gam_event_log").select("user_id, amount").eq("event_type", "game.score").gte("created_at", since).limit(500)]);
      if (cancelled) return;
      setAchievements(achRes.data ?? []);
      const totalXp = (xpRes.data ?? []).reduce((sum, row) => sum + (row.amount ?? 0), 0);
      setStats({
        sessions: sessionRes.count ?? 0,
        saves: savesRes.count ?? 0,
        achievements: achRes.data?.length ?? 0,
        totalXp
      });
      setChallenges(missionsRes.data ?? []);
      const byUser = /* @__PURE__ */ new Map();
      for (const row of boardRes.data ?? []) {
        if (!row.user_id) continue;
        const score = row.amount ?? 0;
        byUser.set(row.user_id, Math.max(byUser.get(row.user_id) ?? 0, score));
      }
      const topIds = Array.from(byUser.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
      let profiles = {};
      if (topIds.length) {
        const {
          data: profs
        } = await supabase.from("profiles").select("id, username, avatar_url, avatar_color").in("id", topIds.map(([id]) => id));
        profiles = Object.fromEntries((profs ?? []).map((p) => [p.id, {
          username: p.username,
          avatar_url: p.avatar_url,
          avatar_color: p.avatar_color
        }]));
      }
      setLeaderboard(topIds.map(([id, total]) => ({
        user_id: id,
        total,
        profile: profiles[id] ?? null
      })));
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl items-center gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "rounded-full p-2 hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold leading-tight", children: "Games Hub" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Featured games · Achievements · Leaderboards" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-primary" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-5xl space-y-10 px-4 pt-6", children: [
      featured.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }), title: "Featured Games", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: featured.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(FeaturedCard, { game: g, large: true }, g.id)) }) }),
      continueList.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 text-emerald-400" }), title: "Continue Playing", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: continueList.map((e) => {
        const g = getGame(e.gameId);
        if (!g) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(FeaturedCard, { game: g, subtitle: "Resume your session" }, g.id);
      }) }) }),
      recent.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4 text-sky-400" }), title: "Recently Played", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-2", children: recent.map((e) => {
        const g = getGame(e.gameId);
        if (!g) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: g.launchUrl, onClick: (ev) => handleGameLaunch(ev, g), target: "_blank", rel: "noopener noreferrer", className: "group flex min-w-[180px] flex-col rounded-xl border border-border bg-card p-3 hover:border-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MiniBanner, { game: g }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm font-bold", children: g.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: new Date(e.lastPlayedAt).toLocaleDateString() })
        ] }, g.id);
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: "h-4 w-4 text-primary" }), title: "All Games", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: games.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(FeaturedCard, { game: g }, g.id)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4 text-primary" }), title: "My Statistics", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Sessions", value: stats?.sessions ?? 0, loading }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Cloud Saves", value: stats?.saves ?? 0, loading }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Achievements", value: stats?.achievements ?? 0, loading }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Total XP", value: stats?.totalXp ?? 0, loading, suffix: " XP" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4 text-amber-400" }), title: "Achievements", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-3", children: [
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-6 text-center text-sm text-muted-foreground", children: "Loading…" }),
          !loading && achievements.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-6 text-center text-sm text-muted-foreground", children: "No achievements yet — play a game to start collecting." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: achievements.slice(0, 6).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg p-2 hover:bg-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-lg bg-amber-500/15 text-amber-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: a.gam_achievements?.name ?? a.achievement_id }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                a.gam_achievements?.category ?? "achievement",
                a.completed_at ? ` · ${new Date(a.completed_at).toLocaleDateString()}` : ""
              ] })
            ] })
          ] }, a.achievement_id)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4 text-rose-400" }), title: "Daily Challenges", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground", children: "Loading…" }),
          !loading && challenges.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground", children: "No active challenges today." }),
          challenges.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border bg-card p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-lg bg-rose-500/15 text-rose-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: c.name }),
              c.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: c.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs font-bold text-primary", children: [
              c.reward_xp ? `+${c.reward_xp} XP` : "",
              c.reward_coins ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-amber-400", children: [
                "+",
                c.reward_coins,
                " 🪙"
              ] }) : null
            ] })
          ] }, c.id))
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4 text-amber-500" }), title: "Leaderboards · 7d", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 rounded-2xl border border-border bg-card p-2", children: [
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-6 text-center text-sm text-muted-foreground", children: "Loading…" }),
          !loading && leaderboard.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-6 text-center text-sm text-muted-foreground", children: "No scores this week yet." }),
          leaderboard.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 text-center text-sm font-bold text-muted-foreground", children: i + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white", style: {
              background: r.profile?.avatar_color || "#666"
            }, children: r.profile?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: r.profile.avatar_url, alt: "", className: "h-full w-full rounded-full object-cover" }) : r.profile?.username?.[0]?.toUpperCase() ?? "?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 text-sm font-medium", children: r.profile?.username || "Player" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-primary", children: r.total.toLocaleString() })
          ] }, r.user_id))
        ] }) })
      ] })
    ] })
  ] });
}
function Section({
  icon,
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold uppercase tracking-wider text-muted-foreground", children: title })
    ] }),
    children
  ] });
}
function MiniBanner({
  game
}) {
  const Icon = game.icon;
  if (game.banner) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: game.banner, alt: "", className: "h-20 w-full rounded-lg object-cover" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-20 w-full place-items-center rounded-lg bg-gradient-to-br ${game.accent ?? "from-primary/60 to-primary/20"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-8 w-8 text-white/90" }) });
}
function FeaturedCard({
  game,
  large,
  subtitle
}) {
  const Icon = game.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: game.launchUrl, onClick: (ev) => handleGameLaunch(ev, game), target: "_blank", rel: "noopener noreferrer", className: "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative ${large ? "h-32" : "h-24"} w-full overflow-hidden`, children: [
      game.banner ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: game.banner, alt: "", className: "h-full w-full object-cover transition-transform group-hover:scale-105" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full w-full bg-gradient-to-br ${game.accent ?? "from-primary/60 to-primary/20"}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 left-3 flex items-center gap-2 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-lg bg-white/15 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold drop-shadow", children: game.name })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-xs text-muted-foreground", children: subtitle ?? game.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wider", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground", children: game.category }),
        game.supportsCloudSave && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-400", children: "Cloud save" }),
        game.supportsAchievements && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-400", children: "Achievements" }),
        game.supportsLeaderboards && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-sky-500/15 px-2 py-0.5 text-sky-400", children: "Leaderboards" })
      ] })
    ] })
  ] });
}
function StatTile({
  label,
  value,
  loading,
  suffix
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xl font-bold", children: [
      loading ? "…" : value.toLocaleString(),
      !loading && suffix ? suffix : ""
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RouteErrorBoundary, { section: "Games", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GamesHub, {}) });
export {
  SplitComponent as component
};
