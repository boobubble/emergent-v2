import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { o as objectType, s as stringType, b as booleanType, n as numberType, a as arrayType, r as recordType } from "../_libs/zod.mjs";
const getFeedbotSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("dcc8507c92a23e8f3ec6ecae8baf6d72fd47142a008a0a143e5bf035f4785a68"));
const SaveInput = objectType({
  enabled: booleanType().optional(),
  event_flags: recordType(stringType(), booleanType()).optional(),
  target_chatrooms: arrayType(stringType().uuid()).optional(),
  min_interval_seconds: numberType().int().min(30).max(3600).optional(),
  digest_mode: booleanType().optional(),
  daily_summary_enabled: booleanType().optional(),
  daily_summary_time: stringType().regex(/^\d{2}:\d{2}$/).optional()
});
const saveFeedbotSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => SaveInput.parse(raw)).handler(createSsrRpc("c39bcfda5c631e26839affbb0da89c71120e0a0c82e77ecd380845338749f5af"));
const provisionFeedbot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("5797618f41bbb806cb39c3fff2767434cdf0517677db031e6c7c6c127616ffd2"));
const sendTestAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("f8546d24a7bdf4f2f5cba6f8f1269ac5d94dc5c01bb4063045ab63b025633fc4"));
const listChatroomsForFeedbot = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("1dcb9ef304a2ceb611c94eb15fd3ebfd50586f5c95ef7f182e5020e66cc4e36c"));
export {
  sendTestAnnouncement as a,
  getFeedbotSettings as g,
  listChatroomsForFeedbot as l,
  provisionFeedbot as p,
  saveFeedbotSettings as s
};
