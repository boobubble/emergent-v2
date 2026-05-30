import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getFutureModule,
  type FutureModuleKey,
} from "@/lib/future-modules";

export const Route = createFileRoute("/admin/upcoming/$key")({
  component: UpcomingDetail,
  notFoundComponent: () => (
    <div className="space-y-4">
      <AdminPageHeader title="Unknown module" />
      <Link to="/admin/upcoming" className="text-sm text-primary">← Back to upcoming modules</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="space-y-4">
      <AdminPageHeader title="Something went wrong" />
      <button className="text-sm text-primary" onClick={reset}>Retry</button>
    </div>
  ),
});

function UpcomingDetail() {
  const { key } = Route.useParams();
  const mod = getFutureModule(key as FutureModuleKey);
  if (!mod) throw notFound();
  const Icon = mod.icon;

  return (
    <div className="space-y-5">
      <Link to="/admin/upcoming" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Upcoming modules
      </Link>

      <AdminPageHeader
        title={mod.label}
        description={mod.description}
        actions={
          <Badge variant="outline" className="text-[10px] uppercase">{mod.status.replace("_", " ")}</Badge>
        }
      />

      <Card>
        <CardContent className="space-y-3 p-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">{mod.label}</div>
              <div className="text-xs text-muted-foreground">Category: {mod.category}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Feature flag</div>
              <code className="mt-1 block text-xs">app_settings.future_flags.{mod.key}</code>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Service stub</div>
              <code className="mt-1 block text-xs">@/services → {mod.key}</code>
            </div>
            {mod.plannedTables?.length ? (
              <div className="rounded-md border p-3 sm:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Planned tables</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {mod.plannedTables.map((t) => (
                    <code key={t} className="rounded bg-muted px-1.5 py-0.5 text-xs">{t}</code>
                  ))}
                </div>
              </div>
            ) : null}
            {mod.dependsOn?.length ? (
              <div className="rounded-md border p-3 sm:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Depends on</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {mod.dependsOn.map((d) => (
                    <code key={d} className="rounded bg-muted px-1.5 py-0.5 text-xs">{d}</code>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <ComingSoonPanel
        title="No settings yet"
        points={[
          "This page is a placeholder so the route exists.",
          "Implement the service in src/services/ and wire UI here.",
          "Toggle the feature flag from Upcoming Modules once ready.",
        ]}
      />
    </div>
  );
}
