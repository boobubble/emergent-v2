import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Swords, ChevronRight, Sparkles } from "lucide-react";
import { getMehfilDiscovery } from "@/lib/mehfil.functions";
import { poemPreview } from "@/lib/mehfil-types";

export function MehfilTrendingWidget() {
  const fetchDiscovery = useServerFn(getMehfilDiscovery);
  const { data } = useQuery({
    queryKey: ["mehfil", "trending", "widget"],
    queryFn: () => fetchDiscovery(),
    staleTime: 60_000,
  });

  const poems = (data?.sections.find((s) => s.key === "trending")?.poems ?? []).slice(0, 5);
  if (poems.length === 0) return null;

  return (
    <div className="feed-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-serif text-sm font-bold">🔥 Trending on Poetry Hub</span>
        </div>
        <Link to="/poetry" className="text-xs font-semibold text-primary inline-flex items-center gap-0.5">
          Explore <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto p-3 scrollbar-thin">
        {poems.map((p) => (
          <Link
            key={p.id}
            to="/poetry/$slug"
            params={{ slug: p.slug }}
            className="group shrink-0 w-64 rounded-xl border border-border/60 bg-card p-3 hover:border-primary/50 hover:shadow-md transition"
            style={p.theme ? { background: p.theme } : undefined}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {p.category?.name ?? "Poetry"}
            </div>
            <h3 className="mt-1 line-clamp-2 font-serif text-sm font-bold group-hover:text-primary">{p.title}</h3>
            <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-muted-foreground">{poemPreview(p.body, 120)}</p>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>❤ {p.upvote_count}</span>
              <span>👁 {p.read_count}</span>
              <span className="truncate">by {p.author?.display_name || p.author?.username || "Anonymous"}</span>
            </div>
          </Link>
        ))}
        <Link to="/poetry/challenges" className="shrink-0 w-56 rounded-xl border border-dashed border-primary/50 bg-primary/5 p-3 flex flex-col justify-center items-center text-center hover:bg-primary/10 transition">
          <Swords className="h-5 w-5 text-primary mb-1" />
          <div className="text-sm font-semibold">Poetry Battles</div>
          <div className="text-[11px] text-muted-foreground">Join weekly challenges</div>
        </Link>
      </div>
    </div>
  );
}
