import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, e as enumType } from "../_libs/zod.mjs";
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
async function assertAdmin(userId) {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data
  } = await supabaseAdmin.rpc("is_admin", {
    _user_id: userId
  });
  if (!data) throw new Error("Forbidden");
}
const Input = objectType({
  window: enumType(["day", "week", "month", "all"]).default("month"),
  creatorId: stringType().uuid().optional()
});
function windowStart(w) {
  if (w === "all") return null;
  const now = Date.now();
  const ms = w === "day" ? 864e5 : w === "week" ? 7 * 864e5 : 30 * 864e5;
  return new Date(now - ms).toISOString();
}
const getCompetitionAnalytics_createServerFn_handler = createServerRpc({
  id: "c76477e20f6378f36f675d09ca2c44cb76f622caebac8e16eb7e80c0c813f7fe",
  name: "getCompetitionAnalytics",
  filename: "src/lib/competition-analytics.functions.ts"
}, (opts) => getCompetitionAnalytics.__executeServer(opts));
const getCompetitionAnalytics = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((raw) => Input.parse(raw)).handler(getCompetitionAnalytics_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const since = windowStart(data.window);
  let compQ = supabaseAdmin.from("competitions").select("id, name, slug, status, category_id, banner_url, total_votes, total_participants, views_count, is_featured, created_at, created_by, end_at");
  if (data.creatorId) compQ = compQ.eq("created_by", data.creatorId);
  const {
    data: comps = []
  } = await compQ;
  const rows = comps ?? [];
  const counts = {
    total: rows.length,
    active: rows.filter((c) => c.status === "live").length,
    upcoming: rows.filter((c) => c.status === "upcoming").length,
    completed: rows.filter((c) => c.status === "completed").length,
    featured: rows.filter((c) => c.is_featured).length
  };
  const compIds = rows.map((c) => c.id);
  let nomineesCount = 0;
  let followersCount = 0;
  if (compIds.length > 0) {
    const [{
      count: n
    }, {
      count: f
    }] = await Promise.all([supabaseAdmin.from("competition_participants").select("id", {
      count: "exact",
      head: true
    }).in("competition_id", compIds), supabaseAdmin.from("competition_follows").select("competition_id", {
      count: "exact",
      head: true
    }).in("competition_id", compIds)]);
    nomineesCount = n ?? 0;
    followersCount = f ?? 0;
  }
  let voteQ = supabaseAdmin.from("competition_votes").select("competition_id, voter_id, created_at");
  if (since) voteQ = voteQ.gte("created_at", since);
  if (compIds.length > 0) voteQ = voteQ.in("competition_id", compIds);
  const {
    data: votes = []
  } = await voteQ;
  const voteRows = votes ?? [];
  const uniqueVoters = new Set(voteRows.map((v) => v.voter_id)).size;
  const dayBuckets = /* @__PURE__ */ new Map();
  const startWindow = Date.now() - 30 * 864e5;
  for (const v of voteRows) {
    const t = new Date(v.created_at).getTime();
    if (t < startWindow) continue;
    const day = new Date(v.created_at).toISOString().slice(0, 10);
    dayBuckets.set(day, (dayBuckets.get(day) ?? 0) + 1);
  }
  const trends = Array.from(dayBuckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => ({
    day,
    count
  }));
  const votesByComp = /* @__PURE__ */ new Map();
  for (const v of voteRows) {
    votesByComp.set(v.competition_id, (votesByComp.get(v.competition_id) ?? 0) + 1);
  }
  const withStats = rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    votes: c.total_votes ?? 0,
    votesInWindow: votesByComp.get(c.id) ?? 0,
    participants: c.total_participants ?? 0,
    views: c.views_count ?? 0,
    category_id: c.category_id
  }));
  const topCompetitions = [...withStats].sort((a, b) => b.votes - a.votes).slice(0, 10);
  const fastestGrowing = [...withStats].sort((a, b) => b.votesInWindow - a.votesInWindow).slice(0, 10);
  const mostViewed = [...withStats].sort((a, b) => b.views - a.views).slice(0, 10);
  let topNominees = [];
  if (compIds.length > 0) {
    const {
      data: parts = []
    } = await supabaseAdmin.from("competition_participants").select("user_id, vote_count, competition_id").in("competition_id", compIds).order("vote_count", {
      ascending: false
    }).limit(10);
    const userIds = (parts ?? []).map((p) => p.user_id);
    const {
      data: profs = []
    } = userIds.length ? await supabaseAdmin.from("profiles").select("id, username").in("id", userIds) : {
      data: []
    };
    const nameMap = new Map((profs ?? []).map((p) => [p.id, p.username]));
    const compMap = new Map(rows.map((c) => [c.id, c.name]));
    topNominees = (parts ?? []).map((p) => ({
      user_id: p.user_id,
      username: nameMap.get(p.user_id) ?? "unknown",
      vote_count: p.vote_count ?? 0,
      competition: compMap.get(p.competition_id) ?? ""
    }));
  }
  const {
    data: cats = []
  } = await supabaseAdmin.from("competition_categories").select("id, name");
  const catMap = new Map((cats ?? []).map((c) => [c.id, c.name]));
  const catVotes = /* @__PURE__ */ new Map();
  for (const c of rows) {
    if (!c.category_id) continue;
    catVotes.set(c.category_id, (catVotes.get(c.category_id) ?? 0) + (c.total_votes ?? 0));
  }
  const topCategories = Array.from(catVotes.entries()).map(([id, votes2]) => ({
    id,
    name: catMap.get(id) ?? id,
    votes: votes2
  })).sort((a, b) => b.votes - a.votes).slice(0, 10);
  return {
    counts,
    totals: {
      nominees: nomineesCount,
      votes: rows.reduce((s, c) => s + (c.total_votes ?? 0), 0),
      votesInWindow: voteRows.length,
      uniqueVoters,
      followers: followersCount,
      views: rows.reduce((s, c) => s + (c.views_count ?? 0), 0)
    },
    topCompetitions,
    fastestGrowing,
    mostViewed,
    topNominees,
    topCategories,
    trends
  };
});
export {
  getCompetitionAnalytics_createServerFn_handler
};
