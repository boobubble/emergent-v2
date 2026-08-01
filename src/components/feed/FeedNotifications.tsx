import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Check } from "lucide-react";
import { Avatar } from "@/components/chat/Avatar";
import type { User } from "@/lib/chat-types";
import {
  useNotifications,
  navigateForNotification,
  notificationKindLabel,
  previewText,
  timeAgo,
  type AppNotification,
  type FeedNotification,
} from "@/lib/use-notifications";

export type { AppNotification, FeedNotification };

export { useNotifications, useNotifications as useFeedNotifications };

function NotificationRow({
  n,
  profiles,
  onActivate,
  compact = false,
}: {
  n: AppNotification;
  profiles: Record<string, User>;
  onActivate: (n: AppNotification) => void;
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
          <span className="text-muted-foreground">{notificationKindLabel(n.kind)}</span>
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
}: {
  meId: string;
  profiles: Record<string, User>;
  onOpenFindFriends?: () => void;
}) {
  const navigate = useNavigate();
  const { items, unread, markAllRead, markOne } = useNotifications();

  const onActivate = useCallback(async (n: AppNotification) => {
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
}: {
  meId: string;
  profiles: Record<string, User>;
  onOpenFindFriends?: () => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { items, unread, markAllRead, markOne } = useNotifications();

  const onActivate = useCallback(async (n: AppNotification) => {
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
