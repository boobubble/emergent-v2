/** Ephemeral IRC membership lines in the chat timeline (not persisted). */
export const IRC_PRESENCE_AUTHOR = "__irc_presence__";

export type IrcPresenceEventKind = "join" | "part" | "quit" | "kick" | "nick";

export type ParsedIrcPresence = {
  event: IrcPresenceEventKind;
  nick: string;
  /** Channel name without leading # (when present on the IRC line). */
  room?: string;
  reason?: string;
  newNick?: string;
};

const NICK_PREFIX = /^:([^!\s]+)!/;
const JOIN_RE = /^:([^!]+)!.* JOIN (#\S+)/i;
const PART_RE = /^:([^!]+)!.* PART (#\S+)(?:\s:(.*))?$/i;
const QUIT_RE = /^:([^!]+)!.* QUIT(?:\s:(.*))?$/i;
const KICK_RE = /^:([^!]+)!.* KICK (#\S+) (\S+)(?:\s:(.*))?$/i;
const NICK_RE = /^:([^!]+)!.* NICK :(\S+)/i;

/** Gateway service nicks — never show as membership events. */
const IGNORE_NICKS = new Set(["yaarzogateway", "yaarzo-gateway"]);

function normalizeRoom(raw: string): string {
  return raw.startsWith("#") ? raw.slice(1) : raw;
}

/**
 * Parse IRC JOIN / PART / QUIT / KICK from a raw gateway line.
 * Returns null for PRIVMSG, PING, numeric replies, and unknown lines.
 */
export function parseIrcPresenceLine(line: string): ParsedIrcPresence | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const join = JOIN_RE.exec(trimmed);
  if (join) {
    const nick = join[1];
    if (IGNORE_NICKS.has(nick.toLowerCase())) return null;
    return { event: "join", nick, room: normalizeRoom(join[2]) };
  }

  const part = PART_RE.exec(trimmed);
  if (part) {
    const nick = part[1];
    if (IGNORE_NICKS.has(nick.toLowerCase())) return null;
    return {
      event: "part",
      nick,
      room: normalizeRoom(part[2]),
      reason: part[3]?.trim() || undefined,
    };
  }

  const quit = QUIT_RE.exec(trimmed);
  if (quit) {
    const nick = quit[1];
    if (IGNORE_NICKS.has(nick.toLowerCase())) return null;
    return { event: "quit", nick, reason: quit[2]?.trim() || undefined };
  }

  const kick = KICK_RE.exec(trimmed);
  if (kick) {
    const victim = kick[3];
    if (IGNORE_NICKS.has(victim.toLowerCase())) return null;
    return {
      event: "kick",
      nick: victim,
      room: normalizeRoom(kick[2]),
      reason: kick[4]?.trim() || undefined,
    };
  }

  const nickChange = NICK_RE.exec(trimmed);
  if (nickChange) {
    const oldNick = nickChange[1];
    const newNick = nickChange[2];
    if (IGNORE_NICKS.has(oldNick.toLowerCase()) || IGNORE_NICKS.has(newNick.toLowerCase())) {
      return null;
    }
    return { event: "nick", nick: oldNick, newNick };
  }

  return null;
}

export function formatIrcPresenceText(
  event: IrcPresenceEventKind,
  nick: string,
  reason?: string,
): string {
  const name = nick.trim() || "Someone";
  switch (event) {
    case "join":
      return `${name} has joined`;
    case "part":
      return reason ? `${name} has left (${reason})` : `${name} has left`;
    case "quit":
      return reason ? `${name} quit (${reason})` : `${name} quit`;
    case "kick":
      return reason ? `${name} was kicked (${reason})` : `${name} was kicked`;
    case "nick":
      return `${name} changed nick`;
    default:
      return name;
  }
}

export function isIrcPresenceMessage(
  authorId: string,
  kind?: string,
): boolean {
  return kind === "irc-presence" || authorId === IRC_PRESENCE_AUTHOR;
}
