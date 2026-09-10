export type YouTubePlayerSnapshot = {
  activeVideoId: string | null;
  activeVideoUrl: string | null;
  title: string | null;
  isPlaying: boolean;
  isMuted: boolean;
  isMinimized: boolean;
  currentTime: number;
  duration: number;
};

export const YOUTUBE_PLAYER_INITIAL: YouTubePlayerSnapshot = {
  activeVideoId: null,
  activeVideoUrl: null,
  title: null,
  isPlaying: false,
  isMuted: false,
  isMinimized: false,
  currentTime: 0,
  duration: 0,
};

export type OpenYouTubePlayerInput = {
  videoId: string;
  url: string;
  title?: string | null;
};

/** One active player: opening a new video replaces the current session. */
export function openYouTubePlayerState(
  prev: YouTubePlayerSnapshot,
  input: OpenYouTubePlayerInput,
): YouTubePlayerSnapshot {
  return {
    ...YOUTUBE_PLAYER_INITIAL,
    activeVideoId: input.videoId,
    activeVideoUrl: input.url,
    title: input.title?.trim() || "YouTube video",
    isPlaying: true,
    isMinimized: false,
  };
}

export function closeYouTubePlayerState(): YouTubePlayerSnapshot {
  return { ...YOUTUBE_PLAYER_INITIAL };
}

export function minimizeYouTubePlayerState(prev: YouTubePlayerSnapshot): YouTubePlayerSnapshot {
  if (!prev.activeVideoId) return prev;
  return { ...prev, isMinimized: true };
}

export function restoreYouTubePlayerState(prev: YouTubePlayerSnapshot): YouTubePlayerSnapshot {
  if (!prev.activeVideoId) return prev;
  return { ...prev, isMinimized: false };
}
