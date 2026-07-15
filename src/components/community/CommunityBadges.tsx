import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Shield, Handshake, Sparkles, Star, Archive } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export interface BadgeFlags {
  is_verified?: boolean | null;
  is_official?: boolean | null;
  is_partner?: boolean | null;
  is_trusted?: boolean | null;
  is_featured?: boolean | null;
  status?: string | null;
}

interface Props {
  c: BadgeFlags;
  size?: "sm" | "md";
  showFeatured?: boolean;
  className?: string;
}

/**
 * Renders premium trust badges for a community. Reused on cards, hero, discovery
 * and admin lists. Independent flags — a community can hold several at once.
 */
export function CommunityBadges({ c, size = "sm", showFeatured, className }: Props) {
  const isArchived = c.status === "archived";
  const iconSize = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  const badgeCls = size === "md" ? "gap-1 text-[11px]" : "gap-1 text-[10px] py-0.5";

  return (
    <TooltipProvider delayDuration={150}>
      <div className={`inline-flex flex-wrap items-center gap-1 ${className ?? ""}`}>
        {c.is_official && (
          <BadgeTip label="Official Community" description="Confirmed by the platform as an official presence.">
            <Badge className={`${badgeCls} bg-blue-600/95 text-white shadow`}>
              <Shield className={iconSize} /> Official
            </Badge>
          </BadgeTip>
        )}
        {c.is_verified && !c.is_official && (
          <BadgeTip label="Verified Community" description="Identity verified by the platform.">
            <Badge className={`${badgeCls} bg-sky-500/95 text-white shadow`}>
              <BadgeCheck className={iconSize} /> Verified
            </Badge>
          </BadgeTip>
        )}
        {c.is_partner && (
          <BadgeTip label="Partner Community" description="Official brand or organization partner.">
            <Badge className={`${badgeCls} bg-violet-600/95 text-white shadow`}>
              <Handshake className={iconSize} /> Partner
            </Badge>
          </BadgeTip>
        )}
        {c.is_trusted && (
          <BadgeTip label="Trusted Community" description="Recognised by the platform for consistent quality.">
            <Badge className={`${badgeCls} bg-emerald-600/95 text-white shadow`}>
              <Sparkles className={iconSize} /> Trusted
            </Badge>
          </BadgeTip>
        )}
        {showFeatured && c.is_featured && (
          <Badge className={`${badgeCls} bg-amber-500/95 text-white shadow`}>
            <Star className={`${iconSize} fill-current`} /> Featured
          </Badge>
        )}
        {isArchived && (
          <Badge variant="outline" className={badgeCls}>
            <Archive className={iconSize} /> Archived
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}

function BadgeTip({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="text-xs font-semibold">{label}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{description}</div>
      </TooltipContent>
    </Tooltip>
  );
}
