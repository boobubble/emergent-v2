import { useMemo, useState } from "react";
import { LogIn, MessageSquare, PanelLeftClose, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandText } from "@/components/BrandMark";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { useIrcChatState } from "@/lib/irc-chat";
import { ircPmChannelForNick } from "@/lib/irc-chat/dm";
import type { IrcActiveView } from "./irc-chat-types";
import {
  countDmUnread,
  displayRoomOnlineCount,
  formatRoomTitlePlain,
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

const FILTER_PILLS = [
  { id: "all" as const, label: "All", enabled: true },
  { id: "joined" as const, label: "Joined", enabled: false },
  { id: "country" as const, label: "Country", enabled: false },
  { id: "interests" as const, label: "Interests", enabled: false },
];

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
  const { user } = useAuth();
  const { openSignIn } = useAuthGate();
  const selfNick = state.ircNick;
  const activeRoomId = activeView.kind === "room" ? activeView.roomId : null;
  const [roomSearch, setRoomSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState<"all">("all");

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
        "flex h-full w-[var(--irc-sidebar-w,260px)] max-w-[260px] shrink-0 flex-col",
        className,
      )}
    >
      <div className="irc-yaarzo-sidebar-inner">
        <div className="relative shrink-0 border-b border-border/60 px-2 py-2.5">
          <div className="flex flex-col items-center gap-0.5 text-center">
            <BrandText
              slot="chat"
              defaultText="Yaarzo"
              className="sidebar-brand-title"
              alwaysShow
            />
            <span className="text-[10px] text-muted-foreground">
              Talk. Play. Connect.
            </span>
          </div>
          {onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              className="absolute right-1 top-2 grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-muted/60 md:hidden"
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
              className="absolute right-0 top-1.5 h-7 w-7"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="relative shrink-0 px-2 pt-2">
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
            className="sidebar-search-input w-full rounded-xl border border-border/70 bg-background py-1.5 pl-8 pr-7 text-[12px] outline-none focus:ring-1 focus:ring-primary/35"
          />
          {roomSearch ? (
            <button
              type="button"
              onClick={() => setRoomSearch("")}
              className="absolute right-3 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center text-muted-foreground"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-1 overflow-x-auto px-2 py-2 scrollbar-none">
          {FILTER_PILLS.map(({ id, label, enabled }) => (
            <button
              key={id}
              type="button"
              disabled={!enabled}
              title={enabled ? undefined : "Not available for IRC room list"}
              onClick={() => {
                if (enabled) setRoomFilter(id);
              }}
              className={cn(
                "sidebar-filter-chip shrink-0",
                roomFilter === id && enabled && "sidebar-filter-chip-active",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="sidebar-section-label px-2">Joined Channels</div>

        <ScrollArea className="sidebar-scroll max-h-[42%] min-h-[5rem] shrink-0 px-1.5">
          {rooms.length === 0 ? (
            <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">
              {roomSearch ? "No matching rooms" : "Discovering rooms from IRC…"}
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
                const label = formatRoomTitlePlain(room.name);
                return (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() => onSelectRoom(room.id)}
                      className={cn(
                        "irc-room-row sidebar-room-active",
                        active && "irc-room-row--active premium-nav-item-active",
                      )}
                    >
                      <span
                        className={cn(
                          "w-4 shrink-0 text-center text-sm leading-none",
                          active ? "text-primary" : "text-muted-foreground/70",
                        )}
                      >
                        #
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
                        {label}
                      </span>
                      {onlineCount != null ? (
                        <span className="irc-room-count-bubble">{onlineCount}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>

        <div className="mx-2 border-t border-border/60" />

        <div className="sidebar-section-label flex items-center gap-1 px-2 pt-2">
          <MessageSquare className="h-3 w-3 opacity-70" aria-hidden />
          Direct messages
        </div>

        <ScrollArea className="min-h-0 flex-1 px-1.5 pb-2">
          {dmThreads.length === 0 ? (
            <p className="px-2 py-3 text-[11px] leading-relaxed text-muted-foreground">
              No DMs yet. Message someone from the member list.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {dmThreads.map(({ peerNick, lastMessage }) => {
                const active =
                  activeView.kind === "dm" &&
                  activeView.peerNick.toLowerCase() === peerNick.toLowerCase();
                const channel = ircPmChannelForNick(peerNick);
                const msgs = state.privateMessages[channel] ?? [];
                const unread = countDmUnread(msgs, selfNick, lastReadDmByPeer[peerNick.toLowerCase()] ?? 0);
                const hue = nickAvatarHue(peerNick);
                const preview = lastMessage?.text?.trim() ?? "";
                const timeLabel = lastMessage ? formatSidebarTime(lastMessage.ts) : null;

                return (
                  <li key={peerNick}>
                    <button
                      type="button"
                      onClick={() => onSelectDm(peerNick)}
                      className={cn(
                        "irc-room-row w-full",
                        active && "irc-room-row--active",
                      )}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
                      >
                        {nickInitial(peerNick)}
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="flex items-baseline justify-between gap-1">
                          <span className="truncate text-[12px] font-semibold">{peerNick}</span>
                          {timeLabel ? (
                            <span className="shrink-0 text-[9px] text-muted-foreground">{timeLabel}</span>
                          ) : null}
                        </span>
                        {preview ? (
                          <span className="block truncate text-[10px] text-muted-foreground">{preview}</span>
                        ) : null}
                      </span>
                      {unread > 0 ? (
                        <span className="irc-room-count-bubble bg-primary text-primary-foreground">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>

        <div className="sidebar-bottom-panel shrink-0 border-t border-border/40 bg-card/20 px-2 py-2 backdrop-blur-sm">
          {user ? (
            <p className="text-center text-[10px] text-muted-foreground">
              IRC: <span className="font-semibold text-foreground/80">{selfNick ?? "…"}</span>
            </p>
          ) : (
            <div className="rounded-xl border border-border/60 bg-card/70 p-2.5">
              <p className="mb-2 text-[10px] text-muted-foreground">
                Chatting as{" "}
                <span className="font-semibold text-foreground">{selfNick ?? "Guest"}</span> in
                Lobby only.
              </p>
              <button
                type="button"
                onClick={openSignIn}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden />
                Sign in to unlock all
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
