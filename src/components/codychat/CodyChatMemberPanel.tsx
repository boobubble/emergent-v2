import { Link } from "@tanstack/react-router";
import { BadgeCheck, Bell, CircleUserRound, Mail, Search, UserPlus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/chat/Avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useCodyChatCommunity,
  useMemberSearchFilter,
  type CodyCommunityMember,
} from "./use-codychat-community";
import type { CodyChatAction } from "./codychat-actions";
import { useAuth } from "@/lib/auth-store";

export type { CodyChatAction };

type CodyChatMemberPanelProps = {
  onClose?: () => void;
  onCodyAction?: (action: CodyChatAction) => void;
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

function MemberRow({ member }: { member: CodyCommunityMember }) {
  return (
    <Link
      to="/feed/"
      search={{ u: member.name }}
      className="cody-member-row"
    >
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

function MemberSection({
  title,
  members,
}: {
  title: string;
  members: CodyCommunityMember[];
}) {
  if (members.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="cody-member-section-label">
        {title} ({members.length})
      </p>
      <div className="space-y-0.5">
        {members.map((m) => (
          <MemberRow key={m.id} member={m} />
        ))}
      </div>
    </div>
  );
}

export function CodyChatMemberPanel({
  onClose,
  onCodyAction,
  forceDesktopColumn,
  className,
}: CodyChatMemberPanelProps) {
  const { user } = useAuth();
  const { onlineMembers, onlineCount, profilesLoading } = useCodyChatCommunity();
  const { query, setQuery, filtered } = useMemberSearchFilter(onlineMembers);

  const generalOnline = filtered.filter((m) => !m.isOfficial);
  const officialFiltered = filtered.filter((m) => m.isOfficial);

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
          {profilesLoading && onlineMembers.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Loading…</p>
          ) : null}

          {!profilesLoading && onlineMembers.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No Yaarzo members online right now. Room chat runs inside the panel below.
            </p>
          ) : null}

          {query.trim() ? (
            <MemberSection title="Results" members={filtered} />
          ) : (
            <>
              <MemberSection title="Official" members={officialFiltered} />
              <MemberSection
                title="Online"
                members={generalOnline.length ? generalOnline : filtered}
              />
            </>
          )}

          <p className="text-[10px] leading-snug text-muted-foreground">
            Lists Yaarzo profiles with live presence. In-room roster and messages stay inside
            CodyChat.
          </p>
        </div>
      </ScrollArea>
    </aside>
  );
}

/** Alias aligned with reference UI naming. */
export const CodyChatMembersPanel = CodyChatMemberPanel;
