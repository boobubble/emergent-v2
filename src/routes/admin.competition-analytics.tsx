import { createFileRoute } from "@tanstack/react-router";
import { CompetitionAnalyticsPanel } from "@/components/admin/CompetitionAnalyticsPanel";

export const Route = createFileRoute("/admin/competition-analytics")({
  component: CompetitionAnalyticsPanel,
});


