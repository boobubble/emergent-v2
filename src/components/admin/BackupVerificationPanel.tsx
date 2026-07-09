import { CheckCircle2, XCircle, Copy } from "lucide-react";
import type { VerifyReport } from "@/lib/backup-verify";
import { toast } from "sonner";

export function BackupVerificationPanel({
  report, sha256, md5, filename,
}: {
  report: VerifyReport | null;
  sha256?: string | null;
  md5?: string | null;
  filename?: string | null;
}) {
  if (!report) return null;
  const failed = report.checks.filter((c) => !c.ok);
  return (
    <div className={`rounded-lg border p-3 text-xs space-y-2 ${report.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        {report.ok
          ? <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Backup Verified</>
          : <><XCircle className="h-4 w-4 text-red-500" /> Verification Failed</>}
        {filename && <span className="ml-auto font-mono text-[10px] text-muted-foreground">{filename}</span>}
      </div>
      {failed.length > 0 && (
        <ul className="space-y-0.5 text-red-600 dark:text-red-300">
          {failed.map((c, i) => (
            <li key={i}>• {c.name}{c.detail ? ` — ${c.detail}` : ""}</li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {sha256 && (
          <div className="flex items-center gap-2 font-mono text-[10px] break-all">
            <span className="text-muted-foreground">SHA-256:</span>
            <span className="truncate">{sha256}</span>
            <button
              type="button"
              className="ml-auto opacity-60 hover:opacity-100"
              onClick={() => { navigator.clipboard.writeText(sha256); toast.success("SHA-256 copied"); }}
              aria-label="Copy SHA-256"
            ><Copy className="h-3 w-3" /></button>
          </div>
        )}
        {md5 && (
          <div className="flex items-center gap-2 font-mono text-[10px] break-all">
            <span className="text-muted-foreground">MD5:</span>
            <span className="truncate">{md5}</span>
            <button
              type="button"
              className="ml-auto opacity-60 hover:opacity-100"
              onClick={() => { navigator.clipboard.writeText(md5); toast.success("MD5 copied"); }}
              aria-label="Copy MD5"
            ><Copy className="h-3 w-3" /></button>
          </div>
        )}
      </div>
      {report.stats && (
        <div className="text-[11px] text-muted-foreground">
          {report.stats.tables} tables · {report.stats.rows} rows · {(report.size / 1024 / 1024).toFixed(2)} MB
        </div>
      )}
    </div>
  );
}
