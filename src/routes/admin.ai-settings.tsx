import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/ai-settings")({ component: () => (
  <div>
    <AdminPageHeader title="AI Settings" description="Model selection, quotas, and feature flags." />
    <ComingSoonPanel title="AI configuration" points={[
      "Default model per feature",
      "Per-user daily quotas",
      "Prompt and safety templates",
    ]} />
  </div>
)});
