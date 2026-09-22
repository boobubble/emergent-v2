import { Link } from "@tanstack/react-router";
import { BadgeCheck, Bell, CircleUserRound, Mail, Search, UserPlus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/chat/Avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCodyChatCommunity } from "./use-codychat-community";
import type { CodyChatAction } from "./codychat-actions";
import { useAuth } from "@/lib/auth-store";
import { useMemo, useState } from "react";
import {
  filterRosterMembersByQuery,
  guestRosterEntryToDisplayUser,
  mergeYaarzoRosterMembers,
  rosterOnlineCount,
  type CodyChatGuestRosterEntry,
  type YaarzoRosterMember,
} from "./codychat-roster";
import type { User } from "@/lib/chat-types";

export type { CodyChatAction };

type CodyChatMemberPanelProps = {
  onClose?: () => void;
  onCodyAction?: (action: CodyChatAction) => void;
  codyGuests?: CodyChatGuestRosterEntry[];
  forceDesktopColumn?: boolean;
  className?: string;
};

/** CodyChat iframe bridge actions (not used for Yaarzo master profile). */
const CODY_IFRAME_ACTIONS: {
  action: CodyChatAction;
  label: string;
  Icon: typeof Mail;
}[] = [
  { action: "private", label: "Messages", Icon: Mail },
  { action: "friends", label: "Friend requests", Icon: UserPlus },
  { action: "notifications", label: "Notifications", Icon: Bell },
];

function CodyNativeActionButton({
  label,
  Icon,
  onClick,
}: {
  label: string;
  Icon: typeof Mail;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="cody-members-action-btn"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
    </button>
  );
}

function SignedInMemberRow({ member }: { member: User & { isOfficial?: boolean } }) {
  return (
    <Link to="/feed/" search={{ u: member.name }} className="cody-member-row">
      <span className="relative shrink-0">
        <Avatar user={member} size={34} square={false} />
        <span className="cody-member-online-dot" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate text-[12px] font-semibold">{member.name}</span>
          {member.isOfficial ? (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-sky-400" aria-label="Official" />
          ) : null}
        </span>
        <span className="block truncate text-[10px] text-muted-foreground">
          Lv {member.level ?? 1}
          {member.bio ? ` · ${member.bio}` : ""}
        </span>
      </span>
    </Link>
  );
}

function CodyGuestRow({ guest }: { guest: Extract<YaarzoRosterMember, { kind: "guest" }> }) {
  const displayUser = guestRosterEntryToDisplayUser(guest);
  return (
    <div className="cody-member-row cursor-default" aria-label={`${guest.name}, chat guest`}>
      <span className="relative shrink-0">
        <Avatar user={displayUser} size={34} square={false} />
        <span className="cody-member-online-dot" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate text-[12px] font-semibold">{guest.name}</span>
          <span
            className="shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-border/60"
          >
            Guest
          </span>
        </span>
        <span className="block truncate text-[10px] text-muted-foreground">
          Lv {guest.level ?? 1} · In-room guest
        </span>
      </span>
    </div>
  );
}

function RosterSection({
  title,
  members,
}: {
  title: string;
  members: YaarzoRosterMember[];
}) {
  if (members.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="cody-member-section-label">
        {title} ({members.length})
      </p>
      <div className="space-y-0.5">
        {members.map((m) =>
          m.kind === "user" ? (
            <SignedInMemberRow key={m.member.id} member={m.member} />
          ) : (
            <CodyGuestRow key={`cody-guest-${m.codyUserId}`} guest={m} />
          ),
        )}
      </div>
    </div>
  );
}

export function CodyChatMemberPanel({
  onClose,
  onCodyAction,
  codyGuests = [],
  forceDesktopColumn,
  className,
}: CodyChatMemberPanelProps) {
  const { user } = useAuth();
  const { onlineMembers, profilesLoading } = useCodyChatCommunity();
  const [query, setQuery] = useState("");

  const rosterMembers = useMemo(
    () => mergeYaarzoRosterMembers(onlineMembers, codyGuests),
    [onlineMembers, codyGuests],
  );
  const filtered = useMemo(
    () => filterRosterMembersByQuery(rosterMembers, query),
    [rosterMembers, query],
  );
  const onlineCount = rosterOnlineCount(rosterMembers);

  const officialFiltered = filtered.filter(
    (m) => m.kind === "user" && m.member.isOfficial,
  );
  const liveRoomMembers = useMemo(
    () =>
      filtered.filter(
        (m) =>
          m.kind === "guest" || (m.kind === "user" && !m.member.isOfficial),
      ),
    [filtered],
  );
  const showProfilesLoading =
    profilesLoading && onlineMembers.length === 0 && codyGuests.length === 0;

  return (
    <aside
      data-chatroom-members=""
      data-cody-column="members"
      className={cn(
        "cody-members-panel flex h-full shrink-0 flex-col overflow-hidden",
        !forceDesktopColumn && "hidden lg:flex",
        className,
      )}
      style={forceDesktopColumn ? { display: "flex" } : undefined}
    >
      <header className="cody-members-header">
        <div className="cody-members-header-main min-w-0 flex-1">
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Members
          </h2>
          {onlineCount > 0 ? (
            <p className="text-[10px] text-muted-foreground">
              {onlineCount} online on Yaarzo
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground">Yaarzo presence</p>
          )}
        </div>
        {onCodyAction ? (
          <div className="cody-members-native-actions" role="group" aria-label="Chat actions">
            {CODY_IFRAME_ACTIONS.map(({ action, label, Icon }) => (
              <CodyNativeActionButton
                key={action}
                label={label}
                Icon={Icon}
                onClick={() => onCodyAction(action)}
              />
            ))}
            {user ? (
              <Link
                to="/feed/"
                search={{ tab: "account" }}
                className="cody-members-action-btn"
                aria-label="Profile"
                title="Profile"
                onClick={onClose}
              >
                <CircleUserRound className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            ) : null}
          </div>
        ) : null}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Close members"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <div className="shrink-0 px-3 pb-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members…"
            className="cody-member-search h-8 pl-8 text-xs"
            aria-label="Search members"
          />
        </div>
      </div>

      <ScrollArea className="cody-scroll-area min-h-0 flex-1">
        <div className="space-y-4 px-3 pb-3">
          {showProfilesLoading ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Loading…</p>
          ) : null}

          {!showProfilesLoading && rosterMembers.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No Yaarzo members online right now. Room chat runs inside the panel below.
            </p>
          ) : null}

          {query.trim() ? (
            <RosterSection title="Results" members={filtered} />
          ) : (
            <>
              <RosterSection title="Official" members={officialFiltered} />
              <RosterSection title="Online" members={liveRoomMembers} />
            </>
          )}

          <p className="text-[10px] leading-snug text-muted-foreground">
            Lists Yaarzo profiles with live presence. In-room guests appear from CodyChat only and
            do not have Yaarzo profile pages.
          </p>
        </div>
      </ScrollArea>
    </aside>
  );
}

/** Alias aligned with reference UI naming. */
export const CodyChatMembersPanel = CodyChatMemberPanel;
