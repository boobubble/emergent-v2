import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "@/lib/rate-limit-middleware";
import { isPlatformBotKey } from "@/lib/platform-channel-bots";
import {
  slugifyPlatformChannelSlug,
  validatePlatformChannelSlug,
} from "@/lib/platform-channel-slugs";
import type {
  PlatformChannelBotRecord,
  PlatformChannelRecord,
} from "@/lib/platform-channels.types";

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // Registry tables are migration-backed; cast until supabase gen types are refreshed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabaseAdmin as any;
}

async function requireAdmin(context: { supabase: { rpc: Function }; userId: string }) {
  const { data: ok, error } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
  if (error || !ok) throw new Error("Forbidden");
}

function mapChannel(row: Record<string, unknown>): PlatformChannelRecord {
  return {
    id: String(row.id),
    channel_number: Number(row.channel_number),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description ?? ""),
    enabled: Boolean(row.enabled),
    archived_at: row.archived_at ? String(row.archived_at) : null,
    guest_allowed: Boolean(row.guest_allowed),
    sort_order: Number(row.sort_order ?? 0),
    channel_kind: row.channel_kind === "system" ? "system" : "admin",
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapBot(row: Record<string, unknown>): PlatformChannelBotRecord {
  return {
    id: String(row.id),
    channel_id: String(row.channel_id),
    bot_key: String(row.bot_key),
    enabled: Boolean(row.enabled),
    config: (row.config && typeof row.config === "object" ? row.config : {}) as Record<string, unknown>,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

/** Active platform channels for navigation (public). */
export const listPlatformChannels = createServerFn({ method: "GET" })
  .middleware([withRateLimit("api")])
  .handler(async (): Promise<PlatformChannelRecord[]> => {
    const sb = await adminClient();
    const { data, error } = await sb
      .from("platform_chat_channels")
      .select("*")
      .eq("enabled", true)
      .is("archived_at", null)
      .order("sort_order", { ascending: true })
      .order("channel_number", { ascending: true });
    if (error) throw new Error(error.message || "Failed to load platform channels.");
    return (data ?? []).map((row) => mapChannel(row as Record<string, unknown>));
  });

/** Full registry for admin UI (includes archived/disabled). */
export const listPlatformChannelsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .handler(async ({ context }): Promise<PlatformChannelRecord[]> => {
    await requireAdmin(context);
    const sb = await adminClient();
    const { data, error } = await sb
      .from("platform_chat_channels")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("channel_number", { ascending: true });
    if (error) throw new Error(error.message || "Failed to load platform channels.");
    return (data ?? []).map((row) => mapChannel(row as Record<string, unknown>));
  });

const createInput = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(64),
  description: z.string().max(500).optional(),
  guest_allowed: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(100000).optional(),
});

export const createPlatformChannel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((raw) => createInput.parse(raw))
  .handler(async ({ data, context }): Promise<PlatformChannelRecord> => {
    await requireAdmin(context);
    const slug = slugifyPlatformChannelSlug(data.slug);
    const slugError = validatePlatformChannelSlug(slug);
    if (slugError) throw new Error(slugError);

    const sb = await adminClient();
    const { data: existing } = await sb
      .from("platform_chat_channels")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) throw new Error("Channel slug already exists.");

    const { data: numberRow, error: allocError } = await sb.rpc("allocate_platform_channel_number");
    if (allocError || numberRow == null) {
      throw new Error(allocError?.message || "Could not allocate channel number.");
    }

    const { data: row, error } = await sb
      .from("platform_chat_channels")
      .insert({
        channel_number: numberRow,
        slug,
        name: data.name.trim(),
        description: (data.description ?? "").trim(),
        guest_allowed: Boolean(data.guest_allowed),
        sort_order: data.sort_order ?? 100,
        channel_kind: "admin",
        enabled: true,
      })
      .select("*")
      .single();
    if (error || !row) throw new Error(error?.message || "Failed to create platform channel.");
    return mapChannel(row as Record<string, unknown>);
  });

const updateInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(500).optional(),
  guest_allowed: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(100000).optional(),
});

export const updatePlatformChannel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((raw) => updateInput.parse(raw))
  .handler(async ({ data, context }): Promise<PlatformChannelRecord> => {
    await requireAdmin(context);
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name.trim();
    if (data.description !== undefined) patch.description = data.description.trim();
    if (data.guest_allowed !== undefined) patch.guest_allowed = data.guest_allowed;
    if (data.sort_order !== undefined) patch.sort_order = data.sort_order;
    if (!Object.keys(patch).length) throw new Error("No changes provided.");

    const sb = await adminClient();
    const { data: row, error } = await sb
      .from("platform_chat_channels")
      .update(patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error || !row) throw new Error(error?.message || "Failed to update platform channel.");
    return mapChannel(row as Record<string, unknown>);
  });

export const archivePlatformChannel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }): Promise<PlatformChannelRecord> => {
    await requireAdmin(context);
    const sb = await adminClient();
    const { data: existing, error: readError } = await sb
      .from("platform_chat_channels")
      .select("*")
      .eq("id", data.id)
      .single();
    if (readError || !existing) throw new Error("Channel not found.");
    if (existing.channel_kind === "system") {
      throw new Error("System channels cannot be archived.");
    }

    const { data: row, error } = await sb
      .from("platform_chat_channels")
      .update({ enabled: false, archived_at: new Date().toISOString() })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error || !row) throw new Error(error?.message || "Failed to archive platform channel.");
    return mapChannel(row as Record<string, unknown>);
  });

export const listPlatformChannelBots = createServerFn({ method: "GET" })
  .middleware([withRateLimit("api")])
  .inputValidator((raw) => z.object({ channelId: z.string().uuid() }).parse(raw))
  .handler(async ({ data }): Promise<PlatformChannelBotRecord[]> => {
    const sb = await adminClient();
    const { data: rows, error } = await sb
      .from("platform_channel_bots")
      .select("*")
      .eq("channel_id", data.channelId)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message || "Failed to load channel bots.");
    return (rows ?? []).map((row) => mapBot(row as Record<string, unknown>));
  });

const upsertBotInput = z.object({
  channelId: z.string().uuid(),
  botKey: z.string().min(3).max(64),
  enabled: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
});

export const upsertPlatformChannelBot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((raw) => upsertBotInput.parse(raw))
  .handler(async ({ data, context }): Promise<PlatformChannelBotRecord> => {
    await requireAdmin(context);
    if (!isPlatformBotKey(data.botKey)) {
      throw new Error("Unknown bot key.");
    }

    const sb = await adminClient();
    const { data: row, error } = await sb
      .from("platform_channel_bots")
      .upsert(
        {
          channel_id: data.channelId,
          bot_key: data.botKey,
          enabled: data.enabled ?? true,
          config: data.config ?? {},
          sort_order: data.sortOrder ?? 0,
        },
        { onConflict: "channel_id,bot_key" },
      )
      .select("*")
      .single();
    if (error || !row) throw new Error(error?.message || "Failed to save bot assignment.");
    return mapBot(row as Record<string, unknown>);
  });

export const removePlatformChannelBot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((raw) =>
    z.object({ channelId: z.string().uuid(), botKey: z.string().min(3).max(64) }).parse(raw),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await requireAdmin(context);
    const sb = await adminClient();
    const { error } = await sb
      .from("platform_channel_bots")
      .delete()
      .eq("channel_id", data.channelId)
      .eq("bot_key", data.botKey);
    if (error) throw new Error(error.message || "Failed to remove bot assignment.");
    return { ok: true };
  });
