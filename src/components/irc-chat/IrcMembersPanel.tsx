import { MessageCircle, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { nickAvatarHue, nickInitial } from "./irc-chat-ui";

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
  const members = state.members[roomId] ?? [];

  return (
    <aside
      className={cn(
        "flex h-full w-[280px] shrink-0 flex-col border-l border-border/80 bg-card/50 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/80 px-4 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Online</h2>
          <p className="text-[11px] text-muted-foreground">{members.length} in room</p>
        </div>
        {onClose ? (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2 py-2">
        {members.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            Waiting for IRC NAMES…
          </p>
        ) : (
          <ul className="space-y-0.5">
            {members.map((member) => {
              const isSelf = Boolean(
                selfNick && member.nick.toLowerCase() === selfNick.toLowerCase(),
              );
              const hue = nickAvatarHue(member.nick);

              return (
                <li
                  key={`${member.nick}:${member.userId}`}
                  className="group flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/70"
                >
                  <Avatar className="h-9 w-9 border border-border/50 shadow-sm">
                    <AvatarFallback
                      className="text-xs font-semibold text-white"
                      style={{ backgroundColor: `hsl(${hue} 58% 48%)` }}
                    >
                      {nickInitial(member.nick)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {member.nick}
                      {isSelf ? (
                        <span className="ml-1 text-[11px] font-normal text-muted-foreground">(you)</span>
                      ) : null}
                    </p>
                    {member.isGuest ? (
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Guest</p>
                    ) : null}
                  </div>
                  {!isSelf ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 gap-1 px-2 text-xs opacity-80 group-hover:opacity-100"
                      onClick={() => onDm(member.nick)}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      DM
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </aside>
  );
}
