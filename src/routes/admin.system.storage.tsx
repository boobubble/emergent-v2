import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
import { HardDrive } from "lucide-react";

export const Route = createFileRoute("/admin/system/storage")({ component: Page });

function Page() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Storage Health" description="Media bucket connectivity overview." />
      <Card className="p-4 text-sm text-muted-foreground">
        <HardDrive className="mb-2 h-5 w-5" />
        Storage errors are captured automatically. Check Error Logs for bucket failures and API Logs for upload issues.
      </Card>
      <Link to="/admin/system" className="text-sm text-primary hover:underline">← Back to System</Link>
    </div>
  );
}
