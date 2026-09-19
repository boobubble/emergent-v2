import { formatTypingIndicatorLabel, type IrcTypingUser } from "@/lib/irc-chat/irc-typing-client";
import { cn } from "@/lib/utils";

export function IrcTypingIndicator({
  typers,
  excludeUserId,
  className,
}: {
  typers: IrcTypingUser[];
  excludeUserId?: string | null;
  className?: string;
}) {
  const label = formatTypingIndicatorLabel(typers, excludeUserId);
  return (
    <div
      className={cn(
        "irc-typing-indicator flex min-h-[1.25rem] items-center gap-2 px-3 pb-1 pt-0 text-[11px] text-muted-foreground",
        !label && "invisible",
        className,
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="irc-typing-dots inline-flex gap-0.5" aria-hidden>
        <span className="irc-typing-dot" />
        <span className="irc-typing-dot" />
        <span className="irc-typing-dot" />
      </span>
      <span className="truncate">{label ?? ""}</span>
    </div>
  );
}
