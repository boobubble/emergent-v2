import { Trophy, Users, Eye, Gauge, X } from "lucide-react";
import type { Room } from "@/lib/chat-types";
import type { GameDef } from "@/lib/games-registry";
import { useChat } from "@/lib/chat-store";

export function GameHeader({ room, game }: { room: Room; game: GameDef }) {
  const { setActive, state } = useChat();
  const cfg = room.game;
  const spectators = cfg?.spectators ? Math.max(0, room.members.length - 1) : 0;
  const Icon = game.icon;
  const fallback = state.roomOrder.find(id => state.rooms[id]?.kind !== "game") || "lobby";

  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-border bg-card/60 px-3 py-2 backdrop-blur sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-foreground">{room.name}</span>
            {cfg?.featured && (
              <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-300">
                Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="truncate">{game.label}</span>
            {cfg?.difficulty && (
              <>
                <span className="opacity-40">·</span>
                <span className="inline-flex items-center gap-0.5 capitalize">
                  <Gauge className="h-3 w-3" /> {cfg.difficulty}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 text-[11px]">
        <Stat icon={<Users className="h-3 w-3" />} value={room.members.length} label="players" />
        {cfg?.spectators && (
          <Stat icon={<Eye className="h-3 w-3" />} value={spectators} label="watching" />
        )}
        {(cfg?.coinReward ?? 0) > 0 && (
          <Stat icon={<Trophy className="h-3 w-3 text-amber-400" />} value={`+${cfg?.coinReward}`} label="coins" />
        )}
        <button
          type="button"
          onClick={() => setActive(fallback)}
          className="ml-1 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/20"
          title="Leave room"
        >
          <X className="h-3 w-3" /> Leave
        </button>
      </div>
    </header>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2 py-0.5 text-muted-foreground ring-1 ring-border">
      {icon}
      <span className="font-semibold text-foreground">{value}</span>
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
