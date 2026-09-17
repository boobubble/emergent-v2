import { useEffect, useRef, useState, type ReactNode } from "react";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import { ircRoomsClientUrl } from "@/lib/irc-rooms";
import { useAuth } from "@/lib/auth-store";
import { useGuestChat } from "@/lib/guest-chat-context";
import type { IrcChatAuth } from "./auth";
import { IrcChatCoreProvider } from "./context";
import {
  computeIrcIdentityKey,
  type IrcGuestSessionSlice,
} from "./irc-runtime-identity";
import { reconcileIrcCore } from "./irc-runtime-lifecycle";
import { IrcChatCore } from "./store";

function buildAuthForIdentity(
  user: { id: string; isGuest?: boolean } | null,
  guestSession: IrcGuestSessionSlice | null,
  resolveToken: () => Promise<string | null>,
): IrcChatAuth | null {
  if (user && !user.isGuest) {
    return {
      kind: "registered",
      resolveToken,
    };
  }

  if (!user && guestSession?.gatewayToken) {
    return {
      kind: "guest",
      guest: {
        visitorId: guestSession.visitorId,
        displayName: guestSession.displayName,
        nickname: guestSession.nickname,
        expiresAt: guestSession.expiresAt ?? "",
        token: guestSession.gatewayToken,
      },
    };
  }

  return null;
}

/**
 * Route-level IRC core lifecycle: one IrcChatCore per stable IRC identity.
 * Fresh JWT per socket via resolveToken ref (registered guests use HMAC bundle).
 */
export function IrcChatRuntimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const guest = useGuestChat();
  const [core, setCore] = useState<IrcChatCore | null>(null);
  const coreRef = useRef<IrcChatCore | null>(null);
  const identityKeyRef = useRef<string | null>(null);

  const resolveTokenImplRef = useRef<() => Promise<string | null>>(async () => null);
  resolveTokenImplRef.current = async () => {
    const supabase = await loadBrowserSupabase();
    const { data, error } = await supabase.auth.refreshSession();
    if (error) return null;
    return data.session?.access_token ?? null;
  };

  const guestIrcSession: IrcGuestSessionSlice | null =
    !user && guest.session?.visitorId && guest.session.gatewayToken
      ? guest.session
      : null;

  const identityKey = computeIrcIdentityKey(user, guestIrcSession);

  const userRef = useRef(user);
  const guestIrcSessionRef = useRef(guestIrcSession);
  userRef.current = user;
  guestIrcSessionRef.current = guestIrcSession;

  useEffect(() => {
    const result = reconcileIrcCore({
      nextIdentityKey: identityKey,
      prevIdentityKey: identityKeyRef.current,
      existingCore: coreRef.current,
      createCore: () => {
        const auth = buildAuthForIdentity(
          userRef.current,
          guestIrcSessionRef.current,
          () => resolveTokenImplRef.current(),
        );
        if (!auth) return null;
        const instance = new IrcChatCore({
          auth,
          roomsUrl: ircRoomsClientUrl(),
        });
        instance.connect();
        void instance.discoverRooms();
        return instance;
      },
      destroyCore: (instance) => {
        instance.disconnect();
      },
    });

    identityKeyRef.current = result.identityKey;
    coreRef.current = result.core;
    setCore(result.core);
  }, [identityKey]);

  useEffect(() => {
    return () => {
      coreRef.current?.disconnect();
      coreRef.current = null;
      identityKeyRef.current = null;
    };
  }, []);

  if (!identityKey || !core) {
    return <>{children}</>;
  }

  return <IrcChatCoreProvider core={core}>{children}</IrcChatCoreProvider>;
}
