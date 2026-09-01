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

export const GAME_BOT_ID_SET = new Set<string>(GAME_BOT_IDS);

export const GAMES_ONLY_CMD_REJECTION = "Game commands are available in #Games only.";

export function isGameBotId(id: string): boolean {
  return GAME_BOT_ID_SET.has(id);
}

export function isGamesChannel(channelId: string): boolean {
  return channelId === GAMES_CHANNEL_ID;
}

/** Block inserting game-bot-authored messages outside #games (DMs with bots exempt). */
export function canInsertGameBotMessage(channelId: string, authorId: string): boolean {
  if (!isGameBotId(authorId)) return true;
  if (channelId.startsWith("dm:")) return true;
  return channelId === GAMES_CHANNEL_ID;
}

/** Hide game-bot messages when rendering non-games rooms (DMs exempt). */
export function shouldHideGameBotMessage(channelId: string, authorId: string): boolean {
  if (!isGameBotId(authorId)) return false;
  if (channelId.startsWith("dm:")) return false;
  return channelId !== GAMES_CHANNEL_ID;
}

/** Remove game bots from membership for any room except #games. */
export function sanitizeRoomMembers(roomId: string, members: string[]): string[] {
  if (roomId === GAMES_CHANNEL_ID) return members;
  return members.filter((id) => !isGameBotId(id));
}

/** Game bots may auto-reply only in #games. */
export function canGameBotAutoReply(channelId: string, botId: string): boolean {
  return isGameBotId(botId) && channelId === GAMES_CHANNEL_ID;
}

/** Pick a non-game-bot author for command replies outside #games. */
export function commandReplyAuthor(from: string | undefined, channelId: string): string {
  const id = from || "bot-gamebot";
  if (isGameBotId(id) && !isGamesChannel(channelId) && !channelId.startsWith("dm:")) {
    return "bot-echo";
  }
  return id;
}
