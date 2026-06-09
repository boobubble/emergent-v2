import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/demo")({ component: Page });

function Page() {
  return (
    <div>
      <AdminPageHeader title="Demo Data" description="Import showcase content or reset to a clean slate." />
      <ComingSoonPanel
        title="Demo import & reset"
        points={[
          "Seed sample users, chatrooms, posts, games",
          "Restore demo state with one click",
          "Wipe all demo content without touching real users",
        ]}
      />
    </div>
  );
}
