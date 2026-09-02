import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/lib/chat-store";
import { useAppSettings } from "@/lib/app-settings";
import { isRealPresenceUserId } from "@/lib/presence-ui";

/**
 * Room-scoped presence → compact system lines in the chat stream ONLY.
 * Never popup/toast (the legacy overlay UI was removed intentionally).
 * Does not broadcast across channels. Self + bot events suppressed.
 */

const JOIN_DELAY_MS = 2_500;
const LEAVE_DELAY_MS = 8_000;
const COOLDOWN_MS = 60_000;

interface TrackPayload {
  user_id: string;
  name: string;
}

export function PresenceFeed({ channelId }: { channelId: string }) {
  const { state, isDM, pushPresenceEvent } = useChat();
  const { raw } = useAppSettings();
  const enabled = raw.presence_messages !== false;
  const pushRef = useRef(pushPresenceEvent);
  const meNameRef = useRef(state.me.name);
  pushRef.current = pushPresenceEvent;
  meNameRef.current = state.me.name;

  useEffect(() => {
    if (!enabled) return;
    if (isDM(channelId)) return;

    let cancelled = false;
    let pendingJoin = new Map<string, ReturnType<typeof setTimeout>>();
    let pendingLeave = new Map<string, ReturnType<typeof setTimeout>>();
    const lastJoinAt = new Map<string, number>();
    const lastLeaveAt = new Map<string, number>();
    let knownPresent = new Set<string>();
    let firstSyncDone = false;
    let userId = "anon-" + Math.random().toString(36).slice(2, 9);

    function emit(kind: "join" | "leave", uid: string, name: string) {
      if (cancelled) return;
      if (!isRealPresenceUserId(uid)) return;
      pushRef.current(channelId, kind, name);
    }

    async function start() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user?.id) userId = data.user.id;
      } catch {}
      if (cancelled) return;

      const channel = supabase.channel(`room-presence:${channelId}`, {
        config: { presence: { key: userId } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const stateMap = channel.presenceState<TrackPayload>();
          const presentNow = new Set<string>();
          const nameMap = new Map<string, string>();
          for (const key of Object.keys(stateMap)) {
            const metas = stateMap[key];
            if (!metas || !metas.length) continue;
            const uid = metas[0].user_id || key;
            if (!isRealPresenceUserId(uid)) continue;
            presentNow.add(uid);
            if (metas[0].name) nameMap.set(uid, metas[0].name);
          }

          if (!firstSyncDone) {
            knownPresent = presentNow;
            firstSyncDone = true;
            return;
          }

          presentNow.forEach((uid) => {
            if (uid === userId) return;
            if (knownPresent.has(uid)) {
              const t = pendingLeave.get(uid);
              if (t) { clearTimeout(t); pendingLeave.delete(uid); }
              return;
            }
            if (pendingJoin.has(uid)) return;
            const nm = nameMap.get(uid) || "Someone";
            const t = setTimeout(() => {
              pendingJoin.delete(uid);
              const last = lastJoinAt.get(uid) || 0;
              if (Date.now() - last < COOLDOWN_MS) return;
              lastJoinAt.set(uid, Date.now());
              emit("join", uid, nm);
            }, JOIN_DELAY_MS);
            pendingJoin.set(uid, t);
          });

          knownPresent.forEach((uid) => {
            if (presentNow.has(uid)) return;
            if (uid === userId) return;
            const tj = pendingJoin.get(uid);
            if (tj) { clearTimeout(tj); pendingJoin.delete(uid); }
            if (pendingLeave.has(uid)) return;
            const nameForUid = nameMap.get(uid) || "Someone";
            const t = setTimeout(() => {
              pendingLeave.delete(uid);
              const last = lastLeaveAt.get(uid) || 0;
              if (Date.now() - last < COOLDOWN_MS) return;
              lastLeaveAt.set(uid, Date.now());
              emit("leave", uid, nameForUid);
            }, LEAVE_DELAY_MS);
            pendingLeave.set(uid, t);
          });

          knownPresent = presentNow;
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ user_id: userId, name: meNameRef.current || "Someone" });
          }
        });

      return channel;
    }

    const channelPromise = start();

    return () => {
      cancelled = true;
      pendingJoin.forEach((t) => clearTimeout(t));
      pendingLeave.forEach((t) => clearTimeout(t));
      pendingJoin = new Map();
      pendingLeave = new Map();
      void channelPromise.then((ch) => { if (ch) void supabase.removeChannel(ch); });
    };
  }, [channelId, enabled, isDM]);

  return null;
}
