import { useEffect } from "react";
import { X, Hash } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { resolveMiniDmPeer } from "@/lib/mini-dm";
import { isGuestDmPeer, formatGuestDmLabel } from "@/lib/guest-dm-utils";
import { FrameAvatar } from "@/components/cosmetics/CosmeticBits";
import { cn } from "@/lib/utils";
import { formatDmUnreadBadge } from "@/lib/global-unread";
import { isClientLargeDesktopShell, type ChatroomShellLayout } from "@/components/chat/chatroom-shell";

type ChatConversationTabsProps = {
  shellLayout: ChatroomShellLayout;
};

/**
 * Desktop (lg+) conversation tabs: room + open DMs in the main chat column.
 */
export function ChatConversationTabs({ shellLayout }: ChatConversationTabsProps) {
  const {
    state,
    isDM,
    channelLabel,
    setActive,
    openDmPeerIds,
    openDmTab,
    closeDmTab,
    roomTabChannel,
    dmPeerUnreadCount,
    dmChannelFor,
    watchRemoteChannel,
    guestDmThreads,
  } = useChat();
  const { profiles } = useRemoteProfiles();

  const largeDesktop = isClientLargeDesktopShell(shellLayout);
  const activeChannel = state.activeChannel;
  const activeIsDM = isDM(activeChannel);

  useEffect(() => {
    if (!largeDesktop) return;
    for (const peerId of openDmPeerIds) {
      const ch = dmChannelFor(peerId);
      if (ch) watchRemoteChannel(ch);
    }
  }, [largeDesktop, openDmPeerIds, dmChannelFor, watchRemoteChannel]);

  if (!largeDesktop) return null;

  const roomLabel = channelLabel(roomTabChannel);
  const roomActive = !activeIsDM;

  return (
    <div
      className="chat-glass shrink-0 border-b border-border/60"
      data-chat-conversation-tabs=""
    >
      <div
        className="flex items-stretch gap-1 overflow-x-auto overflow-y-hidden px-2 py-1.5 scrollbar-thin"
        style={{ flexWrap: "nowrap" }}
        role="tablist"
        aria-label="Conversations"
      >
        <button
          type="button"
          role="tab"
          aria-selected={roomActive}
          onClick={() => setActive(roomTabChannel)}
          className={cn(
            "inline-flex max-w-[11rem] shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
            roomActive
              ? "border-primary/35 bg-primary/10 text-foreground shadow-sm"
              : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <Hash className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{roomLabel}</span>
        </button>

        {openDmPeerIds.map((peerId) => {
          const channelId = dmChannelFor(peerId);
          const guestLabel =
            isGuestDmPeer(peerId) && channelId
              ? guestDmThreads[channelId]?.guestDisplayName
              : undefined;
          const user = resolveMiniDmPeer(
            peerId,
            state.users,
            profiles,
            channelId,
            guestLabel,
          );
          const name =
            user?.name ??
            (isGuestDmPeer(peerId) ? formatGuestDmLabel(guestLabel ?? "Guest") : "User");
          const tabActive = channelId != null && activeChannel === channelId;
          const unreadCount = dmPeerUnreadCount(peerId);
          const unreadBadge = formatDmUnreadBadge(unreadCount);

          return (
            <div
              key={peerId}
              role="tab"
              aria-selected={tabActive}
              className={cn(
                "inline-flex max-w-[10.5rem] shrink-0 items-center rounded-lg border text-xs font-medium transition-colors",
                tabActive
                  ? "border-primary/35 bg-primary/10 text-foreground shadow-sm"
                  : "border-transparent bg-muted/30 text-muted-foreground",
              )}
            >
              <button
                type="button"
                onClick={() => openDmTab(peerId)}
                className="inline-flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left hover:text-foreground"
              >
                {user ? (
                  <FrameAvatar user={user} size={18} />
                ) : (
                  <span className="h-[18px] w-[18px] shrink-0 rounded-full bg-muted" />
                )}
                <span className="truncate">{name}</span>
                {unreadBadge !== 0 && (
                  <span
                    className="unread-pop grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground"
                    aria-label={`${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`}
                  >
                    {unreadBadge}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeDmTab(peerId);
                }}
                aria-label={`Close ${name} tab`}
                className="mr-1 grid h-5 w-5 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
