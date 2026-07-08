import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { verifyPathEscapeRemoval } from "@/lib/pathescape-verify.functions";

export const Route = createFileRoute("/admin/pathescape")({
  component: PathEscapeRollbackReport,
});

// Client-side scan for lingering source references. Vite's import.meta.glob
// runs at build time, so this reflects the shipped bundle.
const ALL_SOURCE = import.meta.glob(
  "/src/**/*.{ts,tsx,js,jsx,sql}",
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

const PATTERN = /pathescape|path[-_ ]?escape|path[-_ ]?flow|PathEscape/i;
const SELF = "/src/routes/admin.pathescape.tsx";
const VERIFY_MODULE = "/src/lib/pathescape-verify.functions.ts";

function scanSourceReferences() {
  const hits: { file: string; matches: number }[] = [];
  for (const [path, contents] of Object.entries(ALL_SOURCE)) {
    if (path === SELF || path === VERIFY_MODULE) continue;
    // Skip auto-generated files
    if (path.endsWith("/routeTree.gen.ts")) continue;
    if (path.startsWith("/src/integrations/supabase/")) continue;
    const matches = contents.match(PATTERN);
    if (matches && matches.length) hits.push({ file: path, matches: matches.length });
  }
  return hits;
}

function PathEscapeRollbackReport() {
  const verify = useServerFn(verifyPathEscapeRemoval);
  const [sourceHits, setSourceHits] = useState<{ file: string; matches: number }[]>([]);

  useEffect(() => { setSourceHits(scanSourceReferences()); }, []);

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["pathescape-removal-report"],
    queryFn: () => verify(),
  });

  const dbClean = data?.clean ?? false;
  const codeClean = sourceHits.length === 0;
  const fullyClean = dbClean && codeClean;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Path Flow — Rollback Verification"
        description="Path Flow (Path Escape) has been removed. This page verifies that no code, imports, or backend objects remain."
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {fullyClean ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <div>
                    <div className="font-semibold">Rollback verified clean</div>
                    <div className="text-xs text-muted-foreground">
                      No code references or backend objects remain.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                  <div>
                    <div className="font-semibold">Cleanup incomplete</div>
                    <div className="text-xs text-muted-foreground">
                      See details below and re-run once resolved.
                    </div>
                  </div>
                </>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => { setSourceHits(scanSourceReferences()); refetch(); }} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Re-run verification
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-2">
            {codeClean ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
            <h3 className="font-semibold">Source code scan</h3>
            <Badge variant={codeClean ? "secondary" : "destructive"}>
              {codeClean ? "0 references" : `${sourceHits.length} file(s)`}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Scans every <code>.ts</code>/<code>.tsx</code>/<code>.js</code>/<code>.jsx</code>/<code>.sql</code> file
            under <code>/src</code> (excluding this verification page, the verify server fn, generated route tree,
            and auto-generated Supabase types) for any occurrence of <code>pathescape</code>, <code>path-escape</code>,
            <code> path_flow</code>, or <code>PathEscape</code>.
          </p>
          {codeClean ? (
            <div className="text-sm text-emerald-600">No lingering imports or string references found.</div>
          ) : (
            <ul className="text-xs font-mono space-y-1 max-h-64 overflow-auto rounded-md bg-muted/40 p-3">
              {sourceHits.map(h => (
                <li key={h.file}>{h.file} <span className="text-muted-foreground">({h.matches} match{h.matches === 1 ? "" : "es"})</span></li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-2">
            {dbClean ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
            <h3 className="font-semibold">Backend removal report</h3>
            {data && (
              <Badge variant={dbClean ? "secondary" : "destructive"}>
                {dbClean ? "0 objects" : `${data.totals} lingering`}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Queries the database for any remaining Path Flow tables, views, functions,
            row-level-security policies, triggers, or storage buckets/folders.
          </p>

          {isLoading && <div className="text-sm text-muted-foreground">Checking backend…</div>}
          {error && <div className="text-sm text-destructive">{(error as Error).message}</div>}

          {data && (
            <div className="grid gap-2 md:grid-cols-2 text-xs">
              <ReportRow label="Tables" items={data.report.tables} />
              <ReportRow label="Views" items={data.report.views} />
              <ReportRow label="Functions" items={data.report.functions} />
              <ReportRow label="RLS Policies" items={data.report.policies} />
              <ReportRow label="Triggers" items={data.report.triggers} />
              <ReportRow label="Storage buckets" items={data.report.storage_buckets} />
              <ReportRow label="Storage folders" items={data.report.storage_objects} />
            </div>
          )}
          {data && (
            <div className="text-[10px] text-muted-foreground">
              Checked {new Date(data.checkedAt).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReportRow({ label, items }: { label: string; items: string[] }) {
  const clean = !items || items.length === 0;
  return (
    <div className="rounded-md border p-2">
      <div className="flex items-center gap-2 mb-1">
        {clean ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
        <span className="font-medium">{label}</span>
        <Badge variant={clean ? "secondary" : "destructive"} className="ml-auto">
          {clean ? "0" : items.length}
        </Badge>
      </div>
      {!clean && (
        <ul className="font-mono text-[11px] pl-4 list-disc text-destructive">
          {items.map(i => <li key={i}>{i}</li>)}
        </ul>
      )}
    </div>
  );
}
