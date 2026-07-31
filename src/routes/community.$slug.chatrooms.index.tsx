import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/lib/community-context";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, Lock, KeyRound, UserPlus, AlertCircle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/community/$slug/chatrooms/")({
  component: CommunityChatrooms,
});

interface RoomRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  member_count: number | null;
  visibility: string | null;
  avatar_url: string | null;
  theme_color: string | null;
  category: string | null;
}

interface EnrichedRoom extends RoomRow {
  passwordProtected: boolean;
}

async function fetchCommunityRooms(communityId: string): Promise<EnrichedRoom[]> {
  const { data, error } = await supabase
    .from("chatrooms")
    .select("id,slug,name,description,member_count,visibility,avatar_url,theme_color,category")
    .eq("community_id", communityId)
    .neq("visibility", "archived")
    .order("member_count", { ascending: false })
    .limit(60);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as RoomRow[];

  const enriched = await Promise.all(
    rows.map(async (room) => {
      const { data: passwordStatus } = await supabase.rpc("verify_chatroom_password", {
        _room: room.id,
        _password: "",
      });
      return {
        ...room,
        passwordProtected: passwordStatus === "room is protected",
      };
    }),
  );

  return enriched;
}

function RoomCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-11 w-16 shrink-0 rounded-md" />
    </div>
  );
}

function visibilityBadges(room: EnrichedRoom) {
  const badges: ReactNode[] = [];
  if (room.visibility === "private") {
    badges.push(
      <Badge key="private" variant="secondary" className="gap-1 text-[10px]">
        <Lock className="h-3 w-3" aria-hidden />
        Private
      </Badge>,
    );
  }
  if (room.visibility === "invite") {
    badges.push(
      <Badge key="invite" variant="secondary" className="gap-1 text-[10px]">
        <UserPlus className="h-3 w-3" aria-hidden />
        Invite
      </Badge>,
    );
  }
  if (room.passwordProtected) {
    badges.push(
      <Badge key="password" variant="outline" className="gap-1 text-[10px]">
        <KeyRound className="h-3 w-3" aria-hidden />
        Password
      </Badge>,
    );
  }
  return badges;
}

function CommunityChatrooms() {
  const { community, communityId, accent, isMember, isOwner } = useCommunity();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: rooms = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<EnrichedRoom[]>({
    queryKey: ["community-chatrooms", communityId],
    queryFn: () => fetchCommunityRooms(communityId),
    staleTime: 15_000,
  });

  const canManage = isOwner;
  const canEnterRoom = !!user && (isMember || isOwner);

  const roomsByCategory = (() => {
    const withCategory = rooms.filter((r) => r.category?.trim());
    if (withCategory.length === 0) return null;
    const groups = new Map<string, EnrichedRoom[]>();
    for (const room of rooms) {
      const key = room.category?.trim() || "Uncategorized";
      const list = groups.get(key) ?? [];
      list.push(room);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  })();

  const renderRoomCard = (r: EnrichedRoom) => (
    <article
      key={r.id}
      className="flex min-w-0 items-center gap-2 rounded-xl border bg-card p-3 transition hover:border-primary/60 sm:gap-3"
    >
      <div
        className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl text-lg font-bold text-white"
        style={{ backgroundColor: r.theme_color || accent }}
      >
        {r.avatar_url ? (
          <img src={r.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          r.name[0]?.toUpperCase() ?? "#"
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1">
          <span className="truncate text-sm font-semibold">{r.name}</span>
          {visibilityBadges(r)}
        </div>
        {r.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
        )}
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Users className="h-3 w-3 shrink-0" aria-hidden />
          {r.member_count ?? 0} members
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="min-h-11 shrink-0 px-3"
        disabled={!canEnterRoom}
        onClick={() =>
          navigate({
            to: "/community/$slug/chatrooms/$roomSlug",
            params: { slug: community.slug, roomSlug: r.slug },
          })
        }
      >
        Enter
      </Button>
    </article>
  );

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Community chatrooms</h2>
          <p className="text-xs text-muted-foreground">Only rooms owned by {community.name}.</p>
        </div>
        {canManage && (
          <Button
            size="sm"
            variant="outline"
            className="min-h-11"
            onClick={() => navigate({ to: "/community/$slug/dashboard", params: { slug: community.slug } })}
          >
            Manage rooms
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h3 className="mt-3 font-semibold">Could not load chatrooms</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {(error as Error)?.message ?? "Something went wrong while fetching rooms."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 min-h-11 gap-2"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Try again
          </Button>
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center sm:p-10">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">No chatrooms yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManage
              ? "Create the first chatroom for this community from the dashboard."
              : "This community hasn't opened any chatrooms yet."}
          </p>
        </div>
      ) : roomsByCategory ? (
        <div className="space-y-4">
          {roomsByCategory.map(([category, categoryRooms]) => (
            <section key={category} className="space-y-2">
              <h3 className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {category}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">{categoryRooms.map(renderRoomCard)}</div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{rooms.map(renderRoomCard)}</div>
      )}

      {user && !isMember && !isOwner && (
        <p className="text-center text-xs text-muted-foreground">Join the community to enter its chatrooms.</p>
      )}
    </div>
  );
}
