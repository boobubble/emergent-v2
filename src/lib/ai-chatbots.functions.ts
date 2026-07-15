import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { withRateLimit } from "./rate-limit-middleware";

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertMod(userId: string) {
  const supabaseAdmin = await getAdmin();
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin", "moderator"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: moderator only");
}

interface AIChatConfig {
  enabled: boolean;
  openrouter_api_key: string;
  model: string;
}

async function readAIChatConfig(): Promise<AIChatConfig> {
  const supabaseAdmin = await getAdmin();
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "ai_chat")
    .maybeSingle();
  const v = (data?.value as Partial<AIChatConfig> | null) || {};
  return {
    enabled: v.enabled ?? false,
    openrouter_api_key: v.openrouter_api_key ?? "",
    model: v.model ?? "openrouter/auto",
  };
}

// ---- Admin: list, create, update, delete ----

export const listAIChatbots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .handler(async ({ context }) => {
    await assertMod(context.userId);
    const supabaseAdmin = await getAdmin();
    const { data: bots, error } = await supabaseAdmin
      .from("ai_chatbots")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (bots ?? []).map((b) => b.user_id);
    let profileMap: Record<string, { username: string; avatar_url: string | null }> = {};
    if (ids.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id,username,avatar_url")
        .in("id", ids);
      for (const p of profs ?? []) profileMap[p.id] = { username: p.username, avatar_url: p.avatar_url };
    }
    return { bots: (bots ?? []).map((b) => ({ ...b, profile: profileMap[b.user_id] || null })) };
  });

export const createAIChatbot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .inputValidator((input) =>
    z.object({
      username: z.string().min(1).max(64),
      description: z.string().max(500).default(""),
      persona: z.string().max(2000).default(""),
      allowed_rooms: z.array(z.string().max(80)).default([]),
      reply_chance: z.number().min(0).max(1).default(0.6),
      cooldown_sec: z.number().int().min(0).max(3600).default(20),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const supabaseAdmin = await getAdmin();
    const { data: prof, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", data.username)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!prof) throw new Error(`User "${data.username}" not found`);
    const { error } = await supabaseAdmin.from("ai_chatbots").insert({
      user_id: prof.id,
      description: data.description,
      persona: data.persona || "You are a friendly community member. Keep replies short, casual, and human.",
      allowed_rooms: data.allowed_rooms,
      reply_chance: data.reply_chance,
      cooldown_sec: data.cooldown_sec,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateAIChatbot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      patch: z.object({
        description: z.string().max(500).optional(),
        persona: z.string().max(2000).optional(),
        allowed_rooms: z.array(z.string().max(80)).optional(),
        enabled: z.boolean().optional(),
        reply_chance: z.number().min(0).max(1).optional(),
        cooldown_sec: z.number().int().min(0).max(3600).optional(),
      }),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const supabaseAdmin = await getAdmin();
    const { error } = await supabaseAdmin.from("ai_chatbots").update(data.patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAIChatbot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const supabaseAdmin = await getAdmin();
    const { error } = await supabaseAdmin.from("ai_chatbots").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Runtime: generate a bot reply for an incoming message ----

export const aiChatbotReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .inputValidator((input) =>
    z.object({
      channel_id: z.string().min(1).max(120),
      text: z.string().min(1).max(2000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const cfg = await readAIChatConfig();
    if (!cfg.enabled || !cfg.openrouter_api_key) return { skipped: "disabled" };
    const supabaseAdmin = await getAdmin();
    // Find candidate bots assigned to this room
    const { data: bots } = await supabaseAdmin
      .from("ai_chatbots")
      .select("*")
      .eq("enabled", true)
      .contains("allowed_rooms", [data.channel_id]);
    if (!bots || bots.length === 0) return { skipped: "no-bots" };
    // Don't reply to a bot's own message
    const bot = bots.find((b) => b.user_id !== context.userId);
    if (!bot) return { skipped: "self" };
    // Cooldown
    if (bot.last_reply_at) {
      const since = Date.now() - new Date(bot.last_reply_at).getTime();
      if (since < bot.cooldown_sec * 1000) return { skipped: "cooldown" };
    }
    if (Math.random() > Number(bot.reply_chance)) return { skipped: "chance" };

    // Pull recent context (last 8 messages in room)
    const { data: recent } = await supabaseAdmin
      .from("messages")
      .select("author_id,text")
      .eq("channel_id", data.channel_id)
      .order("created_at", { ascending: false })
      .limit(8);
    const history = (recent ?? []).reverse().map((m) => ({
      role: m.author_id === bot.user_id ? "assistant" : "user",
      content: String(m.text ?? "").slice(0, 500),
    }));

    let reply = "";
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.openrouter_api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: cfg.model || "openrouter/auto",
          max_tokens: 200,
          messages: [
            { role: "system", content: bot.persona },
            ...history,
            { role: "user", content: data.text.slice(0, 500) },
          ],
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        console.error("openrouter error", res.status, t);
        return { skipped: "provider-error", status: res.status };
      }
      const json: any = await res.json();
      reply = String(json?.choices?.[0]?.message?.content ?? "").trim();
    } catch (e) {
      console.error("openrouter call failed", e);
      return { skipped: "network-error" };
    }
    if (!reply) return { skipped: "empty" };

    // Insert message as the bot
    const { error: insErr } = await supabaseAdmin.from("messages").insert({
      channel_id: data.channel_id,
      author_id: bot.user_id,
      text: reply.slice(0, 1500),
      kind: "text",
    });
    if (insErr) {
      console.error("bot insert failed", insErr);
      return { skipped: "insert-error" };
    }
    await supabaseAdmin
      .from("ai_chatbots")
      .update({ last_reply_at: new Date().toISOString() })
      .eq("id", bot.id);
    return { ok: true, bot_user_id: bot.user_id };
  });

// ---- Settings ----

export const getAIChatSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .handler(async ({ context }) => {
    await assertMod(context.userId);
    return readAIChatConfig();
  });

export const saveAIChatSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .inputValidator((input) =>
    z.object({
      enabled: z.boolean(),
      openrouter_api_key: z.string().max(200),
      model: z.string().min(1).max(120),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const supabaseAdmin = await getAdmin();
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: "ai_chat", value: data }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
