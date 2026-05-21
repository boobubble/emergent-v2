import { Crown, Shield, ShieldHalf } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "./Avatar";
import type { Role } from "@/lib/chat-types";

const ICONS: Record<Role, React.ReactNode> = {
  owner: <Crown className="h-3 w-3 text-warning" />,
  admin: <Shield className="h-3 w-3 text-accent" />,
  mod: <ShieldHalf className="h-3 w-3 text-primary" />,
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

  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-l border-border bg-card lg:flex">
      <div className="border-b border-border px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Members</div>
        <div className="text-sm">{online.length} online · {room.members.length} total</div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {ranked.map(id => {
          const u = state.users[id];
          if (!u) return null;
          const role: Role = room.roles[id] || "member";
          return (
            <button
              key={id}
              onClick={() => id !== "me" && startDM(id)}
              className="mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
              title={id === "me" ? "" : "Send DM"}
            >
              <Avatar user={u} size={28} />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-1 truncate text-sm">
                  {u.name}
                  {ICONS[role]}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {u.isBot ? "Bot" : `Lv ${u.level}`}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}