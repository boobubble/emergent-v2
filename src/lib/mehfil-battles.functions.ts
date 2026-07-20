/**
 * Poetry Hub Poetry Battles — thin wrappers over the existing Competition Engine.
 * No new competition tables; a Poetry Battle is a `competitions` row with
 * `type='poetry_battle'`.
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { MehfilPoem, MehfilPoemEnriched } from "./mehfil-types";

function pub() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export interface PoetryBattle {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  rules: string | null;
  start_at: string;
  end_at: string;
  status: string;
  winner_count: number;
  max_entries: number | null;
  mehfil_category_id: string | null;
  mehfil_theme: string | null;
  total_participants: number;
  total_votes: number;
  category?: { id: string; slug: string; name: string; color: string | null } | null;
}

export const listPoetryBattles = createServerFn({ method: "GET" })
  .inputValidator((input: { scope?: "active" | "upcoming" | "ended" | "all" } | undefined) => input ?? { scope: "active" as const })
  .handler(async ({ data }) => {
    const sb = pub();
    let q = sb.from("competitions").select("*").eq("type", "poetry_battle").order("start_at", { ascending: false }).limit(30);
    if (data.scope === "active") q = q.eq("status", "live");
    else if (data.scope === "upcoming") q = q.eq("status", "upcoming");
    else if (data.scope === "ended") q = q.eq("status", "completed");
    const { data: rows, error } = await q;
    if (error) throw error;
    const battles = (rows ?? []) as unknown as PoetryBattle[];
    const catIds = Array.from(new Set(battles.map((b) => b.mehfil_category_id).filter((x): x is string => !!x)));
    if (catIds.length) {
      const { data: cats } = await sb.from("mehfil_categories").select("id, slug, name, color").in("id", catIds);
      const cmap = new Map((cats ?? []).map((c) => [c.id, c]));
      battles.forEach((b) => { b.category = b.mehfil_category_id ? cmap.get(b.mehfil_category_id) ?? null : null; });
    }
    return battles;
  });

export const getPoetryBattle = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const sb = pub();
    const { data: b, error } = await sb.from("competitions").select("*").eq("slug", data.slug).eq("type", "poetry_battle").maybeSingle();
    if (error) throw error;
    if (!b) return null;
    const battle = b as unknown as PoetryBattle;

    // Load entries (participants linked to poems)
    const { data: parts } = await sb.from("competition_participants")
      .select("id, user_id, mehfil_poem_id, vote_count, rank, status")
      .eq("competition_id", battle.id)
      .eq("status", "approved")
      .order("vote_count", { ascending: false })
      .limit(100);

    const poemIds = (parts ?? []).map((p) => p.mehfil_poem_id).filter((x): x is string => !!x);
    let poems: MehfilPoemEnriched[] = [];
    if (poemIds.length) {
      const { data: poemRows } = await sb.from("mehfil_poems").select("*").in("id", poemIds);
      const authorIds = Array.from(new Set((poemRows ?? []).map((p) => p.author_id)));
      const [{ data: profiles }, { data: cats }] = await Promise.all([
        sb.from("profiles").select("id, username, display_name, avatar_url, country_code").in("id", authorIds),
        sb.from("mehfil_categories").select("id, slug, name, color, icon"),
      ]);
      const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
      const cmap = new Map((cats ?? []).map((c) => [c.id, c]));
      poems = ((poemRows ?? []) as MehfilPoem[]).map((p) => ({
        ...p,
        category: p.category_id ? (cmap.get(p.category_id) as any) ?? null : null,
        author: (pmap.get(p.author_id) as any) ?? null,
        writer_rank: "poet" as const,
      }));
    }
    return { battle, entries: parts ?? [], poems };
  });
