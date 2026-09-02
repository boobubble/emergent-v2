/**
 * Logged-in / public-app provider graph.
 * Lazy-loaded from the root so guest `/` does not download chat, feed, or
 * notification stores before the marketing H1 paints.
 */
import { useEffect, useState, type ReactNode } from "react";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import "@/styles/app-surfaces.css";
import { ChatProvider, useOptionalChat } from "@/lib/chat-store";
import { useNavigate } from "@tanstack/react-router";
import {
  consumePendingOpenChatRoom,
  OPEN_CHAT_ROOM_EVENT,
} from "@/lib/chat-browser-notifications";
import { FeedPrefsProvider } from "@/lib/feed-prefs";
import { SocialGraphProvider } from "@/lib/use-social-graph";
import { NotificationsProvider } from "@/lib/use-notifications";
import { IgnoreProvider } from "@/lib/ignore-store";
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";
import { LicenseGuard } from "@/components/LicenseGuard";
import { BroadcasterAnnouncementsRunner } from "@/components/broadcaster/BroadcasterAnnouncements";
import { TrioInvitesListener } from "@/components/chat/TrioInvitesListener";
import { HeadFootScripts } from "@/components/HeadFootScripts";
import { AdsAutoLoader } from "@/components/AdSlot";
import { SessionConflictBanner } from "@/components/SessionConflictBanner";
import { FaviconSwitcher } from "@/components/FaviconSwitcher";
import { RealtimeDebugOverlay } from "@/components/RealtimeDebugOverlay";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { usePresenceHeartbeat } from "@/lib/use-presence-heartbeat";
import { useBanGuard } from "@/lib/use-ban-guard";
import { useSessionChangeDetector } from "@/lib/use-session-change-detector";

function ChatRoomNotificationBridge() {
  const chat = useOptionalChat();
  const navigate = useNavigate();
  useEffect(() => {
    const open = (channelId: string) => {
      chat?.setActive(channelId);
      const path = window.location.pathname;
      if (path !== "/chatroom" && path !== "/chat" && path !== "/") {
        void navigate({ to: "/chatroom" });
      }
    };
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<{ channelId?: string }>).detail?.channelId;
      if (id) open(id);
    };
    window.addEventListener(OPEN_CHAT_ROOM_EVENT, onOpen);
    const pending = consumePendingOpenChatRoom();
    if (pending) open(pending);
    return () => window.removeEventListener(OPEN_CHAT_ROOM_EVENT, onOpen);
  }, [chat, navigate]);
  return null;
}

function AuthenticatedHooks({ userId }: { userId: string }) {
  usePresenceHeartbeat();
  useSessionChangeDetector();
  useBanGuard(userId);
  return null;
}

function useSupabaseReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void loadBrowserSupabase()
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, []);
  return ready;
}

export function AuthenticatedAppShell({
  username,
  authUserId,
  isGuest,
  requireChat,
  children,
}: {
  username: string;
  authUserId: string;
  isGuest: boolean;
  requireChat: boolean;
  children: ReactNode;
}) {
  const ready = useSupabaseReady();
  if (!ready) return null;
  const inner = (
    <SocialGraphProvider>
      <NotificationsProvider>
        <FeedPrefsProvider>
          <IgnoreProvider>
            <BroadcasterAnnouncementsRunner />
            <TrioInvitesListener />
            <HeadFootScripts />
            <AdsAutoLoader />
            <SessionConflictBanner />
            <FaviconSwitcher />
            <SubscriptionGate />
            <LicenseGuard />
            <AuthenticatedHooks userId={authUserId} />
            {children}
            <Sonner />
            <RealtimeDebugOverlay />
          </IgnoreProvider>
        </FeedPrefsProvider>
      </NotificationsProvider>
    </SocialGraphProvider>
  );
  if (!requireChat) return inner;
  return (
    <ChatProvider username={username} authUserId={authUserId} isGuest={isGuest}>
      <ChatRoomNotificationBridge />
      {inner}
    </ChatProvider>
  );
}

export function PublicReadOnlyAppShell({ children }: { children: ReactNode }) {
  const ready = useSupabaseReady();
  if (!ready) return null;
  return (
    <ChatProvider username="__public__" authUserId={null} isGuest>
      <SocialGraphProvider>
        <NotificationsProvider>
          <FeedPrefsProvider>
            <IgnoreProvider>{children}</IgnoreProvider>
          </FeedPrefsProvider>
        </NotificationsProvider>
      </SocialGraphProvider>
    </ChatProvider>
  );
}
