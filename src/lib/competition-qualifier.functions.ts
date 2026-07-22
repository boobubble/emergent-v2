import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// -----------------------------------------------------------------------------
// Competition Engine 2.0 — Smart Auto Qualification
//
// This module is admin-only. It evaluates candidate content (Feed posts,
// Poetry Hub poems) against every Smart or Hybrid competition and creates
// `competition_competitors` entries with origin='auto' when engagement +
// gate rules are satisfied. Runs from an admin manual trigger and from a
// background cron drain of `competition_qualification_events`.
// -----------------------------------------------------------------------------

type QualConfig = {
  source?: { module?: "feed" | "poetry"; category?: string };
  method?: "fixed" | "top_n_week" | "top_n_month" | "top_percent" | "approval";
  thresholds?: {
    likes?: number; comments?: number; shares?: number; views?: number;
    reads?: number; bookmarks?: number;
  };
  gates?: {
    min_likes?: number;
    min_account_age_days?: number;
    min_followers?: number;
    min_content_age_hours?: number;
    require_eligible_flag?: boolean;
  };
  weights?: Record<string, number>;
  top_n?: number;
  top_percent?: number; // e.g. 5 => top 5%
};

async function assertAdmin(sb: any, userId: string) {
  const [{ data: a }, { data: s }] = await Promise.all([
    sb.rpc("has_role", { _user_id: userId, _role: "admin" }),
    sb.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  if (!a && !s) throw new Error("Forbidden");
}

function windowStart(method: string | undefined): string | null {
  const now = Date.now();
  if (method === "top_n_week") return new Date(now - 7 * 864e5).toISOString();
  if (method === "top_n_month") {
    const d = new Date(); d.setUTCDate(1); d.setUTCHours(0, 0, 0, 0); return d.toISOString();
  }
  return new Date(now - 30 * 864e5).toISOString();
}

async function fetchCandidates(admin: any, comp: any, cfg: QualConfig) {
  const start = windowStart(cfg.method);
  const src = cfg.source?.module ?? "feed";
  if (src === "feed") {
    let q = admin.from("posts")
      .select("id, owner_id, author_id, reaction_count, comment_count, trending_score, created_at, category, competition_id, eligible_for_competitions, privacy, is_anonymous")
      .eq("privacy", "public")
      .eq("is_anonymous", false)
      .eq("eligible_for_competitions", true)
      .is("competition_id", null)
      .gte("created_at", start);
    if (cfg.source?.category) q = q.eq("category", cfg.source.category);
    const { data } = await q.limit(500);
    return { type: "post" as const, rows: data ?? [] };
  }
  // poetry
  const { data } = await admin.from("mehfil_poems")
    .select("id, author_id, upvote_count, comment_count, share_count, read_count, bookmark_count, created_at, status, eligible_for_competitions")
    .eq("status", "published")
    .eq("eligible_for_competitions", true)
    .gte("created_at", start)
    .limit(500);
  return { type: "poem" as const, rows: data ?? [] };
}

function passesGates(row: any, type: "post" | "poem", cfg: QualConfig, profile?: any): boolean {
  const g = cfg.gates ?? {};
  if (g.require_eligible_flag !== false && row.eligible_for_competitions === false) return false;
  const likes = type === "post" ? (row.reaction_count ?? 0) : (row.upvote_count ?? 0);
  if (g.min_likes && likes < g.min_likes) return false;
  if (g.min_content_age_hours) {
    const ageH = (Date.now() - new Date(row.created_at).getTime()) / 3600000;
    if (ageH < g.min_content_age_hours) return false;
  }
  if (profile) {
    if (g.min_account_age_days) {
      const ageD = (Date.now() - new Date(profile.created_at).getTime()) / 86400000;
      if (ageD < g.min_account_age_days) return false;
    }
    if (g.min_followers && (profile.follower_count ?? 0) < g.min_followers) return false;
  }
  return true;
}

function passesThresholds(row: any, type: "post" | "poem", cfg: QualConfig): boolean {
  const t = cfg.thresholds ?? {};
  const likes = type === "post" ? (row.reaction_count ?? 0) : (row.upvote_count ?? 0);
  const comments = row.comment_count ?? 0;
  const shares = type === "poem" ? (row.share_count ?? 0) : 0;
  const views = type === "post" ? (row.trending_score ?? 0) : 0;
  const reads = type === "poem" ? (row.read_count ?? 0) : 0;
  const bookmarks = type === "poem" ? (row.bookmark_count ?? 0) : 0;
  if (t.likes && likes < t.likes) return false;
  if (t.comments && comments < t.comments) return false;
  if (t.shares && shares < t.shares) return false;
  if (t.views && views < t.views) return false;
  if (t.reads && reads < t.reads) return false;
  if (t.bookmarks && bookmarks < t.bookmarks) return false;
  return true;
}

function score(row: any, type: "post" | "poem", w: Record<string, number> = {}) {
  const wl = w.likes ?? 1, wc = w.comments ?? 3, ws = w.shares ?? 2;
  const wv = w.views ?? 0.01, wr = w.reads ?? 0.05, wb = w.bookmarks ?? 2;
  if (type === "post") {
    return (row.reaction_count ?? 0) * wl + (row.comment_count ?? 0) * wc + (row.trending_score ?? 0) * wv;
  }
  return (row.upvote_count ?? 0) * wl + (row.comment_count ?? 0) * wc
    + (row.share_count ?? 0) * ws + (row.read_count ?? 0) * wr
    + (row.bookmark_count ?? 0) * wb;
}

function reasonSnapshot(row: any, type: "post" | "poem", s: number, method?: string) {
  if (type === "post") {
    return {
      likes: row.reaction_count ?? 0,
      comments: row.comment_count ?? 0,
      views: Math.round(row.trending_score ?? 0),
      score: Math.round(s),
      method,
    };
  }
  return {
    likes: row.upvote_count ?? 0,
    comments: row.comment_count ?? 0,
    reads: row.read_count ?? 0,
    bookmarks: row.bookmark_count ?? 0,
    shares: row.share_count ?? 0,
    score: Math.round(s),
    method,
  };
}

async function qualifyCompetition(admin: any, comp: any) {
  const cfg = (comp.qualification_config ?? {}) as QualConfig;
  const method = cfg.method ?? (comp.qualification_method as any);
  if (!method) return 0;
  const { type, rows } = await fetchCandidates(admin, comp, cfg);
  if (!rows.length) return 0;

  // Profile lookup for account-age / follower gates.
  const userIds = Array.from(new Set(rows.map((r: any) => type === "post" ? r.owner_id : r.author_id).filter(Boolean)));
  let profileMap = new Map<string, any>();
  if (userIds.length && (cfg.gates?.min_account_age_days || cfg.gates?.min_followers)) {
    const { data: profs } = await admin.from("profiles")
      .select("id, created_at, follower_count").in("id", userIds);
    profileMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
  }

  const scored = rows
    .map((r: any) => {
      const uid = type === "post" ? r.owner_id : r.author_id;
      const prof = profileMap.get(uid);
      if (!passesGates(r, type, cfg, prof)) return null;
      if ((method === "fixed" || method === "approval") && !passesThresholds(r, type, cfg)) return null;
      return { row: r, uid, s: score(r, type, cfg.weights) };
    })
    .filter(Boolean) as { row: any; uid: string; s: number }[];

  let selected = scored;
  if (method === "top_n_week" || method === "top_n_month") {
    const n = cfg.top_n ?? 10;
    selected = scored.sort((a, b) => b.s - a.s).slice(0, n);
  } else if (method === "top_percent") {
    const pct = cfg.top_percent ?? 5;
    const n = Math.max(1, Math.ceil((pct / 100) * scored.length));
    selected = scored.sort((a, b) => b.s - a.s).slice(0, n);
  }

  const pendingApproval = method === "approval" || comp.auto_approve === false;
  const status = pendingApproval ? "pending_approval" : "active";

  let created = 0;
  for (const s of selected) {
    // De-dupe: skip if a competitor already exists for this content in this competition.
    const dupField = type === "post" ? "post_id" : "poem_id";
    const { data: existing } = await admin.from("competition_competitors")
      .select("id").eq("competition_id", comp.id).eq(dupField, s.row.id).maybeSingle();
    if (existing) continue;

    const snap = reasonSnapshot(s.row, type, s.s, method);
    const sortMax = await admin.from("competition_competitors")
      .select("sort_order").eq("competition_id", comp.id)
      .order("sort_order", { ascending: false }).limit(1).maybeSingle();

    // Try to derive display name/photo from profile.
    let name = "Auto entry"; let photo: string | null = null;
    if (s.uid) {
      const { data: prof } = await admin.from("profiles")
        .select("username, avatar_url").eq("id", s.uid).maybeSingle();
      if (prof) { name = prof.username ?? name; photo = prof.avatar_url ?? null; }
    }

    const insertRow: any = {
      competition_id: comp.id,
      linked_user_id: s.uid ?? null,
      name,
      photo_url: photo,
      origin: "auto",
      status,
      qualification_reason: snap,
      sort_order: (sortMax.data?.sort_order ?? 0) + 1,
    };
    if (type === "post") insertRow.post_id = s.row.id;
    else insertRow.poem_id = s.row.id;

    const { error } = await admin.from("competition_competitors").insert(insertRow);
    if (error) continue;

    await admin.from("competition_qualification_log").upsert({
      competition_id: comp.id,
      content_type: type,
      content_id: s.row.id,
      user_id: s.uid ?? null,
      score: s.s,
      method,
      snapshot: snap,
    }, { onConflict: "competition_id,content_type,content_id" });

    if (s.uid) {
      await admin.from("notifications").insert({
        user_id: s.uid,
        kind: pendingApproval ? "competition_pending_approval" : "competition_auto_qualified",
        target_type: "competition",
        target_id: comp.id,
        payload: { competition_name: comp.name, reason: snap },
      });
    }
    created++;
  }

  return created;
}

/**
 * Run the qualifier for one competition (admin trigger) or for every live/upcoming
 * smart/hybrid competition (drain).
 */
export const runQualification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { competitionId?: string }) => d ?? {})
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;

    let q = admin.from("competitions").select("*")
      .in("entry_mode", ["smart", "hybrid"])
      .in("status", ["live", "upcoming"]);
    if (data.competitionId) q = q.eq("id", data.competitionId);
    const { data: comps } = await q;
    if (!comps?.length) return { ok: true, created: 0, competitions: 0 };

    let total = 0;
    for (const c of comps) total += await qualifyCompetition(admin, c);

    // Mark queued events as processed (best-effort drain marker).
    await admin.from("competition_qualification_events")
      .update({ processed_at: new Date().toISOString() })
      .is("processed_at", null);

    return { ok: true, created: total, competitions: comps.length };
  });

/** Admin lists pending-approval auto competitors across all competitions. */
export const listPendingQualifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("competition_competitors")
      .select("*, competition:competitions(id,name,slug)")
      .eq("origin", "auto")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });

/** Admin: approve or reject a pending auto-qualified competitor. */
export const decideQualification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { competitorId: string; approve: boolean; note?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const status = data.approve ? "active" : "rejected";

    const { data: comp } = await admin.from("competition_competitors")
      .select("id, linked_user_id, competition_id, qualification_reason")
      .eq("id", data.competitorId).maybeSingle();
    if (!comp) throw new Error("Not found");

    const nextReason = { ...(comp.qualification_reason ?? {}), note: data.note ?? null };
    const { error } = await admin.from("competition_competitors")
      .update({ status, qualification_reason: nextReason })
      .eq("id", data.competitorId);
    if (error) throw new Error(error.message);

    if (comp.linked_user_id) {
      await admin.from("notifications").insert({
        user_id: comp.linked_user_id,
        kind: data.approve ? "competition_approved" : "competition_rejected",
        target_type: "competition",
        target_id: comp.competition_id,
        payload: { note: data.note ?? null },
      });
    }
    return { ok: true };
  });
