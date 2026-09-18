import { Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isClientDesktopShell,
  type ChatroomShellLayout,
} from "@/components/chat/chatroom-shell";
import type { IrcActiveView } from "./irc-chat-types";
import {
  countDmUnread,
  nickAvatarHue,
  nickInitial,
} from "./irc-chat-ui";
import type { IrcChatMessage } from "@/lib/irc-chat";
import { ircPmChannelForNick } from "@/lib/irc-chat/dm";

type IrcChatConversationTabsProps = {
  shellLayout: ChatroomShellLayout;
  activeView: IrcActiveView;
  primaryRoomId: string;
  openDmPeers: string[];
  privateMessages: Record<string, IrcChatMessage[]>;
  lastReadDmByPeer: Record<string, number>;
  selfNick: string | null;
  onSelectRoom: (roomId: string) => void;
  onSelectDm: (peerNick: string) => void;
  onCloseDmTab: (peerNick: string) => void;
};

/**
 * Desktop-only DM tabs. Hidden when no open DM tabs (room header owns the public room).
 */
export function IrcChatConversationTabs({
  shellLayout,
  activeView,
  primaryRoomId,
  openDmPeers,
  privateMessages,
  lastReadDmByPeer,
  selfNick,
  onSelectRoom,
  onSelectDm,
  onCloseDmTab,
}: IrcChatConversationTabsProps) {
  const desktop = isClientDesktopShell(shellLayout);
  if (!desktop || openDmPeers.length === 0) return null;

  return (
    <div
      className="hidden h-10 shrink-0 border-b border-border/50 bg-muted/15 md:flex"
      data-irc-conversation-tabs=""
    >
      <div
        className="flex h-full min-w-0 flex-1 items-center gap-1.5 overflow-x-auto overflow-y-hidden px-3 scrollbar-thin"
        role="tablist"
        aria-label="Direct message conversations"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeView.kind === "room"}
          onClick={() => onSelectRoom(primaryRoomId)}
          className={cn(
            "inline-flex h-7 shrink-0 items-center rounded-md px-2.5 text-[11px] font-semibold transition-colors",
            activeView.kind === "room"
              ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
          )}
        >
          Room
        </button>

        {openDmPeers.map((peerNick) => {
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
                "inline-flex h-7 max-w-[11rem] shrink-0 items-center rounded-md border text-[11px] font-medium transition-colors",
                active
                  ? "border-border/60 bg-background text-foreground shadow-sm"
                  : "border-transparent bg-transparent text-muted-foreground",
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDm(peerNick)}
                className="inline-flex min-w-0 flex-1 items-center gap-1.5 px-2 py-0.5 text-left hover:text-foreground"
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold text-white"
                  style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
                  aria-hidden
                >
                  {nickInitial(peerNick)}
                </span>
                <span className="truncate">{peerNick}</span>
                {unread > 0 ? (
                  <span className="unread-pop grid h-3.5 min-w-3.5 shrink-0 place-items-center rounded-full bg-foreground px-0.5 text-[8px] font-bold leading-none text-background">
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
                className="mr-0.5 grid h-4 w-4 shrink-0 place-items-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
