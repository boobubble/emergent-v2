import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/activity-logs")({ component: Page });

function Page() {
  return (
    <div>
      <AdminPageHeader title="User Activity Logs" description="Per-user login, IP, device and session history." />
      <ComingSoonPanel
        title="Activity stream"
        points={[
          "Logins, logouts, password changes",
          "Devices and IP addresses",
          "Filter by user or time range",
          "Export to CSV",
        ]}
      />
    </div>
  );
}
