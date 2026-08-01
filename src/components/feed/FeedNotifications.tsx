import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/chat/Avatar";
import { isNavigableSlug } from "@/lib/route-slug";
import type { User } from "@/lib/chat-types";

export interface FeedNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  kind: string;
  target_type: string | null;
  target_id: string | null;
  payload: NotificationPayload | null;
  read: boolean;
  created_at: string;
}

type NotificationPayload = {
  text?: string;
  preview?: string;
  body?: string;
  title?: string;
  slug?: string;
  post_slug?: string;
  post_id?: string;
  name?: string;
  competition_name?: string;
  status?: string;
  place?: number;
  [key: string]: unknown;
};

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const s = Math.floor(d / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const KIND_LABELS: Record<string, string> = {
  friend_post: "shared a new post",
  friend_comment: "commented on a post",
  reaction: "reacted to your post",
  post_reaction: "reacted to your post",
  comment: "commented on your post",
  reply: "replied to your comment",
  comment_reply: "replied to your comment",
  mention: "mentioned you",
  username_mention: "mentioned you",
  friend_request: "sent you a friend request",
  writer_follow: "started following your writing",
  competition_started: "a competition you follow has started",
  competition_ended: "a competition you follow has ended",
  competition_win: "placed in a competition",
  competition_pending_approval: "has a qualification pending approval",
  competition_auto_qualified: "auto-qualified for a competition",
  competition_approved: "competition entry approved",
  competition_rejected: "competition entry rejected",
  assistant_welcome: "sent you a welcome message",
  assistant_mission_daily: "sent your daily mission digest",
  assistant_mission_weekly: "sent your weekly mission digest",
  gamification_reward: "earned a reward",
  feedback_status: "updated your feedback",
  game_started: "started a game",
  game_won: "won a game",
  game_invite: "invited you to a game",
};

const POST_KINDS = new Set([
  "friend_post",
  "friend_comment",
  "reaction",
  "post_reaction",
  "comment",
  "reply",
  "comment_reply",
  "mention",
  "username_mention",
]);

function previewText(payload: NotificationPayload | null | undefined): string | null {
  if (!payload) return null;
  const text = payload.text ?? payload.preview ?? payload.body ?? payload.title;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

async function resolvePostSlug(postId: string): Promise<string | null> {
  const { data } = await supabase.from("posts_safe").select("slug").eq("id", postId).maybeSingle();
  const slug = (data as { slug?: string | null } | null)?.slug;
  return isNavigableSlug(slug) ? slug : null;
}

async function resolveCompetitionSlug(competitionId: string): Promise<string | null> {
  const { data } = await supabase.from("competitions").select("slug").eq("id", competitionId).maybeSingle();
  const slug = (data as { slug?: string | null } | null)?.slug;
  return isNavigableSlug(slug) ? slug : null;
}

export function useFeedNotifications(meId: string) {
  const [items, setItems] = useState<FeedNotification[]>([]);

  const load = useCallback(async () => {
    if (!meId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", meId)
      .order("created_at", { ascending: false })
      .limit(30);
    setItems((data ?? []) as FeedNotification[]);
  }, [meId]);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (!meId) {
      setItems([]);
      return;
    }
    void loadRef.current();
    const ch = supabase
      .channel(`feed-notif-${meId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${meId}` }, () => { void loadRef.current(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [meId]);

  const unread = useMemo(() => items.filter(i => !i.read).length, [items]);

  const markAllRead = useCallback(async () => {
    if (!meId || unread === 0) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", meId).eq("read", false);
    setItems(prev => prev.map(i => ({ ...i, read: true })));
  }, [meId, unread]);

  const markOne = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setItems(prev => prev.map(i => (i.id === id ? { ...i, read: true } : i)));
  }, []);

  return { items, unread, load, markAllRead, markOne };
}

type NavigateFn = ReturnType<typeof useNavigate>;

async function navigateForNotification(
  n: FeedNotification,
  navigate: NavigateFn,
  profiles: Record<string, User>,
  onOpenFindFriends?: () => void,
) {
  const payload = (n.payload ?? {}) as NotificationPayload;
  const payloadSlug = payload.slug ?? payload.post_slug;
  const postId = n.target_type === "post" && n.target_id
    ? n.target_id
    : typeof payload.post_id === "string"
      ? payload.post_id
      : null;

  const wantsPost =
    n.target_type === "post" ||
    POST_KINDS.has(n.kind) ||
    !!postId;

  if (wantsPost && (postId || isNavigableSlug(payloadSlug))) {
    const slug = isNavigableSlug(payloadSlug)
      ? payloadSlug
      : postId
        ? await resolvePostSlug(postId)
        : null;
    if (slug) {
      navigate({ to: "/feed/$slug", params: { slug } });
      return;
    }
  }

  if (n.kind === "friend_request") {
    if (onOpenFindFriends) onOpenFindFriends();
    else navigate({ to: "/find-friends" });
    return;
  }

  if (n.target_type === "competition" || n.kind.startsWith("competition_")) {
    const slug = isNavigableSlug(payloadSlug)
      ? payloadSlug
      : n.target_id
        ? await resolveCompetitionSlug(n.target_id)
        : null;
    if (slug) {
      navigate({ to: "/competitions/$slug", params: { slug } });
      return;
    }
  }

  if (n.target_type === "user" && n.actor_id) {
    const actor = profiles[n.actor_id];
    if (actor?.name) {
      navigate({ to: "/u/$username", params: { username: actor.name } });
      return;
    }
  }

  if (n.target_type === "feedback") {
    navigate({ to: "/feedback" });
    return;
  }

  if (n.target_type === "game") {
    navigate({ to: "/games" });
  }
}

function NotificationRow({
  n,
  profiles,
  onActivate,
  compact = false,
}: {
  n: FeedNotification;
  profiles: Record<string, User>;
  onActivate: (n: FeedNotification) => void;
  compact?: boolean;
}) {
  const actor = n.actor_id ? profiles[n.actor_id] : null;
  const body = previewText(n.payload);
  return (
    <button
      type="button"
      onClick={() => onActivate(n)}
      className={`flex w-full items-start gap-2 border-b border-border/40 text-left hover:bg-accent ${compact ? "px-3 py-2 text-sm" : "min-h-11 px-4 py-3 text-sm"} ${!n.read ? "bg-primary/5" : ""}`}
    >
      {actor ? <Avatar user={actor} size={compact ? 32 : 36} /> : <div className={`${compact ? "h-8 w-8" : "h-9 w-9"} shrink-0 rounded-full bg-muted`} />}
      <div className="min-w-0 flex-1">
        <div className="truncate">
          <span className="font-semibold">{actor?.name ?? "Someone"}</span>{" "}
          <span className="text-muted-foreground">{KIND_LABELS[n.kind] ?? n.kind.replace(/_/g, " ")}</span>
        </div>
        {body && (
          <div className="truncate text-xs text-muted-foreground">{body}</div>
        )}
        <div className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(n.created_at)} ago</div>
      </div>
      {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />}
    </button>
  );
}

export function FeedNotificationPanel({
  meId,
  profiles,
  onOpenFindFriends,
  notifications,
}: {
  meId: string;
  profiles: Record<string, User>;
  onOpenFindFriends?: () => void;
  notifications: ReturnType<typeof useFeedNotifications>;
}) {
  const navigate = useNavigate();
  const { items, unread, markAllRead, markOne } = notifications;

  const onActivate = useCallback(async (n: FeedNotification) => {
    await markOne(n.id);
    await navigateForNotification(n, navigate, profiles, onOpenFindFriends);
  }, [markOne, navigate, profiles, onOpenFindFriends]);

  if (!meId) {
    return (
      <div className="feed-card p-10 text-center">
        <Bell className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-base font-semibold">Sign in for notifications</p>
      </div>
    );
  }

  return (
    <div className="feed-card overflow-hidden">
      <div className="flex min-h-11 items-center justify-between border-b border-border px-4 py-2">
        <div className="text-sm font-bold">Notifications</div>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10"
          >
            <Check className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">No notifications yet.</p>
      ) : (
        <div className="max-h-[min(70vh,640px)] overflow-y-auto">
          {items.map(n => (
            <NotificationRow key={n.id} n={n} profiles={profiles} onActivate={onActivate} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FeedNotifications({
  meId,
  profiles,
  onOpenFindFriends,
  notifications,
}: {
  meId: string;
  profiles: Record<string, User>;
  onOpenFindFriends?: () => void;
  notifications: ReturnType<typeof useFeedNotifications>;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { items, unread, markAllRead, markOne } = notifications;

  const onActivate = useCallback(async (n: FeedNotification) => {
    await markOne(n.id);
    setOpen(false);
    await navigateForNotification(n, navigate, profiles, onOpenFindFriends);
  }, [markOne, navigate, profiles, onOpenFindFriends]);

  if (!meId) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-accent"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="h-5 w-5 text-foreground" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-30" aria-hidden onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-40 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex min-h-11 items-center justify-between border-b border-border px-3 py-2">
              <div className="text-sm font-bold">Notifications</div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs text-muted-foreground">No notifications yet.</p>
              ) : items.map(n => (
                <NotificationRow key={n.id} n={n} profiles={profiles} onActivate={onActivate} compact />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
