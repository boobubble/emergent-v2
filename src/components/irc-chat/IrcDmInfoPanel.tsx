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
  forceDesktopColumn?: boolean;
  className?: string;
};

export function IrcDmInfoPanel({
  peerNick,
  selfNick,
  onClose,
  forceDesktopColumn = false,
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
      data-chatroom-members=""
      data-irc-column="members"
      className={cn(
        "irc-members-panel irc-dm-info-panel flex h-full shrink-0 flex-col overflow-hidden border-l border-border/60",
        !forceDesktopColumn && "lg:flex",
        className,
      )}
      style={forceDesktopColumn ? { display: "flex" } : undefined}
    >
        <div className="irc-members-header flex shrink-0 items-center justify-between border-b border-border/50 px-3 py-3">
          <div>
            <h2 className="text-[13px] font-bold tracking-tight text-foreground">
              Conversation
            </h2>
            <p className="text-[11px] text-muted-foreground">Direct message</p>
          </div>
          {onClose ? (
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col items-center px-4 py-10 text-center">
          <Avatar className="h-16 w-16 border border-border/50 shadow-sm">
            <AvatarFallback
              className="text-lg font-semibold text-white"
              style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
            >
              {nickInitial(peerNick)}
            </AvatarFallback>
          </Avatar>
          <p className="mt-4 max-w-full truncate text-base font-bold text-foreground">
            {peerNick}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">IRC PRIVMSG</p>
          {isSelf ? (
            <p className="mt-1 text-[11px] text-muted-foreground">This is you</p>
          ) : null}
          {member?.isGuest ? (
            <p className="mt-2 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              Guest
            </p>
          ) : null}

          <p className="mt-6 max-w-[220px] text-[11px] leading-relaxed text-muted-foreground">
            Messages are sent through Yaarzo IRC. No Supabase chat relay.
          </p>

          {profileId ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-6 gap-1.5 rounded-lg border-border/70 text-xs shadow-none"
              onClick={() => openProfile(profileId)}
            >
              <User className="h-3.5 w-3.5" />
              View profile
            </Button>
          ) : null}
        </div>
    </aside>
  );
}
