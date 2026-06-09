import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface FriendBirthday {
  id: string;
  username: string;
  avatar_url: string | null;
  birthday: string;
  hide_birth_year: boolean;
  turning_years: number | null;
}

/** Returns friends whose birthday is *today* (server clock, MM-DD match). */
export const getFriendBirthdaysToday = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const me = context.userId;
    const { data: friends } = await supabaseAdmin
      .from("friendships")
      .select("sender_id,receiver_id")
      .eq("status", "accepted")
      .or(`sender_id.eq.${me},receiver_id.eq.${me}`);

    const friendIds = (friends ?? []).map((f) =>
      f.sender_id === me ? f.receiver_id : f.sender_id,
    );
    if (friendIds.length === 0) return [] as FriendBirthday[];

    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select("id, username, avatar_url, birthday, hide_birth_year")
      .in("id", friendIds)
      .not("birthday", "is", null);

    const now = new Date();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(now.getUTCDate()).padStart(2, "0");
    const todayKey = `${mm}-${dd}`;

    const today: FriendBirthday[] = [];
    for (const p of profs ?? []) {
      if (!p.birthday) continue;
      const key = String(p.birthday).slice(5, 10);
      if (key !== todayKey) continue;
      const year = Number(String(p.birthday).slice(0, 4));
      const turning = Number.isFinite(year) && !p.hide_birth_year
        ? now.getUTCFullYear() - year
        : null;
      today.push({
        id: p.id,
        username: p.username,
        avatar_url: p.avatar_url,
        birthday: p.birthday,
        hide_birth_year: !!p.hide_birth_year,
        turning_years: turning,
      });
    }
    return today;
  });
