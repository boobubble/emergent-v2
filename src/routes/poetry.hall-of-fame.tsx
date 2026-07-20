import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn, createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { Crown, Trophy, Medal } from "lucide-react";
import { MehfilShell } from "@/components/mehfil/MehfilShell";

export const getMehfilHallOfFame = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data: rows } = await sb.from("mehfil_hall_of_fame")
    .select("*").order("awarded_at", { ascending: false }).limit(100);
  const ids = Array.from(new Set((rows ?? []).map((r: any) => r.user_id)));
  const poemIds = Array.from(new Set((rows ?? []).map((r: any) => r.poem_id).filter(Boolean)));
  const [{ data: profiles }, { data: poems }] = await Promise.all([
    ids.length ? sb.from("profiles").select("id, username, display_name, avatar_url").in("id", ids) : Promise.resolve({ data: [] as any[] }),
    poemIds.length ? sb.from("mehfil_poems").select("id, slug, title").in("id", poemIds) : Promise.resolve({ data: [] as any[] }),
  ]);
  const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
  const poemMap = new Map((poems ?? []).map((p: any) => [p.id, p]));
  return (rows ?? []).map((r: any) => ({ ...r, profile: pmap.get(r.user_id) ?? null, poem: poemMap.get(r.poem_id) ?? null }));
});

export const Route = createFileRoute("/mehfil/hall-of-fame")({
  head: () => ({
    meta: [
      { title: "Hall of Fame · Mehfil" },
      { name: "description", content: "Permanent archive of Mehfil poetry battle winners." },
    ],
  }),
  component: HallOfFamePage,
});

function HallOfFamePage() {
  const fetchHof = useServerFn(getMehfilHallOfFame);
  const q = useQuery({ queryKey: ["mehfil", "hof"], queryFn: () => fetchHof() });

  const groups = new Map<string, any[]>();
  (q.data ?? []).forEach((r: any) => {
    const key = r.period;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  });

  return (
    <MehfilShell showBack>
      <div className="mb-8 text-center">
        <Crown className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="font-serif text-3xl font-bold mt-2">Hall of Fame</h1>
        <p className="text-sm text-muted-foreground">Poets who left their mark. Forever.</p>
      </div>

      {q.isLoading && <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>}
      {q.data && q.data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          The first battle winner will land here. Enter a Poetry Battle to be immortalized.
        </div>
      )}

      {[...groups.entries()].map(([period, rows]) => (
        <section key={period} className="mb-8">
          <h2 className="mb-3 font-serif text-lg font-bold capitalize">{period.replace("_", " ")} Champions</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((r: any) => (
              <div key={r.id} className="rounded-2xl border border-border/60 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-4">
                <div className="flex items-center gap-3">
                  {r.rank === 1 ? <Trophy className="h-6 w-6 text-amber-500" /> : r.rank === 2 ? <Medal className="h-6 w-6 text-slate-400" /> : <Medal className="h-6 w-6 text-orange-500" />}
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Rank #{r.rank}</div>
                    <div className="font-semibold truncate">{r.profile?.display_name || r.profile?.username || "Anonymous"}</div>
                  </div>
                </div>
                {r.poem && (
                  <Link to="/mehfil/$slug" params={{ slug: r.poem.slug }} className="mt-3 block text-sm font-serif italic hover:text-primary">
                    "{r.poem.title}"
                  </Link>
                )}
                <div className="mt-2 text-[11px] text-muted-foreground">Awarded {new Date(r.awarded_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </MehfilShell>
  );
}
