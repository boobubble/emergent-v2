import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCommunityMembersPublic, listCommunityMembersAuthed } from "@/lib/community.functions";
import { useCommunity } from "@/lib/community-context";
import { useAuth } from "@/lib/auth-store";
import { Users, Crown, Shield } from "lucide-react";

export const Route = createFileRoute("/community/$slug/members")({
  component: CommunityMembers,
});

function CommunityMembers() {
  const { community, communityId, isMember, isOwner } = useCommunity();
  const { user } = useAuth();
  const publicFn = useServerFn(listCommunityMembersPublic);
  const authedFn = useServerFn(listCommunityMembersAuthed);

  const isPublicCommunity = community.privacy_mode === "public";
  // Public communities: fetch without auth. Non-public: require signed-in
  // member/owner. AuthGate on protected actions is unchanged.
  const canFetchAuthed = !!user && (isMember || isOwner);
  const shouldFetchPublic = isPublicCommunity;
  const shouldFetchAuthed = !isPublicCommunity && canFetchAuthed;

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["community-members", communityId, shouldFetchAuthed ? "authed" : "public"],
    queryFn: () =>
      shouldFetchAuthed
        ? authedFn({ data: { communityId } })
        : publicFn({ data: { communityId } }),
    enabled: shouldFetchPublic || shouldFetchAuthed,
    staleTime: 30_000,
  });

  if (!isPublicCommunity && !user) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <Users className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="mt-3 font-semibold">Sign in to see members</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {community.name} is a private community. Members are visible to signed-in members only.
        </p>
      </div>
    );
  }

  if (!isPublicCommunity && user && !canFetchAuthed) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <Users className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="mt-3 font-semibold">Members only</h3>
        <p className="mt-1 text-sm text-muted-foreground">Join {community.name} to see its members.</p>
      </div>
    );
  }

  if (isLoading) return <div className="py-12 text-center text-sm text-muted-foreground">Loading members…</div>;
  if (!members.length) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <Users className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="mt-3 font-semibold">No members yet</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div>
          <h2 className="text-sm font-semibold">{members.length} member{members.length === 1 ? "" : "s"}</h2>
          <p className="text-xs text-muted-foreground">People who joined {community.name}.</p>
        </div>
        {isPublicCommunity && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
            Public directory
          </span>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {members.map((m: any) => {
          const p = m.user;
          const name = p?.display_name || p?.username || "member";
          return (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: p?.avatar_color || "#7c3aed" }}
              >
                {p?.avatar_url ? (
                  <img src={p.avatar_url} alt={name} className="h-full w-full object-cover" />
                ) : (
                  name[0]?.toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {p?.username ? (
                    <Link
                      to="/u/$username"
                      params={{ username: p.username }}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {name}
                    </Link>
                  ) : (
                    <span className="truncate text-sm font-medium">{name}</span>
                  )}
                  {m.role === "owner" && <Crown className="h-3 w-3 text-amber-400" aria-label="Owner" />}
                  {m.role === "moderator" && <Shield className="h-3 w-3 text-sky-400" aria-label="Moderator" />}
                </div>
                <div className="text-[11px] text-muted-foreground capitalize">{m.role}</div>
              </div>
            </div>
          );
        })}
      </div>
      {!user && (
        <p className="text-center text-[11px] text-muted-foreground">
          Sign in to follow, message, or interact with members.
        </p>
      )}
    </div>
  );
}
