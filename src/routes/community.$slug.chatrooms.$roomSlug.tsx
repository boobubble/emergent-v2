import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChatApp } from "@/components/chat/ChatApp";
import { useChat } from "@/lib/chat-store";
import { useCommunity } from "@/lib/community-context";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/community/$slug/chatrooms/$roomSlug")({
  component: CommunityChatroomView,
});

interface ResolvedRoom {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  visibility: string;
  community_id: string;
  archived_at: string | null;
}

type RoomAccess =
  | { status: "ok"; room: ResolvedRoom }
  | { status: "password_required"; room: ResolvedRoom }
  | { status: "forbidden"; message: string }
  | { status: "not_found" };

async function resolveCommunityRoom(
  communityId: string,
  roomSlug: string,
): Promise<{ access: RoomAccess; queryError: string | null }> {
  const { data, error } = await supabase
    .from("chatrooms")
    .select("id, slug, name, description, visibility, community_id, archived_at")
    .eq("slug", roomSlug)
    .eq("community_id", communityId)
    .maybeSingle();

  if (error) {
    return { access: { status: "not_found" }, queryError: error.message };
  }

  if (!data) {
    return { access: { status: "not_found" }, queryError: null };
  }

  const room = data as ResolvedRoom;

  if (room.archived_at || room.visibility === "archived") {
    return { access: { status: "not_found" }, queryError: null };
  }

  const { data: passwordStatus, error: passwordError } = await supabase.rpc(
    "verify_chatroom_password",
    { _room: room.id, _password: "" },
  );

  if (passwordError) {
    return { access: { status: "forbidden", message: passwordError.message }, queryError: null };
  }

  if (passwordStatus === "room is protected") {
    return { access: { status: "password_required", room }, queryError: null };
  }

  if (passwordStatus !== "success") {
    return {
      access: {
        status: "forbidden",
        message: "You do not have access to this chatroom.",
      },
      queryError: null,
    };
  }

  return { access: { status: "ok", room }, queryError: null };
}

/**
 * Renders the existing ChatApp inside the persistent Community Shell so that
 * Community Context, branding, and header stay intact. We only wire routing
 * here — the chat runtime, realtime, permissions, and UI are reused as-is.
 */
function CommunityChatroomView() {
  const { roomSlug, slug } = Route.useParams();
  const { community, communityId, isMember, isOwner } = useCommunity();
  const { user } = useAuth();
  const chat = useChat();
  const registeredIdRef = useRef<string | null>(null);

  const canEnter = !!user && (isMember || isOwner);

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["community-chatroom", communityId, roomSlug],
    queryFn: () => resolveCommunityRoom(communityId, roomSlug),
    enabled: canEnter,
    staleTime: 30_000,
    retry: false,
  });

  const access = data?.access;
  const resolvedRoom = access?.status === "ok" ? access.room : null;

  useEffect(() => {
    if (!resolvedRoom) return;
    if (registeredIdRef.current === resolvedRoom.id) return;
    registeredIdRef.current = resolvedRoom.id;
    chat.registerCommunityRoom({
      id: resolvedRoom.id,
      slug: resolvedRoom.slug,
      name: resolvedRoom.name,
      topic: resolvedRoom.description || resolvedRoom.name,
      communityId: resolvedRoom.community_id,
      isPublic: resolvedRoom.visibility === "public",
    });
    return () => {
      registeredIdRef.current = null;
      chat.leaveCommunityRoom(resolvedRoom.id);
    };
  }, [resolvedRoom, chat]);

  const backLink = (
    <Link
      to="/community/$slug/chatrooms"
      params={{ slug }}
      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back to {community.name} rooms
    </Link>
  );

  if (!user) {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border bg-card px-3 py-2 text-xs">{backLink}</div>
        <StatePanel
          title="Sign in required"
          message="Sign in and join this community to enter its chatrooms."
        />
      </div>
    );
  }

  if (!canEnter) {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border bg-card px-3 py-2 text-xs">{backLink}</div>
        <StatePanel
          title="Community membership required"
          message="Join this community before entering its chatrooms."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border bg-card px-3 py-2 text-xs">{backLink}</div>
        <StatePanel title="Loading chatroom…" message="Resolving room and preparing messages." loading />
      </div>
    );
  }

  const supabaseError = queryError?.message || data?.queryError;
  if (supabaseError) {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border bg-card px-3 py-2 text-xs">{backLink}</div>
        <StatePanel title="Could not load chatroom" message={supabaseError} />
      </div>
    );
  }

  if (!access || access.status === "not_found") {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border bg-card px-3 py-2 text-xs">{backLink}</div>
        <StatePanel
          title="Chatroom not found"
          message="This room does not exist, was archived, or is not part of this community."
        />
      </div>
    );
  }

  if (access.status === "forbidden") {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border bg-card px-3 py-2 text-xs">{backLink}</div>
        <StatePanel title="Access denied" message={access.message} />
      </div>
    );
  }

  if (access.status === "password_required") {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border bg-card px-3 py-2 text-xs">{backLink}</div>
        <StatePanel
          icon={<Lock className="h-8 w-8 text-muted-foreground" />}
          title={`${access.room.name} is password protected`}
          message="Password entry is not wired in this batch. A follow-up will add verification before joining."
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-xs">
        {backLink}
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold uppercase text-primary">
          {resolvedRoom?.name ?? "Community room"}
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <ChatApp />
      </div>
    </div>
  );
}

function StatePanel({
  title,
  message,
  loading,
  icon,
}: {
  title: string;
  message: string;
  loading?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-10 text-center">
      {icon ?? <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />}
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {loading && (
        <Button className="mt-4" size="sm" variant="outline" disabled>
          Loading…
        </Button>
      )}
    </div>
  );
}
