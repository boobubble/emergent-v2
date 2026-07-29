import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { C as COMPETITION_CATEGORY_KEYS } from "./feedbot-format-CFiGnWo6.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, a as arrayType, s as stringType, r as recordType, b as booleanType, e as enumType } from "../_libs/zod.mjs";
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
const BOT_USERNAME = "CompetitionsBot";
const BOT_BIO = "Live updates on competitions, winners, milestones, and leader changes across the platform.";
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
const getCompetitionsFeedSettings_createServerFn_handler = createServerRpc({
  id: "88342257376f0bad971fe12066a808e5d14c179f6f2f2f69540825670df10aa7",
  name: "getCompetitionsFeedSettings",
  filename: "src/lib/competitions-feedbot.functions.ts"
}, (opts) => getCompetitionsFeedSettings.__executeServer(opts));
const getCompetitionsFeedSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).handler(getCompetitionsFeedSettings_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data
  } = await supabaseAdmin.from("feedbot_settings").select("enabled, competitions_bot_user_id, event_flags, target_chatrooms").eq("id", true).maybeSingle();
  const flags = data?.event_flags ?? {};
  const filtered = {};
  for (const k of COMPETITION_CATEGORY_KEYS) filtered[k] = flags[k] ?? false;
  return {
    enabled: !!data?.enabled,
    competitions_bot_user_id: data?.competitions_bot_user_id ?? null,
    event_flags: filtered,
    target_chatrooms: data?.target_chatrooms ?? []
  };
});
const SaveInput = objectType({
  event_flags: recordType(stringType(), booleanType()).optional(),
  target_chatrooms: arrayType(stringType().uuid()).optional()
});
const saveCompetitionsFeedSettings_createServerFn_handler = createServerRpc({
  id: "fb70aaa06794d903b902289664b0c93252ce39afe7c9a51dcab43ab503f05c71",
  name: "saveCompetitionsFeedSettings",
  filename: "src/lib/competitions-feedbot.functions.ts"
}, (opts) => saveCompetitionsFeedSettings.__executeServer(opts));
const saveCompetitionsFeedSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((raw) => SaveInput.parse(raw)).handler(saveCompetitionsFeedSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  if (data.event_flags) {
    const {
      data: cur
    } = await supabaseAdmin.from("feedbot_settings").select("event_flags").eq("id", true).maybeSingle();
    const merged = {
      ...cur?.event_flags ?? {}
    };
    for (const k of COMPETITION_CATEGORY_KEYS) {
      if (k in data.event_flags) merged[k] = !!data.event_flags[k];
    }
    const {
      error
    } = await supabaseAdmin.from("feedbot_settings").update({
      event_flags: merged
    }).eq("id", true);
    if (error) throw new Error(error.message);
  }
  if (data.target_chatrooms) {
    const {
      error
    } = await supabaseAdmin.from("feedbot_settings").update({
      target_chatrooms: data.target_chatrooms
    }).eq("id", true);
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const provisionCompetitionsBot_createServerFn_handler = createServerRpc({
  id: "57154cc66bcfa087fa788685c54618bcd30d08ff18960b011d44011e5b02a0fe",
  name: "provisionCompetitionsBot",
  filename: "src/lib/competitions-feedbot.functions.ts"
}, (opts) => provisionCompetitionsBot.__executeServer(opts));
const provisionCompetitionsBot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).handler(provisionCompetitionsBot_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: settings
  } = await supabaseAdmin.from("feedbot_settings").select("competitions_bot_user_id").eq("id", true).maybeSingle();
  if (settings?.competitions_bot_user_id) {
    await supabaseAdmin.from("profiles").update({
      is_bot: true,
      is_verified: true,
      username: BOT_USERNAME,
      bio: BOT_BIO
    }).eq("id", settings.competitions_bot_user_id);
    return {
      ok: true,
      user_id: settings.competitions_bot_user_id,
      existed: true
    };
  }
  const email = `competitionsbot+${Date.now()}@boobubble.app`;
  const password = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const {
    data: created,
    error: cErr
  } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username: BOT_USERNAME,
      gender: "other"
    }
  });
  if (cErr || !created?.user) {
    throw new Error(`Failed to provision CompetitionsBot: ${cErr?.message ?? "no user"}`);
  }
  const userId = created.user.id;
  const {
    error: pErr
  } = await supabaseAdmin.from("profiles").update({
    username: BOT_USERNAME,
    bio: BOT_BIO,
    is_bot: true,
    is_verified: true
  }).eq("id", userId);
  if (pErr) throw new Error(pErr.message);
  const {
    error: sErr
  } = await supabaseAdmin.from("feedbot_settings").update({
    competitions_bot_user_id: userId
  }).eq("id", true);
  if (sErr) throw new Error(sErr.message);
  return {
    ok: true,
    user_id: userId,
    existed: false
  };
});
const AnnounceInput = objectType({
  competitionId: stringType().uuid(),
  kind: enumType(["competition_trending", "competition_ending"])
});
const announceCompetitionEvent_createServerFn_handler = createServerRpc({
  id: "70140443c168486d477f4b90140fe743a1e1a220ff5235928d72bcd874e1ef89",
  name: "announceCompetitionEvent",
  filename: "src/lib/competitions-feedbot.functions.ts"
}, (opts) => announceCompetitionEvent.__executeServer(opts));
const announceCompetitionEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((raw) => AnnounceInput.parse(raw)).handler(announceCompetitionEvent_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: comp
  } = await supabaseAdmin.from("competitions").select("id, name, slug, banner_url, end_at").eq("id", data.competitionId).maybeSingle();
  if (!comp) throw new Error("Competition not found");
  const {
    data: settings
  } = await supabaseAdmin.from("feedbot_settings").select("competitions_bot_user_id").eq("id", true).maybeSingle();
  const bucket = Math.floor(Date.now() / (1e3 * 60 * 60));
  const dedupe = `${data.kind}:${comp.id}:${bucket}`;
  const payload = {
    name: comp.name,
    slug: comp.slug,
    end_at: comp.end_at
  };
  const target = `/competitions/${comp.slug ?? comp.id}`;
  const {
    error
  } = await supabaseAdmin.rpc("feedbot_enqueue_persona", {
    _kind: data.kind,
    _category: data.kind,
    _actor: null,
    _payload: payload,
    _target_url: target,
    _image_url: comp.banner_url ?? null,
    _dedupe: dedupe,
    _persona: settings?.competitions_bot_user_id ?? null
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  announceCompetitionEvent_createServerFn_handler,
  getCompetitionsFeedSettings_createServerFn_handler,
  provisionCompetitionsBot_createServerFn_handler,
  saveCompetitionsFeedSettings_createServerFn_handler
};
