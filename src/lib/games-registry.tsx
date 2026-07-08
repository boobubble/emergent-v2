import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Waypoints, type LucideIcon } from "lucide-react";
import type { Room, RoomGameConfig } from "@/lib/chat-types";

export interface GameRuntimeProps {
  room: Room;
  config: RoomGameConfig;
}

export interface GameDef {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  Component: LazyExoticComponent<ComponentType<GameRuntimeProps>>;
}

/**
 * Registry of pluggable Game Room games. Each Component is React.lazy so
 * normal chatrooms never pull in game code. Adding a new game is one entry
 * here + one file under src/components/games/rooms/.
 */
const pathFlowGame: GameDef = {
  key: "path-flow",
  label: "Path Flow",
  description: "Drag path pieces onto the grid to build one continuous arrow route.",
  icon: Waypoints,
  Component: lazy(() => import("@/components/games/rooms/PathFlowGame")),
};

export const GAMES: Record<string, GameDef> = {
  "path-flow": pathFlowGame,
  pathflow: pathFlowGame,
  "arrow-puzzle": pathFlowGame,
  arrowflow: pathFlowGame,
};

export function canonicalGameType(key: string | undefined): string | undefined {
  if (!key) return undefined;
  if (key === "pathflow" || key === "arrow-puzzle" || key === "arrowflow") return "path-flow";
  return key;
}

export function getGame(key: string | undefined): GameDef | null {
  const canonical = canonicalGameType(key);
  if (!canonical) return null;
  return GAMES[canonical] ?? null;
}

export function listGames(): GameDef[] {
  return [pathFlowGame];
}
