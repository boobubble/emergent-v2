import { useMemo, useState, type ReactNode } from "react";
import { Hash, MessageSquare, PanelLeftClose, Search, X } from "lucide-react";
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
    <h2 className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/90">
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
        "flex h-full w-[270px] max-w-[290px] shrink-0 flex-col bg-transparent p-1 md:w-[272px]",
        className,
      )}
    >
      <div className="premium-floating-sidebar flex h-full min-h-0 flex-col overflow-hidden">
        <div className="relative h-12 max-h-12 min-h-12 shrink-0 border-b border-border/40">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 leading-none">
            <BrandText
              slot="chat"
              defaultText="Yaarzo"
              className="sidebar-brand-title"
              alwaysShow
            />
            <span className="whitespace-nowrap text-[10px] font-normal leading-none text-muted-foreground">
              IRC rooms &amp; DMs
            </span>
          </div>
          {onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              className="absolute right-2 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-muted/60 hover:text-foreground md:hidden"
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
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 shrink-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="shrink-0 px-2.5 pb-1 pt-2">
          <IrcConnectionBadge inline />
        </div>

        <div className="relative shrink-0 px-2 pb-1.5">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            placeholder="Search rooms…"
            aria-label="Search rooms"
            className="sidebar-search-input w-full rounded-xl border border-border/60 bg-background/60 py-1.5 pl-8 pr-8 text-[12px] outline-none focus:ring-1 focus:ring-primary/40"
          />
          {roomSearch ? (
            <button
              type="button"
              onClick={() => setRoomSearch("")}
              aria-label="Clear room search"
              className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>

        <SectionLabel>Rooms</SectionLabel>

        <ScrollArea className="max-h-[38%] min-h-0 px-1.5">
          {rooms.length === 0 ? (
            <p className="px-3 py-3 text-center text-[11px] text-muted-foreground">
              {roomSearch ? "No matching rooms" : "Discovering rooms…"}
            </p>
          ) : (
            <ul className="space-y-0.5 pb-2">
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
                    <div
                      className={cn(
                        "premium-nav-item group/room min-h-8 gap-1.5 px-2 py-1",
                        active && "premium-nav-item-active sidebar-room-active",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectRoom(room.id)}
                        className="flex min-w-0 flex-1 items-center gap-1.5 truncate bg-transparent p-0 text-left"
                      >
                        <span
                          className={cn(
                            "text-sm leading-none",
                            active ? "text-primary" : "opacity-45",
                          )}
                        >
                          #
                        </span>
                        <span className="truncate text-[12px]">
                          {formatRoomLabel(room.name)}
                        </span>
                      </button>
                      {onlineCount != null ? (
                        <span className="flex shrink-0 items-center gap-1 text-[10px] tabular-nums">
                          <span
                            className="chat-online-dot"
                            aria-hidden
                            style={{ width: "0.4rem", height: "0.4rem" }}
                          />
                          <span
                            className="font-semibold text-muted-foreground"
                            title={`${onlineCount} online`}
                          >
                            {onlineCount}
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>

        <div className="mx-3 border-t border-border/50" />

        <SectionLabel>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3 opacity-70" aria-hidden />
            Direct messages
          </span>
        </SectionLabel>

        <ScrollArea className="min-h-0 flex-1 px-1.5 pb-2">
          {dmThreads.length === 0 ? (
            <p className="px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              No DMs yet. Start one from a member in the room list.
            </p>
          ) : (
            <ul className="space-y-0.5">
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
                        "premium-nav-item flex w-full items-start gap-2 px-2 py-1.5 text-left",
                        active && "premium-nav-item-active",
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
                              "min-w-0 flex-1 truncate text-[12px] leading-snug",
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
                            <span className="unread-pop grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
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
