import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Row { user_id: string; time_ms: number; moves: number; name?: string }

export function LeaderboardPanel({ levelId, kind = "level" }: { levelId: string | null; kind?: "level" | "daily" }) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!levelId) return;
    let cancelled = false;
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const q = sb.from("pathflow_scores")
        .select("user_id, time_ms, moves")
        .eq("level_id", levelId)
        .eq("kind", kind)
        .order("time_ms", { ascending: true })
        .limit(10);
      const { data } = await q;
      if (cancelled || !Array.isArray(data)) return;
      const ids = Array.from(new Set(data.map((r: Row) => r.user_id)));
      const { data: profs } = await sb.from("profiles").select("id, display_name, username").in("id", ids);
      const nameById: Record<string, string> = {};
      for (const p of profs ?? []) nameById[p.id] = p.display_name || p.username || "Player";
      setRows(data.map((r: Row) => ({ ...r, name: nameById[r.user_id] || "Player" })));
    })();
    return () => { cancelled = true };
  }, [levelId, kind]);

  return (
    <div className="mx-auto mt-3 w-full max-w-[680px] px-2 pb-3">
      <div className="rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur-xl">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Trophy className="h-3.5 w-3.5" /> Top times
        </div>
        {rows.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground">Be the first to complete this level.</div>
        ) : (
          <ol className="space-y-1">
            {rows.map((r, i) => (
              <li key={r.user_id + i} className="flex items-center justify-between rounded-lg bg-background/40 px-2 py-1.5 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-semibold text-muted-foreground">{i + 1}</span>
                  <span className="truncate">{r.name}</span>
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {fmt(r.time_ms)} · {r.moves}m
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
