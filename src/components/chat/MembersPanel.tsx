import { useState } from "react";
import { Crown, Shield, ShieldHalf, MessageCircle, Inbox, Bell, X } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { Avatar } from "./Avatar";
import { UserMenu } from "./UserMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Role, User } from "@/lib/chat-types";

const ICONS: Record<Role, React.ReactNode> = {
  owner: <Crown className="h-3 w-3 text-warning" />,
  admin: <Shield className="h-3 w-3 text-primary" />,
  mod: <ShieldHalf className="h-3 w-3 text-primary/70" />,
  member: null,
};

export function MembersPanel({ roomId }: { roomId: string }) {
  const { state, startDM, setActive, closeDM, dmChannelFor } = useChat();
  const { user: authUser } = useAuth();
  const { profiles } = useRemoteProfiles();
  const [showAllOffline, setShowAllOffline] = useState(false);
  const room = state.rooms[roomId];
  if (!room) return null;

  // Merge bots/me from local seed with remote profiles (skip our own remote profile — "me" represents us).
  const usersById: Record<string, User> = { ...state.users };
  Object.entries(profiles).forEach(([id, u]) => {
    if (authUser && id === authUser.id) return;
    usersById[id] = u;
  });

  const localIds = room.members;
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

  const online = allIds
    .filter(isOnline)
    .sort((a, b) => {
      const ra = roleOrder[room.roles[a] || "member"];
      const rb = roleOrder[room.roles[b] || "member"];
      if (ra !== rb) return ra - rb;
      return (usersById[a]?.name || "").localeCompare(usersById[b]?.name || "");
    });

  // Offline sorted by most-recently-seen first (latest at top).
  const offlineSorted = allIds
    .filter(id => !isOnline(id))
    .sort((a, b) => (usersById[b]?.lastSeen ?? 0) - (usersById[a]?.lastSeen ?? 0));

  const OFFLINE_MIN = 20;
  const offline = showAllOffline ? offlineSorted : offlineSorted.slice(0, OFFLINE_MIN);
  const hiddenOffline = offlineSorted.length - offline.length;


  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-l border-border bg-card lg:flex">
      <div className="flex items-center justify-end gap-1 px-3 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title="Direct messages"
              aria-label="Direct messages"
              className="relative grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Inbox className="h-4 w-4" />
              {state.dmOrder.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {state.dmOrder.length}
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
                    onSelect={(e) => { e.preventDefault(); setActive(dmChannelFor(uid)); }}
                    className="gap-2"
                  >
                    <Avatar user={u} size={24} />
                    <span className="truncate">{u.name}</span>
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title="Notifications"
              aria-label="Notifications"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-3 text-xs text-muted-foreground">You're all caught up.</div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-5 pt-3">
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Members &mdash; {allIds.length}
        </h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        <div className="space-y-1">
          {online.map(id => (
            <MemberRow
              key={id}
              id={id}
              role={room.roles[id] || "member"}
              onClick={() => id !== "me" && startDM(id)}
            />
          ))}
        </div>

        {offline.length > 0 && (
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              Offline — {offlineSorted.length}
            </div>
            <div className="space-y-1 opacity-60">
              {offline.map(id => (
                <MemberRow
                  key={id}
                  id={id}
                  role={room.roles[id] || "member"}
                  onClick={() => id !== "me" && startDM(id)}
                />
              ))}
            </div>
            {hiddenOffline > 0 && (
              <button
                onClick={() => setShowAllOffline(true)}
                className="mt-2 w-full rounded-full px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary"
              >
                Show {hiddenOffline} more
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

      <div className="p-5">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 to-transparent p-4">
          <p className="mb-1 text-xs font-bold text-primary">Try a command</p>
          <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
            Type{" "}
            <code className="rounded bg-white/10 px-1 font-mono text-[10px] text-primary">!help</code>{" "}
            to see games and fun stuff.
          </p>
        </div>
      </div>
    </aside>
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
    return (
      <div className="group flex w-full items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-white/5">
        <UserMenu userId={u.id} username={u.name}>
          <Avatar user={u} size={32} />
        </UserMenu>
        <UserMenu userId={u.id} username={u.name}>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground/90 hover:text-primary">
              {u.name}
              {ICONS[role]}
            </div>
            <div className="truncate text-[10px] text-muted-foreground">
              {u.isBot ? "Bot" : u.status === "offline" ? "Offline" : `Lv ${u.level}`}
            </div>
          </div>
        </UserMenu>
        {id !== "me" && (
          <button
            onClick={onClick}
            title="Send DM"
            className="shrink-0 rounded-full p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-primary/10 hover:text-primary group-hover:opacity-100"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
}
