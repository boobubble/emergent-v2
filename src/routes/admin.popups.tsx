import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/popups")({ component: Page });

function Page() {
  return (
    <div>
      <AdminPageHeader title="Popup Manager" description="Modals, welcome dialogs, and CTAs." />
      <ComingSoonPanel
        title="Popups"
        points={[
          "First-visit, on-login, on-event triggers",
          "Image / video / rich text content",
          "Frequency caps and audience rules",
        ]}
      />
    </div>
  );
}
