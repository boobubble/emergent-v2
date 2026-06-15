import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, TrendingUp, Trophy, UserPlus, Check, X, Radio, Sparkles, Users, Mars, Venus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/chat/Avatar";
import { WidgetSkeleton } from "@/components/feed/FeedSkeletons";
import type { User } from "@/lib/chat-types";
import type { FeedFriendship } from "@/lib/feed-types";

export function FriendsWidget({ meId, profiles }: { meId: string; profiles: Record<string, User> }) {
  const [friendships, setFriendships] = useState<FeedFriendship[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("friendships").select("*");
      setFriendships((data ?? []) as FeedFriendship[]);
      setLoaded(true);
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
    .filter((u) => u.id !== meId && !friendIds.has(u.id) && !sentIds.has(u.id) && !u.isGuest && !u.isBot)
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

  if (!loaded) return <WidgetSkeleton rows={4} />;

  return (
    <div className="space-y-4">
      {pendingIn.length > 0 && (
        <PremiumCard title="Friend requests" icon={<UserPlus className="h-3.5 w-3.5 text-fuchsia-700 dark:text-fuchsia-400" />} accent="fuchsia" badge={pendingIn.length}>
          {pendingIn.map((f) => {
            const u = profiles[f.sender_id];
            if (!u) return null;
            return (
              <div key={f.id} className="group flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]">
                <RingAvatar user={u} size={34} ring="fuchsia" />
                <Link to="/u/$username" params={{ username: u.name }} className="flex-1 truncate text-sm font-semibold hover:underline">{u.name}</Link>
                <button
                  onClick={() => accept(f)}
                  aria-label="Accept"
                  className="rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 p-1.5 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)] transition hover:scale-105"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => reject(f)}
                  aria-label="Reject"
                  className="rounded-full bg-foreground/[0.06] dark:bg-white/[0.06] p-1.5 text-muted-foreground ring-1 ring-inset ring-border/60 dark:ring-white/10 transition hover:bg-white/[0.1] hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </PremiumCard>
      )}

      <PremiumCard
        title="Friends"
        icon={<Users className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />}
        accent="amber"
        badge={friends.length}
      >
        {friends.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 dark:border-white/10 bg-foreground/[0.02] dark:bg-white/[0.02] px-3 py-4 text-center">
            <Sparkles className="mx-auto h-4 w-4 text-amber-700 dark:text-amber-600/80 dark:text-amber-300/70" />
            <p className="mt-1.5 text-xs text-muted-foreground">No friends yet — send a request below.</p>
          </div>
        ) : friends.slice(0, 6).map((u) => (
          <Link
            key={u.id}
            to="/u/$username"
            params={{ username: u.name }}
            className="group flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]"
          >
            <RingAvatar user={u} size={30} ring={u.status === "online" ? "emerald" : "muted"} />
            <span className="flex-1 truncate text-sm font-medium">{u.name}</span>
            {u.status === "online" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            )}
          </Link>
        ))}
      </PremiumCard>

      {suggestions.length > 0 && (
        <PremiumCard title="Suggested for you" icon={<Sparkles className="h-3.5 w-3.5 text-violet-700 dark:text-violet-300" />} accent="violet">
          {suggestions.map((u) => (
            <div key={u.id} className="group flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]">
              <RingAvatar user={u} size={30} ring="violet" />
              <Link to="/u/$username" params={{ username: u.name }} className="flex-1 truncate text-sm font-semibold hover:underline">{u.name}</Link>
              <button
                onClick={() => sendRequest(u.id)}
                aria-label={`Add ${u.name}`}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 px-2.5 py-1 text-[11px] font-bold text-violet-700 dark:text-violet-200 ring-1 ring-inset ring-violet-400/30 transition hover:from-violet-500/35 hover:to-fuchsia-500/35 hover:text-white"
              >
                <UserPlus className="h-3 w-3" /> Add
              </button>
            </div>
          ))}
        </PremiumCard>
      )}
    </div>
  );
}

export function HashtagsWidget() {
  const [tags, setTags] = useState<{ tag: string; usage_count: number }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.from("hashtags").select("tag, usage_count").order("usage_count", { ascending: false }).limit(8)
      .then(({ data }) => { setTags(data ?? []); setLoaded(true); });
  }, []);

  if (!loaded) {
    return (
      <PremiumCard title="Trending tags" icon={<TrendingUp className="h-3.5 w-3.5 text-sky-700 dark:text-sky-300" />} accent="sky">
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="h-6 w-16 rounded-full skeleton-shimmer" />
          ))}
        </div>
      </PremiumCard>
    );
  }
  if (!tags.length) return null;

  return (
    <PremiumCard title="Trending tags" icon={<TrendingUp className="h-3.5 w-3.5 text-sky-700 dark:text-sky-300" />} accent="sky">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t, i) => (
          <span
            key={t.tag}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition hover:scale-105 ${
              i === 0
                ? "bg-gradient-to-r from-amber-400/25 to-fuchsia-500/25 text-amber-800 dark:text-amber-100 ring-amber-300/40"
                : "bg-foreground/[0.05] dark:bg-white/[0.05] ring-border/60 dark:ring-white/10"
            }`}
          >
            #{t.tag} <span className="ml-0.5 text-muted-foreground">{t.usage_count}</span>
          </span>
        ))}
      </div>
    </PremiumCard>
  );
}

export function LeaderboardWidget({ profiles }: { profiles: Record<string, User> }) {
  const top = Object.values(profiles).sort((a, b) => b.xp - a.xp).slice(0, 5);
  return (
    <PremiumCard title="Top XP" icon={<Trophy className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />} accent="amber">
      {top.map((u, i) => (
        <Link key={u.id} to="/u/$username" params={{ username: u.name }} className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]">
          <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-black ${
            i === 0 ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-black" :
            i === 1 ? "bg-gradient-to-br from-zinc-200 to-zinc-400 text-black" :
            i === 2 ? "bg-gradient-to-br from-orange-400 to-amber-700 text-white" :
            "bg-foreground/[0.06] dark:bg-white/[0.06] text-muted-foreground"
          }`}>{i + 1}</span>
          <Avatar user={u} size={24} />
          <span className="flex-1 truncate text-sm font-medium">{u.name}</span>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{u.xp}</span>
        </Link>
      ))}
    </PremiumCard>
  );
}

export function StreakWidget({ profiles }: { profiles: Record<string, User> }) {
  const top = Object.values(profiles).filter((u) => (u.streak ?? 0) > 0).sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0)).slice(0, 5);
  if (!top.length) return null;
  return (
    <PremiumCard title="Streaks" icon={<Flame className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />} accent="rose">
      {top.map((u) => (
        <Link key={u.id} to="/u/$username" params={{ username: u.name }} className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]">
          <Avatar user={u} size={24} />
          <span className="flex-1 truncate text-sm font-medium">{u.name}</span>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 ring-1 ring-inset ring-rose-400/30">
            <Flame className="h-3 w-3" /> {u.streak}
          </span>
        </Link>
      ))}
    </PremiumCard>
  );
}

export function ChatroomOnlineWidget() {
  const [counts, setCounts] = useState({ total: 0, male: 0, female: 0, other: 0 });
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("gender,status")
      .eq("status", "online");
    const rows = (data ?? []) as { gender: string | null; status: string }[];
    setCounts({
      total: rows.length,
      male: rows.filter((r) => r.gender === "male").length,
      female: rows.filter((r) => r.gender === "female").length,
      other: rows.filter((r) => r.gender !== "male" && r.gender !== "female").length,
    });
    setLoaded(true);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel("chatroom-presence")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (!loaded) {
    return (
      <PremiumCard title="Online now" icon={<Radio className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />} accent="emerald">
        <div className="grid grid-cols-3 gap-2 pt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard
      title="Online now"
      icon={<Radio className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />}
      accent="emerald"
      rightSlot={
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {counts.total} live
        </span>
      }
    >
      <div className="grid grid-cols-3 gap-2 pt-1">
        <GenderStat label="Male" value={counts.male} icon={<Mars className="h-3 w-3" />} from="from-sky-500/25" to="to-blue-600/15" text="text-sky-700 dark:text-sky-700 dark:text-sky-300" ring="ring-sky-500/40 dark:ring-sky-400/30" />
        <GenderStat label="Female" value={counts.female} icon={<Venus className="h-3 w-3" />} from="from-pink-500/25" to="to-fuchsia-600/15" text="text-pink-700 dark:text-pink-300" ring="ring-pink-500/40 dark:ring-pink-400/30" />
        <GenderStat label="Other" value={counts.other} icon={<Sparkles className="h-3 w-3" />} from="from-violet-500/25" to="to-indigo-600/15" text="text-violet-700 dark:text-violet-700 dark:text-violet-300" ring="ring-violet-500/40 dark:ring-violet-400/30" />
      </div>
    </PremiumCard>
  );
}

function GenderStat({ label, value, icon, from, to, text, ring }: { label: string; value: number; icon: React.ReactNode; from: string; to: string; text: string; ring: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${from} ${to} px-2 py-2.5 text-center ring-1 ring-inset ${ring} transition hover:scale-[1.03]`}>
      <div className={`flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider ${text}`}>
        {icon}{label}
      </div>
      <div className={`mt-1 text-xl font-black tabular-nums ${text} dark:drop-shadow-[0_0_8px_currentColor]`}>{value}</div>
    </div>
  );
}

function RingAvatar({ user, size, ring }: { user: User; size: number; ring: "emerald" | "fuchsia" | "violet" | "amber" | "muted" }) {
  const ringColor = {
    emerald: "from-emerald-400 to-emerald-600",
    fuchsia: "from-fuchsia-400 to-pink-600",
    violet: "from-violet-400 to-indigo-600",
    amber: "from-amber-300 to-orange-500",
    muted: "from-white/10 to-white/5",
  }[ring];
  return (
    <span className={`relative inline-flex shrink-0 rounded-full bg-gradient-to-br ${ringColor} p-[1.5px]`}>
      <span className="rounded-full bg-background p-[1.5px]">
        <Avatar user={user} size={size} />
      </span>
    </span>
  );
}

const accentMap = {
  amber: { dot: "bg-amber-400", icon: "text-amber-600 dark:text-amber-300" },
  fuchsia: { dot: "bg-fuchsia-400", icon: "text-fuchsia-600 dark:text-fuchsia-300" },
  violet: { dot: "bg-violet-400", icon: "text-violet-600 dark:text-violet-300" },
  emerald: { dot: "bg-emerald-400", icon: "text-emerald-600 dark:text-emerald-300" },
  sky: { dot: "bg-sky-400", icon: "text-sky-600 dark:text-sky-300" },
  rose: { dot: "bg-rose-400", icon: "text-rose-500 dark:text-rose-300" },
} as const;

function PremiumCard({
  title,
  icon,
  children,
  accent = "amber",
  badge,
  rightSlot,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  accent?: keyof typeof accentMap;
  badge?: number;
  rightSlot?: React.ReactNode;
}) {
  const a = accentMap[accent];
  return (
    <div className="group relative premium-surface premium-surface-hover p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${a.dot}`} aria-hidden />
        {icon}
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {typeof badge === "number" && (
          <span className="ml-1 rounded-full bg-foreground/[0.06] px-1.5 py-0.5 text-[10px] font-bold text-foreground/80 ring-1 ring-inset ring-border">
            {badge}
          </span>
        )}
        {rightSlot && <div className="ml-auto">{rightSlot}</div>}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

