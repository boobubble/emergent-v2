import { useMemo, useState } from "react";
import { LogIn, MessageSquare, Moon, PanelLeftClose, Search, Sun, X } from "lucide-react";
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
import { useIrcChatTheme } from "./irc-chat-theme";

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
  const { theme, toggleTheme } = useIrcChatTheme();

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
      <div className="flex h-full min-h-0 flex-col overflow-hidden premium-floating-sidebar">
        <div className="relative h-[48px] max-h-[48px] min-h-[48px] shrink-0 border-b border-border/40">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 leading-none">
            <BrandText
              slot="chat"
              defaultText="Yaarzo"
              className="sidebar-brand-title"
              alwaysShow
            />
            <span className="whitespace-nowrap text-[10px] font-normal leading-none text-muted-foreground">
              Talk. Play. Connect.
            </span>
          </div>
          {onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              className="absolute right-2 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-white/5 hover:text-foreground md:hidden"
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
            className="sidebar-search-input w-full rounded-xl border border-border/60 bg-background/60 py-1.5 pl-8 pr-8 text-[12px] outline-none focus:ring-1 focus:ring-primary/40"
          />
          {roomSearch ? (
            <button
              type="button"
              onClick={() => setRoomSearch("")}
              className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
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

        <div className="sidebar-middle flex min-h-0 flex-1 flex-col overflow-hidden">
          <nav className="sidebar-scroll min-h-0 shrink-0 overflow-y-auto px-1.5 pb-1">
            <div className="sidebar-section-label">Joined Channels</div>
            {rooms.length === 0 ? (
              <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">
                {roomSearch ? "No matching rooms" : "Discovering rooms from IRC…"}
              </p>
            ) : (
              <div className="space-y-0.5 pb-2">
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
                  <div key={room.id}>
                    <div
                      className={cn(
                        "premium-nav-item group/room min-h-7 gap-1 px-2 py-0.5",
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
                        <span className="truncate text-[12px]">{label}</span>
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
                  </div>
                );
              })}
              </div>
            )}
          </nav>

          <div className="sidebar-flex-spacer min-h-0 shrink" aria-hidden />

          <div className="mx-2 border-t border-border/50" />

        <div className="sidebar-section-label flex items-center gap-1.5 px-2 pt-1.5 pb-0.5 text-[10px] font-bold uppercase tracking-wide">
          <MessageSquare className="h-3 w-3 text-primary/70" aria-hidden />
          Direct messages
        </div>

        <ScrollArea className="sidebar-scroll min-h-0 max-h-[32%] shrink-0 px-1.5 pb-1">
          {dmThreads.length === 0 ? (
            <p className="irc-sidebar-dm-empty">
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
                        "premium-nav-item w-full min-h-9 gap-2 px-2 py-1.5",
                        active && "premium-nav-item-active sidebar-room-active",
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
        </div>

        <div className="sidebar-bottom-panel shrink-0 border-t border-border/40 bg-card/20 px-1.5 pt-1 pb-1.5 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <p className="min-w-0 flex-1 truncate px-1 text-[10px] font-medium text-muted-foreground">
              {rooms.length} channel{rooms.length === 1 ? "" : "s"} · IRC
              {selfNick && state.status === "authenticated" ? (
                <span className="text-emerald-500/90"> · connected</span>
              ) : null}
            </p>
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
          {!user ? (
            <div className="mt-1 rounded-xl border border-border/60 bg-card/70 p-2">
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
          ) : null}
        </div>
      </div>
    </aside>
  );
}
