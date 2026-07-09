import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { APP_VERSION } from "@/lib/app-version";

export type PreRestoreInfo = {
  filename: string;
  size: number;
  backupAppVersion?: string;
  backupGeneratedAt?: string;
  tables?: number;
  rows?: number;
  mediaFiles?: number;
  bucketDiff?: { missing: string[]; extra: string[] };
};

function fmtBytes(n?: number | null): string {
  if (!n) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
}

export function PreRestoreDialog({
  open, info, onCancel, onConfirm,
}: {
  open: boolean;
  info: PreRestoreInfo | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!info) return null;
  const rows = info.rows ?? 0;
  const media = info.mediaFiles ?? 0;
  const eta = Math.ceil(rows / 500) + Math.ceil(media / 20); // seconds, rough
  const versionMismatch = info.backupAppVersion && info.backupAppVersion !== APP_VERSION;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Confirm Restore
          </DialogTitle>
          <DialogDescription>
            The database schema and data in this backup will be applied to the live project.
            Existing rows with matching primary keys are kept (INSERT ... ON CONFLICT DO NOTHING).
            Storage buckets and files are re-uploaded with upsert.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Backup file" value={info.filename} mono />
          <Field label="Size" value={fmtBytes(info.size)} />
          <Field label="Backup version" value={info.backupAppVersion ?? "—"} />
          <Field label="Current version" value={APP_VERSION} />
          <Field label="Generated" value={info.backupGeneratedAt ? new Date(info.backupGeneratedAt).toLocaleString() : "—"} />
          <Field label="Tables" value={String(info.tables ?? 0)} />
          <Field label="Rows" value={String(rows)} />
          <Field label="Media files" value={String(media)} />
          <Field label="Estimated time" value={`~${eta}s`} />
        </div>

        {versionMismatch && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-200">
            Backup was generated on a different app version. Some columns may not line up — proceed with caution.
          </div>
        )}
        {info.bucketDiff && (info.bucketDiff.missing.length > 0 || info.bucketDiff.extra.length > 0) && (
          <div className="rounded-md border p-2 text-xs">
            <div>Bucket differences:</div>
            {info.bucketDiff.missing.length > 0 && <div>· Missing on current project: {info.bucketDiff.missing.join(", ")}</div>}
            {info.bucketDiff.extra.length > 0 && <div>· Extra on current project: {info.bucketDiff.extra.join(", ")}</div>}
          </div>
        )}

        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-2 text-xs text-red-700 dark:text-red-300">
          This action runs privileged SQL through the admin restore endpoint. Only proceed if you trust the backup source.
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm Restore</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-xs truncate" : "truncate"}>{value}</div>
    </div>
  );
}
