import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Trophy } from "lucide-react";
import { listCompetitions, listCategories } from "@/lib/competitions.functions";
import { CompetitionCard, type CompetitionSummary } from "@/components/competitions/CompetitionCard";
import { CompetitionEditorDialog, emptyCompetition } from "@/components/competitions/CompetitionEditorDialog";
import { useMyRoles } from "@/lib/use-my-role";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/competitions")({
  head: () => ({
    meta: [
      { title: "Community Competitions" },
      { name: "description", content: "Join community voting competitions, vote for favorites, and win rewards." },
      { property: "og:title", content: "Community Competitions" },
      { property: "og:description", content: "Vote, join, and win in community competitions." },
    ],
  }),
  component: CompetitionsIndex,
});

function CompetitionsIndex() {
  const list = useServerFn(listCompetitions);
  const cats = useServerFn(listCategories);
  const { data: comps = [] } = useQuery({ queryKey: ["competitions"], queryFn: () => list({}) });
  const { data: categories = [] } = useQuery({ queryKey: ["competition-categories"], queryFn: () => cats({}) });
  const [category, setCategory] = useState<string>("all");
  const [editing, setEditing] = useState<any | null>(null);
  const { isAdmin } = useMyRoles();

  const filtered = useMemo(() => {
    if (category === "all") return comps;
    return (comps as any[]).filter((c) => c.category?.slug === category);
  }, [comps, category]);

  const live = (filtered as CompetitionSummary[]).filter((c) => c.status === "live");
  const upcoming = (filtered as CompetitionSummary[]).filter((c) => c.status === "upcoming");
  const ended = (filtered as CompetitionSummary[]).filter((c) => c.status === "completed");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 pb-24 text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/feed"><Button size="icon" variant="ghost"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-lg font-bold">
              <Trophy className="h-5 w-5 text-amber-400" /> Competitions
            </h1>
            <p className="text-xs text-muted-foreground">Vote, join, and win in community events.</p>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setEditing(emptyCompetition())}>
              <Plus className="mr-1 h-4 w-4" /> New
            </Button>
          )}
          <Link to="/competitions/leaderboard">
            <Button variant="outline" size="sm">Leaderboard</Button>
          </Link>
        </div>
      </header>

      <CompetitionEditorDialog value={editing} onChange={setEditing} />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant={category === "all" ? "default" : "outline"} onClick={() => setCategory("all")}>All</Button>
          {(categories as any[]).filter((c) => c.enabled).map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={category === c.slug ? "default" : "outline"}
              onClick={() => setCategory(c.slug)}
              style={category === c.slug ? { background: c.color, borderColor: c.color } : undefined}
            >
              {c.name}
            </Button>
          ))}
        </div>

        <Tabs defaultValue="live">
          <TabsList>
            <TabsTrigger value="live">Live ({live.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="ended">Ended ({ended.length})</TabsTrigger>
          </TabsList>
          {[
            ["live", live] as const,
            ["upcoming", upcoming] as const,
            ["ended", ended] as const,
          ].map(([k, items]) => (
            <TabsContent key={k} value={k} className="mt-4">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-muted-foreground">
                  No competitions here yet.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((c) => <CompetitionCard key={c.id} c={c} />)}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
