import { useEffect, useState, useSyncExternalStore } from "react";
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
  country_code: string | null;
  show_country_flag: boolean | null;
  show_guest_badge: boolean | null;
  birthday: string | null;
  hide_birth_year: boolean | null;
  is_bot: boolean | null;
  is_official: boolean | null;
}

const ONLINE_WINDOW_MS = 75 * 1000;
const PRESENCE_CHANNEL = "online-users-presence";

function toUser(p: RemoteProfile, presentIds: Set<string>, nowMs: number): User {
  const isGuest = /^guest-/i.test(p.username);
  const isBot = !!p.is_bot;
  const g = p.gender;
  const gender: User["gender"] | undefined =
    g === "male" || g === "female" || g === "other" ? g : undefined;
  const dbLastSeenMs = p.last_seen ? new Date(p.last_seen).getTime() : undefined;
  const isPresent = presentIds.has(p.id);
  const lastSeenMs = isPresent ? nowMs : dbLastSeenMs;
  const rawStatus = (p.status as User["status"]) || "offline";
  const fresh = lastSeenMs != null && nowMs - lastSeenMs < ONLINE_WINDOW_MS;
  const status: User["status"] = isBot
    ? (rawStatus === "offline" ? "offline" : "online")
    : isPresent
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
    lastSeen: isBot ? nowMs : lastSeenMs,
    isGuest,
    isBot,
    gender,
    countryCode: p.country_code ?? undefined,
    showCountryFlag: p.show_country_flag ?? true,
    showGuestBadge: p.show_guest_badge ?? true,
    birthday: p.birthday ?? undefined,
    hideBirthYear: p.hide_birth_year ?? false,
  };
}

/* ─────────────────────────────────────────────────────────────
 * Module-level singleton store: one fetch + one realtime
 * subscription + one presence channel, shared across all hook
 * instances. Refcounted so it tears down when nothing is mounted.
 * ───────────────────────────────────────────────────────────── */

type Snapshot = {
  rawProfiles: Record<string, RemoteProfile>;
  presentIds: Set<string>;
  loading: boolean;
  tick: number;
};

let snapshot: Snapshot = {
  rawProfiles: {},
  presentIds: new Set(),
  loading: true,
  tick: 0,
};
const listeners = new Set<() => void>();
let refCount = 0;
let profilesChannel: ReturnType<typeof supabase.channel> | null = null;
let presenceChannel: ReturnType<typeof supabase.channel> | null = null;
let authSub: { unsubscribe: () => void } | null = null;
let tickInterval: number | null = null;
let initialized = false;

function emit() {
  for (const l of listeners) l();
}
function setSnap(patch: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...patch };
  emit();
}

async function joinPresence(userId: string) {
  if (presenceChannel) {
    await supabase.removeChannel(presenceChannel);
    presenceChannel = null;
  }
  for (const c of supabase.getChannels()) {
    if (c.topic === `realtime:${PRESENCE_CHANNEL}`) {
      await supabase.removeChannel(c);
    }
  }
  const ch = supabase.channel(PRESENCE_CHANNEL, {
    config: { presence: { key: userId } },
  });
  const recompute = (event: string) => {
    const state = ch.presenceState() as Record<string, unknown[]>;
    const ids = new Set(Object.keys(state));
    setSnap({ presentIds: ids });
    if (event !== "sync") rtLog("presence", event, `${ids.size} online`);
  };
  ch.on("presence", { event: "sync" }, () => recompute("sync"))
    .on("presence", { event: "join" }, () => recompute("join"))
    .on("presence", { event: "leave" }, () => recompute("leave"))
    .subscribe(async (status) => {
      rtLog("ws", status, "presence");
      if (status === "SUBSCRIBED") {
        await ch.track({ online_at: new Date().toISOString() });
      }
    });
  presenceChannel = ch;
}

async function startStore() {
  if (initialized) return;
  initialized = true;

  // Initial fetch.
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, bio, avatar_url, avatar_color, xp, level, coins, streak, longest_streak, status, last_seen, gender, country_code, show_country_flag, show_guest_badge, birthday, hide_birth_year, is_bot, is_official",
    )
    .order("username", { ascending: true });
  if (!error) {
    const map: Record<string, RemoteProfile> = {};
    (data ?? []).forEach((p) => {
      map[p.id] = p as RemoteProfile;
    });
    setSnap({ rawProfiles: map, loading: false });
  } else {
    setSnap({ loading: false });
  }

  // Postgres changes subscription.
  profilesChannel = supabase
    .channel("profiles-directory-singleton")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profiles" },
      (payload) => {
        const next = { ...snapshot.rawProfiles };
        if (payload.eventType === "DELETE") {
          const id = (payload.old as { id: string }).id;
          delete next[id];
        } else {
          const row = payload.new as RemoteProfile;
          next[row.id] = row;
        }
        setSnap({ rawProfiles: next });
      },
    )
    .subscribe((status) => rtLog("ws", status, "profiles-directory"));

  // Presence channel tied to the current auth user.
  const { data: u } = await supabase.auth.getUser();
  if (u.user?.id) await joinPresence(u.user.id);
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user?.id) void joinPresence(session.user.id);
  });
  authSub = sub.subscription;

  // Periodic freshness recompute.
  tickInterval = window.setInterval(() => {
    setSnap({ tick: snapshot.tick + 1 });
  }, 10_000);
}

async function stopStore() {
  initialized = false;
  if (profilesChannel) {
    await supabase.removeChannel(profilesChannel);
    profilesChannel = null;
  }
  if (presenceChannel) {
    await supabase.removeChannel(presenceChannel);
    presenceChannel = null;
  }
  if (authSub) {
    authSub.unsubscribe();
    authSub = null;
  }
  if (tickInterval != null) {
    window.clearInterval(tickInterval);
    tickInterval = null;
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  refCount += 1;
  if (refCount === 1) void startStore();
  return () => {
    listeners.delete(cb);
    refCount -= 1;
    if (refCount === 0) {
      // Defer teardown slightly so rapid remounts (StrictMode, route changes)
      // don't tear down and immediately re-create the subscriptions.
      setTimeout(() => {
        if (refCount === 0) void stopStore();
      }, 1000);
    }
  };
}

function getSnapshot(): Snapshot {
  return snapshot;
}

/** Fetches all profiles from the shared directory and keeps them live via
 *  one shared subscription + Supabase Realtime Presence. Safe to call from
 *  many components — they all share a single underlying channel. */
export function useRemoteProfiles() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now()); // ensure a render after mount with current time
  }, [snap.tick]);

  const now = Date.now();
  const profiles: Record<string, User> = {};
  for (const id in snap.rawProfiles) {
    profiles[id] = toUser(snap.rawProfiles[id], snap.presentIds, now);
  }
  return { profiles, loading: snap.loading };
}
