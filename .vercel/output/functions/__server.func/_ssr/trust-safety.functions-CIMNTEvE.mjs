import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { o as objectType, b as booleanType, s as stringType, e as enumType, r as recordType, u as unknownType, n as numberType, a as arrayType } from "../_libs/zod.mjs";
const getTrustSafetySettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("dcfe95d5642057086e7defe9c72f01c79874bfd7eac671fe271cb638aa9944e7"));
const updateTrustSafetySettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => recordType(stringType(), unknownType()).parse(raw)).handler(createSsrRpc("ffd1d9233c0342d8409209770bb0e028c6996c1eb0b5db279e24fd7d6bafe9ff"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  feature: stringType()
}).parse(raw)).handler(createSsrRpc("46298a3a25c95614271c316d9e0a95c3dd68eb524b7dc8a9e37b88528a0a0f79"));
const PrivacyChoice = enumType(["everyone", "friends", "nobody"]);
const getDmPrivacy = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4c0f56ec7dcc5b4ee864bd2010313506436bdea331f687ba0df0ff4527abee53"));
const setDmPrivacy = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  who_can_dm: PrivacyChoice,
  allow_message_requests: booleanType().optional()
}).parse(raw)).handler(createSsrRpc("25132afc39272be46847a4ce6a7194375f46653e27f207c3c199a86bf2e5cc0a"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  receiver_id: stringType().uuid()
}).parse(raw)).handler(createSsrRpc("ae8d5b32296eacdb3375f6d817cf7d2fb2c8fe376dec13b4c37571fa66072c81"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("dm.request")]).inputValidator((raw) => objectType({
  receiver_id: stringType().uuid(),
  preview: stringType().max(240).optional()
}).parse(raw)).handler(createSsrRpc("6fc0b9c4cc404aac0bdfc750777a59db02ee5c26533b6d8a7055ddcec86da401"));
const listMessageRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("cfd2382269f5a0c8188d9f826e3ead33576028dc037baa0b3c8b254adf1c1793"));
const respondMessageRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  id: stringType().uuid(),
  action: enumType(["accept", "decline", "block"])
}).parse(raw)).handler(createSsrRpc("eb61c5a988519683da5756945958912d2ab48fa4ff74f89b6e3e63b791fb9af0"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  text: stringType(),
  record_violation: booleanType().default(true)
}).parse(raw)).handler(createSsrRpc("f9444fedbacadb230b1c7b55a7d929a59e752dabcaaa54fc8cd79a85e5ab78f0"));
const getUrlAllowList = createServerFn({
  method: "GET"
}).handler(createSsrRpc("37741fb0e302bba0c06f00f3358485eed1fe90609ba07ee894a2194f03384c43"));
const listTrustViolations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid().optional(),
  limit: numberType().int().min(1).max(500).default(200)
}).parse(raw)).handler(createSsrRpc("23fe41484f3e726a80aa10cc5204248d4194d760b8d8bb5941fd8195cd457c20"));
const getTrustScore = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid().optional()
}).parse(raw)).handler(createSsrRpc("954097dd4dfa17d1a22fd4acd31bef8fb5ed57dc8db051085088cb9b9923a307"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid(),
  type: stringType().min(1).max(60),
  points: numberType().int().min(0).max(1e3),
  reason: stringType().max(500).optional(),
  ref_type: stringType().max(60).optional(),
  ref_id: stringType().max(120).optional()
}).parse(raw)).handler(createSsrRpc("00aeffd9dcff5c4fcfdcb8940fe361c1b54780fce04014b8ddf8aad9052a708f"));
const listWordFiltersExtended = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("a22fabf6ab541401a325bd637c1164fbbbbf1b4265187b4d14f9def1f7a7fd68"));
const upsertWordFilter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  id: stringType().uuid().optional(),
  pattern: stringType().min(1).max(200),
  match_mode: enumType(["word", "substring", "regex"]).default("word"),
  category: stringType().min(1).max(40).default("general"),
  actions: arrayType(stringType()).default(["replace"]),
  violation_points: numberType().int().min(0).max(100).default(1),
  active: booleanType().default(true)
}).parse(raw)).handler(createSsrRpc("7b423bd80c0b742fc56925676066fd259862fa97e63a0c83b2f77405680cf18e"));
const deleteWordFilter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  id: stringType().uuid()
}).parse(raw)).handler(createSsrRpc("1e3f3126c8e7604497c697466680165846d4ecfd7babeebd103c7d61b24c3873"));
export {
  upsertWordFilter as a,
  listTrustViolations as b,
  getTrustSafetySettings as c,
  deleteWordFilter as d,
  getDmPrivacy as e,
  getTrustScore as f,
  getUrlAllowList as g,
  listMessageRequests as h,
  listWordFiltersExtended as l,
  respondMessageRequest as r,
  setDmPrivacy as s,
  updateTrustSafetySettings as u
};
