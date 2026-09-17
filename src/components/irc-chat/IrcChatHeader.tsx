import { ArrowLeft, Hash, Minus, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { useProfilePopup } from "@/lib/profile-popup-context";
import { IrcConnectionBadge } from "./IrcConnectionBadge";
import type { IrcActiveView } from "./irc-chat-types";
import {
  findMemberByNick,
  formatRoomLabel,
  nickAvatarHue,
  nickInitial,
  profileUserIdForMember,
} from "./irc-chat-ui";

type IrcChatHeaderProps = {
  view: IrcActiveView;
  onBack?: () => void;
  onMinimizeDm?: () => void;
  onCloseDm?: () => void;
  className?: string;
};

export function IrcChatHeader({
  view,
  onBack,
  onMinimizeDm,
  onCloseDm,
  className,
}: IrcChatHeaderProps) {
  const state = useIrcChatState();
  const { openProfile } = useProfilePopup();
  const connected = state.status === "authenticated";

  const roomMembers =
    view.kind === "room" ? (state.members[view.roomId] ?? []).length : 0;

  const title =
    view.kind === "room"
      ? formatRoomLabel(state.rooms[view.roomId]?.name ?? view.roomId)
      : view.peerNick;

  const member = view.kind === "dm" ? findMemberByNick(state.members, view.peerNick) : null;
  const profileId = member ? profileUserIdForMember(member) : null;
  const hue = view.kind === "dm" ? nickAvatarHue(view.peerNick) : null;

  return (
    <header
      className={cn(
        "chat-glass sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2.5 px-3 sm:h-16 sm:px-4",
        onBack ? "pl-2 sm:pl-3" : "pl-3 sm:pl-4",
        className,
      )}
    >
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      ) : null}
      {view.kind === "room" ? (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
          aria-hidden
        >
          <Hash className="h-4 w-4" />
        </span>
      ) : hue !== null ? (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-1 ring-border/40"
          style={{ backgroundColor: `hsl(${hue} 52% 46%)` }}
          aria-hidden
        >
          {nickInitial(view.peerNick)}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-bold leading-tight text-foreground sm:text-[15px]">
          {title}
        </h1>
        <p className="flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
          {connected ? (
            <span className="chat-online-dot shrink-0" aria-hidden style={{ width: "0.45rem", height: "0.45rem" }} />
          ) : null}
          <span className="truncate">
            {view.kind === "room"
              ? roomMembers > 0
                ? `${roomMembers} online`
                : "Public room"
              : "Direct message"}
          </span>
        </p>
      </div>
      {view.kind === "dm" && profileId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden h-8 gap-1.5 rounded-lg px-2.5 text-xs shadow-sm sm:inline-flex"
          onClick={() => openProfile(profileId)}
        >
          <User className="h-3.5 w-3.5" />
          Profile
        </Button>
      ) : null}
      {view.kind === "dm" && onMinimizeDm ? (
        <button
          type="button"
          onClick={onMinimizeDm}
          aria-label="Minimize DM"
          title="Minimize"
          className="chat-icon-btn lg:hidden"
        >
          <Minus className="h-4 w-4" />
        </button>
      ) : null}
      {view.kind === "dm" && onCloseDm ? (
        <button
          type="button"
          onClick={onCloseDm}
          aria-label="Close DM"
          className="chat-icon-btn hidden lg:grid"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
      <IrcConnectionBadge compact className="hidden shrink-0 sm:inline-flex" />
    </header>
  );
}
