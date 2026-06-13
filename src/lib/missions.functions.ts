/**
 * Daily missions — small, repeatable tasks that reset every UTC day.
 * Progress is bumped automatically by `economy.functions.ts` earn handlers.
 * Users explicitly claim rewards via `claimMission`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DAILY_MISSIONS, MISSION_BY_ID } from "./economy-config";

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

async function bumpProfile(userId: string, addXp: number, addCoins: number) {
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

/** Return today's missions list with progress + claim state for the current user. */
export const getTodayMissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const day = todayUtc();
    const { data: row } = await supabaseAdmin
      .from("daily_missions")
      .select("progress, claimed")
      .eq("user_id", userId)
      .eq("day", day)
      .maybeSingle();
    const progress = (row?.progress as Record<string, number>) ?? {};
    const claimed = new Set(row?.claimed ?? []);
    return {
      day,
      missions: DAILY_MISSIONS.map((m) => {
        const p = progress[m.id] ?? 0;
        return {
          ...m,
          progress: Math.min(p, m.target),
          completed: p >= m.target,
          claimed: claimed.has(m.id),
        };
      }),
    };
  });

/** Claim a completed mission. Idempotent per day. */
export const claimMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ missionId: z.string().min(1).max(64) }).parse(i))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const mission = MISSION_BY_ID[data.missionId];
    if (!mission) throw new Error("Unknown mission");
    const day = todayUtc();

    const { data: row } = await supabaseAdmin
      .from("daily_missions")
      .select("id, progress, claimed")
      .eq("user_id", userId)
      .eq("day", day)
      .maybeSingle();
    if (!row) throw new Error("No progress yet");

    const progress = (row.progress as Record<string, number>) ?? {};
    const current = progress[mission.id] ?? 0;
    if (current < mission.target) throw new Error("Mission not yet complete");

    const claimed: string[] = row.claimed ?? [];
    if (claimed.includes(mission.id)) throw new Error("Already claimed");

    await bumpProfile(userId, mission.xp, mission.coins);
    await (await getSupabaseAdmin()).from("coin_transactions").insert({
      user_id: userId,
      kind: "coins",
      amount: mission.coins,
      reason: "mission_claim",
      ref_type: "mission",
      ref_id: mission.id,
    } as never);

    await supabaseAdmin
      .from("daily_missions")
      .update({
        claimed: [...claimed, mission.id],
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    return { ok: true, coins: mission.coins, xp: mission.xp };
  });
