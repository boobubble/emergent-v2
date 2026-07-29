import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { o as objectType, n as numberType, s as stringType, e as enumType, b as booleanType, r as recordType, u as unknownType, a as arrayType } from "../_libs/zod.mjs";
const listFeedback = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  category: stringType().optional(),
  status: stringType().optional(),
  sort: enumType(["trending", "recent", "top", "oldest"]).default("trending"),
  search: stringType().max(120).optional(),
  limit: numberType().min(1).max(100).default(50)
}).parse(d ?? {})).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(createSsrRpc("ac346e3fdc98c2ed525afe5716d25f739ade78bc45d84cd9812d5b48e95752a1"));
const getFeedback = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(createSsrRpc("dfda0607f9d90384071147bc1c5a452e3c58aeb07cc455aa9bcbcdb7f29c68a4"));
const createFeedback = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feedback.write")]).inputValidator((d) => objectType({
  title: stringType().trim().min(4).max(140),
  description: stringType().trim().max(8e3).default(""),
  category: enumType(["bug", "feature", "improvement", "ui", "performance", "security", "other"]),
  priority: enumType(["low", "normal", "high", "critical"]).default("normal"),
  screenshots: arrayType(stringType().url()).max(6).default([]),
  url: stringType().max(500).optional(),
  device_info: recordType(stringType(), unknownType()).optional(),
  is_anonymous: booleanType().default(false)
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(createSsrRpc("45898f8e6ba49b19d863918f48bd28ce8d8ce599287fffe0a8164cdf7fc18d2e"));
const findSimilarFeedback = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  title: stringType().trim().min(3).max(140)
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(createSsrRpc("34d1b688fa8558aa6a1a18978aa62b6072ba2ce338ff299c7aabc6f0e5a7789c"));
const toggleVote = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feedback.write")]).inputValidator((d) => objectType({
  reportId: stringType().uuid()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(createSsrRpc("6ff54c7caa85e6f146f3f94553c0c6b3f8f640b95221e45699725cd46c4be892"));
const postComment = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feedback.write")]).inputValidator((d) => objectType({
  reportId: stringType().uuid(),
  text: stringType().trim().min(1).max(2e3)
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(createSsrRpc("44c32a8b1943537839baa2869ca2c864987fdefc21b2936bc1050497c0a27492"));
const adminUpdateFeedback = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feedback.write")]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["open", "investigating", "planned", "in_progress", "fixed", "closed", "rejected"]).optional(),
  priority: enumType(["low", "normal", "high", "critical"]).optional(),
  is_pinned: booleanType().optional(),
  is_showcased: booleanType().optional(),
  admin_note: stringType().max(2e3).optional(),
  duplicate_of: stringType().uuid().nullable().optional(),
  reward: objectType({
    xp: numberType().int().min(0).max(1e3),
    coins: numberType().int().min(0).max(1e3)
  }).optional()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(createSsrRpc("d228d473d746d58980344d2c06733095057ceb8d313c3ac6debf60b3d60b6e08"));
const adminDeleteFeedback = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feedback.write")]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(createSsrRpc("6a350e82bd67cfa9dd726282bcbfeddfd043f26d0d6a6ea3d0a2918e864e0afc"));
const getFeedbackStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(createSsrRpc("2874299ef75a8bfb64c9ace9c18227532be73c9b0ce16562a54feefe559b4265"));
export {
  adminUpdateFeedback as a,
  adminDeleteFeedback as b,
  createFeedback as c,
  getFeedback as d,
  findSimilarFeedback as f,
  getFeedbackStats as g,
  listFeedback as l,
  postComment as p,
  toggleVote as t
};
