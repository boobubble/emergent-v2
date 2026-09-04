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
