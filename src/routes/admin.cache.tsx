import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Trash2, Database, HardDrive, RefreshCw, ServerCrash, Loader2, CheckCircle2, Terminal,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  clearCaches,
  formatClearReport,
  type ClearOptions,
  type ClearReport,
} from "@/lib/cache-manager";

export const Route = createFileRoute("/admin/cache")({ component: Page });

function Page() {
  const queryClient = useQueryClient();
  const [opts, setOpts] = useState<ClearOptions>({
    localStorage: true,
    sessionStorage: true,
    queryCache: true,
    serviceWorkerCaches: true,
    reload: false,
  });
  const [running, setRunning] = useState(false);
  const [lastReport, setLastReport] = useState<ClearReport | null>(null);

  async function run() {
    setRunning(true);
    try {
      const report = await clearCaches({ ...opts, queryClient });
      setLastReport(report);
      toast.success("Caches cleared", { description: formatClearReport(report) });
    } catch (e) {
      toast.error("Failed to clear caches", { description: (e as Error).message });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cache & Maintenance Tools"
        description="Clear client-side caches, rebuild stale data, and recover from glitches."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Toggle
          icon={<HardDrive className="h-4 w-4" />}
          title="Local storage"
          desc="Drafts, preferences, and chat cache. Auth session is preserved."
          checked={!!opts.localStorage}
          onChange={v => setOpts(o => ({ ...o, localStorage: v }))}
        />
        <Toggle
          icon={<Database className="h-4 w-4" />}
          title="Session storage"
          desc="Per-tab temporary data."
          checked={!!opts.sessionStorage}
          onChange={v => setOpts(o => ({ ...o, sessionStorage: v }))}
        />
        <Toggle
          icon={<RefreshCw className="h-4 w-4" />}
          title="Query cache"
          desc="In-memory React Query cache (forces refetch)."
          checked={!!opts.queryCache}
          onChange={v => setOpts(o => ({ ...o, queryCache: v }))}
        />
        <Toggle
          icon={<ServerCrash className="h-4 w-4" />}
          title="Service worker caches"
          desc="Cached assets and offline payloads (CacheStorage API)."
          checked={!!opts.serviceWorkerCaches}
          onChange={v => setOpts(o => ({ ...o, serviceWorkerCaches: v }))}
        />
        <Toggle
          icon={<RefreshCw className="h-4 w-4" />}
          title="Reload app after"
          desc="Reload the page to rehydrate fresh."
          checked={!!opts.reload}
          onChange={v => setOpts(o => ({ ...o, reload: v }))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={running} className="gap-2">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {running ? "Clearing…" : "Clear selected caches"}
        </Button>
        {lastReport && !running && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {formatClearReport(lastReport)}
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm">
        <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
          <Terminal className="h-4 w-4" /> Chat & Feed command
        </div>
        <p className="text-muted-foreground">
          Admins can also clear caches inline by typing{" "}
          <code className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">/clearcache</code>{" "}
          in any chatroom or in the feed composer. The command runs the default options above and never posts a public message.
        </p>
      </div>
    </div>
  );
}

function Toggle({
  icon, title, desc, checked, onChange,
}: { icon: React.ReactNode; title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40">
      <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <span className="flex-1">
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
