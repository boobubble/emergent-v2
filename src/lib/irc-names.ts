/**
 * Client-side IRC NAMES line parsing (mirrors scripts/gateway/irc-names.cjs).
 */

const IGNORE_NICKS = new Set(["yaarzogateway", "yaarzo-gateway"]);

const NUMERIC_353_RE = / \d+ \S+ [=@] (#\S+) :(.+)$/i;
const NUMERIC_366_RE = / \d+ \S+ (#\S+) :End of \/NAMES/i;

function normalizeRoom(channel: string): string {
  return channel.startsWith("#") ? channel.slice(1) : channel;
}

export function stripIrcNameToken(token: string): string {
  let t = token.trim();
  if (!t) return "";
  if (/^[@+%~&]/.test(t)) t = t.slice(1);
  return t.trim();
}

export function parseNames353Line(line: string): { room: string; nicks: string[] } | null {
  const match = NUMERIC_353_RE.exec(line);
  if (!match) return null;
  const room = normalizeRoom(match[1]);
  const nicks = (match[2] || "")
    .split(/\s+/)
    .map(stripIrcNameToken)
    .filter((n) => n && !IGNORE_NICKS.has(n.toLowerCase()));
  return { room, nicks };
}

export function parseNames366Line(line: string): { room: string } | null {
  const match = NUMERIC_366_RE.exec(line);
  if (!match) return null;
  return { room: normalizeRoom(match[1]) };
}
