import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Puzzle, Route as RouteIcon, type LucideIcon } from "lucide-react";
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
 * normal chatrooms never pull in game code. Adding a new game (Chess,
 * Sudoku, 2048…) is one entry here + one file under
 * src/components/games/rooms/.
 */
export const GAMES: Record<string, GameDef> = {
  "arrow-puzzle": {
    key: "arrow-puzzle",
    label: "Arrow Puzzle",
    description: "Rotate arrows so they all point up. Fewer moves = higher score.",
    icon: Puzzle,
    Component: lazy(() => import("@/components/games/rooms/ArrowPuzzleGame")),
  },
  "arrow-flow": {
    key: "arrow-flow",
    label: "Arrow Flow",
    description: "Rotate path pieces so the flow connects source to sink.",
    icon: RouteIcon,
    Component: lazy(() => import("@/components/games/rooms/ArrowFlowGame")),
  },
};

export function getGame(key: string | undefined): GameDef | null {
  if (!key) return null;
  return GAMES[key] ?? null;
}

export function listGames(): GameDef[] {
  return Object.values(GAMES);
}

