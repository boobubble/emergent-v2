import { createFileRoute, Link, Outlet, notFound, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getCommunityBySlug,
  getMyMembership,
  joinCommunity,
  leaveCommunity,
  type Community,
} from "@/lib/community.functions";
import { CommunityProvider, useCommunity } from "@/lib/community-context";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users,
  MessageSquare,
  Trophy,
  Info,
  Settings as SettingsIcon,
  Lock,
  UserPlus,
  LogOut,
  Rss,
  DoorOpen,
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
  component: CommunityLayout,
});

function CommunityLayout() {
  const { community } = Route.useLoaderData();
  const { user } = useAuth();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const getMem = useServerFn(getMyMembership);
  const { data: membership } = useQuery({
    queryKey: ["my-community-membership", community.id, user?.id ?? "anon"],
    queryFn: () => getMem({ data: { communityId: community.id } }),
    enabled: !!user?.id,
    staleTime: 15_000,
  });

  const isOwner = user?.id === community.owner_id;
  const isMember = membership?.status === "active";

  // If we're on the dashboard sub-route, skip the branded shell entirely
  // so the dashboard chrome takes over the viewport.
  const onDashboard = pathname.startsWith(`/community/${community.slug}/dashboard`);

  useEffect(() => {
    // Persist accent as a CSS var while in community context, cleared on unmount.
    const accent = community.accent_color || "#7c3aed";
    document.documentElement.style.setProperty("--community-accent", accent);
    return () => {
      document.documentElement.style.removeProperty("--community-accent");
    };
  }, [community.accent_color]);

  if (onDashboard) {
    // Provide context so nested dashboard code can still read useCommunity(),
    // but do not render hero/tabs.
    return (
      <CommunityProvider community={community} isOwner={isOwner} isMember={isMember}>
        <Outlet />
      </CommunityProvider>
    );
  }

  return (
    <CommunityProvider community={community} isOwner={isOwner} isMember={isMember}>
      <div className="min-h-screen bg-background text-foreground">
        <CommunityHeader
          community={community}
          isOwner={isOwner}
          isMember={isMember}
          isPending={membership?.status === "pending"}
          onLeftCommunity={() => qc.invalidateQueries({ queryKey: ["my-community-membership", community.id] })}
        />

        <div className="mx-auto max-w-5xl px-4">
          <CommunityTabs slug={community.slug} accent={community.accent_color || "#7c3aed"} />
          <div className="mt-4 pb-16">
            <Outlet />
          </div>
        </div>

        <LeaveCommunityGuard />
      </div>
    </CommunityProvider>
  );
}

function CommunityHeader({
  community,
  isOwner,
  isMember,
  isPending,
  onLeftCommunity,
}: {
  community: Community;
  isOwner: boolean;
  isMember: boolean;
  isPending: boolean;
  onLeftCommunity: () => void;
}) {
  const { requireAuth } = useAuthGate();
  const navigate = useNavigate();
  const [joinOpen, setJoinOpen] = useState(false);

  const leaveFn = useServerFn(leaveCommunity);
  const leaveMut = useMutation({
    mutationFn: () => leaveFn({ data: { communityId: community.id } }),
    onSuccess: () => {
      toast.success("Left community");
      onLeftCommunity();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const accent = community.accent_color || "#7c3aed";
  const bannerStyle = community.banner_url
    ? { backgroundImage: `url(${community.banner_url})`, backgroundSize: "cover" as const, backgroundPosition: "center" as const }
    : { background: `linear-gradient(135deg, ${accent} 0%, hsl(var(--background)) 100%)` };

  return (
    <>
      <div className="relative h-40 w-full sm:h-56" style={bannerStyle}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
      </div>

      <div className="mx-auto -mt-12 max-w-5xl px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div
              className="grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-background bg-card text-2xl font-bold shadow-lg"
              style={{ backgroundColor: community.logo_url ? undefined : accent, color: "#fff" }}
            >
              {community.logo_url ? (
                <img src={community.logo_url} alt={community.name} className="h-full w-full object-cover" />
              ) : (
                community.name[0]?.toUpperCase() ?? "C"
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-bold sm:text-2xl">{community.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{community.member_count} members</span>
                <PrivacyBadge mode={community.privacy_mode} />
                <span>@{community.slug}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <Button
                onClick={() => navigate({ to: "/community/$slug/dashboard", params: { slug: community.slug } })}
                size="sm"
                variant="default"
              >
                <SettingsIcon className="mr-1 h-4 w-4" />Dashboard
              </Button>
            )}
            {!isOwner && !isMember && !isPending && (
              <Button size="sm" onClick={() => requireAuth(() => setJoinOpen(true))} style={{ backgroundColor: accent }}>
                <UserPlus className="mr-1 h-4 w-4" />Join
              </Button>
            )}
            {!isOwner && isPending && (
              <Button size="sm" variant="outline" disabled>Request pending</Button>
            )}
            {!isOwner && isMember && (
              <Button size="sm" variant="outline" onClick={() => leaveMut.mutate()} disabled={leaveMut.isPending}>
                <LogOut className="mr-1 h-4 w-4" />Leave
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/" })} title="Exit community">
              <DoorOpen className="mr-1 h-4 w-4" />Exit
            </Button>
          </div>
        </div>

        {community.announcement && (
          <div className="mt-4 rounded-lg border-l-4 bg-muted/40 p-3 text-sm" style={{ borderLeftColor: accent }}>
            📣 {community.announcement}
          </div>
        )}
      </div>

      <JoinDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        community={community}
        onJoined={() => {
          setJoinOpen(false);
          onLeftCommunity();
        }}
      />
    </>
  );
}

function CommunityTabs({ slug, accent }: { slug: string; accent: string }) {
  const items = [
    { to: "/community/$slug", label: "About", icon: Info, exact: true },
    { to: "/community/$slug/feed", label: "Feed", icon: Rss },
    { to: "/community/$slug/chatrooms", label: "Chatrooms", icon: MessageSquare },
    { to: "/community/$slug/competitions", label: "Competitions", icon: Trophy },
    { to: "/community/$slug/members", label: "Members", icon: Users },
  ];
  return (
    <nav className="mt-6 flex w-full gap-1 overflow-x-auto border-b border-border">
      {items.map((it) => (
        <Link
          key={it.label}
          to={it.to as never}
          params={{ slug }}
          activeOptions={{ exact: !!it.exact }}
          className="group flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground data-[status=active]:border-current data-[status=active]:text-foreground"
          style={{ ["--community-accent-hover" as never]: accent } as never}
        >
          <it.icon className="h-4 w-4" />
          {it.label}
        </Link>
      ))}
    </nav>
  );
}

function LeaveCommunityGuard() {
  const { pendingExit, cancelExit, confirmExit, community } = useCommunity();
  return (
    <Dialog open={!!pendingExit} onOpenChange={(o) => (!o ? cancelExit() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave {community.name}?</DialogTitle>
          <DialogDescription>
            You'll leave this community and go to the global platform. You can come back anytime.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={cancelExit}>Stay</Button>
          <Button onClick={confirmExit}>Leave</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
