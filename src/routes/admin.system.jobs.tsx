import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
import { Server } from "lucide-react";

export const Route = createFileRoute("/admin/system/jobs")({ component: Page });

function Page() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Background Jobs" description="Scheduled and cron-style jobs." />
      <Card className="p-4 text-sm text-muted-foreground">
        <Server className="mb-2 h-5 w-5" />
        Bot events, feed digest, and broadcaster schedules run via app automation. See Automation and Realtime Status for live health.
      </Card>
      <Link to="/admin/system" className="text-sm text-primary hover:underline">← Back to System</Link>
    </div>
  );
}
