import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, n as numberType, a as arrayType, b as booleanType } from "../_libs/zod.mjs";
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
const listAIChatbots = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).handler(createSsrRpc("653a4c5f0c5db8d5619a2b5af6ec2b7e5c4542ab6a42b065dd280252d458b78a"));
const createAIChatbot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).inputValidator((input) => objectType({
  username: stringType().min(1).max(64),
  description: stringType().max(500).default(""),
  persona: stringType().max(2e3).default(""),
  allowed_rooms: arrayType(stringType().max(80)).default([]),
  reply_chance: numberType().min(0).max(1).default(0.6),
  cooldown_sec: numberType().int().min(0).max(3600).default(20)
}).parse(input)).handler(createSsrRpc("7880567123f2732db9caff6503cc3b96b5dd9334adc6e8bd044879eb58fbbc7a"));
const updateAIChatbot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).inputValidator((input) => objectType({
  id: stringType().uuid(),
  patch: objectType({
    description: stringType().max(500).optional(),
    persona: stringType().max(2e3).optional(),
    allowed_rooms: arrayType(stringType().max(80)).optional(),
    enabled: booleanType().optional(),
    reply_chance: numberType().min(0).max(1).optional(),
    cooldown_sec: numberType().int().min(0).max(3600).optional()
  })
}).parse(input)).handler(createSsrRpc("fa58209555e8a113f3cdbc550b20ed6ff277139481359d1ca5ae826fcc3fb46e"));
const deleteAIChatbot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("610c54897203a5ecad9a13be81d52da6834d0fdfe67705c2fb84ce724b9dc042"));
const aiChatbotReply = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).inputValidator((input) => objectType({
  channel_id: stringType().min(1).max(120),
  text: stringType().min(1).max(2e3)
}).parse(input)).handler(createSsrRpc("0eadbda825da8694f4e3dfe0fbd64804a4374283a893db86373ee05ec0037f7b"));
const getAIChatSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).handler(createSsrRpc("9805db0ccea721709ce13adc83ac4b9c135fbb7b86945e1d8b2078ba406c63e2"));
const saveAIChatSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).inputValidator((input) => objectType({
  enabled: booleanType(),
  openrouter_api_key: stringType().max(200),
  model: stringType().min(1).max(120)
}).parse(input)).handler(createSsrRpc("a80078a637efef6af0a95783abd31cfa165dea2fdd5ef296899349311d6eb8e1"));
export {
  aiChatbotReply,
  createAIChatbot,
  deleteAIChatbot,
  getAIChatSettings,
  listAIChatbots,
  saveAIChatSettings,
  updateAIChatbot
};
