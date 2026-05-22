import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, TrendingUp, Trophy, UserPlus, Check, X, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/chat/Avatar";
import type { User } from "@/lib/chat-types";
import type { FeedFriendship } from "@/lib/feed-types";

export function FriendsWidget({ meId, profiles }: { meId: string; profiles: Record<string, User> }) {
  const [friendships, setFriendships] = useState<FeedFriendship[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("friendships").select("*");
      setFriendships((data ?? []) as FeedFriendship[]);
    }
    load();
    const ch = supabase.channel(`fr-${meId}`).on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [meId]);

  const pendingIn = friendships.filter((f) => f.receiver_id === meId && f.status === "pending");
  const friendIds = new Set(friendships.filter((f) => f.status === "accepted").map((f) => f.sender_id === meId ? f.receiver_id : f.sender_id));
  const sentIds = new Set(friendships.filter((f) => f.sender_id === meId && f.status === "pending").map((f) => f.receiver_id));
  const friends = Array.from(friendIds).map((id) => profiles[id]).filter(Boolean) as User[];
  const suggestions = Object.values(profiles)
    .filter((u) => u.id !== meId && !friendIds.has(u.id) && !sentIds.has(u.id))
    .slice(0, 5);

  async function accept(f: FeedFriendship) {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", f.id);
  }
  async function reject(f: FeedFriendship) {
    await supabase.from("friendships").delete().eq("id", f.id);
  }
  async function sendRequest(toId: string) {
    await supabase.from("friendships").insert({ sender_id: meId, receiver_id: toId, status: "pending" });
  }

  return (
    <div className="space-y-4">
      {pendingIn.length > 0 && (
        <Card title="Friend requests">
          {pendingIn.map((f) => {
            const u = profiles[f.sender_id];
            if (!u) return null;
            return (
              <div key={f.id} className="flex items-center gap-2 py-1.5">
                <Avatar user={u} size={32} />
                <Link to="/u/$username" params={{ username: u.name }} className="flex-1 truncate text-sm font-medium hover:underline">{u.name}</Link>
                <button onClick={() => accept(f)} className="rounded-full bg-primary p-1.5 text-primary-foreground"><Check className="h-3.5 w-3.5" /></button>
                <button onClick={() => reject(f)} className="rounded-full bg-muted p-1.5"><X className="h-3.5 w-3.5" /></button>
              </div>
            );
          })}
        </Card>
      )}

      <Card title={`Friends (${friends.length})`}>
        {friends.length === 0 ? (
          <p className="text-xs text-muted-foreground">No friends yet.</p>
        ) : friends.slice(0, 6).map((u) => (
          <Link key={u.id} to="/u/$username" params={{ username: u.name }} className="flex items-center gap-2 rounded-lg py-1.5 hover:bg-accent">
            <Avatar user={u} size={28} />
            <span className="flex-1 truncate text-sm">{u.name}</span>
            <span className={`h-2 w-2 rounded-full ${u.status === "online" ? "bg-green-500" : "bg-muted-foreground/40"}`} />
          </Link>
        ))}
      </Card>

      {suggestions.length > 0 && (
        <Card title="Suggested">
          {suggestions.map((u) => (
            <div key={u.id} className="flex items-center gap-2 py-1.5">
              <Avatar user={u} size={28} />
              <Link to="/u/$username" params={{ username: u.name }} className="flex-1 truncate text-sm font-medium hover:underline">{u.name}</Link>
              <button onClick={() => sendRequest(u.id)} className="rounded-full bg-primary/10 p-1.5 text-primary hover:bg-primary/20"><UserPlus className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

export function HashtagsWidget() {
  const [tags, setTags] = useState<{ tag: string; usage_count: number }[]>([]);

  useEffect(() => {
    supabase.from("hashtags").select("tag, usage_count").order("usage_count", { ascending: false }).limit(8)
      .then(({ data }) => setTags(data ?? []));
  }, []);

  if (!tags.length) return null;

  return (
    <Card title="Trending tags" icon={<TrendingUp className="h-3.5 w-3.5" />}>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t.tag} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium">
            #{t.tag} <span className="text-muted-foreground">{t.usage_count}</span>
          </span>
        ))}
      </div>
    </Card>
  );
}

export function LeaderboardWidget({ profiles }: { profiles: Record<string, User> }) {
  const top = Object.values(profiles).sort((a, b) => b.xp - a.xp).slice(0, 5);
  return (
    <Card title="Top XP" icon={<Trophy className="h-3.5 w-3.5 text-yellow-500" />}>
      {top.map((u, i) => (
        <Link key={u.id} to="/u/$username" params={{ username: u.name }} className="flex items-center gap-2 rounded-lg py-1.5 hover:bg-accent">
          <span className="w-4 text-xs font-bold text-muted-foreground">{i + 1}</span>
          <Avatar user={u} size={24} />
          <span className="flex-1 truncate text-sm">{u.name}</span>
          <span className="text-xs font-semibold text-primary">{u.xp}</span>
        </Link>
      ))}
    </Card>
  );
}

export function StreakWidget({ profiles }: { profiles: Record<string, User> }) {
  const top = Object.values(profiles).filter((u) => (u.streak ?? 0) > 0).sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0)).slice(0, 5);
  if (!top.length) return null;
  return (
    <Card title="Streaks" icon={<Flame className="h-3.5 w-3.5 text-orange-500" />}>
      {top.map((u) => (
        <Link key={u.id} to="/u/$username" params={{ username: u.name }} className="flex items-center gap-2 rounded-lg py-1.5 hover:bg-accent">
          <Avatar user={u} size={24} />
          <span className="flex-1 truncate text-sm">{u.name}</span>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-orange-500"><Flame className="h-3 w-3" /> {u.streak}</span>
        </Link>
      ))}
    </Card>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{icon}{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
