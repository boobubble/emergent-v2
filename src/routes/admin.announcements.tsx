import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/announcements")({ component: Page });

function Page() {
  return (
    <div>
      <AdminPageHeader title="Announcements" description="Site-wide banners and broadcast messages." />
      <ComingSoonPanel
        title="Announcement Manager"
        points={[
          "Top bar / inline / toast variants",
          "Schedule start and end dates",
          "Target by role or audience",
          "Dismissible per user",
        ]}
      />
    </div>
  );
}
