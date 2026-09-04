/**
 * SSR-safe competition reads (service role). Client navigations should use
 * `getCompetitionBySlug` server fn instead — see competitions.$slug loader.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CompetitionDb = any;

function normalizeCompetitionSlug(slug: string): string {
  return (slug ?? "").trim().replace(/\s+/g, "-");
}

export async function fetchCompetitionCore(sb: CompetitionDb, filter: { id?: string; slug?: string }) {
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

export async function getPublishedCompetitionBySlug(slug: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return fetchCompetitionCore(supabaseAdmin, { slug: normalizeCompetitionSlug(slug) });
}
