import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { o as objectType, e as enumType, a as arrayType, s as stringType, n as numberType, b as booleanType } from "../_libs/zod.mjs";
const listConfessions = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  category: stringType().optional(),
  sort: enumType(["recent", "trending", "most_liked", "most_replied"]).default("recent"),
  limit: numberType().min(1).max(100).default(30)
}).parse(d ?? {})).handler(createSsrRpc("9b16f2967a9e3636ee616b832ebf4b9e405e909762b48024978188d471f5890d"));
const createConfession = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feed.write")]).inputValidator((d) => objectType({
  kind: enumType(["text", "poll", "image", "question", "advice"]).default("text"),
  category: stringType().min(1).max(64),
  text: stringType().max(4e3).default(""),
  image_url: stringType().url().optional(),
  poll: objectType({
    question: stringType().min(1).max(280),
    options: arrayType(stringType().min(1).max(120)).min(2).max(6)
  }).optional(),
  display_mode: enumType(["fully_anonymous", "random_id", "random_avatar", "username"]),
  expiry: enumType(["never", "24h", "7d", "30d"]).optional()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("25ae481471fab660009f9bfa357669ffb3c4a02fee558a1133b23998161aa625"));
const toggleReaction = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feed.write")]).inputValidator((d) => objectType({
  confessionId: stringType().uuid(),
  type: enumType(["like", "funny", "shock", "sad", "hot", "love"])
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("c62be101f2c501c1850f4c6e574d06746d9220330c4324d9a4a18a0419bc82f8"));
const listReplies = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  confessionId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("a099a31c885e8a9c3223f7bf578ce1e58ab5a0c4e1e8dc2d9358ab9d23577733"));
const createReply = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feed.write")]).inputValidator((d) => objectType({
  confessionId: stringType().uuid(),
  text: stringType().min(1).max(1500),
  anonymous: booleanType().default(true)
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("582679095d46a977919eb7df9e730af4bdad17e1b8a081492d55da36deaab83d"));
const moderateConfession = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feed.write")]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  action: enumType(["approve", "reject", "pin", "unpin", "feature", "unfeature", "remove"])
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("a6c138be74badb14b5ed205af433e1608065ae9dbdf0ad3a081d755135ddc241"));
const getConfessionStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("51ba2c0a821cb44faf96458e84f29e156b21e2fb3e6a30aa91ff45caf9297400"));
export {
  listReplies as a,
  createReply as b,
  createConfession as c,
  getConfessionStats as g,
  listConfessions as l,
  moderateConfession as m,
  toggleReaction as t
};
