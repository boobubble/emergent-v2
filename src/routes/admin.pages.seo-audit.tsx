import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SeoManagerLink } from "@/components/admin/seo/SeoPreviewPanels";
import { getPagesDashboardStats } from "@/lib/pages-cms/dashboard.functions";

export const Route = createFileRoute("/admin/pages/seo-audit")({ component: SeoAuditPage });

function Metric({
  label,
  value,
  to,
}: {
  label: string;
  value: number;
  to: string;
}) {
  return (
    <Link to={to} className="block rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="text-2xl font-semibold tabular-nums">{value.toLocaleString()}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </Link>
  );
}

function SeoAuditPage() {
  const fetchStats = useServerFn(getPagesDashboardStats);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages", "seo-audit"],
    queryFn: () => fetchStats({}),
    staleTime: 30_000,
  });

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  const c = data.content;
  const s = data.seo;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          SEO Audit measures on-page health for custom pages (H1, meta, keywords, internal links, scores).
          For centralized title/description/canonical settings, use SEO Manager.
        </p>
        <SeoManagerLink category="blog-static" />
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Content health</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <Metric label="Empty Content" value={c.empty} to="/admin/pages/all?content_status=empty" />
          <Metric label="Partial Content" value={c.partial} to="/admin/pages/all?content_status=partial" />
          <Metric label="Complete Content" value={c.complete} to="/admin/pages/all?content_status=complete" />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">SEO health</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Missing H1" value={s.missingH1} to="/admin/pages/all?missing_h1=true" />
          <Metric label="Missing Meta Title" value={s.missingMetaTitle} to="/admin/pages/all?missing_meta_title=true" />
          <Metric label="Missing Meta Description" value={s.missingMetaDescription} to="/admin/pages/all?missing_meta_description=true" />
          <Metric label="Missing Primary Keyword" value={s.missingPrimaryKeyword} to="/admin/pages/all?missing_primary_keyword=true" />
          <Metric label="Missing Internal Links" value={s.missingInternalLinks} to="/admin/pages/all?missing_internal_links=true" />
          <Metric label="Low SEO Score (&lt;40)" value={s.lowSeoScore} to="/admin/pages/all?seo_score_max=39" />
        </div>
      </section>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Indexability snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <Metric label="Indexable pages" value={data.totals.indexable} to="/admin/pages/all?noindex=false" />
          <Metric label="Noindex pages" value={data.totals.noindex} to="/admin/pages/all?noindex=true" />
        </CardContent>
      </Card>
    </div>
  );
}
