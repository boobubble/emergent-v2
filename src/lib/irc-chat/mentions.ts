import type { IrcChatMember } from "./types";
import type { RemoteProfile } from "@/lib/use-remote-profiles";
import { isUuid } from "@/lib/dm-utils";

function profileUserIdForMember(member: IrcChatMember): string | null {
  if (member.isGuest) return null;
  if (member.userId.startsWith("visitor_") || member.userId.startsWith("irc:")) {
    return null;
  }
  return isUuid(member.userId) ? member.userId : null;
}

/** Active `@query` at caret — query is lowercased for filtering. */
export type MentionTokenMatch = {
  query: string;
  start: number;
  end: number;
};

const MENTION_TOKEN_RE = /(?:^|\s)@([\w[\]\\^{}|`-]*)$/;

export function findActiveMentionToken(text: string, caret: number): MentionTokenMatch | null {
  if (!text.includes("@")) return null;
  const before = text.slice(0, Math.max(0, caret));
  const m = MENTION_TOKEN_RE.exec(before);
  if (!m) return null;
  const query = m[1];
  const start = caret - query.length - 1;
  return { query: query.toLowerCase(), start, end: caret };
}

export type IrcMentionCandidate = {
  /** Text inserted after `@` (username or IRC nick). */
  mentionKey: string;
  nick: string;
  displayName: string;
  userId?: string;
  avatarUrl?: string | null;
};

export function buildIrcMentionCandidates(
  members: IrcChatMember[],
  directoryProfiles: Record<string, RemoteProfile>,
  options?: { excludeUserId?: string | null; excludeNick?: string | null },
): IrcMentionCandidate[] {
  const excludeId = options?.excludeUserId?.trim().toLowerCase();
  const excludeNick = options?.excludeNick?.trim().toLowerCase();
  const seen = new Set<string>();
  const out: IrcMentionCandidate[] = [];

  for (const member of members) {
    if (excludeNick && member.nick.toLowerCase() === excludeNick) continue;
    const profileId = profileUserIdForMember(member);
    if (excludeId && profileId?.toLowerCase() === excludeId) continue;
    if (excludeId && member.userId.toLowerCase() === excludeId) continue;

    const profile = profileId ? directoryProfiles[profileId] : undefined;
    const username = profile?.username?.trim();
    const mentionKey = (username || member.nick).trim();
    if (!mentionKey) continue;
    const dedupe = mentionKey.toLowerCase();
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);

    out.push({
      mentionKey,
      nick: member.nick,
      displayName: username || member.nick,
      userId: profileId ?? undefined,
      avatarUrl: profile?.avatar_url ?? null,
    });
  }

  return out.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function filterMentionCandidates(
  candidates: IrcMentionCandidate[],
  query: string,
  limit = 6,
): IrcMentionCandidate[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return candidates.slice(0, limit);
  }
  return candidates
    .filter((c) => {
      const key = c.mentionKey.toLowerCase();
      const nick = c.nick.toLowerCase();
      const name = c.displayName.toLowerCase();
      return key.includes(q) || nick.includes(q) || name.includes(q);
    })
    .sort((a, b) => {
      const aKey = a.mentionKey.toLowerCase();
      const bKey = b.mentionKey.toLowerCase();
      const aStarts = aKey.startsWith(q) || a.nick.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = bKey.startsWith(q) || b.nick.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.displayName.localeCompare(b.displayName);
    })
    .slice(0, limit);
}

export function applyMentionInsertion(
  text: string,
  caret: number,
  token: MentionTokenMatch,
  mentionKey: string,
): { nextText: string; nextCaret: number } {
  const before = text.slice(0, token.start);
  const after = text.slice(caret);
  const inserted = `@${mentionKey} `;
  const nextText = before + inserted + after;
  const nextCaret = (before + inserted).length;
  return { nextText, nextCaret };
}

export type MentionTextPart =
  | { type: "text"; value: string }
  | { type: "mention"; value: string; known: boolean; mentionsSelf: boolean };

const INLINE_MENTION_RE = /@([\w[\]\\^{}|`-]+)/g;

export function splitTextMentionParts(
  text: string,
  knownKeys: ReadonlySet<string>,
  selfKeys: ReadonlySet<string>,
): MentionTextPart[] {
  if (!text) return [{ type: "text", value: "" }];
  const parts: MentionTextPart[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(INLINE_MENTION_RE.source, "g");
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }
    const raw = match[0];
    const key = match[1];
    const lower = key.toLowerCase();
    const known = knownKeys.has(lower);
    parts.push({
      type: "mention",
      value: raw,
      known,
      mentionsSelf: known && selfKeys.has(lower),
    });
    last = match.index + raw.length;
  }
  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }
  return parts.length ? parts : [{ type: "text", value: text }];
}

export function buildMentionKeySet(
  members: IrcChatMember[],
  directoryProfiles: Record<string, RemoteProfile>,
): Set<string> {
  const keys = new Set<string>();
  for (const member of members) {
    keys.add(member.nick.toLowerCase());
    const profileId = profileUserIdForMember(member);
    const username = profileId ? directoryProfiles[profileId]?.username?.trim() : "";
    if (username) keys.add(username.toLowerCase());
  }
  return keys;
}

export function buildSelfMentionKeys(
  selfNick: string | null,
  selfUsername: string | null | undefined,
): Set<string> {
  const keys = new Set<string>();
  const nick = selfNick?.trim();
  if (nick) keys.add(nick.toLowerCase());
  const user = selfUsername?.trim();
  if (user) keys.add(user.toLowerCase());
  return keys;
}

export function messageMentionsSelf(
  text: string,
  selfKeys: ReadonlySet<string>,
): boolean {
  if (!selfKeys.size) return false;
  const parts = splitTextMentionParts(text, selfKeys, selfKeys);
  return parts.some((p) => p.type === "mention" && p.mentionsSelf);
}
