/**
 * Validate guest nicknames (raw input before prefix).
 * Display form is always `${prefix}${nickname}` e.g. Guest-Arman.
 */

import { GUEST_LOBBY_CHANNEL_ID } from "@/lib/guest-chat-config";
import { trimUrlTrailingPunctuation } from "@/lib/media-embed-text";
import { parseYoutubeId } from "@/lib/media-providers-config";

/** Stable client error code when guest sends a disallowed non-YouTube link. */
export const GUEST_LINK_BLOCKED = "GUEST_LINK_BLOCKED";

export const GUEST_LINK_BLOCKED_MESSAGE =
  "Links are not allowed for guests. Sign up to share links.";

export type GuestNicknameResult =
  | { ok: true; nickname: string }
  | { ok: false; reason: string };

const RESERVED = new Set([
  "admin", "administrator", "mod", "moderator", "owner", "staff", "system",
  "bot", "bots", "support", "yaarzo", "official", "null", "undefined",
  "guest", "anonymous", "anon", "root", "superadmin", "super_admin",
]);

/** Lightweight client+server blocklist (profanity / abuse). Not exhaustive. */
const BLOCKED = [
  "fuck", "shit", "bitch", "asshole", "cunt", "nigger", "nigga", "faggot",
  "retard", "whore", "slut", "porn", "sex", "nude", "naked", "kill yourself",
  "kys", "rape",
];

export function validateGuestNickname(
  raw: unknown,
  opts: { minLength: number; maxLength: number },
): GuestNicknameResult {
  if (typeof raw !== "string") return { ok: false, reason: "Nickname is required." };
  const v = raw.trim();
  if (v.length < opts.minLength) {
    return { ok: false, reason: `Nickname must be at least ${opts.minLength} characters.` };
  }
  if (v.length > opts.maxLength) {
    return { ok: false, reason: `Nickname must be at most ${opts.maxLength} characters.` };
  }
  if (!/^[a-zA-Z0-9 _-]+$/.test(v)) {
    return { ok: false, reason: "Only letters, numbers, spaces, _ and - are allowed." };
  }
  if (/<|>|\/|\\|&|"|'|`|\0/.test(v)) {
    return { ok: false, reason: "Nickname contains unsafe characters." };
  }
  if (/\s{2,}/.test(v)) {
    return { ok: false, reason: "Avoid repeated spaces." };
  }
  const compact = v.replace(/[\s_-]+/g, "").toLowerCase();
  if (!compact) return { ok: false, reason: "Nickname is required." };
  if (RESERVED.has(compact) || RESERVED.has(v.toLowerCase())) {
    return { ok: false, reason: "That nickname is reserved." };
  }
  if (/^guest/i.test(compact) || /^admin/i.test(compact) || /^mod/i.test(compact)) {
    return { ok: false, reason: "That nickname is reserved." };
  }
  const lower = v.toLowerCase();
  for (const bad of BLOCKED) {
    if (lower.includes(bad) || compact.includes(bad.replace(/\s+/g, ""))) {
      return { ok: false, reason: "Please choose a different nickname." };
    }
  }
  return { ok: true, nickname: v };
}

/** Reject bot commands / game actions in guest text. */
export function isBotCommandOrAction(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (t.startsWith("!")) return true;
  if (/^\/(mute|kick|ban|clear|delete|help)\b/i.test(t)) return true;
  return false;
}

export function looksLikeHtmlOrScript(text: string): boolean {
  return /<\s*script\b|javascript:|on\w+\s*=|<\s*iframe\b|<\s*img\b/i.test(text);
}

/** Extract http(s) and www. URL tokens from guest message text. */
export function extractGuestMessageUrls(text: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const add = (raw: string) => {
    const token = trimUrlTrailingPunctuation(raw);
    const key = token.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      urls.push(token);
    }
  };
  for (const m of text.matchAll(/\bhttps?:\/\/\S+/gi)) add(m[0]);
  const withoutHttp = text.replace(/\bhttps?:\/\/\S+/gi, " ");
  for (const m of withoutHttp.matchAll(/\bwww\.\S+/gi)) add(m[0]);
  return urls;
}

function normalizeGuestUrlToken(url: string): string {
  return /^www\./i.test(url) ? `https://${url}` : url;
}

/**
 * Guest lobby may contain no URLs, or only supported YouTube URLs.
 * Every detected URL must pass parseYoutubeId().
 */
export function assertGuestLobbyUrlsAllowed(
  text: string,
): { ok: true } | { ok: false; code: string; message: string } {
  const urls = extractGuestMessageUrls(text);
  if (urls.length === 0) return { ok: true };
  for (const token of urls) {
    const normalized = normalizeGuestUrlToken(token);
    if (!parseYoutubeId(token) && !parseYoutubeId(normalized)) {
      return { ok: false, code: "LINK", message: GUEST_LINK_BLOCKED };
    }
  }
  return { ok: true };
}

/** Pure server/client guard used by RPC path and unit tests. */
export function assertGuestLobbyPlainText(input: {
  enabled: boolean;
  channelId: string;
  text: string;
  maxLen: number;
}): { ok: true } | { ok: false; code: string; message: string } {
  if (!input.enabled) return { ok: false, code: "DISABLED", message: "Guest chat is currently disabled." };
  if (input.channelId !== GUEST_LOBBY_CHANNEL_ID) {
    return { ok: false, code: "ROOM", message: "Guests can only send messages in Lobby." };
  }
  if (isBotCommandOrAction(input.text)) {
    return { ok: false, code: "BOT", message: "GUEST_BOT_BLOCKED" };
  }
  if (looksLikeHtmlOrScript(input.text)) {
    return { ok: false, code: "HTML", message: "HTML/script content is not allowed." };
  }
  if (input.text.trim().length > input.maxLen) {
    return { ok: false, code: "LENGTH", message: "Message too long." };
  }
  return { ok: true };
}