import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/cache")({ component: Page });

function Page() {
  return (
    <div>
      <AdminPageHeader title="Cache & Maintenance Tools" description="Clear caches and run routine cleanups." />
      <ComingSoonPanel
        title="Cache Manager"
        points={[
          "Clear app settings cache",
          "Clear avatar / media cache",
          "Rebuild search indexes",
          "Prune expired sessions and tokens",
        ]}
      />
    </div>
  );
}
