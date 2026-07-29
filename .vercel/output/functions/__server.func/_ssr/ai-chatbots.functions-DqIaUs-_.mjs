import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, n as numberType, a as arrayType, s as stringType, b as booleanType } from "../_libs/zod.mjs";
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
async function getAdmin() {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin2;
}
async function assertMod(userId) {
  const supabaseAdmin2 = await getAdmin();
  const {
    data,
    error
  } = await supabaseAdmin2.from("user_roles").select("role").eq("user_id", userId).in("role", ["super_admin", "admin", "moderator"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: moderator only");
}
async function readAIChatConfig() {
  const supabaseAdmin2 = await getAdmin();
  const {
    data
  } = await supabaseAdmin2.from("app_settings").select("value").eq("key", "ai_chat").maybeSingle();
  const v = data?.value || {};
  return {
    enabled: v.enabled ?? false,
    openrouter_api_key: v.openrouter_api_key ?? "",
    model: v.model ?? "openrouter/auto"
  };
}
const listAIChatbots_createServerFn_handler = createServerRpc({
  id: "653a4c5f0c5db8d5619a2b5af6ec2b7e5c4542ab6a42b065dd280252d458b78a",
  name: "listAIChatbots",
  filename: "src/lib/ai-chatbots.functions.ts"
}, (opts) => listAIChatbots.__executeServer(opts));
const listAIChatbots = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).handler(listAIChatbots_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  const supabaseAdmin2 = await getAdmin();
  const {
    data: bots,
    error
  } = await supabaseAdmin2.from("ai_chatbots").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const ids = (bots ?? []).map((b) => b.user_id);
  let profileMap = {};
  if (ids.length) {
    const {
      data: profs
    } = await supabaseAdmin2.from("profiles").select("id,username,avatar_url").in("id", ids);
    for (const p of profs ?? []) profileMap[p.id] = {
      username: p.username,
      avatar_url: p.avatar_url
    };
  }
  return {
    bots: (bots ?? []).map((b) => ({
      ...b,
      profile: profileMap[b.user_id] || null
    }))
  };
});
const createAIChatbot_createServerFn_handler = createServerRpc({
  id: "7880567123f2732db9caff6503cc3b96b5dd9334adc6e8bd044879eb58fbbc7a",
  name: "createAIChatbot",
  filename: "src/lib/ai-chatbots.functions.ts"
}, (opts) => createAIChatbot.__executeServer(opts));
const createAIChatbot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).inputValidator((input) => objectType({
  username: stringType().min(1).max(64),
  description: stringType().max(500).default(""),
  persona: stringType().max(2e3).default(""),
  allowed_rooms: arrayType(stringType().max(80)).default([]),
  reply_chance: numberType().min(0).max(1).default(0.6),
  cooldown_sec: numberType().int().min(0).max(3600).default(20)
}).parse(input)).handler(createAIChatbot_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const supabaseAdmin2 = await getAdmin();
  const {
    data: prof,
    error: pErr
  } = await supabaseAdmin2.from("profiles").select("id").ilike("username", data.username).maybeSingle();
  if (pErr) throw new Error(pErr.message);
  if (!prof) throw new Error(`User "${data.username}" not found`);
  const {
    error
  } = await supabaseAdmin2.from("ai_chatbots").insert({
    user_id: prof.id,
    description: data.description,
    persona: data.persona || "You are a friendly community member. Keep replies short, casual, and human.",
    allowed_rooms: data.allowed_rooms,
    reply_chance: data.reply_chance,
    cooldown_sec: data.cooldown_sec,
    created_by: context.userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const updateAIChatbot_createServerFn_handler = createServerRpc({
  id: "fa58209555e8a113f3cdbc550b20ed6ff277139481359d1ca5ae826fcc3fb46e",
  name: "updateAIChatbot",
  filename: "src/lib/ai-chatbots.functions.ts"
}, (opts) => updateAIChatbot.__executeServer(opts));
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
}).parse(input)).handler(updateAIChatbot_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const supabaseAdmin2 = await getAdmin();
  const {
    error
  } = await supabaseAdmin2.from("ai_chatbots").update(data.patch).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteAIChatbot_createServerFn_handler = createServerRpc({
  id: "610c54897203a5ecad9a13be81d52da6834d0fdfe67705c2fb84ce724b9dc042",
  name: "deleteAIChatbot",
  filename: "src/lib/ai-chatbots.functions.ts"
}, (opts) => deleteAIChatbot.__executeServer(opts));
const deleteAIChatbot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(deleteAIChatbot_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const supabaseAdmin2 = await getAdmin();
  const {
    error
  } = await supabaseAdmin2.from("ai_chatbots").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const aiChatbotReply_createServerFn_handler = createServerRpc({
  id: "0eadbda825da8694f4e3dfe0fbd64804a4374283a893db86373ee05ec0037f7b",
  name: "aiChatbotReply",
  filename: "src/lib/ai-chatbots.functions.ts"
}, (opts) => aiChatbotReply.__executeServer(opts));
const aiChatbotReply = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).inputValidator((input) => objectType({
  channel_id: stringType().min(1).max(120),
  text: stringType().min(1).max(2e3)
}).parse(input)).handler(aiChatbotReply_createServerFn_handler, async ({
  data,
  context
}) => {
  const cfg = await readAIChatConfig();
  if (!cfg.enabled || !cfg.openrouter_api_key) return {
    skipped: "disabled"
  };
  const supabaseAdmin2 = await getAdmin();
  const {
    data: bots
  } = await supabaseAdmin2.from("ai_chatbots").select("*").eq("enabled", true).contains("allowed_rooms", [data.channel_id]);
  if (!bots || bots.length === 0) return {
    skipped: "no-bots"
  };
  const bot = bots.find((b) => b.user_id !== context.userId);
  if (!bot) return {
    skipped: "self"
  };
  if (bot.last_reply_at) {
    const since = Date.now() - new Date(bot.last_reply_at).getTime();
    if (since < bot.cooldown_sec * 1e3) return {
      skipped: "cooldown"
    };
  }
  if (Math.random() > Number(bot.reply_chance)) return {
    skipped: "chance"
  };
  const {
    data: recent
  } = await supabaseAdmin2.from("messages").select("author_id,text").eq("channel_id", data.channel_id).order("created_at", {
    ascending: false
  }).limit(8);
  const history = (recent ?? []).reverse().map((m) => ({
    role: m.author_id === bot.user_id ? "assistant" : "user",
    content: String(m.text ?? "").slice(0, 500)
  }));
  let reply = "";
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.openrouter_api_key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: cfg.model || "openrouter/auto",
        max_tokens: 200,
        messages: [{
          role: "system",
          content: bot.persona
        }, ...history, {
          role: "user",
          content: data.text.slice(0, 500)
        }]
      })
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("openrouter error", res.status, t);
      return {
        skipped: "provider-error",
        status: res.status
      };
    }
    const json = await res.json();
    reply = String(json?.choices?.[0]?.message?.content ?? "").trim();
  } catch (e) {
    console.error("openrouter call failed", e);
    return {
      skipped: "network-error"
    };
  }
  if (!reply) return {
    skipped: "empty"
  };
  const {
    error: insErr
  } = await supabaseAdmin2.from("messages").insert({
    channel_id: data.channel_id,
    author_id: bot.user_id,
    text: reply.slice(0, 1500),
    kind: "text"
  });
  if (insErr) {
    console.error("bot insert failed", insErr);
    return {
      skipped: "insert-error"
    };
  }
  await supabaseAdmin2.from("ai_chatbots").update({
    last_reply_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", bot.id);
  return {
    ok: true,
    bot_user_id: bot.user_id
  };
});
const getAIChatSettings_createServerFn_handler = createServerRpc({
  id: "9805db0ccea721709ce13adc83ac4b9c135fbb7b86945e1d8b2078ba406c63e2",
  name: "getAIChatSettings",
  filename: "src/lib/ai-chatbots.functions.ts"
}, (opts) => getAIChatSettings.__executeServer(opts));
const getAIChatSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).handler(getAIChatSettings_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  return readAIChatConfig();
});
const saveAIChatSettings_createServerFn_handler = createServerRpc({
  id: "a80078a637efef6af0a95783abd31cfa165dea2fdd5ef296899349311d6eb8e1",
  name: "saveAIChatSettings",
  filename: "src/lib/ai-chatbots.functions.ts"
}, (opts) => saveAIChatSettings.__executeServer(opts));
const saveAIChatSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).inputValidator((input) => objectType({
  enabled: booleanType(),
  openrouter_api_key: stringType().max(200),
  model: stringType().min(1).max(120)
}).parse(input)).handler(saveAIChatSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const supabaseAdmin2 = await getAdmin();
  const {
    error
  } = await supabaseAdmin2.from("app_settings").upsert({
    key: "ai_chat",
    value: data
  }, {
    onConflict: "key"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  aiChatbotReply_createServerFn_handler,
  createAIChatbot_createServerFn_handler,
  deleteAIChatbot_createServerFn_handler,
  getAIChatSettings_createServerFn_handler,
  listAIChatbots_createServerFn_handler,
  saveAIChatSettings_createServerFn_handler,
  updateAIChatbot_createServerFn_handler
};
