import { useMemo, type ReactNode } from "react";
import { Hash, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { ircPmChannelForNick } from "@/lib/irc-chat/dm";
import { IrcConnectionBadge } from "./IrcConnectionBadge";
import type { IrcActiveView } from "./irc-chat-types";
import {
  countDmUnread,
  displayRoomOnlineCount,
  formatRoomLabel,
  formatSidebarTime,
  listDmThreads,
  nickAvatarHue,
  nickInitial,
} from "./irc-chat-ui";

type IrcChatSidebarProps = {
  activeView: IrcActiveView;
  onSelectRoom: (roomId: string) => void;
  onSelectDm: (peerNick: string) => void;
  lastReadDmByPeer: Record<string, number>;
  onClose?: () => void;
  className?: string;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/90">
      {children}
    </h2>
  );
}

export function IrcChatSidebar({
  activeView,
  onSelectRoom,
  onSelectDm,
  lastReadDmByPeer,
  onClose,
  className,
}: IrcChatSidebarProps) {
  const state = useIrcChatState();
  const selfNick = state.ircNick;
  const activeRoomId = activeView.kind === "room" ? activeView.roomId : null;

  const rooms = useMemo(
    () => Object.values(state.rooms).sort((a, b) => a.name.localeCompare(b.name)),
    [state.rooms],
  );

  const dmThreads = useMemo(() => listDmThreads(state.privateMessages), [state.privateMessages]);

  return (
    <aside
      className={cn(
        "flex h-full w-[270px] shrink-0 flex-col border-r border-border/70 bg-background",
        className,
      )}
    >
      <div className="border-b border-border/60 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-primary shadow-sm ring-1 ring-primary/10"
            aria-hidden
          >
            <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
              Yaarzo Chat
            </p>
            <p className="truncate text-[11px] leading-tight text-muted-foreground">
              IRC rooms &amp; DMs
            </p>
          </div>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <div className="mt-2 pl-0.5">
          <IrcConnectionBadge inline />
        </div>
      </div>

      <SectionLabel>Rooms</SectionLabel>

      <ScrollArea className="max-h-[40%] min-h-0 px-1.5">
        {rooms.length === 0 ? (
          <p className="px-3 py-3 text-center text-[11px] text-muted-foreground">
            Discovering rooms…
          </p>
        ) : (
          <ul className="space-y-px pb-2">
            {rooms.map((room) => {
              const active = activeRoomId === room.id;
              const onlineCount = displayRoomOnlineCount(
                room.id,
                state.members,
                room.memberCount,
                active,
              );
              return (
                <li key={room.id}>
                  <button
                    type="button"
                    onClick={() => onSelectRoom(room.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors",
                      active
                        ? "bg-primary/[0.09] ring-1 ring-primary/20"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground",
                        active && "bg-primary/12 text-primary",
                      )}
                    >
                      <Hash className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-[13px] leading-snug",
                          active ? "font-semibold text-foreground" : "font-medium text-foreground/90",
                        )}
                      >
                        {formatRoomLabel(room.name)}
                      </span>
                      {onlineCount != null ? (
                        <span className="text-[10px] text-muted-foreground">
                          {onlineCount} online
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>

      <div className="mx-3 border-t border-border/50" />

      <SectionLabel>Direct messages</SectionLabel>

      <ScrollArea className="min-h-0 flex-1 px-1.5 pb-2">
        {dmThreads.length === 0 ? (
          <p className="px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            No DMs yet. Start one from a member&apos;s profile in the room list.
          </p>
        ) : (
          <ul className="space-y-px">
            {dmThreads.map(({ peerNick, lastMessage }) => {
              const active =
                activeView.kind === "dm" &&
                activeView.peerNick.toLowerCase() === peerNick.toLowerCase();
              const channel = ircPmChannelForNick(peerNick);
              const msgs = state.privateMessages[channel] ?? [];
              const lastRead = lastReadDmByPeer[peerNick.toLowerCase()] ?? 0;
              const unread = countDmUnread(msgs, selfNick, lastRead);
              const hue = nickAvatarHue(peerNick);
              const preview = lastMessage?.text?.trim() ?? "";
              const timeLabel = lastMessage ? formatSidebarTime(lastMessage.ts) : null;

              return (
                <li key={peerNick}>
                  <button
                    type="button"
                    onClick={() => onSelectDm(peerNick)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors",
                      active
                        ? "bg-primary/[0.09] ring-1 ring-primary/20"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <span
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: `hsl(${hue} 52% 46%)` }}
                      aria-hidden
                    >
                      {nickInitial(peerNick)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-1.5">
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-[13px] leading-snug",
                            active ? "font-semibold" : "font-medium",
                          )}
                        >
                          {peerNick}
                        </span>
                        {timeLabel ? (
                          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                            {timeLabel}
                          </span>
                        ) : null}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {preview ? (
                          <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                            {preview}
                          </span>
                        ) : (
                          <span className="flex-1" />
                        )}
                        {unread > 0 ? (
                          <span
                            className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
                          >
                            {unread > 99 ? "99+" : unread}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </aside>
  );
}
