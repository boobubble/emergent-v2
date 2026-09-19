import { ArrowLeft, Info, Menu, Minus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { ircChatMobileMembersButtonLabel } from "@/lib/irc-chat/irc-chat-mobile-shell";
import type { IrcActiveView } from "./irc-chat-types";
import {
  displayRoomOnlineCount,
  formatRoomDisplayTitle,
  formatRoomTitlePlain,
} from "./irc-chat-ui";
import { roomListSubtitle } from "./irc-room-glyph";

type IrcMobileNavProps = {
  view: IrcActiveView;
  roomName?: string;
  onOpenMenu: () => void;
  onOpenMembers: () => void;
  onBack?: () => void;
  onMinimizeDm?: () => void;
  className?: string;
};

export function IrcMobileNav({
  view,
  roomName,
  onOpenMenu,
  onOpenMembers,
  onBack,
  onMinimizeDm,
  className,
}: IrcMobileNavProps) {
  const state = useIrcChatState();

  const roomId = view.kind === "room" ? view.roomId : null;
  const roomRecord = roomId ? state.rooms[roomId] : null;
  const roomRaw = roomId ? (roomRecord?.name ?? roomName ?? roomId) : null;
  const roomTitlePlain = roomRaw ? formatRoomTitlePlain(roomRaw) : null;
  const roomTitle = roomRaw ? formatRoomDisplayTitle(roomRaw) : null;

  const onlineCount =
    view.kind === "room" && roomId
      ? displayRoomOnlineCount(
          roomId,
          state.members,
          roomRecord?.memberCount,
          true,
        )
      : null;

  const subtitle =
    view.kind === "room" && roomRaw
      ? onlineCount != null
        ? `${onlineCount} online`
        : roomListSubtitle(roomRecord?.topic, roomTitlePlain ?? "") || null
      : view.kind === "dm"
        ? "Direct message"
        : null;

  const title =
    view.kind === "dm" ? view.peerNick : (roomTitlePlain ?? roomTitle ?? roomId ?? "Chat");

  const membersLabel = ircChatMobileMembersButtonLabel(view);

  return (
    <header
      data-irc-mobile-header=""
      className={cn(
        "irc-mobile-shell-header chat-glass sticky top-0 z-20 flex shrink-0 flex-col gap-0 border-b border-border/40 md:hidden",
        className,
      )}
    >
      <div className="flex min-h-11 items-center gap-2 px-2 py-1.5 sm:px-3">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl"
            onClick={onBack}
            aria-label="Back to chatroom"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="irc-mobile-shell-icon-btn h-11 w-11 shrink-0 rounded-xl text-foreground"
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="truncate text-[15px] font-bold leading-tight tracking-tight text-foreground">
            {title}
          </p>
          {subtitle ? (
            <p className="truncate text-[11px] font-medium tabular-nums text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>

        {view.kind === "dm" && onMinimizeDm ? (
          <button
            type="button"
            onClick={onMinimizeDm}
            className="irc-mobile-shell-icon-btn grid h-11 w-11 shrink-0 place-items-center rounded-xl"
            aria-label="Minimize direct message"
          >
            <Minus className="h-5 w-5" />
          </button>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="irc-mobile-shell-icon-btn h-11 w-11 shrink-0 rounded-xl"
          onClick={onOpenMembers}
          aria-label={membersLabel}
        >
          {view.kind === "dm" ? (
            <Info className="h-5 w-5" />
          ) : (
            <Users className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
