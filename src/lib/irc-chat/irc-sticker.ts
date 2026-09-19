/** IRC sticker tokens — pure text utilities (no DOM). */

import { CUSTOM_EMOJI_ID_RE, isValidCustomEmojiId } from "./irc-custom-emoji";

const STICKER_TOKEN_RE =
  /:s:([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}):/gi;

export type IrcMessageContentType = "text" | "sticker" | "image" | "file";

export function createStickerToken(id: string): string {
  const trimmed = id.trim().toLowerCase();
  if (!isValidCustomEmojiId(trimmed)) {
    throw new Error("Invalid sticker id");
  }
  return `:s:${trimmed}:`;
}

export function parseStickerIdFromToken(text: string): string | null {
  const trimmed = text.trim();
  const match = /^:s:([0-9a-f-]{36}):$/i.exec(trimmed);
  if (!match) return null;
  const id = match[1].toLowerCase();
  return isValidCustomEmojiId(id) ? id : null;
}

export function isStickerOnlyMessageText(text: string): boolean {
  return parseStickerIdFromToken(text) !== null;
}

export function inferContentTypeFromText(
  text: string,
  stickerId?: string | null,
  contentType?: string | null,
): IrcMessageContentType {
  if (contentType === "sticker") return "sticker";
  if (stickerId && isValidCustomEmojiId(stickerId)) return "sticker";
  if (isStickerOnlyMessageText(text)) return "sticker";
  return "text";
}

export function resolveStickerIdForMessage(
  text: string,
  stickerId?: string | null,
  contentType?: string | null,
): string | undefined {
  const kind = inferContentTypeFromText(text, stickerId, contentType);
  if (kind !== "sticker") return undefined;
  if (stickerId && isValidCustomEmojiId(stickerId)) {
    return stickerId.trim().toLowerCase();
  }
  return parseStickerIdFromToken(text) ?? undefined;
}

export function stripStickerTokensFromText(text: string): string {
  return text.replace(new RegExp(STICKER_TOKEN_RE.source, "gi"), "").trim();
}
