import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/_admin/security")({ component: () => (
  <div>
    <AdminPageHeader title="Security" description="Authentication, sessions, and protection controls." />
    <ComingSoonPanel title="Security controls" points={[
      "Password & session policy",
      "Rate limit and abuse protection",
      "Two-factor authentication",
      "Audit log",
    ]} />
  </div>
)});
