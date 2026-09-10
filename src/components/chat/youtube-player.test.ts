import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseYoutubeId } from "@/lib/media-providers-config";
import {
  measureChatComposerClearancePx,
  YOUTUBE_COMPOSER_CLEARANCE_GAP_PX,
} from "./youtube-composer-clearance";
import {
  buildYoutubeEmbedUrl,
  isChatMediaContextPath,
  youtubeEmbedHost,
  youtubeWatchUrl,
} from "./youtube-embed-url";
import {
  closeYouTubePlayerState,
  minimizeYouTubePlayerState,
  openYouTubePlayerState,
  restoreYouTubePlayerState,
  YOUTUBE_PLAYER_INITIAL,
} from "./youtube-player-state";

const YT = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const YT2 = "https://www.youtube.com/watch?v=9bZkp7q19f0";

describe("youtube embed url security", () => {
  it("builds embed URLs only from validated ids and allowlisted hosts", () => {
    const host = youtubeEmbedHost("public");
    expect(buildYoutubeEmbedUrl("dQw4w9WgXcQ", host, { enableJsApi: true })).toMatch(
      /^https:\/\/www\.youtube\.com\/embed\/dQw4w9WgXcQ\?/,
    );
    expect(buildYoutubeEmbedUrl("not-valid", host)).toBeNull();
    expect(buildYoutubeEmbedUrl("dQw4w9WgXcQ", "https://evil.example" as typeof host)).toBeNull();
  });

  it("rejects invalid YouTube URLs via parseYoutubeId", () => {
    expect(parseYoutubeId("javascript:alert(1)")).toBeNull();
    expect(parseYoutubeId("https://evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("watch URLs use youtube.com only", () => {
    expect(youtubeWatchUrl("dQw4w9WgXcQ")).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(youtubeWatchUrl("bad")).toBeNull();
  });
});

describe("youtube player state machine", () => {
  it("opens with one active video and playing intent", () => {
    const next = openYouTubePlayerState(YOUTUBE_PLAYER_INITIAL, {
      videoId: "dQw4w9WgXcQ",
      url: YT,
      title: "Never Gonna Give You Up",
    });
    expect(next.activeVideoId).toBe("dQw4w9WgXcQ");
    expect(next.isPlaying).toBe(true);
    expect(next.isMinimized).toBe(false);
  });

  it("switching video replaces the active session", () => {
    const first = openYouTubePlayerState(YOUTUBE_PLAYER_INITIAL, {
      videoId: "dQw4w9WgXcQ",
      url: YT,
    });
    const minimized = minimizeYouTubePlayerState(first);
    const switched = openYouTubePlayerState(minimized, {
      videoId: "9bZkp7q19f0",
      url: YT2,
    });
    expect(switched.activeVideoId).toBe("9bZkp7q19f0");
    expect(switched.isMinimized).toBe(false);
    expect(switched.currentTime).toBe(0);
  });

  it("minimize preserves active video without clearing playback state", () => {
    const open = openYouTubePlayerState(YOUTUBE_PLAYER_INITIAL, {
      videoId: "dQw4w9WgXcQ",
      url: YT,
    });
    const minimized = minimizeYouTubePlayerState({ ...open, currentTime: 42, duration: 212 });
    expect(minimized.isMinimized).toBe(true);
    expect(minimized.activeVideoId).toBe("dQw4w9WgXcQ");
    expect(minimized.currentTime).toBe(42);
    expect(minimized.isPlaying).toBe(true);
  });

  it("restore expands without resetting video id", () => {
    const minimized = minimizeYouTubePlayerState(
      openYouTubePlayerState(YOUTUBE_PLAYER_INITIAL, {
        videoId: "dQw4w9WgXcQ",
        url: YT,
      }),
    );
    const restored = restoreYouTubePlayerState({ ...minimized, currentTime: 55 });
    expect(restored.isMinimized).toBe(false);
    expect(restored.activeVideoId).toBe("dQw4w9WgXcQ");
    expect(restored.currentTime).toBe(55);
  });

  it("close clears active player state", () => {
    const open = openYouTubePlayerState(YOUTUBE_PLAYER_INITIAL, {
      videoId: "dQw4w9WgXcQ",
      url: YT,
    });
    expect(closeYouTubePlayerState()).toEqual(YOUTUBE_PLAYER_INITIAL);
    expect(open.activeVideoId).toBe("dQw4w9WgXcQ");
  });
});

describe("chat composer clearance", () => {
  it("positions the player above the composer with a gap", () => {
    expect(measureChatComposerClearancePx(900, 820)).toBe(900 - 820 + YOUTUBE_COMPOSER_CLEARANCE_GAP_PX);
    expect(measureChatComposerClearancePx(900, 860)).toBeGreaterThanOrEqual(76);
  });
});

describe("chat media context paths", () => {
  it("keeps player within chatroom and community chat surfaces", () => {
    expect(isChatMediaContextPath("/chatroom")).toBe(true);
    expect(isChatMediaContextPath("/")).toBe(true);
    expect(isChatMediaContextPath("/community/foo/chatrooms/bar")).toBe(true);
    expect(isChatMediaContextPath("/feed")).toBe(false);
    expect(isChatMediaContextPath("/blog")).toBe(false);
  });
});

describe("floating youtube player wiring", () => {
  const root = resolve(process.cwd(), "src/components/chat");
  const mediaEmbed = readFileSync(resolve(root, "MediaEmbed.tsx"), "utf8");
  const chatApp = readFileSync(resolve(process.cwd(), "src/components/chat/ChatApp.tsx"), "utf8");
  const player = readFileSync(resolve(root, "YouTubeFloatingPlayer.tsx"), "utf8");
  const context = readFileSync(resolve(root, "youtube-player-context.tsx"), "utf8");

  it("message preview does not mount iframe before Play", () => {
    expect(mediaEmbed).toMatch(/YoutubePreviewCard/);
    expect(mediaEmbed).toMatch(/openPlayer/);
    expect(mediaEmbed).not.toMatch(/<iframe/);
    expect(mediaEmbed).toMatch(/youtubeThumbnailUrl/);
  });

  it("shared provider is mounted for chatroom and DM surfaces", () => {
    expect(chatApp).toMatch(/YouTubePlayerProvider/);
    expect(context).toMatch(/YouTubeFloatingPlayer/);
    expect(mediaEmbed).toMatch(/useOptionalYouTubePlayer/);
  });

  it("floating player uses official iframe API and single mount", () => {
    expect(player).toMatch(/loadYoutubeIframeApi/);
    expect(player).toMatch(/new YT\.Player/);
    expect(player).toMatch(/Minimize video/);
    expect(player).toMatch(/Close video/);
    expect(player).not.toMatch(/dangerouslySetInnerHTML/);
  });

  it("measures composer clearance instead of fixed desktop bottom offset", () => {
    expect(player).toMatch(/useChatComposerClearance/);
    expect(player).not.toMatch(/sm:bottom-6/);
  });

  it("one-player replace destroys previous controls before open", () => {
    expect(context).toMatch(/playerControlRef\.current\?\.destroy/);
    expect(context).toMatch(/openYouTubePlayerState/);
  });
});
