import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_REGISTRY } from "@/lib/admin-roles";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/admin/roles")({
  component: RolesPage,
});

function RolesPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader title="Roles" description="Permission architecture used across the platform. Assignment UI ships in a later step." />

      <div className="grid gap-3 sm:grid-cols-2">
        {ROLE_REGISTRY.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Shield className={`h-4 w-4 ${r.color}`} />
                <div className="text-sm font-semibold">{r.label}</div>
                <Badge variant="outline" className="ml-auto h-5 px-1.5 text-[10px] font-mono">{r.id}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{r.description}</p>
              <div className="flex flex-wrap gap-1">
                {r.permissions.map((p) => (
                  <span key={p} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{p}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
