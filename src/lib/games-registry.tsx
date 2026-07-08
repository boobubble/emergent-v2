import type { ComponentType, LazyExoticComponent } from "react";
import type { LucideIcon } from "lucide-react";
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
export const GAMES: Record<string, GameDef> = {};

export function getGame(key: string | undefined): GameDef | null {
  if (!key) return null;
  return GAMES[key] ?? null;
}

export function listGames(): GameDef[] {
  return Object.values(GAMES);
}

