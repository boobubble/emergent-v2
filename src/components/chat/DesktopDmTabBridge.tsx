import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";

/**
 * Desktop: route legacy `palrgo:openMiniDM` events into top DM tabs.
 * Mobile keeps full-screen DM via startDM inside the event handlers.
 */
export function DesktopDmTabBridge() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { openDmTab } = useChat();

  useEffect(() => {
    if (isMobile || !user?.id) return;

    function onOpen(e: Event) {
      const ce = e as CustomEvent<{ peerId: string }>;
      const peerId = ce.detail?.peerId;
      if (!peerId || peerId === "me") return;
      openDmTab(peerId);
    }

    window.addEventListener("palrgo:openMiniDM", onOpen as EventListener);
    return () => window.removeEventListener("palrgo:openMiniDM", onOpen as EventListener);
  }, [isMobile, user?.id, openDmTab]);

  return null;
}
