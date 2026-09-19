import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IrcMentionCandidate } from "@/lib/irc-chat/mentions";
import { nickAvatarHue, nickInitial } from "./irc-chat-ui";
import { cn } from "@/lib/utils";

export function IrcMentionSuggestions({
  items,
  activeIndex,
  onPick,
}: {
  items: IrcMentionCandidate[];
  activeIndex: number;
  onPick: (candidate: IrcMentionCandidate) => void;
}) {
  if (!items.length) return null;
  return (
    <div
      className="irc-mention-popover absolute bottom-full left-0 z-50 mb-2 w-[min(100%,18rem)] overflow-hidden rounded-xl border border-primary/25 bg-[hsl(228_32%_11%)] shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.45)]"
      role="listbox"
      aria-label="Mention suggestions"
    >
      <ul className="max-h-52 overflow-y-auto py-1">
        {items.map((item, index) => {
          const hue = nickAvatarHue(item.nick);
          const active = index === activeIndex;
          return (
            <li key={`${item.userId ?? item.nick}-${item.mentionKey}`}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                  active ? "bg-primary/15 text-foreground" : "hover:bg-white/5",
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onPick(item);
                }}
              >
                <Avatar className="h-8 w-8 border border-border/40">
                  {item.avatarUrl ? <AvatarImage src={item.avatarUrl} alt="" /> : null}
                  <AvatarFallback
                    className="text-[11px] font-semibold text-white"
                    style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
                  >
                    {nickInitial(item.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">@{item.mentionKey}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
