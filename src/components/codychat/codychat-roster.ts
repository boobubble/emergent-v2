import { getCodyChatPublicBaseUrl } from "@/lib/codychat-public-url";
import type { User } from "@/lib/chat-types";

export const YAARZO_CODY_ROSTER_MESSAGE = "YAARZO_CODY_ROSTER" as const;

export type CodyChatGuestRosterEntry = {
  codyUserId: string;
  name: string;
  avatar?: string;
  level: number;
  country?: string;
  gender?: string;
  isGuest: true;
};

export type CodyChatGuestRosterMessage = {
  type: typeof YAARZO_CODY_ROSTER_MESSAGE;
  guests: CodyChatGuestRosterEntry[];
};

export type YaarzoRosterMember =
  | {
      kind: "user";
      member: User & { isOfficial?: boolean };
    }
  | {
      kind: "guest";
      codyUserId: string;
      name: string;
      avatarUrl?: string;
      level: number;
      country?: string;
      gender?: "male" | "female" | "other";
    };

const CODY_ORIGIN = getCodyChatPublicBaseUrl();

export function getCodyChatMessageOrigin(): string {
  try {
    return new URL(CODY_ORIGIN).origin;
  } catch {
    return CODY_ORIGIN.replace(/\/+$/, "");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseGuestGender(raw: unknown): "male" | "female" | "other" | undefined {
  if (raw === "male" || raw === "female" || raw === "other") return raw;
  if (raw === "1" || raw === 1) return "male";
  if (raw === "2" || raw === 2) return "female";
  if (raw === "3" || raw === 0 || raw === "0") return "other";
  return undefined;
}

function parseGuestEntry(raw: unknown): CodyChatGuestRosterEntry | null {
  if (!isRecord(raw)) return null;
  const codyUserId = String(raw.codyUserId ?? "").trim();
  const name = String(raw.name ?? "").trim();
  if (!codyUserId || !name) return null;
  const levelRaw = raw.level;
  const level =
    typeof levelRaw === "number" && Number.isFinite(levelRaw)
      ? Math.max(0, Math.floor(levelRaw))
      : 1;
  const avatar = typeof raw.avatar === "string" && raw.avatar.trim() ? raw.avatar.trim() : undefined;
  const country = typeof raw.country === "string" && raw.country.trim() ? raw.country.trim() : undefined;
  const gender = typeof raw.gender === "string" ? raw.gender : undefined;
  if (raw.isGuest !== true && raw.isGuest !== undefined) return null;
  return {
    codyUserId,
    name,
    avatar,
    level,
    country,
    gender,
    isGuest: true,
  };
}

export function parseCodyChatGuestRosterMessage(data: unknown): CodyChatGuestRosterEntry[] | null {
  if (!isRecord(data)) return null;
  if (data.type !== YAARZO_CODY_ROSTER_MESSAGE) return null;
  if (!Array.isArray(data.guests)) return null;
  const guests: CodyChatGuestRosterEntry[] = [];
  for (const item of data.guests) {
    const parsed = parseGuestEntry(item);
    if (parsed) guests.push(parsed);
  }
  return guests;
}

export function isCodyChatRosterMessageEvent(
  event: MessageEvent,
  iframeWindow: Window | null | undefined,
): boolean {
  if (event.origin !== getCodyChatMessageOrigin()) return false;
  if (!iframeWindow || event.source !== iframeWindow) return false;
  return parseCodyChatGuestRosterMessage(event.data) !== null;
}

export function sanitizeCodyGuestAvatarUrl(
  avatar: string | undefined,
  codyOrigin: string = getCodyChatMessageOrigin(),
): string | undefined {
  if (!avatar?.trim()) return undefined;
  const trimmed = avatar.trim();
  try {
    const resolved = trimmed.startsWith("//")
      ? new URL(`https:${trimmed}`)
      : new URL(trimmed, codyOrigin.endsWith("/") ? codyOrigin : `${codyOrigin}/`);
    if (resolved.protocol !== "https:" && resolved.protocol !== "http:") return undefined;
    const origin = resolved.origin;
    if (origin !== codyOrigin && origin !== new URL(codyOrigin).origin) {
      if (!trimmed.startsWith("/")) return undefined;
    }
    return resolved.href;
  } catch {
    return undefined;
  }
}

export function codyGuestToRosterMember(entry: CodyChatGuestRosterEntry): YaarzoRosterMember {
  return {
    kind: "guest",
    codyUserId: entry.codyUserId,
    name: entry.name,
    avatarUrl: sanitizeCodyGuestAvatarUrl(entry.avatar),
    level: entry.level,
    country: entry.country,
    gender: parseGuestGender(entry.gender),
  };
}

export function mergeYaarzoRosterMembers(
  signedInOnline: Array<User & { isOfficial?: boolean }>,
  codyGuests: CodyChatGuestRosterEntry[],
): YaarzoRosterMember[] {
  const signedInNames = new Set(
    signedInOnline.map((m) => m.name.trim().toLowerCase()).filter(Boolean),
  );
  const users: YaarzoRosterMember[] = signedInOnline.map((m) => ({ kind: "user", member: m }));
  const guests: YaarzoRosterMember[] = [];
  for (const g of codyGuests) {
    if (!g.name.trim()) continue;
    if (signedInNames.has(g.name.trim().toLowerCase())) continue;
    guests.push(codyGuestToRosterMember(g));
  }
  guests.sort((a, b) => {
    if (a.kind !== "guest" || b.kind !== "guest") return 0;
    return b.level - a.level || a.name.localeCompare(b.name);
  });
  return [...users, ...guests];
}

export function filterRosterMembersByQuery(
  members: YaarzoRosterMember[],
  query: string,
): YaarzoRosterMember[] {
  const q = query.trim().toLowerCase();
  if (!q) return members;
  return members.filter((m) => {
    if (m.kind === "user") return m.member.name.toLowerCase().includes(q);
    return m.name.toLowerCase().includes(q);
  });
}

export function rosterOnlineCount(members: YaarzoRosterMember[]): number {
  return members.filter((m) => {
    if (m.kind === "guest") return true;
    return !m.member.isBot && m.member.status === "online";
  }).length;
}

export function guestRosterEntryToDisplayUser(
  guest: Extract<YaarzoRosterMember, { kind: "guest" }>,
): User {
  return {
    id: `cody-guest:${guest.codyUserId}`,
    name: guest.name,
    avatarColor: "oklch(0.45 0.02 260)",
    avatarUrl: guest.avatarUrl,
    status: "online",
    isGuest: true,
    gender: guest.gender,
    xp: 0,
    level: guest.level,
    showGuestBadge: true,
  };
}
