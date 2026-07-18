/**
 * Games Hub Registry
 * ------------------
 * Central registry for external games surfaced by /games. The Hub is a
 * LAUNCHER — it does not host gameplay. Registered games are metadata
 * only; clicking Play navigates the user to `launchUrl` (an external
 * application) which communicates back through the Games SDK.
 *
 * Adding a new game requires only calling `registerGame({...})` at
 * module load — the hub UI reads from this registry and renders cards
 * automatically. Nothing is hardcoded in the hub UI for any specific game.
 */

import type { ComponentType } from "react";
import { Puzzle } from "lucide-react";

export type GameCategory =
  | "puzzle"
  | "arcade"
  | "board"
  | "card"
  | "casual"
  | "strategy"
  | "trivia";

export interface HubGame {
  /** Stable id used for cloudsave, achievements, leaderboards. */
  id: string;
  /** Display name. */
  name: string;
  /** Lucide icon component (rendered small in cards). */
  icon: ComponentType<{ className?: string }>;
  /** Optional banner image URL. If omitted a gradient placeholder is used. */
  banner?: string;
  /** Short marketing description shown on the card. */
  description: string;
  /** Category for filters / grouping. */
  category: GameCategory;
  /**
   * External URL the launcher opens when the user clicks Play. The game
   * itself lives outside BooBubble and communicates via the Games SDK.
   */
  launchUrl: string;
  /** Whether this game persists progress via GamesSDK cloudsave. */
  supportsCloudSave: boolean;
  /** Whether the game grants achievements via GamesSDK. */
  supportsAchievements: boolean;
  /** Whether the game submits scores to a leaderboard. */
  supportsLeaderboards: boolean;
  /** Optional flags. */
  featured?: boolean;
  /** Accent gradient (tailwind classes) for the card fallback banner. */
  accent?: string;
}

const REGISTRY = new Map<string, HubGame>();

export function registerGame(game: HubGame): void {
  REGISTRY.set(game.id, game);
}

export function unregisterGame(id: string): void {
  REGISTRY.delete(id);
}

export function getGame(id: string): HubGame | undefined {
  return REGISTRY.get(id);
}

export function listGames(): HubGame[] {
  return Array.from(REGISTRY.values());
}

export function listFeatured(): HubGame[] {
  return listGames().filter((g) => g.featured);
}

// ---------------------------------------------------------------------------
// Built-in registrations
// ---------------------------------------------------------------------------

registerGame({
  id: "premium-2048",
  name: "Premium 2048",
  icon: Puzzle,
  description:
    "Slide tiles, combine matching numbers, and reach 2048. Auto-saves your progress.",
  category: "puzzle",
  launchUrl: "https://premium-2048.boobubble.app",
  supportsCloudSave: true,
  supportsAchievements: true,
  supportsLeaderboards: true,
  featured: true,
  accent: "from-amber-500 via-orange-500 to-rose-500",
});
