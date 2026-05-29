import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertMod(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin", "moderator"]);
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Forbidden: moderator only");
  return data.map((r) => r.role as string);
}

async function logAction(actor_id: string, action: string, extra: Record<string, unknown> = {}) {
  await supabaseAdmin.from("mod_logs").insert({ actor_id, action, ...extra });
}

// ---------- Reports ----------
export const submitReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      target_type: z.enum(["message", "post", "user", "room"]),
      target_id: z.string().min(1).max(200),
      reason: z.string().min(1).max(200),
      details: z.string().max(2000).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin.from("reports").insert({
      reporter_id: context.userId,
      target_type: data.target_type,
      target_id: data.target_id,
      reason: data.reason,
      details: data.details ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      status: z.enum(["open", "reviewing", "resolved", "dismissed", "all"]).default("open"),
      limit: z.number().min(1).max(100).default(50),
    }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    let q = supabaseAdmin.from("reports").select("*").order("created_at", { ascending: false }).limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const resolveReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["resolved", "dismissed", "reviewing"]),
      note: z.string().max(500).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { error } = await supabaseAdmin
      .from("reports")
      .update({
        status: data.status,
        resolved_by: context.userId,
        resolved_at: new Date().toISOString(),
        resolution_note: data.note ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction(context.userId, data.status === "dismissed" ? "dismiss_report" : "resolve_report", { target_id: data.id, payload: { note: data.note } });
    return { ok: true };
  });

// ---------- Bans / Mutes ----------
export const banUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      user_id: z.string().uuid().optional(),
      ip_address: z.string().max(64).optional(),
      ban_type: z.enum(["ban", "temp_ban", "shadow_ban", "ip_ban"]).default("ban"),
      reason: z.string().max(300).optional(),
      expires_in_hours: z.number().int().min(1).max(24 * 365).optional(),
    }).refine((v) => v.user_id || v.ip_address, "Must supply user_id or ip_address").parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const expires_at = data.expires_in_hours
      ? new Date(Date.now() + data.expires_in_hours * 3600 * 1000).toISOString()
      : null;
    const { error } = await supabaseAdmin.from("user_bans").insert({
      user_id: data.user_id ?? null,
      ip_address: data.ip_address ?? null,
      ban_type: data.ban_type,
      reason: data.reason ?? null,
      created_by: context.userId,
      expires_at,
    });
    if (error) throw new Error(error.message);
    await logAction(context.userId, data.ban_type === "temp_ban" ? "temp_ban" : data.ban_type, {
      target_user_id: data.user_id ?? null,
      payload: { reason: data.reason, ip: data.ip_address, expires_at },
    });
    return { ok: true };
  });

export const unbanUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ ban_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { data: row } = await supabaseAdmin.from("user_bans").select("user_id").eq("id", data.ban_id).maybeSingle();
    const { error } = await supabaseAdmin.from("user_bans").update({ active: false }).eq("id", data.ban_id);
    if (error) throw new Error(error.message);
    await logAction(context.userId, "unban", { target_user_id: row?.user_id ?? null, target_id: data.ban_id });
    return { ok: true };
  });

export const listBans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMod(context.userId);
    const { data, error } = await supabaseAdmin
      .from("user_bans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const muteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      user_id: z.string().uuid(),
      scope: z.enum(["global", "room"]).default("global"),
      channel_id: z.string().max(120).optional(),
      reason: z.string().max(300).optional(),
      expires_in_minutes: z.number().int().min(1).max(60 * 24 * 30).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const expires_at = data.expires_in_minutes
      ? new Date(Date.now() + data.expires_in_minutes * 60_000).toISOString()
      : null;
    const { error } = await supabaseAdmin.from("user_mutes").insert({
      user_id: data.user_id,
      scope: data.scope,
      channel_id: data.scope === "room" ? data.channel_id ?? null : null,
      reason: data.reason ?? null,
      created_by: context.userId,
      expires_at,
    });
    if (error) throw new Error(error.message);
    await logAction(context.userId, "mute", { target_user_id: data.user_id, payload: { scope: data.scope, channel_id: data.channel_id, expires_at } });
    return { ok: true };
  });

export const unmuteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ mute_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { data: row } = await supabaseAdmin.from("user_mutes").select("user_id").eq("id", data.mute_id).maybeSingle();
    const { error } = await supabaseAdmin.from("user_mutes").update({ active: false }).eq("id", data.mute_id);
    if (error) throw new Error(error.message);
    await logAction(context.userId, "unmute", { target_user_id: row?.user_id, target_id: data.mute_id });
    return { ok: true };
  });

export const listMutes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMod(context.userId);
    const { data, error } = await supabaseAdmin
      .from("user_mutes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- Mod Notes ----------
export const addModNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ user_id: z.string().uuid(), note: z.string().min(1).max(1000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { error } = await supabaseAdmin.from("mod_notes").insert({
      user_id: data.user_id, author_id: context.userId, note: data.note,
    });
    if (error) throw new Error(error.message);
    await logAction(context.userId, "note", { target_user_id: data.user_id });
    return { ok: true };
  });

export const listModNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("mod_notes").select("*").eq("user_id", data.user_id).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ---------- Word Filters ----------
export const listWordFilters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMod(context.userId);
    const { data, error } = await supabaseAdmin.from("word_filters").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addWordFilter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      pattern: z.string().min(1).max(200),
      match_mode: z.enum(["word", "substring", "regex"]).default("word"),
      action: z.enum(["delete", "warn", "mute", "ban"]).default("delete"),
      severity: z.number().int().min(1).max(5).default(1),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { error } = await supabaseAdmin.from("word_filters").insert({
      pattern: data.pattern, match_mode: data.match_mode, action: data.action,
      severity: data.severity, created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    await logAction(context.userId, "add_word_filter", { payload: data });
    return { ok: true };
  });

export const toggleWordFilter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { error } = await supabaseAdmin.from("word_filters").update({ active: data.active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeWordFilter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { error } = await supabaseAdmin.from("word_filters").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction(context.userId, "remove_word_filter", { target_id: data.id });
    return { ok: true };
  });

// ---------- URL Rules ----------
export const listUrlRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMod(context.userId);
    const { data, error } = await supabaseAdmin.from("url_rules").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addUrlRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      domain: z.string().min(1).max(253).regex(/^[a-z0-9.-]+$/i, "Invalid domain"),
      kind: z.enum(["whitelist", "block"]),
      reason: z.string().max(300).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { error } = await supabaseAdmin.from("url_rules").insert({
      domain: data.domain.toLowerCase(), kind: data.kind, reason: data.reason ?? null,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    await logAction(context.userId, "add_url_rule", { payload: data });
    return { ok: true };
  });

export const removeUrlRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { error } = await supabaseAdmin.from("url_rules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction(context.userId, "remove_url_rule", { target_id: data.id });
    return { ok: true };
  });

// ---------- Logs ----------
export const listModLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ limit: z.number().min(1).max(200).default(100), offset: z.number().min(0).default(0) }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("mod_logs").select("*")
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ---------- Message moderation actions ----------
export const deleteMessageMod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ message_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { error } = await supabaseAdmin.from("messages").delete().eq("id", data.message_id);
    if (error) throw new Error(error.message);
    await logAction(context.userId, "delete_message", { target_id: data.message_id });
    return { ok: true };
  });

// ---------- Room moderators ----------
export const listRoomMods = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMod(context.userId);
    const { data, error } = await supabaseAdmin
      .from("room_moderators")
      .select("*, profiles:profiles!room_moderators_user_id_fkey(username)")
      .order("created_at", { ascending: false });
    // fk may not exist; fallback raw
    if (error) {
      const fb = await supabaseAdmin.from("room_moderators").select("*").order("created_at", { ascending: false });
      if (fb.error) throw new Error(fb.error.message);
      return fb.data ?? [];
    }
    return data ?? [];
  });

export const addRoomMod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      channel_id: z.string().min(1).max(120),
      user_id: z.string().uuid(),
      can_mute: z.boolean().default(true),
      can_kick: z.boolean().default(true),
      can_pin: z.boolean().default(true),
      can_delete: z.boolean().default(true),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { error } = await supabaseAdmin.from("room_moderators").upsert({
      ...data, created_by: context.userId,
    }, { onConflict: "channel_id,user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeRoomMod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertMod(context.userId);
    const { error } = await supabaseAdmin.from("room_moderators").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Overview ----------
export const getModerationOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMod(context.userId);
    const [openReports, activeBans, activeMutes, filters, urls, logs24] = await Promise.all([
      supabaseAdmin.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabaseAdmin.from("user_bans").select("id", { count: "exact", head: true }).eq("active", true),
      supabaseAdmin.from("user_mutes").select("id", { count: "exact", head: true }).eq("active", true),
      supabaseAdmin.from("word_filters").select("id", { count: "exact", head: true }).eq("active", true),
      supabaseAdmin.from("url_rules").select("id", { count: "exact", head: true }).eq("active", true),
      supabaseAdmin.from("mod_logs").select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
    ]);
    return {
      openReports: openReports.count ?? 0,
      activeBans: activeBans.count ?? 0,
      activeMutes: activeMutes.count ?? 0,
      activeWordFilters: filters.count ?? 0,
      activeUrlRules: urls.count ?? 0,
      logs24h: logs24.count ?? 0,
    };
  });
