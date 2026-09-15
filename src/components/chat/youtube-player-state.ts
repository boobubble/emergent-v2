export type YouTubePlayerPresentation = "floating" | "cinematic";

export type YouTubePlayerSnapshot = {
  activeVideoId: string | null;
  activeVideoUrl: string | null;
  uploadUrl: string | null;
  mediaKind: "youtube" | "upload" | null;
  title: string | null;
  isPlaying: boolean;
  isMuted: boolean;
  isMinimized: boolean;
  currentTime: number;
  duration: number;
  needsUserGesture: boolean;
  presentationMode: YouTubePlayerPresentation;
};

export const YOUTUBE_PLAYER_INITIAL: YouTubePlayerSnapshot = {
  activeVideoId: null,
  activeVideoUrl: null,
  uploadUrl: null,
  mediaKind: null,
  title: null,
  isPlaying: false,
  isMuted: false,
  isMinimized: false,
  currentTime: 0,
  duration: 0,
  needsUserGesture: false,
  presentationMode: "floating",
};

export type OpenYouTubePlayerInput = {
  videoId: string;
  url: string;
  title?: string | null;
  /** When false, player loads paused at 0 (Watch Together waiting state). */
  autoplay?: boolean;
};

export type OpenUploadPlayerInput = {
  url: string;
  title?: string | null;
};

/** One active player: opening a new video replaces the current session. */
export function openYouTubePlayerState(
  prev: YouTubePlayerSnapshot,
  input: OpenYouTubePlayerInput,
): YouTubePlayerSnapshot {
  const autoplay = input.autoplay ?? false;
  return {
    ...YOUTUBE_PLAYER_INITIAL,
    activeVideoId: input.videoId,
    activeVideoUrl: input.url,
    mediaKind: "youtube",
    title: input.title?.trim() || "YouTube video",
    isPlaying: autoplay,
    isMinimized: false,
    needsUserGesture: !autoplay,
  };
}

export function openUploadPlayerState(
  _prev: YouTubePlayerSnapshot,
  input: OpenUploadPlayerInput,
): YouTubePlayerSnapshot {
  return {
    ...YOUTUBE_PLAYER_INITIAL,
    activeVideoId: "upload",
    uploadUrl: input.url,
    mediaKind: "upload",
    title: input.title?.trim() || "Uploaded video",
    isPlaying: false,
    isMinimized: false,
    needsUserGesture: true,
  };
}

export function closeYouTubePlayerState(): YouTubePlayerSnapshot {
  return { ...YOUTUBE_PLAYER_INITIAL };
}

export function minimizeYouTubePlayerState(prev: YouTubePlayerSnapshot): YouTubePlayerSnapshot {
  if (!prev.mediaKind) return prev;
  return { ...prev, isMinimized: true };
}

export function restoreYouTubePlayerState(prev: YouTubePlayerSnapshot): YouTubePlayerSnapshot {
  if (!prev.mediaKind) return prev;
  return { ...prev, isMinimized: false };
}
