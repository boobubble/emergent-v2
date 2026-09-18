import { useMemo, useState } from "react";
import { MessageCircle, Search, User, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  className?: string;
};

export function IrcMembersPanel({
  roomId,
  selfNick,
  onDm,
  onClose,
  className,
}: IrcMembersPanelProps) {
  const state = useIrcChatState();
  const { openProfile } = useProfilePopup();
  const [query, setQuery] = useState("");
  const members = state.members[roomId] ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.nick.toLowerCase().includes(q));
  }, [members, query]);

  return (
    <aside
      data-irc-column="members"
      className={cn(
        "flex h-full w-[var(--irc-members-w,248px)] max-w-[248px] shrink-0 flex-col bg-background",
        className,
      )}
    >
      <div className="irc-members-panel-inner flex h-full min-h-0 flex-col overflow-hidden">
        <div className="irc-members-users-banner shrink-0">
          <span>Users {members.length}</span>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-primary-foreground hover:bg-primary-foreground/15"
              onClick={onClose}
              aria-label="Close members panel"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="sidebar-section-label px-3 py-2 text-[10px] tracking-wider">
          ONLINE — {members.length}
        </div>

        <div className="px-2.5 pb-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/80"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nicks…"
              className="h-8 rounded-lg border-border/65 bg-background pl-8 text-[12px] shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-2 pb-3">
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
                    className="group irc-member-row"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-8 w-8 border border-border/50">
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
                      <p className="truncate text-[12px] font-semibold leading-tight text-foreground">
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
