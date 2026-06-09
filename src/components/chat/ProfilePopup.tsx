import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MessageCircle, UserPlus, UserMinus, Ban, ShieldCheck, ExternalLink,
  Crown, Shield, ShieldHalf, Flame, Coins, Trophy, Calendar, Eye, Globe,
  Heart, Activity as ActivityIcon, Award, Sparkles, X, AtSign, BellOff, Bell,
  Gavel, VolumeX, LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useIgnore } from "@/lib/ignore-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { useMyRoles } from "@/lib/use-my-role";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "./Avatar";
import { NameEmojiBadge, CountryFlag, UserKindBadge } from "@/lib/name-emoji";
import { BADGE_MAP, TIER_COLOR } from "@/lib/achievements";
import { banUser, muteUser } from "@/lib/moderation.functions";
import type { Role } from "@/lib/chat-types";

type Tab = "info" | "about" | "friends" | "activity" | "daily";

const ROLE_ICON: Record<Role, React.ReactNode> = {
  owner: <Crown className="h-4 w-4 shrink-0 text-warning" />,
  admin: <Shield className="h-4 w-4 shrink-0 text-primary" />,
  mod: <ShieldHalf className="h-4 w-4 shrink-0 text-primary/70" />,
  member: null,
};

function relTime(ms?: number): string {
  if (!ms) return "—";
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ms).toLocaleDateString();
}

export function ProfilePopup({
  userId,
  open,
  onOpenChange,
}: {
  userId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { state, startDM, addFriend, removeFriend, blockUser, unblockUser, isFriend, isBlocked } = useChat();
  const { isIgnored, toggleIgnoreUser } = useIgnore();
  const { user: authUser } = useAuth();
  const { profiles } = useRemoteProfiles();
  const [tab, setTab] = useState<Tab>("info");
  const [friendCount, setFriendCount] = useState<number | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [recentPosts, setRecentPosts] = useState<{ id: string; text: string; created_at: string; reaction_count: number; comment_count: number }[]>([]);

  const realId = userId === "me" ? authUser?.id ?? "me" : userId;
  const user = state.users[userId] || profiles[realId] || state.users[realId];
  const isMe = userId === "me" || (authUser && realId === authUser.id);
  const friend = !isMe && isFriend(userId);
  const blocked = !isMe && isBlocked(userId);
  const room = state.rooms[state.activeChannel];
  const role: Role = (room?.roles?.[userId] || room?.roles?.[realId] || "member") as Role;
  const currentRoom = room && !state.activeChannel.startsWith("dm:") ? room.name : "N/A";
  const { isModerator } = useMyRoles();
  const isStaff = isModerator && !isMe && !user?.isBot;
  const banFn = useServerFn(banUser);
  const muteFn = useServerFn(muteUser);

  useEffect(() => {
    if (!open || !user || user.isBot) return;
    let cancel = false;
    (async () => {
      if (realId && realId !== "me") {
        const { data: prof } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("id", realId)
          .maybeSingle();
        if (!cancel && prof?.created_at) setMemberSince(new Date(prof.created_at).toLocaleDateString());

        const { count } = await supabase
          .from("friendships")
          .select("*", { count: "exact", head: true })
          .eq("status", "accepted")
          .or(`sender_id.eq.${realId},receiver_id.eq.${realId}`);
        if (!cancel) setFriendCount(count ?? 0);

        const { data: posts } = await supabase
          .from("posts")
          .select("id, text, created_at, reaction_count, comment_count")
          .eq("author_id", realId)
          .eq("privacy", "public")
          .order("created_at", { ascending: false })
          .limit(5);
        if (!cancel) setRecentPosts(posts ?? []);
      }
    })();
    return () => { cancel = true; };
  }, [open, realId, user]);

  // Daily progress (only for self) read from localStorage
  const daily = useMemo(() => {
    if (!isMe || !realId || typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`dc:${realId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { date: string; values?: Record<string, number>; claimed?: Record<string, boolean> };
      const today = new Date();
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      if (parsed.date !== key) return null;
      return parsed;
    } catch { return null; }
  }, [isMe, realId, open]);

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <p className="text-sm text-muted-foreground">User not found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const lastSeenLabel = user.status === "online" ? "Online now" : `Last seen ${relTime(user.lastSeen)}`;
  const tabs: { id: Tab; label: string }[] = [
    { id: "info", label: "Info" },
    { id: "about", label: "About" },
    ...(!user.isBot ? [{ id: "friends" as Tab, label: "Friends" }] : []),
    ...(!user.isBot ? [{ id: "activity" as Tab, label: "Activity" }] : []),
    ...(isMe ? [{ id: "daily" as Tab, label: "Daily" }] : []),
  ];
  const activeTab = tabs.some(t => t.id === tab) ? tab : "info";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border-border bg-card p-0 [&>button.absolute]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header banner */}
        <div className="relative bg-gradient-to-b from-primary/30 via-primary/10 to-transparent px-6 pb-4 pt-8 text-center">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/40 text-muted-foreground hover:bg-background/70 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto">
            <Avatar user={user} size={88} square={false} />
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {user.isBot ? "Bot" : user.isGuest ? "Guest" : "User"}
            {ROLE_ICON[role]}
          </div>
          <h2 className="mt-0.5 flex items-center justify-center gap-1.5 text-xl font-bold">
            {user.name}
            <NameEmojiBadge user={user} />
          </h2>
          {user.bio && <p className="mx-auto mt-1 max-w-[260px] text-xs text-muted-foreground">{user.bio}</p>}

          {/* Quick action chips - fixed height */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            {!user.isBot && (
              <>
                <span className="inline-flex h-6 items-center gap-1 rounded-full bg-yellow-500/15 px-2 text-yellow-500"><Trophy className="h-3.5 w-3.5 shrink-0" /> Lv {user.level}</span>
                <span className="inline-flex h-6 items-center gap-1 rounded-full bg-amber-500/15 px-2 text-amber-400"><Coins className="h-3.5 w-3.5 shrink-0" /> {user.coins ?? 0}</span>
                <span className="inline-flex h-6 items-center gap-1 rounded-full bg-orange-500/15 px-2 text-orange-400"><Flame className="h-3.5 w-3.5 shrink-0" /> {user.streak ?? 0}d</span>
              </>
            )}
            <span className={`inline-flex h-6 items-center gap-1 rounded-full px-2 ${user.status === "online" ? "bg-green-500/15 text-green-400" : "bg-muted-foreground/15 text-muted-foreground"}`}>
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${user.status === "online" ? "bg-green-400" : "bg-muted-foreground/60"}`} />
              {user.status === "online" ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Tabs - fixed height */}
        <div className="flex gap-1 border-b border-border bg-card px-3">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative h-10 w-[68px] shrink-0 text-xs font-semibold transition-colors ${
                tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm sm:max-h-[320px]">
          {activeTab === "info" && (
            <ul className="space-y-2.5">
              <Row icon={<Eye className="h-4 w-4 shrink-0" />} label="Last seen" value={lastSeenLabel} />
              <Row icon={<Globe className="h-4 w-4 shrink-0" />} label="Current room" value={currentRoom} />
              {!user.isBot && (
                <>
                  <Row icon={<Calendar className="h-4 w-4 shrink-0" />} label="Member since" value={memberSince ?? "…"} />
                  <Row icon={<Sparkles className="h-4 w-4 shrink-0" />} label="XP" value={`${user.xp} pts`} />
                  <Row icon={<Heart className="h-4 w-4 shrink-0" />} label="Gender" value={user.gender ? user.gender[0].toUpperCase() + user.gender.slice(1) : "—"} />
                  <Row icon={<Award className="h-4 w-4 shrink-0" />} label="Badges" value={`${(user.badges || []).length}`} />
                </>
              )}
            </ul>
          )}

          {activeTab === "about" && (
            <div className="space-y-3">
              <p className="text-foreground/90">{user.bio || <span className="text-muted-foreground italic">No bio yet.</span>}</p>
              {(user.badges || []).length > 0 && (
                <div>
                  <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Badges</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(user.badges || []).map(id => {
                      const b = BADGE_MAP[id]; if (!b) return null;
                      return (
                        <span key={id} className={`flex items-center gap-1 rounded-full border bg-gradient-to-br px-2 py-0.5 text-[10px] font-semibold ${TIER_COLOR[b.tier]}`} title={b.description}>
                          <span>{b.emoji}</span>{b.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "friends" && (
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{friendCount ?? (user.isBot ? 0 : "…")}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Friends</div>
              <Link
                to="/find-friends"
                onClick={() => onOpenChange(false)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                <UserPlus className="h-3.5 w-3.5" /> Find more friends
              </Link>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-2">
              {recentPosts.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground">No public feed activity yet.</p>
              ) : (
                recentPosts.map(p => (
                  <Link
                    key={p.id}
                    to="/feed"
                    onClick={() => onOpenChange(false)}
                    className="block rounded-xl border border-border bg-white/[0.02] px-3 py-2 hover:bg-white/5"
                  >
                    <p className="line-clamp-2 text-xs text-foreground/90">{p.text || "—"}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                      <span className="inline-flex items-center gap-1"><Heart className="h-2.5 w-2.5" />{p.reaction_count}</span>
                      <span className="inline-flex items-center gap-1"><MessageCircle className="h-2.5 w-2.5" />{p.comment_count}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === "daily" && (
            <DailyProgress data={daily} onClose={() => onOpenChange(false)} />
          )}
        </div>

        {/* Footer actions - fixed sizes */}
        {!isMe && (
          <div className="flex items-center gap-2 border-t border-border bg-card px-4 py-3">
            <button
              onClick={() => { startDM(userId); onOpenChange(false); }}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4 shrink-0" /> Message
            </button>
            {!user.isBot && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("palrgo:mention", { detail: { name: user.name } }));
                  onOpenChange(false);
                }}
                title={`Mention @${user.name} in chat`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
              >
                <AtSign className="h-4 w-4 shrink-0" />
              </button>
            )}
            {!user.isBot && (friend ? (
              <button onClick={() => removeFriend(userId)} className="inline-flex h-10 w-[110px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-card text-xs font-semibold hover:bg-white/5">
                <UserMinus className="h-4 w-4 shrink-0" /> Friends
              </button>
            ) : (
              <button onClick={() => addFriend(userId)} className="inline-flex h-10 w-[110px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20">
                <UserPlus className="h-4 w-4 shrink-0" /> Add
              </button>
            ))}
            {!isMe && (isIgnored(userId, user.isBot) ? (
              <button onClick={() => toggleIgnoreUser(userId)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card hover:bg-white/5" title="Unignore (show messages)">
                <Bell className="h-4 w-4 shrink-0" />
              </button>
            ) : (
              <button onClick={() => toggleIgnoreUser(userId)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-white/5 hover:text-foreground" title="Ignore (hide messages in chat)">
                <BellOff className="h-4 w-4 shrink-0" />
              </button>
            ))}
            {!user.isBot && (blocked ? (
              <button onClick={() => unblockUser(userId)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card hover:bg-white/5" title="Unblock">
                <ShieldCheck className="h-4 w-4 shrink-0" />
              </button>
            ) : (
              <button onClick={() => blockUser(userId)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20" title="Block">
                <Ban className="h-4 w-4 shrink-0" />
              </button>
            ))}
          </div>
        )}
        {isStaff && (
          <div className="flex flex-wrap gap-2 border-t border-border bg-card px-4 py-3">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("palrgo:kick-user", { detail: { userId: realId, channelId: state.activeChannel } }));
                toast.success(`Kicked ${user.name} from this room`);
                onOpenChange(false);
              }}
              className="inline-flex h-9 flex-1 min-w-[80px] items-center justify-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-3 text-xs font-bold text-warning hover:bg-warning/20"
              title="Kick from this room"
            >
              <LogOut className="h-4 w-4" /> Kick
            </button>
            <button
              onClick={async () => {
                try {
                  await muteFn({ data: { user_id: realId, scope: "room", channel_id: state.activeChannel, expires_in_minutes: 60, reason: "Staff mute" } });
                  toast.success(`Muted ${user.name} for 1h`);
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : "Failed to mute");
                }
              }}
              className="inline-flex h-9 flex-1 min-w-[80px] items-center justify-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary/20"
              title="Mute in this room for 1 hour"
            >
              <VolumeX className="h-4 w-4" /> Mute
            </button>
            <button
              onClick={async () => {
                if (!confirm(`Ban ${user.name} for 24 hours?`)) return;
                try {
                  await banFn({ data: { user_id: realId, duration_minutes: 60 * 24, reason: "Staff ban" } });
                  toast.success(`Banned ${user.name} for 24h`);
                  onOpenChange(false);
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : "Failed to ban");
                }
              }}
              className="inline-flex h-9 flex-1 min-w-[80px] items-center justify-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-3 text-xs font-bold text-destructive hover:bg-destructive/20"
              title="Ban for 24 hours"
            >
              <Gavel className="h-4 w-4" /> Ban
            </button>
          </div>
        )}
        {isMe && (
          <div className="flex gap-2 border-t border-border bg-card px-4 py-3">
            <Link
              to="/feed"
              search={{ tab: "account" } as never}
              onClick={() => onOpenChange(false)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4 shrink-0" /> Edit profile
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border/50 pb-2 last:border-0">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </li>
  );
}

function DailyProgress({ data, onClose }: { data: { values?: Record<string, number>; claimed?: Record<string, boolean> } | null; onClose: () => void }) {
  const items = [
    { id: "post", label: "Create a post", emoji: "✍️", goal: 1 },
    { id: "react5", label: "React to 5 posts", emoji: "❤️", goal: 5 },
    { id: "comment3", label: "Comment on 3 posts", emoji: "💬", goal: 3 },
    { id: "friend", label: "Add a friend", emoji: "🤝", goal: 1 },
    { id: "login", label: "Daily login", emoji: "🔥", goal: 1 },
  ];
  const completed = items.filter(i => (data?.values?.[i.id] ?? 0) >= i.goal).length;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-transparent px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <ActivityIcon className="h-3.5 w-3.5" /> Today's progress
        </div>
        <div className="mt-1 text-2xl font-bold">{completed}<span className="text-sm text-muted-foreground"> / {items.length}</span></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completed / items.length) * 100}%` }} />
        </div>
      </div>
      <ul className="space-y-1.5">
        {items.map(i => {
          const v = data?.values?.[i.id] ?? 0;
          const done = v >= i.goal;
          return (
            <li key={i.id} className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.02] px-3 py-2">
              <span className="text-lg">{i.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-semibold ${done ? "text-primary" : "text-foreground"}`}>{i.label}</div>
                <div className="text-[10px] text-muted-foreground">{Math.min(v, i.goal)} / {i.goal}</div>
              </div>
              {done && <Sparkles className="h-3.5 w-3.5 text-primary" />}
            </li>
          );
        })}
      </ul>
      <Link
        to="/feed"
        onClick={onClose}
        className="block rounded-full bg-primary/10 py-2 text-center text-xs font-semibold text-primary hover:bg-primary/20"
      >
        Open feed to earn more
      </Link>
    </div>
  );
}
