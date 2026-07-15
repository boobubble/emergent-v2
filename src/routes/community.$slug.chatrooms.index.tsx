import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/lib/community-context";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Lock } from "lucide-react";

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
}

function CommunityChatrooms() {
  const { community, communityId, accent, isMember, isOwner } = useCommunity();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: rooms = [], isLoading } = useQuery<RoomRow[]>({
    queryKey: ["community-chatrooms", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatrooms")
        .select("id,slug,name,description,member_count,visibility,avatar_url,theme_color")
        .eq("community_id", communityId)
        .neq("visibility", "archived")
        .order("member_count", { ascending: false })
        .limit(60);
      if (error) throw new Error(error.message);
      return (data ?? []) as RoomRow[];
    },
    staleTime: 15_000,
  });

  const canManage = isOwner;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <div>
          <h2 className="text-sm font-semibold">Community chatrooms</h2>
          <p className="text-xs text-muted-foreground">Only rooms owned by {community.name}.</p>
        </div>
        {canManage && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: "/community/$slug/dashboard", params: { slug: community.slug } })}
          >
            Manage rooms
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">No chatrooms yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManage
              ? "Create the first chatroom for this community from the dashboard."
              : "This community hasn't opened any chatrooms yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-xl border bg-card p-3 transition hover:border-primary/60"
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
                <div className="flex items-center gap-1.5">
                  {r.visibility === "private" && <Lock className="h-3 w-3 text-muted-foreground" />}
                  <span className="truncate text-sm font-semibold">{r.name}</span>
                </div>
                {r.description && (
                  <p className="line-clamp-1 text-xs text-muted-foreground">{r.description}</p>
                )}
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {r.member_count ?? 0}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={!user || (!isMember && !isOwner)}
                onClick={() => navigate({ to: "/chatroom", search: { room: r.slug } as never } as never)}
              >
                Enter
              </Button>
            </div>
          ))}
        </div>
      )}

      {user && !isMember && !isOwner && (
        <p className="text-center text-xs text-muted-foreground">Join the community to enter its chatrooms.</p>
      )}
    </div>
  );
}
