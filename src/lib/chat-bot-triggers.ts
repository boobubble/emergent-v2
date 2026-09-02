import type { User } from "./chat-types";
import { GAMES_CHANNEL_ID, isGameBotId } from "./chat-bot-channels";

/** Author id for ephemeral room presence lines (join/leave). */
export const SYSTEM_PRESENCE_AUTHOR = "system";

export function mentionPattern(name: string): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`@${escaped}\\b`, "i");
}

/** True when text contains @username for the given display name. */
export function textMentionsName(text: string, name: string): boolean {
  if (!name.trim()) return false;
  return mentionPattern(name).test(text);
}

/**
 * Returns the first room bot explicitly @mentioned in the message.
 * At most one bot — prevents duplicate replies from multiple bots.
 */
export function findMentionedRoomBot(
  text: string,
  users: Record<string, User>,
  memberIds: string[],
): string | null {
  for (const id of memberIds) {
    const user = users[id];
    if (!user?.isBot) continue;
    if (textMentionsName(text, user.name)) return id;
  }
  return null;
}

/** True when a game bot may respond to this mention in the given channel. */
export function canMentionedBotReply(botId: string, channelId: string): boolean {
  if (!isGameBotId(botId)) return true;
  return channelId === GAMES_CHANNEL_ID;
}

/** Echo responds to @Echo with a short friendly reply (not a blind echo of spam). */
export function echoMentionReply(text: string, botName: string): string {
  const stripped = text.replace(mentionPattern(botName), "").trim();
  if (!stripped || /^(hi|hello|hey|yo|sup|hola|howdy)\b/i.test(stripped)) {
    return "Hey! 👋";
  }
  if (/\?\s*$/.test(stripped)) {
    return "Good question — I'm mostly here to chat. Try !help in #games for commands!";
  }
  return `Hey! You said: "${stripped.slice(0, 120)}"`;
}

/** Generic short ack when a non-Echo bot is @mentioned without a help query. */
export function botMentionAck(botName: string): string {
  return `@${botName} here — type !help for what I can do.`;
}

/** True when text @mentions any of the given usernames (AI profile bots). */
export function textMentionsAnyUsername(text: string, usernames: string[]): boolean {
  return usernames.some((u) => textMentionsName(text, u));
}
