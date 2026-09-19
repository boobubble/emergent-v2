import type { IrcChatMessage } from "./types";
import { isStickerOnlyMessageText, resolveStickerIdForMessage } from "./irc-sticker";

export function buildReplyPreviewText(text: string, maxLen = 140): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 1)}…`;
}

export function buildIrcMessageReplyPreview(msg: Pick<IrcChatMessage, "text" | "contentType" | "stickerId">): string {
  const stickerId = resolveStickerIdForMessage(msg.text, msg.stickerId, msg.contentType);
  if (stickerId || isStickerOnlyMessageText(msg.text)) {
    return "Sticker";
  }
  return buildReplyPreviewText(msg.text);
}

export type ResolvedReplyParent = {
  nick: string;
  text: string;
} | null;

export function resolveReplyParent(
  replyToMessageId: string | undefined,
  byId: Map<string, IrcChatMessage>,
): ResolvedReplyParent {
  if (!replyToMessageId) return null;
  const parent = byId.get(replyToMessageId);
  if (!parent) return null;
  return { nick: parent.nick, text: parent.text };
}

export function indexMessagesById(messages: IrcChatMessage[]): Map<string, IrcChatMessage> {
  const map = new Map<string, IrcChatMessage>();
  for (const m of messages) {
    if (m.id) map.set(m.id, m);
  }
  return map;
}
