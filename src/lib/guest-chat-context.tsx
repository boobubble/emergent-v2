/**
 * Ephemeral guest chat session context for public /chatroom.
 * Clears automatically when a real user signs in.
 */

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
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-store";
import { useAppSettings } from "@/lib/app-settings";
import {
  GUEST_CHAT_DEFAULTS,
  GUEST_CHAT_SETTING_KEY,
  mergeGuestChatConfig,
  type GuestChatConfig,
} from "@/lib/guest-chat-config";
import {
  clearGuestChatSession,
  readGuestChatSession,
  writeGuestChatSession,
  type GuestChatClientSession,
} from "@/lib/visitor-session";
import {
  getGuestChatPublicConfig,
  startGuestChatSession,
} from "@/lib/guest-chat.functions";

export interface OpenGuestNicknameOptions {
  /** After a successful ephemeral session start, go to /chatroom with Lobby. */
  navigateToLobby?: boolean;
}

export interface GuestChatApi {
  config: GuestChatConfig;
  configReady: boolean;
  enabled: boolean;
  session: GuestChatClientSession | null;
  isGuestChatting: boolean;
  nicknameDialogOpen: boolean;
  openNicknameDialog: (opts?: OpenGuestNicknameOptions) => void;
  closeNicknameDialog: () => void;
  startWithNickname: (nickname: string) => Promise<void>;
  endGuestChat: () => void;
  starting: boolean;
  error: string | null;
}

const GuestChatContext = createContext<GuestChatApi | null>(null);

export function GuestChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { raw } = useAppSettings();
  const navigate = useNavigate();
  const fetchPublic = useServerFn(getGuestChatPublicConfig);
  const startFn = useServerFn(startGuestChatSession);
  const navigateToLobbyAfterStartRef = useRef(false);

  const mergedFromSettings = useMemo(
    () => mergeGuestChatConfig((raw as Record<string, unknown> | null)?.[GUEST_CHAT_SETTING_KEY]),
    [raw],
  );

  const publicQ = useQuery({
    queryKey: ["guest-chat-public-config"],
    queryFn: () => fetchPublic(),
    staleTime: 30_000,
    enabled: !user,
  });

  const config: GuestChatConfig = useMemo(() => {
    if (publicQ.data) {
      return mergeGuestChatConfig({ ...GUEST_CHAT_DEFAULTS, ...publicQ.data, enabled: publicQ.data.enabled });
    }
    return mergedFromSettings;
  }, [publicQ.data, mergedFromSettings]);

  const [session, setSession] = useState<GuestChatClientSession | null>(() => readGuestChatSession());
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real login clears ephemeral guest session.
  useEffect(() => {
    if (!user) return;
    clearGuestChatSession();
    setSession(null);
    setNicknameDialogOpen(false);
    navigateToLobbyAfterStartRef.current = false;
  }, [user]);

  // If admin disables guest chat, drop local session.
  useEffect(() => {
    if (config.enabled) return;
    if (!session) return;
    clearGuestChatSession();
    setSession(null);
  }, [config.enabled, session]);

  const openNicknameDialog = useCallback((opts?: OpenGuestNicknameOptions) => {
    setError(null);
    navigateToLobbyAfterStartRef.current = Boolean(opts?.navigateToLobby);
    setNicknameDialogOpen(true);
  }, []);
  const closeNicknameDialog = useCallback(() => {
    navigateToLobbyAfterStartRef.current = false;
    setNicknameDialogOpen(false);
  }, []);

  const endGuestChat = useCallback(() => {
    clearGuestChatSession();
    setSession(null);
    navigateToLobbyAfterStartRef.current = false;
    setNicknameDialogOpen(false);
  }, []);

  const startWithNickname = useCallback(async (nickname: string) => {
    setStarting(true);
    setError(null);
    try {
      const res = await startFn({ data: { nickname } });
      const next: GuestChatClientSession = {
        visitorId: res.visitorId,
        nickname: res.nickname,
        displayName: res.displayName,
        startedAt: Date.now(),
      };
      writeGuestChatSession(next);
      setSession(next);
      setNicknameDialogOpen(false);
      const goLobby = navigateToLobbyAfterStartRef.current;
      navigateToLobbyAfterStartRef.current = false;
      if (goLobby) {
        // ChatProvider defaults activeChannel to "lobby" on public /chatroom.
        void navigate({ to: "/chatroom" });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not start guest chat.";
      setError(msg);
      throw e;
    } finally {
      setStarting(false);
    }
  }, [startFn, navigate]);

  const api = useMemo<GuestChatApi>(() => ({
    config,
    configReady: Boolean(user) || publicQ.isFetched || Boolean(raw),
    enabled: config.enabled && !user,
    session,
    isGuestChatting: Boolean(!user && session && config.enabled),
    nicknameDialogOpen,
    openNicknameDialog,
    closeNicknameDialog,
    startWithNickname,
    endGuestChat,
    starting,
    error,
  }), [
    config, publicQ.isFetched, raw, user, session, nicknameDialogOpen,
    openNicknameDialog, closeNicknameDialog, startWithNickname, endGuestChat, starting, error,
  ]);

  return (
    <GuestChatContext.Provider value={api}>
      {children}
    </GuestChatContext.Provider>
  );
}

export function useGuestChat(): GuestChatApi {
  const ctx = useContext(GuestChatContext);
  if (!ctx) {
    return {
      config: GUEST_CHAT_DEFAULTS,
      configReady: true,
      enabled: false,
      session: null,
      isGuestChatting: false,
      nicknameDialogOpen: false,
  openNicknameDialog: (_opts?: OpenGuestNicknameOptions) => {},
  closeNicknameDialog: () => {},
  startWithNickname: async () => {},
  endGuestChat: () => {},
  starting: false,
  error: null,
    };
  }
  return ctx;
}