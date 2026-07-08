import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Compass, type LucideIcon } from "lucide-react";
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

const pathEscape: GameDef = {
  key: "path-escape",
  label: "Path Escape",
  description: "Drag arrow pieces onto the marked cells to build the escape route.",
  icon: Compass,
  Component: lazy(() => import("@/components/games/rooms/PathEscapeGame")),
};

export const GAMES: Record<string, GameDef> = {
  "path-escape": pathEscape,
  pathescape: pathEscape,
};

export function canonicalGameType(key: string | undefined): string | undefined {
  if (!key) return undefined;
  if (key === "pathescape") return "path-escape";
  return key;
}

export function getGame(key: string | undefined): GameDef | null {
  const canonical = canonicalGameType(key);
  if (!canonical) return null;
  return GAMES[canonical] ?? null;
}

export function listGames(): GameDef[] {
  return [pathEscape];
}
