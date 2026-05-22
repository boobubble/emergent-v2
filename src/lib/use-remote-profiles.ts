import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  status: string;
}

function toUser(p: RemoteProfile): User {
  return {
    id: p.id,
    name: p.username,
    avatarColor: p.avatar_color,
    avatarUrl: p.avatar_url ?? undefined,
    status: (p.status as User["status"]) || "online",
    bio: p.bio ?? undefined,
    xp: p.xp,
    level: p.level,
    coins: p.coins,
  };
}

/** Fetches all profiles from the shared directory and keeps them live via realtime. */
export function useRemoteProfiles() {
  const [profiles, setProfiles] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, bio, avatar_url, avatar_color, xp, level, coins, status")
        .order("username", { ascending: true });
      if (cancelled) return;
      if (error) { setLoading(false); return; }
      const map: Record<string, User> = {};
      (data ?? []).forEach(p => { map[p.id] = toUser(p as RemoteProfile); });
      setProfiles(map);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel(`profiles-directory-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
        setProfiles(prev => {
          const next = { ...prev };
          if (payload.eventType === "DELETE") {
            const id = (payload.old as { id: string }).id;
            delete next[id];
          } else {
            const row = payload.new as RemoteProfile;
            next[row.id] = toUser(row);
          }
          return next;
        });
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, []);

  return { profiles, loading };
}
