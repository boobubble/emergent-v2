import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/setup-wizard")({ component: Page });

function Page() {
  return (
    <div>
      <AdminPageHeader title="Setup Wizard" description="Guided first-run setup for new installations." />
      <ComingSoonPanel
        title="One-click setup"
        points={[
          "Brand basics: site name, tagline, logo, favicon",
          "Admin account + super-admin role",
          "Pick a community preset (chat-first, feed-first, gaming)",
          "Optional: import demo data to explore",
        ]}
      />
    </div>
  );
}
