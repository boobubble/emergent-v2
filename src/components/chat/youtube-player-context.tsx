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
  openUploadPlayerState,
  restoreYouTubePlayerState,
  YOUTUBE_PLAYER_INITIAL,
  type OpenYouTubePlayerInput,
  type OpenUploadPlayerInput,
  type YouTubePlayerSnapshot,
} from "./youtube-player-state";
import { YouTubeFloatingPlayer } from "./YouTubeFloatingPlayer";

export type YouTubePlaybackAction =
  { type: "play" } | { type: "pause" } | { type: "seek"; seconds: number };

export type YouTubePlayerControlPolicy = {
  canControlPlayback: boolean;
  onLocalPlaybackAction?: (action: YouTubePlaybackAction) => void;
};

export type YouTubePlayerContextValue = YouTubePlayerSnapshot & {
  isOpen: boolean;
  openPlayer: (input: OpenYouTubePlayerInput) => void;
  openUploadPlayer: (input: OpenUploadPlayerInput) => void;
  closePlayer: () => void;
  minimizePlayer: () => void;
  restorePlayer: () => void;
  setPlaying: (playing: boolean) => void;
  setMuted: (muted: boolean) => void;
  setTimeline: (currentTime: number, duration: number) => void;
  setPresentationMode: (mode: YouTubePlayerSnapshot["presentationMode"]) => void;
  cinematicVideoMountRef: React.MutableRefObject<HTMLDivElement | null>;
  registerCinematicMount: (el: HTMLDivElement | null) => void;
  cinematicMountReady: boolean;
  waitForCinematicMount: (timeoutMs?: number) => Promise<void>;
  playerControlRef: React.MutableRefObject<YouTubePlayerControls | null>;
  setPlaybackControlPolicy: (policy: YouTubePlayerControlPolicy | null) => void;
  canControlPlayback: boolean;
  reportLocalPlaybackAction: (action: YouTubePlaybackAction) => void;
};

export type YouTubePlayerControlOptions = {
  /** Skip Watch Together local-action reporting (remote/programmatic control). */
  silent?: boolean;
};

export type YouTubePlayerControls = {
  play: (options?: YouTubePlayerControlOptions) => void;
  pause: (options?: YouTubePlayerControlOptions) => void;
  togglePlay: () => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  seek: (seconds: number, options?: YouTubePlayerControlOptions) => void;
  getCurrentTime: () => number;
  isPlayerPlaying: () => boolean;
  requestFullscreen: () => void;
  destroy: () => void;
};

const YouTubePlayerContext = createContext<YouTubePlayerContextValue | null>(null);

export function YouTubePlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<YouTubePlayerSnapshot>(YOUTUBE_PLAYER_INITIAL);
  const playerControlRef = useRef<YouTubePlayerControls | null>(null);
  const cinematicVideoMountRef = useRef<HTMLDivElement | null>(null);
  const [cinematicMountReady, setCinematicMountReady] = useState(false);
  const playbackControlPolicyRef = useRef<YouTubePlayerControlPolicy | null>(null);
  const [playbackControlPolicy, setPlaybackControlPolicyState] =
    useState<YouTubePlayerControlPolicy | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prevPathRef = useRef(pathname);

  const openPlayer = useCallback((input: OpenYouTubePlayerInput) => {
    playerControlRef.current?.destroy();
    playerControlRef.current = null;
    setState((prev) => openYouTubePlayerState(prev, input));
  }, []);

  const openUploadPlayer = useCallback((input: OpenUploadPlayerInput) => {
    playerControlRef.current?.destroy();
    playerControlRef.current = null;
    setState((prev) => openUploadPlayerState(prev, input));
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

  const setPlaybackControlPolicy = useCallback((policy: YouTubePlayerControlPolicy | null) => {
    playbackControlPolicyRef.current = policy;
    setPlaybackControlPolicyState(policy);
  }, []);

  const reportLocalPlaybackAction = useCallback((action: YouTubePlaybackAction) => {
    playbackControlPolicyRef.current?.onLocalPlaybackAction?.(action);
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    setState((prev) => (prev.mediaKind ? { ...prev, isPlaying: playing, needsUserGesture: false } : prev));
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setState((prev) => (prev.activeVideoId ? { ...prev, isMuted: muted } : prev));
  }, []);

  const setTimeline = useCallback((currentTime: number, duration: number) => {
    setState((prev) => (prev.mediaKind ? { ...prev, currentTime, duration } : prev));
  }, []);

  const setPresentationMode = useCallback((mode: YouTubePlayerSnapshot["presentationMode"]) => {
    setState((prev) => (prev.presentationMode === mode ? prev : { ...prev, presentationMode: mode }));
    if (mode !== "cinematic") setCinematicMountReady(false);
  }, []);

  const registerCinematicMount = useCallback((el: HTMLDivElement | null) => {
    cinematicVideoMountRef.current = el;
    setCinematicMountReady(Boolean(el));
  }, []);

  const waitForCinematicMount = useCallback((timeoutMs = 3000) => {
    return new Promise<void>((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (cinematicVideoMountRef.current) {
          resolve();
          return;
        }
        if (Date.now() - started >= timeoutMs) {
          reject(new Error("Watch Together video layout did not mount in time."));
          return;
        }
        window.requestAnimationFrame(tick);
      };
      tick();
    });
  }, []);

  const clearNeedsUserGesture = useCallback(() => {
    setState((prev) => (prev.needsUserGesture ? { ...prev, needsUserGesture: false } : prev));
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
      isOpen: Boolean(state.mediaKind),
      openPlayer,
      openUploadPlayer,
      closePlayer,
      minimizePlayer,
      restorePlayer,
      setPlaying,
      setMuted,
      setTimeline,
      setPresentationMode,
      cinematicVideoMountRef,
      registerCinematicMount,
      cinematicMountReady,
      waitForCinematicMount,
      playerControlRef,
      setPlaybackControlPolicy,
      canControlPlayback: playbackControlPolicy?.canControlPlayback ?? true,
      reportLocalPlaybackAction,
    }),
    [
      state,
      openPlayer,
      openUploadPlayer,
      closePlayer,
      minimizePlayer,
      restorePlayer,
      setPlaying,
      setMuted,
      setTimeline,
      setPresentationMode,
      cinematicMountReady,
      waitForCinematicMount,
      setPlaybackControlPolicy,
      playbackControlPolicy,
      reportLocalPlaybackAction,
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
