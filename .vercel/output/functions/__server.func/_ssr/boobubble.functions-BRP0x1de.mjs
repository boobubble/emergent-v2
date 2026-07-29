import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, e as enumType, b as booleanType, n as numberType } from "../_libs/zod.mjs";
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
const getBoobubblePublic = createServerFn({
  method: "GET"
}).handler(createSsrRpc("ebc0c19a69a4ea65b0f1e5201aa9e1664821939a62b6bf6715875cc218b17741"));
const getBoobubbleSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("4d00521a17b79627ac626c7a1e68134eb08a7cb180640fcd962c277cc3582348"));
const saveBoobubbleSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).inputValidator((input) => objectType({
  enabled: booleanType(),
  welcome_enabled: booleanType(),
  feed_recs_enabled: booleanType(),
  ai_personalize_welcome: booleanType(),
  mission_daily_dm_enabled: booleanType(),
  mission_weekly_dm_enabled: booleanType(),
  mission_min_completion_pct: numberType().int().min(0).max(100),
  mission_weekly_day: numberType().int().min(0).max(6),
  reward_daily_dm_enabled: booleanType(),
  reward_min_coins_threshold: numberType().int().min(0).max(1e4),
  friend_suggestions_enabled: booleanType(),
  event_announcement: objectType({
    id: stringType().min(1).max(64),
    title: stringType().min(1).max(120),
    body: stringType().min(1).max(600),
    cta_label: stringType().max(40).nullable(),
    cta_url: stringType().url().nullable(),
    active: booleanType()
  }).nullable(),
  security_dm_enabled: booleanType(),
  share_earn_enabled: booleanType(),
  share_reward_coins: numberType().int().min(0).max(100),
  share_daily_limit: numberType().int().min(0).max(100),
  bot_username: stringType().trim().min(2).max(64).regex(/^[A-Za-z0-9_.\- ]+$/, "Only letters, numbers, spaces, underscore, hyphen and dot are allowed"),
  bot_avatar_url: stringType().url().nullable(),
  bot_bio: stringType().max(280),
  lobby_ai_enabled: booleanType(),
  lobby_ai_provider: enumType(["openai", "gemini"]),
  openai_model: stringType().trim().min(2).max(64),
  gemini_model: stringType().trim().min(2).max(64),
  openai_system_prompt: stringType().min(10).max(2e3)
}).parse(input)).handler(createSsrRpc("52dced78dfda3687039a7a67059d8492c96278c20901c695ea7630fdb1e238d1"));
const provisionBoobubbleAssistant = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("6bff185c07d1822cd0b7588ba055f64c47dfc7406ad15c2e7ee45193880ebd69"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("42bc65e16f87b6b1559dfb166e61d447bf7f751bc4b9ceae266493f091c9d61a"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).inputValidator((input) => objectType({
  muted: booleanType().optional(),
  disable_promo: booleanType().optional()
}).parse(input)).handler(createSsrRpc("b685c3810cc3f2ab1046d8af50f73318ac21681ad8af3126202c800b1775835e"));
const triggerWelcomeIfNeeded = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("02a5e2ffe0108c176ade114d14ad9ce21b7c1a3e7ad7156855e6620f49ba8305"));
const getAssistantFeedRecommendations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("25d757a6d4ba67d150c6757ae52977156aeaf15537bdfb6985d14a13786e98c0"));
const triggerMissionDigestIfNeeded = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("72f28a85d969eff9cf85ecd27bdf0f4eaedb80a95591e8958a59ddc4651ddf7a"));
const triggerRewardDigestIfNeeded = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("02e54c13b87079a9f9f580cd64693c5fb5da801d979c5d0b941962400a36d2d7"));
const getFriendSuggestions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("54ce46c1489ff4f1f03823e6bc62f13416ab59634809dde6d1b070579652914d"));
const triggerEventAnnouncementIfNeeded = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("243e30d9acf06b2aa72991b2691dc09522812a38481912429ed0a0fa84da8350"));
const triggerSecurityDigestIfNeeded = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("fe5406d93004a6a746f7847f23814f7b0a968dab8ac795a53300cb1842610b0c"));
const claimShareReward = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).inputValidator((i) => objectType({
  postId: stringType().uuid(),
  target: enumType(["whatsapp", "telegram", "facebook", "x", "linkedin", "copy", "native"])
}).parse(i)).handler(createSsrRpc("471e13b85d25e97df1d81149dce7b48708b1f770dcfa276334130900dd15edac"));
const getBoobubbleOpenAIKeyStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("769a7707d9304999c1f74ee8b0eca9deaf9a86e2ee6fc763dbdb9f91e748e738"));
const getBoobubbleGeminiKeyStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createSsrRpc("4c79ca38920952864c7ab8709f250fd153eb0590e384e65be37b29b051448e8e"));
const setBoobubbleOpenAIKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).inputValidator((input) => objectType({
  key: stringType().trim().max(256)
}).parse(input)).handler(createSsrRpc("9dc8112fd395c89bdb8492d2ca51f1ba8a907f53c11990e91c207faecf5a2118"));
const setBoobubbleGeminiKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).inputValidator((input) => objectType({
  key: stringType().trim().max(256)
}).parse(input)).handler(createSsrRpc("8e7a345021f10b7be90483b2f727ebbff5ff9a697af55d094e235b0d998587db"));
const askBoobubbleInLobby = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).inputValidator((input) => objectType({
  channel_id: stringType().min(1).max(128),
  text: stringType().min(1).max(800)
}).parse(input)).handler(createSsrRpc("8e508a8bd79feffb9d653f1f64ff51dd3dfd2970db0256aedd4a5e1b753f6f1a"));
export {
  askBoobubbleInLobby,
  claimShareReward,
  getAssistantFeedRecommendations,
  getBoobubbleGeminiKeyStatus,
  getBoobubbleOpenAIKeyStatus,
  getBoobubblePublic,
  getBoobubbleSettings,
  getFriendSuggestions,
  provisionBoobubbleAssistant,
  saveBoobubbleSettings,
  setBoobubbleGeminiKey,
  setBoobubbleOpenAIKey,
  triggerEventAnnouncementIfNeeded,
  triggerMissionDigestIfNeeded,
  triggerRewardDigestIfNeeded,
  triggerSecurityDigestIfNeeded,
  triggerWelcomeIfNeeded
};
