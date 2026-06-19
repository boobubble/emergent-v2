import type { Typer } from "@/lib/use-typing";

/** Small reusable "X is typing…" indicator with animated dots. */
export function TypingIndicator({
  typers,
  className = "",
}: {
  typers: Typer[];
  className?: string;
}) {
  if (typers.length === 0) return null;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 text-[11px] italic text-muted-foreground ${className}`}>
      <span className="inline-flex gap-0.5">
        <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-primary" />
      </span>
      <span className="truncate">
        {typers.length === 1
          ? `${typers[0].name} is typing…`
          : typers.length === 2
            ? `${typers[0].name} and ${typers[1].name} are typing…`
            : `${typers.length} people are typing…`}
      </span>
    </div>
  );
}
