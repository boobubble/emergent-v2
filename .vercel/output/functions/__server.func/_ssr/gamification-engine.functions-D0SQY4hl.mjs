import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
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
import "./env.server-Bcmcot3M.mjs";
const emitGamificationEvent_createServerFn_handler = createServerRpc({
  id: "94a3e957e5e716a9b7be50dbc5d9ec1dd7a72340fe0e2f1d7fa92128b76936f7",
  name: "emitGamificationEvent",
  filename: "src/lib/gamification-engine.functions.ts"
}, (opts) => emitGamificationEvent.__executeServer(opts));
const emitGamificationEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((input) => {
  if (!input?.event || typeof input.event !== "string") throw new Error("event required");
  return {
    event: input.event,
    amount: Number.isFinite(input.amount) ? Math.max(1, Math.floor(input.amount)) : 1,
    metadata: input.metadata ?? {}
  };
}).handler(emitGamificationEvent_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = context.supabase;
  const {
    error
  } = await sb.rpc("gam_emit", {
    _user_id: context.userId,
    _event_type: data.event,
    _amount: data.amount,
    _metadata: data.metadata
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getMyGamification_createServerFn_handler = createServerRpc({
  id: "d664a8874ca419990ea235654adaa476a19c7a88633bcf6f705e5c961c3e54fe",
  name: "getMyGamification",
  filename: "src/lib/gamification-engine.functions.ts"
}, (opts) => getMyGamification.__executeServer(opts));
const getMyGamification = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).handler(getMyGamification_createServerFn_handler, async ({
  context
}) => {
  const sb = context.supabase;
  const uid = context.userId;
  const [ach, achProg, quests, qProg, ms, mProg, seasons, sTiers, sProg] = await Promise.all([sb.from("gam_achievements").select("*").eq("active", true).order("sort_order"), sb.from("gam_user_achievements").select("*").eq("user_id", uid), sb.from("gam_quests").select("*").eq("active", true).order("sort_order"), sb.from("gam_user_quests").select("*").eq("user_id", uid), sb.from("gam_milestones").select("*").eq("active", true).order("sort_order"), sb.from("gam_user_milestones").select("*").eq("user_id", uid), sb.from("gam_seasons").select("*").eq("active", true).order("starts_at", {
    ascending: false
  }).limit(1), sb.from("gam_season_tiers").select("*").order("tier"), sb.from("gam_user_season").select("*").eq("user_id", uid)]);
  const achievements = (ach.data ?? []).map((a) => ({
    ...a,
    progress: (achProg.data ?? []).find((p) => p.achievement_id === a.id) ?? null
  }));
  const questsOut = (quests.data ?? []).map((q) => ({
    ...q,
    progress: (qProg.data ?? []).find((p) => p.quest_id === q.id) ?? null
  }));
  const milestones = (ms.data ?? []).map((m) => ({
    ...m,
    progress: (mProg.data ?? []).find((p) => p.milestone_id === m.id) ?? null
  }));
  const season = (seasons.data ?? [])[0] ?? null;
  const tiers = season ? (sTiers.data ?? []).filter((t) => t.season_id === season.id) : [];
  const seasonProgress = season ? (sProg.data ?? []).find((s) => s.season_id === season.id) ?? null : null;
  const totalAch = achievements.length;
  const doneAch = achievements.filter((a) => a.progress?.completed_at).length;
  return {
    achievements,
    quests: questsOut,
    milestones,
    season,
    tiers,
    seasonProgress,
    completionPct: totalAch ? Math.round(doneAch / totalAch * 100) : 0
  };
});
const claimSeasonTier_createServerFn_handler = createServerRpc({
  id: "e9f3dcd15790dab36e2a321430bd5c045f80b2f5dc919be2fa4c0fa74df482c3",
  name: "claimSeasonTier",
  filename: "src/lib/gamification-engine.functions.ts"
}, (opts) => claimSeasonTier.__executeServer(opts));
const claimSeasonTier = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((i) => i).handler(claimSeasonTier_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = context.supabase;
  const {
    error
  } = await sb.rpc("gam_claim_season_tier", {
    _season_id: data.seasonId,
    _tier: data.tier
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getGamificationAnalytics_createServerFn_handler = createServerRpc({
  id: "c2af82fb7ae15ee4fd71262e76f7268d0e071a56c6171e3e990f537cd2e40fec",
  name: "getGamificationAnalytics",
  filename: "src/lib/gamification-engine.functions.ts"
}, (opts) => getGamificationAnalytics.__executeServer(opts));
const getGamificationAnalytics = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).handler(getGamificationAnalytics_createServerFn_handler, async ({
  context
}) => {
  const sb = context.supabase;
  const {
    data: isAdmin
  } = await sb.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin"
  });
  if (!isAdmin) throw new Error("Forbidden");
  const [{
    data: events
  }, {
    data: topAch
  }, {
    data: qStats
  }] = await Promise.all([sb.from("gam_event_log").select("event_type, created_at").gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString()).limit(5e3), sb.from("gam_user_achievements").select("achievement_id").not("completed_at", "is", null).limit(5e3), sb.from("gam_user_quests").select("quest_id, completed_at").limit(5e3)]);
  const byType = {};
  (events ?? []).forEach((e) => {
    byType[e.event_type] = (byType[e.event_type] ?? 0) + 1;
  });
  const byAch = {};
  (topAch ?? []).forEach((r) => {
    byAch[r.achievement_id] = (byAch[r.achievement_id] ?? 0) + 1;
  });
  const totalQ = (qStats ?? []).length;
  const doneQ = (qStats ?? []).filter((q) => q.completed_at).length;
  return {
    events7d: byType,
    topAchievements: byAch,
    questCompletionRate: totalQ ? doneQ / totalQ : 0
  };
});
const listGamCatalog_createServerFn_handler = createServerRpc({
  id: "92d4d468271dcb967cfb2648ecdcb878924422739ed5b8966d72fbc1f5d29fa8",
  name: "listGamCatalog",
  filename: "src/lib/gamification-engine.functions.ts"
}, (opts) => listGamCatalog.__executeServer(opts));
const listGamCatalog = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).handler(listGamCatalog_createServerFn_handler, async ({
  context
}) => {
  const sb = context.supabase;
  const {
    data: isAdmin
  } = await sb.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin"
  });
  if (!isAdmin) throw new Error("Forbidden");
  const [a, q, m, s, t] = await Promise.all([sb.from("gam_achievements").select("*").order("sort_order"), sb.from("gam_quests").select("*").order("sort_order"), sb.from("gam_milestones").select("*").order("sort_order"), sb.from("gam_seasons").select("*").order("starts_at", {
    ascending: false
  }), sb.from("gam_season_tiers").select("*").order("tier")]);
  return {
    achievements: a.data ?? [],
    quests: q.data ?? [],
    milestones: m.data ?? [],
    seasons: s.data ?? [],
    tiers: t.data ?? []
  };
});
const upsertGamRow_createServerFn_handler = createServerRpc({
  id: "22827294a36c69726027ed02b477a829c5d96db9ad38cf2d7bc8d971eb38e12f",
  name: "upsertGamRow",
  filename: "src/lib/gamification-engine.functions.ts"
}, (opts) => upsertGamRow.__executeServer(opts));
const upsertGamRow = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((i) => i).handler(upsertGamRow_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = context.supabase;
  const {
    data: isAdmin
  } = await sb.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin"
  });
  if (!isAdmin) throw new Error("Forbidden");
  const {
    error
  } = await sb.from(data.table).upsert(data.row);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteGamRow_createServerFn_handler = createServerRpc({
  id: "37d4eab47adbd85d2af21138ddee9f47a19393ef715319b068a15cc5d0d84721",
  name: "deleteGamRow",
  filename: "src/lib/gamification-engine.functions.ts"
}, (opts) => deleteGamRow.__executeServer(opts));
const deleteGamRow = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((i) => i).handler(deleteGamRow_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = context.supabase;
  const {
    data: isAdmin
  } = await sb.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin"
  });
  if (!isAdmin) throw new Error("Forbidden");
  const {
    error
  } = await sb.from(data.table).delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  claimSeasonTier_createServerFn_handler,
  deleteGamRow_createServerFn_handler,
  emitGamificationEvent_createServerFn_handler,
  getGamificationAnalytics_createServerFn_handler,
  getMyGamification_createServerFn_handler,
  listGamCatalog_createServerFn_handler,
  upsertGamRow_createServerFn_handler
};
