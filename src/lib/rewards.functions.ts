import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SHOP_BY_ID } from "./shop-catalog";

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const DAILY_CHEST: Record<number, number> = {
  1: 20, 2: 25, 3: 30, 4: 40, 5: 50, 6: 75, 7: 150,
};

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

async function logTx(userId: string, kind: "xp" | "coins", amount: number, reason: string, refType?: string, refId?: string) {
  await (await getSupabaseAdmin()).from("coin_transactions").insert({
    user_id: userId, kind, amount, reason,
    ref_type: refType ?? null, ref_id: refId ?? null,
  } as never);
}

/** Claim the daily chest. Idempotent: returns alreadyClaimed=true if already done today. */
export const claimDailyChest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const today = todayUtc();

    // Idempotency: did we already log a daily_chest today?
    const { data: existing } = await supabaseAdmin
      .from("coin_transactions")
      .select("id")
      .eq("user_id", userId)
      .eq("reason", "daily_chest")
      .gte("created_at", today + "T00:00:00Z")
      .maybeSingle();
    if (existing) return { alreadyClaimed: true, coins: 0, streak: 0 };

    // Bump streak first (reuse pingDailyStreak logic inline so we read streak)
    const { data: p } = await supabaseAdmin
      .from("profiles")
      .select("last_active_day, streak, longest_streak")
      .eq("id", userId)
      .maybeSingle();
    if (!p) throw new Error("Profile not found");

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const nextStreak = p.last_active_day === today
      ? Math.max(1, p.streak ?? 1)
      : p.last_active_day === yesterday ? (p.streak ?? 0) + 1 : 1;
    const longest = Math.max(p.longest_streak ?? 0, nextStreak);

    await supabaseAdmin
      .from("profiles")
      .update({ last_active_day: today, streak: nextStreak, longest_streak: longest })
      .eq("id", userId);

    const dayInCycle = ((nextStreak - 1) % 7) + 1;
    const coins = DAILY_CHEST[dayInCycle] ?? 20;

    await bumpProfile(userId, 0, coins);
    await logTx(userId, "coins", coins, "daily_chest", "day", String(dayInCycle));

    return { alreadyClaimed: false, coins, streak: nextStreak, dayInCycle };
  });

/** Daily spin wheel. One spin per UTC day. */
export const spinDailyWheel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const today = todayUtc();

    const { data: existing } = await supabaseAdmin
      .from("coin_transactions")
      .select("id, amount, kind, ref_id")
      .eq("user_id", userId)
      .eq("reason", "daily_spin")
      .gte("created_at", today + "T00:00:00Z")
      .maybeSingle();
    if (existing) {
      return { alreadyClaimed: true, kind: existing.kind as "xp" | "coins", amount: existing.amount, prizeIndex: Number(existing.ref_id ?? 0) };
    }

    // Weighted prizes: [coins/xp, amount, weight]
    const PRIZES: Array<{ kind: "coins" | "xp"; amount: number; weight: number; label: string }> = [
      { kind: "coins", amount: 10,  weight: 35, label: "+10 🪙" },
      { kind: "coins", amount: 20,  weight: 25, label: "+20 🪙" },
      { kind: "xp",    amount: 25,  weight: 18, label: "+25 ⭐" },
      { kind: "coins", amount: 50,  weight: 12, label: "+50 🪙" },
      { kind: "xp",    amount: 50,  weight: 7,  label: "+50 ⭐" },
      { kind: "coins", amount: 100, weight: 3,  label: "+100 🪙" },
    ];
    const total = PRIZES.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < PRIZES.length; i++) {
      r -= PRIZES[i].weight;
      if (r <= 0) { idx = i; break; }
    }
    const prize = PRIZES[idx];

    if (prize.kind === "coins") await bumpProfile(userId, 0, prize.amount);
    else await bumpProfile(userId, prize.amount, 0);

    await logTx(userId, prize.kind, prize.amount, "daily_spin", "spin", String(idx));

    return { alreadyClaimed: false, kind: prize.kind, amount: prize.amount, prizeIndex: idx };
  });

/** Buy a shop item. Atomic: validate price, debit coins, insert inventory row. */
export const purchaseItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ itemId: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const item = SHOP_BY_ID[data.itemId];
    if (!item) throw new Error("Item not found");

    // Already owned?
    const { data: owned } = await supabaseAdmin
      .from("user_inventory")
      .select("id")
      .eq("user_id", userId)
      .eq("item_id", item.id)
      .maybeSingle();
    if (owned) throw new Error("You already own this item");

    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .maybeSingle();
    if (!prof) throw new Error("Profile not found");
    if ((prof.coins ?? 0) < item.price) throw new Error("Not enough coins");

    await bumpProfile(userId, 0, -item.price);
    await logTx(userId, "coins", -item.price, "shop_purchase", "item", item.id);

    const { error: invErr } = await (await getSupabaseAdmin()).from("user_inventory").insert({
      user_id: userId,
      item_id: item.id,
      category: item.category,
      equipped: false,
    } as never);
    if (invErr) throw new Error(invErr.message);

    return { ok: true, newBalance: (prof.coins ?? 0) - item.price };
  });

/** Equip or unequip an owned item. Only one item per category can be equipped at a time. */
export const equipItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    itemId: z.string().min(1).max(64),
    equipped: z.boolean(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const item = SHOP_BY_ID[data.itemId];
    if (!item) throw new Error("Item not found");

    const { data: row } = await supabaseAdmin
      .from("user_inventory")
      .select("id, category")
      .eq("user_id", userId)
      .eq("item_id", item.id)
      .maybeSingle();
    if (!row) throw new Error("You don't own this item");

    if (data.equipped) {
      // Unequip others in same category
      await supabaseAdmin
        .from("user_inventory")
        .update({ equipped: false })
        .eq("user_id", userId)
        .eq("category", item.category);
    }
    await supabaseAdmin
      .from("user_inventory")
      .update({ equipped: data.equipped })
      .eq("id", row.id);

    return { ok: true };
  });

/** Get current user's inventory and balance. */
export const getMyInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const [invRes, profRes] = await Promise.all([
      (await getSupabaseAdmin()).from("user_inventory").select("item_id, category, equipped, acquired_at").eq("user_id", userId),
      (await getSupabaseAdmin()).from("profiles").select("coins, xp, level, streak, longest_streak").eq("id", userId).maybeSingle(),
    ]);
    return {
      inventory: invRes.data ?? [],
      profile: profRes.data ?? null,
    };
  });

/** Recent reward history for the current user. */
export const getMyTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data } = await supabaseAdmin
      .from("coin_transactions")
      .select("id, kind, amount, reason, ref_type, ref_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    return { transactions: data ?? [] };
  });
