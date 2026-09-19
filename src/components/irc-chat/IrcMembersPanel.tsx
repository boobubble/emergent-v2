import { useMemo, useState } from "react";
import { MessageCircle, Search, User, X } from "lucide-react";
import { IrcProfileAvatarTrigger } from "./IrcChatSettingsMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { useProfilePopup } from "@/lib/profile-popup-context";
import type { RemoteProfile } from "@/lib/use-remote-profiles";
import { useRemoteProfileDirectory } from "@/lib/use-remote-profiles";
import {
  collectIrcOnlineRegisteredUserIds,
  filterIrcOnlineMembers,
  listOfflineRegisteredProfiles,
  sortIrcMembersForDisplay,
  type IrcOfflineDirectoryProfile,
} from "./irc-offline-directory";
import { nickAvatarHue, nickInitial, profileUserIdForMember } from "./irc-chat-ui";
import type { IrcChatMember } from "@/lib/irc-chat";

type IrcMembersPanelProps = {
  roomId: string;
  selfNick: string | null;
  onDm: (nick: string) => void;
  onClose?: () => void;
  forceDesktopColumn?: boolean;
  className?: string;
};

function directoryProfileForMember(
  member: IrcChatMember,
  profiles: Record<string, RemoteProfile>,
): RemoteProfile | null {
  const id = profileUserIdForMember(member);
  if (!id) return null;
  return profiles[id] ?? profiles[id.toLowerCase()] ?? null;
}

function memberSecondaryLine(
  member: IrcChatMember,
  profile: RemoteProfile | null,
): string | null {
  if (!profile?.username) return null;
  const username = profile.username.trim();
  if (!username || username.toLowerCase() === member.nick.toLowerCase()) return null;
  return `@${username}`;
}

function MemberAvatar({
  label,
  hue,
  avatarUrl,
  offline,
  size = "md",
}: {
  label: string;
  hue: number;
  avatarUrl?: string;
  offline?: boolean;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "h-14 w-14" : "h-9 w-9";
  const text = size === "lg" ? "text-base" : "text-[11px]";

  return (
    <div className="relative shrink-0">
      <Avatar
        className={cn(
          dim,
          "border border-border/50 shadow-sm",
          offline && "opacity-75 saturate-[0.85]",
        )}
      >
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback
          className={cn(text, "font-semibold text-white")}
          style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
        >
          {nickInitial(label)}
        </AvatarFallback>
      </Avatar>
      {!offline ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500"
          aria-hidden
          title="In room"
        />
      ) : null}
    </div>
  );
}

function MemberQuickActions({
  member,
  profile,
  isSelf,
  onDm,
  onProfile,
  onClose,
}: {
  member: IrcChatMember;
  profile: RemoteProfile | null;
  isSelf: boolean;
  onDm: (nick: string) => void;
  onProfile: (userId: string) => void;
  onClose: () => void;
}) {
  const profileId = profileUserIdForMember(member);
  const secondary = memberSecondaryLine(member, profile);
  const hue = nickAvatarHue(member.nick);
  const avatarUrl = profile?.avatar_url ?? undefined;

  return (
    <div className="irc-member-quick-card flex flex-col items-center px-1 pb-1 pt-0 text-center">
      <MemberAvatar label={member.nick} hue={hue} avatarUrl={avatarUrl} size="lg" />
      <p className="mt-3 max-w-full truncate text-sm font-bold text-foreground">{member.nick}</p>
      {secondary ? (
        <p className="mt-0.5 max-w-full truncate text-xs text-muted-foreground">{secondary}</p>
      ) : null}
      {isSelf ? (
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          You
        </p>
      ) : null}
      <div className="mt-4 flex w-full flex-col gap-2">
        {profileId ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-full gap-1.5 rounded-lg text-xs"
            onClick={() => {
              onProfile(profileId);
              onClose();
            }}
          >
            <User className="h-3.5 w-3.5" />
            View profile
          </Button>
        ) : null}
        {!isSelf ? (
          <Button
            type="button"
            size="sm"
            className="h-9 w-full gap-1.5 rounded-lg text-xs"
            onClick={() => {
              onDm(member.nick);
              onClose();
            }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Message
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function OnlineMemberRow({
  member,
  profile,
  isSelf,
  onDm,
  onProfile,
}: {
  member: IrcChatMember;
  profile: RemoteProfile | null;
  isSelf: boolean;
  onDm: (nick: string) => void;
  onProfile: (userId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hue = nickAvatarHue(member.nick);
  const profileId = profileUserIdForMember(member);
  const secondary = memberSecondaryLine(member, profile);
  const avatarUrl = profile?.avatar_url ?? undefined;

  return (
    <li className="irc-member-row irc-member-row--interactive group">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            aria-label={`${member.nick}${secondary ? `, ${secondary}` : ""}`}
          >
            <MemberAvatar label={member.nick} hue={hue} avatarUrl={avatarUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
                {member.nick}
                {isSelf ? (
                  <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                    You
                  </span>
                ) : null}
              </p>
              {secondary ? (
                <p className="truncate text-[11px] text-muted-foreground">{secondary}</p>
              ) : null}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="left"
          align="start"
          className="irc-member-quick-popover w-56 p-3"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <MemberQuickActions
            member={member}
            profile={profile}
            isSelf={isSelf}
            onDm={onDm}
            onProfile={onProfile}
            onClose={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
      <div
        className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
      >
        {profileId ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            aria-label={`View profile for ${member.nick}`}
            onClick={() => onProfile(profileId)}
          >
            <User className="h-3.5 w-3.5" />
          </Button>
        ) : null}
        {!isSelf ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
            aria-label={`Direct message ${member.nick}`}
            onClick={() => onDm(member.nick)}
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </li>
  );
}

function OfflineProfileRow({
  profile,
  onProfile,
}: {
  profile: IrcOfflineDirectoryProfile;
  onProfile: (userId: string) => void;
}) {
  const hue = nickAvatarHue(profile.username);

  return (
    <li className="irc-member-row irc-member-row--offline group">
      <MemberAvatar label={profile.username} hue={hue} avatarUrl={profile.avatarUrl} offline />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold leading-tight text-muted-foreground">
          {profile.username}
        </p>
      </div>
      <div className="flex shrink-0 items-center opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground"
          aria-label={`View profile for ${profile.username}`}
          onClick={() => onProfile(profile.userId)}
        >
          <User className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}

function MemberListSkeleton() {
  return (
    <div className="space-y-2 px-2 py-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-2.5 w-16 animate-pulse rounded bg-muted/70 motion-reduce:animate-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function IrcMembersPanel({
  roomId,
  selfNick,
  onDm,
  onClose,
  forceDesktopColumn = false,
  className,
}: IrcMembersPanelProps) {
  const state = useIrcChatState();
  const { openProfile } = useProfilePopup();
  const { profiles: directoryProfiles, loading: directoryLoading } = useRemoteProfileDirectory();
  const [query, setQuery] = useState("");
  const members = state.members[roomId] ?? [];

  const onlineFiltered = useMemo(() => {
    const filtered = filterIrcOnlineMembers(members, query, directoryProfiles);
    return sortIrcMembersForDisplay(filtered);
  }, [members, query, directoryProfiles]);

  const ircOnlineRegisteredIds = useMemo(
    () => collectIrcOnlineRegisteredUserIds(state.members, state.userId),
    [state.members, state.userId],
  );

  const offlineProfiles = useMemo(
    () => listOfflineRegisteredProfiles(directoryProfiles, ircOnlineRegisteredIds, query),
    [directoryProfiles, ircOnlineRegisteredIds, query],
  );

  const inSheet = Boolean(onClose);
  const roomCountLabel =
    members.length === 1 ? "1 in room" : `${members.length} in room`;

  return (
    <aside
      data-chatroom-members=""
      data-irc-column="members"
      className={cn(
        "irc-members-panel flex h-full shrink-0 flex-col overflow-hidden border-l border-border/60",
        !forceDesktopColumn && !inSheet && "hidden lg:flex",
        inSheet && "w-full max-w-none border-l-0 shadow-none",
        className,
      )}
      style={forceDesktopColumn ? { display: "flex" } : undefined}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <header className="irc-members-header shrink-0 border-b border-border/50 px-3 pb-2 pt-2.5">
          <div className="flex items-start gap-2">
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground lg:hidden"
                aria-label="Close members panel"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Members
                </h2>
                <span className="shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {roomCountLabel}
                </span>
              </div>
            </div>
            <IrcProfileAvatarTrigger mobileSheet={inSheet} />
          </div>

          <div className="relative mt-2.5">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members…"
              aria-label="Search members"
              className="irc-members-search-input w-full rounded-full py-2 pl-8 pr-8 text-xs"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="px-1 pb-3 pt-1">
            <div className="irc-members-section-label">
              In room — {members.length}
            </div>
            {members.length === 0 ? (
              <p className="px-2 py-6 text-center text-[11px] leading-relaxed text-muted-foreground">
                No members available yet.
              </p>
            ) : onlineFiltered.length === 0 ? (
              <p className="px-2 py-4 text-center text-[11px] text-muted-foreground">
                No matching members.
              </p>
            ) : (
              <ul className="space-y-0.5">
                {onlineFiltered.map((member) => {
                  const isSelf = Boolean(
                    selfNick && member.nick.toLowerCase() === selfNick.toLowerCase(),
                  );
                  const profile = directoryProfileForMember(member, directoryProfiles);
                  return (
                    <OnlineMemberRow
                      key={`${member.nick}:${member.userId}`}
                      member={member}
                      profile={profile}
                      isSelf={isSelf}
                      onDm={onDm}
                      onProfile={openProfile}
                    />
                  );
                })}
              </ul>
            )}

            <div className="irc-members-section-label irc-members-section-label--offline">
              Registered offline — {offlineProfiles.length}
            </div>
            {directoryLoading && offlineProfiles.length === 0 ? (
              <MemberListSkeleton />
            ) : offlineProfiles.length === 0 ? (
              <p className="px-2 py-3 text-center text-[10px] leading-relaxed text-muted-foreground">
                {query ? "No matching registered users." : "No additional registered users."}
              </p>
            ) : (
              <ul className="space-y-0.5 pb-1">
                {offlineProfiles.map((profile) => (
                  <OfflineProfileRow
                    key={profile.userId}
                    profile={profile}
                    onProfile={openProfile}
                  />
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
