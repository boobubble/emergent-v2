import { useMemo, useState } from "react";
import { MessageCircle, Search, User, UserCheck, Users2, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { useProfilePopup } from "@/lib/profile-popup-context";
import { nickAvatarHue, nickInitial, profileUserIdForMember } from "./irc-chat-ui";

type IrcMembersPanelProps = {
  roomId: string;
  selfNick: string | null;
  onDm: (nick: string) => void;
  onClose?: () => void;
  forceDesktopColumn?: boolean;
  className?: string;
};

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
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(true);
  const members = state.members[roomId] ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.nick.toLowerCase().includes(q));
  }, [members, query]);

  const inSheet = Boolean(onClose);

  return (
    <aside
      data-chatroom-members=""
      data-irc-column="members"
      className={cn(
        "flex h-full w-60 shrink-0 flex-col border-l border-border bg-card",
        !forceDesktopColumn && !inSheet && "hidden lg:flex",
        inSheet && "w-full max-w-none border-l-0",
        className,
      )}
      style={forceDesktopColumn ? { display: "flex" } : undefined}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex items-center gap-1 px-2 pt-1.5">
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
          <div className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-primary px-2 py-2 text-[11px] font-semibold text-primary-foreground shadow-sm">
            <Users2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">Users</span>
            <span className="text-[10px] tabular-nums opacity-90">{members.length}</span>
          </div>
          <button
            type="button"
            disabled
            title="Friends (not available for IRC room list)"
            className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold text-muted-foreground opacity-55"
          >
            <UserCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">Friends</span>
            <span className="text-[10px] tabular-nums opacity-70">0</span>
          </button>
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
        </div>

        <div className="sidebar-section-label px-3 pb-1 pt-0.5">
          ONLINE — {members.length}
        </div>

        {searchOpen ? (
          <div className="relative mx-3 mt-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users…"
              className="min-h-11 w-full rounded-full bg-white/5 py-2 pl-8 pr-8 text-xs text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-primary"
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

        <ScrollArea className="min-h-0 flex-1 px-1 pb-2 pt-0.5">
          {members.length === 0 ? (
            <p className="px-2 py-8 text-center text-[11px] leading-relaxed text-muted-foreground">
              Waiting for IRC NAMES…
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-2 py-8 text-center text-[11px] text-muted-foreground">
              No matching nicks.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {filtered.map((member) => {
                const isSelf = Boolean(
                  selfNick && member.nick.toLowerCase() === selfNick.toLowerCase(),
                );
                const hue = nickAvatarHue(member.nick);
                const profileId = profileUserIdForMember(member);

                return (
                  <li
                    key={`${member.nick}:${member.userId}`}
                    className="group flex min-h-[44px] w-full items-center gap-0.5 rounded-md px-1 py-0 transition-colors hover:bg-white/5 lg:h-9 lg:max-h-9 lg:min-h-9 lg:gap-1 lg:px-1.5"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-8 w-8 border border-border/50 lg:h-7 lg:w-7">
                        <AvatarFallback
                          className="text-[10px] font-semibold text-white"
                          style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
                        >
                          {nickInitial(member.nick)}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="absolute -bottom-px -right-px h-2 w-2 rounded-full border border-background bg-emerald-500"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold leading-tight text-foreground/90 lg:text-[12px]">
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
                          onClick={() => openProfile(profileId)}
                        >
                          <User className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                      {!isSelf ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                          aria-label={`Direct message ${member.nick}`}
                          onClick={() => onDm(member.nick)}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </div>
    </aside>
  );
}
