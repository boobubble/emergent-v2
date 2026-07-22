import { createFileRoute } from "@tanstack/react-router";
import { CompetitionsFeedPanel } from "@/components/admin/CompetitionsFeedPanel";

export const Route = createFileRoute("/admin/competitions-feed")({
  component: CompetitionsFeedPanel,
});


