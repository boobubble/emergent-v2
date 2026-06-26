import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
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
      <AdminPageHeader title="System" description="Database, jobs and websocket settings. Super admin only." />

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
            <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
              <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Installed</div>
              <div className="text-xs text-muted-foreground">
                {status.installed_at && <>At: {new Date(status.installed_at).toLocaleString()}<br /></>}
                License: {status.license_type ?? "—"} • Mode: {status.mode ?? "—"} • Version: {status.version ?? "—"}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
              <AlertTriangle className="mr-1 inline h-4 w-4 text-amber-600" /> Installer is unlocked.
            </div>
          )}

          {confirm && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs">
              This will clear the installer lock. Anyone with the URL can run /installer again — including creating a new super admin if none exists. Continue?
            </div>
          )}

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
            <Button variant="ghost" size="sm" onClick={() => setConfirm(false)} className="ml-2">Cancel</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
