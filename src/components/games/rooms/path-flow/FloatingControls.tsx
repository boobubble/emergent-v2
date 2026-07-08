import { Lightbulb, Pause, Play, RotateCcw, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom-anchored floating action buttons. Circular, glass, touch-friendly.
 * Replaces the old large control row.
 */
export function FloatingControls({
  canHint, paused, hintCost,
  onHint, onPause, onResume, onRestart, onUndo,
}: {
  canHint: boolean;
  paused: boolean;
  hintCost: number;
  onHint(): void;
  onPause(): void;
  onResume(): void;
  onRestart(): void;
  onUndo?(): void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-border/60 bg-background/70 px-3 py-2 shadow-[0_10px_40px_-12px_hsl(var(--primary)/0.35)] backdrop-blur-xl">
        <Fab label={`Hint · ${hintCost}c`} onClick={onHint} disabled={!canHint} tone="primary">
          <Lightbulb className="h-4 w-4" />
        </Fab>
        <Fab label="Undo" onClick={onUndo} disabled={!onUndo}>
          <Undo2 className="h-4 w-4" />
        </Fab>
        {paused ? (
          <Fab label="Resume" onClick={onResume}>
            <Play className="h-4 w-4" />
          </Fab>
        ) : (
          <Fab label="Pause" onClick={onPause}>
            <Pause className="h-4 w-4" />
          </Fab>
        )}
        <Fab label="Restart" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" />
        </Fab>
      </div>
    </div>
  );
}

function Fab({
  children, onClick, disabled, label, tone = "default",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  label: string;
  tone?: "default" | "primary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full ring-1 transition-all active:scale-95",
        "disabled:opacity-40 disabled:pointer-events-none",
        tone === "primary"
          ? "bg-primary text-primary-foreground ring-primary/40 shadow-[0_6px_20px_-6px_hsl(var(--primary)/0.6)] hover:brightness-110"
          : "bg-card/80 text-foreground ring-border/60 hover:bg-card",
      )}
    >
      {children}
    </button>
  );
}
