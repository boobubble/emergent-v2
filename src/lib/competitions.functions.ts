import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

// ---------- Public reads ----------

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await publicClient();
  const { data, error } = await sb
    .from("competition_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listCompetitions = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await publicClient();
  const { data, error } = await sb
    .from("competitions")
    .select("*, category:competition_categories(id,name,slug,color,icon_url)")
    .neq("status", "draft")
    .eq("is_published", true)
    .order("start_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminListAllCompetitions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("competitions")
      .select("*, category:competition_categories(id,name,slug,color,icon_url)")
      .order("start_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getCompetition = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: comp, error } = await sb
      .from("competitions")
      .select("*, category:competition_categories(id,name,slug,color,icon_url)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!comp) return null;
    const { data: participants } = await sb
      .from("competition_participants")
      .select("id,user_id,status,vote_count,rank,joined_at, profile:profiles(id,username,avatar_url,avatar_color)")
      .eq("competition_id", data.id)
      .order("vote_count", { ascending: false });
    const { data: awards } = await sb
      .from("competition_awards")
      .select("*, profile:profiles(id,username,avatar_url,avatar_color)")
      .eq("competition_id", data.id)
      .order("place", { ascending: true });
    return { competition: comp, participants: participants ?? [], awards: awards ?? [] };
  });

export const getUserAchievements = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: awards } = await sb
      .from("competition_awards")
      .select("*, competition:competitions(id,name,slug,banner_url), category:competitions(category:competition_categories(name,slug,color))")
      .eq("user_id", data.userId)
      .order("awarded_at", { ascending: false });
    const { data: totals } = await sb.rpc("user_competition_achievements", { _user: data.userId });
    const t = Array.isArray(totals) ? totals[0] : totals;
    return {
      awards: awards ?? [],
      total_wins: t?.total_wins ?? 0,
      total_joined: t?.total_joined ?? 0,
      live_count: t?.live_count ?? 0,
    };
  });

export const getLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((data: { range?: "week" | "month" | "all" } = {}) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const range = data.range ?? "all";
    let since: string | null = null;
    if (range === "week") since = new Date(Date.now() - 7 * 864e5).toISOString();
    else if (range === "month") since = new Date(Date.now() - 30 * 864e5).toISOString();

    let awardsQ = sb.from("competition_awards").select("user_id");
    if (since) awardsQ = awardsQ.gte("awarded_at", since);
    const { data: awardsRows } = await awardsQ;

    const winCounts = new Map<string, number>();
    (awardsRows ?? []).forEach((r: any) => winCounts.set(r.user_id, (winCounts.get(r.user_id) ?? 0) + 1));

    const { data: participants } = await sb
      .from("competition_participants")
      .select("user_id, vote_count");
    const votes = new Map<string, number>();
    const joins = new Map<string, number>();
    (participants ?? []).forEach((r: any) => {
      votes.set(r.user_id, (votes.get(r.user_id) ?? 0) + (r.vote_count ?? 0));
      joins.set(r.user_id, (joins.get(r.user_id) ?? 0) + 1);
    });

    const allIds = Array.from(new Set([...winCounts.keys(), ...votes.keys(), ...joins.keys()]));
    if (allIds.length === 0) return { wins: [], votes: [], joins: [] };
    const { data: profiles } = await sb
      .from("profiles")
      .select("id,username,avatar_url,avatar_color")
      .in("id", allIds);
    const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    const shape = (m: Map<string, number>) =>
      Array.from(m.entries())
        .map(([user_id, count]) => ({ user_id, count, profile: pmap.get(user_id) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 25);

    return { wins: shape(winCounts), votes: shape(votes), joins: shape(joins) };
  });

// ---------- User actions ----------

export const joinCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: comp, error: cErr } = await supabase
      .from("competitions").select("id,status,require_approval").eq("id", data.competitionId).maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!comp) throw new Error("Competition not found");
    if (!["upcoming", "live"].includes(comp.status)) throw new Error("Cannot join right now");
    const { error } = await supabase.from("competition_participants").insert({
      competition_id: data.competitionId,
      user_id: userId,
      status: comp.require_approval ? "pending" : "approved",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const leaveCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("competition_participants")
      .delete()
      .eq("competition_id", data.competitionId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const castVote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string; participantId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.rpc("cast_competition_vote", {
      _competition: data.competitionId,
      _participant: data.participantId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyVote = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: r } = await supabase.rpc("my_competition_vote", { _competition: data.competitionId });
    return { participantId: (r as string | null) ?? null };
  });

// ---------- Admin ----------

async function assertAdmin(supabase: any, userId: string) {
  const [{ data: isAdmin }, { data: isSuper }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  if (!isAdmin && !isSuper) throw new Error("Forbidden");
}

export const adminSaveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    id?: string; slug: string; name: string; description?: string;
    icon_url?: string; banner_url?: string; color?: string;
    enabled?: boolean; sort_order?: number;
  }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload = { ...data };
    if (data.id) {
      const { id, ...rest } = payload;
      const { error } = await context.supabase.from("competition_categories").update(rest).eq("id", id as string);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("competition_categories").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("competition_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSaveCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    id?: string;
    category_id?: string | null;
    slug: string; name: string; description?: string;
    banner_url?: string; rules?: string;
    start_at: string; end_at: string;
    max_participants?: number | null;
    winner_count?: number;
    status?: "draft" | "upcoming" | "live" | "completed";
    allow_vote_change?: boolean;
    show_live_counts?: boolean;
    require_approval?: boolean;
    rewards?: Record<string, unknown>;
    announce_channels?: string[];
    is_published?: boolean;
  }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase as any;
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await sb.from("competitions").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true, id };
    }
    const { data: row, error } = await sb
      .from("competitions")
      .insert({ ...data, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // Auto-post to feed when a new competition goes live (not for drafts)
    if (data.status !== "draft") {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const media = data.banner_url ? [data.banner_url] : [];
        const desc = (data.description ?? "").trim();
        const text = `🏆 New competition: ${data.name}\n\n${desc ? desc + "\n\n" : ""}Join now and compete for the top spot! → /competitions/${row.id}`;
        const baseSlug = `competition-${data.slug}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60);
        const slug = `${baseSlug}-${row.id.slice(0, 8)}`;
        await supabaseAdmin.from("posts").insert({
          author_id: context.userId,
          owner_id: context.userId,
          kind: "text",
          text,
          slug,
          media_urls: media,
          privacy: "public",
          hashtags: ["competition", data.slug].filter(Boolean),
        });
      } catch (e) {
        console.error("competition auto-post failed", e);
      }
    }

    return { ok: true, id: row.id };
  });


export const adminDeleteCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("competitions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetParticipantStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { participantId: string; status: "pending" | "approved" | "removed" | "disqualified" }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("competition_participants")
      .update({ status: data.status })
      .eq("id", data.participantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminFinalizeWinners = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: comp } = await context.supabase
      .from("competitions").select("*").eq("id", data.competitionId).maybeSingle();
    if (!comp) throw new Error("Not found");
    const { data: top } = await context.supabase
      .from("competition_participants")
      .select("id,user_id,vote_count")
      .eq("competition_id", data.competitionId)
      .eq("status", "approved")
      .order("vote_count", { ascending: false })
      .limit(Math.max(comp.winner_count ?? 1, 1));

    if (!top || top.length === 0) throw new Error("No participants to award");

    const rows = top.map((p: any, i: number) => ({
      competition_id: data.competitionId,
      participant_id: p.id,
      user_id: p.user_id,
      place: i + 1,
      badge_label: `${comp.name} Winner`,
      rewards: comp.rewards ?? {},
    }));
    const { error } = await context.supabase.from("competition_awards").upsert(rows, {
      onConflict: "competition_id,place",
    });
    if (error) throw new Error(error.message);

    await context.supabase.from("competitions").update({ status: "completed" }).eq("id", data.competitionId);

    // Grant coin rewards if configured
    const coins = Number((comp.rewards as any)?.coins ?? 0);
    if (coins > 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      for (const r of rows) {
        await supabaseAdmin.rpc("has_role", { _user_id: r.user_id, _role: "admin" }); // noop, keeps import used
        await supabaseAdmin.from("coin_transactions").insert({
          user_id: r.user_id, kind: "coins", amount: coins,
          reason: `competition_win:${comp.slug}`, ref_type: "competition", ref_id: data.competitionId,
        });
        await supabaseAdmin.rpc("has_role", { _user_id: r.user_id, _role: "admin" });
        // Bump profile coin balance via service role
        await supabaseAdmin.from("profiles").update({ coins: coins }).eq("id", r.user_id).select();
      }
    }

    // Notifications
    const notifRows = rows.map((r) => ({
      user_id: r.user_id,
      actor_id: context.userId,
      kind: "competition_win",
      target_type: "competition",
      target_id: data.competitionId,
      payload: { name: comp.name, place: r.place },
    }));
    if (notifRows.length) await context.supabase.from("notifications").insert(notifRows);

    return { ok: true, winners: rows.length };
  });
