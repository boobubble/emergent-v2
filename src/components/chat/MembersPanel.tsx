import { Crown, Shield, ShieldHalf, MessageCircle, Inbox, Bell } from "lucide-react";
import { useChat } from "@/lib/chat-store";
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
import type { Role } from "@/lib/chat-types";

const ICONS: Record<Role, React.ReactNode> = {
  owner: <Crown className="h-3 w-3 text-warning" />,
  admin: <Shield className="h-3 w-3 text-primary" />,
  mod: <ShieldHalf className="h-3 w-3 text-primary/70" />,
  member: null,
};

export function MembersPanel({ roomId }: { roomId: string }) {
  const { state, startDM } = useChat();
  const room = state.rooms[roomId];
  if (!room) return null;

  const ranked = [...room.members].sort((a, b) => {
    const order: Record<Role, number> = { owner: 0, admin: 1, mod: 2, member: 3 };
    const ra = order[room.roles[a] || "member"];
    const rb = order[room.roles[b] || "member"];
    if (ra !== rb) return ra - rb;
    return (state.users[a]?.name || "").localeCompare(state.users[b]?.name || "");
  });

  const online = ranked.filter(id => state.users[id]?.status !== "offline");
  const offline = ranked.filter(id => state.users[id]?.status === "offline");

  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-l border-border bg-card lg:flex">
      <div className="px-5 pt-6">
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Members &mdash; {room.members.length}
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
              Offline — {offline.length}
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
    const u = state.users[id];
    if (!u) return null;
    return (
      <div className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2 transition-colors hover:bg-white/5">
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
