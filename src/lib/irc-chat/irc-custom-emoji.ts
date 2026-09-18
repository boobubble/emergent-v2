/** IRC custom emoji tokens — pure text utilities (no DOM). */

/** Matches Postgres gen_random_uuid() strings (case-insensitive). */
export const CUSTOM_EMOJI_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TOKEN_IN_TEXT_RE =
  /:e:([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}):/gi;

export type MessageSegment =
  | { type: "text"; value: string }
  | { type: "emoji"; id: string; raw: string };

export function isValidCustomEmojiId(id: string): boolean {
  return CUSTOM_EMOJI_ID_RE.test(id.trim());
}

export function createCustomEmojiToken(id: string): string {
  const trimmed = id.trim();
  if (!isValidCustomEmojiId(trimmed)) {
    throw new Error("Invalid custom emoji id");
  }
  return `:e:${trimmed.toLowerCase()}:`;
}

export function parseMessageSegments(text: string): MessageSegment[] {
  if (!text) return [{ type: "text", value: "" }];

  const segments: MessageSegment[] = [];
  let lastIndex = 0;
  const re = new RegExp(TOKEN_IN_TEXT_RE.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    const raw = match[0];
    const id = match[1];
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    if (isValidCustomEmojiId(id)) {
      segments.push({ type: "emoji", id: id.toLowerCase(), raw });
    } else {
      segments.push({ type: "text", value: raw });
    }
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  if (segments.length === 0) {
    return [{ type: "text", value: text }];
  }

  return segments;
}

export function resolveCustomEmojiUrl(
  id: string,
  byId: ReadonlyMap<string, { url: string }>,
): string | null {
  if (!isValidCustomEmojiId(id)) return null;
  const row = byId.get(id.toLowerCase());
  return row?.url ?? null;
}
