import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { IrcConnectionBadge } from "./IrcConnectionBadge";
import type { IrcActiveView } from "./irc-chat-types";
import { formatRoomLabel } from "./irc-chat-ui";

type IrcChatHeaderProps = {
  view: IrcActiveView;
  onBack?: () => void;
  className?: string;
};

export function IrcChatHeader({ view, onBack, className }: IrcChatHeaderProps) {
  const state = useIrcChatState();
  const selfNick = state.ircNick;

  const title =
    view.kind === "room"
      ? formatRoomLabel(state.rooms[view.roomId]?.name ?? view.roomId)
      : `@${view.peerNick}`;

  const subtitle =
    view.kind === "dm"
      ? "Private message"
      : selfNick
        ? `Signed in as ${selfNick}`
        : "Connecting…";

  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-3 border-b border-border/80 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      {onBack ? (
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <IrcConnectionBadge />
    </header>
  );
}
