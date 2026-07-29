import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
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
const FpSchema = objectType({
  fingerprint: stringType().regex(/^[a-f0-9]{64}$/, "Invalid fingerprint")
});
const checkDeviceBan_createServerFn_handler = createServerRpc({
  id: "8a827e5716391d30b064ae17c999d22cf29bdbe0c437b36fab90afa6c8e51db2",
  name: "checkDeviceBan",
  filename: "src/lib/device.functions.ts"
}, (opts) => checkDeviceBan.__executeServer(opts));
const checkDeviceBan = createServerFn({
  method: "POST"
}).middleware([withRateLimit("auth.write")]).inputValidator((input) => FpSchema.parse(input)).handler(checkDeviceBan_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: setting
  } = await supabaseAdmin2.from("app_settings").select("value").eq("key", "device_security").maybeSingle();
  const enabled = setting?.value?.enabled ?? false;
  if (!enabled) return {
    banned: false,
    reason: null
  };
  const {
    data: row
  } = await supabaseAdmin2.from("banned_devices").select("reason").eq("fingerprint", data.fingerprint).maybeSingle();
  return {
    banned: !!row,
    reason: row?.reason ?? null
  };
});
const recordDevice_createServerFn_handler = createServerRpc({
  id: "7a711031e1e5afefdffd3a137f39b9950378b00615c6d03a5403f2f14a7d3fa9",
  name: "recordDevice",
  filename: "src/lib/device.functions.ts"
}, (opts) => recordDevice.__executeServer(opts));
const recordDevice = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("auth.write")]).inputValidator((input) => FpSchema.extend({
  user_agent: stringType().max(500).optional()
}).parse(input)).handler(recordDevice_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    error
  } = await supabaseAdmin2.from("user_devices").upsert({
    user_id: context.userId,
    fingerprint: data.fingerprint,
    user_agent: data.user_agent ?? null,
    last_seen: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "user_id,fingerprint"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  checkDeviceBan_createServerFn_handler,
  recordDevice_createServerFn_handler
};
