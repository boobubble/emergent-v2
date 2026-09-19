import { User, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { memberProfileBioSnippet } from "@/lib/irc-chat/irc-chat-mobile-members";
import { useProfilePopup } from "@/lib/profile-popup-context";
import { useRemoteProfileDirectory } from "@/lib/use-remote-profiles";
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
  const { profiles } = useRemoteProfileDirectory();
  const member = findMemberByNick(state.members, peerNick);
  const profileId = member ? profileUserIdForMember(member) : null;
  const profile = profileId ? profiles[profileId] ?? profiles[profileId.toLowerCase()] : null;
  const hue = nickAvatarHue(peerNick);
  const isSelf = Boolean(
    selfNick && peerNick.toLowerCase() === selfNick.toLowerCase(),
  );
  const secondary =
    profile?.username &&
    profile.username.toLowerCase() !== peerNick.toLowerCase()
      ? `@${profile.username}`
      : null;
  const bio = memberProfileBioSnippet(profile);

  return (
    <aside
      data-chatroom-members=""
      data-irc-column="members"
      className={cn(
        "irc-members-panel irc-dm-info-panel flex h-full shrink-0 flex-col overflow-hidden border-l border-border/60",
        !forceDesktopColumn && "lg:flex",
        onClose && "irc-dm-info-panel--sheet w-full max-w-none border-l-0",
        className,
      )}
      style={forceDesktopColumn ? { display: "flex" } : undefined}
    >
      <div className="irc-members-header flex shrink-0 items-center justify-between border-b border-border/50 px-2 py-2.5 sm:px-3 sm:py-3">
        <div className="min-w-0 flex-1 pl-1">
          <h2 className="text-sm font-bold tracking-tight text-foreground">Conversation</h2>
          <p className="text-[11px] text-muted-foreground">Direct message</p>
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={onClose}
            aria-label="Close conversation info"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-8 text-center sm:py-10">
        <Avatar className="h-16 w-16 border border-primary/20 shadow-sm sm:h-[4.5rem] sm:w-[4.5rem]">
          {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
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
        {secondary ? (
          <p className="mt-0.5 max-w-full truncate text-xs text-muted-foreground">{secondary}</p>
        ) : (
          <p className="mt-1 text-[11px] text-muted-foreground">IRC PRIVMSG</p>
        )}
        {isSelf ? (
          <p className="mt-1 text-[11px] text-muted-foreground">This is you</p>
        ) : null}
        {member?.isGuest ? (
          <p className="mt-2 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Guest
          </p>
        ) : null}

        {bio ? (
          <p className="mt-4 max-w-[260px] text-left text-[11px] leading-relaxed text-muted-foreground">
            {bio}
          </p>
        ) : null}

        <p className="mt-4 max-w-[240px] text-[10px] leading-relaxed text-muted-foreground/90">
          Messages are sent through Yaarzo IRC.
        </p>

        {profileId ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-6 h-10 gap-1.5 rounded-lg border-primary/25 text-xs shadow-none"
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
