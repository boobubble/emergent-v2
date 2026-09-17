import { User, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { useProfilePopup } from "@/lib/profile-popup-context";
import {
  findMemberByNick,
  nickAvatarHue,
  nickInitial,
  profileUserIdForMember,
} from "./irc-chat-ui";

type IrcDmInfoPanelProps = {
  peerNick: string;
  selfNick: string | null;
  onClose?: () => void;
  className?: string;
};

export function IrcDmInfoPanel({
  peerNick,
  selfNick,
  onClose,
  className,
}: IrcDmInfoPanelProps) {
  const state = useIrcChatState();
  const { openProfile } = useProfilePopup();
  const member = findMemberByNick(state.members, peerNick);
  const profileId = member ? profileUserIdForMember(member) : null;
  const hue = nickAvatarHue(peerNick);
  const isSelf = Boolean(
    selfNick && peerNick.toLowerCase() === selfNick.toLowerCase(),
  );

  return (
    <aside
      className={cn(
        "flex h-full w-[272px] shrink-0 flex-col border-l border-border/50 bg-transparent p-1 lg:w-[280px]",
        className,
      )}
    >
      <div className="premium-floating-sidebar flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/40 px-3 py-2.5">
          <div>
            <h2 className="text-[13px] font-semibold text-foreground">Conversation</h2>
            <p className="text-[10px] text-muted-foreground">Direct message</p>
          </div>
          {onClose ? (
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col items-center px-4 py-8 text-center">
          <Avatar className="h-14 w-14 border border-border/50 shadow-sm ring-2 ring-primary/10">
            <AvatarFallback
              className="text-base font-semibold text-white"
              style={{ backgroundColor: `hsl(${hue} 52% 46%)` }}
            >
              {nickInitial(peerNick)}
            </AvatarFallback>
          </Avatar>
          <p className="mt-3 max-w-full truncate text-sm font-bold text-foreground">
            {peerNick}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">IRC direct message</p>
          {isSelf ? (
            <p className="mt-1 text-[11px] text-muted-foreground">This is you</p>
          ) : null}
          {member?.isGuest ? (
            <p className="mt-2 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              Guest
            </p>
          ) : null}

          <p className="mt-5 max-w-[220px] text-[11px] leading-relaxed text-muted-foreground">
            Messages are sent through Yaarzo IRC (PRIVMSG).
          </p>

          {profileId ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-5 gap-1.5 rounded-lg text-xs shadow-sm"
              onClick={() => openProfile(profileId)}
            >
              <User className="h-3.5 w-3.5" />
              View profile
            </Button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
