import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import type { Room } from "@/lib/chat-types";
import { getGame } from "@/lib/games-registry";
import { GameHeader } from "./GameHeader";
import { SystemEventFeed } from "./SystemEventFeed";

/**
 * Full game-room canvas. Replaces MessageList + MessageInput when the
 * active room has kind === "game". Loads the game module lazily.
 */
export function GameRoomCanvas({ room }: { room: Room }) {
  const cfg = room.game;
  const game = getGame(cfg?.type);

  if (!cfg || !game) {
    return (
      <div className="grid flex-1 place-items-center px-6 text-center">
        <div className="flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <div className="text-sm font-semibold text-foreground">Game not configured</div>
          <p className="text-xs">
            This game room has no game assigned. An admin can configure one from
            <span className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-[11px]">/admin/chatrooms</span>.
          </p>
        </div>
      </div>
    );
  }

  const GameComponent = game.Component;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <GameHeader room={room} game={game} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Suspense
          fallback={
            <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
              Loading {game.label}…
            </div>
          }
        >
          <GameComponent room={room} config={cfg} />
        </Suspense>
      </div>
      <SystemEventFeed channelId={room.id} />
    </div>
  );
}
