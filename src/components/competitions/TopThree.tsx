import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface P {
  id: string;
  vote_count: number;
  profile?: { username?: string | null; avatar_url?: string | null; avatar_color?: string | null } | null;
}

const medals = ["🥇", "🥈", "🥉"];

export function TopThree({ participants, hideCounts }: { participants: P[]; hideCounts?: boolean }) {
  const top = [...participants].sort((a, b) => b.vote_count - a.vote_count).slice(0, 3);
  if (top.length === 0) return <p className="text-sm text-muted-foreground">No votes yet.</p>;
  return (
    <div className="space-y-2">
      {top.map((p, i) => (
        <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
          <span className="text-xl">{medals[i]}</span>
          <Avatar className="h-9 w-9">
            <AvatarImage src={p.profile?.avatar_url ?? undefined} />
            <AvatarFallback style={{ background: p.profile?.avatar_color ?? undefined }}>
              {(p.profile?.username ?? "?").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{p.profile?.username ?? "Anonymous"}</div>
          </div>
          {!hideCounts && (
            <div className="text-sm font-bold tabular-nums">{p.vote_count} <span className="text-xs font-normal text-muted-foreground">votes</span></div>
          )}
        </div>
      ))}
    </div>
  );
}
