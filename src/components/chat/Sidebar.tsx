import { useMemo, useState } from "react";
import {
  Settings, LogOut, RotateCcw, Award, Flame, PanelLeftClose, Zap, Trash2, Gamepad2,
  LogIn, UserPlus, Search, X, Moon, Sun,
} from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { useGuestChat } from "@/lib/guest-chat-context";
import { GUEST_LOBBY_CHANNEL_ID } from "@/lib/guest-chat-config";
import { GuestNicknameDialog } from "@/components/chat/GuestNicknameDialog";
import { useMyRoles } from "@/lib/use-my-role";
import { useRoomOnlineCounts } from "@/lib/use-room-online-counts";
import { BrandText, useBrandingMap } from "@/components/BrandMark";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { ChatExploreMenu } from "./ChatExploreMenu";
import {
  ChatroomDiscoveryPanel,
  SidebarSparseSuggestions,
  type SidebarRoomFilter,
} from "@/components/discovery/ChatroomDiscoveryPanel";
import { DjSidebarPlayer } from "./DjFooter";
import { levelProgress } from "@/lib/ranks";

interface Props {
  onOpenProfile: () => void;
  onOpenLeaderboard?: () => void;
  onOpenAchievements?: () => void;
  onCollapse?: () => void;
  onSelectDiscoveryChannel?: (id: string) => void;
}

const FILTERS: { id: SidebarRoomFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "joined", label: "Joined" },
  { id: "country", label: "Country" },
  { id: "interests", label: "Interests" },
];

export function Sidebar({ onOpenProfile, onCollapse, onSelectDiscoveryChannel }: Props) {
  const { state, setActive, createRoom, deleteRoom, reset } = useChat();
  const { logout, user } = useAuth();
  const { openSignIn, openSignUp, requireAuth } = useAuthGate();
  const guestChat = useGuestChat();
  const { isAdmin } = useMyRoles();
  const branding = useBrandingMap();

  const selectRoom = (id: string) => {
    if (!user && id !== GUEST_LOBBY_CHANNEL_ID) {
      requireAuth();
      return;
    }
    setActive(id);
  };
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState<SidebarRoomFilter>("all");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.classList.contains("light") ? "light" : "dark";
  });

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("palrgo-theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  };

  const uniqueRoomOrder = useMemo(() => {
    const seen = new Set<string>();
    return state.roomOrder.filter((id) => {
      if (!state.rooms[id] || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [state.roomOrder, state.rooms]);

  const searchQuery = roomSearch.trim().toLowerCase();

  const matchesSearch = (id: string) => {
    if (!searchQuery) return true;
    const r = state.rooms[id];
    if (!r) return false;
    return (
      r.name.toLowerCase().includes(searchQuery) ||
      r.topic.toLowerCase().includes(searchQuery) ||
      id.toLowerCase().includes(searchQuery)
    );
  };

  const matchesFilter = (id: string) => {
    const r = state.rooms[id];
    if (!r) return false;
    if (roomFilter === "joined") return r.members.includes("me");
    if (roomFilter === "country" || roomFilter === "interests") return false;
    return true;
  };

  const localRoomIds = useMemo(() => {
    return uniqueRoomOrder.filter((id) => matchesSearch(id) && matchesFilter(id));
  }, [uniqueRoomOrder, searchQuery, roomFilter, state.rooms]);

  const joinedLocalIds = useMemo(
    () => uniqueRoomOrder.filter((id) => state.rooms[id]?.members.includes("me") && matchesSearch(id)),
    [uniqueRoomOrder, state.rooms, searchQuery],
  );

  const publicRoomIds = useMemo(
    () => uniqueRoomOrder.filter((id) => state.rooms[id]?.kind !== "game"),
    [uniqueRoomOrder, state.rooms],
  );
  const membersByChannel = useMemo(() => {
    const map: Record<string, string[] | undefined> = {};
    for (const id of publicRoomIds) map[id] = state.rooms[id]?.members;
    return map;
  }, [publicRoomIds, state.rooms]);
  const onlineCounts = useRoomOnlineCounts(publicRoomIds, membersByChannel);

  const showLocalJoined = roomFilter === "all" || roomFilter === "joined";
  const showLocalPublic = roomFilter === "all" && !user?.isGuest;
  const discoveryActive = Boolean(user && !user.isGuest && onSelectDiscoveryChannel);

  const sparseSuggestionRooms = useMemo(() => {
    if (discoveryActive || roomFilter !== "all") return [];
    if (joinedLocalIds.length > 4 || localRoomIds.length > 4) return [];
    return uniqueRoomOrder
      .filter((id) => {
        const r = state.rooms[id];
        return r && !r.members.includes("me") && matchesSearch(id);
      })
      .slice(0, 4)
      .map((id) => {
        const r = state.rooms[id]!;
        return {
          id,
          name: r.name,
          kind: r.kind as "chat" | "game" | undefined,
          memberCount: Math.max(onlineCounts[id] ?? 0, r.members.length),
        };
      });
  }, [
    discoveryActive,
    roomFilter,
    joinedLocalIds.length,
    localRoomIds.length,
    uniqueRoomOrder,
    state.rooms,
    searchQuery,
    onlineCounts,
  ]);

  const renderRoomItem = (id: string) => {
    const r = state.rooms[id];
    if (!r) return null;
    const active = state.activeChannel === id;
    return (
      <div
        key={id}
        className={cn(
          "premium-nav-item group/room min-h-8 gap-1.5 px-2 py-1",
          active && "premium-nav-item-active sidebar-room-active",
        )}
      >
        <button
          onClick={() => selectRoom(id)}
          className="flex min-w-0 flex-1 items-center gap-1.5 truncate bg-transparent p-0 text-left"
        >
          {r.kind === "game" ? (
            <Gamepad2 className={cn("h-3 w-3 shrink-0", active ? "text-primary" : "text-primary/70")} />
          ) : (
            <span className={cn("text-sm leading-none", active ? "text-primary" : "opacity-45")}>#</span>
          )}
          <span className="truncate text-[12px]">{r.name}</span>
          {r.dbBacked && (
            <span className="shrink-0 rounded bg-primary/10 px-1 py-px text-[8px] font-bold uppercase text-primary">
              Live
            </span>
          )}
        </button>
        <span className="flex shrink-0 items-center gap-1 text-[10px] tabular-nums">
          <span className="chat-online-dot" aria-hidden style={{ width: "0.4rem", height: "0.4rem" }} />
          <span className="font-semibold text-muted-foreground" title={`${Math.max(onlineCounts[id] ?? 0, r.members.length)} online`}>
            {Math.max(onlineCounts[id] ?? 0, r.members.length)}
          </span>
          {isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete channel "${r.name}"? This removes it for you and cannot be undone.`)) {
                  deleteRoom(id);
                }
              }}
              aria-label={`Delete ${r.name}`}
              title="Delete channel (admin)"
              className="ml-0.5 grid h-4 w-4 place-items-center rounded-full text-muted-foreground opacity-0 transition hover:bg-destructive/15 hover:text-destructive group-hover/room:opacity-100"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          )}
        </span>
      </div>
    );
  };

  const subtitle = branding.chat_subtitle ?? "Talk. Play. Connect.";

  return (
    <aside className="flex h-full w-[270px] max-w-[290px] shrink-0 flex-col bg-transparent p-1 md:w-[272px]">
      <div className="flex h-full min-h-0 flex-col premium-floating-sidebar overflow-hidden">

        {/* Brand header — centered title, collapse overlaid right */}
        <div className="relative h-[48px] max-h-[48px] min-h-[48px] shrink-0 border-b border-border/40">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 leading-none">
            <BrandText
              slot="chat"
              defaultText="Yaarzo"
              className="sidebar-brand-title"
              alwaysShow
            />
            <span className="text-[10px] font-normal leading-none text-muted-foreground whitespace-nowrap">
              {subtitle}
            </span>
          </div>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="absolute right-2 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              title="Hide sidebar"
              aria-label="Hide sidebar"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative shrink-0 px-2 pt-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            placeholder="Search rooms…"
            aria-label="Search rooms"
            className="sidebar-search-input w-full rounded-xl border border-border/60 bg-background/60 py-1.5 pl-8 pr-8 text-[12px] outline-none focus:ring-1 focus:ring-primary/40"
          />
          {roomSearch && (
            <button
              type="button"
              onClick={() => setRoomSearch("")}
              aria-label="Clear room search"
              className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex shrink-0 gap-1 overflow-x-auto px-2 py-2 scrollbar-none">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRoomFilter(id)}
              className={cn(
                "sidebar-filter-chip shrink-0",
                roomFilter === id && "sidebar-filter-chip-active",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Room list — scrolls when tall; spacer below absorbs sparse empty space */}
        <div className="sidebar-middle flex min-h-0 flex-1 flex-col overflow-hidden">
        <nav className="sidebar-scroll min-h-0 shrink-0 overflow-y-auto px-1.5 pb-1">
          {user && !user.isGuest && onSelectDiscoveryChannel && (
            <ChatroomDiscoveryPanel
              joinedChannelIds={uniqueRoomOrder.filter((id) => state.rooms[id]?.members.includes("me"))}
              activeChannelId={state.activeChannel}
              filter={roomFilter}
              onSelectChannel={onSelectDiscoveryChannel}
              localRoomCount={localRoomIds.length}
              suppressJoinedSection={joinedLocalIds.length > 0}
            />
          )}

          {showLocalJoined && joinedLocalIds.length > 0 && (
            <div className="mb-2">
              {(roomFilter === "all" || !user || user.isGuest) && (
                <div className="sidebar-section-label">Joined Channels</div>
              )}
              <div className="space-y-0.5">{joinedLocalIds.map(renderRoomItem)}</div>
            </div>
          )}

          {sparseSuggestionRooms.length > 0 && (
            <SidebarSparseSuggestions
              rooms={sparseSuggestionRooms}
              activeChannelId={state.activeChannel}
              onSelect={selectRoom}
            />
          )}

          {showLocalPublic && localRoomIds.filter((id) => !joinedLocalIds.includes(id)).length > 0 && (
            <div className="mb-2">
              <SectionLabel
                title="Public Rooms"
                action={
                  user && !user.isGuest ? (
                    <button
                      onClick={() => setShowNew((s) => !s)}
                      className="text-base leading-none text-muted-foreground transition-colors hover:text-primary"
                      aria-label="New room"
                    >
                      +
                    </button>
                  ) : undefined
                }
              />
              {showNew && (
                <div className="mb-2 space-y-1 rounded-xl border border-border bg-background/80 p-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Room name"
                    className="w-full rounded-lg bg-input px-2 py-1 text-[12px] outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Topic"
                    className="w-full rounded-lg bg-input px-2 py-1 text-[12px] outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    onClick={() => {
                      if (newName.trim()) {
                        createRoom(newName.trim(), newTopic.trim());
                        setNewName("");
                        setNewTopic("");
                        setShowNew(false);
                      }
                    }}
                    className="w-full rounded-lg bg-primary px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
                  >
                    Create
                  </button>
                </div>
              )}
              <div className="space-y-0.5">
                {localRoomIds.filter((id) => !joinedLocalIds.includes(id)).map(renderRoomItem)}
              </div>
            </div>
          )}

          {localRoomIds.length === 0 && roomFilter !== "all" && (
            <p className="px-2 py-4 text-center text-[11px] text-muted-foreground">
              No rooms in this filter.
            </p>
          )}
        </nav>
        <div className="sidebar-flex-spacer min-h-0 shrink" aria-hidden="true" />
        </div>

        {/* Pinned bottom: utilities → radio → profile */}
        <div className="sidebar-bottom-panel shrink-0 border-t border-border/40 bg-card/20 px-1.5 pt-1 pb-1.5 backdrop-blur-sm">
          <div className="mb-1 flex items-center gap-1">
            <div className="min-w-0 flex-1">
              <ChatExploreMenu compact />
            </div>
            {user && (
              <a
                href="/feed"
                target="_blank"
                rel="noopener noreferrer"
                className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                title="Achievements"
                aria-label="Achievements"
              >
                <Award className="h-4 w-4" />
                {(state.me.badges?.length ?? 0) > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">
                    {state.me.badges!.length}
                  </span>
                )}
              </a>
            )}
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

          <DjSidebarPlayer className="mb-1" />

          {user ? (
            <>
              <a
                href="/account"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full overflow-hidden rounded-xl border border-border/60 bg-card/70 p-2 text-left transition hover:border-primary/30"
                title="Open account settings"
              >
                <div className="flex items-center gap-2">
                  <Avatar user={state.me} size={34} />
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="truncate text-[12px] font-bold text-foreground">{state.me.name}</div>
                    <div className="text-[10px] text-emerald-400">Online</div>
                  </div>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-fuchsia-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-200 ring-1 ring-amber-400/30">
                    <Zap className="h-2.5 w-2.5" /> Lv {state.me.level}
                  </span>
                  <Settings className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </div>
                {(() => {
                  const lp = levelProgress(state.me.xp ?? 0);
                  return (
                    <div className="mt-1.5">
                      <div className="h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-fuchsia-500 transition-all duration-700"
                          style={{ width: `${lp.pct}%` }}
                        />
                      </div>
                      <div className="mt-0.5 flex items-center justify-between text-[9px] font-semibold text-muted-foreground">
                        <span>{lp.intoLevel}/{lp.toNext} XP</span>
                        {(state.me.streak ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-rose-300">
                            <Flame className="h-2.5 w-2.5" />{state.me.streak}d
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </a>
              <button
                type="button"
                onClick={onOpenProfile}
                className="mt-0.5 w-full rounded-lg px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                Quick edit profile
              </button>
              <div className="mt-0.5 flex gap-1">
                <button
                  onClick={() => { if (confirm("Reset chat data for this account?")) reset(); }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
                <button
                  onClick={() => { void logout().catch(() => undefined); }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1 text-[10px] text-muted-foreground hover:text-destructive"
                  title={user?.email}
                >
                  <LogOut className="h-3 w-3" /> Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border/60 bg-card/70 p-2.5">
              <GuestNicknameDialog />
              {guestChat.isGuestChatting ? (
                <>
                  <p className="mb-2 text-[10px] text-muted-foreground">
                    Chatting as <span className="font-semibold text-foreground">{guestChat.session?.displayName}</span> in Lobby only.
                  </p>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={openSignIn}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
                    >
                      <LogIn className="h-3.5 w-3.5" /> Sign in to unlock all
                    </button>
                    <button
                      type="button"
                      onClick={guestChat.endGuestChat}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-semibold hover:bg-white/5"
                    >
                      End guest chat
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-2 text-[10px] text-muted-foreground">
                    {guestChat.enabled
                      ? "Chat in Lobby as a guest, or sign in for full access."
                      : "Sign in to chat, react, DM and earn XP."}
                  </p>
                  <div className="flex flex-col gap-1">
                    {guestChat.enabled && (
                      <button
                        type="button"
                        onClick={guestChat.openNicknameDialog}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary hover:bg-primary/15"
                      >
                        Chat as Guest
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={openSignIn}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
                    >
                      <LogIn className="h-3.5 w-3.5" /> Sign in
                    </button>
                    <button
                      type="button"
                      onClick={openSignUp}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-semibold hover:bg-white/5"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Create account
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("sidebar-section-label flex items-center justify-between", className)}>
      <span>{title}</span>
      {action}
    </div>
  );
}

export { SectionLabel };
