import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trash2, ShieldCheck, Lock } from "lucide-react";

function fmtBytes(n?: number | null): string {
  if (!n || n <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
}

export function BackupHistoryTable({
  rows, onDelete,
}: {
  rows: any[];
  onDelete: (id: string) => void;
}) {
  if (!rows.length) {
    return <p className="text-xs text-muted-foreground">No backups recorded yet. Run Full Backup to add the first entry.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-left text-[11px] uppercase text-muted-foreground">
          <tr className="border-b">
            <th className="px-2 py-2">Backup</th>
            <th className="px-2 py-2">Date</th>
            <th className="px-2 py-2">Type</th>
            <th className="px-2 py-2">Size</th>
            <th className="px-2 py-2">Verified</th>
            <th className="px-2 py-2">Checksum</th>
            <th className="px-2 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b last:border-0">
              <td className="px-2 py-2 font-mono text-[11px]">
                {r.filename}
                {r.encrypted && <Lock className="ml-1 inline h-3 w-3 text-amber-500" aria-label="encrypted" />}
              </td>
              <td className="px-2 py-2">{new Date(r.generated_at).toLocaleString()}</td>
              <td className="px-2 py-2"><Badge variant="outline">{r.backup_type}</Badge></td>
              <td className="px-2 py-2">{fmtBytes(r.size_bytes)}</td>
              <td className="px-2 py-2">
                {r.verified
                  ? <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" /> yes</span>
                  : <span className="inline-flex items-center gap-1 text-muted-foreground"><XCircle className="h-3 w-3" /> no</span>}
              </td>
              <td className="px-2 py-2 font-mono text-[10px] max-w-[160px] truncate" title={r.sha256 ?? ""}>
                {r.sha256 ? <><ShieldCheck className="mr-1 inline h-3 w-3 text-emerald-500" />{r.sha256.slice(0, 12)}…</> : "—"}
              </td>
              <td className="px-2 py-2 text-right">
                <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
