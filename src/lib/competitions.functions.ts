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

async function fetchCompetitionCore(sb: any, filter: { id?: string; slug?: string }) {
  let q = sb.from("competitions").select("*, category:competition_categories(id,name,slug,color,icon_url)");
  if (filter.id) q = q.eq("id", filter.id);
  else if (filter.slug) q = q.eq("slug", filter.slug);
  const { data: comp, error } = await q.maybeSingle();
  if (error) throw new Error(error.message);
  if (!comp) return null;
  const [{ data: participants }, { data: awards }, { data: competitors }] = await Promise.all([
    sb.from("competition_participants")
      .select("id,user_id,status,vote_count,rank,joined_at, profile:profiles(id,username,avatar_url,avatar_color)")
      .eq("competition_id", comp.id)
      .order("vote_count", { ascending: false }),
    sb.from("competition_awards")
      .select("*, profile:profiles(id,username,avatar_url,avatar_color)")
      .eq("competition_id", comp.id)
      .order("place", { ascending: true }),
    sb.from("competition_competitors")
      .select("*, linked_profile:profiles!competition_competitors_linked_user_id_fkey(id,username,avatar_url,avatar_color)")
      .eq("competition_id", comp.id)
      .order("sort_order", { ascending: true }),
  ]);
  return {
    competition: comp,
    participants: participants ?? [],
    awards: awards ?? [],
    competitors: competitors ?? [],
  };
}

export const getCompetition = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    return fetchCompetitionCore(sb, { id: data.id });
  });

export const getCompetitionBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    // Normalize: trim + collapse whitespace -> dashes so legacy dirty slugs still resolve
    const normalized = (data.slug ?? "").trim().replace(/\s+/g, "-");
    return fetchCompetitionCore(sb, { slug: normalized });
  });


export const listRelatedCompetitions = createServerFn({ method: "GET" })
  .inputValidator((data: { competitionId: string; categoryId?: string | null; limit?: number }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const limit = data.limit ?? 6;
    let q = sb.from("competitions")
      .select("*, category:competition_categories(id,name,slug,color,icon_url)")
      .neq("id", data.competitionId)
      .neq("status", "draft")
      .eq("is_published", true)
      .order("start_at", { ascending: false })
      .limit(limit);
    if (data.categoryId) q = q.eq("category_id", data.categoryId);
    const { data: rows } = await q;
    return rows ?? [];
  });

export const incrementCompetitionViews = createServerFn({ method: "POST" })
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    await sb.rpc("increment_competition_views", { _competition: data.competitionId });
    return { ok: true };
  });

// ---------- Competitors (admin-managed entries) ----------

export const listCompetitors = createServerFn({ method: "GET" })
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: rows, error } = await sb
      .from("competition_competitors")
      .select("*, linked_profile:profiles!competition_competitors_linked_user_id_fkey(id,username,avatar_url,avatar_color)")
      .eq("competition_id", data.competitionId)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSaveCompetitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    id?: string;
    competition_id: string;
    name: string;
    photo_url?: string | null;
    cover_image_url?: string | null;
    description?: string | null;
    linked_user_id?: string | null;
    sort_order?: number;
    country?: string | null;
    website?: string | null;
    social_links?: Record<string, string | null | undefined> | null;
    is_featured?: boolean;
    is_pinned?: boolean;
  }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase as any;

    // Server-side eligibility: nominees MUST be registered members.
    const linkedUserId = data.linked_user_id ?? null;
    if (!linkedUserId) {
      throw new Error("Select a registered member to add as a nominee.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error: profErr } = await (supabaseAdmin as any)
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .eq("id", linkedUserId)
      .maybeSingle();
    if (profErr) throw new Error(profErr.message);
    if (!profile) throw new Error("This user is not registered and cannot be a nominee.");

    // Reject banned users.
    const { data: activeBan } = await (supabaseAdmin as any)
      .from("user_bans")
      .select("id, expires_at")
      .eq("user_id", linkedUserId)
      .eq("active", true)
      .maybeSingle();
    if (activeBan && (!activeBan.expires_at || new Date(activeBan.expires_at) > new Date())) {
      throw new Error("This user is banned and is not eligible for competitions.");
    }

    // Prevent duplicate nominee entries for the same competition.
    const dupQ = (supabaseAdmin as any)
      .from("competition_competitors")
      .select("id")
      .eq("competition_id", data.competition_id)
      .eq("linked_user_id", linkedUserId)
      .limit(1);
    const { data: dupRows, error: dupErr } = await dupQ;
    if (dupErr) throw new Error(dupErr.message);
    const duplicate = (dupRows ?? []).find((r: { id: string }) => r.id !== data.id);
    if (duplicate) {
      throw new Error("This member is already a nominee in this competition.");
    }

    const resolvedName = (data.name?.trim()) || profile.display_name || profile.username || "Nominee";
    const payload: Record<string, unknown> = {
      competition_id: data.competition_id,
      name: resolvedName,
      photo_url: data.photo_url ?? profile.avatar_url ?? null,
      cover_image_url: data.cover_image_url ?? null,
      description: data.description ?? null,
      linked_user_id: linkedUserId,
      country: data.country?.trim() || null,
      website: data.website?.trim() || null,
      social_links: data.social_links ?? {},
      is_featured: !!data.is_featured,
      is_pinned: !!data.is_pinned,
    };
    if (typeof data.sort_order === "number") payload.sort_order = data.sort_order;
    if (data.id) {
      const { error } = await sb.from("competition_competitors").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await sb.from("competition_competitors").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const adminDeleteCompetitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("competition_competitors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminReorderCompetitors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orders: Array<{ id: string; sort_order: number }> }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    for (const o of data.orders) {
      await context.supabase.from("competition_competitors").update({ sort_order: o.sort_order }).eq("id", o.id);
    }
    return { ok: true };
  });

// Search existing BooBubble members for the nominee picker (admin-only).
export const adminSearchProfiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { query: string; limit?: number }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const q = (data.query ?? "").trim();
    if (q.length < 2) return [];
    const limit = Math.min(Math.max(data.limit ?? 10, 1), 25);
    const like = `%${q.replace(/[%_]/g, "")}%`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await (supabaseAdmin as any)
      .from("profiles")
      .select("id, username, display_name, avatar_url, avatar_color, is_verified")
      .or(`username.ilike.${like},display_name.ilike.${like}`)
      .limit(limit);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((row: any) => ({
      id: row.id,
      username: row.username,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      avatar_color: row.avatar_color,
      verified: !!row.is_verified,
    }));
  });

// ---------- Competition follows ----------

// Best-effort gamification emit. Never breaks the caller if the event isn't configured.
async function emitGam(sb: any, userId: string, event: string, metadata: Record<string, unknown> = {}, amount = 1) {
  try {
    await sb.rpc("gam_emit", { _user_id: userId, _event_type: event, _amount: amount, _metadata: metadata });
  } catch { /* swallow — XP is a side-effect, not core */ }
}

export const followCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("competition_follows")
      .upsert({ user_id: context.userId, competition_id: data.competitionId }, { onConflict: "user_id,competition_id" });
    if (error) throw new Error(error.message);
    await emitGam(context.supabase, context.userId, "competition_follow", { competition_id: data.competitionId });
    return { ok: true };
  });

export const unfollowCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("competition_follows")
      .delete()
      .eq("user_id", context.userId)
      .eq("competition_id", data.competitionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyCompetitionFollow = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: row } = await (context.supabase as any)
      .from("competition_follows")
      .select("competition_id")
      .eq("user_id", context.userId)
      .eq("competition_id", data.competitionId)
      .maybeSingle();
    return { following: !!row };
  });

export const getCompetitionFollowerCount = createServerFn({ method: "GET" })
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: count, error } = await (sb as any)
      .rpc("get_competition_follower_count", { _competition_id: data.competitionId });
    if (error) throw new Error(error.message);
    return { count: typeof count === "number" ? count : Number(count ?? 0) };
  });

export const voteForCompetitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string; competitorId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Delete existing vote (allows vote change), then insert new one
    await supabase.from("competition_competitor_votes")
      .delete()
      .eq("competition_id", data.competitionId)
      .eq("voter_id", userId);
    const { error } = await supabase.from("competition_competitor_votes").insert({
      competition_id: data.competitionId,
      competitor_id: data.competitorId,
      voter_id: userId,
    });
    if (error) throw new Error(error.message);
    await emitGam(supabase, userId, "competition_vote", { competition_id: data.competitionId, competitor_id: data.competitorId });
    return { ok: true };
  });

export const shareCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string; channel?: string }) => data)
  .handler(async ({ data, context }) => {
    await emitGam(context.supabase, context.userId, "competition_share", {
      competition_id: data.competitionId,
      channel: data.channel ?? "link",
    });
    return { ok: true };
  });


export const getMyCompetitorVote = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: r } = await context.supabase
      .from("competition_competitor_votes")
      .select("competitor_id")
      .eq("competition_id", data.competitionId)
      .eq("voter_id", context.userId)
      .maybeSingle();
    return { competitorId: (r as any)?.competitor_id ?? null };
  });

export const listRecentCompetitionVoters = createServerFn({ method: "GET" })
  .inputValidator((data: { competitionId: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: rows, error } = await (sb as any).rpc("list_recent_competition_voters", {
      _competition_id: data.competitionId,
      _limit: data.limit ?? 30,
    });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Array<{
      voter_id: string;
      competitor_id: string;
      voted_at: string;
      username: string | null;
      avatar_url: string | null;
      avatar_color: string | null;
      is_verified: boolean;
      competitor_name: string | null;
    }>;
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
    await emitGam(supabase, userId, "competition_join", { competition_id: data.competitionId });
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
    const { supabase, userId } = context;
    const { error } = await supabase.rpc("cast_competition_vote", {
      _competition: data.competitionId,
      _participant: data.participantId,
    });
    if (error) throw new Error(error.message);
    await emitGam(supabase, userId, "competition_vote", { competition_id: data.competitionId, participant_id: data.participantId });
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
    layout_style?: "auto" | "vs_battle" | "podium" | "tournament" | "leaderboard";
    allow_vote_change?: boolean;
    show_live_counts?: boolean;
    require_approval?: boolean;
    rewards?: Record<string, unknown>;
    announce_channels?: string[];
    is_published?: boolean;
    enable_voting?: boolean;
    enable_reactions?: boolean;
    enable_comments?: boolean;
    enable_sharing?: boolean;
    enable_join?: boolean;
    hide_results_until_end?: boolean;
    auto_close_voting?: boolean;
    is_featured?: boolean;
    is_pinned?: boolean;
    allow_multiple_votes?: boolean;
    max_votes_per_user?: number;
    allow_guest_voting?: boolean;
    allow_anonymous_voting?: boolean;
  }) => data)

  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase as any;
    // Strip any joined/computed fields that aren't real columns
    const {
      id: _id,
      category: _category,
      total_participants: _tp,
      total_votes: _tv,
      created_by: _cb,
      created_at: _ca,
      updated_at: _ua,
      ...clean
    } = data as any;

    // Prevent overlapping live/upcoming competitions in the same category.
    // A category may only host one active (not-yet-ended) competition at a time.
    if (data.category_id && data.status !== "draft" && data.status !== "completed") {
      const nowIso = new Date().toISOString();
      let conflictQ = sb
        .from("competitions")
        .select("id, name, end_at, status")
        .eq("category_id", data.category_id)
        .in("status", ["live", "upcoming"])
        .gt("end_at", nowIso)
        .limit(1);
      if (data.id) conflictQ = conflictQ.neq("id", data.id);
      const { data: conflict, error: cErr } = await conflictQ;
      if (cErr) throw new Error(cErr.message);
      if (conflict && conflict.length > 0) {
        throw new Error(
          `A competition ("${conflict[0].name}") is already running in this category. Wait for it to end or mark it completed before creating another.`
        );
      }
    }

    // Prevent going live without at least one nominee/competitor.
    if (data.status === "live" && data.id) {
      const { count, error: nErr } = await sb
        .from("competition_competitors")
        .select("id", { count: "exact", head: true })
        .eq("competition_id", data.id);
      if (nErr) throw new Error(nErr.message);
      if (!count || count < 1) {
        throw new Error("Add at least one nominee before setting this competition to live.");
      }
    } else if (data.status === "live" && !data.id) {
      throw new Error("Create the competition as draft or upcoming first, add at least one nominee, then set it to live.");
    }

    if (data.id) {
      const { error } = await sb.from("competitions").update(clean).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await sb
      .from("competitions")
      .insert({ ...clean, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // Auto-post to feed when a new competition goes live (not for drafts)
    if (data.status !== "draft") {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const media = data.banner_url ? [data.banner_url] : [];
        const desc = (data.description ?? "").trim();
        const text = `🏆 New competition: ${data.name}\n\n${desc ? desc + "\n\n" : ""}Join now and compete for the top spot! → /competitions/${data.slug}`;
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

// ---------- Competitor moderation ----------

export const adminSetCompetitorFlags = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; is_hidden?: boolean; is_disqualified?: boolean }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { id, ...patch } = data;
    const { error } = await (context.supabase as any).from("competition_competitors").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Vote management ----------

export const adminListCompetitorVotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("competition_competitor_votes")
      .select("id, created_at, voter_id, competitor_id")
      .eq("competition_id", data.competitionId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const voterIds = Array.from(new Set((rows ?? []).map((r: any) => r.voter_id)));
    const compIds = Array.from(new Set((rows ?? []).map((r: any) => r.competitor_id)));
    const [profRes, compRes] = await Promise.all([
      voterIds.length
        ? context.supabase.from("profiles").select("id,username,avatar_url").in("id", voterIds)
        : Promise.resolve({ data: [] as any[] }),
      compIds.length
        ? context.supabase.from("competition_competitors").select("id,name").in("id", compIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const pm = new Map(((profRes as any).data ?? []).map((p: any) => [p.id, p]));
    const cm = new Map(((compRes as any).data ?? []).map((c: any) => [c.id, c]));
    return (rows ?? []).map((r: any) => ({
      ...r,
      voter: pm.get(r.voter_id) ?? null,
      competitor: cm.get(r.competitor_id) ?? null,
    }));
  });

export const adminDeleteCompetitorVote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { voteId: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("competition_competitor_votes").delete().eq("id", data.voteId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminResetCompetitionVotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.rpc("admin_reset_competition_votes", { _competition: data.competitionId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminResetCompetitorVotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { competitorId: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.rpc("admin_reset_competitor_votes", { _competitor: data.competitorId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Analytics ----------

export const getCompetitionAnalytics = createServerFn({ method: "GET" })
  .inputValidator((data: { competitionId: string }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: rows, error } = await sb.rpc("competition_analytics", { _competition: data.competitionId });
    if (error) throw new Error(error.message);
    const row = Array.isArray(rows) ? rows[0] : rows;
    return row ?? null;
  });

// ---------- Manual winners ----------

export const adminSetManualWinners = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    competitionId: string;
    winners: Array<{ user_id: string; place: number; badge_label?: string | null; participant_id?: string | null }>;
    markCompleted?: boolean;
  }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: comp } = await context.supabase
      .from("competitions").select("name,rewards,slug").eq("id", data.competitionId).maybeSingle();
    if (!comp) throw new Error("Not found");
    await context.supabase.from("competition_awards").delete().eq("competition_id", data.competitionId);
    const rows = data.winners.map((w) => ({
      competition_id: data.competitionId,
      participant_id: w.participant_id ?? null,
      user_id: w.user_id,
      place: w.place,
      badge_label: w.badge_label ?? `${(comp as any).name} — #${w.place}`,
      rewards: (comp as any).rewards ?? {},
    }));
    if (rows.length) {
      const { error } = await context.supabase.from("competition_awards").insert(rows);
      if (error) throw new Error(error.message);
    }
    if (data.markCompleted) {
      await context.supabase.from("competitions").update({ status: "completed" }).eq("id", data.competitionId);
    }
    return { ok: true, winners: rows.length };
  });


// ---------- Discovery & Hall of Fame ----------

export type EnrichedCompetition = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  status: string;
  start_at: string;
  end_at: string;
  total_votes: number;
  total_participants: number;
  views_count: number;
  is_featured: boolean;
  is_pinned: boolean;
  is_published: boolean;
  rewards: any;
  category: { id: string; name: string; slug: string; color?: string | null; icon_url?: string | null } | null;
  follower_count: number;
  top_competitors: Array<{
    id: string;
    name: string;
    photo_url: string | null;
    votes: number;
    is_verified?: boolean;
  }>;
};

async function enrichCompetitions(sb: any, comps: any[]): Promise<EnrichedCompetition[]> {
  if (!comps.length) return [];
  const ids = comps.map((c) => c.id);
  const [{ data: follows }, { data: competitors }] = await Promise.all([
    sb.from("competition_follows").select("competition_id").in("competition_id", ids),
    sb.from("competition_competitors")
      .select("id, competition_id, name, photo_url, vote_count, is_hidden, is_disqualified, sort_order, linked_profile:profiles!competition_competitors_linked_user_id_fkey(is_verified)")
      .in("competition_id", ids)
      .order("vote_count", { ascending: false }),
  ]);
  const followMap = new Map<string, number>();
  (follows ?? []).forEach((f: any) => followMap.set(f.competition_id, (followMap.get(f.competition_id) ?? 0) + 1));
  const compMap = new Map<string, any[]>();
  (competitors ?? []).forEach((c: any) => {
    if (c.is_hidden || c.is_disqualified) return;
    const arr = compMap.get(c.competition_id) ?? [];
    if (arr.length < 3) arr.push(c);
    compMap.set(c.competition_id, arr);
  });
  return comps.map((c) => ({
    ...c,
    follower_count: followMap.get(c.id) ?? 0,
    top_competitors: (compMap.get(c.id) ?? []).map((x: any) => ({
      id: x.id,
      name: x.name,
      photo_url: x.photo_url,
      votes: x.vote_count ?? 0,
      is_verified: !!x.linked_profile?.is_verified,
    })),
  }));
}

export const listCompetitionsEnriched = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await publicClient();
  const { data, error } = await sb
    .from("competitions")
    .select("*, category:competition_categories(id,name,slug,color,icon_url)")
    .neq("status", "draft")
    .eq("is_published", true)
    .order("start_at", { ascending: false });
  if (error) throw new Error(error.message);
  return enrichCompetitions(sb, data ?? []);
});

export const listMyFollowedCompetitions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: follows } = await context.supabase
      .from("competition_follows")
      .select("competition_id")
      .eq("user_id", context.userId);
    const ids = (follows ?? []).map((f: any) => f.competition_id);
    if (!ids.length) return [];
    const sb = await publicClient();
    const { data, error } = await sb
      .from("competitions")
      .select("*, category:competition_categories(id,name,slug,color,icon_url)")
      .in("id", ids)
      .eq("is_published", true)
      .order("start_at", { ascending: false });
    if (error) throw new Error(error.message);
    return enrichCompetitions(sb, data ?? []);
  });

export const listHallOfFame = createServerFn({ method: "GET" })
  .inputValidator((data: { limit?: number } = {}) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const limit = Math.min(data.limit ?? 100, 200);
    const { data: awards, error } = await sb
      .from("competition_awards")
      .select("id, place, badge_label, awarded_at, rewards, user_id, participant_id, competition:competitions(id,name,slug,banner_url,end_at,total_votes,total_participants,category:competition_categories(name,slug,color))")
      .lte("place", 3)
      .order("awarded_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    const rows = awards ?? [];
    const userIds = Array.from(new Set(rows.map((r: any) => r.user_id).filter(Boolean)));
    const partIds = Array.from(new Set(rows.map((r: any) => r.participant_id).filter(Boolean)));
    const [{ data: profs }, { data: parts }] = await Promise.all([
      userIds.length
        ? sb.from("profiles").select("id,username,display_name,avatar_url,avatar_color,is_verified").in("id", userIds)
        : Promise.resolve({ data: [] as any[] }),
      partIds.length
        ? sb.from("competition_participants").select("id,vote_count,competition_id").in("id", partIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const pmap = new Map(((profs as any).data ?? []).map((p: any) => [p.id, p]));
    const partMap = new Map(((parts as any).data ?? []).map((p: any) => [p.id, p]));
    return rows.map((r: any) => {
      const part = partMap.get(r.participant_id) as { vote_count?: number } | undefined;
      const totalVotes = r.competition?.total_votes ?? 0;
      const winningVotes = part?.vote_count ?? 0;
      return {
        id: r.id,
        place: r.place,
        badge_label: r.badge_label,
        awarded_at: r.awarded_at,
        rewards: r.rewards ?? {},
        competition: r.competition,
        profile: pmap.get(r.user_id) ?? null,
        winning_votes: winningVotes,
        winning_share: totalVotes > 0 ? winningVotes / totalVotes : 0,
      };
    });
  });

// ---------- User Competition Showcase ----------

export const getUserCompetitionShowcase = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const uname = (data.username ?? "").trim();
    if (!uname) throw new Error("username required");

    const { data: profile } = await sb
      .from("profiles")
      .select("id,username,display_name,avatar_url,avatar_color,is_verified,country")
      .ilike("username", uname)
      .maybeSingle();
    if (!profile) return { profile: null };

    const uid = (profile as any).id as string;

    const [
      awardsRes,
      participantsRes,
      competitorRowsRes,
      followedRes,
      coinsRes,
      xpEventsRes,
    ] = await Promise.all([
      sb.from("competition_awards")
        .select("id, place, badge_label, awarded_at, participant_id, rewards, competition:competitions(id,name,slug,banner_url,end_at,status,category:competition_categories(name,slug,color))")
        .eq("user_id", uid)
        .order("awarded_at", { ascending: false }),
      sb.from("competition_participants")
        .select("id, competition_id, vote_count, rank, joined_at, status, competition:competitions(id,name,slug,banner_url,status,end_at,start_at,is_featured,category:competition_categories(name,slug,color))")
        .eq("user_id", uid)
        .order("joined_at", { ascending: false }),
      sb.from("competition_competitors")
        .select("id, name, competition_id, vote_count, is_featured, is_hidden, is_disqualified, photo_url, competition:competitions(id,name,slug,banner_url,status,end_at,start_at,is_featured,category:competition_categories(name,slug,color))")
        .eq("linked_user_id", uid),
      sb.from("competition_follows")
        .select("competition_id")
        .eq("user_id", uid),
      sb.from("coin_transactions")
        .select("amount, created_at, reason, ref_id")
        .eq("user_id", uid)
        .eq("ref_type", "competition"),
      sb.from("gam_event_log")
        .select("event_type, amount, created_at, metadata")
        .eq("user_id", uid)
        .like("event_type", "competition_%")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const awards = (awardsRes.data ?? []) as any[];
    const participants = (participantsRes.data ?? []) as any[];
    const competitorRows = (competitorRowsRes.data ?? []) as any[];
    const followed = (followedRes.data ?? []) as any[];
    const coinTx = (coinsRes.data ?? []) as any[];
    const xpEvents = (xpEventsRes.data ?? []) as any[];

    const wins = awards.filter((a) => a.place === 1);
    const runnersUp = awards.filter((a) => a.place === 2);
    const thirds = awards.filter((a) => a.place === 3);

    const currentLive = competitorRows.filter((c) => !c.is_hidden && !c.is_disqualified && c.competition?.status === "live");
    const featuredNominee = competitorRows.filter((c) => c.is_featured);
    const votesReceived =
      participants.reduce((acc, p) => acc + (p.vote_count ?? 0), 0) +
      competitorRows.reduce((acc, c) => acc + (c.vote_count ?? 0), 0);

    const bestRank = participants
      .map((p) => p.rank)
      .filter((r) => typeof r === "number" && r > 0)
      .reduce<number | null>((min, r) => (min == null || r < min ? r : min), null);

    // Followers earned = sum of followers on all competitions where user is a nominee
    const nomineeCompIds = Array.from(new Set(competitorRows.map((c) => c.competition_id)));
    let followersEarned = 0;
    if (nomineeCompIds.length) {
      const { data: fRows } = await sb
        .from("competition_follows")
        .select("competition_id")
        .in("competition_id", nomineeCompIds);
      followersEarned = (fRows ?? []).length;
    }

    const coinsEarned = coinTx.reduce((acc, t) => acc + Math.max(0, Number(t.amount ?? 0)), 0);
    const xpEarned = xpEvents.reduce((acc, e) => acc + Math.max(0, Number(e.amount ?? 0)), 0);

    // Timeline: awards + joins, newest first
    const timeline = [
      ...awards.map((a) => ({
        kind: "award" as const,
        at: a.awarded_at,
        place: a.place,
        badge_label: a.badge_label,
        competition: a.competition,
      })),
      ...participants.slice(0, 30).map((p) => ({
        kind: "join" as const,
        at: p.joined_at,
        vote_count: p.vote_count ?? 0,
        competition: p.competition,
      })),
    ]
      .filter((t) => t.competition)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 20);

    // Recent activity (last 12 events)
    const recentActivity = xpEvents.slice(0, 12).map((e) => ({
      event_type: e.event_type,
      amount: e.amount,
      at: e.created_at,
      metadata: e.metadata ?? {},
    }));

    // Competition badges: aggregate from award badge_label + auto-derived
    const badges: Array<{ id: string; name: string; emoji: string; tint: string }> = [];
    if (wins.length >= 1) badges.push({ id: "champion", name: "Champion", emoji: "🏆", tint: "from-amber-400 to-yellow-500" });
    if (wins.length >= 5) badges.push({ id: "legend", name: "Competition Legend", emoji: "👑", tint: "from-fuchsia-400 to-purple-600" });
    if (runnersUp.length >= 1) badges.push({ id: "runner_up", name: "Runner Up", emoji: "🥈", tint: "from-slate-300 to-slate-400" });
    if (thirds.length >= 1) badges.push({ id: "third", name: "Third Place", emoji: "🥉", tint: "from-orange-400 to-amber-600" });
    if (featuredNominee.length >= 1) badges.push({ id: "featured_nominee", name: "Featured Nominee", emoji: "⭐", tint: "from-amber-300 to-orange-400" });
    if (votesReceived >= 100) badges.push({ id: "top_100_votes", name: "Top 100 Votes", emoji: "🏅", tint: "from-emerald-300 to-teal-500" });
    if (votesReceived >= 1000) badges.push({ id: "top_1k_votes", name: "Top 1000 Votes", emoji: "🏅", tint: "from-cyan-300 to-blue-500" });
    if (participants.length >= 10 || competitorRows.length >= 10)
      badges.push({ id: "most_active", name: "Most Active Competitor", emoji: "🎖", tint: "from-purple-300 to-pink-400" });
    if (followersEarned >= 500) badges.push({ id: "fan_favorite", name: "Fan Favorite", emoji: "🔥", tint: "from-rose-400 to-red-500" });
    if (followersEarned >= 100 && wins.length === 0)
      badges.push({ id: "rising_star", name: "Rising Star", emoji: "⚡", tint: "from-yellow-300 to-amber-400" });
    if ((profile as any).country) badges.push({ id: "international", name: "International", emoji: "🌍", tint: "from-blue-300 to-indigo-500" });

    // Showcase: 1 champion win + 1 runner-up + featured nominee + current live
    const showcase: Array<{ label: string; emoji: string; competition: any; extra?: string }> = [];
    if (wins[0]) showcase.push({ label: `Champion — ${wins[0].competition?.name ?? "Competition"}`, emoji: "👑", competition: wins[0].competition });
    if (runnersUp[0]) showcase.push({ label: `Runner Up — ${runnersUp[0].competition?.name ?? "Competition"}`, emoji: "🥈", competition: runnersUp[0].competition });
    if (currentLive[0]) showcase.push({ label: "Currently Competing", emoji: "🔥", competition: currentLive[0].competition, extra: `${currentLive[0].vote_count ?? 0} votes` });
    if (featuredNominee[0]) showcase.push({ label: "Fan Favorite", emoji: "⭐", competition: featuredNominee[0].competition });

    return {
      profile,
      totals: {
        joined: participants.length + competitorRows.length,
        wins: wins.length,
        runner_ups: runnersUp.length,
        third_places: thirds.length,
        votes_received: votesReceived,
        followers_earned: followersEarned,
        following_count: followed.length,
        featured_count: featuredNominee.length,
        live_count: currentLive.length,
        best_rank: bestRank,
        coins_earned: coinsEarned,
        xp_earned: xpEarned,
      },
      badges,
      showcase,
      currentLive: currentLive.slice(0, 6).map((c) => ({
        id: c.id,
        name: c.name,
        photo_url: c.photo_url,
        vote_count: c.vote_count ?? 0,
        competition: c.competition,
      })),
      recentAwards: awards.slice(0, 6),
      timeline,
      recentActivity,
    };
  });
