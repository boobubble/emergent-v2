import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { NavigateOptions } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { isNavigableSlug } from "@/lib/route-slug";
import type { User } from "@/lib/chat-types";
import { DM_CONVERSATION_READ_EVENT } from "@/lib/dm-read";

export interface AppNotification {
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

export type FeedNotification = AppNotification;

export type NotificationPayload = {
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
  friend_accepted: "accepted your friend request",
  writer_follow: "started following you",
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
  sdk_notification: "sent a game notification",
  sdk_friend_activity: "shared game activity",
  xp_award: "earned XP",
  achievement: "unlocked an achievement",
  wallet_credit: "received a wallet credit",
  wallet_reward: "received a reward",
  community_invite: "invited you to a community",
  community_join_request: "requested to join your community",
  community_join_approved: "approved your community request",
  community_join_rejected: "declined your community request",
  trio_invite: "invited you to a trio room",
  trio_room_invite: "invited you to a trio room",
  chatroom_invite: "invited you to a chatroom",
  moderation_action: "took a moderation action",
  moderation_warning: "issued a moderation warning",
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

export function notificationKindLabel(kind: string): string {
  if (KIND_LABELS[kind]) return KIND_LABELS[kind];
  const normalized = kind.replace(/_/g, " ").trim();
  return normalized ? `sent a notification: ${normalized}` : "sent you a notification";
}

export function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const s = Math.floor(d / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function previewText(payload: NotificationPayload | null | undefined): string | null {
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

type NavigateFn = (opts: NavigateOptions) => void;

export async function navigateForNotification(
  n: AppNotification,
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

  if (n.kind === "friend_accepted" && n.actor_id) {
    const actor = profiles[n.actor_id];
    if (actor?.name) {
      navigate({ to: "/feed", search: { u: actor.name } as never });
      return;
    }
    navigate({ to: "/find-friends" });
    return;
  }

  if (n.kind === "writer_follow" && n.actor_id) {
    const actor = profiles[n.actor_id];
    if (actor?.name) {
      navigate({ to: "/feed", search: { u: actor.name } as never });
      return;
    }
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

  if (n.target_type === "feedback" || n.kind === "feedback_status") {
    navigate({ to: "/feedback" });
    return;
  }

  if (n.target_type === "game" || n.kind.startsWith("game_") || n.kind.startsWith("sdk_")) {
    navigate({ to: "/games" });
    return;
  }

  if (n.target_type === "dm") {
    if (typeof window !== "undefined" && n.target_id && n.actor_id) {
      window.dispatchEvent(
        new CustomEvent("palrgo:openMiniDM", { detail: { peerId: n.actor_id } }),
      );
    }
    navigate({ to: "/chatroom" });
    return;
  }

  if (n.kind === "gamification_reward" || n.kind === "xp_award" || n.kind === "achievement") {
    navigate({ to: "/gamification" });
    return;
  }

  if (n.kind.startsWith("community_") || n.target_type === "community") {
    const slug = isNavigableSlug(payloadSlug) ? payloadSlug : null;
    if (slug) {
      navigate({ to: "/community/$slug", params: { slug } });
      return;
    }
    navigate({ to: "/communities" });
    return;
  }

  if (n.kind.startsWith("trio_") || n.target_type === "trio_room") {
    navigate({ to: "/chatroom" });
    return;
  }

  if (n.kind.startsWith("chatroom_") || n.target_type === "chatroom") {
    navigate({ to: "/chatroom" });
    return;
  }

  if (n.kind.startsWith("wallet_")) {
    navigate({ to: "/wallet" });
  }
}

export type NotificationsContextValue = {
  meId: string;
  items: AppNotification[];
  unread: number;
  loaded: boolean;
  load: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markOne: (id: string) => Promise<void>;
  markDmChannelRead: (channelId: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const NOTIFICATION_LIMIT = 30;

async function loadNotifications(meId: string) {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", meId)
    .order("created_at", { ascending: false })
    .limit(NOTIFICATION_LIMIT);
  return (data ?? []) as AppNotification[];
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const meId = user?.id ?? "";
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!meId) {
      setItems([]);
      setLoaded(true);
      return;
    }
    const data = await loadNotifications(meId);
    setItems(data);
    setLoaded(true);
  }, [meId]);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (!meId) {
      setItems([]);
      setLoaded(false);
      return;
    }
    setLoaded(false);
    void loadRef.current();
    const ch = supabase
      .channel(`notifications-${meId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${meId}` },
        () => { void loadRef.current(); },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [meId]);

  const markDmChannelRead = useCallback((channelId: string) => {
    if (!channelId) return;
    setItems(prev =>
      prev.map(i =>
        !i.read && i.target_type === "dm" && i.target_id === channelId
          ? { ...i, read: true }
          : i,
      ),
    );
  }, []);

  useEffect(() => {
    function onDmRead(e: Event) {
      const ch = (e as CustomEvent<{ channelId?: string }>).detail?.channelId;
      if (ch) markDmChannelRead(ch);
    }
    window.addEventListener(DM_CONVERSATION_READ_EVENT, onDmRead);
    return () => window.removeEventListener(DM_CONVERSATION_READ_EVENT, onDmRead);
  }, [markDmChannelRead]);

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

  const value = useMemo(
    (): NotificationsContextValue => ({
      meId,
      items,
      unread,
      loaded,
      load,
      markAllRead,
      markOne,
      markDmChannelRead,
    }),
    [meId, items, unread, loaded, load, markAllRead, markOne, markDmChannelRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

export function useNotificationsOptional(): NotificationsContextValue | null {
  return useContext(NotificationsContext);
}

