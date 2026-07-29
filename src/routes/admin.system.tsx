import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, RotateCcw, CheckCircle2, AlertTriangle, Bug, Activity, Database, HardDrive, Radio, KeyRound, History, ListOrdered } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { fetchInstallStatus, resetInstallation, type InstallStatus } from "@/lib/installer";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/system")({ component: SystemPage });

function SystemPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<InstallStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { fetchInstallStatus().then(setStatus); }, []);

  async function onReset() {
    if (!confirm) { setConfirm(true); return; }
    setBusy(true);
    try {
      await resetInstallation();
      toast.success("Installer reset. Redirecting…");
      setTimeout(() => navigate({ to: "/installer" }), 600);
    } catch (e: any) {
      toast.error(e?.message ?? "Reset failed");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title="System" description="Monitoring, health checks, and installer controls. Super admin only." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: "/admin/error-logs", label: "Error Logs", icon: Bug },
          { to: "/admin/api", label: "API Logs", icon: KeyRound },
          { to: "/admin/activity-logs", label: "Auth Logs", icon: History },
          { to: "/admin/system/queue", label: "Queue Status", icon: ListOrdered },
          { to: "/admin/system/jobs", label: "Background Jobs", icon: Server },
          { to: "/admin/realtime", label: "Realtime Status", icon: Radio },
          { to: "/admin/system/database", label: "Database Health", icon: Database },
          { to: "/admin/system/storage", label: "Storage Health", icon: HardDrive },
          { to: "/admin/performance", label: "Performance Metrics", icon: Activity },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium hover:bg-muted/50"
          >
            <item.icon className="h-4 w-4 text-primary" />
            {item.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Server className="h-4 w-4" /> Cloud Backend</CardTitle>
          <CardDescription>System internals are managed via Lovable Cloud.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Installer</CardTitle>
          <CardDescription>Lock state for the /installer setup wizard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {status?.installed ? (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Installed</div>
              <div className="text-xs text-muted-foreground">
                {status.installed_at && <>At: {new Date(status.installed_at).toLocaleString()}<br /></>}
                License: {status.license_type ?? "—"} • Mode: {status.mode ?? "—"} • Version: {status.version ?? "—"}
              </div>

              {confirm && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs">
                  This will clear the installer lock. Anyone with the URL can run /installer again — including creating a new super admin if none exists. Continue?
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant={confirm ? "destructive" : "outline"}
                  onClick={onReset}
                  disabled={busy}
                  size="sm"
                >
                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
                  {confirm ? "Yes, Reset Installer" : "Reset Installer Lock"}
                </Button>
                {confirm && (
                  <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>Cancel</Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm space-y-2">
              <div className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-4 w-4" /> Installer is unlocked</div>
              <p className="text-xs text-muted-foreground">
                The setup wizard has not been locked yet. Complete installation at /installer to enable this control.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
