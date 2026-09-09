import type { Attachment } from "./chat-types";

export const CHAT_IMAGES_BUCKET = "chat-images";
export const CHAT_IMAGE_RETENTION_MS = 24 * 60 * 60 * 1000;
/** Grace period before deleting uploaded assets that were never linked to a message. */
export const CHAT_IMAGE_ORPHAN_GRACE_MS = 30 * 60 * 1000;
export const CHAT_IMAGE_CLEANUP_BATCH = 100;

export function isRegisteredDmChannel(channelId: string): boolean {
  if (!channelId.startsWith("dm:")) return false;
  const parts = channelId.slice(3).split(":");
  return parts.length === 2 && parts.every((p) => /^[0-9a-f-]{36}$/i.test(p));
}

/** The other participant in a registered-user DM channel. */
export function dmChannelPeerId(channelId: string, readerId: string): string | null {
  if (!isRegisteredDmChannel(channelId)) return null;
  const [a, b] = channelId.slice(3).split(":");
  if (readerId === a) return b;
  if (readerId === b) return a;
  return null;
}

/**
 * Mirror of schedule_dm_chat_image_asset_expiry scheduling rules.
 * Schedules only when the peer sent the image message and the reader is reading it.
 */
export function shouldScheduleDmImageExpiry(opts: {
  channelId: string;
  readerId: string;
  messageAuthorId: string;
  messageCreatedAt: Date | string | number;
  readAt: Date | string | number;
  imageSeenAt?: string | null;
  imageExpired?: boolean;
}): boolean {
  if (opts.imageExpired) return false;
  if (opts.imageSeenAt) return false;
  const peerId = dmChannelPeerId(opts.channelId, opts.readerId);
  if (!peerId || opts.messageAuthorId !== peerId) return false;
  const createdMs = new Date(opts.messageCreatedAt).getTime();
  const readMs = new Date(opts.readAt).getTime();
  return createdMs <= readMs;
}

export function publicChatImageExpiresAt(createdAt: Date | string | number): string {
  const ms = typeof createdAt === "number"
    ? createdAt
    : new Date(createdAt).getTime();
  return new Date(ms + CHAT_IMAGE_RETENTION_MS).toISOString();
}

export function dmChatImageExpiresAt(seenAt: Date | string): string {
  const ms = new Date(seenAt).getTime();
  return new Date(ms + CHAT_IMAGE_RETENTION_MS).toISOString();
}

export function isEphemeralChatImage(attachment: Attachment | null | undefined): boolean {
  return !!attachment?.assetId;
}

export function isChatImageExpired(
  attachment: Attachment | null | undefined,
  nowMs = Date.now(),
): boolean {
  if (!attachment?.assetId) return false;
  if (attachment.imageExpired) return true;
  if (!attachment.imageExpiresAt) return false;
  return new Date(attachment.imageExpiresAt).getTime() <= nowMs;
}

/** Legacy inline dataUrl images without registry asset id stay renderable. */
export function isLegacyInlineImage(attachment: Attachment): boolean {
  return !attachment.assetId && !!attachment.dataUrl;
}

export function validateChatImageStoragePath(path: string): boolean {
  if (!/^(public|dm)\/[^/]+\/[0-9a-f-]{36}\/[^/]+$/i.test(path)) return false;
  if (path.includes("..")) return false;
  return true;
}

export function chatImageStorageScope(channelId: string): "dm" | "public" {
  return isRegisteredDmChannel(channelId) ? "dm" : "public";
}

export function buildChatImageStoragePath(
  channelId: string,
  assetId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "image";
  const scope = chatImageStorageScope(channelId);
  const safeChannel = channelId.replace(/[^a-zA-Z0-9:_-]+/g, "_").slice(0, 200);
  return `${scope}/${safeChannel}/${assetId}/${safeName}`;
}

export function sanitizeEphemeralAttachmentForClient(
  attachment: Attachment,
): Attachment {
  return {
    kind: attachment.kind,
    name: attachment.name,
    mime: attachment.mime,
    size: attachment.size,
    dataUrl: "",
    assetId: attachment.assetId,
    ...(attachment.imageExpiresAt ? { imageExpiresAt: attachment.imageExpiresAt } : {}),
    ...(attachment.imageSeenAt ? { imageSeenAt: attachment.imageSeenAt } : {}),
    ...(attachment.imageExpired ? { imageExpired: attachment.imageExpired } : {}),
  };
}
