import { useEffect, useMemo } from "react";
import { X, Hash, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { resolveMiniDmPeer } from "@/lib/mini-dm";
import { isGuestDmPeer, formatGuestDmLabel } from "@/lib/guest-dm-utils";
import { FrameAvatar } from "@/components/cosmetics/CosmeticBits";
import { cn } from "@/lib/utils";
import { formatDmUnreadBadge } from "@/lib/global-unread";
import { isClientDesktopShell, type ChatroomShellLayout } from "@/components/chat/chatroom-shell";

type ChatConversationTabsProps = {
  shellLayout: ChatroomShellLayout;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

/**
 * Desktop (md+) compact chat nav: sidebar toggle, joined rooms, then DM tabs.
 * Hidden on mobile via CSS so mobile ChatHeader is unchanged.
 */
export function ChatConversationTabs({
  shellLayout,
  sidebarOpen,
  onToggleSidebar,
}: ChatConversationTabsProps) {
  const {
    state,
    channelLabel,
    setActive,
    openDmPeerIds,
    openDmTab,
    closeDmTab,
    dmPeerUnreadCount,
    dmChannelFor,
    watchRemoteChannel,
    guestDmThreads,
  } = useChat();
  const { profiles } = useRemoteProfiles();

  const desktop = isClientDesktopShell(shellLayout);
  const activeChannel = state.activeChannel;

  const joinedRoomIds = useMemo(() => {
    const seen = new Set<string>();
    return (state.roomOrder ?? []).filter((id) => {
      if (!state.rooms[id] || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [state.roomOrder, state.rooms]);

  useEffect(() => {
    if (!desktop) return;
    for (const peerId of openDmPeerIds) {
      const ch = dmChannelFor(peerId);
      if (ch) watchRemoteChannel(ch);
    }
  }, [desktop, openDmPeerIds, dmChannelFor, watchRemoteChannel]);

  return (
    <div
      className="hidden h-11 shrink-0 border-b border-border/70 bg-background md:flex"
      data-chat-conversation-tabs=""
    >
      <div
        className="flex h-full min-w-0 flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden px-2 scrollbar-thin"
        style={{ flexWrap: "nowrap" }}
        role="tablist"
        aria-label="Conversations"
      >
        <button
          type="button"
          onClick={onToggleSidebar}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          data-chat-nav-sidebar-toggle=""
        >
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>

        {joinedRoomIds.map((roomId) => {
          const tabActive = activeChannel === roomId;
          const label = channelLabel(roomId);
          return (
            <button
              key={roomId}
              type="button"
              role="tab"
              aria-selected={tabActive}
              onClick={() => setActive(roomId)}
              title={label}
              className={cn(
                "inline-flex h-8 max-w-[11rem] shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                tabActive
                  ? "border-primary/35 bg-primary/10 text-foreground shadow-sm"
                  : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Hash className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
              <span className="truncate">{label}</span>
            </button>
          );
        })}

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
                "inline-flex h-8 max-w-[10.5rem] shrink-0 items-center rounded-lg border text-xs font-medium transition-colors",
                tabActive
                  ? "border-primary/35 bg-primary/10 text-foreground shadow-sm"
                  : "border-transparent bg-muted/30 text-muted-foreground",
              )}
            >
              <button
                type="button"
                onClick={() => openDmTab(peerId)}
                className="inline-flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1 text-left hover:text-foreground"
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
