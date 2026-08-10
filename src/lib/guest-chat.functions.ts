/**
 * Ephemeral Lobby guest chat — server path.
 * Never creates auth.users / profiles / anonymous sessions.
 * Inserts only into guest_chat_* via service role.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "node:crypto";
import { withRateLimit } from "./rate-limit-middleware";
import { enforceRateLimit } from "./rate-limit.server";
import {
  GUEST_CHAT_SETTING_KEY,
  GUEST_LOBBY_CHANNEL_ID,
  formatGuestDisplayName,
  mergeGuestChatConfig,
  type GuestChatConfig,
} from "./guest-chat-config";
import {
  assertGuestLobbyPlainText,
  validateGuestNickname,
} from "./guest-nickname";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** New guest tables are migration-backed; cast until supabase gen types are refreshed. */
function guestDb(sb: Awaited<ReturnType<typeof admin>>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return sb as any;
}

async function loadGuestChatConfig(): Promise<GuestChatConfig> {
  const sb = await admin();
  const { data } = await sb
    .from("app_settings")
    .select("value")
    .eq("key", GUEST_CHAT_SETTING_KEY)
    .maybeSingle();
  return mergeGuestChatConfig(data?.value);
}

function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 32);
}

async function applyWordFiltersLite(text: string): Promise<{ ok: boolean; filtered: string; reason?: string }> {
  const sb = guestDb(await admin());
  const { data: words } = await sb
    .from("word_filters")
    .select("pattern,match_mode,actions")
    .eq("active", true)
    .limit(500);
  let out = text;
  for (const w of words ?? []) {
    const pattern = String(w.pattern ?? "");
    if (!pattern) continue;
    const actions = Array.isArray(w.actions) ? w.actions.map(String) : [];
    let matched = false;
    try {
      if (w.match_mode === "regex") {
        const re = new RegExp(pattern, "gi");
        if (re.test(out)) {
          matched = true;
          out = out.replace(new RegExp(pattern, "gi"), (m) => "*".repeat(Math.min(m.length, 12)));
        }
      } else {
        const idx = out.toLowerCase().indexOf(pattern.toLowerCase());
        if (idx >= 0) {
          matched = true;
          out = out.slice(0, idx) + "*".repeat(Math.min(pattern.length, 12)) + out.slice(idx + pattern.length);
        }
      }
    } catch { /* ignore bad patterns */ }
    if (matched && actions.includes("block")) {
      return { ok: false, filtered: out, reason: "Message blocked by moderation." };
    }
  }
  return { ok: true, filtered: out };
}

export const getGuestChatPublicConfig = createServerFn({ method: "GET" })
  .middleware([withRateLimit("api")])
  .handler(async () => {
    const cfg = await loadGuestChatConfig();
    return {
      enabled: cfg.enabled,
      namePrefix: cfg.namePrefix,
      nicknameMinLength: cfg.nicknameMinLength,
      nicknameMaxLength: cfg.nicknameMaxLength,
      messageCooldownSec: cfg.messageCooldownSec,
      maxMessageLength: cfg.maxMessageLength,
    };
  });

export const startGuestChatSession = createServerFn({ method: "POST" })
  .middleware([withRateLimit("guest_chat.session")])
  .inputValidator((raw) => z.object({ nickname: z.string().min(1).max(64) }).parse(raw))
  .handler(async ({ data }) => {
    const cfg = await loadGuestChatConfig();
    if (!cfg.enabled) throw new Error("Guest chat is currently disabled.");

    const nick = validateGuestNickname(data.nickname, {
      minLength: cfg.nicknameMinLength,
      maxLength: cfg.nicknameMaxLength,
    });
    if (!nick.ok) throw new Error(nick.reason);

    const visitorId = `visitor_${createHash("sha256")
      .update(`${Date.now()}:${Math.random()}:${nick.nickname}`)
      .digest("hex")
      .slice(0, 20)}`;
    const displayName = formatGuestDisplayName(cfg.namePrefix, nick.nickname);
    const expiresAt = new Date(Date.now() + cfg.sessionTtlHours * 3600_000).toISOString();

    const sb = guestDb(await admin());
    const { error } = await sb.from("guest_chat_sessions").insert({
      visitor_id: visitorId,
      nickname: nick.nickname,
      display_name: displayName,
      expires_at: expiresAt,
    } as never);
    if (error) throw new Error(error.message || "Could not start guest session.");

    return { visitorId, nickname: nick.nickname, displayName, expiresAt };
  });

export const sendGuestLobbyMessage = createServerFn({ method: "POST" })
  .middleware([withRateLimit("guest_chat.message")])
  .inputValidator((raw) =>
    z
      .object({
        visitorId: z.string().min(8).max(80),
        channelId: z.string().min(1).max(64),
        text: z.string().min(1).max(4000),
      })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    const cfg = await loadGuestChatConfig();
    const guard = assertGuestLobbyPlainText({
      enabled: cfg.enabled,
      channelId: data.channelId,
      text: data.text,
      maxLen: cfg.maxMessageLength,
    });
    if (!guard.ok) {
      throw new Error(guard.message);
    }

    if (!data.visitorId.startsWith("visitor_")) {
      throw new Error("Invalid guest session.");
    }

    const textRaw = data.text.trim();
    if (!textRaw) throw new Error("Message cannot be empty.");
    if (/\bhttps?:\/\//i.test(textRaw) || /\bwww\./i.test(textRaw)) {
      throw new Error("Links are not allowed for guests. Sign up to share links.");
    }

    const sb = guestDb(await admin());
    const { data: session, error: sErr } = await sb
      .from("guest_chat_sessions")
      .select("visitor_id, display_name, nickname, expires_at, last_message_at, last_message_hash")
      .eq("visitor_id", data.visitorId)
      .maybeSingle();
    if (sErr || !session) throw new Error("Guest session not found. Start guest chat again.");
    if (new Date(session.expires_at).getTime() <= Date.now()) {
      throw new Error("Guest session expired. Start guest chat again.");
    }

    // Extra keying by visitor id (cooldown + burst).
    await enforceRateLimit({
      action: "guest_chat.message",
      userId: data.visitorId,
      force: true,
      limit: Math.max(5, Math.floor(60 / Math.max(1, cfg.messageCooldownSec))),
      window: 60,
    });

    const lastAt = session.last_message_at ? new Date(session.last_message_at).getTime() : 0;
    const coolMs = cfg.messageCooldownSec * 1000;
    if (lastAt && Date.now() - lastAt < coolMs) {
      const wait = Math.ceil((coolMs - (Date.now() - lastAt)) / 1000);
      throw new Error(`Please wait ${wait}s before sending another message.`);
    }

    const filtered = await applyWordFiltersLite(textRaw);
    if (!filtered.ok) throw new Error(filtered.reason || "Message blocked.");
    const text = filtered.filtered.slice(0, cfg.maxMessageLength);
    const msgHash = hashText(text.toLowerCase());
    if (session.last_message_hash && session.last_message_hash === msgHash && lastAt && Date.now() - lastAt < 30_000) {
      throw new Error("Duplicate message blocked.");
    }

    const expiresAt = new Date(Date.now() + cfg.messageTtlMinutes * 60_000).toISOString();
    const { data: row, error: iErr } = await sb
      .from("guest_chat_messages")
      .insert({
        channel_id: GUEST_LOBBY_CHANNEL_ID,
        visitor_id: data.visitorId,
        display_name: session.display_name,
        text,
        expires_at: expiresAt,
      } as never)
      .select("id, channel_id, visitor_id, display_name, text, created_at, expires_at")
      .single();
    if (iErr || !row) throw new Error(iErr?.message || "Failed to send message.");

    await sb
      .from("guest_chat_sessions")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_hash: msgHash,
      } as never)
      .eq("visitor_id", data.visitorId);

    return {
      id: row.id as string,
      channelId: row.channel_id as string,
      visitorId: row.visitor_id as string,
      displayName: row.display_name as string,
      text: row.text as string,
      createdAt: row.created_at as string,
      expiresAt: row.expires_at as string,
    };
  });

export const listGuestLobbyMessages = createServerFn({ method: "GET" })
  .middleware([withRateLimit("api")])
  .inputValidator((raw) =>
    z
      .object({
        limit: z.number().int().min(1).max(100).optional(),
        after: z.string().datetime().optional(),
      })
      .optional()
      .parse(raw ?? {}),
  )
  .handler(async ({ data }) => {
    const limit = data?.limit ?? 80;
    const sb = guestDb(await admin());
    let q = sb
      .from("guest_chat_messages")
      .select("id, channel_id, visitor_id, display_name, text, created_at, expires_at")
      .eq("channel_id", GUEST_LOBBY_CHANNEL_ID)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);
    if (data?.after) q = q.gt("created_at", data.after);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).reverse().map((r: {
      id: string;
      channel_id: string;
      visitor_id: string;
      display_name: string;
      text: string;
      created_at: string;
      expires_at: string;
    }) => ({
      id: r.id,
      channelId: r.channel_id,
      visitorId: r.visitor_id,
      displayName: r.display_name,
      text: r.text,
      createdAt: r.created_at,
      expiresAt: r.expires_at,
    }));
  });

