import { ArrowLeft, Hash, User } from "lucide-react";
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
  className?: string;
};

export function IrcChatHeader({ view, onBack, className }: IrcChatHeaderProps) {
  const state = useIrcChatState();
  const { openProfile } = useProfilePopup();

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
        "flex h-[52px] shrink-0 items-center gap-2.5 border-b border-border/70 bg-background px-3 sm:px-4",
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
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground ring-1 ring-border/50"
          aria-hidden
        >
          <Hash className="h-3.5 w-3.5" />
        </span>
      ) : hue !== null ? (
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-1 ring-border/40"
          style={{ backgroundColor: `hsl(${hue} 52% 46%)` }}
          aria-hidden
        >
          {nickInitial(view.peerNick)}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold leading-tight text-foreground">{title}</h1>
        <p className="truncate text-[11px] text-muted-foreground">
          {view.kind === "room"
            ? roomMembers > 0
              ? `${roomMembers} online`
              : "Public room"
            : "Direct message"}
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
      <IrcConnectionBadge compact className="hidden shrink-0 lg:inline-flex" />
    </header>
  );
}
