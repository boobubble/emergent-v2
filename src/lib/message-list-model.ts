import type { Message, User } from "./chat-types";
import { fallbackGuestAuthor } from "./guest-lobby-feed";

export function messageAuthorId(message: Pick<Message, "authorId"> | { authorId?: unknown }): string {
  return typeof message.authorId === "string" ? message.authorId : "";
}

/**
 * Drop ignored authors. Never throw on missing authorId (persisted / fetch
 * rows can be incomplete) — that used to blank every mini-DM via ChatErrorBoundary.
 */
export function filterChatMessages(
  msgs: Message[],
  usersById: Record<string, User | undefined>,
  isIgnored: (id: string, isBot?: boolean) => boolean,
): Message[] {
  return msgs.filter((m) => {
    const authorId = messageAuthorId(m);
    const u = authorId ? usersById[authorId] : undefined;
    if (!u || authorId === "me" || authorId.startsWith("visitor_")) return true;
    return !isIgnored(authorId, u.isBot);
  });
}

/** Prefer store/remote profile users; never return an object without a string id. */
export function resolveMessageAuthor(
  usersById: Record<string, User | undefined>,
  authorId: unknown,
): User {
  const id = typeof authorId === "string" ? authorId : "";
  const u = id ? usersById[id] : undefined;
  if (u && typeof u.id === "string" && u.id) return u;
  return fallbackGuestAuthor(id || "unknown");
}

export function safeMessageText(text: unknown): string {
  return typeof text === "string" ? text : "";
}

/** Guest lobby rows use `guestmsg:` ids — not valid `messages.reply_to_id` FK targets. */
export function isGuestMessageId(id: string): boolean {
  return id.startsWith("guestmsg:");
}

/** Keep reply threading in local UI; omit guest targets from remote inserts. */
export function sanitizeRemoteReplyToId(replyToId: string | undefined | null): string | null {
  if (!replyToId || isGuestMessageId(replyToId)) return null;
  return replyToId;
}

/** True when the user is already following the latest messages. */
export function isNearScrollBottom(el: HTMLElement, threshold = 120): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
}

/** Scroll a message list container to the latest message. */
export function scrollMessageListToBottom(el: HTMLElement): void {
  el.scrollTop = el.scrollHeight;
}

/** Group consecutive messages from the same author (5 min window, no reply breaks). */
export function groupChatMessages(
  msgs: Message[],
  isPresenceLine: (m: Message) => boolean,
): Message[][] {
  const groups: Message[][] = [];
  msgs.forEach((m) => {
    if (isPresenceLine(m)) {
      groups.push([m]);
      return;
    }
    const last = groups[groups.length - 1];
    if (
      last &&
      !isPresenceLine(last[0]) &&
      last[0].authorId === m.authorId &&
      !m.replyToId &&
      !last[last.length - 1].replyToId &&
      m.ts - last[last.length - 1].ts < 5 * 60_000
    ) {
      last.push(m);
    } else {
      groups.push([m]);
    }
  });
  return groups;
}
