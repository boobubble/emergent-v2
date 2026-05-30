import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Flag } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({ component: ReportsPage });

function ReportsPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Reports" description="User-submitted reports queue." />
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
          <Flag className="h-8 w-8 opacity-50" />
          <div className="text-sm">No open reports.</div>
        </CardContent>
      </Card>
    </div>
  );
}
