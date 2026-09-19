const ROOM_SLUG_RE = /^[a-z0-9][a-z0-9\-]{0,63}$/i;

function validateIrcRoomSlug(room: string): boolean {
  const id = room.trim();
  if (!id || id.includes(":")) return false;
  return ROOM_SLUG_RE.test(id);
}

/** Supabase channel_id prefix for IRC public room uploads. */
export function ircChatAttachmentChannelId(roomKey: string): string {
  const room = roomKey.trim();
  return `irc:${room}`;
}

export function isIrcChatAttachmentChannel(channelId: string): boolean {
  return channelId.startsWith("irc:") && channelId.length > 4;
}

export function parseIrcRoomFromAttachmentChannel(channelId: string): string | null {
  if (!isIrcChatAttachmentChannel(channelId)) return null;
  const room = channelId.slice(4).trim();
  return validateIrcRoomSlug(room) ? room : null;
}

export const IRC_CHAT_ATTACHMENT_MAX_BYTES = 2 * 1024 * 1024;

export const IRC_CHAT_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const IRC_CHAT_FILE_MIMES = new Set([
  "application/pdf",
  "text/plain",
]);

export function classifyIrcAttachmentMime(mime: string): "image" | "file" | null {
  const normalized = mime.trim().toLowerCase();
  if (IRC_CHAT_IMAGE_MIMES.has(normalized)) return "image";
  if (IRC_CHAT_FILE_MIMES.has(normalized)) return "file";
  return null;
}

export function sanitizeAttachmentDisplayName(name: string): string {
  const base = name.replace(/[\r\n]/g, "").replace(/[<>]/g, "").trim();
  if (!base) return "file";
  return base.slice(0, 120);
}

export function buildIrcAttachmentStoragePath(
  roomKey: string,
  assetId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "file";
  const room = roomKey.replace(/[^a-zA-Z0-9:_-]+/g, "_").slice(0, 120);
  return `irc/${room}/${assetId}/${safeName}`;
}

export function validateIrcAttachmentStoragePath(path: string): boolean {
  if (!/^irc\/[^/]+\/[0-9a-f-]{36}\/[^/]+$/i.test(path)) return false;
  if (path.includes("..")) return false;
  return true;
}
