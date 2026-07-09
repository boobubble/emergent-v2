import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, AlertTriangle, HardDrive, Database, Clock } from "lucide-react";
import { APP_VERSION } from "@/lib/app-version";

function fmtBytes(n: number | null | undefined): string {
  if (!n || n <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
}
function fmtAge(iso?: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function BackupHealthCard({
  health,
}: {
  health: {
    latest: any | null;
    table_count: number;
    db_size_bytes: number;
  } | null;
}) {
  const latest = health?.latest;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" /> Backup Health
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Clock className="h-3.5 w-3.5" />} label="Latest backup"
          value={latest ? latest.filename : "—"}
          sub={latest ? fmtAge(latest.generated_at) : ""} />
        <Stat
          icon={latest?.verified ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
          label="Verification"
          value={latest ? (latest.verified ? "Verified" : "Not verified") : "—"}
          sub={latest?.sha256 ? `sha256: ${latest.sha256.slice(0, 10)}…` : ""}
        />
        <Stat icon={<Clock className="h-3.5 w-3.5" />} label="Last restore test"
          value={fmtAge(latest?.last_restore_test_at ?? null)} />
        <Stat icon={<HardDrive className="h-3.5 w-3.5" />} label="Media files"
          value={latest?.media_files != null ? String(latest.media_files) : "—"} />
        <Stat icon={<Database className="h-3.5 w-3.5" />} label="Database size"
          value={fmtBytes(health?.db_size_bytes)} />
        <Stat icon={<Database className="h-3.5 w-3.5" />} label="Tables"
          value={String(health?.table_count ?? 0)} />
        <Stat icon={<Database className="h-3.5 w-3.5" />} label="Rows in last backup"
          value={latest?.total_rows != null ? String(latest.total_rows) : "—"} />
        <Stat icon={<Activity className="h-3.5 w-3.5" />} label="App version"
          value={APP_VERSION} sub={latest?.app_version ? `backup: ${latest.app_version}` : ""} />
      </CardContent>
    </Card>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon}{label}
      </div>
      <div className="mt-1 truncate font-medium">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground truncate">{sub}</div>}
    </div>
  );
}
