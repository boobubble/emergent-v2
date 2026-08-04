import type { DiscoveryContentScope } from "@/lib/discovery/config";
import { contentScopeLabel } from "@/lib/discovery/content-scope";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SCOPES: DiscoveryContentScope[] = ["for_you", "my_country", "worldwide"];

type Props = {
  scope: DiscoveryContentScope;
  onScopeChange: (scope: DiscoveryContentScope) => void;
  className?: string;
};

export function DiscoveryScopeSelector({ scope, onScopeChange, className }: Props) {
  return (
    <div className={className ?? "px-1.5 pb-1"}>
      <Select value={scope} onValueChange={(v) => onScopeChange(v as DiscoveryContentScope)}>
        <SelectTrigger className="h-7 w-full border-border/60 bg-muted/30 text-[11px] shadow-none">
          <span className="truncate text-muted-foreground">
            Showing: <SelectValue placeholder={contentScopeLabel(scope)} />
          </span>
        </SelectTrigger>
        <SelectContent>
          {SCOPES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {contentScopeLabel(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
