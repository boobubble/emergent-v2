import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rtLog } from "@/lib/realtime-debug";
import type { User } from "@/lib/chat-types";

export interface RemoteProfile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  avatar_color: string;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  longest_streak: number;
  status: string;
  last_seen: string | null;
  gender: string | null;
}

const ONLINE_WINDOW_MS = 75 * 1000; // 75s — slightly longer than 1 missed 25s heartbeat
const PRESENCE_CHANNEL = "online-users-presence";

function toUser(p: RemoteProfile, presentIds: Set<string>, nowMs: number): User {
  const isGuest = /^guest-/i.test(p.username);
  const g = p.gender;
  const gender: User["gender"] | undefined =
    g === "male" || g === "female" || g === "other" ? g : undefined;
  const dbLastSeenMs = p.last_seen ? new Date(p.last_seen).getTime() : undefined;
  const isPresent = presentIds.has(p.id);
  const lastSeenMs = isPresent ? nowMs : dbLastSeenMs;
  const rawStatus = (p.status as User["status"]) || "offline";
  // Realtime presence wins: anyone currently subscribed is online instantly.
  // Otherwise derive from last_seen freshness so stale "online" rows fall off.
  const fresh = lastSeenMs != null && nowMs - lastSeenMs < ONLINE_WINDOW_MS;
  const status: User["status"] = isPresent
    ? "online"
    : rawStatus === "offline"
      ? "offline"
      : fresh
        ? rawStatus
        : "offline";
  return {
    id: p.id,
    name: p.username,
    avatarColor: p.avatar_color,
    avatarUrl: p.avatar_url ?? undefined,
    status,
    bio: p.bio ?? undefined,
    xp: p.xp,
    level: p.level,
    coins: p.coins,
    streak: p.streak ?? 0,
    longestStreak: p.longest_streak ?? 0,
    lastSeen: lastSeenMs,
    isGuest,
    gender,
  };
}

/** Fetches all profiles from the shared directory and keeps them live via realtime
 *  + Supabase Realtime Presence so online/offline reflects instantly. */
export function useRemoteProfiles() {
  const [rawProfiles, setRawProfiles] = useState<Record<string, RemoteProfile>>({});
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load + subscribe to profile row changes.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, bio, avatar_url, avatar_color, xp, level, coins, streak, longest_streak, status, last_seen, gender")
        .order("username", { ascending: true });
      if (cancelled) return;
      if (error) { setLoading(false); return; }
      const map: Record<string, RemoteProfile> = {};
      (data ?? []).forEach(p => { map[p.id] = p as RemoteProfile; });
      setRawProfiles(map);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel(`profiles-directory-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
        setRawProfiles(prev => {
          const next = { ...prev };
          if (payload.eventType === "DELETE") {
            const id = (payload.old as { id: string }).id;
            delete next[id];
          } else {
            const row = payload.new as RemoteProfile;
            next[row.id] = row;
          }
          return next;
        });
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, []);

  // Realtime Presence: anyone subscribed to this channel is considered online.
  useEffect(() => {
    let cancelled = false;
    let presenceChannel: ReturnType<typeof supabase.channel> | null = null;
    let authSub: { unsubscribe: () => void } | null = null;

    async function joinPresence(userId: string) {
      if (presenceChannel) {
        await supabase.removeChannel(presenceChannel);
        presenceChannel = null;
      }
      // In React StrictMode the effect remounts; remove any stale instance
      // with the same topic so .on() doesn't throw "after subscribe()".
      for (const c of supabase.getChannels()) {
        if (c.topic === `realtime:${PRESENCE_CHANNEL}`) {
          await supabase.removeChannel(c);
        }
      }
      const ch = supabase.channel(PRESENCE_CHANNEL, {
        config: { presence: { key: userId } },
      });
      const recompute = () => {
        if (cancelled) return;
        const state = ch.presenceState() as Record<string, unknown[]>;
        setPresentIds(new Set(Object.keys(state)));
      };
      ch.on("presence", { event: "sync" }, recompute)
        .on("presence", { event: "join" }, recompute)
        .on("presence", { event: "leave" }, recompute)
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await ch.track({ online_at: new Date().toISOString() });
          }
        });
      presenceChannel = ch;
    }

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (data.user?.id) await joinPresence(data.user.id);
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.id) void joinPresence(session.user.id);
      });
      authSub = sub.subscription;
    })();

    return () => {
      cancelled = true;
      if (presenceChannel) supabase.removeChannel(presenceChannel);
      authSub?.unsubscribe();
    };
  }, []);

  // Re-derive freshness periodically so stale "online" rows flip to offline
  // without needing another realtime event.
  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 10_000);
    return () => window.clearInterval(id);
  }, []);

  const now = Date.now();
  const profiles: Record<string, User> = {};
  for (const id in rawProfiles) {
    profiles[id] = toUser(rawProfiles[id], presentIds, now);
  }
  // tick is used to trigger recomputation
  void tick;

  return { profiles, loading };
}
