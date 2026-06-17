/**
 * Broadcaster Studio server functions.
 *
 * Additive only — these never touch existing chat, feed, DJ-store, or YouTube
 * playback code. They expose CRUD on the new radio_* tables (added by the
 * Broadcaster Studio migration) and a few helpers used by /broadcaster and
 * /radio routes.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BROADCASTER_ROLES = ["admin", "super_admin", "dj", "rj"] as const;

async function getMyRoles(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.role as string);
}

async function assertBroadcaster(userId: string) {
  const roles = await getMyRoles(userId);
  if (!roles.some((r) => (BROADCASTER_ROLES as readonly string[]).includes(r))) {
    throw new Error("Forbidden: broadcaster role required");
  }
  return roles;
}

async function assertAdmin(userId: string) {
  const roles = await getMyRoles(userId);
  if (!roles.some((r) => r === "admin" || r === "super_admin")) {
    throw new Error("Forbidden: admin only");
  }
}

// ---------------- Roles surface ----------------
export const getBroadcasterAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await getMyRoles(context.userId);
    return {
      roles,
      isAdmin: roles.includes("admin") || roles.includes("super_admin"),
      isBroadcaster: roles.some((r) =>
        (BROADCASTER_ROLES as readonly string[]).includes(r),
      ),
    };
  });

// ---------------- Widgets ----------------
function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48) || `widget-${Date.now().toString(36)}`;
}

export const listWidgets = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("radio_widgets")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const createWidget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; description?: string; accent_color?: string; cover_url?: string; stream_url?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertBroadcaster(context.userId);
    const name = (data.name || "").trim();
    if (!name) throw new Error("Name required");
    const streamUrl = (data.stream_url || "").trim();
    if (streamUrl && !/^https?:\/\//i.test(streamUrl)) throw new Error("Stream URL must start with http(s)://");
    let slug = slugify(name);
    // ensure uniqueness with small suffix
    for (let i = 0; i < 6; i++) {
      const { data: dup } = await supabaseAdmin
        .from("radio_widgets")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!dup) break;
      slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 5)}`;
    }
    const { data: row, error } = await supabaseAdmin
      .from("radio_widgets")
      .insert({
        name,
        slug,
        description: data.description ?? null,
        accent_color: data.accent_color ?? "#a855f7",
        cover_url: data.cover_url ?? null,
        stream_url: streamUrl || null,
        owner_id: context.userId,
        created_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });


export const updateWidget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id: string;
    name?: string;
    description?: string | null;
    accent_color?: string;
    cover_url?: string | null;
    stream_url?: string | null;
    enabled?: boolean;
  }) => d)
  .handler(async ({ data, context }) => {
    const roles = await getMyRoles(context.userId);
    const isAdmin = roles.includes("admin") || roles.includes("super_admin");
    if (!isAdmin) {
      const { data: w } = await supabaseAdmin
        .from("radio_widgets")
        .select("owner_id")
        .eq("id", data.id)
        .maybeSingle();
      if (!w || w.owner_id !== context.userId) throw new Error("Forbidden");
    }
    const patch: {
      name?: string;
      description?: string | null;
      accent_color?: string;
      cover_url?: string | null;
      stream_url?: string | null;
      enabled?: boolean;
    } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.description !== undefined) patch.description = data.description;
    if (data.accent_color !== undefined) patch.accent_color = data.accent_color;
    if (data.cover_url !== undefined) patch.cover_url = data.cover_url;
    if (data.stream_url !== undefined) {
      const s = (data.stream_url || "").trim();
      if (s && !/^https?:\/\//i.test(s)) throw new Error("Stream URL must start with http(s)://");
      patch.stream_url = s || null;
    }
    if (data.enabled !== undefined) patch.enabled = data.enabled;
    const { data: row, error } = await supabaseAdmin
      .from("radio_widgets")
      .update(patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });


export const deleteWidget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("radio_widgets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Widget state (live / mic / now playing) ----------------
async function assertWidgetHostOrAdmin(userId: string, widgetId: string) {
  const roles = await getMyRoles(userId);
  if (roles.includes("admin") || roles.includes("super_admin")) return;
  const { data } = await supabaseAdmin
    .from("radio_widgets")
    .select("owner_id")
    .eq("id", widgetId)
    .maybeSingle();
  if (data?.owner_id === userId) return;
  const { data: st } = await supabaseAdmin
    .from("radio_widget_state")
    .select("current_host_id")
    .eq("widget_id", widgetId)
    .maybeSingle();
  if (st?.current_host_id === userId) return;
  throw new Error("Forbidden: not host of this widget");
}

export const goLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { widget_id: string; show_title?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertWidgetHostOrAdmin(context.userId, data.widget_id);
    const { error } = await supabaseAdmin
      .from("radio_widget_state")
      .upsert(
        {
          widget_id: data.widget_id,
          is_live: true,
          current_host_id: context.userId,
          current_show_title: data.show_title ?? null,
          started_at: new Date().toISOString(),
        },
        { onConflict: "widget_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const endLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { widget_id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertWidgetHostOrAdmin(context.userId, data.widget_id);
    const { error } = await supabaseAdmin
      .from("radio_widget_state")
      .update({
        is_live: false,
        mic_active: false,
        current_host_id: null,
        current_show_title: null,
        current_track_title: null,
        current_track_artist: null,
        current_track_artwork: null,
        listener_count: 0,
        started_at: null,
      })
      .eq("widget_id", data.widget_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setMic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { widget_id: string; active: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertWidgetHostOrAdmin(context.userId, data.widget_id);
    const { error } = await supabaseAdmin
      .from("radio_widget_state")
      .update({ mic_active: data.active })
      .eq("widget_id", data.widget_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateNowPlaying = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    widget_id: string;
    track_title?: string | null;
    track_artist?: string | null;
    track_artwork?: string | null;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertWidgetHostOrAdmin(context.userId, data.widget_id);
    const { error } = await supabaseAdmin
      .from("radio_widget_state")
      .update({
        current_track_title: data.track_title ?? null,
        current_track_artist: data.track_artist ?? null,
        current_track_artwork: data.track_artwork ?? null,
      })
      .eq("widget_id", data.widget_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Schedules ----------------
const scheduleSchema = z.object({
  widget_id: z.string().uuid(),
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  starts_at: z.string(),
  ends_at: z.string(),
});

export const listSchedules = createServerFn({ method: "GET" })
  .inputValidator((d: { widget_id?: string } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("radio_schedules")
      .select("*")
      .neq("status", "cancelled")
      .gte("ends_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString())
      .order("starts_at", { ascending: true })
      .limit(200);
    if (data?.widget_id) q = q.eq("widget_id", data.widget_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof scheduleSchema>) => scheduleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertBroadcaster(context.userId);
    if (new Date(data.ends_at) <= new Date(data.starts_at)) {
      throw new Error("End must be after start");
    }
    const { data: row, error } = await supabaseAdmin
      .from("radio_schedules")
      .insert({
        widget_id: data.widget_id,
        host_id: context.userId,
        title: data.title,
        description: data.description ?? null,
        starts_at: data.starts_at,
        ends_at: data.ends_at,
        status: "scheduled",
      })
      .select("*")
      .single();
    if (error) {
      if (error.message?.toLowerCase().includes("radio_schedules_no_overlap")) {
        throw new Error("❌ Time Slot Unavailable — that range overlaps an existing show on this widget.");
      }
      throw new Error(error.message);
    }
    return row;
  });

export const cancelSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const roles = await getMyRoles(context.userId);
    const isAdmin = roles.includes("admin") || roles.includes("super_admin");
    const { data: s } = await supabaseAdmin
      .from("radio_schedules")
      .select("host_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!s) throw new Error("Not found");
    if (!isAdmin && s.host_id !== context.userId) throw new Error("Forbidden");
    const { error } = await supabaseAdmin
      .from("radio_schedules")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Queue ----------------
const YT_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;

export function parseYouTubeId(url: string): string | null {
  const m = url.match(YT_RE);
  return m?.[1] ?? null;
}

export const listQueue = createServerFn({ method: "GET" })
  .inputValidator((d: { widget_id: string }) => d)
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("radio_queue_items")
      .select("*")
      .eq("widget_id", data.widget_id)
      .eq("played", false)
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const addQueueItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { widget_id: string; url: string; title?: string; channel?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertWidgetHostOrAdmin(context.userId, data.widget_id);
    const id = parseYouTubeId(data.url);
    if (!id) throw new Error("Not a recognised YouTube URL");
    const { data: max } = await supabaseAdmin
      .from("radio_queue_items")
      .select("position")
      .eq("widget_id", data.widget_id)
      .eq("played", false)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextPos = (max?.position ?? 0) + 1;
    const { data: row, error } = await supabaseAdmin
      .from("radio_queue_items")
      .insert({
        widget_id: data.widget_id,
        added_by: context.userId,
        position: nextPos,
        youtube_url: data.url,
        youtube_id: id,
        title: data.title ?? null,
        channel: data.channel ?? null,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    // bump queue_size for fast read
    await supabaseAdmin
      .from("radio_widget_state")
      .update({ queue_size: nextPos })
      .eq("widget_id", data.widget_id);
    return row;
  });

export const removeQueueItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; widget_id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertWidgetHostOrAdmin(context.userId, data.widget_id);
    const { error } = await supabaseAdmin.from("radio_queue_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    const { count } = await supabaseAdmin
      .from("radio_queue_items")
      .select("id", { count: "exact", head: true })
      .eq("widget_id", data.widget_id)
      .eq("played", false);
    await supabaseAdmin
      .from("radio_widget_state")
      .update({ queue_size: count ?? 0 })
      .eq("widget_id", data.widget_id);
    return { ok: true };
  });

export const clearQueue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { widget_id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertWidgetHostOrAdmin(context.userId, data.widget_id);
    const { error } = await supabaseAdmin
      .from("radio_queue_items")
      .delete()
      .eq("widget_id", data.widget_id)
      .eq("played", false);
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("radio_widget_state")
      .update({ queue_size: 0 })
      .eq("widget_id", data.widget_id);
    return { ok: true };
  });

export const markPlayed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; widget_id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertWidgetHostOrAdmin(context.userId, data.widget_id);
    const { error } = await supabaseAdmin
      .from("radio_queue_items")
      .update({ played: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Settings (disclaimer + ticker template) ----------------
export const getBroadcasterSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("broadcaster_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

export const updateBroadcasterSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    disclaimer_text?: string;
    disclaimer_enabled?: boolean;
    ticker_template?: string;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const patch: { disclaimer_text?: string; disclaimer_enabled?: boolean; ticker_template?: string } = {};
    if (data.disclaimer_text !== undefined) patch.disclaimer_text = data.disclaimer_text;
    if (data.disclaimer_enabled !== undefined) patch.disclaimer_enabled = data.disclaimer_enabled;
    if (data.ticker_template !== undefined) patch.ticker_template = data.ticker_template;
    const { data: row, error } = await supabaseAdmin
      .from("broadcaster_settings")
      .update(patch)
      .eq("id", 1)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ---------------- Announcements ----------------
const announcementKindSchema = z.enum(["upcoming_show", "ticker", "community"]);
const targetSchema = z.object({
  widget: z.boolean().optional(),
  chatbar: z.boolean().optional(),
  notifications: z.boolean().optional(),
  feed: z.boolean().optional(),
});

export const listAnnouncements = createServerFn({ method: "GET" })
  .inputValidator((d: { widget_id?: string | null; kind?: string; activeOnly?: boolean } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("radio_announcements")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.activeOnly) q = q.eq("active", true);
    if (data.kind) q = q.eq("kind", data.kind);
    if (data.widget_id === null) q = q.is("widget_id", null);
    else if (data.widget_id) q = q.eq("widget_id", data.widget_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const now = Date.now();
    return (rows ?? []).filter((r) => {
      if (!data.activeOnly) return true;
      if (r.starts_at && new Date(r.starts_at).getTime() > now) return false;
      if (r.ends_at && new Date(r.ends_at).getTime() < now) return false;
      return true;
    });
  });

const announcementInput = z.object({
  widget_id: z.string().uuid().nullable().optional(),
  kind: announcementKindSchema,
  title: z.string().min(1).max(140),
  body: z.string().max(2000).optional().nullable(),
  link: z.string().url().max(500).optional().nullable(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
  pinned: z.boolean().optional(),
  active: z.boolean().optional(),
  target: targetSchema.optional(),
});

export const createAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof announcementInput>) => announcementInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertBroadcaster(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("radio_announcements")
      .insert({
        widget_id: data.widget_id ?? null,
        author_id: context.userId,
        kind: data.kind,
        title: data.title,
        body: data.body ?? null,
        link: data.link ?? null,
        starts_at: data.starts_at ?? null,
        ends_at: data.ends_at ?? null,
        pinned: data.pinned ?? false,
        active: data.active ?? true,
        target: (data.target ?? { widget: true, chatbar: true, notifications: true, feed: true }) as never,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Partial<z.infer<typeof announcementInput>> & { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertBroadcaster(context.userId);
    const { id, ...rest } = data;
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) patch[k] = v;
    }
    const { data: row, error } = await supabaseAdmin
      .from("radio_announcements")
      .update(patch as never)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertBroadcaster(context.userId);
    const { error } = await supabaseAdmin.from("radio_announcements").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Analytics ----------------
export const getBroadcasterAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  const [
    { data: schedules },
    { data: states },
    { data: widgets },
    { data: tracks },
  ] = await Promise.all([
    supabaseAdmin.from("radio_schedules").select("*").limit(2000),
    supabaseAdmin.from("radio_widget_state").select("*").limit(500),
    supabaseAdmin.from("radio_widgets").select("id,name,slug").limit(500),
    supabaseAdmin.from("radio_queue_items").select("youtube_id,title,played").eq("played", true).limit(5000),
  ]);

  const widgetMap = new Map<string, { name: string; slug: string }>();
  (widgets ?? []).forEach((w) => widgetMap.set(w.id, { name: w.name, slug: w.slug }));

  // Top host (most completed shows)
  const hostCounts = new Map<string, number>();
  (schedules ?? []).forEach((s) => {
    if (s.status === "completed" && s.host_id) {
      hostCounts.set(s.host_id, (hostCounts.get(s.host_id) ?? 0) + 1);
    }
  });
  let topHost: { host_id: string; shows: number } | null = null;
  for (const [host_id, shows] of hostCounts) {
    if (!topHost || shows > topHost.shows) topHost = { host_id, shows };
  }

  // Top show (by total scheduled minutes across completed)
  const showMinutes = new Map<string, number>();
  (schedules ?? []).forEach((s) => {
    if (s.status === "completed" && s.starts_at && s.ends_at) {
      const mins = Math.max(0, (new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) / 60000);
      showMinutes.set(s.title, (showMinutes.get(s.title) ?? 0) + mins);
    }
  });
  let topShow: { title: string; minutes: number } | null = null;
  for (const [title, minutes] of showMinutes) {
    if (!topShow || minutes > topShow.minutes) topShow = { title, minutes: Math.round(minutes) };
  }

  // Peak listener time — group widget_state.started_at hour bucket weighted by listener_count
  const hourBuckets = new Map<number, number>();
  (states ?? []).forEach((st) => {
    if (st.started_at && st.listener_count) {
      const h = new Date(st.started_at).getUTCHours();
      hourBuckets.set(h, (hourBuckets.get(h) ?? 0) + st.listener_count);
    }
  });
  let peakHour: { hour: number; listeners: number } | null = null;
  for (const [hour, listeners] of hourBuckets) {
    if (!peakHour || listeners > peakHour.listeners) peakHour = { hour, listeners };
  }

  // Most active widget — highest sum of listener_count across recent states
  let mostActiveWidget: { widget_id: string; name: string; listeners: number } | null = null;
  (states ?? []).forEach((st) => {
    const info = widgetMap.get(st.widget_id);
    if (!info) return;
    const candidate = { widget_id: st.widget_id, name: info.name, listeners: st.listener_count ?? 0 };
    if (!mostActiveWidget || candidate.listeners > mostActiveWidget.listeners) {
      mostActiveWidget = candidate;
    }
  });

  // Most played track
  const trackCounts = new Map<string, { title: string | null; count: number }>();
  (tracks ?? []).forEach((t) => {
    if (!t.youtube_id) return;
    const cur = trackCounts.get(t.youtube_id);
    if (cur) cur.count += 1;
    else trackCounts.set(t.youtube_id, { title: t.title, count: 1 });
  });
  let mostPlayedTrack: { youtube_id: string; title: string | null; plays: number } | null = null;
  for (const [youtube_id, v] of trackCounts) {
    if (!mostPlayedTrack || v.count > mostPlayedTrack.plays) {
      mostPlayedTrack = { youtube_id, title: v.title, plays: v.count };
    }
  }


  return {
    topHost: topHost as { host_id: string; shows: number } | null,
    topShow: topShow as { title: string; minutes: number } | null,
    peakHour: peakHour as { hour: number; listeners: number } | null,
    mostActiveWidget: mostActiveWidget as { widget_id: string; name: string; listeners: number } | null,
    mostPlayedTrack: mostPlayedTrack as { youtube_id: string; title: string | null; plays: number } | null,
  };
});

