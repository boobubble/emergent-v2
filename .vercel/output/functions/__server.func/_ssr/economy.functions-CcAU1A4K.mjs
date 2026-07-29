import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { E as EARN, S as SPEND, r as roomLoyaltyFor } from "./economy-config-CPZpIbo-.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, b as booleanType, s as stringType } from "../_libs/zod.mjs";
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
async function getSupabaseAdmin() {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin2;
}
function todayUtc() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
async function bumpProfile(userId, addXp, addCoins) {
  if (addXp === 0 && addCoins === 0) return;
  const {
    data
  } = await supabaseAdmin.from("profiles").select("xp, coins").eq("id", userId).maybeSingle();
  if (!data) return;
  const newXp = Math.max(0, (data.xp ?? 0) + addXp);
  const newCoins = Math.max(0, (data.coins ?? 0) + addCoins);
  const newLevel = Math.max(1, Math.floor(newXp / 50) + 1);
  await supabaseAdmin.from("profiles").update({
    xp: newXp,
    coins: newCoins,
    level: newLevel
  }).eq("id", userId);
}
async function logTx(userId, kind, amount, reason, refType, refId) {
  await (await getSupabaseAdmin()).from("coin_transactions").insert({
    user_id: userId,
    kind,
    amount,
    reason,
    ref_type: refType ?? null,
    ref_id: refId ?? null
  });
}
async function countToday(userId, reason, refId) {
  const start = todayUtc() + "T00:00:00Z";
  let q = supabaseAdmin.from("coin_transactions").select("id", {
    count: "exact",
    head: true
  }).eq("user_id", userId).eq("reason", reason).gte("created_at", start);
  if (refId) q = q.eq("ref_id", refId);
  const {
    count
  } = await q;
  return count ?? 0;
}
async function lastTxAt(userId, reason) {
  const {
    data
  } = await supabaseAdmin.from("coin_transactions").select("created_at").eq("user_id", userId).eq("reason", reason).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  return data ? new Date(data.created_at).getTime() : 0;
}
async function bumpMissionProgress(userId, missionId, by = 1) {
  const day = todayUtc();
  const {
    data: row
  } = await supabaseAdmin.from("daily_missions").select("id, progress").eq("user_id", userId).eq("day", day).maybeSingle();
  if (!row) {
    await (await getSupabaseAdmin()).from("daily_missions").insert({
      user_id: userId,
      day,
      progress: {
        [missionId]: by
      },
      claimed: []
    });
    return;
  }
  const prog = row.progress ?? {};
  prog[missionId] = (prog[missionId] ?? 0) + by;
  await supabaseAdmin.from("daily_missions").update({
    progress: prog,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", row.id);
}
async function bumpRoomLoyalty(userId, channelId) {
  const today = todayUtc();
  const weekStart = (() => {
    const d = /* @__PURE__ */ new Date();
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d.toISOString().slice(0, 10);
  })();
  const {
    data: row
  } = await supabaseAdmin.from("room_loyalty").select("*").eq("user_id", userId).eq("channel_id", channelId).maybeSingle();
  if (!row) {
    await (await getSupabaseAdmin()).from("room_loyalty").insert({
      user_id: userId,
      channel_id: channelId,
      streak_days: 1,
      last_active_day: today,
      total_messages: 1,
      weekly_messages: 1,
      week_start: weekStart,
      loyalty_level: 1
    });
    return;
  }
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const nextStreak = row.last_active_day === today ? row.streak_days : row.last_active_day === yesterday ? (row.streak_days ?? 0) + 1 : 1;
  const total = (row.total_messages ?? 0) + 1;
  const weekly = row.week_start === weekStart ? (row.weekly_messages ?? 0) + 1 : 1;
  const level = roomLoyaltyFor(total).level;
  await supabaseAdmin.from("room_loyalty").update({
    streak_days: nextStreak,
    last_active_day: today,
    total_messages: total,
    weekly_messages: weekly,
    week_start: weekStart,
    loyalty_level: level,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", row.id);
}
const earnChatMessage_createServerFn_handler = createServerRpc({
  id: "a639e45b91383ff82bab3881df24afaa98bc9560ff474732891930ab4107ee1b",
  name: "earnChatMessage",
  filename: "src/lib/economy.functions.ts"
}, (opts) => earnChatMessage.__executeServer(opts));
const earnChatMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  channelId: stringType().min(1).max(120),
  isReply: booleanType().optional()
}).parse(i)).handler(earnChatMessage_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const cfg = data.isReply ? EARN.chat_reply : EARN.chat_message;
  const reason = data.isReply ? "chat_reply" : "chat_message";
  const last = await lastTxAt(userId, reason);
  if (Date.now() - last < cfg.cooldownMs) {
    await bumpRoomLoyalty(userId, data.channelId);
    await bumpMissionProgress(userId, "chat_10");
    return {
      rewarded: false,
      capped: false
    };
  }
  const todayCount = await countToday(userId, reason);
  if (todayCount >= cfg.dailyCap) {
    await bumpRoomLoyalty(userId, data.channelId);
    await bumpMissionProgress(userId, "chat_10");
    return {
      rewarded: false,
      capped: true
    };
  }
  await bumpProfile(userId, cfg.xp, cfg.coins);
  await logTx(userId, "coins", cfg.coins, reason, "channel", data.channelId);
  await bumpRoomLoyalty(userId, data.channelId);
  await bumpMissionProgress(userId, "chat_10");
  return {
    rewarded: true,
    coins: cfg.coins,
    xp: cfg.xp
  };
});
async function fetchPostOwner(postId) {
  const {
    data
  } = await supabaseAdmin.from("posts").select("owner_id").eq("id", postId).maybeSingle();
  return data?.owner_id ?? null;
}
const earnFeedReaction_createServerFn_handler = createServerRpc({
  id: "abe1c0279ef5da0d6f6138d08181e1422ea8727e3292f80a1c803e22a441811a",
  name: "earnFeedReaction",
  filename: "src/lib/economy.functions.ts"
}, (opts) => earnFeedReaction.__executeServer(opts));
const earnFeedReaction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  postId: stringType().uuid()
}).parse(i)).handler(earnFeedReaction_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const actorCount = await countToday(userId, "feed_reaction_actor");
  if (actorCount < EARN.feed_reaction_actor.dailyCap) {
    await bumpProfile(userId, EARN.feed_reaction_actor.xp, EARN.feed_reaction_actor.coins);
    await logTx(userId, "xp_award", EARN.feed_reaction_actor.xp, "feed_reaction_actor", "post", data.postId);
  }
  await bumpMissionProgress(userId, "react_5");
  const ownerId = await fetchPostOwner(data.postId);
  if (ownerId && ownerId !== userId) {
    const ownerCount = await countToday(ownerId, "feed_reaction_owner", data.postId);
    if (ownerCount < EARN.feed_reaction_owner.dailyCapPerPost) {
      await bumpProfile(ownerId, EARN.feed_reaction_owner.xp, EARN.feed_reaction_owner.coins);
      await logTx(ownerId, "coins", EARN.feed_reaction_owner.coins, "feed_reaction_owner", "post", data.postId);
      await bumpMissionProgress(ownerId, "engage_15");
    }
  }
  return {
    ok: true
  };
});
const earnFeedComment_createServerFn_handler = createServerRpc({
  id: "9f18232bbb08b775b60b953dfc2447877f4f8d9d3f173936d3847606b4ce9fbd",
  name: "earnFeedComment",
  filename: "src/lib/economy.functions.ts"
}, (opts) => earnFeedComment.__executeServer(opts));
const earnFeedComment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  postId: stringType().uuid()
}).parse(i)).handler(earnFeedComment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
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
  return {
    ok: true
  };
});
const earnFeedShare_createServerFn_handler = createServerRpc({
  id: "d893da156a04cbdd607e7ad3e4eaa543fd0c0accceed7c33c4b2b206399cda9e",
  name: "earnFeedShare",
  filename: "src/lib/economy.functions.ts"
}, (opts) => earnFeedShare.__executeServer(opts));
const earnFeedShare = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  postId: stringType().uuid()
}).parse(i)).handler(earnFeedShare_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const ownerId = await fetchPostOwner(data.postId);
  if (ownerId && ownerId !== userId) {
    const ownerCount = await countToday(ownerId, "feed_share_owner", data.postId);
    if (ownerCount < EARN.feed_share_owner.dailyCapPerPost) {
      await bumpProfile(ownerId, EARN.feed_share_owner.xp, EARN.feed_share_owner.coins);
      await logTx(ownerId, "coins", EARN.feed_share_owner.coins, "feed_share_owner", "post", data.postId);
    }
  }
  return {
    ok: true
  };
});
const earnFeedPost_createServerFn_handler = createServerRpc({
  id: "10c9d440792118c2a76226f18a20bd067aec0eecdb6a7f8a6d9aee4555d82332",
  name: "earnFeedPost",
  filename: "src/lib/economy.functions.ts"
}, (opts) => earnFeedPost.__executeServer(opts));
const earnFeedPost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(earnFeedPost_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  await bumpMissionProgress(userId, "post_1");
  return {
    ok: true
  };
});
const highlightMessage_createServerFn_handler = createServerRpc({
  id: "b48b26c01f41999b9aa90fdc2f40daa68da72f6a3387726cac6a96d04dce00a6",
  name: "highlightMessage",
  filename: "src/lib/economy.functions.ts"
}, (opts) => highlightMessage.__executeServer(opts));
const highlightMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  messageId: stringType().uuid(),
  channelId: stringType().min(1).max(120)
}).parse(i)).handler(highlightMessage_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const cost = SPEND.highlight_message.coins;
  const {
    data: prof
  } = await supabaseAdmin.from("profiles").select("coins").eq("id", userId).maybeSingle();
  if (!prof) throw new Error("Profile not found");
  if ((prof.coins ?? 0) < cost) throw new Error("Not enough coins");
  await bumpProfile(userId, 0, -cost);
  await logTx(userId, "coins", -cost, "highlight_message", "message", data.messageId);
  const expiresAt = new Date(Date.now() + SPEND.highlight_message.durationMs).toISOString();
  const {
    error
  } = await (await getSupabaseAdmin()).from("message_highlights").insert({
    message_id: data.messageId,
    channel_id: data.channelId,
    buyer_id: userId,
    expires_at: expiresAt
  });
  if (error) throw new Error(error.message);
  return {
    ok: true,
    expiresAt,
    newBalance: (prof.coins ?? 0) - cost
  };
});
const boostPost_createServerFn_handler = createServerRpc({
  id: "710e1e17447cff94ba27cfaade62b404fef584bf40546cc989032b0e4376eba7",
  name: "boostPost",
  filename: "src/lib/economy.functions.ts"
}, (opts) => boostPost.__executeServer(opts));
const boostPost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  postId: stringType().uuid()
}).parse(i)).handler(boostPost_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const cost = SPEND.boost_post.coins;
  const {
    data: prof
  } = await supabaseAdmin.from("profiles").select("coins").eq("id", userId).maybeSingle();
  if (!prof) throw new Error("Profile not found");
  if ((prof.coins ?? 0) < cost) throw new Error("Not enough coins");
  const {
    data: post
  } = await supabaseAdmin.from("posts").select("id, trending_score").eq("id", data.postId).maybeSingle();
  if (!post) throw new Error("Post not found");
  await bumpProfile(userId, 0, -cost);
  await logTx(userId, "coins", -cost, "boost_post", "post", data.postId);
  await supabaseAdmin.from("posts").update({
    trending_score: (post.trending_score ?? 0) + SPEND.boost_post.scoreDelta
  }).eq("id", data.postId);
  await (await getSupabaseAdmin()).from("post_boosts").insert({
    post_id: data.postId,
    booster_id: userId,
    coins_spent: cost,
    score_delta: SPEND.boost_post.scoreDelta
  });
  return {
    ok: true,
    newBalance: (prof.coins ?? 0) - cost
  };
});
const getMyRoomLoyalty_createServerFn_handler = createServerRpc({
  id: "88abf8b0cbf398ce2f72bca43ef88be7b00ae226cbf629c91438b77abebc73c6",
  name: "getMyRoomLoyalty",
  filename: "src/lib/economy.functions.ts"
}, (opts) => getMyRoomLoyalty.__executeServer(opts));
const getMyRoomLoyalty = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  channelId: stringType().min(1).max(120)
}).parse(i)).handler(getMyRoomLoyalty_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const {
    data: row
  } = await supabaseAdmin.from("room_loyalty").select("streak_days, total_messages, weekly_messages, loyalty_level").eq("user_id", userId).eq("channel_id", data.channelId).maybeSingle();
  return row ?? {
    streak_days: 0,
    total_messages: 0,
    weekly_messages: 0,
    loyalty_level: 1
  };
});
const getRoomTopLoyalty_createServerFn_handler = createServerRpc({
  id: "5395365cd47eae723ca6c7a5c890ba53011c3b0c44191c682428a56efb4954f0",
  name: "getRoomTopLoyalty",
  filename: "src/lib/economy.functions.ts"
}, (opts) => getRoomTopLoyalty.__executeServer(opts));
const getRoomTopLoyalty = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  channelId: stringType().min(1).max(120)
}).parse(i)).handler(getRoomTopLoyalty_createServerFn_handler, async ({
  data
}) => {
  const {
    data: rows
  } = await supabaseAdmin.from("room_loyalty").select("user_id, weekly_messages, total_messages, loyalty_level, streak_days").eq("channel_id", data.channelId).order("weekly_messages", {
    ascending: false
  }).limit(10);
  return {
    rows: rows ?? []
  };
});
export {
  boostPost_createServerFn_handler,
  earnChatMessage_createServerFn_handler,
  earnFeedComment_createServerFn_handler,
  earnFeedPost_createServerFn_handler,
  earnFeedReaction_createServerFn_handler,
  earnFeedShare_createServerFn_handler,
  getMyRoomLoyalty_createServerFn_handler,
  getRoomTopLoyalty_createServerFn_handler,
  highlightMessage_createServerFn_handler
};
