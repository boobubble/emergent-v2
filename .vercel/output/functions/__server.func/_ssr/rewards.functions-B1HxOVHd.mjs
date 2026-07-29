import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { S as SHOP_BY_ID } from "./shop-catalog-QoXq-K4P.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, b as booleanType } from "../_libs/zod.mjs";
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
const DAILY_CHEST = {
  1: 20,
  2: 25,
  3: 30,
  4: 40,
  5: 50,
  6: 75,
  7: 150
};
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
const claimDailyChest_createServerFn_handler = createServerRpc({
  id: "75be98476f5a15b9c85900ef344d767dbcdc7235d0ed0467740c42117014864c",
  name: "claimDailyChest",
  filename: "src/lib/rewards.functions.ts"
}, (opts) => claimDailyChest.__executeServer(opts));
const claimDailyChest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(claimDailyChest_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const today = todayUtc();
  const {
    data: existing
  } = await supabaseAdmin.from("coin_transactions").select("id").eq("user_id", userId).eq("reason", "daily_chest").gte("created_at", today + "T00:00:00Z").maybeSingle();
  if (existing) return {
    alreadyClaimed: true,
    coins: 0,
    streak: 0
  };
  const {
    data: p
  } = await supabaseAdmin.from("profiles").select("last_active_day, streak, longest_streak").eq("id", userId).maybeSingle();
  if (!p) throw new Error("Profile not found");
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const nextStreak = p.last_active_day === today ? Math.max(1, p.streak ?? 1) : p.last_active_day === yesterday ? (p.streak ?? 0) + 1 : 1;
  const longest = Math.max(p.longest_streak ?? 0, nextStreak);
  await supabaseAdmin.from("profiles").update({
    last_active_day: today,
    streak: nextStreak,
    longest_streak: longest
  }).eq("id", userId);
  const dayInCycle = (nextStreak - 1) % 7 + 1;
  const coins = DAILY_CHEST[dayInCycle] ?? 20;
  await bumpProfile(userId, 0, coins);
  await logTx(userId, "coins", coins, "daily_chest", "day", String(dayInCycle));
  return {
    alreadyClaimed: false,
    coins,
    streak: nextStreak,
    dayInCycle
  };
});
const spinDailyWheel_createServerFn_handler = createServerRpc({
  id: "ff8c0a61a79b57da390792cc6660261c99b5e4cd5a9f3c3886b728415befe6b0",
  name: "spinDailyWheel",
  filename: "src/lib/rewards.functions.ts"
}, (opts) => spinDailyWheel.__executeServer(opts));
const spinDailyWheel = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(spinDailyWheel_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const today = todayUtc();
  const {
    data: existing
  } = await supabaseAdmin.from("coin_transactions").select("id, amount, kind, ref_id").eq("user_id", userId).eq("reason", "daily_spin").gte("created_at", today + "T00:00:00Z").maybeSingle();
  if (existing) {
    return {
      alreadyClaimed: true,
      kind: existing.kind,
      amount: existing.amount,
      prizeIndex: Number(existing.ref_id ?? 0)
    };
  }
  const PRIZES = [{
    kind: "coins",
    amount: 10,
    weight: 35,
    label: "+10 🪙"
  }, {
    kind: "coins",
    amount: 20,
    weight: 25,
    label: "+20 🪙"
  }, {
    kind: "xp",
    amount: 25,
    weight: 18,
    label: "+25 ⭐"
  }, {
    kind: "coins",
    amount: 50,
    weight: 12,
    label: "+50 🪙"
  }, {
    kind: "xp",
    amount: 50,
    weight: 7,
    label: "+50 ⭐"
  }, {
    kind: "coins",
    amount: 100,
    weight: 3,
    label: "+100 🪙"
  }];
  const total = PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  let idx = 0;
  for (let i = 0; i < PRIZES.length; i++) {
    r -= PRIZES[i].weight;
    if (r <= 0) {
      idx = i;
      break;
    }
  }
  const prize = PRIZES[idx];
  if (prize.kind === "coins") await bumpProfile(userId, 0, prize.amount);
  else await bumpProfile(userId, prize.amount, 0);
  await logTx(userId, prize.kind, prize.amount, "daily_spin", "spin", String(idx));
  return {
    alreadyClaimed: false,
    kind: prize.kind,
    amount: prize.amount,
    prizeIndex: idx
  };
});
const purchaseItem_createServerFn_handler = createServerRpc({
  id: "8ac424ccc9d808484383b3255b22d8048f590c3d04360feb619a098f21ca5797",
  name: "purchaseItem",
  filename: "src/lib/rewards.functions.ts"
}, (opts) => purchaseItem.__executeServer(opts));
const purchaseItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((input) => objectType({
  itemId: stringType().min(1).max(64)
}).parse(input)).handler(purchaseItem_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const item = SHOP_BY_ID[data.itemId];
  if (!item) throw new Error("Item not found");
  const {
    data: owned
  } = await supabaseAdmin.from("user_inventory").select("id").eq("user_id", userId).eq("item_id", item.id).maybeSingle();
  if (owned) throw new Error("You already own this item");
  const {
    data: prof
  } = await supabaseAdmin.from("profiles").select("coins").eq("id", userId).maybeSingle();
  if (!prof) throw new Error("Profile not found");
  if ((prof.coins ?? 0) < item.price) throw new Error("Not enough coins");
  await bumpProfile(userId, 0, -item.price);
  await logTx(userId, "coins", -item.price, "shop_purchase", "item", item.id);
  const {
    error: invErr
  } = await (await getSupabaseAdmin()).from("user_inventory").insert({
    user_id: userId,
    item_id: item.id,
    category: item.category,
    equipped: false
  });
  if (invErr) throw new Error(invErr.message);
  return {
    ok: true,
    newBalance: (prof.coins ?? 0) - item.price
  };
});
const equipItem_createServerFn_handler = createServerRpc({
  id: "848635f84ea945f35ddd5771617eb8a575fae22dda679ce074c0780bddfa010a",
  name: "equipItem",
  filename: "src/lib/rewards.functions.ts"
}, (opts) => equipItem.__executeServer(opts));
const equipItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((input) => objectType({
  itemId: stringType().min(1).max(64),
  equipped: booleanType()
}).parse(input)).handler(equipItem_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const item = SHOP_BY_ID[data.itemId];
  if (!item) throw new Error("Item not found");
  const {
    data: row
  } = await supabaseAdmin.from("user_inventory").select("id, category").eq("user_id", userId).eq("item_id", item.id).maybeSingle();
  if (!row) throw new Error("You don't own this item");
  if (data.equipped) {
    await supabaseAdmin.from("user_inventory").update({
      equipped: false
    }).eq("user_id", userId).eq("category", item.category);
  }
  await supabaseAdmin.from("user_inventory").update({
    equipped: data.equipped
  }).eq("id", row.id);
  return {
    ok: true
  };
});
const getMyInventory_createServerFn_handler = createServerRpc({
  id: "cc3ece2778f4bb9208b42026bb7c23871455866df85978a3afd4260571d6ec8d",
  name: "getMyInventory",
  filename: "src/lib/rewards.functions.ts"
}, (opts) => getMyInventory.__executeServer(opts));
const getMyInventory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(getMyInventory_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const [invRes, profRes] = await Promise.all([(await getSupabaseAdmin()).from("user_inventory").select("item_id, category, equipped, acquired_at").eq("user_id", userId), (await getSupabaseAdmin()).from("profiles").select("coins, xp, level, streak, longest_streak").eq("id", userId).maybeSingle()]);
  return {
    inventory: invRes.data ?? [],
    profile: profRes.data ?? null
  };
});
const getMyTransactions_createServerFn_handler = createServerRpc({
  id: "af6ac5a99c58f0d8f2abf76e141f0507315a5bf310a1a5dc8d5855b2df7891f3",
  name: "getMyTransactions",
  filename: "src/lib/rewards.functions.ts"
}, (opts) => getMyTransactions.__executeServer(opts));
const getMyTransactions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(getMyTransactions_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const {
    data
  } = await supabaseAdmin.from("coin_transactions").select("id, kind, amount, reason, ref_type, ref_id, created_at").eq("user_id", userId).order("created_at", {
    ascending: false
  }).limit(30);
  return {
    transactions: data ?? []
  };
});
export {
  claimDailyChest_createServerFn_handler,
  equipItem_createServerFn_handler,
  getMyInventory_createServerFn_handler,
  getMyTransactions_createServerFn_handler,
  purchaseItem_createServerFn_handler,
  spinDailyWheel_createServerFn_handler
};
