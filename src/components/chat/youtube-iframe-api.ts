/** Minimal YouTube IFrame Player API surface used by the floating player. */

export const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

export type YtPlayerInstance = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
};

type YtPlayerCtor = new (
  elementId: string | HTMLElement,
  options: {
    height?: string | number;
    width?: string | number;
    videoId?: string;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: (event: { target: YtPlayerInstance }) => void;
      onStateChange?: (event: { data: number; target: YtPlayerInstance }) => void;
      onError?: (event: { data: number }) => void;
    };
  },
) => YtPlayerInstance;

type YtApi = { Player: YtPlayerCtor };

declare global {
  interface Window {
    YT?: YtApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YtApi> | null = null;

export function loadYoutubeIframeApi(): Promise<YtApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube IFrame API requires a browser"));
  }
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube IFrame API failed to initialize"));
    };

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      finish();
    };

    if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const poll = window.setInterval(() => {
        if (window.YT?.Player) {
          window.clearInterval(poll);
          finish();
        }
      }, 50);
      window.setTimeout(() => {
        window.clearInterval(poll);
        if (!window.YT?.Player) reject(new Error("YouTube IFrame API load timeout"));
      }, 15_000);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("YouTube IFrame API script failed to load"));
    document.head.appendChild(script);
  });

  return apiPromise;
}
