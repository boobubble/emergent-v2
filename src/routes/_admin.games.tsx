import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/_admin/games")({ component: () => (
  <div>
    <AdminPageHeader title="Games" description="Mini-games, lobbies, and rewards." />
    <ComingSoonPanel title="Games configuration" points={[
      "Enable/disable specific games",
      "Reward multipliers",
      "Lobby limits",
    ]} />
  </div>
)});
