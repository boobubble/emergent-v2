import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Server } from "lucide-react";

export const Route = createFileRoute("/admin/system")({ component: SystemPage });

function SystemPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="System" description="Database, jobs and websocket settings. Super admin only." />
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
          <Server className="h-8 w-8 opacity-50" />
          <div className="text-sm">System internals are managed via Lovable Cloud.</div>
        </CardContent>
      </Card>
    </div>
  );
}
