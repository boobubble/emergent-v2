import { MessageCircle, X, Bot, BotOff, Search, Users, Palette, Minus } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useIgnore } from "@/lib/ignore-store";
import { Avatar } from "./Avatar";
import { LoyaltyChip } from "./LoyaltyChip";
import { BrandMark } from "@/components/BrandMark";

export function ChatHeader() {
  const { state, isDM, dmUser, channelLabel, closeDM } = useChat();
  const { ignoreAllBots, setIgnoreAllBots } = useIgnore();
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
      <header className="chat-glass sticky top-0 z-20 flex h-16 items-center justify-between gap-3 px-6 pl-14">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar user={u} size={36} />
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5 truncate font-bold text-foreground">
              <MessageCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{u.name}</span>
            </div>
            <div className="truncate text-[11px] capitalize text-muted-foreground flex items-center gap-1.5">
              {isOnline && <span className="chat-online-dot" aria-hidden />}
              <span className={isOnline ? "text-primary font-semibold" : ""}>{statusLabel}</span>
              {u.bio ? <span className="truncate">· {u.bio}</span> : null}
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
    <header className="chat-glass sticky top-0 z-20 flex h-16 items-center justify-between gap-2 px-3 pl-14 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <BrandMark
          slot="chat"
          roomId={id}
          alt="Room logo"
          className="h-9 w-9 shrink-0 rounded-xl object-contain ring-1 ring-border"
          fallback={
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 font-bold text-primary ring-1 ring-primary/20">#</div>
          }
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold text-foreground">{channelLabel(id)}</span>
            <LoyaltyChip channelId={id} />
          </div>
          <div className="flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
            <span className="chat-online-dot shrink-0" aria-hidden />
            <span className="font-semibold text-foreground/80">{room.members.length}</span>
            <span>online</span>
            {room.topic && <span className="truncate">· {room.topic}</span>}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => setIgnoreAllBots(!ignoreAllBots)}
          title={ignoreAllBots ? "Show bot messages" : "Hide all bot messages"}
          aria-pressed={ignoreAllBots}
          className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${ignoreAllBots ? "bg-destructive/15 text-destructive hover:bg-destructive/20" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
        >
          {ignoreAllBots ? <BotOff className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
          <span>{ignoreAllBots ? "Bots hidden" : "Bots on"}</span>
        </button>
        <button
          type="button"
          className="chat-icon-btn"
          title="Chatroom themes"
          aria-label="Chatroom themes"
          onClick={() => window.dispatchEvent(new Event("palrgo:open-chat-theme-store"))}
        >
          <Palette className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="chat-icon-btn"
          title="Search messages"
          aria-label="Search messages"
          onClick={() => window.dispatchEvent(new Event("palrgo:search-open"))}
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("open-members-panel"))}
          className="chat-icon-btn relative lg:hidden"
          aria-label="Show members"
          title="Members"
        >
          <Users className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {room.members.length > 99 ? "99+" : room.members.length}
          </span>
        </button>
      </div>
    </header>
  );
}
