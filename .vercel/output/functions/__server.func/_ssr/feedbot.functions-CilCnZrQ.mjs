import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, b as booleanType, n as numberType, a as arrayType, r as recordType } from "../_libs/zod.mjs";
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
const FEEDBOT_BOT_USERNAME = "FeedBot";
const FEEDBOT_BOT_BIO = "Keeping the community informed with live updates, competitions, achievements, and social activity.";
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
const getFeedbotSettings_createServerFn_handler = createServerRpc({
  id: "dcc8507c92a23e8f3ec6ecae8baf6d72fd47142a008a0a143e5bf035f4785a68",
  name: "getFeedbotSettings",
  filename: "src/lib/feedbot.functions.ts"
}, (opts) => getFeedbotSettings.__executeServer(opts));
const getFeedbotSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(getFeedbotSettings_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data
  } = await supabaseAdmin.from("feedbot_settings").select("*").eq("id", true).maybeSingle();
  return data ?? null;
});
const SaveInput = objectType({
  enabled: booleanType().optional(),
  event_flags: recordType(stringType(), booleanType()).optional(),
  target_chatrooms: arrayType(stringType().uuid()).optional(),
  min_interval_seconds: numberType().int().min(30).max(3600).optional(),
  digest_mode: booleanType().optional(),
  daily_summary_enabled: booleanType().optional(),
  daily_summary_time: stringType().regex(/^\d{2}:\d{2}$/).optional()
});
const saveFeedbotSettings_createServerFn_handler = createServerRpc({
  id: "c39bcfda5c631e26839affbb0da89c71120e0a0c82e77ecd380845338749f5af",
  name: "saveFeedbotSettings",
  filename: "src/lib/feedbot.functions.ts"
}, (opts) => saveFeedbotSettings.__executeServer(opts));
const saveFeedbotSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => SaveInput.parse(raw)).handler(saveFeedbotSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    error
  } = await supabaseAdmin.from("feedbot_settings").update(data).eq("id", true);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const provisionFeedbot_createServerFn_handler = createServerRpc({
  id: "5797618f41bbb806cb39c3fff2767434cdf0517677db031e6c7c6c127616ffd2",
  name: "provisionFeedbot",
  filename: "src/lib/feedbot.functions.ts"
}, (opts) => provisionFeedbot.__executeServer(opts));
const provisionFeedbot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(provisionFeedbot_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: settings
  } = await supabaseAdmin.from("feedbot_settings").select("bot_user_id").eq("id", true).maybeSingle();
  if (settings?.bot_user_id) {
    await supabaseAdmin.from("profiles").update({
      is_bot: true,
      is_verified: true,
      username: FEEDBOT_BOT_USERNAME,
      bio: FEEDBOT_BOT_BIO
    }).eq("id", settings.bot_user_id);
    return {
      ok: true,
      user_id: settings.bot_user_id,
      existed: true
    };
  }
  const email = `feedbot+${Date.now()}@boobubble.app`;
  const password = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const {
    data: created,
    error: cErr
  } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username: FEEDBOT_BOT_USERNAME,
      gender: "other"
    }
  });
  if (cErr || !created?.user) {
    console.error("[FeedBot] createUser failed", cErr);
    throw new Error(`Failed to provision FeedBot: ${cErr?.message ?? "no user returned"}`);
  }
  const userId = created.user.id;
  const {
    error: pErr
  } = await supabaseAdmin.from("profiles").update({
    username: FEEDBOT_BOT_USERNAME,
    bio: FEEDBOT_BOT_BIO,
    is_bot: true,
    is_verified: true
  }).eq("id", userId);
  if (pErr) {
    console.error("[FeedBot] profile update failed", pErr);
    throw new Error(`FeedBot profile update failed: ${pErr.message}`);
  }
  const {
    error: sErr
  } = await supabaseAdmin.from("feedbot_settings").update({
    bot_user_id: userId
  }).eq("id", true);
  if (sErr) {
    console.error("[FeedBot] settings update failed", sErr);
    throw new Error(`FeedBot settings update failed: ${sErr.message}`);
  }
  return {
    ok: true,
    user_id: userId,
    existed: false
  };
});
const sendTestAnnouncement_createServerFn_handler = createServerRpc({
  id: "f8546d24a7bdf4f2f5cba6f8f1269ac5d94dc5c01bb4063045ab63b025633fc4",
  name: "sendTestAnnouncement",
  filename: "src/lib/feedbot.functions.ts"
}, (opts) => sendTestAnnouncement.__executeServer(opts));
const sendTestAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(sendTestAnnouncement_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: s
  } = await supabaseAdmin.from("feedbot_settings").select("bot_user_id, target_chatrooms").eq("id", true).maybeSingle();
  if (!s?.bot_user_id) throw new Error("Provision FeedBot first");
  const targets = s.target_chatrooms ?? [];
  if (targets.length === 0) throw new Error("Pick at least one target chatroom");
  const rows = targets.map((ch) => ({
    channel_id: ch,
    author_id: s.bot_user_id,
    text: "📢 FeedBot test — announcements are wired up correctly.\n🔗 /feed",
    kind: "text"
  }));
  const {
    error
  } = await supabaseAdmin.from("messages").insert(rows);
  if (error) throw new Error(error.message);
  return {
    ok: true,
    sent: rows.length
  };
});
const listChatroomsForFeedbot_createServerFn_handler = createServerRpc({
  id: "1dcb9ef304a2ceb611c94eb15fd3ebfd50586f5c95ef7f182e5020e66cc4e36c",
  name: "listChatroomsForFeedbot",
  filename: "src/lib/feedbot.functions.ts"
}, (opts) => listChatroomsForFeedbot.__executeServer(opts));
const listChatroomsForFeedbot = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(listChatroomsForFeedbot_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data
  } = await supabaseAdmin.from("chatrooms").select("id, name").order("name", {
    ascending: true
  });
  return data ?? [];
});
export {
  getFeedbotSettings_createServerFn_handler,
  listChatroomsForFeedbot_createServerFn_handler,
  provisionFeedbot_createServerFn_handler,
  saveFeedbotSettings_createServerFn_handler,
  sendTestAnnouncement_createServerFn_handler
};
