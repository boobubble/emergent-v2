import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Swords, Users, Clock, Trophy } from "lucide-react";
import { listPoetryBattles, type PoetryBattle } from "@/lib/mehfil-battles.functions";
import { MehfilShell } from "@/components/mehfil/MehfilShell";

export const Route = createFileRoute("/poetry/challenges")({
  head: () => ({
    meta: [
      { title: "Poetry Battles · Poetry Hub" },
      { name: "description", content: "Live and upcoming poetry battles. Submit your verse and compete for the top spot." },
    ],
  }),
  component: ChallengesPage,
});

const TABS = [
  { key: "active" as const, label: "🔥 Live" },
  { key: "upcoming" as const, label: "⏳ Upcoming" },
  { key: "ended" as const, label: "🏆 Past Winners" },
];

function ChallengesPage() {
  const [scope, setScope] = useState<"active" | "upcoming" | "ended">("active");
  const fetchBattles = useServerFn(listPoetryBattles);
  const q = useQuery({
    queryKey: ["mehfil", "battles", scope],
    queryFn: () => fetchBattles({ data: { scope } }),
  });

  return (
    <MehfilShell showBack>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">⚔️ Poetry Battles</h1>
        <p className="text-sm text-muted-foreground">Weekly, themed and community challenges. Winners earn XP, coins and a Hall of Fame entry.</p>
      </div>

      <div className="mb-5 flex gap-1 rounded-xl border border-border/60 bg-card p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setScope(t.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${scope === t.key ? "bg-primary text-primary-foreground shadow" : "hover:bg-muted"}`}
          >{t.label}</button>
        ))}
      </div>

      {q.isLoading && <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>}
      {q.data && q.data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
          <Swords className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground">No {scope} battles right now. Check back soon.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(q.data ?? []).map((b) => <BattleCard key={b.id} battle={b} />)}
      </div>
    </MehfilShell>
  );
}

function BattleCard({ battle }: { battle: PoetryBattle }) {
  const endsIn = new Date(battle.end_at).getTime() - Date.now();
  const days = Math.max(0, Math.floor(endsIn / 86400000));
  return (
    <Link
      to="/competitions/$slug"
      params={{ slug: battle.slug }}
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-lg transition"
    >
      {battle.banner_url ? (
        <img src={battle.banner_url} alt="" className="h-32 w-full object-cover" />
      ) : (
        <div className="h-32 w-full bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-amber-500/30 flex items-center justify-center">
          <Swords className="h-10 w-10 text-white/80" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
          {battle.category && (
            <span className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${battle.category.color ?? "#8b5cf6"}22`, color: battle.category.color ?? "#8b5cf6" }}>
              {battle.category.name}
            </span>
          )}
          <span className="text-muted-foreground">{battle.status.toUpperCase()}</span>
        </div>
        <h3 className="mt-2 font-serif text-lg font-bold group-hover:text-primary">{battle.name}</h3>
        {battle.mehfil_theme && <p className="text-xs italic text-muted-foreground">Theme: {battle.mehfil_theme}</p>}
        {battle.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{battle.description}</p>}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {battle.total_participants} entries</span>
          {battle.status === "live" && <span className="inline-flex items-center gap-1 text-primary font-semibold"><Clock className="h-3 w-3" /> {days}d left</span>}
          {battle.status === "completed" && <span className="inline-flex items-center gap-1 text-amber-500 font-semibold"><Trophy className="h-3 w-3" /> Ended</span>}
        </div>
      </div>
    </Link>
  );
}
