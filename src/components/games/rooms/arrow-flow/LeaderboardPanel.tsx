import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getArrowFlowLeaderboard } from "@/lib/arrowflow.functions";
import { Trophy, Users, Globe, Calendar, CalendarRange } from "lucide-react";

type Scope = "global" | "today" | "week" | "friends" | "room";

interface Row {
  id: string;
  user_id: string;
  score: number;
  time_ms: number;
  moves: number;
  stars: number;
  perfect: boolean;
  created_at: string;
  room_id: string | null;
  profile: { display_name: string | null; username: string | null; avatar_url: string | null } | null;
}

export function ArrowFlowLeaderboard({
  open,
  onOpenChange,
  levelId,
  roomId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  levelId: string;
  roomId: string | null;
}) {
  const [scope, setScope] = useState<Scope>("global");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchLB = useServerFn(getArrowFlowLeaderboard);

  useEffect(() => {
    if (!open || !levelId) return;
    setLoading(true);
    fetchLB({ data: { levelId, scope, roomId } })
      .then((r) => setRows((r?.rows as Row[]) ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [open, scope, levelId, roomId, fetchLB]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md border-border/50 bg-background/95 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Leaderboard
          </SheetTitle>
        </SheetHeader>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <ScopeBtn active={scope === "global"} onClick={() => setScope("global")} icon={<Globe className="h-3 w-3" />} label="Global" />
          <ScopeBtn active={scope === "today"} onClick={() => setScope("today")} icon={<Calendar className="h-3 w-3" />} label="Today" />
          <ScopeBtn active={scope === "week"} onClick={() => setScope("week")} icon={<CalendarRange className="h-3 w-3" />} label="Week" />
          <ScopeBtn active={scope === "friends"} onClick={() => setScope("friends")} icon={<Users className="h-3 w-3" />} label="Friends" />
          {roomId && <ScopeBtn active={scope === "room"} onClick={() => setScope("room")} icon={<Users className="h-3 w-3" />} label="Room" />}
        </div>
        <div className="mt-3 space-y-1 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 180px)" }}>
          {loading && <div className="py-6 text-center text-xs text-muted-foreground">Loading…</div>}
          {!loading && rows.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">No scores yet — be the first!</div>
          )}
          {rows.map((r, i) => (
            <div
              key={r.id}
              className="flex items-center gap-2 rounded-2xl border border-border/40 bg-card/50 px-3 py-2 backdrop-blur"
            >
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-sm font-semibold text-foreground">
                  {r.profile?.display_name || r.profile?.username || "Player"}
                  {r.perfect && <span className="ml-1 text-amber-400">⭐</span>}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {r.moves} moves · {fmt(r.time_ms)} · {"★".repeat(r.stars)}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-bold text-foreground">{r.score.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ScopeBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
        active ? "border-primary/50 bg-primary/15 text-primary" : "border-border/40 bg-card/40 text-muted-foreground hover:bg-card",
      ].join(" ")}
    >
      {icon} {label}
    </button>
  );
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s - m * 60).padStart(2, "0")}`;
}
