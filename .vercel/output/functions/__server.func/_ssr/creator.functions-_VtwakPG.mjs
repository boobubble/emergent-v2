import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { c as creatorRankFor, V as VIRAL_JACKPOT, a as SCORE_WEIGHTS } from "./economy-config-CPZpIbo-.mjs";
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
function weekAgoIso() {
  return new Date(Date.now() - 7 * 864e5).toISOString();
}
function scorePost(p) {
  const r = (p.reaction_count ?? 0) * SCORE_WEIGHTS.reaction;
  const c = (p.comment_count ?? 0) * SCORE_WEIGHTS.comment;
  const t = (p.trending_score ?? 0) * 0.5;
  return r + c + t;
}
const getMyCreatorRank_createServerFn_handler = createServerRpc({
  id: "144e62f99e7f7056d280dd69f6d06a2069ce67b247347e85a2558a151ead5dd6",
  name: "getMyCreatorRank",
  filename: "src/lib/creator.functions.ts"
}, (opts) => getMyCreatorRank.__executeServer(opts));
const getMyCreatorRank = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(getMyCreatorRank_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const {
    data
  } = await supabaseAdmin.from("posts").select("owner_id, reaction_count, comment_count, trending_score").eq("owner_id", userId).gte("created_at", weekAgoIso()).limit(200);
  const rows = data ?? [];
  const score = rows.reduce((s, p) => s + scorePost(p), 0);
  const rank = creatorRankFor(score);
  return {
    score: Math.round(score),
    rank,
    postCount: rows.length
  };
});
const getCreatorLeaderboard_createServerFn_handler = createServerRpc({
  id: "41cfdb8af178472f9839a1a826968c8eab17b2ba7b80f94704992f662ce29f01",
  name: "getCreatorLeaderboard",
  filename: "src/lib/creator.functions.ts"
}, (opts) => getCreatorLeaderboard.__executeServer(opts));
const getCreatorLeaderboard = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(getCreatorLeaderboard_createServerFn_handler, async () => {
  const {
    data
  } = await supabaseAdmin.from("posts").select("owner_id, reaction_count, comment_count, trending_score").gte("created_at", weekAgoIso()).not("owner_id", "is", null).limit(1e3);
  const rows = data ?? [];
  const byUser = /* @__PURE__ */ new Map();
  for (const p of rows) {
    if (!p.owner_id) continue;
    const cur = byUser.get(p.owner_id) ?? {
      score: 0,
      posts: 0
    };
    cur.score += scorePost(p);
    cur.posts += 1;
    byUser.set(p.owner_id, cur);
  }
  const top = Array.from(byUser.entries()).map(([userId, {
    score,
    posts
  }]) => ({
    userId,
    score: Math.round(score),
    posts,
    rank: creatorRankFor(score)
  })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 25);
  return {
    top
  };
});
const getViralJackpot_createServerFn_handler = createServerRpc({
  id: "4e68ea51bbb50b27654ea3e6f9866e8da98c9ee9d42b97e3c31fcabe0c949230",
  name: "getViralJackpot",
  filename: "src/lib/creator.functions.ts"
}, (opts) => getViralJackpot.__executeServer(opts));
const getViralJackpot = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(getViralJackpot_createServerFn_handler, async () => {
  const dayStart = /* @__PURE__ */ new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const {
    data
  } = await supabaseAdmin.from("posts").select("id, owner_id, text, trending_score, reaction_count, comment_count, created_at").gte("created_at", dayStart.toISOString()).order("trending_score", {
    ascending: false
  }).limit(1).maybeSingle();
  return {
    post: data ?? null,
    reward: VIRAL_JACKPOT,
    qualifies: !!data && (data.trending_score ?? 0) >= VIRAL_JACKPOT.minScore
  };
});
export {
  getCreatorLeaderboard_createServerFn_handler,
  getMyCreatorRank_createServerFn_handler,
  getViralJackpot_createServerFn_handler
};
