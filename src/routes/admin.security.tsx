import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Fingerprint, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSetting } from "@/lib/use-admin-setting";

export const Route = createFileRoute("/admin/security")({ component: SecurityPage });

type DeviceSecurity = { enabled: boolean };
const DEFAULTS: DeviceSecurity = { enabled: false };

function SecurityPage() {
  const { values, set, save, saving } = useAdminSetting<DeviceSecurity>("device_security", DEFAULTS);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Security"
        description="Authentication, sessions, and device-level ban enforcement."
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold">Device ban enforcement</h3>
                <Badge variant={values.enabled ? "default" : "outline"}>
                  {values.enabled ? "On" : "Off"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                When enabled, every browser is hashed into a fingerprint on
                sign-in. Banning a user also bans every device they've used,
                so a fresh account from the same browser is blocked at signup
                — even on a different IP. Works best alongside email/phone
                verification; can be bypassed by a different browser, private
                mode, or another device.
              </p>
            </div>
            <Switch
              checked={values.enabled}
              onCheckedChange={(v) => set("enabled", v)}
              aria-label="Toggle device ban enforcement"
            />
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <BannedDevicesPanel />
    </div>
  );
}

function BannedDevicesPanel() {
  const qc = useQueryClient();
  const [rows, setRows] = useState<{ fingerprint: string; reason: string | null; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banned_devices")
      .select("fingerprint, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const del = useMutation({
    mutationFn: async (fp: string) => {
      const { error } = await supabase.from("banned_devices").delete().eq("fingerprint", fp);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { toast.success("Device unbanned"); void load(); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-semibold">Banned devices</h3>
          <Badge variant="outline" className="ml-auto">{rows.length}</Badge>
        </div>

        {loading ? (
          <div className="text-xs text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            No devices banned yet. Bans applied while device security is on will
            appear here.
          </div>
        ) : (
          <ul className="divide-y rounded-md border">
            {rows.map((r) => (
              <li key={r.fingerprint} className="flex items-center gap-3 p-3 text-xs">
                <code className="truncate font-mono text-[11px]" title={r.fingerprint}>
                  {r.fingerprint.slice(0, 12)}…{r.fingerprint.slice(-6)}
                </code>
                <span className="truncate text-muted-foreground">{r.reason ?? "—"}</span>
                <span className="ml-auto whitespace-nowrap text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => del.mutate(r.fingerprint)}
                  disabled={del.isPending}
                  aria-label="Unban device"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
