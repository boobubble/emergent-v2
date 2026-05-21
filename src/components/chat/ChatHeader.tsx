import { Hash, MessageCircle, Users } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "./Avatar";

export function ChatHeader() {
  const { state, isDM, dmUser, channelLabel } = useChat();
  const id = state.activeChannel;
  if (isDM(id)) {
    const u = dmUser(id);
    if (!u) return null;
    return (
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-2.5">
        <Avatar user={u} size={32} />
        <div className="leading-tight">
          <div className="flex items-center gap-1 text-sm font-semibold"><MessageCircle className="h-3 w-3" /> {u.name}</div>
          <div className="text-xs text-muted-foreground capitalize">{u.status}{u.bio ? ` · ${u.bio}` : ""}</div>
        </div>
      </header>
    );
  }
  const room = state.rooms[id];
  if (!room) return null;
  return (
    <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-2.5">
      <div
        className="grid h-8 w-8 place-items-center rounded-md text-primary-foreground"
        style={{ background: "var(--gradient-accent)" }}
      >
        <Hash className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="text-sm font-semibold">{channelLabel(id)}</div>
        <div className="truncate text-xs text-muted-foreground">{room.topic}</div>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" /> {room.members.length}
      </div>
    </header>
  );
}