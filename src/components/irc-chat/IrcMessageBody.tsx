import { useMemo } from "react";
import { useCustomEmojiCatalog, ircMessageCustomEmojiClassName } from "@/lib/custom-emoji-catalog";
import { parseMessageSegments } from "@/lib/irc-chat/irc-custom-emoji";
import { cn } from "@/lib/utils";

export function IrcMessageBody({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { byId } = useCustomEmojiCatalog();
  const segments = useMemo(() => parseMessageSegments(text), [text]);

  return (
    <span className={cn("whitespace-pre-wrap [overflow-wrap:break-word]", className)}>
      {segments.map((seg, index) => {
        if (seg.type === "text") {
          return <span key={`t-${index}`}>{seg.value}</span>;
        }
        const emoji = byId.get(seg.id);
        if (!emoji) {
          return (
            <span
              key={`e-${index}`}
              className="text-muted-foreground/80"
              title="Custom emoji unavailable"
            >
              {seg.raw}
            </span>
          );
        }
        return (
          <img
            key={`e-${index}`}
            src={emoji.url}
            alt={emoji.name}
            loading="lazy"
            className={ircMessageCustomEmojiClassName(emoji.displaySize)}
          />
        );
      })}
    </span>
  );
}
