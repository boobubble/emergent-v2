import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Home,
  LogIn,
  MessageSquare,
  Moon,
  Newspaper,
  PanelLeftClose,
  Plus,
  Search,
  Sun,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandText } from "@/components/BrandMark";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { useIrcChatState } from "@/lib/irc-chat";
import { ircPmChannelForNick } from "@/lib/irc-chat/dm";
import { useSocialGraphOptional } from "@/lib/use-social-graph";
import { useNotificationsOptional } from "@/lib/use-notifications";
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
import { roomListGlyph, roomListSubtitle } from "./irc-room-glyph";
import { useIrcChatTheme } from "./irc-chat-theme";
import { IrcChatExploreMore } from "./IrcChatExploreMore";
import { IrcChatRoomDiscoverySheet } from "./IrcChatRoomDiscoverySheet";

type IrcChatSidebarProps = {
  activeView: IrcActiveView;
  onSelectRoom: (roomId: string) => void;
  onSelectDm: (peerNick: string) => void;
  lastReadDmByPeer: Record<string, number>;
  onClose?: () => void;
  onCollapse?: () => void;
  className?: string;
};

function NavRow({
  to,
  search,
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  to?: string;
  search?: Record<string, string>;
  icon: typeof Home;
  label: string;
  badge?: number;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-left text-[12px] font-medium">{label}</span>
      {badge != null && badge > 0 ? (
        <span className="irc-sidebar-badge">{badge > 99 ? "99+" : badge}</span>
      ) : null}
    </>
  );
  const className =
    "irc-sidebar-nav-row flex w-full min-h-9 items-center gap-2.5 rounded-[10px] px-2.5 py-1.5 text-foreground transition-colors hover:bg-white/[0.06]";

  if (to) {
    return (
      <Link to={to} search={search} className={className} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
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
  const { user } = useAuth();
  const { openSignIn } = useAuthGate();
  const selfNick = state.ircNick;
  const activeRoomId = activeView.kind === "room" ? activeView.roomId : "";
  const [roomSearch, setRoomSearch] = useState("");
  const [dmExpanded, setDmExpanded] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const dmSectionRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useIrcChatTheme();

  const social = useSocialGraphOptional();
  const notifs = useNotificationsOptional();

  const incomingFriendCount = useMemo(() => {
    if (!social?.meId) return 0;
    return social.friendships.filter(
      (f) => f.status === "pending" && f.receiver_id === social.meId,
    ).length;
  }, [social]);

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

  useEffect(() => {
    if (activeView.kind === "dm") setDmExpanded(true);
  }, [activeView]);

  useEffect(() => {
    if (dmThreads.length > 0) setDmExpanded(true);
  }, [dmThreads.length]);

  const totalDmUnread = useMemo(() => {
    let n = 0;
    for (const { peerNick } of dmThreads) {
      const channel = ircPmChannelForNick(peerNick);
      const msgs = state.privateMessages[channel] ?? [];
      n += countDmUnread(msgs, selfNick, lastReadDmByPeer[peerNick.toLowerCase()] ?? 0);
    }
    return n;
  }, [dmThreads, state.privateMessages, selfNick, lastReadDmByPeer]);

  const joinedChannelIds = useMemo(
    () => Object.keys(state.rooms),
    [state.rooms],
  );

  function focusDmSection() {
    setDmExpanded(true);
    requestAnimationFrame(() => {
      dmSectionRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  return (
    <>
      <aside
        className={cn(
          "irc-premium-sidebar flex h-full w-[272px] max-w-[280px] shrink-0 flex-col bg-transparent p-1 md:w-[276px]",
          className,
        )}
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden premium-floating-sidebar irc-sidebar-panel">
          <div className="relative shrink-0 border-b border-border/40 px-2 pb-2 pt-2">
            <div className="flex flex-col items-center gap-0.5 leading-none">
              <BrandText
                slot="chat"
                defaultText="Yaarzo"
                className="sidebar-brand-title text-[15px]"
                alwaysShow
              />
              <span className="whitespace-nowrap text-[10px] font-normal text-muted-foreground">
                Chat · Connect · Belong
              </span>
            </div>
            {onCollapse ? (
              <button
                type="button"
                onClick={onCollapse}
                className="absolute right-1 top-2 z-10 grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition hover:bg-white/5 hover:text-foreground md:hidden"
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
              placeholder="Search rooms..."
              aria-label="Search rooms"
              className="irc-sidebar-search w-full rounded-[11px] border border-border/55 bg-background/50 py-2 pl-8 pr-8 text-[12px] outline-none transition focus:border-primary/45 focus:ring-1 focus:ring-primary/25"
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

          <div className="shrink-0 space-y-0.5 px-2 py-2">
            <p className="irc-sidebar-section-label px-1">Main</p>
            <NavRow to="/" icon={Home} label="Home" />
            <NavRow to="/feed/" icon={Newspaper} label="Feed" />
            <NavRow to="/find-friends" icon={UserPlus} label="Find Friends" />
          </div>

          <p className="irc-sidebar-section-label shrink-0 px-3 pb-1 pt-0.5">Chatrooms</p>

          <div className="irc-sidebar-rooms-scroll min-h-0 flex-1 overflow-hidden px-1.5">
            <ScrollArea className="h-full">
              {rooms.length === 0 ? (
                <p className="px-2 py-4 text-center text-[11px] text-muted-foreground">
                  {roomSearch ? "No matching rooms" : "Discovering rooms from IRC…"}
                </p>
              ) : (
                <ul className="space-y-1 pb-2 pr-1">
                  {rooms.map((room) => {
                    const active = activeRoomId === room.id;
                    const onlineCount = displayRoomOnlineCount(
                      room.id,
                      state.members,
                      room.memberCount,
                      active,
                    );
                    const label = formatRoomTitlePlain(room.name);
                    const glyph = roomListGlyph(room.name);
                    const subtitle = roomListSubtitle(room.topic, label);

                    return (
                      <li key={room.id}>
                        <button
                          type="button"
                          onClick={() => onSelectRoom(room.id)}
                          className={cn(
                            "irc-room-row w-full text-left",
                            active && "irc-room-row-active",
                          )}
                        >
                          <span className="irc-room-row-glyph" aria-hidden>{glyph}</span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-baseline justify-between gap-1">
                              <span className="truncate text-[12px] font-semibold leading-tight">
                                {label}
                              </span>
                              {onlineCount != null ? (
                                <span
                                  className="shrink-0 text-[10px] font-semibold tabular-nums text-muted-foreground"
                                  title={`${onlineCount} online`}
                                >
                                  {onlineCount}
                                </span>
                              ) : null}
                            </span>
                            {subtitle ? (
                              <span className="block truncate text-[9px] leading-snug text-muted-foreground/90">
                                {subtitle}
                              </span>
                            ) : null}
                          </span>
                          {active ? (
                            <span className="irc-room-online-dot shrink-0" aria-hidden />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </div>

          <div className="shrink-0 space-y-2 border-t border-border/45 px-2 py-2">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-border/70 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/35 hover:bg-primary/5 hover:text-foreground"
              onClick={() => {
                if (!user || user.isGuest) {
                  openSignIn();
                  return;
                }
                setDiscoveryOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Explore Chatrooms
            </button>

            <p className="irc-sidebar-section-label px-1">Social</p>
            <NavRow
              icon={MessageSquare}
              label="Direct Messages"
              badge={totalDmUnread}
              onClick={focusDmSection}
            />
            <NavRow
              to="/find-friends"
              search={{ tab: "requests" }}
              icon={Users}
              label="Friend Requests"
              badge={user && !user.isGuest ? incomingFriendCount : undefined}
            />
            <NavRow
              to="/feed/"
              search={{ tab: "notifications" }}
              icon={Bell}
              label="Notifications"
              badge={notifs?.unread}
            />

            <IrcChatExploreMore />
          </div>

          {dmExpanded ? (
          <div
            ref={dmSectionRef}
            className="shrink-0 max-h-[28%] min-h-0 border-t border-border/45 px-1.5"
          >
            <p className="irc-sidebar-section-label flex items-center gap-1.5 px-1 pt-2">
              <MessageSquare className="h-3 w-3 text-primary/70" aria-hidden />
              Direct messages
            </p>
            <ScrollArea className="max-h-[140px] pb-2">
              {dmThreads.length === 0 ? (
                <p className="irc-sidebar-dm-empty px-2">
                  No DMs yet. Message someone from the member list.
                </p>
              ) : (
                <ul className="space-y-0.5 pb-1">
                  {dmThreads.map(({ peerNick, lastMessage }) => {
                    const active =
                      activeView.kind === "dm" &&
                      activeView.peerNick.toLowerCase() === peerNick.toLowerCase();
                    const channel = ircPmChannelForNick(peerNick);
                    const msgs = state.privateMessages[channel] ?? [];
                    const unread = countDmUnread(
                      msgs,
                      selfNick,
                      lastReadDmByPeer[peerNick.toLowerCase()] ?? 0,
                    );
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
                                <span className="shrink-0 text-[9px] text-muted-foreground">
                                  {timeLabel}
                                </span>
                              ) : null}
                            </span>
                            {preview ? (
                              <span className="block truncate text-[10px] text-muted-foreground">
                                {preview}
                              </span>
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
          ) : null}

          <div
            className="irc-radio-slot shrink-0 border-t border-dashed border-border/35 px-2 py-1.5"
            data-irc-radio-slot=""
            aria-hidden
          />

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

      <IrcChatRoomDiscoverySheet
        open={discoveryOpen}
        onOpenChange={setDiscoveryOpen}
        joinedChannelIds={joinedChannelIds}
        activeChannelId={activeRoomId || joinedChannelIds[0] || ""}
        onSelectChannel={onSelectRoom}
      />
    </>
  );
}
