import { useEffect, useMemo, useState } from "react";
import { Bell, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/chat/Avatar";
import type { User } from "@/lib/chat-types";

interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  kind: string;
  target_type: string | null;
  target_id: string | null;
  payload: { text?: string } | null;
  read: boolean;
  created_at: string;
}

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
};

export function FeedNotifications({ meId, profiles }: { meId: string; profiles: Record<string, User> }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!meId) return;
    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", meId)
        .order("created_at", { ascending: false })
        .limit(20);
      setItems((data ?? []) as Notification[]);
    }
    load();
    const ch = supabase
      .channel(`notif-${meId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${meId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [meId]);

  const unread = useMemo(() => items.filter(i => !i.read).length, [items]);

  async function markAllRead() {
    if (!unread) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", meId).eq("read", false);
  }

  async function markOne(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
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
          <button className="fixed inset-0 z-30" aria-hidden onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-40 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="text-sm font-bold">Notifications</div>
              {unread > 0 && (
                <button onClick={markAllRead} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10">
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs text-muted-foreground">No notifications yet.</p>
              ) : items.map(n => {
                const actor = n.actor_id ? profiles[n.actor_id] : null;
                return (
                  <button
                    key={n.id}
                    onClick={() => markOne(n.id)}
                    className={`flex w-full items-start gap-2 border-b border-border/40 px-3 py-2 text-left text-sm hover:bg-accent ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    {actor ? <Avatar user={actor} size={32} /> : <div className="h-8 w-8 rounded-full bg-muted" />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate">
                        <span className="font-semibold">{actor?.name ?? "Someone"}</span>{" "}
                        <span className="text-muted-foreground">{KIND_LABELS[n.kind] ?? n.kind}</span>
                      </div>
                      {n.payload?.text && (
                        <div className="truncate text-xs text-muted-foreground">{n.payload.text}</div>
                      )}
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(n.created_at)} ago</div>
                    </div>
                    {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
