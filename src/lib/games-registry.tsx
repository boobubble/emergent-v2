import { type ComponentType, type LazyExoticComponent } from "react";
import { type LucideIcon } from "lucide-react";
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
 * Registry of pluggable Game Room games. Currently empty — add entries here
 * plus a matching file under src/components/games/rooms/ to plug in new games.
 */
export const GAMES: Record<string, GameDef> = {};

export function canonicalGameType(key: string | undefined): string | undefined {
  return key;
}

export function getGame(key: string | undefined): GameDef | null {
  const canonical = canonicalGameType(key);
  if (!canonical) return null;
  return GAMES[canonical] ?? null;
}

export function listGames(): GameDef[] {
  return [];
}
