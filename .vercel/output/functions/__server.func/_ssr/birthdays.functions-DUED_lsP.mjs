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
const getFriendBirthdaysToday_createServerFn_handler = createServerRpc({
  id: "0a8dd47bdefe52f0d2a14e538afcf1438f38f026249b39309a493bd8d805d3f7",
  name: "getFriendBirthdaysToday",
  filename: "src/lib/birthdays.functions.ts"
}, (opts) => getFriendBirthdaysToday.__executeServer(opts));
const getFriendBirthdaysToday = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(getFriendBirthdaysToday_createServerFn_handler, async ({
  context
}) => {
  const me = context.userId;
  const {
    data: friends
  } = await supabaseAdmin.from("friendships").select("sender_id,receiver_id").eq("status", "accepted").or(`sender_id.eq.${me},receiver_id.eq.${me}`);
  const friendIds = (friends ?? []).map((f) => f.sender_id === me ? f.receiver_id : f.sender_id);
  if (friendIds.length === 0) return [];
  const {
    data: profs
  } = await supabaseAdmin.from("profiles").select("id, username, avatar_url, birthday, hide_birth_year").in("id", friendIds).not("birthday", "is", null);
  const now = /* @__PURE__ */ new Date();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const todayKey = `${mm}-${dd}`;
  const today = [];
  for (const p of profs ?? []) {
    if (!p.birthday) continue;
    const key = String(p.birthday).slice(5, 10);
    if (key !== todayKey) continue;
    const year = Number(String(p.birthday).slice(0, 4));
    const turning = Number.isFinite(year) && !p.hide_birth_year ? now.getUTCFullYear() - year : null;
    today.push({
      id: p.id,
      username: p.username,
      avatar_url: p.avatar_url,
      birthday: p.birthday,
      hide_birth_year: !!p.hide_birth_year,
      turning_years: turning
    });
  }
  return today;
});
export {
  getFriendBirthdaysToday_createServerFn_handler
};
