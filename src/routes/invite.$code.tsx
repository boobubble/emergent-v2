import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getInviteLanding, joinCommunity } from "@/lib/community.functions";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CommunityBadges } from "@/components/community/CommunityBadges";
import { Users, Lock, Share2, Copy, DoorOpen } from "lucide-react";

export const Route = createFileRoute("/invite/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Community invite · ${params.code}` },
      { name: "description", content: "You've been invited to join a community." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: InviteLandingPage,
});

function InviteLandingPage() {
  const { code } = Route.useParams();
  const fn = useServerFn(getInviteLanding);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["invite-landing", code],
    queryFn: () => fn({ data: { code } }),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="text-sm text-muted-foreground">Loading invite…</div>
      </div>
    );
  }

  if (!data?.community) {
    return (
      <InviteError title="Invite unavailable" description="This invite link no longer works or the community was removed." />
    );
  }

  const community = data.community as any;
  const invite = data.invite as any;
  const owner = (data.owner ?? null) as any;

  if (!data.valid) {
    return (
      <InviteError
        title={data.reason === "expired" ? "Invite expired" : "Invite fully used"}
        description={
          data.reason === "expired"
            ? "This invite link has passed its expiry date. Ask the owner for a fresh link."
            : "This invite has reached its usage limit."
        }
        community={community}
      />
    );
  }

  return <InviteLanding community={community} invite={invite} owner={owner} onRefetch={refetch} />;
}

function InviteLanding({ community, invite, owner, onRefetch }: { community: any; invite: any; owner: any; onRefetch: () => void }) {
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [password, setPassword] = useState("");

  const joinFn = useServerFn(joinCommunity);
  const mut = useMutation({
    mutationFn: () => joinFn({ data: { communityId: community.id, inviteCode: invite.code, password: password || undefined } }),
    onSuccess: (r: any) => {
      qc.invalidateQueries();
      if (r?.state === "pending") toast.success("Join request sent");
      else toast.success("You're in!");
      onRefetch();
      navigate({ to: "/community/$slug", params: { slug: community.slug } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const needsPassword = community.privacy_mode === "password" || community.privacy_mode === "invite_password";
  const accent = community.accent_color || "#7c3aed";

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const copyLink = () => {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl);
    toast.success("Invite link copied");
  };
  const share = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title: `${community.name} on the community platform`, url: shareUrl }); } catch { /* cancelled */ }
    } else copyLink();
  };

  const bannerStyle = community.banner_url
    ? { backgroundImage: `url(${community.banner_url})`, backgroundSize: "cover" as const, backgroundPosition: "center" as const }
    : { background: `linear-gradient(135deg, ${accent} 0%, hsl(var(--background)) 100%)` };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative h-40 w-full sm:h-56" style={bannerStyle}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/85" />
      </div>

      <div className="mx-auto -mt-16 max-w-2xl px-4 pb-16">
        <div className="rounded-2xl border bg-card p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div
              className="grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-card bg-muted text-2xl font-bold shadow"
              style={community.logo_url ? { backgroundImage: `url(${community.logo_url})`, backgroundSize: "cover" } : { background: accent, color: "#fff" }}
            >
              {!community.logo_url && (community.name?.[0]?.toUpperCase() ?? "C")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold sm:text-2xl">{community.name}</h1>
                <CommunityBadges c={community} size="md" showFeatured />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{community.member_count} members</span>
                <span className="inline-flex items-center gap-1">🟢 {community.online_count} online</span>
                {community.category && <Badge variant="secondary" className="text-[10px]">{community.category}</Badge>}
                <PrivacyBadge mode={community.privacy_mode} />
              </div>
              {owner && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Owned by <span className="font-medium text-foreground">{owner.display_name || owner.username}</span>
                </div>
              )}
            </div>
          </div>

          {community.description && (
            <section className="mt-4 rounded-lg border bg-muted/30 p-3">
              <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">About</h2>
              <p className="whitespace-pre-wrap text-sm">{community.description}</p>
            </section>
          )}

          {community.rules && (
            <section className="mt-3 rounded-lg border bg-muted/30 p-3">
              <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Community rules</h2>
              <p className="whitespace-pre-wrap text-sm">{community.rules}</p>
            </section>
          )}

          {needsPassword && (
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium">Community password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              size="lg"
              style={{ backgroundColor: accent }}
              className="min-w-32 text-white"
              onClick={() => requireAuth(() => mut.mutate())}
              disabled={mut.isPending}
            >
              {user ? "Join community" : "Sign in to join"}
            </Button>
            <Link to="/community/$slug" params={{ slug: community.slug }} className="inline-flex">
              <Button size="lg" variant="outline"><DoorOpen className="mr-1 h-4 w-4" />Preview</Button>
            </Link>
            <div className="ml-auto flex gap-1">
              <Button size="sm" variant="ghost" onClick={share}><Share2 className="mr-1 h-4 w-4" />Share</Button>
              <Button size="sm" variant="ghost" onClick={copyLink}><Copy className="mr-1 h-4 w-4" />Copy link</Button>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            Invite code <code className="rounded bg-muted px-1">{invite.code}</code>
            {invite.max_uses ? ` · ${invite.uses}/${invite.max_uses} uses` : ""}
            {invite.expires_at ? ` · expires ${new Date(invite.expires_at).toLocaleDateString()}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function PrivacyBadge({ mode }: { mode: string }) {
  if (mode === "public") return <Badge variant="secondary" className="gap-1 text-[10px]"><Users className="h-3 w-3" />Public</Badge>;
  return <Badge variant="secondary" className="gap-1 text-[10px]"><Lock className="h-3 w-3" />{mode.replace("_", " ")}</Badge>;
}

function InviteError({ title, description, community }: { title: string; description: string; community?: any }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex justify-center gap-2">
          {community?.slug && (
            <Link to="/community/$slug" params={{ slug: community.slug }}>
              <Button variant="outline">Visit community</Button>
            </Link>
          )}
          <Link to="/communities"><Button>Browse communities</Button></Link>
        </div>
      </div>
    </div>
  );
}
