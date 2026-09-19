import type { ChatImageAssetRecord } from "@/lib/chat-image-access";
import { isRegistryAssetExpired } from "@/lib/chat-image-access";
import { isUuid } from "@/lib/dm-utils";
import { isIrcChatAttachmentChannel } from "./irc-attachment-retention";

/** Registered users may resolve IRC public-room attachment assets (not tied to messages table). */
export function authorizeIrcChatAttachmentAccess(
  userId: string,
  asset: ChatImageAssetRecord,
  nowMs = Date.now(),
): boolean {
  if (!isUuid(userId)) return false;
  if (isRegistryAssetExpired(asset, nowMs)) return false;
  if (!isIrcChatAttachmentChannel(asset.channel_id)) return false;
  return true;
}
