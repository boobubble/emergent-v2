import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
import { runInstallationHealthCheck } from "@/lib/owner-setup.functions";

export const Route = createFileRoute("/admin/system/database")({ component: Page });

function Page() {
  const healthFn = useServerFn(runInstallationHealthCheck);
  const { data, isLoading } = useQuery({
    queryKey: ["system-db-health"],
    queryFn: () => healthFn({}),
    staleTime: 30_000,
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Database Health" description="Connection and schema readiness checks." />
      <Card className="p-4">
        {isLoading ? <p className="text-sm text-muted-foreground">Running checks…</p> : (
          <pre className="max-h-96 overflow-auto text-xs">{JSON.stringify(data, null, 2)}</pre>
        )}
      </Card>
      <Link to="/admin/system" className="text-sm text-primary hover:underline">← Back to System</Link>
    </div>
  );
}
