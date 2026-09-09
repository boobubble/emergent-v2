import { useState } from "react";
import { Gavel, LogOut, VolumeX, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { useStaffPermissions } from "@/lib/use-staff-permissions";
import { useChannelModeration } from "@/lib/use-channel-moderation";
import { banUser, muteUser, deleteMessageMod, deleteGuestMessageMod } from "@/lib/moderation.functions";
import { isGuestMessageId } from "@/lib/message-list-model";
import { removeGuestLobbyRow } from "@/lib/use-guest-lobby-feed";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Staff actions dropdown (kick / mute / ban / delete) for use in member rows and
 * message hover. Renders nothing when the current user isn't staff or the
 * target isn't actionable (self/bot).
 */
export function StaffActionsMenu({
  targetUserId,
  targetName,
  isBot,
  messageId,
  channelId,
  size = "sm",
  alwaysVisible = false,
}: {
  targetUserId: string;
  targetName: string;
  isBot?: boolean;
  messageId?: string;
  channelId?: string;
  size?: "sm" | "xs";
  alwaysVisible?: boolean;
}) {
  const { state, staffKick, staffLocalMute, removeMessage } = useChat();
  const { user: authUser } = useAuth();
  const perms = useStaffPermissions();
  const activeChannel = channelId ?? state.activeChannel;
  const { isAdmin, isModerator, roomPerms, isStaff } = useChannelModeration(activeChannel);
  const banFn = useServerFn(banUser);
  const muteFn = useServerFn(muteUser);
  const delFn = useServerFn(deleteMessageMod);
  const delGuestFn = useServerFn(deleteGuestMessageMod);
  const [busy, setBusy] = useState(false);

  const isMe = !authUser || targetUserId === authUser.id || targetUserId === "me";
  const isGuestTarget = targetUserId.startsWith("visitor_");
  if (isMe || isBot || !isStaff) return null;

  const canKick = !isGuestTarget && (isAdmin || (isModerator && perms.mod_can_kick) || roomPerms.can_kick);
  const canMute = !isGuestTarget && (isAdmin || (isModerator && perms.mod_can_mute) || roomPerms.can_mute);
  const canBan = !isGuestTarget && (isAdmin || (isModerator && perms.mod_can_ban));
  const canDelete = isAdmin || isModerator || roomPerms.can_delete;
  if (!canKick && !canMute && !canBan && !canDelete) return null;

  const realId = targetUserId === "me" ? authUser?.id ?? "" : targetUserId;

  async function doMute(minutes: number) {
    if (busy) return;
    setBusy(true);
    try {
      await muteFn({ data: { user_id: realId, scope: "room", channel_id: activeChannel, expires_in_minutes: minutes, reason: "Staff mute" } });
      staffLocalMute(targetUserId, activeChannel, minutes, targetName);
      toast.success(`Muted ${targetName} for ${minutes}m`);
    } catch (e) {
      toast.error(`Mute failed: ${(e as Error).message}`);
    } finally { setBusy(false); }
  }

  async function doBan(hours?: number) {
    if (busy) return;
    setBusy(true);
    try {
      await banFn({ data: { user_id: realId, ban_type: hours ? "temp_ban" : "ban", reason: "Staff ban", expires_in_hours: hours } });
      toast.success(hours ? `Banned ${targetName} for ${hours}h` : `Banned ${targetName} permanently`);
    } catch (e) {
      toast.error(`Ban failed: ${(e as Error).message}`);
    } finally { setBusy(false); }
  }

  async function doDelete() {
    if (busy || !messageId) return;
    setBusy(true);
    try {
      if (isGuestMessageId(messageId)) {
        const rawId = messageId.slice("guestmsg:".length);
        await delGuestFn({ data: { message_id: rawId, channel_id: activeChannel } });
        removeGuestLobbyRow(messageId);
      } else {
        await delFn({ data: { message_id: messageId, channel_id: activeChannel } });
        removeMessage(activeChannel, messageId);
      }
      toast.success("Message deleted");
    } catch (e) {
      toast.error(`Delete failed: ${(e as Error).message}`);
    } finally { setBusy(false); }
  }

  const triggerCls = size === "xs"
    ? "grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-warning/15 hover:text-warning"
    : "grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-warning/15 hover:text-warning";
  const visibility = alwaysVisible ? "" : "opacity-0 group-hover:opacity-100 focus:opacity-100";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={e => e.stopPropagation()}
          title="Staff actions"
          aria-label="Staff actions"
          className={`${triggerCls} ${visibility} shrink-0 transition-opacity`}
        >
          <Gavel className={size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52" onClick={e => e.stopPropagation()}>
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Staff actions — @{targetName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canKick && (
          <DropdownMenuItem onSelect={() => { staffKick(targetUserId, activeChannel, targetName); toast.success(`Kicked ${targetName} from this room (5 min)`); }} className="gap-2 text-warning">
            <LogOut className="h-3.5 w-3.5" /> Kick from room (5 min)
          </DropdownMenuItem>
        )}
        {canMute && <>
          <DropdownMenuItem onSelect={() => doMute(15)} className="gap-2">
            <VolumeX className="h-3.5 w-3.5" /> Mute 15 minutes
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => doMute(60)} className="gap-2">
            <VolumeX className="h-3.5 w-3.5" /> Mute 1 hour
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => doMute(60 * 24)} className="gap-2">
            <VolumeX className="h-3.5 w-3.5" /> Mute 1 day
          </DropdownMenuItem>
        </>}
        {canBan && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => doBan(24)} className="gap-2 text-destructive">
            <Ban className="h-3.5 w-3.5" /> Ban 24 hours
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => doBan(24 * 7)} className="gap-2 text-destructive">
            <Ban className="h-3.5 w-3.5" /> Ban 7 days
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => doBan(undefined)} className="gap-2 text-destructive">
            <Ban className="h-3.5 w-3.5" /> Ban permanently
          </DropdownMenuItem>
        </>}
        {canDelete && messageId && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={doDelete} className="gap-2 text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Delete this message
          </DropdownMenuItem>
        </>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
