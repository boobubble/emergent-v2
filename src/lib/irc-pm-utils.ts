/**
 * IRC-native private message channel helpers (session/live-only).
 * Registered ↔ registered persistent DMs use dm:uuid:uuid instead.
 */

const IRC_PM_PREFIX = "ircpm:";

export function isIrcPmChannel(channelId: string): boolean {
  return channelId.startsWith(IRC_PM_PREFIX);
}

export function ircPmChannelForNick(nick: string): string {
  const trimmed = nick.trim();
  return `${IRC_PM_PREFIX}${trimmed}`;
}

export function parseIrcPmChannel(channelId: string): string | null {
  if (!isIrcPmChannel(channelId)) return null;
  const nick = channelId.slice(IRC_PM_PREFIX.length).trim();
  return nick || null;
}

export function isIrcPmPeer(peerId: string): boolean {
  return peerId.startsWith("irc:");
}

export function ircPmPeerId(nick: string): string {
  return `irc:${nick.trim()}`;
}

export function parseIrcPmPeer(peerId: string): string | null {
  if (!isIrcPmPeer(peerId)) return null;
  const nick = peerId.slice(4).trim();
  return nick || null;
}

/**
 * Route PM via IRC when either party is guest, IRC-only, or external IRC nick.
 */
export function shouldUseIrcPm(opts: {
  selfIsGuest: boolean;
  peerIsGuest: boolean;
  peerIsIrcOnly: boolean;
  peerIsRegisteredUuid: boolean;
}): boolean {
  if (opts.selfIsGuest) return true;
  if (opts.peerIsGuest) return true;
  if (opts.peerIsIrcOnly) return true;
  if (!opts.peerIsRegisteredUuid) return true;
  return false;
}
