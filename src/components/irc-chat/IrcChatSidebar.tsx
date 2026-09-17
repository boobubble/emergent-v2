import { useMemo } from "react";
import { Hash, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { formatRoomLabel } from "./irc-chat-ui";

type IrcChatSidebarProps = {
  activeRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onClose?: () => void;
  className?: string;
};

export function IrcChatSidebar({
  activeRoomId,
  onSelectRoom,
  onClose,
  className,
}: IrcChatSidebarProps) {
  const state = useIrcChatState();
  const rooms = useMemo(
    () => Object.values(state.rooms).sort((a, b) => a.name.localeCompare(b.name)),
    [state.rooms],
  );

  return (
    <aside
      className={cn(
        "flex h-full w-[260px] shrink-0 flex-col border-r border-border/80 bg-card/50 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/80 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
          <MessageSquare className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">Yaarzo</p>
          <p className="truncate text-[11px] text-muted-foreground">IRC Chat</p>
        </div>
        {onClose ? (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="px-4 pb-2 pt-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Rooms
        </h2>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2 pb-3">
        {rooms.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Discovering IRC rooms…
          </p>
        ) : (
          <ul className="space-y-0.5">
            {rooms.map((room) => {
              const active = activeRoomId === room.id;
              return (
                <li key={room.id}>
                  <button
                    type="button"
                    onClick={() => onSelectRoom(room.id)}
                    className={cn(
                      "group flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                      active
                        ? "bg-primary/10 shadow-sm ring-1 ring-primary/15"
                        : "hover:bg-muted/80",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                        active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Hash className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm",
                          active ? "font-semibold text-foreground" : "font-medium text-foreground/90",
                        )}
                      >
                        {formatRoomLabel(room.name)}
                      </span>
                      {room.memberCount != null ? (
                        <span className="text-[11px] text-muted-foreground">
                          {room.memberCount} online
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </aside>
  );
}
