import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type LiveCompetition = {
  id: string;
  name: string;
  slug: string;
  status?: string | null;
};

type CodyChatCompetitionWidgetProps = {
  competitions: LiveCompetition[];
  className?: string;
};

export function CodyChatCompetitionWidget({
  competitions,
  className,
}: CodyChatCompetitionWidgetProps) {
  const live = competitions.find((c) => c.status === "live");
  if (!live) return null;

  return (
    <div className={cn("cody-competition-card", className)}>
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Live competition
          </p>
          <p className="truncate text-[12px] font-semibold">{live.name}</p>
        </div>
        <span className="cody-live-pill">Live</span>
      </div>
      <Link
        to="/competitions/$slug"
        params={{ slug: live.slug }}
        className="cody-competition-cta"
      >
        View competition
      </Link>
    </div>
  );
}
