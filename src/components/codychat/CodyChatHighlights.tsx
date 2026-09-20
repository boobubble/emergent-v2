import { Link } from "@tanstack/react-router";
import { useAppSettings } from "@/lib/app-settings";
import {
  DISCOVERY_WIDGETS_DEFAULTS,
  mergeDiscoveryWidgetsConfig,
  type DiscoveryWidgetItem,
} from "@/lib/discovery-widgets-config";
import { cn } from "@/lib/utils";

type CodyChatHighlightsProps = {
  className?: string;
  limit?: number;
};

export function CodyChatHighlights({ className, limit = 4 }: CodyChatHighlightsProps) {
  const { raw } = useAppSettings();
  const merged = mergeDiscoveryWidgetsConfig(
    (raw as { discovery_widgets?: unknown })?.discovery_widgets ??
      DISCOVERY_WIDGETS_DEFAULTS,
  );

  const items: DiscoveryWidgetItem[] = merged.enabled
    ? merged.items.filter((i) => i.enabled).slice(0, limit)
    : [];

  if (items.length === 0) return null;

  return (
    <div className={cn("cody-highlights", className)}>
      <p className="cody-section-label px-0">Highlights</p>
      <div className="cody-highlights-grid">
        {items.map((item) => (
          <Link key={item.key} to={item.to} className="cody-highlight-tile">
            <span className="text-base" aria-hidden>
              {item.icon}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-semibold">{item.title}</span>
              <span className="block truncate text-[9px] text-muted-foreground">
                {item.ctaText}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
