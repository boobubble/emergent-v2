/**
 * Economy server functions — earn, spend, and loyalty.
 *
 * All write paths funnel through the service-role admin client because the
 * `prevent_gamification_field_changes` trigger blocks client writes to
 * xp/coins/level/streak on `profiles`. Anti-farm is enforced server-side via
 * cooldowns + daily caps tracked in the existing `coin_transactions` ledger.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { EARN, SPEND, roomLoyaltyFor } from "./economy-config";

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// ──────────────────────────────────────────────────────────────────────────
// Internal helpers (server-only)
// ──────────────────────────────────────────────────────────────────────────

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

async function bumpProfile(userId: string, addXp: number, addCoins: number) {
  if (addXp === 0 && addCoins === 0) return;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("xp, coins")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return;
  const newXp = Math.max(0, (data.xp ?? 0) + addXp);
  const newCoins = Math.max(0, (data.coins ?? 0) + addCoins);
  const newLevel = Math.max(1, Math.floor(newXp / 50) + 1);
  await supabaseAdmin
    .from("profiles")
    .update({ xp: newXp, coins: newCoins, level: newLevel })
    .eq("id", userId);
}

async function logTx(
  userId: string,
  kind: "coins" | "xp" | "xp_award",
  amount: number,
  reason: string,
  refType?: string,
  refId?: string,
) {
  await (await getSupabaseAdmin()).from("coin_transactions").insert({
    user_id: userId,
    kind,
    amount,
    reason,
    ref_type: refType ?? null,
    ref_id: refId ?? null,
  } as never);
}

/** How many transactions today for (user, reason) — used for daily caps. */
async function countToday(userId: string, reason: string, refId?: string) {
  const start = todayUtc() + "T00:00:00Z";
  let q = supabaseAdmin
    .from("coin_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("reason", reason)
    .gte("created_at", start);
  if (refId) q = q.eq("ref_id", refId);
  const { count } = await q;
  return count ?? 0;
}

/** Last tx timestamp for a (user, reason) — used for cooldowns. */
async function lastTxAt(userId: string, reason: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from("coin_transactions")
    .select("created_at")
    .eq("user_id", userId)
    .eq("reason", reason)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? new Date(data.created_at).getTime() : 0;
}

async function bumpMissionProgress(userId: string, missionId: string, by = 1) {
  const day = todayUtc();
  const { data: row } = await supabaseAdmin
    .from("daily_missions")
    .select("id, progress")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();
  if (!row) {
    await (await getSupabaseAdmin()).from("daily_missions").insert({
      user_id: userId,
      day,
      progress: { [missionId]: by },
      claimed: [],
    } as never);
    return;
  }
  const prog = (row.progress as Record<string, number>) ?? {};
  prog[missionId] = (prog[missionId] ?? 0) + by;
  await supabaseAdmin
    .from("daily_missions")
    .update({ progress: prog, updated_at: new Date().toISOString() })
    .eq("id", row.id);
}

async function bumpRoomLoyalty(userId: string, channelId: string) {
  const today = todayUtc();
  const weekStart = (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d.toISOString().slice(0, 10);
  })();

  const { data: row } = await supabaseAdmin
    .from("room_loyalty")
    .select("*")
    .eq("user_id", userId)
    .eq("channel_id", channelId)
    .maybeSingle();

  if (!row) {
    await (await getSupabaseAdmin()).from("room_loyalty").insert({
      user_id: userId,
      channel_id: channelId,
      streak_days: 1,
      last_active_day: today,
      total_messages: 1,
      weekly_messages: 1,
      week_start: weekStart,
      loyalty_level: 1,
    } as never);
    return;
  }

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const nextStreak =
    row.last_active_day === today
      ? row.streak_days
      : row.last_active_day === yesterday
        ? (row.streak_days ?? 0) + 1
        : 1;
  const total = (row.total_messages ?? 0) + 1;
  const weekly =
    row.week_start === weekStart ? (row.weekly_messages ?? 0) + 1 : 1;
  const level = roomLoyaltyFor(total).level;

  await supabaseAdmin
    .from("room_loyalty")
    .update({
      streak_days: nextStreak,
      last_active_day: today,
      total_messages: total,
      weekly_messages: weekly,
      week_start: weekStart,
      loyalty_level: level,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
}

// ──────────────────────────────────────────────────────────────────────────
// EARN
// ──────────────────────────────────────────────────────────────────────────

/** Called from chat input on every successful message send. */
export const earnChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        channelId: z.string().min(1).max(120),
        isReply: z.boolean().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const cfg = data.isReply ? EARN.chat_reply : EARN.chat_message;
    const reason = data.isReply ? "chat_reply" : "chat_message";

    // Cooldown
    const last = await lastTxAt(userId, reason);
    if (Date.now() - last < cfg.cooldownMs) {
      // Still bump loyalty & mission progress even if no reward — engagement counts.
      await bumpRoomLoyalty(userId, data.channelId);
      await bumpMissionProgress(userId, "chat_10");
      return { rewarded: false, capped: false };
    }
    // Daily cap
    const todayCount = await countToday(userId, reason);
    if (todayCount >= cfg.dailyCap) {
      await bumpRoomLoyalty(userId, data.channelId);
      await bumpMissionProgress(userId, "chat_10");
      return { rewarded: false, capped: true };
    }

    await bumpProfile(userId, cfg.xp, cfg.coins);
    await logTx(userId, "coins", cfg.coins, reason, "channel", data.channelId);
    await bumpRoomLoyalty(userId, data.channelId);
    await bumpMissionProgress(userId, "chat_10");

    return { rewarded: true, coins: cfg.coins, xp: cfg.xp };
  });

/**
 * Fetch a post's canonical owner_id from the DB. Never trust a client-supplied
 * ownerId — otherwise anyone can arbitrarily credit XP/coins to any user by
 * calling earn* with a fabricated (postId, ownerId) pair.
 */
async function fetchPostOwner(postId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("posts")
    .select("owner_id")
    .eq("id", postId)
    .maybeSingle();
  return (data?.owner_id as string | null | undefined) ?? null;
}

/** Called when a user reacts to a post. Rewards both actor and post owner. */
export const earnFeedReaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ postId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Actor reward
    const actorCount = await countToday(userId, "feed_reaction_actor");
    if (actorCount < EARN.feed_reaction_actor.dailyCap) {
      await bumpProfile(userId, EARN.feed_reaction_actor.xp, EARN.feed_reaction_actor.coins);
      await logTx(userId, "xp_award", EARN.feed_reaction_actor.xp, "feed_reaction_actor", "post", data.postId);
    }
    await bumpMissionProgress(userId, "react_5");

    // Owner reward — resolve owner server-side; skip self-reactions and anon posts
    const ownerId = await fetchPostOwner(data.postId);
    if (ownerId && ownerId !== userId) {
      const ownerCount = await countToday(ownerId, "feed_reaction_owner", data.postId);
      if (ownerCount < EARN.feed_reaction_owner.dailyCapPerPost) {
        await bumpProfile(ownerId, EARN.feed_reaction_owner.xp, EARN.feed_reaction_owner.coins);
        await logTx(ownerId, "coins", EARN.feed_reaction_owner.coins, "feed_reaction_owner", "post", data.postId);
        await bumpMissionProgress(ownerId, "engage_15");
      }
    }
    return { ok: true };
  });

/** Called when a user comments on a post. Rewards actor + owner. */
export const earnFeedComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ postId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const actorCount = await countToday(userId, "feed_comment_actor");
    if (actorCount < EARN.feed_comment_actor.dailyCap) {
      await bumpProfile(userId, EARN.feed_comment_actor.xp, EARN.feed_comment_actor.coins);
      await logTx(userId, "coins", EARN.feed_comment_actor.coins, "feed_comment_actor", "post", data.postId);
    }
    await bumpMissionProgress(userId, "comment_3");

    const ownerId = await fetchPostOwner(data.postId);
    if (ownerId && ownerId !== userId) {
      const ownerCount = await countToday(ownerId, "feed_comment_owner", data.postId);
      if (ownerCount < EARN.feed_comment_owner.dailyCapPerPost) {
        await bumpProfile(ownerId, EARN.feed_comment_owner.xp, EARN.feed_comment_owner.coins);
        await logTx(ownerId, "coins", EARN.feed_comment_owner.coins, "feed_comment_owner", "post", data.postId);
        await bumpMissionProgress(ownerId, "engage_15");
      }
    }
    return { ok: true };
  });

/** Called when a user shares a post. Rewards owner. */
export const earnFeedShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ postId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const ownerId = await fetchPostOwner(data.postId);
    if (ownerId && ownerId !== userId) {
      const ownerCount = await countToday(ownerId, "feed_share_owner", data.postId);
      if (ownerCount < EARN.feed_share_owner.dailyCapPerPost) {
        await bumpProfile(ownerId, EARN.feed_share_owner.xp, EARN.feed_share_owner.coins);
        await logTx(ownerId, "coins", EARN.feed_share_owner.coins, "feed_share_owner", "post", data.postId);
      }
    }
    return { ok: true };
  });

/** Called once when a user creates a post. */
export const earnFeedPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    await bumpMissionProgress(userId, "post_1");
    return { ok: true };
  });

// ──────────────────────────────────────────────────────────────────────────
// SPEND
// ──────────────────────────────────────────────────────────────────────────

/** Buy a 1-hour highlight on any chat message. */
export const highlightMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ messageId: z.string().uuid(), channelId: z.string().min(1).max(120) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const cost = SPEND.highlight_message.coins;

    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .maybeSingle();
    if (!prof) throw new Error("Profile not found");
    if ((prof.coins ?? 0) < cost) throw new Error("Not enough coins");

    await bumpProfile(userId, 0, -cost);
    await logTx(userId, "coins", -cost, "highlight_message", "message", data.messageId);

    const expiresAt = new Date(Date.now() + SPEND.highlight_message.durationMs).toISOString();
    const { error } = await (await getSupabaseAdmin()).from("message_highlights").insert({
      message_id: data.messageId,
      channel_id: data.channelId,
      buyer_id: userId,
      expires_at: expiresAt,
    } as never);
    if (error) throw new Error(error.message);

    return { ok: true, expiresAt, newBalance: (prof.coins ?? 0) - cost };
  });

/** Boost a post — adds to its trending_score. */
export const boostPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ postId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const cost = SPEND.boost_post.coins;

    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .maybeSingle();
    if (!prof) throw new Error("Profile not found");
    if ((prof.coins ?? 0) < cost) throw new Error("Not enough coins");

    const { data: post } = await supabaseAdmin
      .from("posts")
      .select("id, trending_score")
      .eq("id", data.postId)
      .maybeSingle();
    if (!post) throw new Error("Post not found");

    await bumpProfile(userId, 0, -cost);
    await logTx(userId, "coins", -cost, "boost_post", "post", data.postId);

    await supabaseAdmin
      .from("posts")
      .update({ trending_score: (post.trending_score ?? 0) + SPEND.boost_post.scoreDelta })
      .eq("id", data.postId);

    await (await getSupabaseAdmin()).from("post_boosts").insert({
      post_id: data.postId,
      booster_id: userId,
      coins_spent: cost,
      score_delta: SPEND.boost_post.scoreDelta,
    } as never);

    return { ok: true, newBalance: (prof.coins ?? 0) - cost };
  });

// ──────────────────────────────────────────────────────────────────────────
// READ
// ──────────────────────────────────────────────────────────────────────────

/** Get my room loyalty stats for a single channel. */
export const getMyRoomLoyalty = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ channelId: z.string().min(1).max(120) }).parse(i))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: row } = await supabaseAdmin
      .from("room_loyalty")
      .select("streak_days, total_messages, weekly_messages, loyalty_level")
      .eq("user_id", userId)
      .eq("channel_id", data.channelId)
      .maybeSingle();
    return row ?? { streak_days: 0, total_messages: 0, weekly_messages: 0, loyalty_level: 1 };
  });

/** Top loyal members of a room (by weekly_messages). */
export const getRoomTopLoyalty = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ channelId: z.string().min(1).max(120) }).parse(i))
  .handler(async ({ data }) => {
    const { data: rows } = await supabaseAdmin
      .from("room_loyalty")
      .select("user_id, weekly_messages, total_messages, loyalty_level, streak_days")
      .eq("channel_id", data.channelId)
      .order("weekly_messages", { ascending: false })
      .limit(10);
    return { rows: rows ?? [] };
  });
