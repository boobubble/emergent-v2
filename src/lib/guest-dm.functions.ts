/**
 * Guest → registered-user PM — server path.
 * Validates guest_chat_sessions; writes via service role only.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "node:crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";
import { enforceRateLimit } from "./rate-limit.server";
import {
  GUEST_DM_SETTING_KEY,
  mergeGuestDmConfig,
  type GuestDmConfig,
} from "./guest-dm-config";
import { guestDmPeerId } from "./guest-dm-utils";
import { isUuid } from "./dm-utils";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function guestDb(sb: Awaited<ReturnType<typeof admin>>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return sb as any;
}

async function loadGuestDmConfig(): Promise<GuestDmConfig> {
  const sb = await admin();
  const { data } = await sb
    .from("app_settings")
    .select("value")
    .eq("key", GUEST_DM_SETTING_KEY)
    .maybeSingle();
  return mergeGuestDmConfig(data?.value);
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

type GuestSessionRow = {
  visitor_id: string;
  display_name: string;
  nickname: string;
  expires_at: string;
  last_message_at: string | null;
  last_message_hash: string | null;
};

async function assertActiveGuestSession(visitorId: string): Promise<GuestSessionRow> {
  if (!visitorId.startsWith("visitor_")) throw new Error("Invalid guest session.");
  const sb = guestDb(await admin());
  const { data: session, error } = await sb
    .from("guest_chat_sessions")
    .select("visitor_id, display_name, nickname, expires_at, last_message_at, last_message_hash")
    .eq("visitor_id", visitorId)
    .maybeSingle();
  if (error || !session) throw new Error("Guest session not found. Start guest chat again.");
  if (new Date(session.expires_at).getTime() <= Date.now()) {
    throw new Error("Guest session expired. Start guest chat again.");
  }
  return session as GuestSessionRow;
}

async function validateGuestMessageText(
  cfg: GuestDmConfig,
  textRaw: string,
  session: GuestSessionRow,
): Promise<string> {
  const text = textRaw.trim();
  if (!text) throw new Error("Message cannot be empty.");
  if (text.length > cfg.maxMessageLength) {
    throw new Error(`Message too long (max ${cfg.maxMessageLength} characters).`);
  }
  if (/\bhttps?:\/\//i.test(text) || /\bwww\./i.test(text)) {
    throw new Error("Links are not allowed for guests. Sign up to share links.");
  }

  await enforceRateLimit({
    action: "guest_dm.message",
    userId: session.visitor_id,
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

  const filtered = await applyWordFiltersLite(text);
  if (!filtered.ok) throw new Error(filtered.reason || "Message blocked.");
  const out = filtered.filtered.slice(0, cfg.maxMessageLength);
  const msgHash = hashText(out.toLowerCase());
  if (session.last_message_hash && session.last_message_hash === msgHash && lastAt && Date.now() - lastAt < 30_000) {
    throw new Error("Duplicate message blocked.");
  }
  return out;
}

async function touchGuestSession(visitorId: string, msgHash: string) {
  const sb = guestDb(await admin());
  await sb
    .from("guest_chat_sessions")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_hash: msgHash,
    } as never)
    .eq("visitor_id", visitorId);
}

async function insertGuestDmNotification(
  recipientId: string,
  conversationId: string,
  guestDisplayName: string,
  visitorId: string,
  preview: string,
) {
  const sb = guestDb(await admin());
  await sb.from("notifications").insert({
    user_id: recipientId,
    actor_id: null,
    kind: "guest_dm",
    target_type: "guest_dm_conversation",
    target_id: conversationId,
    payload: {
      preview: preview.slice(0, 200),
      guest_name: guestDisplayName,
      visitor_id: visitorId,
      body: `${guestDisplayName}: ${preview.slice(0, 120)}`,
    },
    read: false,
  } as never);
}

export const getGuestDmPublicConfig = createServerFn({ method: "GET" })
  .middleware([withRateLimit("api")])
  .handler(async () => {
    const cfg = await loadGuestDmConfig();
    return {
      enabled: cfg.enabled,
      messageCooldownSec: cfg.messageCooldownSec,
      maxMessageLength: cfg.maxMessageLength,
    };
  });

export const startGuestDmConversation = createServerFn({ method: "POST" })
  .middleware([withRateLimit("guest_dm.message")])
  .inputValidator((raw) =>
    z.object({
      visitorId: z.string().min(8).max(80),
      recipientId: z.string().uuid(),
      text: z.string().min(1).max(4000),
    }).parse(raw),
  )
  .handler(async ({ data }) => {
    const cfg = await loadGuestDmConfig();
    if (!cfg.enabled) throw new Error("Guest private messages are currently disabled.");
    if (!isUuid(data.recipientId)) throw new Error("Invalid recipient.");

    const session = await assertActiveGuestSession(data.visitorId);
    const text = await validateGuestMessageText(cfg, data.text, session);
    const msgHash = hashText(text.toLowerCase());

    const sb = guestDb(await admin());
    const convExpires = new Date(Date.now() + cfg.sessionTtlHours * 3600_000).toISOString();
    const msgExpires = new Date(Date.now() + cfg.messageTtlMinutes * 60_000).toISOString();
    const now = new Date().toISOString();

    let conversationId: string;
    const { data: existing } = await sb
      .from("guest_dm_conversations")
      .select("id, expires_at")
      .eq("visitor_id", data.visitorId)
      .eq("recipient_id", data.recipientId)
      .maybeSingle();

    if (existing?.id) {
      conversationId = existing.id as string;
      await sb
        .from("guest_dm_conversations")
        .update({
          expires_at: convExpires,
          guest_display_name: session.display_name,
          last_message_at: now,
        } as never)
        .eq("id", conversationId);
    } else {
      const { data: conv, error: cErr } = await sb
        .from("guest_dm_conversations")
        .insert({
          visitor_id: data.visitorId,
          recipient_id: data.recipientId,
          guest_display_name: session.display_name,
          expires_at: convExpires,
          last_message_at: now,
        } as never)
        .select("id")
        .single();
      if (cErr || !conv) throw new Error(cErr?.message || "Could not start conversation.");
      conversationId = conv.id as string;
    }

    const { data: row, error: mErr } = await sb
      .from("guest_dm_messages")
      .insert({
        conversation_id: conversationId,
        sender_kind: "guest",
        text,
        expires_at: msgExpires,
      } as never)
      .select("id, conversation_id, sender_kind, text, created_at, expires_at")
      .single();
    if (mErr || !row) throw new Error(mErr?.message || "Failed to send message.");

    await touchGuestSession(data.visitorId, msgHash);
    await insertGuestDmNotification(data.recipientId, conversationId, session.display_name, data.visitorId, text);

    return {
      conversationId,
      peerId: guestDmPeerId(data.visitorId),
      channelId: `gdm:${conversationId}`,
      message: {
        id: row.id as string,
        conversationId: row.conversation_id as string,
        senderKind: row.sender_kind as string,
        text: row.text as string,
        createdAt: row.created_at as string,
        expiresAt: row.expires_at as string,
      },
      guestDisplayName: session.display_name,
    };
  });

export const sendGuestDmMessage = createServerFn({ method: "POST" })
  .middleware([withRateLimit("guest_dm.message")])
  .inputValidator((raw) =>
    z.object({
      visitorId: z.string().min(8).max(80),
      conversationId: z.string().uuid(),
      text: z.string().min(1).max(4000),
    }).parse(raw),
  )
  .handler(async ({ data }) => {
    const cfg = await loadGuestDmConfig();
    if (!cfg.enabled) throw new Error("Guest private messages are currently disabled.");

    const session = await assertActiveGuestSession(data.visitorId);
    const text = await validateGuestMessageText(cfg, data.text, session);
    const msgHash = hashText(text.toLowerCase());

    const sb = guestDb(await admin());
    const { data: conv, error: cErr } = await sb
      .from("guest_dm_conversations")
      .select("id, visitor_id, recipient_id, guest_display_name, expires_at")
      .eq("id", data.conversationId)
      .eq("visitor_id", data.visitorId)
      .maybeSingle();
    if (cErr || !conv) throw new Error("Conversation not found.");
    if (new Date(conv.expires_at).getTime() <= Date.now()) {
      throw new Error("Conversation expired.");
    }

    const msgExpires = new Date(Date.now() + cfg.messageTtlMinutes * 60_000).toISOString();
    const now = new Date().toISOString();
    const convExpires = new Date(Date.now() + cfg.sessionTtlHours * 3600_000).toISOString();

    const { data: row, error: mErr } = await sb
      .from("guest_dm_messages")
      .insert({
        conversation_id: data.conversationId,
        sender_kind: "guest",
        text,
        expires_at: msgExpires,
      } as never)
      .select("id, conversation_id, sender_kind, text, created_at, expires_at")
      .single();
    if (mErr || !row) throw new Error(mErr?.message || "Failed to send message.");

    await sb
      .from("guest_dm_conversations")
      .update({ last_message_at: now, expires_at: convExpires } as never)
      .eq("id", data.conversationId);

    await touchGuestSession(data.visitorId, msgHash);
    await insertGuestDmNotification(
      conv.recipient_id as string,
      data.conversationId,
      conv.guest_display_name as string,
      data.visitorId,
      text,
    );

    return {
      id: row.id as string,
      conversationId: row.conversation_id as string,
      senderKind: row.sender_kind as string,
      text: row.text as string,
      createdAt: row.created_at as string,
      expiresAt: row.expires_at as string,
    };
  });

export const sendRegisteredGuestDmReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .inputValidator((raw) =>
    z.object({
      conversationId: z.string().uuid(),
      text: z.string().min(1).max(4000),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const cfg = await loadGuestDmConfig();
    if (!cfg.enabled) throw new Error("Guest private messages are currently disabled.");

    const text = data.text.trim();
    if (!text) throw new Error("Message cannot be empty.");
    if (text.length > cfg.maxMessageLength) {
      throw new Error(`Message too long (max ${cfg.maxMessageLength} characters).`);
    }

    const sb = guestDb(await admin());
    const { data: conv, error: cErr } = await sb
      .from("guest_dm_conversations")
      .select("id, visitor_id, recipient_id, expires_at")
      .eq("id", data.conversationId)
      .eq("recipient_id", context.userId)
      .maybeSingle();
    if (cErr || !conv) throw new Error("Conversation not found.");
    if (new Date(conv.expires_at).getTime() <= Date.now()) {
      throw new Error("Conversation expired.");
    }

    const msgExpires = new Date(Date.now() + cfg.messageTtlMinutes * 60_000).toISOString();
    const now = new Date().toISOString();
    const convExpires = new Date(Date.now() + cfg.sessionTtlHours * 3600_000).toISOString();

    const { data: row, error: mErr } = await sb
      .from("guest_dm_messages")
      .insert({
        conversation_id: data.conversationId,
        sender_kind: "registered",
        text,
        expires_at: msgExpires,
      } as never)
      .select("id, conversation_id, sender_kind, text, created_at, expires_at")
      .single();
    if (mErr || !row) throw new Error(mErr?.message || "Failed to send message.");

    await sb
      .from("guest_dm_conversations")
      .update({ last_message_at: now, expires_at: convExpires } as never)
      .eq("id", data.conversationId);

    return {
      id: row.id as string,
      conversationId: row.conversation_id as string,
      senderKind: row.sender_kind as string,
      text: row.text as string,
      createdAt: row.created_at as string,
      expiresAt: row.expires_at as string,
      visitorId: conv.visitor_id as string,
    };
  });

export const listGuestDmConversationsForGuest = createServerFn({ method: "GET" })
  .middleware([withRateLimit("api")])
  .inputValidator((raw) =>
    z.object({ visitorId: z.string().min(8).max(80) }).parse(raw),
  )
  .handler(async ({ data }) => {
    const cfg = await loadGuestDmConfig();
    if (!cfg.enabled) return [];
    await assertActiveGuestSession(data.visitorId);

    const sb = guestDb(await admin());
    const { data: rows, error } = await sb
      .from("guest_dm_conversations")
      .select("id, visitor_id, recipient_id, guest_display_name, created_at, expires_at, last_message_at")
      .eq("visitor_id", data.visitorId)
      .gt("expires_at", new Date().toISOString())
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);

    const recipientIds = [...new Set((rows ?? []).map((r: { recipient_id: string }) => r.recipient_id))];
    const profiles: Record<string, string> = {};
    if (recipientIds.length) {
      const { data: profs } = await sb
        .from("profiles")
        .select("id, username")
        .in("id", recipientIds);
      for (const p of profs ?? []) {
        profiles[p.id as string] = (p.username as string) || "User";
      }
    }

    return (rows ?? []).map((r: {
      id: string;
      visitor_id: string;
      recipient_id: string;
      guest_display_name: string;
      created_at: string;
      expires_at: string;
      last_message_at: string | null;
    }) => ({
      id: r.id,
      visitorId: r.visitor_id,
      recipientId: r.recipient_id,
      recipientName: profiles[r.recipient_id] ?? "User",
      guestDisplayName: r.guest_display_name,
      channelId: `gdm:${r.id}`,
      createdAt: r.created_at,
      expiresAt: r.expires_at,
      lastMessageAt: r.last_message_at,
    }));
  });

export const listGuestDmConversationsForRecipient = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .handler(async ({ context }) => {
    const cfg = await loadGuestDmConfig();
    if (!cfg.enabled) return [];

    const sb = guestDb(await admin());
    const { data: rows, error } = await sb
      .from("guest_dm_conversations")
      .select("id, visitor_id, recipient_id, guest_display_name, created_at, expires_at, last_message_at, recipient_last_read_at")
      .eq("recipient_id", context.userId)
      .gt("expires_at", new Date().toISOString())
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);

    return (rows ?? []).map((r: {
      id: string;
      visitor_id: string;
      recipient_id: string;
      guest_display_name: string;
      created_at: string;
      expires_at: string;
      last_message_at: string | null;
      recipient_last_read_at: string | null;
    }) => ({
      id: r.id,
      visitorId: r.visitor_id,
      peerId: guestDmPeerId(r.visitor_id),
      guestDisplayName: r.guest_display_name,
      channelId: `gdm:${r.id}`,
      createdAt: r.created_at,
      expiresAt: r.expires_at,
      lastMessageAt: r.last_message_at,
      recipientLastReadAt: r.recipient_last_read_at,
    }));
  });

async function fetchGuestDmMessageRows(conversationId: string, limit: number) {
  const sb = guestDb(await admin());
  const { data: rows, error } = await sb
    .from("guest_dm_messages")
    .select("id, conversation_id, sender_kind, text, created_at, expires_at")
    .eq("conversation_id", conversationId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (rows ?? []).reverse().map((r: {
    id: string;
    conversation_id: string;
    sender_kind: string;
    text: string;
    created_at: string;
    expires_at: string;
  }) => ({
    id: r.id,
    conversationId: r.conversation_id,
    senderKind: r.sender_kind,
    text: r.text,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
  }));
}

export const listGuestDmMessages = createServerFn({ method: "GET" })
  .middleware([withRateLimit("api")])
  .inputValidator((raw) =>
    z.object({
      conversationId: z.string().uuid(),
      visitorId: z.string().min(8).max(80),
      limit: z.number().int().min(1).max(100).optional(),
    }).parse(raw),
  )
  .handler(async ({ data }) => {
    const cfg = await loadGuestDmConfig();
    if (!cfg.enabled) return [];

    const sb = guestDb(await admin());
    const { data: conv, error: cErr } = await sb
      .from("guest_dm_conversations")
      .select("id, visitor_id, recipient_id, expires_at")
      .eq("id", data.conversationId)
      .maybeSingle();
    if (cErr || !conv) throw new Error("Conversation not found.");
    if (new Date(conv.expires_at).getTime() <= Date.now()) return [];
    if (data.visitorId !== conv.visitor_id) throw new Error("Forbidden.");
    await assertActiveGuestSession(data.visitorId);
    return fetchGuestDmMessageRows(data.conversationId, data.limit ?? 80);
  });

export const listGuestDmMessagesAuth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((raw) =>
    z.object({
      conversationId: z.string().uuid(),
      limit: z.number().int().min(1).max(100).optional(),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const cfg = await loadGuestDmConfig();
    if (!cfg.enabled) return [];

    const sb = guestDb(await admin());
    const { data: conv, error: cErr } = await sb
      .from("guest_dm_conversations")
      .select("id, visitor_id, recipient_id, expires_at")
      .eq("id", data.conversationId)
      .eq("recipient_id", context.userId)
      .maybeSingle();
    if (cErr || !conv) throw new Error("Conversation not found.");
    if (new Date(conv.expires_at).getTime() <= Date.now()) return [];
    return fetchGuestDmMessageRows(data.conversationId, data.limit ?? 80);
  });

export const markGuestDmRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((raw) =>
    z.object({ conversationId: z.string().uuid() }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const sb = guestDb(await admin());
    const { data: conv, error: convErr } = await sb
      .from("guest_dm_conversations")
      .select("last_message_at")
      .eq("id", data.conversationId)
      .eq("recipient_id", context.userId)
      .maybeSingle();
    if (convErr || !conv) throw new Error("Conversation not found.");

    const { data: latestMsg } = await sb
      .from("guest_dm_messages")
      .select("created_at")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date().toISOString();
    const fromMsg = latestMsg?.created_at ?? conv.last_message_at;
    const readAt = fromMsg && fromMsg > now ? fromMsg : (fromMsg ?? now);

    const { error } = await sb
      .from("guest_dm_conversations")
      .update({ recipient_last_read_at: readAt } as never)
      .eq("id", data.conversationId)
      .eq("recipient_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true, readAt };
  });
