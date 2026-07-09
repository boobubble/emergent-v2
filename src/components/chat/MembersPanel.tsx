import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Crown, Shield, ShieldHalf, MessageCircle, Inbox, Bell, X, UserCog, Users2, UserCheck, VolumeX, Search, Bot, Settings2, Check, Sparkles, Star } from "lucide-react";
import { useHubBadge } from "./CommunityHub";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar } from "./Avatar";
import { FrameAvatar, CosmeticName, RankChip } from "@/components/cosmetics/CosmeticBits";
import { UserMenu } from "./UserMenu";
import { StaffActionsMenu } from "./StaffActionsMenu";
import { NameEmojiBadge, NameAdornments } from "@/lib/name-emoji";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Role, User } from "@/lib/chat-types";

interface FeedNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  kind: string;
  target_type: string | null;
  target_id: string | null;
  payload: { text?: string } | null;
  read: boolean;
  created_at: string;
}

const ICONS: Record<Role, React.ReactNode> = {
  owner: <Crown className="h-3 w-3 text-warning" />,
  admin: <Shield className="h-3 w-3 text-primary" />,
  mod: <ShieldHalf className="h-3 w-3 text-primary/70" />,
  member: null,
};

export function MembersPanel({ roomId }: { roomId: string }) {
  const { state, startDM, closeDM, dmChannelFor, isDmUnread, dmUnreadCount } = useChat();
  const { user: authUser } = useAuth();
  const { profiles } = useRemoteProfiles();
  const [showAllOffline, setShowAllOffline] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [notifs, setNotifs] = useState<FeedNotification[]>([]);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [tab, setTab] = useState<"users" | "friends" | "bots">("users");
  const isMobile = useIsMobile();

  const openDM = (id: string) => {
    if (!id || id === "me") return;
    if (isMobile) {
      startDM(id);
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("palrgo:openMiniDM", { detail: { peerId: id } }));
    }
  };

  type BotMode = "auto" | "split" | "merged";
  const [botMode, setBotMode] = useState<BotMode>(() => {
    if (typeof window === "undefined") return "auto";
    const v = window.localStorage.getItem("chat-bot-mode");
    return v === "split" || v === "merged" || v === "auto" ? v : "auto";
  });
  useEffect(() => {
    try { window.localStorage.setItem("chat-bot-mode", botMode); } catch { /* ignore */ }
  }, [botMode]);


  
  const meId = authUser?.id;

  useEffect(() => {
    if (!meId) return;
    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", meId as string)
        .in("kind", ["friend_post", "friend_comment"])
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifs((data ?? []) as FeedNotification[]);
    }
    load();
    const ch = supabase
      .channel(`notif-${meId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${meId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [meId]);

  useEffect(() => {
    const open = () => setSheetOpen(true);
    window.addEventListener("open-members-panel", open);
    return () => window.removeEventListener("open-members-panel", open);
  }, []);

  useEffect(() => {
    if (!meId) return;
    async function loadFriends() {
      const { data } = await supabase
        .from("friendships")
        .select("sender_id,receiver_id,status")
        .eq("status", "accepted")
        .or(`sender_id.eq.${meId},receiver_id.eq.${meId}`);
      const ids = (data ?? []).map((f) => (f.sender_id === meId ? f.receiver_id : f.sender_id));
      setFriendIds(ids);
    }
    loadFriends();
    const ch = supabase
      .channel(`friends-${meId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => loadFriends())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [meId]);

  const unreadCount = notifs.filter(n => !n.read).length;

  async function markAllRead() {
    if (!meId || unreadCount === 0) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", meId).eq("read", false);
  }

  const room = state.rooms[roomId];

  // Merge bots/me from local seed with remote profiles (skip our own remote profile — "me" represents us).
  const usersById: Record<string, User> = { ...state.users };
  Object.entries(profiles).forEach(([id, u]) => {
    if (authUser && id === authUser.id) return;
    usersById[id] = u;
  });

  const localIds = room?.members ?? [];
  const remoteIds = Object.keys(profiles).filter(id => !authUser || id !== authUser.id);
  const allIds = Array.from(new Set([...localIds, ...remoteIds]));

  const roleOrder: Record<Role, number> = { owner: 0, admin: 1, mod: 2, member: 3 };

  const ONLINE_WINDOW_MS = 5 * 60 * 1000; // treat as offline if not seen in 5 min
  const now = Date.now();
  const isOnline = (id: string) => {
    const u = usersById[id];
    if (!u) return false;
    if (u.isBot) return u.status !== "offline";
    if (u.status !== "online") return false;
    if (u.lastSeen && now - u.lastSeen > ONLINE_WINDOW_MS) return false;
    return true;
  };

  const q = search.trim().toLowerCase();
  const matchesQuery = (id: string) => {
    if (!q) return true;
    const name = (usersById[id]?.name || "").toLowerCase();
    return name.includes(q);
  };

  const online = allIds
    .filter(id => isOnline(id) && !usersById[id]?.isGuest && matchesQuery(id))
    .sort((a, b) => {
      const ra = roleOrder[(room?.roles[a]) || "member"];
      const rb = roleOrder[(room?.roles[b]) || "member"];
      if (ra !== rb) return ra - rb;
      return (usersById[a]?.name || "").localeCompare(usersById[b]?.name || "");
    });


  // Offline sorted by most-recently-seen first (latest at top).
  const offlineSorted = allIds
    .filter(id => !isOnline(id) && !usersById[id]?.isGuest && matchesQuery(id))
    .sort((a, b) => (usersById[b]?.lastSeen ?? 0) - (usersById[a]?.lastSeen ?? 0));

  // When searching, show all matching offline users; otherwise keep the collapsible cap.
  const OFFLINE_MIN = 20;
  const offline = (showAllOffline || q) ? offlineSorted : offlineSorted.slice(0, OFFLINE_MIN);
  const hiddenOffline = offlineSorted.length - offline.length;

  // Smart user/bot split
  const isBot = (id: string) => !!usersById[id]?.isBot;
  const onlineUsers = useMemo(() => online.filter(id => !isBot(id)), [online]);
  const onlineBots = useMemo(() => online.filter(id => isBot(id)), [online]);
  const offlineUsers = useMemo(() => offline.filter(id => !isBot(id)), [offline]);
  const offlineSortedUsers = useMemo(() => offlineSorted.filter(id => !isBot(id)), [offlineSorted]);
  const hiddenOfflineUsers = offlineSortedUsers.length - offlineUsers.length;
  const totalUsersCount = allIds.filter(id => !isBot(id) && !usersById[id]?.isGuest).length;
  const totalBotsCount = allIds.filter(id => isBot(id)).length;

  const effectiveMode: "split" | "merged" =
    botMode === "auto" ? (onlineUsers.length >= 8 ? "split" : "merged") : botMode;

  const meRole = (meId && room?.roles[meId]) || "member";
  const isStaff = meRole === "owner" || meRole === "admin";

  useEffect(() => {
    if (tab === "bots" && (effectiveMode === "merged" || totalBotsCount === 0)) {
      setTab("users");
    }
  }, [tab, effectiveMode, totalBotsCount]);





  const hubBadge = useHubBadge(false);

  const body = (
    <>
      <div className="flex items-center justify-end gap-0 px-3 pt-2 pr-12 lg:pr-3">

        <button
          type="button"
          title="Community Hub"
          aria-label="Open Community Hub"
          onClick={() => window.dispatchEvent(new Event("palrgo:open-hub"))}
          className="relative grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          {hubBadge > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {hubBadge > 9 ? "9+" : hubBadge}
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title="Direct messages"
              aria-label="Direct messages"
              className="relative grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Inbox className="h-5 w-5" />
              {dmUnreadCount > 0 && (
                <span
                  key={`dm-${dmUnreadCount}`}
                  className="unread-pop absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground"
                >
                  {dmUnreadCount > 9 ? "9+" : dmUnreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Direct messages</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {state.dmOrder.length === 0 ? (
              <div className="px-2 py-3 text-xs text-muted-foreground">
                No conversations yet. Click a member to start one.
              </div>
            ) : (
              state.dmOrder.map(uid => {
                const u = state.users[uid];
                if (!u) return null;
                return (
                  <DropdownMenuItem
                    key={uid}
                    onSelect={(e) => { e.preventDefault(); openDM(uid); }}
                    className="gap-2"
                  >
                    <FrameAvatar user={u} size={24} />
                    <span className="truncate"><CosmeticName userId={u.id} name={u.name} /></span>
                    {isDmUnread(uid) && (
                      <span key="dm-unread" className="unread-pop unread-dot-primary ml-1 h-1.5 w-1.5 rounded-full bg-primary" title="Unread" />
                    )}
                    <span
                      className={`ml-auto h-2 w-2 rounded-full ${
                        u.status === "online" ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); closeDM(uid); }}
                      title="Close DM"
                      aria-label="Close DM"
                      className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu onOpenChange={(open) => { if (!open) void markAllRead(); }}>
          <DropdownMenuTrigger asChild>
            <button
              title="Notifications"
              aria-label="Notifications"
              className="relative grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span
                  key={`notif-${unreadCount}`}
                  className="unread-pop absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-y-auto">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifs.length === 0 ? (
              <div className="px-2 py-3 text-xs text-muted-foreground">You're all caught up.</div>
            ) : (
              notifs.map((n) => {
                const actor = n.actor_id ? (usersById[n.actor_id] ?? profiles[n.actor_id]) : null;
                const verb = n.kind === "friend_post" ? "shared a new post" : "commented on a post";
                const preview = n.payload?.text;
                return (
                  <DropdownMenuItem key={n.id} asChild className={!n.read ? "bg-primary/5" : ""}>
                    <Link to="/feed" className="flex items-start gap-2 py-2">
                      {actor ? <Avatar user={actor} size={28} /> : <div className="h-7 w-7 rounded-full bg-muted" />}
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="text-xs">
                          <span className="font-semibold">{actor?.name ?? "A friend"}</span>{" "}
                          <span className="text-muted-foreground">{verb}</span>
                        </div>
                        {preview && <div className="truncate text-[11px] text-muted-foreground">{preview}</div>}
                        <div className="text-[10px] text-muted-foreground/70">{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </Link>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          title="3 Some Rooms"
          aria-label="Open 3 Some Rooms"
          onClick={() => window.dispatchEvent(new CustomEvent("trio:open-launcher"))}
          className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-400 text-white shadow-[0_0_12px_-2px_rgba(236,72,153,0.7)] ring-1 ring-white/20 transition-transform hover:scale-110 hover:shadow-[0_0_16px_-1px_rgba(236,72,153,0.9)]"
        >
          <Sparkles className="h-4 w-4 drop-shadow" />
          <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-fuchsia-400/40 animate-pulse" />
        </button>






        {isStaff && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                title="Member list mode"
                aria-label="Member list mode"
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <Settings2 className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Members list mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {([
                { v: "auto", label: "Auto", hint: "Split when 8+ users online" },
                { v: "split", label: "Split users & bots", hint: "Always separate sections" },
                { v: "merged", label: "Merge lists", hint: "Single combined list" },
              ] as { v: BotMode; label: string; hint: string }[]).map((opt) => (
                <DropdownMenuItem
                  key={opt.v}
                  onSelect={(e) => { e.preventDefault(); setBotMode(opt.v); }}
                  className="flex items-start gap-2"
                >
                  <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${botMode === opt.v ? "opacity-100 text-primary" : "opacity-0"}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-muted-foreground">{opt.hint}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <a
          href="/feed?tab=account"
          target="_blank"
          rel="noopener noreferrer"
          title="Profile settings (opens in new tab)"
          aria-label="Profile settings"
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <UserCog className="h-5 w-5" />
        </a>

      </div>

      {/* Tab bar: Close | Users | Friends | Bots | Search */}
      <div className="flex items-center gap-1 px-2 pt-1.5">
        {isMobile && (
          <button
            onClick={() => setSheetOpen(false)}
            title="Close"
            aria-label="Close members panel"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {([
          {
            key: "users" as const,
            label: "Users",
            icon: <Users2 className="h-3.5 w-3.5" />,
            count: effectiveMode === "merged" ? totalUsersCount + totalBotsCount : totalUsersCount,
          },
          {
            key: "friends" as const,
            label: "Friends",
            icon: <UserCheck className="h-3.5 w-3.5" />,
            count: friendIds.length,
          },
          ...(effectiveMode === "split" && totalBotsCount > 0
            ? [{
                key: "bots" as const,
                label: "Bots",
                icon: <Bot className="h-3.5 w-3.5" />,
                count: totalBotsCount,
              }]
            : []),
        ]).map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              title={t.label}
              aria-pressed={active}
              className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {t.icon}
              <span className="truncate">{t.label}</span>
              <span className={`text-[10px] tabular-nums ${active ? "opacity-90" : "opacity-70"}`}>
                {t.count}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setSearchOpen((s) => !s)}
          title="Search"
          aria-label="Toggle search"
          aria-pressed={searchOpen}
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
            searchOpen ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          }`}
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Inline search (toggled) */}
      {searchOpen && (
        <div className="relative mx-3 mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}…`}
            className="w-full rounded-full bg-white/5 py-1.5 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Tab content */}
      {tab === "friends" ? (
        <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-2">
          {friendIds.filter(matchesQuery).length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              {q ? "No friends match your search." : "No friends yet. Add some from the feed or click a member to start."}
            </p>
          ) : (
            friendIds
              .filter(matchesQuery)
              .slice()
              .sort((a, b) => {
                const ao = isOnline(a) ? 0 : 1;
                const bo = isOnline(b) ? 0 : 1;
                if (ao !== bo) return ao - bo;
                return (usersById[a]?.name || profiles[a]?.name || "").localeCompare(usersById[b]?.name || profiles[b]?.name || "");
              })
              .map((id) => {
                const activeInRoom = isOnline(id) && room.members.includes(id);
                return (
                  <div
                    key={id}
                    className={activeInRoom ? "rounded-xl ring-1 ring-primary/40 bg-primary/5" : ""}
                    title={activeInRoom ? "Active in this room" : undefined}
                  >
                    <MemberRow id={id} role={room.roles[id] || "member"} onClick={() => openDM(id)} />
                  </div>
                );
              })
          )}
        </div>
      ) : tab === "bots" ? (
        <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-2">
          {onlineBots.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              {q ? "No bots match your search." : "No bots available."}
            </p>
          ) : (
            onlineBots.map((id) => (
              <MemberRow key={id} id={id} role={room.roles[id] || "member"} onClick={() => openDM(id)} />
            ))
          )}
        </div>
      ) : (
        // Users tab — in merged mode bots are included via `online`/`offline`; in split mode bots are excluded.
        <div className="flex-1 space-y-4 overflow-y-auto px-3 pb-4 pt-2">
          <div className="space-y-1">
            {(effectiveMode === "split" ? onlineUsers : online).length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                {q ? "No users match your search." : "No users online."}
              </p>
            ) : (
              (effectiveMode === "split" ? onlineUsers : online).map((id) => (
                <MemberRow key={id} id={id} role={room.roles[id] || "member"} onClick={() => openDM(id)} />
              ))
            )}
          </div>

          {(effectiveMode === "split" ? offlineUsers : offline).length > 0 && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Offline — {(effectiveMode === "split" ? offlineSortedUsers : offlineSorted).length}
              </div>
              <div className="space-y-1 opacity-60">
                {(effectiveMode === "split" ? offlineUsers : offline).map((id) => (
                  <MemberRow key={id} id={id} role={room.roles[id] || "member"} onClick={() => openDM(id)} />
                ))}
              </div>
              {(effectiveMode === "split" ? hiddenOfflineUsers : hiddenOffline) > 0 && (
                <button
                  onClick={() => setShowAllOffline(true)}
                  className="mt-2 w-full rounded-full px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary"
                >
                  Show {effectiveMode === "split" ? hiddenOfflineUsers : hiddenOffline} more
                </button>
              )}
              {showAllOffline && offlineSorted.length > OFFLINE_MIN && (
                <button
                  onClick={() => setShowAllOffline(false)}
                  className="mt-2 w-full rounded-full px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary"
                >
                  Show less
                </button>
              )}
            </div>
          )}
        </div>
      )}



    </>
  );

  return (
    <>
      <aside className="hidden h-full w-60 shrink-0 flex-col border-l border-border bg-card lg:flex">
        {body}
      </aside>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-72 bg-card p-0 flex flex-col">
          {body}
        </SheetContent>
      </Sheet>
    </>
  );


  function MemberRow({
    id,
    role,
    onClick,
  }: {
    id: string;
    role: Role;
    onClick: () => void;
  }) {
    const u = usersById[id];
    if (!u) return null;
    const lobbyMod = state.moderation?.["lobby"]?.[id];
    const muted = !!(lobbyMod?.mutedUntil && lobbyMod.mutedUntil > Date.now());
    return (
      <div className="group flex w-full items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-white/5">
        <UserMenu userId={u.id} username={u.name}>
          <div className="relative">
            <FrameAvatar user={u} size={32} />
            {muted && (
              <span
                title="Muted in lobby"
                className="absolute -bottom-0.5 -left-0.5 grid h-4 w-4 place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
              >
                <VolumeX className="h-2.5 w-2.5" />
              </span>
            )}
          </div>
        </UserMenu>
        <UserMenu userId={u.id} username={u.name}>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5 truncate text-xs font-semibold text-foreground/90 hover:text-primary">
              <CosmeticName userId={u.id} name={u.name} />
              <NameAdornments user={u} />
              {ICONS[role]}
              {muted && <VolumeX className="h-3 w-3 text-destructive" />}
            </div>
            {(muted || u.isBot || u.isGuest) && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="truncate">{muted ? "Muted" : u.isBot ? "Bot" : "Guest"}</span>
              </div>
            )}
          </div>

        </UserMenu>

        {id !== "me" && (
          <>
            <StaffActionsMenu targetUserId={u.id} targetName={u.name} isBot={u.isBot} size="xs" />
            <button
              onClick={onClick}
              title="Send DM"
              className="shrink-0 rounded-full p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-primary/10 hover:text-primary group-hover:opacity-100"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    );
  }
}
