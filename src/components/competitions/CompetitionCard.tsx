import { Link } from "@tanstack/react-router";
import { Pencil, Trophy, Users, Vote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Countdown } from "./Countdown";

export interface CompetitionSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  banner_url?: string | null;
  status: "draft" | "upcoming" | "live" | "completed";
  start_at: string;
  end_at: string;
  total_votes: number;
  total_participants: number;
  category?: { name: string; color?: string | null; icon_url?: string | null } | null;
}

const statusStyle: Record<string, string> = {
  live: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  upcoming: "bg-sky-500/20 text-sky-400 border-sky-500/40",
  completed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40",
  draft: "bg-amber-500/20 text-amber-400 border-amber-500/40",
};

export function CompetitionCard({ c }: { c: CompetitionSummary }) {
  const color = c.category?.color ?? "#8b5cf6";
  return (
    <Link
      to="/competitions/$id"
      params={{ id: c.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-2xl"
    >
      <div
        className="relative h-32 w-full overflow-hidden"
        style={{
          background: c.banner_url
            ? `url(${c.banner_url}) center/cover`
            : `linear-gradient(135deg, ${color}, ${color}80)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {c.category && (
            <Badge variant="outline" className="border-white/30 bg-white/10 text-white backdrop-blur">
              {c.category.name}
            </Badge>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <Badge className={`border ${statusStyle[c.status]} uppercase`}>{c.status}</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-bold">{c.name}</h3>
          {c.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c.total_participants}</span>
          <span className="inline-flex items-center gap-1"><Vote className="h-3.5 w-3.5" /> {c.total_votes}</span>
          <span className="inline-flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> {c.status === "completed" ? "Ended" : "Live"}</span>
        </div>
        {c.status !== "completed" ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-2">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              {c.status === "live" ? "Ends in" : "Starts in"}
            </div>
            <Countdown endAt={c.status === "live" ? c.end_at : c.start_at} compact />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
