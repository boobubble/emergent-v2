import { cn } from "@/lib/utils";

type CodyChatTrendingBarProps = {
  topics: string[];
  className?: string;
};

export function CodyChatTrendingBar({ topics, className }: CodyChatTrendingBarProps) {
  const labels = topics.map((t) => t.trim()).filter(Boolean);
  if (labels.length === 0) return null;

  const labelPrefix = labels.length === 1 ? "Topic" : "Updates";

  return (
    <div className={cn("cody-trending-bar shrink-0", className)} role="region" aria-label="Room topics">
      <span className="cody-trending-label">{labelPrefix}</span>
      <div className="cody-trending-scroll">
        {labels.map((topic) => (
          <span key={topic} className="cody-trend-chip">
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
