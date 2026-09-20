import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

type RadioWidgetRow = {
  id: string;
  name: string;
  description?: string | null;
};

type CodyChatRadioWidgetProps = {
  widgets: RadioWidgetRow[];
  className?: string;
  compact?: boolean;
};

export function CodyChatRadioWidget({ widgets, className, compact }: CodyChatRadioWidgetProps) {
  if (widgets.length === 0) return null;
  const primary = widgets[0];

  return (
    <div className={cn("cody-radio-card", compact && "cody-radio-card-compact", className)}>
      <div className="flex items-start gap-2">
        <div className="cody-radio-disc" aria-hidden>
          <Radio className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Yaarzo Radio
          </p>
          <p className="truncate text-[12px] font-semibold">{primary.name}</p>
          {primary.description ? (
            <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
              {primary.description}
            </p>
          ) : null}
        </div>
      </div>
      <Link to="/radio" className="cody-radio-cta">
        View station
      </Link>
    </div>
  );
}
