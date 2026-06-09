import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/export")({ component: Page });

function Page() {
  return (
    <div>
      <AdminPageHeader title="Export" description="Download CSV / Excel snapshots of core data." />
      <ComingSoonPanel
        title="Data export"
        points={[
          "Users, posts, messages, transactions",
          "Filter by date range",
          "CSV and XLSX formats",
        ]}
      />
    </div>
  );
}
