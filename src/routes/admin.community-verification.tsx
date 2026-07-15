import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListVerificationRequests,
  adminDecideVerificationRequest,
  type VerificationStatus,
} from "@/lib/community.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CommunityBadges } from "@/components/community/CommunityBadges";
import { ShieldCheck, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/community-verification")({
  head: () => ({ meta: [{ title: "Community Verification — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminCommunityVerification,
});

function AdminCommunityVerification() {
  const [filter, setFilter] = useState<VerificationStatus | "all">("pending");
  const listFn = useServerFn(adminListVerificationRequests);
  const { data: rows = [], refetch, isLoading } = useQuery({
    queryKey: ["admin-verification", filter],
    queryFn: () => listFn({ data: { status: filter } }),
  });

  const [reviewing, setReviewing] = useState<any | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <AdminPageHeader
        title="Community Verification"
        description="Review requests and grant Verified / Official / Partner / Trusted badges."
      />


      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Filter:</span>
        <Select value={filter} onValueChange={(v) => setFilter(v as never)}>
          <SelectTrigger className="h-8 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="needs_changes">Needs changes</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={() => refetch()}>Refresh</Button>
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No requests.</div>
        ) : (
          <div className="divide-y">
            {rows.map((r: any) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 p-3">
                <div
                  className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-muted text-sm font-bold"
                  style={r.community?.logo_url ? { backgroundImage: `url(${r.community.logo_url})`, backgroundSize: "cover" } : { background: r.community?.accent_color ?? "#7c3aed", color: "#fff" }}
                >
                  {!r.community?.logo_url && (r.community?.name?.[0]?.toUpperCase() ?? "?")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to="/community/$slug"
                      params={{ slug: r.community?.slug ?? "" }}
                      className="truncate text-sm font-semibold hover:underline"
                    >
                      {r.community?.name ?? r.community_name}
                    </Link>
                    <CommunityBadges c={r.community ?? {}} />
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {r.community?.member_count ?? 0} members · submitted {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Button size="sm" onClick={() => setReviewing(r)}>Review</Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewing && (
        <ReviewDialog request={reviewing} onClose={() => { setReviewing(null); refetch(); }} />
      )}
    </div>
  );
}

function ReviewDialog({ request, onClose }: { request: any; onClose: () => void }) {
  const [notes, setNotes] = useState<string>(request.admin_notes ?? "");
  const [flags, setFlags] = useState({
    is_verified: !!request.community?.is_verified,
    is_official: !!request.community?.is_official,
    is_partner: !!request.community?.is_partner,
    is_trusted: !!request.community?.is_trusted,
  });

  const decideFn = useServerFn(adminDecideVerificationRequest);
  const mut = useMutation({
    mutationFn: (action: "approve" | "reject" | "needs_changes") =>
      decideFn({ data: { requestId: request.id, action, admin_notes: notes || undefined, ...flags } }),
    onSuccess: (r) => { toast.success(`Marked as ${r.status}`); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const s = (request.socials ?? {}) as Record<string, string>;
  const socialEntries = Object.entries(s);

  return (
    <Dialog open onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review verification — {request.community?.name ?? request.community_name}</DialogTitle>
          <DialogDescription>Submitted {new Date(request.created_at).toLocaleString()}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 text-sm">
          {request.website && (
            <Row label="Website"><ExternalLinkCell href={request.website} /></Row>
          )}
          {request.business_email && <Row label="Business email">{request.business_email}</Row>}
          {socialEntries.length > 0 && (
            <Row label="Socials">
              <div className="space-y-1">
                {socialEntries.map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-20 text-xs capitalize text-muted-foreground">{k}</span>
                    <ExternalLinkCell href={v} />
                  </div>
                ))}
              </div>
            </Row>
          )}
          {request.reason && <Row label="Reason"><p className="whitespace-pre-wrap text-xs">{request.reason}</p></Row>}
          {request.doc_urls?.length > 0 && (
            <Row label="Documents">
              <div className="space-y-1">
                {request.doc_urls.map((u: string, i: number) => <ExternalLinkCell key={i} href={u} />)}
              </div>
            </Row>
          )}

          <div className="rounded border bg-muted/40 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Grant badges on approve</div>
            <div className="grid grid-cols-2 gap-2">
              {(["is_verified", "is_official", "is_partner", "is_trusted"] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={flags[k]} onCheckedChange={(v) => setFlags({ ...flags, [k]: !!v })} />
                  <span className="capitalize">{k.replace("is_", "")}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Reviewer notes (visible to the owner)</label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional message…" />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="outline" onClick={() => mut.mutate("needs_changes")} disabled={mut.isPending}>Request changes</Button>
          <Button variant="destructive" onClick={() => mut.mutate("reject")} disabled={mut.isPending}>Reject</Button>
          <Button onClick={() => mut.mutate("approve")} disabled={mut.isPending}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded border p-3">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function ExternalLinkCell({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
      <span className="max-w-md truncate">{href}</span>
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-amber-500/90 text-white" },
    needs_changes: { label: "Needs changes", cls: "bg-orange-500/90 text-white" },
    rejected: { label: "Rejected", cls: "bg-red-600/90 text-white" },
    approved: { label: "Approved", cls: "bg-emerald-600/90 text-white" },
  };
  const m = map[status] ?? { label: status, cls: "bg-muted" };
  return <Badge className={`${m.cls} text-[10px]`}>{m.label}</Badge>;
}
