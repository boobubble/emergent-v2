import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/email")({ component: Page });

function Page() {
  return (
    <div>
      <AdminPageHeader title="SMTP & Email Templates" description="Outgoing email configuration and message templates." />
      <ComingSoonPanel
        title="Email"
        points={[
          "SMTP host / port / credentials",
          "Welcome, verify, reset, mention templates",
          "Send test email",
          "Per-template enable/disable",
        ]}
      />
    </div>
  );
}
