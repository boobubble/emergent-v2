import type { SupabaseClient } from "@supabase/supabase-js";
import { isRegisteredDmChannel } from "./chat-image-retention";
import { isRemoteDmChannel, isUuid } from "./dm-utils";

export type ChatImageAssetRecord = {
  id: string;
  storage_path: string;
  uploader_id: string;
  channel_id: string;
  message_id: string | null;
  image_seen_at: string | null;
  image_expires_at: string | null;
  image_expired: boolean;
};

export type ChatImageChannelKind =
  | "lobby"
  | "games"
  | "dm"
  | "trio"
  | "community"
  | "unknown";

export function classifyChatImageChannel(channelId: string): ChatImageChannelKind {
  if (channelId === "lobby") return "lobby";
  if (channelId === "games") return "games";
  if (isRegisteredDmChannel(channelId)) return "dm";
  if (channelId.startsWith("trio:")) return "trio";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(channelId)) {
    return "community";
  }
  return "unknown";
}

/**
 * Pure mirror of authenticated messages SELECT policies (for tests/documentation).
 * Live authorization uses RLS via authorizeChatImageAssetAccess().
 */
export function mirrorsMessagesSelectForImageAccess(opts: {
  userId: string | null | undefined;
  banned: boolean;
  channelId: string;
  dmParticipant?: boolean;
  trioMember?: boolean;
  communityReadAllowed?: boolean;
}): boolean {
  if (!opts.userId || !isUuid(opts.userId)) return false;
  if (opts.banned) return false;

  const kind = classifyChatImageChannel(opts.channelId);
  switch (kind) {
    case "lobby":
    case "games":
      return true;
    case "dm":
      return opts.dmParticipant === true;
    case "trio":
      return opts.trioMember === true;
    case "community":
      return opts.communityReadAllowed === true;
    default:
      return false;
  }
}

export function isRegistryAssetExpired(
  asset: ChatImageAssetRecord,
  nowMs = Date.now(),
): boolean {
  if (asset.image_expired) return true;
  if (!asset.image_expires_at) return false;
  return new Date(asset.image_expires_at).getTime() <= nowMs;
}

/** Mirror attachment expiry for client rendering (server mirror fields only). */
export function isEphemeralAttachmentExpired(
  attachment: {
    assetId?: string;
    imageExpired?: boolean;
    imageExpiresAt?: string;
  } | null | undefined,
  nowMs = Date.now(),
): boolean {
  if (!attachment?.assetId) return false;
  if (attachment.imageExpired) return true;
  if (!attachment.imageExpiresAt) return false;
  return new Date(attachment.imageExpiresAt).getTime() <= nowMs;
}

/** Anonymous users cannot resolve ephemeral chat images (fail closed). */
export function canAnonymousResolveChatImage(): boolean {
  return false;
}

export function denyImageAccessResponse() {
  return { url: null as string | null, expired: false, forbidden: true as const };
}

/**
 * Authoritative check: user may resolve image only if messages RLS allows reading
 * the linked message row (same rules as chat message SELECT).
 */
export async function authorizeChatImageAssetAccess(
  supabase: Pick<SupabaseClient, "from">,
  userId: string,
  asset: ChatImageAssetRecord,
): Promise<boolean> {
  if (!isUuid(userId)) return false;

  // Orphan preview: uploader may resolve before message insert links the asset.
  if (!asset.message_id) {
    return asset.uploader_id === userId;
  }

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id")
      .eq("id", asset.message_id)
      .maybeSingle();

    if (error || !data?.id) return false;
    return true;
  } catch {
    return false;
  }
}

/** DM channel helper used in tests mirroring is_dm_channel_allowed. */
export function isDmChannelParticipant(channelId: string, userId: string): boolean {
  return isRemoteDmChannel(channelId, userId);
}
