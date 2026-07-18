/**
 * Games SDK — server functions.
 *
 * Thin bridge from the reusable `packages/games-sdk` surface into the
 * existing platform systems. Every function here is a small wrapper —
 * NO new business logic. Each SDK verb maps to an existing pipeline:
 *
 *   addXP()              → gam_emit()          (public RPC via requireSupabaseAuth)
 *   addCoins()           → gam_award()         (wallet system, admin-only)
 *   unlockAchievement()  → gam_award()         (badge on profile)
 *   submitScore()        → gam_emit('game.score', metadata:{gameId, score, ...})
 *   getLeaderboard()     → reads gam_event_log
 *   publishFeed()        → feedbot_enqueue()   (FeedBot pipeline)
 *   trackEvent()         → gam_emit('sdk.event', metadata:{gameId, name, props})
 *   sendNotification()   → notifications table
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

type Meta = Record<string, unknown>;

/* ------------------------------------------------------------------ XP */
export const sdkAddXP = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .inputValidator((i: { amount: number; reason?: string; gameId?: string; metadata?: Meta }) => ({
    amount: Math.max(1, Math.floor(Number(i.amount) || 0)),
    reason: (i.reason ?? "game.xp").toString().slice(0, 80),
    gameId: i.gameId?.toString().slice(0, 80),
    metadata: i.metadata ?? {},
  }))
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { error } = await sb.rpc("gam_emit", {
      _user_id: context.userId,
      _event_type: data.reason,
      _amount: data.amount,
      _metadata: { ...data.metadata, sdk: true, gameId: data.gameId },
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------------------------------------- Coins */
export const sdkAddCoins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("wallet.write")])
  .inputValidator((i: { amount: number; reason?: string; gameId?: string }) => ({
    amount: Math.max(1, Math.floor(Number(i.amount) || 0)),
    reason: (i.reason ?? "game.coins").toString().slice(0, 80),
    gameId: (i.gameId ?? "").toString().slice(0, 80),
  }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin as any;
    const { error } = await admin.rpc("gam_award", {
      _user_id: context.userId,
      _coins: data.amount,
      _xp: 0,
      _badge: null,
      _reason: data.reason,
      _reference: data.gameId || null,
    });
    if (error) throw new Error(error.message);
    // Return fresh balance for the SDK caller.
    const { data: prof } = await admin
      .from("profiles")
      .select("coins")
      .eq("id", context.userId)
      .maybeSingle();
    return { userId: context.userId, coins: Number(prof?.coins ?? 0), updatedAt: new Date().toISOString() };
  });

/* --------------------------------------------------------- Achievement */
export const sdkUnlockAchievement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .inputValidator((i: { achievementId: string; coins?: number; xp?: number; reason?: string }) => ({
    achievementId: String(i.achievementId ?? "").slice(0, 120),
    coins: Math.max(0, Math.floor(Number(i.coins) || 0)),
    xp: Math.max(0, Math.floor(Number(i.xp) || 0)),
    reason: (i.reason ?? "sdk.achievement").toString().slice(0, 80),
  }))
  .handler(async ({ data, context }) => {
    if (!data.achievementId) throw new Error("achievementId required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin as any;
    const { error } = await admin.rpc("gam_award", {
      _user_id: context.userId,
      _coins: data.coins,
      _xp: data.xp,
      _badge: data.achievementId,
      _reason: data.reason,
      _reference: data.achievementId,
    });
    if (error) throw new Error(error.message);
    return { achievementId: data.achievementId, unlocked: true, unlockedAt: new Date().toISOString() };
  });

/* --------------------------------------------------------- Leaderboard */
export const sdkSubmitScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("game.write")])
  .inputValidator((i: { gameId: string; score: number; metadata?: Meta }) => ({
    gameId: String(i.gameId ?? "").slice(0, 80),
    score: Math.max(0, Math.floor(Number(i.score) || 0)),
    metadata: i.metadata ?? {},
  }))
  .handler(async ({ data, context }) => {
    if (!data.gameId) throw new Error("gameId required");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { error } = await sb.rpc("gam_emit", {
      _user_id: context.userId,
      _event_type: "game.score",
      _amount: 1,
      _metadata: { ...data.metadata, gameId: data.gameId, score: data.score, sdk: true },
    });
    if (error) throw new Error(error.message);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin as any;
    const { data: rows } = await admin
      .from("gam_event_log")
      .select("metadata")
      .eq("user_id", context.userId)
      .eq("event_type", "game.score")
      .contains("metadata", { gameId: data.gameId })
      .limit(500);
    const best = (rows ?? []).reduce((m: number, r: { metadata: Meta }) => {
      const s = Number((r?.metadata as Meta)?.score ?? 0);
      return s > m ? s : m;
    }, data.score);
    return { best };
  });

export const sdkGetLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("game.write")])
  .inputValidator((i: { gameId: string; limit?: number }) => ({
    gameId: String(i.gameId ?? "").slice(0, 80),
    limit: Math.min(100, Math.max(1, Math.floor(Number(i.limit) || 20))),
  }))
  .handler(async ({ data }) => {
    if (!data.gameId) throw new Error("gameId required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin as any;
    const { data: rows } = await admin
      .from("gam_event_log")
      .select("user_id, metadata")
      .eq("event_type", "game.score")
      .contains("metadata", { gameId: data.gameId })
      .limit(5000);
    const best = new Map<string, number>();
    (rows ?? []).forEach((r: { user_id: string; metadata: Meta }) => {
      const s = Number((r?.metadata as Meta)?.score ?? 0);
      const cur = best.get(r.user_id) ?? 0;
      if (s > cur) best.set(r.user_id, s);
    });
    const top = [...best.entries()].sort((a, b) => b[1] - a[1]).slice(0, data.limit);
    if (!top.length) return { items: [] };
    const ids = top.map(([id]) => id);
    const { data: profs } = await admin
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", ids);
    const byId = new Map((profs ?? []).map((p: { id: string }) => [p.id, p]));
    return {
      items: top.map(([userId, score], idx) => {
        const p = byId.get(userId) as { username?: string; avatar_url?: string | null } | undefined;
        return {
          rank: idx + 1,
          userId,
          username: p?.username,
          avatarUrl: p?.avatar_url ?? null,
          score,
        };
      }),
    };
  });

/* ---------------------------------------------------------- Publish Feed */
export const sdkPublishFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("feed.write")])
  .inputValidator((i: { text?: string; imageUrl?: string; linkUrl?: string; gameId?: string; metadata?: Meta }) => ({
    text: (i.text ?? "").toString().slice(0, 1000),
    imageUrl: i.imageUrl?.toString().slice(0, 1000),
    linkUrl: i.linkUrl?.toString().slice(0, 1000),
    gameId: (i.gameId ?? "").toString().slice(0, 80),
    metadata: i.metadata ?? {},
  }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin as any;
    const dedupe = `sdk:${data.gameId}:${context.userId}:${Date.now()}`;
    const { error } = await admin.rpc("feedbot_enqueue", {
      _kind: "game_publish",
      _category: "game_publish",
      _actor: context.userId,
      _payload: {
        text: data.text,
        gameId: data.gameId,
        ...data.metadata,
        sdk: true,
      },
      _target_url: data.linkUrl || null,
      _image_url: data.imageUrl || null,
      _dedupe: dedupe,
    });
    if (error) throw new Error(error.message);
    return { postId: dedupe };
  });

/* ------------------------------------------------------------ Analytics */
export const sdkTrackEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .inputValidator((i: { name: string; gameId?: string; properties?: Meta }) => ({
    name: String(i.name ?? "").slice(0, 120),
    gameId: (i.gameId ?? "").toString().slice(0, 80),
    properties: i.properties ?? {},
  }))
  .handler(async ({ data, context }) => {
    if (!data.name) throw new Error("event name required");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { error } = await sb.rpc("gam_emit", {
      _user_id: context.userId,
      _event_type: "sdk.event",
      _amount: 1,
      _metadata: { name: data.name, gameId: data.gameId, properties: data.properties, sdk: true },
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------------------------------- Notification */
export const sdkSendNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("notification.write")])
  .inputValidator((i: { title: string; body?: string; toUserId?: string; gameId?: string; data?: Meta }) => ({
    title: String(i.title ?? "").slice(0, 200),
    body: (i.body ?? "").toString().slice(0, 600),
    toUserId: i.toUserId?.toString(),
    gameId: (i.gameId ?? "").toString().slice(0, 80),
    payload: i.data ?? {},
  }))
  .handler(async ({ data, context }) => {
    if (!data.title) throw new Error("title required");
    const target = data.toUserId || context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin as any;
    const { data: row, error } = await admin
      .from("notifications")
      .insert({
        user_id: target,
        actor_id: context.userId,
        kind: "sdk_notification",
        target_type: "game",
        target_id: data.gameId || null,
        payload: { title: data.title, body: data.body, gameId: data.gameId, ...data.payload, sdk: true },
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: String(row?.id ?? "") };
  });

/* ---------------------------------------------------------- Profile / Me */
export const sdkGetProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .inputValidator((i: { userId?: string } | undefined) => ({ userId: i?.userId?.toString() }))
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const target = data.userId || context.userId;
    const { data: p } = await sb
      .from("profiles")
      .select("id, username, avatar_url, level, coins, xp, country")
      .eq("id", target)
      .maybeSingle();
    if (!p) return null;
    return {
      userId: p.id,
      username: p.username ?? "",
      avatarUrl: p.avatar_url ?? null,
      level: p.level ?? 0,
      coins: p.coins ?? 0,
      xp: p.xp ?? 0,
      country: p.country ?? null,
    };
  });

/* ---------------------------------------------------------- CloudSave */
/**
 * game_saves persistence. All operations are scoped to the signed-in user
 * via RLS (auth.uid() = user_id). Versioning is monotonic per (user, game, slot):
 * every saveGame() bumps `version` by 1 so games can detect stale local copies.
 */
export const sdkSaveGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("cloudsave.write")])
  .inputValidator((i: { gameId: string; slot: string; data: unknown; expectedVersion?: number }) => ({
    gameId: (i.gameId ?? "").toString().slice(0, 80),
    slot: (i.slot ?? "default").toString().slice(0, 80),
    data: i.data ?? {},
    expectedVersion: typeof i.expectedVersion === "number" ? Math.max(0, Math.floor(i.expectedVersion)) : undefined,
  }))
  .handler(async ({ data, context }) => {
    if (!data.gameId) throw new Error("gameId required");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { data: existing } = await sb
      .from("game_saves")
      .select("id, version")
      .eq("user_id", context.userId)
      .eq("game_id", data.gameId)
      .eq("slot", data.slot)
      .maybeSingle();

    if (existing && typeof data.expectedVersion === "number" && existing.version !== data.expectedVersion) {
      throw new Error(`VERSION_CONFLICT: server=${existing.version} expected=${data.expectedVersion}`);
    }

    const nextVersion = (existing?.version ?? 0) + 1;
    const { data: row, error } = await sb
      .from("game_saves")
      .upsert(
        {
          user_id: context.userId,
          game_id: data.gameId,
          slot: data.slot,
          data: data.data,
          version: nextVersion,
        },
        { onConflict: "user_id,game_id,slot" }
      )
      .select("slot, data, version, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return { slot: row.slot, data: row.data, version: row.version, updatedAt: row.updated_at };
  });

export const sdkLoadGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("cloudsave.read")])
  .inputValidator((i: { gameId: string; slot: string }) => ({
    gameId: (i.gameId ?? "").toString().slice(0, 80),
    slot: (i.slot ?? "default").toString().slice(0, 80),
  }))
  .handler(async ({ data, context }) => {
    if (!data.gameId) throw new Error("gameId required");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { data: row } = await sb
      .from("game_saves")
      .select("slot, data, version, updated_at")
      .eq("user_id", context.userId)
      .eq("game_id", data.gameId)
      .eq("slot", data.slot)
      .maybeSingle();
    if (!row) return null;
    return { slot: row.slot, data: row.data, version: row.version, updatedAt: row.updated_at };
  });

export const sdkDeleteSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("cloudsave.write")])
  .inputValidator((i: { gameId: string; slot: string }) => ({
    gameId: (i.gameId ?? "").toString().slice(0, 80),
    slot: (i.slot ?? "default").toString().slice(0, 80),
  }))
  .handler(async ({ data, context }) => {
    if (!data.gameId) throw new Error("gameId required");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { error } = await sb
      .from("game_saves")
      .delete()
      .eq("user_id", context.userId)
      .eq("game_id", data.gameId)
      .eq("slot", data.slot);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sdkListSaves = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("cloudsave.read")])
  .inputValidator((i: { gameId: string }) => ({
    gameId: (i.gameId ?? "").toString().slice(0, 80),
  }))
  .handler(async ({ data, context }) => {
    if (!data.gameId) throw new Error("gameId required");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { data: rows, error } = await sb
      .from("game_saves")
      .select("slot, data, version, updated_at")
      .eq("user_id", context.userId)
      .eq("game_id", data.gameId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: { slot: string; data: unknown; version: number; updated_at: string }) => ({
      slot: r.slot, data: r.data, version: r.version, updatedAt: r.updated_at,
    }));
  });
