import { ArrowLeft, Hash, Minus, User, Users, X } from "lucide-react";
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
        "chat-glass sticky top-0 z-20 flex min-h-[3.75rem] shrink-0 items-center gap-3 px-3 py-2.5 sm:min-h-16 sm:px-5",
        onBack ? "pl-2 sm:pl-3" : "pl-3 sm:pl-5",
        className,
      )}
    >
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      ) : null}
      {view.kind === "room" ? (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-muted/80 to-background text-foreground ring-1 ring-border/60 shadow-sm"
          aria-hidden
        >
          <Hash className="h-[18px] w-[18px] text-foreground/75" strokeWidth={2.25} />
        </span>
      ) : hue !== null ? (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-background shadow-sm"
          style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
          aria-hidden
        >
          {nickInitial(view.peerNick)}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-bold leading-snug tracking-tight text-foreground sm:text-base">
          {title}
        </h1>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
          {view.kind === "room" ? (
            <>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3 opacity-70" aria-hidden />
                <span className="font-medium text-foreground/75">
                  {roomMembers > 0 ? `${roomMembers} online` : "Public room"}
                </span>
              </span>
              <span className="hidden text-border sm:inline" aria-hidden>
                ·
              </span>
            </>
          ) : (
            <span className="font-medium">Direct message</span>
          )}
          <IrcConnectionBadge inline className="text-[10px]" />
          {connected && view.kind === "room" ? (
            <span className="chat-online-dot shrink-0 sm:hidden" aria-hidden style={{ width: "0.4rem", height: "0.4rem" }} />
          ) : null}
        </div>
      </div>
      {view.kind === "dm" && profileId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden h-8 gap-1.5 rounded-lg border-border/70 px-2.5 text-xs shadow-none sm:inline-flex"
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
    </header>
  );
}
