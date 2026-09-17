import { ArrowLeft, Menu, Minus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IrcConnectionBadge } from "./IrcConnectionBadge";
import type { IrcActiveView } from "./irc-chat-types";
import { formatRoomLabel } from "./irc-chat-ui";

type IrcMobileNavProps = {
  view: IrcActiveView;
  roomName?: string;
  selfNick?: string | null;
  onOpenRooms: () => void;
  onOpenMembers: () => void;
  onBack?: () => void;
  onMinimizeDm?: () => void;
  className?: string;
};

export function IrcMobileNav({
  view,
  roomName,
  selfNick,
  onOpenRooms,
  onOpenMembers,
  onBack,
  onMinimizeDm,
  className,
}: IrcMobileNavProps) {
  const title =
    view.kind === "dm" ? view.peerNick : formatRoomLabel(roomName ?? view.roomId);

  return (
    <div
      className={cn(
        "chat-glass flex shrink-0 flex-col gap-2 px-3 py-2 md:hidden",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {onBack ? (
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg shadow-sm"
            onClick={onOpenRooms}
            aria-label="Open rooms"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{title}</p>
          {selfNick ? (
            <p className="truncate text-[11px] text-muted-foreground">You: {selfNick}</p>
          ) : null}
        </div>
        {view.kind === "dm" && onMinimizeDm ? (
          <button
            type="button"
            onClick={onMinimizeDm}
            className="chat-icon-btn shrink-0"
            aria-label="Minimize DM"
          >
            <Minus className="h-4 w-4" />
          </button>
        ) : null}
        <IrcConnectionBadge className="shrink-0 px-2 py-0.5 text-[10px]" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg shadow-sm"
          onClick={onOpenMembers}
          aria-label="Open online users"
        >
          <Users className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
