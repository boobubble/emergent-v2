import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getCommunityBySlug,
  updateCommunityBranding,
  updateCommunityPrivacy,
  updateCommunityVisibility,
  listCommunityMembers,
  setMemberState,
  removeMember,
  listJoinRequests,
  decideJoinRequest,
  listInvites,
  createInvite,
  revokeInvite,
  submitVerificationRequest,
  getMyVerificationRequest,
  type Community,
  type CommunityPrivacy,
  type CommunityVisibility,
  type CommunityVerificationRequest,

} from "@/lib/community.functions";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Palette, Shield, Eye, UserPlus, Rss, MessageSquare, Trophy, Radio,
  BarChart3, DollarSign, Settings as SettingsIcon, ArrowLeft, Copy, Trash2, AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CommunityBadges } from "@/components/community/CommunityBadges";



export const Route = createFileRoute("/community/$slug/dashboard")({
  loader: async ({ params }) => {
    const community = await getCommunityBySlug({ data: { slug: params.slug } });
    if (!community) throw notFound();
    return { community: community as Community };
  },
  head: () => ({ meta: [{ title: "Community Dashboard" }, { name: "robots", content: "noindex" }] }),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="text-center"><h1 className="text-2xl font-bold">Community not found</h1></div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Dashboard unavailable</h1>
        <button onClick={reset} className="mt-4 rounded bg-primary px-4 py-2 text-sm text-primary-foreground">Retry</button>
      </div>
    </div>
  ),
  component: DashboardPage,
});

function DashboardPage() {
  const { community } = Route.useLoaderData();
  const { user } = useAuth();
  const { openSignIn } = useAuthGate();
  const navigate = useNavigate();

  useEffect(() => {
    // Client-side ownership gate; server functions still authorize on write.
    if (!user) return;
    if (user.id !== community.owner_id) {
      navigate({ to: "/community/$slug", params: { slug: community.slug }, replace: true });
    }
  }, [user, community.owner_id, community.slug, navigate]);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Sign in required</h1>
          <p className="mt-2 text-sm text-muted-foreground">Only the community owner can access this dashboard.</p>
          <Button className="mt-4" onClick={openSignIn}>Sign in</Button>
        </div>
      </div>
    );
  }

  if (user.id !== community.owner_id) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Forbidden</h1>
          <p className="mt-2 text-sm text-muted-foreground">Only the owner of {community.name} can access this dashboard.</p>
          <Link to="/community/$slug" params={{ slug: community.slug }} className="mt-4 inline-block text-sm text-primary underline">Back to community</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/community/$slug" params={{ slug: community.slug }}>
            <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" />Back to community</Button>
          </Link>
          <div className="ml-2">
            <h1 className="text-sm font-bold">{community.name}</h1>
            <p className="text-xs text-muted-foreground">Community dashboard</p>
          </div>
          <Badge variant="outline" className="ml-auto">Owner</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs defaultValue="overview" orientation="vertical" className="flex flex-col gap-4 md:flex-row">
          <TabsList className="flex h-auto flex-row flex-wrap md:flex-col md:items-stretch md:justify-start md:w-56 md:flex-shrink-0">
            <TabsTrigger value="overview" className="justify-start"><LayoutDashboard className="mr-2 h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="branding" className="justify-start"><Palette className="mr-2 h-4 w-4" />Branding</TabsTrigger>
            <TabsTrigger value="privacy" className="justify-start"><Shield className="mr-2 h-4 w-4" />Privacy</TabsTrigger>
            <TabsTrigger value="visibility" className="justify-start"><Eye className="mr-2 h-4 w-4" />Visibility</TabsTrigger>

            <TabsTrigger value="members" className="justify-start"><Users className="mr-2 h-4 w-4" />Members</TabsTrigger>
            <TabsTrigger value="requests" className="justify-start"><UserPlus className="mr-2 h-4 w-4" />Requests</TabsTrigger>
            <TabsTrigger value="invites" className="justify-start"><UserPlus className="mr-2 h-4 w-4" />Invites</TabsTrigger>
            <TabsTrigger value="feed" className="justify-start"><Rss className="mr-2 h-4 w-4" />Feed</TabsTrigger>
            <TabsTrigger value="chatrooms" className="justify-start"><MessageSquare className="mr-2 h-4 w-4" />Chatrooms</TabsTrigger>
            <TabsTrigger value="competitions" className="justify-start"><Trophy className="mr-2 h-4 w-4" />Competitions</TabsTrigger>
            <TabsTrigger value="radio" className="justify-start"><Radio className="mr-2 h-4 w-4" />Radio</TabsTrigger>
            <TabsTrigger value="analytics" className="justify-start"><BarChart3 className="mr-2 h-4 w-4" />Analytics</TabsTrigger>
            <TabsTrigger value="monetization" className="justify-start"><DollarSign className="mr-2 h-4 w-4" />Monetization</TabsTrigger>
            <TabsTrigger value="settings" className="justify-start"><SettingsIcon className="mr-2 h-4 w-4" />Settings</TabsTrigger>
          </TabsList>

          <div className="min-w-0 flex-1">
            <TabsContent value="overview" className="mt-0"><OverviewSection community={community} /></TabsContent>
            <TabsContent value="branding" className="mt-0"><BrandingSection community={community} /></TabsContent>
            <TabsContent value="privacy" className="mt-0"><PrivacySection community={community} /></TabsContent>
            <TabsContent value="visibility" className="mt-0"><VisibilitySection community={community} /></TabsContent>

            <TabsContent value="members" className="mt-0"><MembersSection community={community} /></TabsContent>
            <TabsContent value="requests" className="mt-0"><RequestsSection community={community} /></TabsContent>
            <TabsContent value="invites" className="mt-0"><InvitesSection community={community} /></TabsContent>
            <TabsContent value="feed" className="mt-0"><ModulePlaceholder title="Feed" hint="Posts scoped to community_id. Manage from the main feed with community filter." /></TabsContent>
            <TabsContent value="chatrooms" className="mt-0"><ModulePlaceholder title="Chatrooms" hint="Rooms with community_id set to this community. Create rooms from the main Chatrooms module." /></TabsContent>
            <TabsContent value="competitions" className="mt-0"><ModulePlaceholder title="Competitions" hint="Competitions scoped to this community." /></TabsContent>
            <TabsContent value="radio" className="mt-0"><ModulePlaceholder title="Radio" hint="Owner-controlled schedule, playlist and live status." /></TabsContent>
            <TabsContent value="analytics" className="mt-0"><ModulePlaceholder title="Analytics" hint="Members, active today, messages, feed posts, reactions, votes, growth, retention." /></TabsContent>
            <TabsContent value="monetization" className="mt-0"><ModulePlaceholder title="Monetization" hint="Paid memberships, tips, and creator earnings — coming soon." /></TabsContent>
            <TabsContent value="settings" className="mt-0"><SettingsSection community={community} /></TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

// ---------- Sections ----------

function OverviewSection({ community }: { community: Community }) {
  const stats = [
    { label: "Members", value: community.member_count },
    { label: "Online", value: community.online_count },
    { label: "Privacy", value: community.privacy_mode },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold">Public URL</h3>
        <p className="mt-1 font-mono text-sm">/community/{community.slug}</p>
        <p className="mt-1 text-xs text-muted-foreground">Vanity link: /{community.slug} redirects here.</p>
      </div>
    </div>
  );
}

function BrandingSection({ community }: { community: Community }) {
  const [form, setForm] = useState({
    name: community.name,
    slug: community.slug,
    description: community.description ?? "",
    welcome_text: community.welcome_text ?? "",
    logo_url: community.logo_url ?? "",
    banner_url: community.banner_url ?? "",
    accent_color: community.accent_color ?? "#7c3aed",
    rules: community.rules ?? "",
    announcement: community.announcement ?? "",
  });
  const qc = useQueryClient();
  const fn = useServerFn(updateCommunityBranding);
  const mut = useMutation({
    mutationFn: () => fn({
      data: {
        communityId: community.id,
        name: form.name,
        slug: form.slug !== community.slug ? form.slug : undefined,
        description: form.description || null,
        welcome_text: form.welcome_text || null,
        logo_url: form.logo_url || null,
        banner_url: form.banner_url || null,
        accent_color: form.accent_color || null,
        rules: form.rules || null,
        announcement: form.announcement || null,
      },
    }),
    onSuccess: () => {
      toast.success("Branding saved");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">Community branding</h3>
      <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="URL slug" hint={`Preview: /${form.slug || community.slug}`}>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} />
      </Field>
      <Field label="Accent color">
        <div className="flex items-center gap-2">
          <input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="h-10 w-16 rounded border" />
          <Input value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
        </div>
      </Field>
      <Field label="Logo URL"><Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." /></Field>
      <Field label="Banner URL"><Input value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} placeholder="https://..." /></Field>
      <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></Field>
      <Field label="Welcome text"><Textarea value={form.welcome_text} onChange={(e) => setForm({ ...form, welcome_text: e.target.value })} rows={3} /></Field>
      <Field label="Rules"><Textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={4} /></Field>
      <Field label="Announcement (pinned)"><Textarea value={form.announcement} onChange={(e) => setForm({ ...form, announcement: e.target.value })} rows={2} /></Field>
      <Button onClick={() => mut.mutate()} disabled={mut.isPending}>Save changes</Button>
    </div>
  );
}

function PrivacySection({ community }: { community: Community }) {
  const [mode, setMode] = useState<CommunityPrivacy>(community.privacy_mode);
  const [password, setPassword] = useState("");
  const qc = useQueryClient();
  const fn = useServerFn(updateCommunityPrivacy);
  const mut = useMutation({
    mutationFn: () => fn({ data: { communityId: community.id, privacy_mode: mode, password: password || null } }),
    onSuccess: () => {
      toast.success("Privacy updated");
      setPassword("");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const needsPw = mode === "password" || mode === "invite_password";
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">Access</h3>
      <Field label="Privacy mode">
        <Select value={mode} onValueChange={(v) => setMode(v as CommunityPrivacy)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public — anyone can join</SelectItem>
            <SelectItem value="private">Private — approve join requests</SelectItem>
            <SelectItem value="invite_only">Invite only</SelectItem>
            <SelectItem value="password">Password protected</SelectItem>
            <SelectItem value="invite_password">Invite + Password</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {needsPw && (
        <Field label="New password" hint="Leave blank to keep the existing password.">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
      )}
      <Button onClick={() => mut.mutate()} disabled={mut.isPending}>Save privacy</Button>
    </div>
  );
}

function VisibilitySection({ community }: { community: Community }) {
  const [visibility, setVisibility] = useState<CommunityVisibility>(community.visibility ?? "public");
  const [category, setCategory] = useState<string>(community.category ?? "");
  const [tagsText, setTagsText] = useState<string>((community.tags ?? []).join(", "));
  const [language, setLanguage] = useState<string>(community.language ?? "");
  const [country, setCountry] = useState<string>(community.country ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const qc = useQueryClient();
  const fn = useServerFn(updateCommunityVisibility);

  const buildPayload = (confirmLargeChange = false) => ({
    communityId: community.id,
    visibility,
    category: category.trim() ? category.trim() : null,
    tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 15),
    language: language.trim() ? language.trim() : null,
    country: country.trim() ? country.trim() : null,
    confirmLargeChange,
  });

  const mut = useMutation({
    mutationFn: (confirmLargeChange: boolean) => fn({ data: buildPayload(confirmLargeChange) }),
    onSuccess: () => {
      toast.success("Visibility updated");
      setConfirmOpen(false);
      qc.invalidateQueries();
    },
    onError: (e: Error) => {
      if (e.message === "CONFIRM_LARGE_HIDE") {
        setConfirmOpen(true);
        return;
      }
      toast.error(e.message);
    },
  });

  const needsConfirm =
    community.visibility === "public" &&
    visibility === "hidden" &&
    (community.member_count ?? 0) > 10_000;

  const VIS_OPTIONS: { value: CommunityVisibility; title: string; desc: string; icon: React.ReactNode }[] = [
    { value: "public", title: "Public", desc: "Discoverable everywhere: directory, search, trending, recommendations.", icon: <span>🌍</span> },
    { value: "hidden", title: "Hidden", desc: "Hidden from directory, search, and recommendations. Access only via direct URL or invite.", icon: <span>👁</span> },
    { value: "unlisted", title: "Unlisted", desc: "Not searchable and not indexed. Anyone with the link can open it.", icon: <span>🚧</span> },
    { value: "featured_only", title: "Featured Only", desc: "Only appears in discovery if a platform admin marks it Featured.", icon: <span>⭐</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Discovery visibility</h3>
            <p className="text-xs text-muted-foreground">Separate from Privacy — visibility controls who can DISCOVER this community.</p>
          </div>
          <Badge variant="outline" className="capitalize">{community.visibility ?? "public"}</Badge>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {VIS_OPTIONS.map((opt) => {
            const active = visibility === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVisibility(opt.value)}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                  active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-accent"
                }`}
              >
                <div className="text-lg">{opt.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{opt.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2">
        <Field label="Category" hint="Used in the discovery directory.">
          <Input value={category} onChange={(e) => setCategory(e.target.value.toLowerCase())} placeholder="gaming, music, tech, art…" />
        </Field>
        <Field label="Tags" hint="Comma-separated, up to 15.">
          <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="minecraft, speedrun, hindi" />
        </Field>
        <Field label="Language">
          <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en, hi, es…" />
        </Field>
        <Field label="Country">
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="IN, US…" />
        </Field>
      </div>

      <Button onClick={() => mut.mutate(needsConfirm)} disabled={mut.isPending}>Save visibility</Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Hide this community?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {community.name} has {(community.member_count ?? 0).toLocaleString()} members. Switching to <b>Hidden</b> will
              immediately remove it from discovery, search, recommendations, and search engines. Existing members and direct
              links will keep working, but you'll lose new organic growth. You can switch back to Public any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mut.isPending}>Stay Public</AlertDialogCancel>
            <AlertDialogAction onClick={() => mut.mutate(true)} disabled={mut.isPending}>Yes, hide community</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MembersSection({ community }: { community: Community }) {

  const listFn = useServerFn(listCommunityMembers);
  const { data: members, refetch } = useQuery({
    queryKey: ["community-members", community.id],
    queryFn: () => listFn({ data: { communityId: community.id } }),
  });
  const setFn = useServerFn(setMemberState);
  const rmFn = useServerFn(removeMember);
  const setMut = useMutation({
    mutationFn: (v: { memberId: string; status?: any; role?: any }) => setFn({ data: v }),
    onSuccess: () => { toast.success("Updated"); refetch(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const rmMut = useMutation({
    mutationFn: (memberId: string) => rmFn({ data: { memberId } }),
    onSuccess: () => { toast.success("Removed"); refetch(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">Members ({members?.length ?? 0})</h3>
      <div className="divide-y">
        {(members ?? []).map((m: any) => (
          <div key={m.id} className="flex items-center gap-3 py-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-bold">
              {m.user?.username?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{m.user?.username ?? "unknown"}</div>
              <div className="text-xs text-muted-foreground">{m.role} · {m.status}</div>
            </div>
            {m.role !== "owner" && (
              <>
                <Select value={m.role} onValueChange={(v) => setMut.mutate({ memberId: m.id, role: v })}>
                  <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={m.status} onValueChange={(v) => setMut.mutate({ memberId: m.id, status: v })}>
                  <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="muted">Muted</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={() => rmMut.mutate(m.id)}><Trash2 className="h-4 w-4" /></Button>
              </>
            )}
          </div>
        ))}
        {(!members || members.length === 0) && <div className="py-8 text-center text-sm text-muted-foreground">No members yet.</div>}
      </div>
    </div>
  );
}

function RequestsSection({ community }: { community: Community }) {
  const listFn = useServerFn(listJoinRequests);
  const { data, refetch } = useQuery({
    queryKey: ["community-requests", community.id],
    queryFn: () => listFn({ data: { communityId: community.id } }),
  });
  const decideFn = useServerFn(decideJoinRequest);
  const mut = useMutation({
    mutationFn: (v: { requestId: string; approve: boolean }) => decideFn({ data: v }),
    onSuccess: () => refetch(),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">Pending requests</h3>
      <div className="divide-y">
        {(data ?? []).map((r: any) => (
          <div key={r.id} className="flex items-start gap-3 py-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-bold">
              {r.user?.username?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{r.user?.username ?? "unknown"}</div>
              {r.message && <p className="mt-1 text-xs text-muted-foreground">{r.message}</p>}
            </div>
            <Button size="sm" onClick={() => mut.mutate({ requestId: r.id, approve: true })}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => mut.mutate({ requestId: r.id, approve: false })}>Reject</Button>
          </div>
        ))}
        {(!data || data.length === 0) && <div className="py-8 text-center text-sm text-muted-foreground">No pending requests.</div>}
      </div>
    </div>
  );
}

function InvitesSection({ community }: { community: Community }) {
  const listFn = useServerFn(listInvites);
  const { data, refetch } = useQuery({
    queryKey: ["community-invites", community.id],
    queryFn: () => listFn({ data: { communityId: community.id } }),
  });
  const createFn = useServerFn(createInvite);
  const revokeFn = useServerFn(revokeInvite);
  const createMut = useMutation({
    mutationFn: () => createFn({ data: { communityId: community.id } }),
    onSuccess: () => { toast.success("Invite created"); refetch(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const revokeMut = useMutation({
    mutationFn: (id: string) => revokeFn({ data: { inviteId: id } }),
    onSuccess: () => { toast.success("Revoked"); refetch(); },
  });
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Invite codes</h3>
        <Button size="sm" onClick={() => createMut.mutate()} disabled={createMut.isPending}>Create invite</Button>
      </div>
      <div className="divide-y">
        {(data ?? []).map((i: any) => (
          <div key={i.id} className="flex items-center gap-3 py-2">
            <code className="rounded bg-muted px-2 py-1 text-xs">{i.code}</code>
            <span className="text-xs text-muted-foreground">
              {i.uses}{i.max_uses ? `/${i.max_uses}` : ""} uses
              {i.expires_at ? ` · expires ${new Date(i.expires_at).toLocaleDateString()}` : ""}
            </span>
            <Button size="sm" variant="ghost" onClick={() => {
              void navigator.clipboard.writeText(i.code);
              toast.success("Copied");
            }}><Copy className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => revokeMut.mutate(i.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {(!data || data.length === 0) && <div className="py-8 text-center text-sm text-muted-foreground">No invites yet.</div>}
      </div>
    </div>
  );
}

function SettingsSection({ community }: { community: Community }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">Danger zone</h3>
      <p className="mt-2 text-xs text-muted-foreground">
        Archiving / transferring / deleting the community will be available in a future release.
      </p>
      <p className="mt-3 text-xs">Community ID: <code className="rounded bg-muted px-1">{community.id}</code></p>
    </div>
  );
}

function ModulePlaceholder({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
