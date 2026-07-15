import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListPremiumSlugRequests,
  reviewPremiumSlugRequest,
  type PremiumSlugRequestStatus,
} from "@/lib/community.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CommunityBadges } from "@/components/community/CommunityBadges";
import { classifySlug } from "@/lib/premium-slugs";
import { ArrowRight, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/premium-slugs")({
  head: () => ({ meta: [{ title: "Premium URLs — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminPremiumSlugs,
});

function AdminPremiumSlugs() {
  const [filter, setFilter] = useState<PremiumSlugRequestStatus | "all">("pending");
  const listFn = useServerFn(adminListPremiumSlugRequests);
  const reviewFn = useServerFn(reviewPremiumSlugRequest);

  const { data: rows = [], refetch, isLoading } = useQuery({
    queryKey: ["admin-premium-slugs", filter],
    queryFn: () => listFn({ data: { status: filter } }),
  });

  const [reviewing, setReviewing] = useState<any | null>(null);
  const [note, setNote] = useState("");

  const decide = useMutation({
    mutationFn: async (decision: "approved" | "rejected") =>
      reviewFn({ data: { requestId: reviewing.id, decision, note: note || undefined } }),
    onSuccess: (res) => {
      toast.success(res.applied ? `Approved — community moved to /community/${res.newSlug}` : "Request rejected");
      setReviewing(null); setNote("");
      refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to review"),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <AdminPageHeader
        title="Premium URL Claims"
        description="Review requests from community owners to claim short, generic, or geographic slugs."
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Filter:</span>
        <Select value={filter} onValueChange={(v) => setFilter(v as never)}>
          <SelectTrigger className="h-8 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={() => refetch()}>Refresh</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No requests here.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r: any) => {
            const c = r.community ?? {};
            const cls = classifySlug(r.requested_slug);
            return (
              <div key={r.id} className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/community/$slug"
                        params={{ slug: c.slug ?? r.current_slug }}
                        className="font-semibold hover:underline"
                      >
                        {c.name ?? "(community)"}
                      </Link>
                      <CommunityBadges c={c} />
                      <Badge variant="outline" className="text-[10px]">{c.member_count ?? 0} members</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/community/{r.current_slug}</code>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <code className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">/community/{r.requested_slug}</code>
                      <Badge
                        variant={cls === "premium" ? "default" : cls === "reserved" ? "destructive" : "secondary"}
                        className="text-[10px] capitalize"
                      >
                        {cls}
                      </Badge>
                    </div>
                    {r.reason && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Reason:</span> {r.reason}
                      </p>
                    )}
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      Requested {new Date(r.created_at).toLocaleString()}
                      {r.reviewed_at && ` · reviewed ${new Date(r.reviewed_at).toLocaleString()}`}
                    </div>
                    {r.review_note && (
                      <p className="mt-1 text-xs italic text-muted-foreground">Review note: {r.review_note}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      className="capitalize"
                      variant={
                        r.status === "pending" ? "default" :
                        r.status === "approved" ? "secondary" :
                        r.status === "rejected" ? "destructive" : "outline"
                      }
                    >
                      {r.status}
                    </Badge>
                    {r.status === "pending" && (
                      <Button size="sm" onClick={() => { setReviewing(r); setNote(""); }}>Review</Button>
                    )}
                    <Link
                      to="/community/$slug"
                      params={{ slug: c.slug ?? r.current_slug }}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review premium URL request</DialogTitle>
            <DialogDescription>
              {reviewing && (
                <>
                  Move <code className="text-xs">{reviewing.community?.name ?? "community"}</code> from{" "}
                  <code className="text-xs">/community/{reviewing.current_slug}</code> to{" "}
                  <code className="text-xs font-semibold">/community/{reviewing.requested_slug}</code>?
                  The old URL will continue to redirect.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Optional review note (visible to the owner)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewing(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => decide.mutate("rejected")} disabled={decide.isPending}>
              Reject
            </Button>
            <Button onClick={() => decide.mutate("approved")} disabled={decide.isPending}>
              Approve & Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
