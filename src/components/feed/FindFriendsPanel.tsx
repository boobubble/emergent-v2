import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  UserPlus,
  Check,
  X,
  UserMinus,
  Ban,
  Users,
  Sparkles,
  Inbox,
  Send,
  ShieldOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import type { User } from "@/lib/chat-types";
import { toast } from "sonner";

type FriendshipRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
};

type Tab = "suggestions" | "requests" | "sent" | "friends" | "search";

export function FindFriendsPanel() {
  const { user } = useAuth();
  const { profiles } = useRemoteProfiles();
  const [tab, setTab] = useState<Tab>("suggestions");
  const [rows, setRows] = useState<FriendshipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const meId = user?.id ?? "";

  useEffect(() => {
    if (!meId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase.from("friendships").select("*");
      if (cancelled) return;
      setRows((data ?? []) as FriendshipRow[]);
      setLoading(false);
    }
    load();
    const ch = supabase
      .channel(`find-friends-panel-${meId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => load())
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [meId]);

  const { friendsOf, mineByOther, blockedByMe, blockedMe } = useMemo(() => {
    const friendsOf = new Map<string, Set<string>>();
    const mineByOther = new Map<string, FriendshipRow>();
    const blockedByMe = new Set<string>();
    const blockedMe = new Set<string>();
    for (const r of rows) {
      if (r.status === "accepted") {
        if (!friendsOf.has(r.sender_id)) friendsOf.set(r.sender_id, new Set());
        if (!friendsOf.has(r.receiver_id)) friendsOf.set(r.receiver_id, new Set());
        friendsOf.get(r.sender_id)!.add(r.receiver_id);
        friendsOf.get(r.receiver_id)!.add(r.sender_id);
      }
      if (r.sender_id === meId || r.receiver_id === meId) {
        const other = r.sender_id === meId ? r.receiver_id : r.sender_id;
        const existing = mineByOther.get(other);
        if (!existing || +new Date(r.created_at) > +new Date(existing.created_at)) {
          mineByOther.set(other, r);
        }
        if (r.status === "blocked") {
          if (r.sender_id === meId) blockedByMe.add(other);
          else blockedMe.add(other);
        }
      }
    }
    return { friendsOf, mineByOther, blockedByMe, blockedMe };
  }, [rows, meId]);

  const myFriends = friendsOf.get(meId) ?? new Set<string>();
  const allProfiles = useMemo(
    () => Object.values(profiles).filter((p) => p.id !== meId && !p.isGuest),
    [profiles, meId],
  );

  const incoming = useMemo(
    () => rows.filter((r) => r.status === "pending" && r.receiver_id === meId),
    [rows, meId],
  );
  const outgoing = useMemo(
    () => rows.filter((r) => r.status === "pending" && r.sender_id === meId),
    [rows, meId],
  );

  const friendsList = useMemo(
    () => allProfiles.filter((p) => myFriends.has(p.id)).sort(byOnlineThenName),
    [allProfiles, myFriends],
  );

  const suggestions = useMemo(() => {
    return allProfiles
      .filter(
        (p) =>
          !myFriends.has(p.id) &&
          !mineByOther.has(p.id) &&
          !blockedByMe.has(p.id) &&
          !blockedMe.has(p.id),
      )
      .map((p) => {
        const theirFriends = friendsOf.get(p.id) ?? new Set<string>();
        let mutual = 0;
        myFriends.forEach((id) => {
          if (theirFriends.has(id)) mutual++;
        });
        return { p, mutual };
      })
      .sort((a, b) => {
        if (b.mutual !== a.mutual) return b.mutual - a.mutual;
        const ao = a.p.status === "online" ? 1 : 0;
        const bo = b.p.status === "online" ? 1 : 0;
        if (ao !== bo) return bo - ao;
        return (b.p.lastSeen ?? 0) - (a.p.lastSeen ?? 0);
      })
      .slice(0, 60);
  }, [allProfiles, myFriends, mineByOther, friendsOf, blockedByMe, blockedMe]);

  const searchResults = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return allProfiles.filter((p) => p.name.toLowerCase().includes(needle)).slice(0, 30);
  }, [q, allProfiles]);

  async function sendRequest(otherId: string) {
    const { error } = await supabase
      .from("friendships")
      .insert({ sender_id: meId, receiver_id: otherId, status: "pending" });
    if (error) toast.error(error.message);
    else toast.success("Request sent");
  }
  async function accept(rowId: string) {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", rowId);
    if (error) toast.error(error.message);
    else toast.success("You're now friends");
  }
  async function removeRow(rowId: string) {
    const { error } = await supabase.from("friendships").delete().eq("id", rowId);
    if (error) toast.error(error.message);
  }
  async function unfriend(otherId: string) {
    const row = rows.find(
      (r) =>
        r.status === "accepted" &&
        ((r.sender_id === meId && r.receiver_id === otherId) ||
          (r.receiver_id === meId && r.sender_id === otherId)),
    );
    if (!row) return;
    const { error } = await supabase.from("friendships").delete().eq("id", row.id);
    if (error) toast.error(error.message);
    else toast.success("Unfriended");
  }
  async function block(otherId: string) {
    const existing = mineByOther.get(otherId);
    if (existing) await supabase.from("friendships").delete().eq("id", existing.id);
    const { error } = await supabase
      .from("friendships")
      .insert({ sender_id: meId, receiver_id: otherId, status: "blocked" });
    if (error) toast.error(error.message);
    else toast.success("User blocked");
  }
  async function unblock(otherId: string) {
    const row = rows.find(
      (r) => r.status === "blocked" && r.sender_id === meId && r.receiver_id === otherId,
    );
    if (!row) return;
    const { error } = await supabase.from("friendships").delete().eq("id", row.id);
    if (error) toast.error(error.message);
    else toast.success("Unblocked");
  }

  function mutualWith(otherId: string): number {
    const theirs = friendsOf.get(otherId) ?? new Set<string>();
    let n = 0;
    myFriends.forEach((id) => {
      if (theirs.has(id)) n++;
    });
    return n;
  }

  if (!user) return null;

  const TABS: { id: Tab; label: string; icon: typeof Users; badge?: number }[] = [
    { id: "suggestions", label: "Suggestions", icon: Sparkles },
    { id: "requests", label: "Requests", icon: Inbox, badge: incoming.length },
    { id: "sent", label: "Sent", icon: Send },
    { id: "friends", label: "Friends", icon: Users },
    { id: "search", label: "Search", icon: Search },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Users className="h-5 w-5 text-primary" /> Find Friends
        </h1>
        <span className="text-xs text-muted-foreground">
          {friendsList.length} friend{friendsList.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-full bg-background/50 p-1 border border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
              {t.badge ? (
                <span
                  className={`ml-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold ${active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"}`}
                >
                  {t.badge > 99 ? "99+" : t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === "search" && (
        <div className="mt-3 flex items-center gap-2 rounded-full bg-background/50 px-4 py-2 border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by username…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}

      <div className="mt-3">
        {loading ? (
          <SkeletonGrid />
        ) : tab === "suggestions" ? (
          suggestions.length === 0 ? (
            <Empty icon={Sparkles} text="No suggestions right now. Check back later." />
          ) : (
            <CardGrid>
              {suggestions.map(({ p, mutual }) => (
                <PersonCard
                  key={p.id}
                  p={p}
                  subtitle={
                    mutual > 0
                      ? `${mutual} mutual friend${mutual === 1 ? "" : "s"}`
                      : p.status === "online"
                        ? "Online now"
                        : "New here"
                  }
                >
                  <button onClick={() => sendRequest(p.id)} className="btn-primary">
                    <UserPlus className="h-3.5 w-3.5" /> Add
                  </button>
                  <button onClick={() => block(p.id)} className="btn-ghost" title="Block">
                    <Ban className="h-3.5 w-3.5" />
                  </button>
                </PersonCard>
              ))}
            </CardGrid>
          )
        ) : tab === "requests" ? (
          incoming.length === 0 ? (
            <Empty icon={Inbox} text="No incoming requests." />
          ) : (
            <CardGrid>
              {incoming.map((r) => {
                const p = profiles[r.sender_id];
                if (!p) return null;
                const m = mutualWith(p.id);
                return (
                  <PersonCard
                    key={r.id}
                    p={p}
                    subtitle={m > 0 ? `${m} mutual` : "Wants to be friends"}
                  >
                    <button onClick={() => accept(r.id)} className="btn-primary">
                      <Check className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button onClick={() => removeRow(r.id)} className="btn-ghost">
                      <X className="h-3.5 w-3.5" /> Decline
                    </button>
                  </PersonCard>
                );
              })}
            </CardGrid>
          )
        ) : tab === "sent" ? (
          outgoing.length === 0 ? (
            <Empty icon={Send} text="No pending requests sent." />
          ) : (
            <CardGrid>
              {outgoing.map((r) => {
                const p = profiles[r.receiver_id];
                if (!p) return null;
                return (
                  <PersonCard key={r.id} p={p} subtitle="Request pending…">
                    <button onClick={() => removeRow(r.id)} className="btn-ghost">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </PersonCard>
                );
              })}
            </CardGrid>
          )
        ) : tab === "friends" ? (
          friendsList.length === 0 ? (
            <Empty icon={Users} text="No friends yet. Send some requests!" />
          ) : (
            <CardGrid>
              {friendsList.map((p) => (
                <PersonCard
                  key={p.id}
                  p={p}
                  subtitle={
                    p.status === "online"
                      ? "Online"
                      : p.lastSeen
                        ? `Active ${timeAgo(p.lastSeen)}`
                        : "Offline"
                  }
                >
                  <button onClick={() => unfriend(p.id)} className="btn-ghost">
                    <UserMinus className="h-3.5 w-3.5" /> Unfriend
                  </button>
                </PersonCard>
              ))}
              {[...blockedByMe].length > 0 && (
                <div className="col-span-full mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Blocked
                </div>
              )}
              {[...blockedByMe].map((id) => {
                const p = profiles[id];
                if (!p) return null;
                return (
                  <PersonCard key={id} p={p} subtitle="Blocked by you">
                    <button onClick={() => unblock(id)} className="btn-ghost">
                      <ShieldOff className="h-3.5 w-3.5" /> Unblock
                    </button>
                  </PersonCard>
                );
              })}
            </CardGrid>
          )
        ) : tab === "search" ? (
          q.trim() === "" ? (
            <Empty icon={Search} text="Type a name to search." />
          ) : searchResults.length === 0 ? (
            <Empty icon={Search} text={`No users match "${q}"`} />
          ) : (
            <CardGrid>
              {searchResults.map((p) => {
                const row = mineByOther.get(p.id);
                const isFriend = myFriends.has(p.id);
                const isBlockedByMe = blockedByMe.has(p.id);
                return (
                  <PersonCard
                    key={p.id}
                    p={p}
                    subtitle={
                      mutualWith(p.id) > 0
                        ? `${mutualWith(p.id)} mutual`
                        : p.status === "online"
                          ? "Online"
                          : "Offline"
                    }
                  >
                    {isBlockedByMe ? (
                      <button onClick={() => unblock(p.id)} className="btn-ghost">
                        <ShieldOff className="h-3.5 w-3.5" /> Unblock
                      </button>
                    ) : isFriend ? (
                      <button onClick={() => unfriend(p.id)} className="btn-ghost">
                        <UserMinus className="h-3.5 w-3.5" /> Unfriend
                      </button>
                    ) : row?.status === "pending" && row.sender_id === meId ? (
                      <button onClick={() => removeRow(row.id)} className="btn-ghost">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    ) : row?.status === "pending" && row.receiver_id === meId ? (
                      <button onClick={() => accept(row.id)} className="btn-primary">
                        <Check className="h-3.5 w-3.5" /> Accept
                      </button>
                    ) : (
                      <button onClick={() => sendRequest(p.id)} className="btn-primary">
                        <UserPlus className="h-3.5 w-3.5" /> Add
                      </button>
                    )}
                  </PersonCard>
                );
              })}
            </CardGrid>
          )
        ) : null}
      </div>
    </div>
  );
}

function byOnlineThenName(a: User, b: User) {
  const ao = a.status === "online" ? 1 : 0;
  const bo = b.status === "online" ? 1 : 0;
  if (ao !== bo) return bo - ao;
  return a.name.localeCompare(b.name);
}

function timeAgo(ms: number) {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{children}</div>
  );
}

function PersonCard({
  p,
  subtitle,
  children,
}: {
  p: User;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-3">
      <Link to="/u/$username" params={{ username: p.name }} className="relative shrink-0" title={p.name}>
        {p.avatarUrl ? (
          <img
            src={p.avatarUrl}
            alt={p.name}
            loading="lazy"
            decoding="async"
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div
            className="grid h-12 w-12 place-items-center rounded-full text-sm font-semibold text-white"
            style={{ background: p.avatarColor }}
          >
            {p.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        {p.status === "online" && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{p.name}</div>
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">{children}</div>
      </div>
      <style>{`
        .btn-primary { display:inline-flex; align-items:center; gap:4px; border-radius:9999px; background:hsl(var(--primary)); color:hsl(var(--primary-foreground)); padding:4px 10px; font-size:11px; font-weight:600; }
        .btn-primary:hover { opacity:.9; }
        .btn-ghost { display:inline-flex; align-items:center; gap:4px; border-radius:9999px; background:hsl(var(--muted)); color:hsl(var(--foreground)); padding:4px 10px; font-size:11px; font-weight:600; }
        .btn-ghost:hover { background:hsl(var(--accent)); }
      `}</style>
    </div>
  );
}

function Empty({ icon: Icon, text }: { icon: typeof Users; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/50 p-10 text-center">
      <Icon className="mx-auto h-7 w-7 text-muted-foreground/60" />
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-3"
        >
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
