import { useMemo, useState, type ReactNode } from "react";
import { MessageSquare, PanelLeftClose, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandText } from "@/components/BrandMark";
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
  onCollapse?: () => void;
  className?: string;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-3 pb-1.5 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
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
  onCollapse,
  className,
}: IrcChatSidebarProps) {
  const state = useIrcChatState();
  const selfNick = state.ircNick;
  const activeRoomId = activeView.kind === "room" ? activeView.roomId : null;
  const [roomSearch, setRoomSearch] = useState("");

  const rooms = useMemo(() => {
    const list = Object.values(state.rooms).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    const q = roomSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    );
  }, [state.rooms, roomSearch]);

  const dmThreads = useMemo(
    () => listDmThreads(state.privateMessages),
    [state.privateMessages],
  );

  return (
    <aside
      className={cn(
        "flex h-full w-[270px] max-w-[290px] shrink-0 flex-col bg-transparent p-1.5 md:w-[272px]",
        className,
      )}
    >
      <div className="premium-floating-sidebar irc-sidebar-panel-inner flex h-full min-h-0 flex-col overflow-hidden">
        <div className="irc-sidebar-brand relative shrink-0 border-b border-border/50 px-2 pb-2.5 pt-2">
          <div className="flex flex-col items-center justify-center gap-0.5 py-1 leading-none">
            <BrandText
              slot="chat"
              defaultText="Yaarzo"
              className="sidebar-brand-title"
              alwaysShow
            />
            <span className="whitespace-nowrap text-[10px] text-muted-foreground">
              Talk · Connect · IRC
            </span>
          </div>
          {onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              className="absolute right-1 top-2 grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted/50 hover:text-foreground md:hidden"
              title="Hide sidebar"
              aria-label="Hide sidebar"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-2 h-7 w-7 shrink-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
          <div className="mt-2 flex justify-center">
            <IrcConnectionBadge inline />
          </div>
        </div>

        <div className="relative shrink-0 px-2.5 py-2">
          <Search
            className="pointer-events-none absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/80"
            aria-hidden
          />
          <input
            type="search"
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            placeholder="Search rooms…"
            aria-label="Search rooms"
            className="sidebar-search-input w-full rounded-lg border border-border/65 bg-background py-2 pl-9 pr-8 text-[12px] shadow-sm outline-none transition focus:border-border focus:ring-1 focus:ring-foreground/10"
          />
          {roomSearch ? (
            <button
              type="button"
              onClick={() => setRoomSearch("")}
              aria-label="Clear room search"
              className="absolute right-4 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>

        <SectionLabel>Rooms</SectionLabel>

        <ScrollArea className="max-h-[40%] min-h-[4.5rem] px-2">
          {rooms.length === 0 ? (
            <p className="px-2 py-4 text-center text-[11px] leading-relaxed text-muted-foreground">
              {roomSearch ? "No matching rooms" : "Discovering rooms from IRC…"}
            </p>
          ) : (
            <ul className="space-y-1 pb-2">
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
                        "chat-room-item group/room !justify-start gap-2 !py-2 !text-[12px]",
                        active && "chat-room-item-active",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-medium",
                          active
                            ? "bg-foreground/8 text-foreground"
                            : "bg-muted/50 text-muted-foreground",
                        )}
                      >
                        #
                      </span>
                      <span className="min-w-0 flex-1 truncate text-left font-medium">
                        {formatRoomLabel(room.name)}
                      </span>
                      {onlineCount != null ? (
                        <span className="flex shrink-0 items-center gap-1 tabular-nums">
                          <span
                            className="chat-online-dot"
                            aria-hidden
                            style={{ width: "0.35rem", height: "0.35rem" }}
                          />
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {onlineCount}
                          </span>
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>

        <div className="mx-3 my-1 border-t border-border/55" />

        <SectionLabel>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3" aria-hidden />
            Direct messages
          </span>
        </SectionLabel>

        <ScrollArea className="min-h-0 flex-1 px-2 pb-2.5">
          {dmThreads.length === 0 ? (
            <div className="mx-1 rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-4 text-center">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                No DMs yet. Message someone from the member list.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
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
                const timeLabel = lastMessage
                  ? formatSidebarTime(lastMessage.ts)
                  : null;

                return (
                  <li key={peerNick}>
                    <button
                      type="button"
                      onClick={() => onSelectDm(peerNick)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:bg-muted/45",
                        active &&
                          "border-border/60 bg-muted/35 shadow-sm",
                      )}
                    >
                      <span
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-1 ring-black/5"
                        style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
                        aria-hidden
                      >
                        {nickInitial(peerNick)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-1.5">
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-[12px]",
                              active ? "font-bold text-foreground" : "font-semibold text-foreground/90",
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
                        <span className="mt-0.5 flex items-center gap-1.5">
                          {preview ? (
                            <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                              {preview}
                            </span>
                          ) : (
                            <span className="flex-1" />
                          )}
                          {unread > 0 ? (
                            <span className="unread-pop grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-foreground px-1 text-[10px] font-bold leading-none text-background">
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
      </div>
    </aside>
  );
}
