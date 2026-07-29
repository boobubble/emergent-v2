import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { D as DAILY_MISSIONS, M as MISSION_BY_ID } from "./economy-config-CPZpIbo-.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
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
async function getSupabaseAdmin() {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin2;
}
function todayUtc() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
async function bumpProfile(userId, addXp, addCoins) {
  const {
    data
  } = await supabaseAdmin.from("profiles").select("xp, coins").eq("id", userId).maybeSingle();
  if (!data) return;
  const newXp = Math.max(0, (data.xp ?? 0) + addXp);
  const newCoins = Math.max(0, (data.coins ?? 0) + addCoins);
  const newLevel = Math.max(1, Math.floor(newXp / 50) + 1);
  await supabaseAdmin.from("profiles").update({
    xp: newXp,
    coins: newCoins,
    level: newLevel
  }).eq("id", userId);
}
const getTodayMissions_createServerFn_handler = createServerRpc({
  id: "9ff2da6f1cb7b62b1f668664cc4268df30838ea70729b37d14d822951dd79994",
  name: "getTodayMissions",
  filename: "src/lib/missions.functions.ts"
}, (opts) => getTodayMissions.__executeServer(opts));
const getTodayMissions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).handler(getTodayMissions_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const day = todayUtc();
  const {
    data: row
  } = await supabaseAdmin.from("daily_missions").select("progress, claimed").eq("user_id", userId).eq("day", day).maybeSingle();
  const progress = row?.progress ?? {};
  const claimed = new Set(row?.claimed ?? []);
  return {
    day,
    missions: DAILY_MISSIONS.map((m) => {
      const p = progress[m.id] ?? 0;
      return {
        ...m,
        progress: Math.min(p, m.target),
        completed: p >= m.target,
        claimed: claimed.has(m.id)
      };
    })
  };
});
const claimMission_createServerFn_handler = createServerRpc({
  id: "6af5861777f1d7932c1ff026703c73ad4d97dc25f60de45493ad271c8c1e4d29",
  name: "claimMission",
  filename: "src/lib/missions.functions.ts"
}, (opts) => claimMission.__executeServer(opts));
const claimMission = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((i) => objectType({
  missionId: stringType().min(1).max(64)
}).parse(i)).handler(claimMission_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const mission = MISSION_BY_ID[data.missionId];
  if (!mission) throw new Error("Unknown mission");
  const day = todayUtc();
  const {
    data: row
  } = await supabaseAdmin.from("daily_missions").select("id, progress, claimed").eq("user_id", userId).eq("day", day).maybeSingle();
  if (!row) throw new Error("No progress yet");
  const progress = row.progress ?? {};
  const current = progress[mission.id] ?? 0;
  if (current < mission.target) throw new Error("Mission not yet complete");
  const claimed = row.claimed ?? [];
  if (claimed.includes(mission.id)) throw new Error("Already claimed");
  await bumpProfile(userId, mission.xp, mission.coins);
  await (await getSupabaseAdmin()).from("coin_transactions").insert({
    user_id: userId,
    kind: "coins",
    amount: mission.coins,
    reason: "mission_claim",
    ref_type: "mission",
    ref_id: mission.id
  });
  await supabaseAdmin.from("daily_missions").update({
    claimed: [...claimed, mission.id],
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", row.id);
  return {
    ok: true,
    coins: mission.coins,
    xp: mission.xp
  };
});
export {
  claimMission_createServerFn_handler,
  getTodayMissions_createServerFn_handler
};
