// Path Flow (Path Escape) was fully removed. No games are currently registered.
// This shim keeps the public API stable for any remaining callers.

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

export const GAMES: Record<string, GameDef> = {};

export function canonicalGameType(key: string | undefined): string | undefined {
  return key ?? undefined;
}

export function getGame(_key: string | undefined): GameDef | null {
  return null;
}

export function listGames(): GameDef[] {
  return [];
}
