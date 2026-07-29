import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
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
async function getSupabaseAdmin() {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin2;
}
const XP_ACTIONS = {
  post: 5,
  comment: 1,
  reaction: 1,
  daily_login: 10
};
const DAILY_CAP = {
  post: 10,
  // up to 10 posts/day count for XP
  comment: 30,
  reaction: 50,
  daily_login: 1
};
const awardXp_createServerFn_handler = createServerRpc({
  id: "417f909761be074b0ec58b2556613f6f72b464544eef72f807a11ce3b6ffe628",
  name: "awardXp",
  filename: "src/lib/gamification.functions.ts"
}, (opts) => awardXp.__executeServer(opts));
const awardXp = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((input) => {
  if (!input || typeof input.action !== "string" || !(input.action in XP_ACTIONS)) {
    throw new Error("Invalid XP action");
  }
  return {
    action: input.action
  };
}).handler(awardXp_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const amount = XP_ACTIONS[data.action];
  const cap = DAILY_CAP[data.action];
  const todayStart = /* @__PURE__ */ new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const {
    count
  } = await supabaseAdmin.from("coin_transactions").select("id", {
    count: "exact",
    head: true
  }).eq("user_id", userId).eq("kind", "xp_award").eq("reason", data.action).gte("created_at", todayStart.toISOString());
  if ((count ?? 0) >= cap) {
    const {
      data: prof2
    } = await supabaseAdmin.from("profiles").select("xp").eq("id", userId).maybeSingle();
    return {
      xp: prof2?.xp ?? 0,
      capped: true
    };
  }
  const {
    data: prof
  } = await supabaseAdmin.from("profiles").select("xp").eq("id", userId).maybeSingle();
  const next = (prof?.xp ?? 0) + amount;
  const {
    error
  } = await supabaseAdmin.from("profiles").update({
    xp: next
  }).eq("id", userId);
  if (error) throw new Error(error.message);
  await (await getSupabaseAdmin()).from("coin_transactions").insert({
    user_id: userId,
    amount,
    kind: "xp_award",
    reason: data.action
  });
  return {
    xp: next,
    capped: false
  };
});
const pingDailyStreak_createServerFn_handler = createServerRpc({
  id: "712b9ee2080ac24476f7b48f0e09a6deaaf01126deb43d8798e9d0fd9acad5dc",
  name: "pingDailyStreak",
  filename: "src/lib/gamification.functions.ts"
}, (opts) => pingDailyStreak.__executeServer(opts));
const pingDailyStreak = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).handler(pingDailyStreak_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const {
    data: p
  } = await supabaseAdmin.from("profiles").select("last_active_day, streak, longest_streak").eq("id", userId).maybeSingle();
  if (!p) return {
    ok: false
  };
  if (p.last_active_day === today) return {
    ok: true,
    unchanged: true
  };
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const next = p.last_active_day === yesterday ? (p.streak ?? 0) + 1 : 1;
  const longest = Math.max(p.longest_streak ?? 0, next);
  const {
    error
  } = await supabaseAdmin.from("profiles").update({
    last_active_day: today,
    streak: next,
    longest_streak: longest
  }).eq("id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true,
    streak: next,
    longest_streak: longest
  };
});
export {
  awardXp_createServerFn_handler,
  pingDailyStreak_createServerFn_handler
};
