import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
import { ListOrdered } from "lucide-react";

export const Route = createFileRoute("/admin/system/queue")({ component: Page });

function Page() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Queue Status" description="Background task queue overview." />
      <Card className="p-4 text-sm text-muted-foreground">
        <ListOrdered className="mb-2 h-5 w-5" />
        No dedicated queue worker is configured yet. Failed async jobs surface in Error Logs with metadata.source = react-query or supabase.
      </Card>
      <Link to="/admin/system" className="text-sm text-primary hover:underline">← Back to System</Link>
    </div>
  );
}
