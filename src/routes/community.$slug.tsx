import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getCommunityBySlug,
  getMyMembership,
  joinCommunity,
  leaveCommunity,
  type Community,
} from "@/lib/community.functions";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users,
  MessageSquare,
  Trophy,
  Radio,
  Info,
  Settings as SettingsIcon,
  Lock,
  Shield,
  UserPlus,
  LogOut,
  Rss,
} from "lucide-react";

export const Route = createFileRoute("/community/$slug")({
  loader: async ({ params }) => {
    const community = await getCommunityBySlug({ data: { slug: params.slug } });
    if (!community) throw notFound();
    return { community: community as Community };
  },
  head: ({ loaderData, params }) => {
    const c = loaderData?.community;
    if (!c) return {};
    const title = `${c.name} — Community`;
    const desc = c.description || `Join the ${c.name} community.`;
    const url = `https://holo-chat-quest.lovable.app/community/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        ...(c.banner_url ? [{ property: "og:image", content: c.banner_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Community not found</h1>
        <Link to="/feed" className="mt-4 inline-block text-sm text-primary underline">Back to feed</Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Community unavailable</h1>
        <button onClick={reset} className="mt-4 rounded bg-primary px-4 py-2 text-sm text-primary-foreground">Retry</button>
      </div>
    </div>
  ),
  component: CommunityHomePage,
});

function CommunityHomePage() {
  const { community } = Route.useLoaderData();
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [joinOpen, setJoinOpen] = useState(false);

  const getMem = useServerFn(getMyMembership);
  const { data: membership } = useQuery({
    queryKey: ["my-community-membership", community.id, user?.id ?? "anon"],
    queryFn: () => getMem({ data: { communityId: community.id } }),
    enabled: !!user?.id,
    staleTime: 15_000,
  });

  const isOwner = user?.id === community.owner_id;
  const isMember = membership?.status === "active";
  const isPending = membership?.status === "pending";

  const leaveFn = useServerFn(leaveCommunity);
  const leaveMut = useMutation({
    mutationFn: () => leaveFn({ data: { communityId: community.id } }),
    onSuccess: () => {
      toast.success("Left community");
      qc.invalidateQueries({ queryKey: ["my-community-membership", community.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const accent = community.accent_color || "#7c3aed";
  const bannerStyle = community.banner_url
    ? { backgroundImage: `url(${community.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${accent} 0%, hsl(var(--background)) 100%)` };

  const handleJoin = () => {
    if (community.privacy_mode === "public") {
      requireAuth(() => setJoinOpen(true));
    } else {
      requireAuth(() => setJoinOpen(true));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="relative h-56 w-full sm:h-72" style={bannerStyle}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
      </div>

      <div className="mx-auto -mt-16 max-w-5xl px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div
              className="grid h-24 w-24 flex-shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-background bg-card text-3xl font-bold shadow-lg"
              style={{ backgroundColor: community.logo_url ? undefined : accent, color: "#fff" }}
            >
              {community.logo_url ? (
                <img src={community.logo_url} alt={community.name} className="h-full w-full object-cover" />
              ) : (
                community.name[0]?.toUpperCase() ?? "C"
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-bold sm:text-3xl">{community.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{community.member_count} members</span>
                <PrivacyBadge mode={community.privacy_mode} />
                <span>@{community.slug}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <Button
                onClick={() => navigate({ to: "/community/$slug/dashboard", params: { slug: community.slug } })}
                variant="default"
              >
                <SettingsIcon className="mr-1 h-4 w-4" />Dashboard
              </Button>
            )}
            {!isOwner && !isMember && !isPending && (
              <Button onClick={handleJoin} style={{ backgroundColor: accent }}>
                <UserPlus className="mr-1 h-4 w-4" />Join community
              </Button>
            )}
            {!isOwner && isPending && (
              <Button variant="outline" disabled>Request pending</Button>
            )}
            {!isOwner && isMember && (
              <Button variant="outline" onClick={() => leaveMut.mutate()} disabled={leaveMut.isPending}>
                <LogOut className="mr-1 h-4 w-4" />Leave
              </Button>
            )}
          </div>
        </div>

        {community.announcement && (
          <div className="mt-4 rounded-lg border-l-4 bg-muted/40 p-3 text-sm" style={{ borderLeftColor: accent }}>
            📣 {community.announcement}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="about" className="mt-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="about"><Info className="mr-1 h-4 w-4" />About</TabsTrigger>
            <TabsTrigger value="feed"><Rss className="mr-1 h-4 w-4" />Feed</TabsTrigger>
            <TabsTrigger value="chatrooms"><MessageSquare className="mr-1 h-4 w-4" />Chatrooms</TabsTrigger>
            <TabsTrigger value="competitions"><Trophy className="mr-1 h-4 w-4" />Competitions</TabsTrigger>
            <TabsTrigger value="radio"><Radio className="mr-1 h-4 w-4" />Radio</TabsTrigger>
            <TabsTrigger value="members"><Users className="mr-1 h-4 w-4" />Members</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-4 space-y-4 pb-16">
            {community.welcome_text && (
              <section className="rounded-lg border bg-card p-4">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Welcome</h2>
                <p className="whitespace-pre-wrap text-sm">{community.welcome_text}</p>
              </section>
            )}
            {community.description && (
              <section className="rounded-lg border bg-card p-4">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">About</h2>
                <p className="whitespace-pre-wrap text-sm">{community.description}</p>
              </section>
            )}
            {community.rules && (
              <section className="rounded-lg border bg-card p-4">
                <h2 className="mb-2 flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <Shield className="h-3 w-3" />Community rules
                </h2>
                <p className="whitespace-pre-wrap text-sm">{community.rules}</p>
              </section>
            )}
            {community.social_links && Object.keys(community.social_links).length > 0 && (
              <section className="rounded-lg border bg-card p-4">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Links</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(community.social_links).map(([k, v]) => (
                    <a key={k} href={String(v)} target="_blank" rel="noopener noreferrer"
                       className="rounded-full border px-3 py-1 text-xs hover:bg-muted">
                      {k}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="feed" className="mt-4 pb-16">
            <IsolatedModuleStub
              title="Community Feed"
              description="Posts scoped to this community appear here."
              cta="View in Feed"
              onClick={() => navigate({ to: "/feed", search: { community: community.slug } as never })}
            />
          </TabsContent>
          <TabsContent value="chatrooms" className="mt-4 pb-16">
            <IsolatedModuleStub
              title="Community Chatrooms"
              description="Chatrooms owned by this community."
              cta="Open chatrooms"
              onClick={() => navigate({ to: "/chatroom" })}
            />
          </TabsContent>
          <TabsContent value="competitions" className="mt-4 pb-16">
            <IsolatedModuleStub
              title="Community Competitions"
              description="Competitions hosted by this community."
              cta="Open competitions"
              onClick={() => navigate({ to: "/competitions" })}
            />
          </TabsContent>
          <TabsContent value="radio" className="mt-4 pb-16">
            <IsolatedModuleStub
              title="Community Radio"
              description="This community's radio schedule and live shows."
              cta="Open radio"
              onClick={() => navigate({ to: "/radio" })}
            />
          </TabsContent>
          <TabsContent value="members" className="mt-4 pb-16">
            <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
              {community.member_count} members. Member directory coming next.
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <JoinDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        community={community}
        onJoined={() => {
          setJoinOpen(false);
          qc.invalidateQueries({ queryKey: ["my-community-membership", community.id] });
        }}
      />
    </div>
  );
}

function PrivacyBadge({ mode }: { mode: Community["privacy_mode"] }) {
  const map: Record<Community["privacy_mode"], { label: string; icon: React.ReactNode }> = {
    public: { label: "Public", icon: <Users className="h-3 w-3" /> },
    private: { label: "Private", icon: <Lock className="h-3 w-3" /> },
    invite_only: { label: "Invite only", icon: <Lock className="h-3 w-3" /> },
    password: { label: "Password", icon: <Lock className="h-3 w-3" /> },
    invite_password: { label: "Invite + Password", icon: <Lock className="h-3 w-3" /> },
  };
  const m = map[mode];
  return (
    <Badge variant="secondary" className="text-[10px]">
      <span className="mr-1 inline-flex">{m.icon}</span>{m.label}
    </Badge>
  );
}

function IsolatedModuleStub({ title, description, cta, onClick }: { title: string; description: string; cta: string; onClick: () => void }) {
  return (
    <div className="rounded-lg border bg-card p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <Button className="mt-4" onClick={onClick} variant="outline">{cta}</Button>
    </div>
  );
}

function JoinDialog({
  open, onOpenChange, community, onJoined,
}: { open: boolean; onOpenChange: (v: boolean) => void; community: Community; onJoined: () => void }) {
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const join = useServerFn(joinCommunity);
  const mut = useMutation({
    mutationFn: () => join({
      data: {
        communityId: community.id,
        password: password || undefined,
        inviteCode: inviteCode || undefined,
        message: message || undefined,
      },
    }),
    onSuccess: (r) => {
      if (r.state === "pending") toast.success("Join request sent");
      else toast.success("Joined!");
      onJoined();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const needsInvite = community.privacy_mode === "invite_only" || community.privacy_mode === "invite_password";
  const needsPassword = community.privacy_mode === "password" || community.privacy_mode === "invite_password";
  const needsRequest = community.privacy_mode === "private";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join {community.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {needsInvite && (
            <div>
              <label className="text-xs font-medium">Invite code</label>
              <Input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Enter invite code" />
            </div>
          )}
          {needsPassword && (
            <div>
              <label className="text-xs font-medium">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Community password" />
            </div>
          )}
          {needsRequest && (
            <div>
              <label className="text-xs font-medium">Message to moderators (optional)</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Why do you want to join?" />
            </div>
          )}
          {community.privacy_mode === "public" && (
            <p className="text-sm text-muted-foreground">This community is public. Click join to become a member.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {needsRequest ? "Send request" : "Join"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
