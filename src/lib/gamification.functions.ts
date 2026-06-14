import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Server-controlled XP amounts. Clients pick an action name; the server
 * decides how much XP that action is worth. Prevents client-supplied
 * `amount` abuse on the leaderboard.
 */
const XP_ACTIONS = {
  post: 5,
  comment: 1,
  reaction: 1,
  daily_login: 10,
} as const satisfies Record<string, number>;

type XpAction = keyof typeof XP_ACTIONS;

// Per-user, per-action, per-day cap to prevent farming via repeated calls.
const DAILY_CAP: Record<XpAction, number> = {
  post: 10,        // up to 10 posts/day count for XP
  comment: 30,
  reaction: 50,
  daily_login: 1,
};

/** Award XP to the current user for a named, server-priced action. */
export const awardXp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { action: XpAction }) => {
    if (!input || typeof input.action !== "string" || !(input.action in XP_ACTIONS)) {
      throw new Error("Invalid XP action");
    }
    return { action: input.action as XpAction };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const amount = XP_ACTIONS[data.action];
    const cap = DAILY_CAP[data.action];

    // Count today's awards for this action via coin_transactions ledger
    // (already used elsewhere for daily idempotency).
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { count } = await supabaseAdmin
      .from("coin_transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("kind", "xp_award")
      .eq("reason", data.action)
      .gte("created_at", todayStart.toISOString());

    if ((count ?? 0) >= cap) {
      // Silently no-op once the cap is hit so callers don't have to handle it.
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("xp")
        .eq("id", userId)
        .maybeSingle();
      return { xp: prof?.xp ?? 0, capped: true as const };
    }

    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("xp")
      .eq("id", userId)
      .maybeSingle();
    const next = (prof?.xp ?? 0) + amount;
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ xp: next })
      .eq("id", userId);
    if (error) throw new Error(error.message);

    // Ledger entry for daily cap accounting + audit trail.
    await (await getSupabaseAdmin()).from("coin_transactions").insert({
      user_id: userId,
      amount,
      kind: "xp_award",
      reason: data.action,
    });

    return { xp: next, capped: false as const };
  });

/** Daily streak ping. Server-side so the gamification trigger allows the write. */
export const pingDailyStreak = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const today = new Date().toISOString().slice(0, 10);
    const { data: p } = await supabaseAdmin
      .from("profiles")
      .select("last_active_day, streak, longest_streak")
      .eq("id", userId)
      .maybeSingle();
    if (!p) return { ok: false };
    if (p.last_active_day === today) return { ok: true, unchanged: true };
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const next = p.last_active_day === yesterday ? (p.streak ?? 0) + 1 : 1;
    const longest = Math.max(p.longest_streak ?? 0, next);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ last_active_day: today, streak: next, longest_streak: longest })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true, streak: next, longest_streak: longest };
  });
