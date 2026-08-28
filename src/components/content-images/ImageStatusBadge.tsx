import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ImageStatusKind, ImageStatusSummary } from "@/lib/content-image-seo";

function tone(kind: ImageStatusKind) {
  if (kind === "ready") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300";
  if (kind === "missing") return "border-destructive/40 bg-destructive/10 text-destructive";
  return "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300";
}

function mark(kind: ImageStatusKind) {
  if (kind === "ready") return "✓";
  if (kind === "missing") return "✕";
  return "⚠";
}

export function ImageStatusBadge({
  status,
  className,
  compact = false,
}: {
  status: ImageStatusSummary | { kind: ImageStatusKind; label: string; compactLabel?: string };
  className?: string;
  compact?: boolean;
}) {
  const text = compact ? status.compactLabel || status.label : status.label;
  return (
    <Badge
      variant="outline"
      className={cn("whitespace-nowrap text-[10px] font-medium", tone(status.kind), className)}
    >
      {mark(status.kind)} {text}
    </Badge>
  );
}
