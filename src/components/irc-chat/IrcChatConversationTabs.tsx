import { Hash, PanelLeftClose, PanelLeftOpen, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isClientDesktopShell,
  type ChatroomShellLayout,
} from "@/components/chat/chatroom-shell";
import type { IrcActiveView } from "./irc-chat-types";
import {
  countDmUnread,
  formatRoomLabel,
  listDmThreads,
  nickAvatarHue,
  nickInitial,
} from "./irc-chat-ui";
import type { IrcChatMessage } from "@/lib/irc-chat";
import { ircPmChannelForNick } from "@/lib/irc-chat/dm";

type IrcChatConversationTabsProps = {
  shellLayout: ChatroomShellLayout;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeView: IrcActiveView;
  primaryRoomId: string;
  activeRoomName: string | undefined;
  openDmPeers: string[];
  privateMessages: Record<string, IrcChatMessage[]>;
  lastReadDmByPeer: Record<string, number>;
  selfNick: string | null;
  onSelectRoom: (roomId: string) => void;
  onSelectDm: (peerNick: string) => void;
  onCloseDmTab: (peerNick: string) => void;
  showMembersButton?: boolean;
  onOpenMembers?: () => void;
};

export function IrcChatConversationTabs({
  shellLayout,
  sidebarOpen,
  onToggleSidebar,
  activeView,
  primaryRoomId,
  activeRoomName,
  openDmPeers,
  privateMessages,
  lastReadDmByPeer,
  selfNick,
  onSelectRoom,
  onSelectDm,
  onCloseDmTab,
  showMembersButton,
  onOpenMembers,
}: IrcChatConversationTabsProps) {
  const desktop = isClientDesktopShell(shellLayout);
  if (!desktop) return null;

  const roomId = primaryRoomId;
  const roomLabel = formatRoomLabel(activeRoomName ?? roomId);
  const roomActive = activeView.kind === "room";
  const dmThreads = listDmThreads(privateMessages);
  const tabPeers =
    openDmPeers.length > 0
      ? openDmPeers
      : dmThreads.map((t) => t.peerNick).slice(0, 8);

  return (
    <div
      className="hidden h-11 shrink-0 border-b border-border/70 bg-background/95 backdrop-blur-sm md:flex"
      data-irc-conversation-tabs=""
    >
      <div
        className="flex h-full min-w-0 flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden px-2 scrollbar-thin"
        role="tablist"
        aria-label="Conversations"
      >
        <button
          type="button"
          onClick={onToggleSidebar}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        {roomId ? (
          <button
            type="button"
            role="tab"
            aria-selected={roomActive}
            onClick={() => onSelectRoom(roomId)}
            title={roomLabel}
            className={cn(
              "inline-flex h-8 max-w-[11rem] shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors",
              roomActive
                ? "border-primary/35 bg-primary/10 text-foreground shadow-sm"
                : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <Hash className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
            <span className="truncate">{roomLabel}</span>
          </button>
        ) : null}

        {tabPeers.map((peerNick) => {
          const active =
            activeView.kind === "dm" &&
            activeView.peerNick.toLowerCase() === peerNick.toLowerCase();
          const channel = ircPmChannelForNick(peerNick);
          const msgs = privateMessages[channel] ?? [];
          const unread = countDmUnread(
            msgs,
            selfNick,
            lastReadDmByPeer[peerNick.toLowerCase()] ?? 0,
          );
          const hue = nickAvatarHue(peerNick);

          return (
            <div
              key={peerNick.toLowerCase()}
              role="tab"
              aria-selected={active}
              className={cn(
                "inline-flex h-8 max-w-[10.5rem] shrink-0 items-center rounded-lg border text-xs font-medium transition-colors",
                active
                  ? "border-primary/35 bg-primary/10 text-foreground shadow-sm"
                  : "border-transparent bg-muted/30 text-muted-foreground",
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDm(peerNick)}
                className="inline-flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1 text-left hover:text-foreground"
              >
                <span
                  className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                  style={{ backgroundColor: `hsl(${hue} 52% 46%)` }}
                  aria-hidden
                >
                  {nickInitial(peerNick)}
                </span>
                <span className="truncate">{peerNick}</span>
                {unread > 0 ? (
                  <span className="unread-pop grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground">
                    {unread > 99 ? "99+" : unread}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseDmTab(peerNick);
                }}
                aria-label={`Close ${peerNick} tab`}
                className="mr-1 grid h-5 w-5 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

      {showMembersButton && onOpenMembers ? (
        <button
          type="button"
          onClick={onOpenMembers}
          className="chat-icon-btn mr-2 shrink-0"
          aria-label="Open online users"
          title="Online users"
        >
          <Users className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
