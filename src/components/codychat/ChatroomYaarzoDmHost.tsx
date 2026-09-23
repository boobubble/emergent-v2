import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { useChat } from "@/lib/chat-store";
import { resolveDmTargetId } from "@/lib/dm-utils";
import { isGuestDmPeer } from "@/lib/guest-dm-utils";
import {
  YAARZO_OPEN_DM_INBOX_EVENT,
  YAARZO_OPEN_MINI_DM_EVENT,
} from "@/lib/yaarzo-dm-events";

const FeedDMDock = lazy(() =>
  import("@/components/feed/FeedDMDock").then((m) => ({ default: m.FeedDMDock })),
);

/**
 * Chatroom-scoped Yaarzo DM surface — reuses FeedDMDock + chat-store (same as /feed).
 * Listens for inbox + palrgo:openMiniDM so notifications and sidebar can open DMs.
 */
export function ChatroomYaarzoDmHost() {
  const { user } = useAuth();
  if (!user?.id || user.isGuest) return null;
  return <ChatroomYaarzoDmHostInner meId={user.id} />;
}

function ChatroomYaarzoDmHostInner({ meId }: { meId: string }) {
  const { profiles } = useRemoteProfiles();
  const { startDM } = useChat();
  const [dockKey, setDockKey] = useState(0);
  const [dockVisible, setDockVisible] = useState(false);

  const showDock = useCallback(() => {
    setDockVisible(true);
    setDockKey((k) => k + 1);
  }, []);

  useEffect(() => {
    function onInbox() {
      showDock();
    }

    function onMiniDm(e: Event) {
      const peerId = (e as CustomEvent<{ peerId?: string }>).detail?.peerId;
      if (!peerId || peerId === "me") return;
      showDock();
      if (isGuestDmPeer(peerId)) {
        startDM(peerId);
        return;
      }
      const target = resolveDmTargetId(peerId, profiles) ?? peerId;
      startDM(target);
    }

    window.addEventListener(YAARZO_OPEN_DM_INBOX_EVENT, onInbox);
    window.addEventListener(YAARZO_OPEN_MINI_DM_EVENT, onMiniDm);
    return () => {
      window.removeEventListener(YAARZO_OPEN_DM_INBOX_EVENT, onInbox);
      window.removeEventListener(YAARZO_OPEN_MINI_DM_EVENT, onMiniDm);
    };
  }, [profiles, showDock, startDM]);

  if (!dockVisible) return null;

  return (
    <Suspense fallback={null}>
      <FeedDMDock key={dockKey} meId={meId} profiles={profiles} initialOpen={true} />
    </Suspense>
  );
}
