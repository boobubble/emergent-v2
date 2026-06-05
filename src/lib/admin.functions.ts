import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
  return data.map((r) => r.role);
}

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: super_admin only");
}

// -------- Current user roles --------
export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((r) => r.role as string);
    return {
      roles,
      isAdmin: roles.includes("super_admin") || roles.includes("admin"),
      isSuperAdmin: roles.includes("super_admin"),
    };
  });

// -------- Settings (public read; admin write) --------
export const getAllSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.from("app_settings").select("*");
  if (error) throw new Error(error.message);
  const map: Record<string, any> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map as Record<string, any>;
});

export const updateSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ key: z.string().min(1).max(64), value: z.any() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString(), updated_by: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- SEO --------
export const getAllSeo = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.from("seo_settings").select("*").order("page_key");
  if (error) throw new Error(error.message);
  return data ?? [];
});

const seoSchema = z.object({
  page_key: z.string().min(1).max(64),
  title: z.string().max(120).nullable().optional(),
  description: z.string().max(300).nullable().optional(),
  keywords: z.string().max(500).nullable().optional(),
  og_title: z.string().max(120).nullable().optional(),
  og_description: z.string().max(300).nullable().optional(),
  og_image: z.string().max(500).nullable().optional(),
  twitter_card: z.string().max(40).nullable().optional(),
});

export const upsertSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => seoSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("seo_settings")
      .upsert({ ...data, updated_at: new Date().toISOString(), updated_by: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Analytics --------
export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const since24 = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const since5m = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const [
      totalUsers,
      onlineUsers,
      newUsers24,
      postsTotal,
      posts24,
      messages24,
      games24,
      topChannels,
      newUsersByDay,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen", since5m),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since24),
      supabaseAdmin.from("posts").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).gte("created_at", since24),
      supabaseAdmin.from("messages").select("id", { count: "exact", head: true }).gte("created_at", since24),
      supabaseAdmin.from("games").select("id", { count: "exact", head: true }).gte("created_at", since24),
      supabaseAdmin.from("messages").select("channel_id").gte("created_at", since24).limit(2000),
      supabaseAdmin.from("profiles").select("created_at").gte("created_at", since7d).limit(5000),
    ]);

    const channelCounts: Record<string, number> = {};
    for (const r of topChannels.data ?? []) {
      const cid = (r as { channel_id: string }).channel_id;
      if (!cid || cid.startsWith("dm:")) continue;
      channelCounts[cid] = (channelCounts[cid] ?? 0) + 1;
    }
    const top = Object.entries(channelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([channel, count]) => ({ channel, count }));

    // daily series
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000).toISOString().slice(0, 10);
      days[d] = 0;
    }
    for (const r of newUsersByDay.data ?? []) {
      const d = (r as { created_at: string }).created_at.slice(0, 10);
      if (d in days) days[d] += 1;
    }

    return {
      totalUsers: totalUsers.count ?? 0,
      onlineUsers: onlineUsers.count ?? 0,
      newUsers24: newUsers24.count ?? 0,
      postsTotal: postsTotal.count ?? 0,
      posts24: posts24.count ?? 0,
      messages24: messages24.count ?? 0,
      games24: games24.count ?? 0,
      topChannels: top,
      newUsersByDay: Object.entries(days).map(([day, count]) => ({ day, count })),
    };
  });

// -------- Lightweight realtime overview (cheap, frequent polling) --------
export const getRealtimeOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const since5m = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const since10m = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const since1m = new Date(Date.now() - 60 * 1000).toISOString();
    const [online, recentMsgs, activeGames, recentPosts] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen", since5m),
      supabaseAdmin.from("messages").select("channel_id").gte("created_at", since10m).limit(500),
      supabaseAdmin.from("games").select("id", { count: "exact", head: true }).in("status", ["waiting", "active"]),
      supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).gte("created_at", since1m),
    ]);
    const rooms = new Set<string>();
    for (const r of recentMsgs.data ?? []) {
      const cid = (r as { channel_id: string }).channel_id;
      if (cid && !cid.startsWith("dm:")) rooms.add(cid);
    }
    return {
      onlineUsers: online.count ?? 0,
      activeRooms: rooms.size,
      activeGames: activeGames.count ?? 0,
      postsLastMinute: recentPosts.count ?? 0,
      timestamp: Date.now(),
    };
  });

// -------- Top users (engagement) --------
export const getTopUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, username, avatar_url, avatar_color, xp, level")
      .order("xp", { ascending: false })
      .limit(8);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// -------- Dynamic SEO targets (rooms/profiles/posts/games) --------
export const getSeoTargetsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const [rooms, profiles, posts, games] = await Promise.all([
      supabaseAdmin.from("messages").select("channel_id").limit(2000),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("privacy", "public"),
      supabaseAdmin.from("games").select("id", { count: "exact", head: true }),
    ]);
    const roomSet = new Set<string>();
    for (const r of rooms.data ?? []) {
      const cid = (r as { channel_id: string }).channel_id;
      if (cid && !cid.startsWith("dm:")) roomSet.add(cid);
    }
    return {
      rooms: roomSet.size,
      profiles: profiles.count ?? 0,
      publicPosts: posts.count ?? 0,
      games: games.count ?? 0,
    };
  });


// -------- Ban / Unban --------
export const banUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      user_id: z.string().uuid(),
      reason: z.string().trim().min(3, "Reason is required").max(500),
      duration_minutes: z.number().int().min(0).max(60 * 24 * 365 * 5).nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const expires_at = data.duration_minutes && data.duration_minutes > 0
      ? new Date(Date.now() + data.duration_minutes * 60_000).toISOString()
      : null;
    // Lift any prior active bans so we always have one current record
    await supabaseAdmin.from("user_bans").update({ active: false })
      .eq("user_id", data.user_id).eq("active", true);
    const { error } = await supabaseAdmin.from("user_bans").insert({
      user_id: data.user_id,
      reason: data.reason,
      expires_at,
      created_by: context.userId,
      active: true,
      ban_type: "ban",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });


export const unbanUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("user_bans")
      .update({ active: false })
      .eq("user_id", data.user_id)
      .eq("active", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Delete user (super admin only) --------
export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    if (data.user_id === context.userId) throw new Error("Cannot delete your own account");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Users + role mgmt --------
export const listUsersWithRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      q: z.string().max(64).optional(),
      filter: z.enum(["all", "members", "guests", "banned", "staff"]).optional(),
    }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    let query = supabaseAdmin
      .from("profiles")
      .select("id, username, avatar_url, created_at, last_seen, xp, level")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.q) query = query.ilike("username", `%${data.q}%`);
    if (data.filter === "guests") query = query.ilike("username", "guest-%");
    if (data.filter === "members") query = query.not("username", "ilike", "guest-%");
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }, { data: bans, error: bErr }] = await Promise.all([
      query,
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("user_bans").select("user_id, reason, expires_at, created_at").eq("active", true),
    ]);
    if (pErr) throw new Error(pErr.message);
    if (rErr) throw new Error(rErr.message);
    if (bErr) throw new Error(bErr.message);
    const roleMap: Record<string, string[]> = {};
    for (const r of roles ?? []) {
      const row = r as { user_id: string; role: string };
      (roleMap[row.user_id] ??= []).push(row.role);
    }
    const banMap: Record<string, { reason: string | null; expires_at: string | null }> = {};
    const now = Date.now();
    for (const b of bans ?? []) {
      const row = b as { user_id: string | null; reason: string | null; expires_at: string | null };
      if (!row.user_id) continue;
      // Skip expired bans (auto-unban view-side)
      if (row.expires_at && new Date(row.expires_at).getTime() <= now) continue;
      banMap[row.user_id] = { reason: row.reason, expires_at: row.expires_at };
    }
    let rows = (profiles ?? []).map((p) => ({
      ...p,
      roles: roleMap[p.id] ?? [],
      banned: !!banMap[p.id],
      ban_reason: banMap[p.id]?.reason ?? null,
      ban_expires_at: banMap[p.id]?.expires_at ?? null,
      is_guest: !!p.username && p.username.toLowerCase().startsWith("guest-"),
    }));
    if (data.filter === "banned") rows = rows.filter((r) => r.banned);
    if (data.filter === "staff") rows = rows.filter((r) => r.roles.length > 0);
    return rows;
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      user_id: z.string().uuid(),
      role: z.enum(["super_admin", "admin", "moderator"]),
      grant: z.boolean(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

