import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/admin/performance")({ component: PerformancePage });

function PerformancePage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Performance" description="Caching, prefetch and CDN tuning." />
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
          <Activity className="h-8 w-8 opacity-50" />
          <div className="text-sm">Performance tuning panel coming soon.</div>
        </CardContent>
      </Card>
    </div>
  );
}
