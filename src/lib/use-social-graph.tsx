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
import { Check, UserMinus, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import type { FeedFriendship } from "@/lib/feed-types";

export type FriendshipRelation =
  | "self" | "none" | "friends" | "pending_out" | "pending_in" | "blocked_out" | "blocked_in";

export type FriendshipAction =
  | "sent" | "accepted" | "already_friends" | "already_sent"
  | "rejected" | "cancelled" | "unfriended" | "blocked" | "unblocked";

export type SocialMutationResult =
  | { ok: true; action: FriendshipAction }
  | { ok: false; error: string; code?: string };

export type FollowMutationResult =
  | { ok: true; following: boolean }
  | { ok: false; error: string; code?: string };

function findFriendshipRow(friendships: FeedFriendship[], meId: string, otherId: string) {
  return friendships.find(
    (f) =>
      (f.sender_id === meId && f.receiver_id === otherId) ||
      (f.sender_id === otherId && f.receiver_id === meId),
  );
}

export function getFriendshipRelation(
  friendships: FeedFriendship[],
  meId: string,
  otherId: string,
): FriendshipRelation {
  if (!meId || !otherId || meId === otherId) return "self";
  const row = findFriendshipRow(friendships, meId, otherId);
  if (!row) return "none";
  if (row.status === "accepted") return "friends";
  if (row.status === "blocked") return row.sender_id === meId ? "blocked_out" : "blocked_in";
  if (row.status === "pending") return row.sender_id === meId ? "pending_out" : "pending_in";
  return "none";
}

async function loadFriendships(meId: string) {
  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .or(`sender_id.eq.${meId},receiver_id.eq.${meId}`);
  if (error) return { data: [] as FeedFriendship[], error: error.message };
  return { data: (data ?? []) as FeedFriendship[], error: null as string | null };
}

export async function sendFriendRequest(
  meId: string,
  otherId: string,
  friendships: FeedFriendship[],
): Promise<SocialMutationResult> {
  if (!meId || !otherId) return { ok: false, error: "Missing user" };
  if (meId === otherId) return { ok: false, error: "You cannot friend yourself" };
  const row = findFriendshipRow(friendships, meId, otherId);
  if (row?.status === "accepted") return { ok: true, action: "already_friends" };
  if (row?.status === "blocked") return { ok: false, error: "This user is blocked" };
  if (row?.status === "pending") {
    if (row.receiver_id === meId) {
      const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", row.id);
      if (error) return { ok: false, error: error.message, code: error.code };
      return { ok: true, action: "accepted" };
    }
    return { ok: true, action: "already_sent" };
  }
  const { error } = await supabase.from("friendships").insert({ sender_id: meId, receiver_id: otherId, status: "pending" });
  if (error) {
    if (error.code === "23505") return { ok: true, action: "already_sent" };
    return { ok: false, error: error.message, code: error.code };
  }
  return { ok: true, action: "sent" };
}

export async function acceptFriendRequest(rowId: string): Promise<SocialMutationResult> {
  const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", rowId);
  if (error) return { ok: false, error: error.message, code: error.code };
  return { ok: true, action: "accepted" };
}

export async function rejectFriendRequest(rowId: string): Promise<SocialMutationResult> {
  const { error } = await supabase.from("friendships").delete().eq("id", rowId);
  if (error) return { ok: false, error: error.message, code: error.code };
  return { ok: true, action: "rejected" };
}

export async function cancelFriendRequest(rowId: string): Promise<SocialMutationResult> {
  const { error } = await supabase.from("friendships").delete().eq("id", rowId);
  if (error) return { ok: false, error: error.message, code: error.code };
  return { ok: true, action: "cancelled" };
}

export async function unfriend(
  meId: string,
  otherId: string,
  friendships: FeedFriendship[],
): Promise<SocialMutationResult> {
  const row = findFriendshipRow(friendships, meId, otherId);
  if (!row || row.status !== "accepted") return { ok: false, error: "Not friends" };
  const { error } = await supabase.from("friendships").delete().eq("id", row.id);
  if (error) return { ok: false, error: error.message, code: error.code };
  return { ok: true, action: "unfriended" };
}

export async function blockUserSocial(
  meId: string,
  otherId: string,
  friendships: FeedFriendship[],
): Promise<SocialMutationResult> {
  const existing = findFriendshipRow(friendships, meId, otherId);
  if (existing) {
    const { error: delErr } = await supabase.from("friendships").delete().eq("id", existing.id);
    if (delErr) return { ok: false, error: delErr.message, code: delErr.code };
  }
  const { error } = await supabase.from("friendships").insert({ sender_id: meId, receiver_id: otherId, status: "blocked" });
  if (error) return { ok: false, error: error.message, code: error.code };
  return { ok: true, action: "blocked" };
}

export async function unblockUserSocial(
  meId: string,
  otherId: string,
  friendships: FeedFriendship[],
): Promise<SocialMutationResult> {
  const row = findFriendshipRow(friendships, meId, otherId);
  if (!row || row.status !== "blocked" || row.sender_id !== meId) return { ok: false, error: "Not blocked" };
  const { error } = await supabase.from("friendships").delete().eq("id", row.id);
  if (error) return { ok: false, error: error.message, code: error.code };
  return { ok: true, action: "unblocked" };
}

function acceptedFriendIds(friendships: FeedFriendship[], meId: string): Set<string> {
  const ids = new Set<string>();
  for (const f of friendships) {
    if (f.status !== "accepted") continue;
    ids.add(f.sender_id === meId ? f.receiver_id : f.sender_id);
  }
  return ids;
}

export async function loadFollowingIds(meId: string) {
  const { data, error } = await supabase.from("poetry_writer_follows").select("writer_id").eq("follower_id", meId);
  if (error) return { ids: new Set<string>(), error: error.message };
  return { ids: new Set((data ?? []).map((r) => r.writer_id)), error: null as string | null };
}

export async function followWriterClient(meId: string, writerId: string): Promise<FollowMutationResult> {
  if (!meId || !writerId) return { ok: false, error: "Missing user" };
  if (meId === writerId) return { ok: false, error: "You cannot follow yourself" };
  const { error } = await supabase.from("poetry_writer_follows").insert({ follower_id: meId, writer_id: writerId });
  if (error) {
    if (error.code === "23505") return { ok: true, following: true };
    return { ok: false, error: error.message, code: error.code };
  }
  return { ok: true, following: true };
}

export async function unfollowWriterClient(meId: string, writerId: string): Promise<FollowMutationResult> {
  const { error } = await supabase.from("poetry_writer_follows").delete().eq("follower_id", meId).eq("writer_id", writerId);
  if (error) return { ok: false, error: error.message, code: error.code };
  return { ok: true, following: false };
}

async function loadWriterFollowCounts(userId: string) {
  const { data, error } = await supabase
    .from("mehfil_writer_stats")
    .select("followers_count,following_count")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { followers: 0, following: 0, error: error.message };
  return { followers: data?.followers_count ?? 0, following: data?.following_count ?? 0, error: null as string | null };
}

type SocialGraphContextValue = {
  meId: string;
  friendships: FeedFriendship[];
  friendshipsLoaded: boolean;
  friendIds: Set<string>;
  followingIds: Set<string>;
  followingLoaded: boolean;
  getRelation: (otherId: string) => FriendshipRelation;
  isFollowing: (writerId: string) => boolean;
  refreshFriendships: () => Promise<void>;
  refreshFollowing: () => Promise<void>;
  sendFriendRequest: (otherId: string) => Promise<SocialMutationResult>;
  acceptRequest: (rowId: string) => Promise<SocialMutationResult>;
  rejectRequest: (rowId: string) => Promise<SocialMutationResult>;
  cancelRequest: (rowId: string) => Promise<SocialMutationResult>;
  unfriendUser: (otherId: string) => Promise<SocialMutationResult>;
  blockUser: (otherId: string) => Promise<SocialMutationResult>;
  unblockUser: (otherId: string) => Promise<SocialMutationResult>;
  followWriter: (writerId: string) => Promise<FollowMutationResult>;
  unfollowWriter: (writerId: string) => Promise<FollowMutationResult>;
  getWriterFollowCounts: (userId: string) => Promise<{ followers: number; following: number }>;
};

const SocialGraphContext = createContext<SocialGraphContextValue | null>(null);

export function SocialGraphProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const meId = user?.id ?? "";
  const [friendships, setFriendships] = useState<FeedFriendship[]>([]);
  const [friendshipsLoaded, setFriendshipsLoaded] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followingLoaded, setFollowingLoaded] = useState(false);
  const friendshipsRef = useRef(friendships);
  friendshipsRef.current = friendships;

  const refreshFriendships = useCallback(async () => {
    if (!meId) {
      setFriendships([]);
      setFriendshipsLoaded(false);
      return;
    }
    const { data, error } = await loadFriendships(meId);
    if (error) console.error("friendships load failed:", error);
    setFriendships(data);
    setFriendshipsLoaded(true);
  }, [meId]);

  const refreshFollowing = useCallback(async () => {
    if (!meId) {
      setFollowingIds(new Set());
      setFollowingLoaded(false);
      return;
    }
    const { ids, error } = await loadFollowingIds(meId);
    if (error) console.error("writer follows load failed:", error);
    setFollowingIds(ids);
    setFollowingLoaded(true);
  }, [meId]);

  useEffect(() => {
    if (!meId || user?.isGuest) {
      setFriendships([]);
      setFriendshipsLoaded(!meId ? false : true);
      setFollowingIds(new Set());
      setFollowingLoaded(!meId ? false : true);
      return;
    }
    let cancelled = false;
    void refreshFriendships();
    const ch = supabase
      .channel(`social-friendships-${meId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships", filter: `sender_id=eq.${meId}` }, () => { if (!cancelled) void refreshFriendships(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships", filter: `receiver_id=eq.${meId}` }, () => { if (!cancelled) void refreshFriendships(); })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [meId, user?.isGuest, refreshFriendships]);

  useEffect(() => {
    if (!meId || user?.isGuest) return;
    let cancelled = false;
    void refreshFollowing();
    const ch = supabase
      .channel(`social-writer-follows-${meId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "poetry_writer_follows", filter: `follower_id=eq.${meId}` }, () => { if (!cancelled) void refreshFollowing(); })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [meId, user?.isGuest, refreshFollowing]);

  const friendIds = useMemo(() => acceptedFriendIds(friendships, meId), [friendships, meId]);

  const value = useMemo<SocialGraphContextValue>(() => ({
    meId,
    friendships,
    friendshipsLoaded,
    friendIds,
    followingIds,
    followingLoaded,
    getRelation: (otherId) => getFriendshipRelation(friendshipsRef.current, meId, otherId),
    isFollowing: (writerId) => followingIds.has(writerId),
    refreshFriendships,
    refreshFollowing,
    sendFriendRequest: (otherId) => sendFriendRequest(meId, otherId, friendshipsRef.current),
    acceptRequest: acceptFriendRequest,
    rejectRequest: rejectFriendRequest,
    cancelRequest: cancelFriendRequest,
    unfriendUser: (otherId) => unfriend(meId, otherId, friendshipsRef.current),
    blockUser: (otherId) => blockUserSocial(meId, otherId, friendshipsRef.current),
    unblockUser: (otherId) => unblockUserSocial(meId, otherId, friendshipsRef.current),
    followWriter: (writerId) => followWriterClient(meId, writerId),
    unfollowWriter: (writerId) => unfollowWriterClient(meId, writerId),
    getWriterFollowCounts: async (userId) => {
      const { followers, following, error } = await loadWriterFollowCounts(userId);
      if (error) console.error("writer follow counts failed:", error);
      return { followers, following };
    },
  }), [meId, friendships, friendshipsLoaded, friendIds, followingIds, followingLoaded, refreshFriendships, refreshFollowing]);

  return <SocialGraphContext.Provider value={value}>{children}</SocialGraphContext.Provider>;
}

export function useSocialGraph(): SocialGraphContextValue {
  const ctx = useContext(SocialGraphContext);
  if (!ctx) throw new Error("useSocialGraph must be used within SocialGraphProvider");
  return ctx;
}

export function useSocialGraphOptional(): SocialGraphContextValue | null {
  return useContext(SocialGraphContext);
}

export function FriendActionButton({
  targetUserId,
  targetName,
  variant = "default",
  onSuccess,
}: {
  targetUserId: string;
  targetName?: string;
  variant?: "default" | "compact" | "sidebar";
  onSuccess?: () => void;
}) {
  const { meId, friendships, getRelation, sendFriendRequest: send, acceptRequest, rejectRequest, cancelRequest, unfriendUser } = useSocialGraph();
  const [busy, setBusy] = useState(false);
  if (!meId || meId === targetUserId) return null;
  const relation = getRelation(targetUserId);
  const row = findFriendshipRow(friendships, meId, targetUserId);
  const label = targetName ? `@${targetName}` : "user";

  async function run(
    action: () => Promise<{ ok: boolean; error?: string; action?: string }>,
    success: string | ((res: { ok: boolean; action?: string }) => string),
  ) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await action();
      if (!res.ok) { toast.error(res.error ?? "Something went wrong"); return; }
      toast.success(typeof success === "function" ? success(res) : success);
      onSuccess?.();
    } finally { setBusy(false); }
  }

  const compactBtn = "inline-flex min-h-9 items-center justify-center gap-1 rounded-full px-3 text-xs font-semibold transition disabled:opacity-50";
  const defaultBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition disabled:opacity-50";

  if (relation === "blocked_out" || relation === "blocked_in") return null;
  if (relation === "friends") {
    return (
      <button type="button" disabled={busy} onClick={() => void run(() => unfriendUser(targetUserId), `Removed ${label} from friends`)} className={`${variant === "default" ? defaultBtn : compactBtn} border border-border bg-card hover:bg-accent`}>
        <UserMinus className="h-4 w-4 shrink-0" /> Friends
      </button>
    );
  }
  if (relation === "pending_out") {
    return (
      <button type="button" disabled={busy} onClick={() => row && void run(() => cancelRequest(row.id), "Request cancelled")} className={`${variant === "default" ? defaultBtn : compactBtn} border border-border bg-muted text-muted-foreground`}>
        <UserPlus className="h-4 w-4 shrink-0" /> Request sent
      </button>
    );
  }
  if (relation === "pending_in" && row) {
    if (variant === "sidebar") {
      return (
        <div className="flex shrink-0 gap-1">
          <button type="button" disabled={busy} aria-label="Accept" onClick={() => void run(() => acceptRequest(row.id), `You and ${label} are now friends`)} className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-white"><Check className="h-4 w-4" /></button>
          <button type="button" disabled={busy} aria-label="Reject" onClick={() => void run(() => rejectRequest(row.id), "Request declined")} className="grid h-11 w-11 place-items-center rounded-full bg-foreground/[0.06] text-muted-foreground ring-1 ring-inset ring-border/60"><X className="h-4 w-4" /></button>
        </div>
      );
    }
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void run(() => acceptRequest(row.id), `You and ${label} are now friends`)} className={`${defaultBtn} bg-primary text-primary-foreground hover:opacity-90`}><Check className="h-4 w-4 shrink-0" /> Accept</button>
        <button type="button" disabled={busy} onClick={() => void run(() => rejectRequest(row.id), "Request declined")} className={`${compactBtn} border border-border bg-card hover:bg-accent`}><X className="h-4 w-4 shrink-0" /> Decline</button>
      </div>
    );
  }
  return (
    <button type="button" disabled={busy} onClick={() => void run(() => send(targetUserId), (res) => {
      if (res.action === "accepted") return `You and ${label} are now friends`;
      if (res.action === "already_sent") return "Request already sent";
      if (res.action === "already_friends") return `Already friends with ${label}`;
      return `Friend request sent to ${label}`;
    })} className={`${variant === "default" ? defaultBtn : compactBtn} border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20`}>
      <UserPlus className="h-4 w-4 shrink-0" /> Add friend
    </button>
  );
}
