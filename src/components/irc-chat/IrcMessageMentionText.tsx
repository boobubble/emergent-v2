import { useMemo } from "react";
import { splitTextMentionParts } from "@/lib/irc-chat/mentions";
import { cn } from "@/lib/utils";

export function IrcMessageMentionText({
  text,
  knownMentionKeys,
  selfMentionKeys,
}: {
  text: string;
  knownMentionKeys: ReadonlySet<string>;
  selfMentionKeys: ReadonlySet<string>;
}) {
  const parts = useMemo(
    () => splitTextMentionParts(text, knownMentionKeys, selfMentionKeys),
    [text, knownMentionKeys, selfMentionKeys],
  );

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={`t-${index}`}>{part.value}</span>;
        }
        if (!part.known) {
          return <span key={`m-${index}`}>{part.value}</span>;
        }
        return (
          <span
            key={`m-${index}`}
            className={cn(
              "irc-mention-pill rounded px-0.5 font-medium",
              part.mentionsSelf
                ? "bg-primary/25 text-primary"
                : "bg-primary/12 text-[hsl(265_70%_78%)]",
            )}
          >
            {part.value}
          </span>
        );
      })}
    </>
  );
}
