import { MessageCircle, X, Bot, BotOff } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useIgnore } from "@/lib/ignore-store";
import { Avatar } from "./Avatar";
import { LoyaltyChip } from "./LoyaltyChip";

export function ChatHeader() {
  const { state, isDM, dmUser, channelLabel, closeDM } = useChat();
  const id = state.activeChannel;

  if (isDM(id)) {
    const u = dmUser(id);
    if (!u) return null;
    const ONLINE_WINDOW_MS = 5 * 60 * 1000;
    const isOnline = u.isBot
      ? u.status !== "offline"
      : u.status === "online" && (!u.lastSeen || Date.now() - u.lastSeen <= ONLINE_WINDOW_MS);
    const statusLabel = isOnline ? "online" : "offline";
    return (
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-6 pl-14 backdrop-blur-md">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar user={u} size={36} />
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5 truncate font-bold text-foreground">
              <MessageCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{u.name}</span>
            </div>
            <div className="truncate text-[11px] capitalize text-muted-foreground">
              <span className={isOnline ? "text-primary" : ""}>{statusLabel}</span>
              {u.bio ? ` · ${u.bio}` : ""}
            </div>
          </div>
        </div>
        <button
          onClick={() => closeDM(u.id)}
          aria-label="Close DM"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </header>
    );
  }

  const room = state.rooms[id];
  if (!room) return null;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 pl-14 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 font-bold text-primary">
          #
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold text-foreground">{channelLabel(id)}</span>
            <LoyaltyChip channelId={id} />
          </div>
          <div className="truncate text-[11px] text-muted-foreground">{room.topic}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-members-panel"))}
        className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 transition hover:bg-white/10 lg:pointer-events-none lg:hover:bg-white/5"
        aria-label="Show members"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary-glow)]" />
        <span className="text-xs font-semibold text-muted-foreground">
          {room.members.length} online
        </span>
      </button>
    </header>
  );
}
