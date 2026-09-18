import { useMemo, useState } from "react";
import { MessageCircle, Search, User, Users2, X } from "lucide-react";
import { IrcProfileAvatarTrigger } from "./IrcChatSettingsMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { useProfilePopup } from "@/lib/profile-popup-context";
import { useRemoteProfileDirectory } from "@/lib/use-remote-profiles";
import {
  collectIrcOnlineRegisteredUserIds,
  filterIrcOnlineMembers,
  listOfflineRegisteredProfiles,
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

function MemberAvatar({
  label,
  hue,
  avatarUrl,
  offline,
}: {
  label: string;
  hue: number;
  avatarUrl?: string;
  offline?: boolean;
}) {
  return (
    <div className="relative shrink-0">
      <Avatar
        className={cn(
          "h-[30px] w-[30px] border border-border/45",
          offline && "opacity-72 saturate-[0.82]",
        )}
      >
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback
          className="text-[10px] font-semibold text-white"
          style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
        >
          {nickInitial(label)}
        </AvatarFallback>
      </Avatar>
      {!offline ? (
        <span
          className="absolute -bottom-px -right-px h-2 w-2 rounded-full border border-background bg-emerald-500"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function OnlineMemberRow({
  member,
  isSelf,
  onDm,
  onProfile,
}: {
  member: IrcChatMember;
  isSelf: boolean;
  onDm: (nick: string) => void;
  onProfile: (userId: string) => void;
}) {
  const hue = nickAvatarHue(member.nick);
  const profileId = profileUserIdForMember(member);

  return (
    <li className="irc-member-row group">
      <MemberAvatar label={member.nick} hue={hue} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold leading-tight text-foreground/90">
          {member.nick}
          {isSelf ? (
            <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
              You
            </span>
          ) : null}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        {profileId ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg"
            aria-label={`View profile for ${member.nick}`}
            onClick={() => onProfile(profileId)}
          >
            <User className="h-3.5 w-3.5" />
          </Button>
        ) : null}
        {!isSelf ? (
          <button
            type="button"
            aria-label={`Direct message ${member.nick}`}
            onClick={() => onDm(member.nick)}
            className="grid min-h-11 min-w-11 shrink-0 place-items-center self-center rounded-md text-muted-foreground opacity-70 transition-all hover:bg-primary/10 hover:text-primary group-hover:opacity-100 lg:h-7 lg:w-7 lg:min-h-0 lg:min-w-0"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
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
        <p className="truncate text-[12px] font-semibold leading-tight text-muted-foreground">
          {profile.username}
        </p>
      </div>
      <div className="flex shrink-0 items-center opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-muted-foreground"
          aria-label={`View profile for ${profile.username}`}
          onClick={() => onProfile(profile.userId)}
        >
          <User className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
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
  const [searchOpen, setSearchOpen] = useState(true);
  const members = state.members[roomId] ?? [];

  const onlineFiltered = useMemo(
    () => filterIrcOnlineMembers(members, query),
    [members, query],
  );

  const ircOnlineRegisteredIds = useMemo(
    () => collectIrcOnlineRegisteredUserIds(state.members, state.userId),
    [state.members, state.userId],
  );

  const offlineProfiles = useMemo(
    () => listOfflineRegisteredProfiles(directoryProfiles, ircOnlineRegisteredIds, query),
    [directoryProfiles, ircOnlineRegisteredIds, query],
  );

  const inSheet = Boolean(onClose);

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
        <div className="irc-members-tabs-row flex items-center gap-1 px-2 pb-1.5 pt-1.5">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground lg:hidden"
              aria-label="Close members panel"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <div className="irc-members-tab irc-members-tab--active min-w-0 flex-1">
            <Users2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">Users</span>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen((s) => !s)}
            title="Search"
            aria-label="Toggle search"
            aria-pressed={searchOpen}
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors",
              searchOpen
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            <Search className="h-4 w-4" />
          </button>
          <IrcProfileAvatarTrigger mobileSheet={inSheet} />
        </div>

        {searchOpen ? (
          <div className="relative mx-2 mb-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users…"
              className="sidebar-search-input min-h-9 w-full rounded-full py-1.5 pl-8 pr-8 text-xs"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        ) : null}

        <ScrollArea className="min-h-0 flex-1 px-0.5 pb-2 pt-0">
          <div className="irc-members-section-label">
            ONLINE — {members.length}
          </div>
          {members.length === 0 ? (
            <p className="px-2 py-4 text-center text-[11px] leading-relaxed text-muted-foreground">
              Waiting for IRC NAMES…
            </p>
          ) : onlineFiltered.length === 0 ? (
            <p className="px-2 py-4 text-center text-[11px] text-muted-foreground">
              No matching nicks.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {onlineFiltered.map((member) => {
                const isSelf = Boolean(
                  selfNick && member.nick.toLowerCase() === selfNick.toLowerCase(),
                );
                return (
                  <OnlineMemberRow
                    key={`${member.nick}:${member.userId}`}
                    member={member}
                    isSelf={isSelf}
                    onDm={onDm}
                    onProfile={openProfile}
                  />
                );
              })}
            </ul>
          )}

          <div className="irc-members-section-label irc-members-section-label--offline">
            OFFLINE — {offlineProfiles.length}
          </div>
          {directoryLoading && offlineProfiles.length === 0 ? (
            <p className="px-2 py-3 text-center text-[10px] text-muted-foreground">
              Loading directory…
            </p>
          ) : offlineProfiles.length === 0 ? (
            <p className="px-2 py-3 text-center text-[10px] leading-relaxed text-muted-foreground">
              No registered users to show.
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
        </ScrollArea>
      </div>
    </aside>
  );
}
