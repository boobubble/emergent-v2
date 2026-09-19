import { formatRoomTitlePlain } from "./irc-chat-ui";

const KEYWORD_GLYPHS: [RegExp, string][] = [
  [/\bindia\b/i, "🇮🇳"],
  [/\bpakistan\b/i, "🇵🇰"],
  [/\busa\b|united states|america\b/i, "🇺🇸"],
  [/\buk\b|britain|england\b/i, "🇬🇧"],
  [/\bbangladesh\b/i, "🇧🇩"],
  [/\bnepal\b/i, "🇳🇵"],
  [/\bmusic\b/i, "🎵"],
  [/\bgaming|games?\b/i, "🎮"],
  [/\blahore\b/i, "🇵🇰"],
  [/\bdelhi\b|\bmumbai\b/i, "🇮🇳"],
];

const LEADING_EMOJI_RE = /^(\p{Extended_Pictographic}\uFE0F?)/u;

/** Compact room row glyph: leading emoji in name, keyword flag, or neutral hash. */
export function roomListGlyph(roomName: string): string {
  const plain = formatRoomTitlePlain(roomName);
  const lead = plain.match(LEADING_EMOJI_RE);
  if (lead) return lead[1];
  for (const [re, glyph] of KEYWORD_GLYPHS) {
    if (re.test(plain)) return glyph;
  }
  return "💬";
}

/** Optional one-line topic; omitted when empty or duplicate of title. */
export function roomListSubtitle(topic: string | undefined, plainTitle: string): string | null {
  const t = topic?.trim();
  if (!t) return null;
  const normalized = t.replace(/^#+/, "").trim();
  if (!normalized || normalized.toLowerCase() === plainTitle.toLowerCase()) return null;
  if (normalized.length > 48) return `${normalized.slice(0, 45)}…`;
  return normalized;
}
