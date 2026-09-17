import { ircPmChannelForNick, ircPmPeerId } from "../irc-pm-utils";
import type { IrcChatMessage } from "./types";
import { isValidMessageId } from "./protocol";

export { ircPmChannelForNick, ircPmPeerId };

export function appendPrivateMessage(
  privateMessages: Record<string, IrcChatMessage[]>,
  peerNick: string,
  message: IrcChatMessage,
): Record<string, IrcChatMessage[]> {
  const channelId = ircPmChannelForNick(peerNick);
  const existing = privateMessages[channelId] || [];
  if (existing.some((m) => m.id === message.id)) return privateMessages;
  return {
    ...privateMessages,
    [channelId]: [...existing, message].sort((a, b) => a.ts - b.ts),
  };
}

export function confirmPrivateMessage(
  privateMessages: Record<string, IrcChatMessage[]>,
  peerNick: string,
  messageId: string,
): Record<string, IrcChatMessage[]> {
  const channelId = ircPmChannelForNick(peerNick);
  const list = privateMessages[channelId];
  if (!list?.length) return privateMessages;
  return {
    ...privateMessages,
    [channelId]: list.map((m) =>
      m.id === messageId ? { ...m, pending: false, failed: false } : m,
    ),
  };
}

export function markPrivateMessageFailed(
  privateMessages: Record<string, IrcChatMessage[]>,
  peerNick: string,
  messageId: string,
): Record<string, IrcChatMessage[]> {
  const channelId = ircPmChannelForNick(peerNick);
  const list = privateMessages[channelId];
  if (!list?.length) return privateMessages;
  return {
    ...privateMessages,
    [channelId]: list.map((m) =>
      m.id === messageId ? { ...m, pending: false, failed: true } : m,
    ),
  };
}

export function receivePrivateMessage(
  privateMessages: Record<string, IrcChatMessage[]>,
  peerNick: string,
  incoming: Omit<IrcChatMessage, "roomId">,
): Record<string, IrcChatMessage[]> {
  if (!isValidMessageId(incoming.id)) return privateMessages;
  const channelId = ircPmChannelForNick(peerNick);
  return appendPrivateMessage(privateMessages, peerNick, {
    ...incoming,
    roomId: channelId,
  });
}

export function peerAuthorIdForOutgoingPm(
  selfUserId: string,
  selfNick: string,
): string {
  return selfUserId || ircPmPeerId(selfNick);
}

export type IrcPmPeerKind = "registered" | "guest" | "irc_nick";

export function classifyPmPeer(member: { userId: string; isGuest?: boolean }): IrcPmPeerKind {
  if (member.isGuest || member.userId.startsWith("visitor_")) return "guest";
  if (member.userId.startsWith("irc:")) return "irc_nick";
  return "registered";
}
