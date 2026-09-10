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
import { useRouterState } from "@tanstack/react-router";
import { isChatMediaContextPath } from "./youtube-embed-url";
import {
  closeYouTubePlayerState,
  minimizeYouTubePlayerState,
  openYouTubePlayerState,
  restoreYouTubePlayerState,
  YOUTUBE_PLAYER_INITIAL,
  type OpenYouTubePlayerInput,
  type YouTubePlayerSnapshot,
} from "./youtube-player-state";
import { YouTubeFloatingPlayer } from "./YouTubeFloatingPlayer";

export type YouTubePlayerContextValue = YouTubePlayerSnapshot & {
  isOpen: boolean;
  openPlayer: (input: OpenYouTubePlayerInput) => void;
  closePlayer: () => void;
  minimizePlayer: () => void;
  restorePlayer: () => void;
  setPlaying: (playing: boolean) => void;
  setMuted: (muted: boolean) => void;
  setTimeline: (currentTime: number, duration: number) => void;
  playerControlRef: React.MutableRefObject<YouTubePlayerControls | null>;
};

export type YouTubePlayerControls = {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  seek: (seconds: number) => void;
  requestFullscreen: () => void;
  destroy: () => void;
};

const YouTubePlayerContext = createContext<YouTubePlayerContextValue | null>(null);

export function YouTubePlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<YouTubePlayerSnapshot>(YOUTUBE_PLAYER_INITIAL);
  const playerControlRef = useRef<YouTubePlayerControls | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prevPathRef = useRef(pathname);

  const openPlayer = useCallback((input: OpenYouTubePlayerInput) => {
    playerControlRef.current?.destroy();
    playerControlRef.current = null;
    setState((prev) => openYouTubePlayerState(prev, input));
  }, []);

  const closePlayer = useCallback(() => {
    playerControlRef.current?.destroy();
    playerControlRef.current = null;
    setState(closeYouTubePlayerState());
  }, []);

  const minimizePlayer = useCallback(() => {
    setState((prev) => minimizeYouTubePlayerState(prev));
  }, []);

  const restorePlayer = useCallback(() => {
    setState((prev) => restoreYouTubePlayerState(prev));
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    setState((prev) => (prev.activeVideoId ? { ...prev, isPlaying: playing } : prev));
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setState((prev) => (prev.activeVideoId ? { ...prev, isMuted: muted } : prev));
  }, []);

  const setTimeline = useCallback((currentTime: number, duration: number) => {
    setState((prev) =>
      prev.activeVideoId ? { ...prev, currentTime, duration } : prev,
    );
  }, []);

  useEffect(() => {
    const wasInChat = isChatMediaContextPath(prevPathRef.current);
    const inChat = isChatMediaContextPath(pathname);
    if (wasInChat && !inChat && state.activeVideoId) {
      closePlayer();
    }
    prevPathRef.current = pathname;
  }, [pathname, state.activeVideoId, closePlayer]);

  const value = useMemo<YouTubePlayerContextValue>(
    () => ({
      ...state,
      isOpen: Boolean(state.activeVideoId),
      openPlayer,
      closePlayer,
      minimizePlayer,
      restorePlayer,
      setPlaying,
      setMuted,
      setTimeline,
      playerControlRef,
    }),
    [
      state,
      openPlayer,
      closePlayer,
      minimizePlayer,
      restorePlayer,
      setPlaying,
      setMuted,
      setTimeline,
    ],
  );

  return (
    <YouTubePlayerContext.Provider value={value}>
      {children}
      <YouTubeFloatingPlayer />
    </YouTubePlayerContext.Provider>
  );
}

export function useYouTubePlayer(): YouTubePlayerContextValue {
  const ctx = useContext(YouTubePlayerContext);
  if (!ctx) {
    throw new Error("useYouTubePlayer must be used within YouTubePlayerProvider");
  }
  return ctx;
}

export function useOptionalYouTubePlayer(): YouTubePlayerContextValue | null {
  return useContext(YouTubePlayerContext);
}
