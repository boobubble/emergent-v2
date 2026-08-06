import { supabase } from "@/integrations/supabase/client";
import { isRemoteDmChannel, isUuid } from "@/lib/dm-utils";

export const DM_CONVERSATION_READ_EVENT = "palrgo:dm-conversation-read";

export type MarkDmConversationReadResult = {
  lastReadAt: string;
  notificationsMarked: number;
};

/** Dispatch after DB write so NotificationsProvider can optimistically clear badges. */
export function dispatchDmConversationRead(channelId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DM_CONVERSATION_READ_EVENT, { detail: { channelId } }));
}

/**
 * Persist DM read state for the authenticated recipient:
 * 1. Upsert dm_reads.last_read_at for this channel
 * 2. Mark unread notifications targeting this DM channel as read
 *
 * Idempotent and RLS-scoped (user_id must match auth.uid()).
 */
export async function markDmConversationRead(
  userId: string,
  channelId: string,
  opts?: { lastReadAt?: string; skipNotificationDispatch?: boolean },
): Promise<MarkDmConversationReadResult | null> {
  if (!isUuid(userId) || !isRemoteDmChannel(channelId, userId)) return null;

  const lastReadAt = opts?.lastReadAt ?? new Date().toISOString();

  const { error: readErr } = await supabase
    .from("dm_reads")
    .upsert(
      { user_id: userId, channel_id: channelId, last_read_at: lastReadAt },
      { onConflict: "user_id,channel_id" },
    );
  if (readErr) {
    console.error("[dm-read] dm_reads upsert failed", readErr);
    return null;
  }

  const { data: updated, error: notifErr } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("target_type", "dm")
    .eq("target_id", channelId)
    .eq("read", false)
    .select("id");

  if (notifErr) {
    console.error("[dm-read] notifications update failed", notifErr);
  }

  if (!opts?.skipNotificationDispatch) {
    dispatchDmConversationRead(channelId);
  }

  return {
    lastReadAt,
    notificationsMarked: updated?.length ?? 0,
  };
}
