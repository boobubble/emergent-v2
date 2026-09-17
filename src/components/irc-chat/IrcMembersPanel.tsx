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
      className={cn(
        "flex h-full w-[272px] shrink-0 flex-col border-l border-border/50 bg-transparent p-1 lg:w-[280px]",
        className,
      )}
    >
      <div className="premium-floating-sidebar flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/40 px-3 py-2.5">
          <div>
            <h2 className="text-[13px] font-semibold text-foreground">Online users</h2>
            <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span
                className="chat-online-dot"
                aria-hidden
                style={{ width: "0.4rem", height: "0.4rem" }}
              />
              {members.length} in room
            </p>
          </div>
          {onClose ? (
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="px-2.5 py-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/80"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nicks…"
              className="h-8 rounded-xl border-border/60 bg-background/60 pl-8 text-[13px] shadow-none focus-visible:bg-background"
            />
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-1.5 pb-2">
          {members.length === 0 ? (
            <p className="px-3 py-6 text-center text-[11px] text-muted-foreground">
              Waiting for IRC NAMES…
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-[11px] text-muted-foreground">
              No matching nicks.
            </p>
          ) : (
            <ul className="space-y-px">
              {filtered.map((member) => {
                const isSelf = Boolean(
                  selfNick && member.nick.toLowerCase() === selfNick.toLowerCase(),
                );
                const hue = nickAvatarHue(member.nick);
                const profileId = profileUserIdForMember(member);

                return (
                  <li
                    key={`${member.nick}:${member.userId}`}
                    className="group flex min-h-9 items-center gap-1 rounded-lg px-1.5 py-0.5 transition-colors hover:bg-primary/[0.06] lg:gap-1.5"
                  >
                    <Avatar className="h-7 w-7 border border-border/40">
                      <AvatarFallback
                        className="text-[10px] font-semibold text-white"
                        style={{ backgroundColor: `hsl(${hue} 52% 46%)` }}
                      >
                        {nickInitial(member.nick)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold leading-tight text-foreground/90">
                        {member.nick}
                        {isSelf ? (
                          <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                            You
                          </span>
                        ) : null}
                      </p>
                      {member.isGuest ? (
                        <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                          Guest
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      {profileId ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
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
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
