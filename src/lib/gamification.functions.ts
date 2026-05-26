import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Award XP to the current user (server-side, bypasses gamification trigger). */
export const awardXp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { amount: number }) => {
    const amount = Math.max(0, Math.min(1000, Math.floor(input?.amount ?? 0)));
    return { amount };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("xp")
      .eq("id", userId)
      .maybeSingle();
    const next = (prof?.xp ?? 0) + data.amount;
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ xp: next })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { xp: next };
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
