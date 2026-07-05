import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Trophy } from "lucide-react";
import { getLeaderboard } from "@/lib/competitions.functions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/competitions/leaderboard")({
  head: () => ({
    meta: [
      { title: "Competition Leaderboard" },
      { name: "description", content: "Top winners, voters, and most-joined members in community competitions." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const fn = useServerFn(getLeaderboard);
  const [range, setRange] = useState<"week" | "month" | "all">("all");
  const { data } = useQuery({
    queryKey: ["competition-leaderboard", range],
    queryFn: () => fn({ data: { range } }),
  });

  const Row = ({ r, unit, i }: { r: any; unit: string; i: number }) => (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
      <span className="w-6 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
      <Avatar className="h-9 w-9">
        <AvatarImage src={r.profile?.avatar_url ?? undefined} />
        <AvatarFallback style={{ background: r.profile?.avatar_color ?? undefined }}>
          {(r.profile?.username ?? "?").slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 truncate text-sm font-semibold">{r.profile?.username ?? "Anonymous"}</div>
      <div className="text-sm font-bold tabular-nums">{r.count} <span className="text-xs font-normal text-muted-foreground">{unit}</span></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link to="/competitions"><Button size="icon" variant="ghost"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <Trophy className="h-5 w-5 text-amber-400" /> Competition Leaderboard
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex gap-2">
          {(["week", "month", "all"] as const).map((r) => (
            <Button key={r} size="sm" variant={range === r ? "default" : "outline"} onClick={() => setRange(r)}>
              {r === "week" ? "Weekly" : r === "month" ? "Monthly" : "All Time"}
            </Button>
          ))}
        </div>
        <Tabs defaultValue="wins">
          <TabsList>
            <TabsTrigger value="wins">Most Wins</TabsTrigger>
            <TabsTrigger value="votes">Most Votes</TabsTrigger>
            <TabsTrigger value="joins">Most Joined</TabsTrigger>
          </TabsList>
          <TabsContent value="wins" className="mt-4 space-y-2">
            {(data?.wins ?? []).map((r: any, i: number) => <Row key={r.user_id} r={r} unit="wins" i={i} />)}
          </TabsContent>
          <TabsContent value="votes" className="mt-4 space-y-2">
            {(data?.votes ?? []).map((r: any, i: number) => <Row key={r.user_id} r={r} unit="votes" i={i} />)}
          </TabsContent>
          <TabsContent value="joins" className="mt-4 space-y-2">
            {(data?.joins ?? []).map((r: any, i: number) => <Row key={r.user_id} r={r} unit="joined" i={i} />)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
