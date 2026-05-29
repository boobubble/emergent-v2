import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/components/admin/AdminNav";
import { ROLE_REGISTRY } from "@/lib/admin-roles";
import { MODULE_REGISTRY } from "@/lib/admin-modules";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = [
    { label: "Modules available", value: MODULE_REGISTRY.length },
    { label: "Roles configured",   value: ROLE_REGISTRY.length },
    { label: "Settings sections",  value: ADMIN_NAV.length - 1 },
    { label: "Status",             value: "Online", tone: "ok" as const },
  ];

  const quick = ADMIN_NAV.filter((n) => n.to !== "/admin").slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Configure your community foundation. More modules light up as you enable them.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-2xl font-semibold">{s.value}</div>
                {"tone" in s && s.tone === "ok" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {quick.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className="group flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3 transition hover:border-primary/40 hover:bg-muted/40">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium">{item.label}</div>
                      {item.badge && <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{item.badge}</Badge>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{item.group}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
