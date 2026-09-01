/** Platform channel IDs for lobby vs games bot separation. */
export const LOBBY_CHANNEL_ID = "lobby";
export const GAMES_CHANNEL_ID = "games";

/** Game bots — present only in #games. */
export const GAME_BOT_IDS = [
  "bot-gamebot",
  "bot-dig",
  "bot-fish",
  "bot-wine",
  "bot-pixel",
  "bot-nova",
  "bot-ryze",
] as const;

/** Lobby bots — moderation + social only. */
export const LOBBY_BOT_IDS = ["bot-spam", "bot-echo"] as const;

/** Non-game bots allowed to auto-reply in lobby. */
export const LOBBY_AUTO_REPLY_BOT_IDS = new Set<string>(["bot-echo"]);

export const BOT_EVENTS_TARGET_CHANNEL = GAMES_CHANNEL_ID;

export function isGameBotId(id: string): boolean {
  return (GAME_BOT_IDS as readonly string[]).includes(id);
}
