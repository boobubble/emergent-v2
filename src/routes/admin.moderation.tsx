import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/_admin/moderation")({ component: () => (
  <div>
    <AdminPageHeader title="Moderation" description="Reports, bans, mutes, and content filters." />
    <ComingSoonPanel title="Moderation tools" points={[
      "Reports queue",
      "Ban and mute controls",
      "Word filter & auto-actions",
    ]} />
  </div>
)});
