import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getPagesDashboardStats } from "@/lib/pages-cms/dashboard.functions";
import { formatUpdated } from "@/components/admin/pages/pages-ui";

export const Route = createFileRoute("/admin/pages/")({
  component: PagesDashboard,
});

function Stat({ label, value, to }: { label: string; value: number; to?: string }) {
  const inner = (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="p-4">
        <div className="text-2xl font-semibold tabular-nums">{value.toLocaleString()}</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function PagesDashboard() {
  const fetchStats = useServerFn(getPagesDashboardStats);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages", "dashboard"],
    queryFn: () => fetchStats({}),
    staleTime: 30_000,
  });

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  const t = data.totals;
  const c = data.content;
  const s = data.seo;

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Overview</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <Stat label="Total Pages" value={t.total} to="/admin/pages/all" />
          <Stat label="Published" value={t.published} to="/admin/pages/all?status=published" />
          <Stat label="Draft" value={t.draft} to="/admin/pages/all?status=draft" />
          <Stat label="Scheduled" value={t.scheduled} to="/admin/pages/all?status=scheduled" />
          <Stat label="Archived" value={t.archived} to="/admin/pages/all?status=archived" />
          <Stat label="Indexable" value={t.indexable} to="/admin/pages/all?noindex=false" />
          <Stat label="Noindex" value={t.noindex} to="/admin/pages/all?noindex=true" />
          <Stat label="Countries" value={t.countries} to="/admin/pages/countries" />
          <Stat label="States" value={t.states} to="/admin/pages/states" />
          <Stat label="Cities" value={t.cities} to="/admin/pages/cities" />
          <Stat label="Categories" value={t.categories} to="/admin/pages/categories" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Content health</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            <Stat label="Empty Content" value={c.empty} to="/admin/pages/all?content_status=empty" />
            <Stat label="Partial Content" value={c.partial} to="/admin/pages/all?content_status=partial" />
            <Stat label="Complete Content" value={c.complete} to="/admin/pages/all?content_status=complete" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">SEO health</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="Missing H1" value={s.missingH1} to="/admin/pages/all?missing_h1=true" />
            <Stat label="Missing Meta Title" value={s.missingMetaTitle} to="/admin/pages/all?missing_meta_title=true" />
            <Stat label="Missing Meta Description" value={s.missingMetaDescription} to="/admin/pages/all?missing_meta_description=true" />
            <Stat label="Missing Primary Keyword" value={s.missingPrimaryKeyword} to="/admin/pages/all?missing_primary_keyword=true" />
            <Stat label="Missing Internal Links" value={s.missingInternalLinks} to="/admin/pages/all?missing_internal_links=true" />
            <Stat label="Low SEO Score" value={s.lowSeoScore} to="/admin/pages/all?seo_score_max=39" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Country cards</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {data.countryCards.map((card) => (
            <Card key={card.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  {card.name}
                  <Badge variant="outline">{card.slug}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                <div><div className="text-lg font-semibold tabular-nums">{card.totalPages}</div><div className="text-xs text-muted-foreground">Total pages</div></div>
                <div><div className="text-lg font-semibold tabular-nums">{card.publishedPages}</div><div className="text-xs text-muted-foreground">Published</div></div>
                <div><div className="text-lg font-semibold tabular-nums">{card.draftPages}</div><div className="text-xs text-muted-foreground">Draft</div></div>
                <div><div className="text-lg font-semibold tabular-nums">{card.citiesCovered}</div><div className="text-xs text-muted-foreground">Cities covered</div></div>
                <div><div className="text-lg font-semibold tabular-nums">{card.categoriesCovered}</div><div className="text-xs text-muted-foreground">Categories covered</div></div>
                <div><div className="text-lg font-semibold tabular-nums">{card.contentIssues}</div><div className="text-xs text-muted-foreground">Content issues</div></div>
                <div><div className="text-lg font-semibold tabular-nums">{card.seoIssues}</div><div className="text-xs text-muted-foreground">SEO issues</div></div>
              </CardContent>
            </Card>
          ))}
          {!data.countryCards.length && (
            <p className="text-sm text-muted-foreground">No active countries yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent bulk jobs</h2>
          <Link to="/admin/pages/bulk" className="text-xs text-primary hover:underline">Open Bulk Generator</Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {(data.recentJobs ?? []).length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No bulk jobs yet.</p>
            ) : (
              <div className="divide-y">
                {data.recentJobs.map((job: any) => (
                  <div key={job.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                    <div className="min-w-0 flex-1 font-medium truncate">{job.name}</div>
                    <Badge variant="outline">{job.status}</Badge>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      +{job.created_count ?? 0} / ~{job.updated_count ?? 0} / skip {job.skipped_count ?? 0} / fail {job.error_count ?? 0}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatUpdated(job.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
