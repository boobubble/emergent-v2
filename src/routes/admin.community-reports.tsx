import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminCommunityReport } from "@/lib/community.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { CommunityBadges } from "@/components/community/CommunityBadges";
import { Users, Archive, BadgeCheck, Shield, Star, Sparkles, TrendingUp, Globe } from "lucide-react";

export const Route = createFileRoute("/admin/community-reports")({
  head: () => ({ meta: [{ title: "Community Reports — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminCommunityReports,
});

function AdminCommunityReports() {
  const fetchFn = useServerFn(adminCommunityReport);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-community-report"],
    queryFn: () => fetchFn({}),
    refetchInterval: 60_000,
  });

  const t = data?.totals;
  const top = data?.topByMembers ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <AdminPageHeader
        title="Community Reports"
        description="Platform-wide overview of community activity, trust badges and archive state."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Globe} label="All communities" value={t?.all} loading={isLoading} />
        <Stat icon={Users} label="Active" value={t?.active} loading={isLoading} />
        <Stat icon={Archive} label="Archived" value={t?.archived} loading={isLoading} />
        <Stat icon={TrendingUp} label="New (7d)" value={t?.newLast7d} loading={isLoading} />
        <Stat icon={BadgeCheck} label="Verified" value={t?.verified} loading={isLoading} />
        <Stat icon={Shield} label="Official" value={t?.official} loading={isLoading} />
        <Stat icon={Star} label="Featured" value={t?.featured} loading={isLoading} />
        <Stat icon={Sparkles} label="—" value={undefined} loading={false} />
      </div>

      <div>
        <h3 className="mb-2 mt-4 text-sm font-semibold">Top communities by members</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : top.length === 0 ? (
          <p className="text-sm text-muted-foreground">No communities yet.</p>
        ) : (
          <div className="space-y-2">
            {top.map((c: any, i: number) => (
              <Link
                key={c.id}
                to="/community/$slug"
                params={{ slug: c.slug }}
                className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent/40"
              >
                <div className="w-6 text-right text-sm font-semibold tabular-nums text-muted-foreground">{i + 1}</div>
                <div
                  className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                  style={{ background: c.logo_url ? `url(${c.logo_url}) center/cover` : (c.accent_color ?? "hsl(var(--muted))") }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{c.name}</span>
                    <CommunityBadges c={c} />
                  </div>
                  <div className="text-xs text-muted-foreground">/{c.slug}</div>
                </div>
                <div className="text-sm tabular-nums text-muted-foreground">
                  {c.member_count?.toLocaleString?.() ?? 0} members
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, loading }: { icon: React.ComponentType<{ className?: string }>; label: string; value?: number; loading?: boolean }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />{label}
        </div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">
          {loading ? "…" : (value ?? 0).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
