import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { o as objectType, s as stringType, n as numberType, e as enumType, b as booleanType } from "../_libs/zod.mjs";
const submitReport = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  target_type: enumType(["message", "post", "user", "room"]),
  target_id: stringType().min(1).max(200),
  reason: stringType().min(1).max(200),
  details: stringType().max(2e3).optional()
}).parse(input)).handler(createSsrRpc("5b14dfeb1053efc9ccdc068fe9c81e5cf6351da739757e32d1422b647be34d0c"));
const listReports = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  status: enumType(["open", "reviewing", "resolved", "dismissed", "all"]).default("open"),
  limit: numberType().min(1).max(100).default(50)
}).parse(input ?? {})).handler(createSsrRpc("13197cecf7a93908ab279f0a64c9024df2cd1af5fe5a7827673507625fbb883c"));
const resolveReport = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid(),
  status: enumType(["resolved", "dismissed", "reviewing"]),
  note: stringType().max(500).optional()
}).parse(input)).handler(createSsrRpc("904ae947fc68d271fe8c3d70c2743099c238527e72eb57451cbfaf1e6e611c32"));
const banUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  user_id: stringType().uuid().optional(),
  ip_address: stringType().max(64).optional(),
  ban_type: enumType(["ban", "temp_ban", "shadow_ban", "ip_ban"]).default("ban"),
  reason: stringType().max(300).optional(),
  expires_in_hours: numberType().int().min(1).max(24 * 365).optional()
}).refine((v) => v.user_id || v.ip_address, "Must supply user_id or ip_address").parse(input)).handler(createSsrRpc("93a20d854ff9e7a47db58302bdfd1300ffdf9d88403ebab9995ac470c8a7e476"));
const unbanUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  ban_id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("2b4779863a4b16dfd05bc47fd045e559154bdbbedf8df25564ab296754e409d6"));
const listBans = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(createSsrRpc("510834ed19314b8bfa5b45d32a37e7091c31e0efd9485dfdc6525e0d24ec063f"));
const muteUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  scope: enumType(["global", "room"]).default("global"),
  channel_id: stringType().max(120).optional(),
  reason: stringType().max(300).optional(),
  expires_in_minutes: numberType().int().min(1).max(60 * 24 * 30).optional()
}).parse(input)).handler(createSsrRpc("b23105094f3791c20564aafcb55d4513a9a511700ee837f54fae17db7ef7ee14"));
const unmuteUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  mute_id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("51fb597f248aae4730c787cf9a67a37a5a2d0fc39a4c5242e709a64f2900aa5d"));
const listMutes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(createSsrRpc("194adec9b1239c58814c040ae60f776ec88424888faf3253db2e5c694665a834"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  note: stringType().min(1).max(1e3)
}).parse(input)).handler(createSsrRpc("96273832da7bf56d368e64116c40c802d46e16c4d3a4bf119bfb6defef0f0d13"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  user_id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("ffa89cc04bcc37686599f76c58fe62a72a45ddeaf6d23801ed70af1573225f47"));
const listWordFilters = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(createSsrRpc("8d31ed5714910de22c3f88243b9f9f17091f46085c8efcebe8fe1c59387f2e81"));
const addWordFilter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  pattern: stringType().min(1).max(200),
  match_mode: enumType(["word", "substring", "regex"]).default("word"),
  action: enumType(["delete", "warn", "mute", "ban"]).default("delete"),
  severity: numberType().int().min(1).max(5).default(1)
}).parse(input)).handler(createSsrRpc("4975a3d209916640d3645d3c35bd29fadda4a76d15a7a5c5359a99dd359fa833"));
const toggleWordFilter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid(),
  active: booleanType()
}).parse(input)).handler(createSsrRpc("a9424254cfab74772210379a43d0fda4b470c0aeb3bc65d30b62ddbe96d9efec"));
const removeWordFilter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("e3035232fe8249b1549f38104875512e5a8f83800ae39aab13bf71b2c16891da"));
const listUrlRules = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(createSsrRpc("bceef2701b7def3d01429a3b8547ce1d33d49c4888f1c347b5f8c09707be600d"));
const listSafetyEvents = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  status: enumType(["pending", "approved", "kept_blocked", "false_positive", "escalated", "all"]).default("pending"),
  severity: numberType().int().min(1).max(3).optional(),
  limit: numberType().min(1).max(200).default(100)
}).parse(input ?? {})).handler(createSsrRpc("d5a2761f6587ce0e4e655590f92ab3275a0110ef756960039d01dd89c7dd961c"));
const getSafetyOverview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(createSsrRpc("ca2072252a78efb63f5598b294177f9ea35af0c1ffeffd291bbe5ae0a865057d"));
const resolveSafetyEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid(),
  status: enumType(["approved", "kept_blocked", "false_positive", "escalated"]),
  note: stringType().max(1e3).optional()
}).parse(input)).handler(createSsrRpc("a38c4eed08768910568de3a1fd04061f3cdad98653000cc7fe2d086a8dd8a6ef"));
const listSafetyKeywords = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(createSsrRpc("b77ac8f3e89f8a411abb2c4b3ee4b25e114db5d9641308ce7be61d7eace9a3c3"));
const addSafetyKeyword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  pattern: stringType().min(2).max(200),
  match_mode: enumType(["word", "substring", "regex"]).default("substring"),
  category: enumType(["violent_crime", "terrorism", "illegal_coordination", "threats", "dangerous_instructions", "self_harm"]),
  severity: numberType().int().min(1).max(3),
  notes: stringType().max(300).optional()
}).parse(input)).handler(createSsrRpc("099a6e1d76fdb6ee7128d8ca5d39c57c9d0ed2cc5a193a1a473ec14a429cb018"));
const toggleSafetyKeyword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid(),
  active: booleanType()
}).parse(input)).handler(createSsrRpc("9b778343bcc20eff8b6b715dcdbe1bd7cb89e6c9307beead47065c79d34373d1"));
const removeSafetyKeyword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("ee442200247ecaa0fe19333bddddcf6c3dcc584e9bbaa2372353caa75e8090c0"));
const addUrlRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  domain: stringType().min(1).max(253).regex(/^[a-z0-9.-]+$/i, "Invalid domain"),
  kind: enumType(["whitelist", "block"]),
  reason: stringType().max(300).optional()
}).parse(input)).handler(createSsrRpc("d38cd20832451dfce02f356b71412befb301614846107b83511c64ee08002b41"));
const removeUrlRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("6b5868a3bc308e0b920ebbcfa3b966ad4ab93f6d91e9d28434a6a00ebc071859"));
const listModLogs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  limit: numberType().min(1).max(200).default(100),
  offset: numberType().min(0).default(0)
}).parse(input ?? {})).handler(createSsrRpc("938f7aa1c066589f34b105f1e75788fdeb08007a255a0f9c5713a8f5d80ea87d"));
const deleteMessageMod = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  message_id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("b0c0148f8022a9c6676468e9db620f0e1bb1181ec0666b5a027a4b6c007c4829"));
const clearChannelMessages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  channel_id: stringType().min(1).max(120)
}).parse(input)).handler(createSsrRpc("51b83da4c18eba0eb6bb2cc8f2d23de7e686cc72f1b7c10d9c40e11f926fd7dd"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(createSsrRpc("00c6d5fd79c075b80da9b03a9de5dd016390bd03a489a440da08a0b0cfc1de84"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  channel_id: stringType().min(1).max(120),
  user_id: stringType().uuid(),
  can_mute: booleanType().default(true),
  can_kick: booleanType().default(true),
  can_pin: booleanType().default(true),
  can_delete: booleanType().default(true)
}).parse(input)).handler(createSsrRpc("4468701995c07827fac4521df332860cd5bfad46a34a04a1134b6458a97d7c5e"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("3e79ec63853e941008ccc2363b06742a92dad5343b069d136f8a97b5b678da69"));
const getModerationOverview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(createSsrRpc("eaa3c7c28ecf16a343af3795ace756c843f2b7ee6ddd16a002bc92d58a88865b"));
export {
  submitReport as A,
  listBans as a,
  banUser as b,
  clearChannelMessages as c,
  deleteMessageMod as d,
  listMutes as e,
  unmuteUser as f,
  getModerationOverview as g,
  listWordFilters as h,
  addWordFilter as i,
  removeWordFilter as j,
  listUrlRules as k,
  listReports as l,
  muteUser as m,
  addUrlRule as n,
  removeUrlRule as o,
  listModLogs as p,
  listSafetyEvents as q,
  resolveReport as r,
  getSafetyOverview as s,
  toggleWordFilter as t,
  unbanUser as u,
  resolveSafetyEvent as v,
  listSafetyKeywords as w,
  addSafetyKeyword as x,
  toggleSafetyKeyword as y,
  removeSafetyKeyword as z
};
