import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Lightweight accordion-style section. Collapsed by default (progressive disclosure).
 * Use to replace giant settings pages with grouped, expandable controls.
 */
export function Collapsible({
  title,
  description,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/40"
        aria-expanded={open}
      >
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{title}</span>
            {badge}
          </div>
          {description && (
            <div className="truncate text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      </button>
      {open && <div className="space-y-4 border-t bg-muted/10 p-4">{children}</div>}
    </Card>
  );
}
