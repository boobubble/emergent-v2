import { useEffect, useRef, useState, type ReactNode } from "react";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import { ircRoomsClientUrl } from "@/lib/irc-rooms";
import { useAuth } from "@/lib/auth-store";
import { useGuestChat } from "@/lib/guest-chat-context";
import type { IrcChatAuth } from "./auth";
import { IrcChatCoreProvider } from "./context";
import { IrcChatCore } from "./store";

function buildAuth(
  user: { id: string; isGuest?: boolean } | null,
  guestSession: {
    visitorId: string;
    displayName: string;
    nickname: string;
    expiresAt?: string;
    gatewayToken?: string;
  } | null,
): IrcChatAuth | null {
  if (user && !user.isGuest) {
    return {
      kind: "registered",
      resolveToken: async () => {
        const supabase = await loadBrowserSupabase();
        const { data, error } = await supabase.auth.refreshSession();
        if (error) return null;
        return data.session?.access_token ?? null;
      },
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
 * Route-level IRC core lifecycle: fresh JWT per socket for registered users,
 * guest HMAC bundle from GuestChatProvider for visitors.
 */
export function IrcChatRuntimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const guest = useGuestChat();
  const [core, setCore] = useState<IrcChatCore | null>(null);
  const coreRef = useRef<IrcChatCore | null>(null);

  const guestSession = !user && guest.enabled ? guest.session : null;
  const auth = buildAuth(user, guestSession);

  useEffect(() => {
    if (!auth) {
      coreRef.current?.disconnect();
      coreRef.current = null;
      setCore(null);
      return;
    }

    const instance = new IrcChatCore({
      auth,
      roomsUrl: ircRoomsClientUrl(),
    });

    coreRef.current?.disconnect();
    coreRef.current = instance;
    setCore(instance);
    instance.connect();
    void instance.discoverRooms();

    return () => {
      instance.disconnect();
      if (coreRef.current === instance) {
        coreRef.current = null;
      }
    };
  }, [
    user?.id,
    user?.isGuest,
    guestSession?.visitorId,
    guestSession?.gatewayToken,
    auth?.kind,
  ]);

  if (!auth || !core) {
    return <>{children}</>;
  }

  return <IrcChatCoreProvider core={core}>{children}</IrcChatCoreProvider>;
}
