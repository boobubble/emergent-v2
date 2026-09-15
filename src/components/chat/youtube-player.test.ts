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
  it("opens paused by default for Watch Together waiting state", () => {
    const next = openYouTubePlayerState(YOUTUBE_PLAYER_INITIAL, {
      videoId: "dQw4w9WgXcQ",
      url: YT,
      title: "Never Gonna Give You Up",
    });
    expect(next.activeVideoId).toBe("dQw4w9WgXcQ");
    expect(next.isPlaying).toBe(false);
    expect(next.needsUserGesture).toBe(true);
  });

  it("can open with autoplay intent", () => {
    const next = openYouTubePlayerState(YOUTUBE_PLAYER_INITIAL, {
      videoId: "dQw4w9WgXcQ",
      url: YT,
      autoplay: true,
    });
    expect(next.isPlaying).toBe(true);
    expect(next.needsUserGesture).toBe(false);
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
      autoplay: true,
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

describe("watch together DM composer wiring", () => {
  const root = resolve(process.cwd(), "src/components/chat");
  const header = readFileSync(resolve(root, "ChatHeader.tsx"), "utf8");
  const controls = readFileSync(resolve(root, "WatchTogetherControls.tsx"), "utf8");
  const input = readFileSync(resolve(root, "MessageInput.tsx"), "utf8");
  const hook = readFileSync(resolve(process.cwd(), "src/lib/use-watch-together.ts"), "utf8");
  const sync = readFileSync(resolve(process.cwd(), "src/lib/watch-together-sync.ts"), "utf8");

  it("Watch Together is not mounted in ChatHeader", () => {
    expect(header).not.toContain("WatchTogetherControls");
    expect(header).not.toContain("WatchTogetherComposer");
  });

  it("registered DM composer mounts Watch Together shell and TV trigger", () => {
    expect(input).toContain("WatchTogetherComposerShell");
    expect(input).toContain("WatchTogetherComposerButton");
    expect(input).toContain("isRemoteDmChannel");
    expect(controls).toContain("WatchTogetherComposerProvider");
    expect(controls).toContain("Start Watch Together");
  });

  it("sync hook uses host-authoritative payload helpers and waiting flow", () => {
    expect(hook).toContain("WatchSyncPayload");
    expect(hook).toContain("applyingRemoteRef");
    expect(hook).toContain("hostActionInProgressRef");
    expect(hook).toContain("readLocalPositionSeconds");
    expect(hook).toContain("getCurrentTime");
    expect(hook).toContain("expectedFromBroadcast");
    expect(hook).toContain('setPhase("waiting")');
    expect(hook).toContain("WATCH_RT_EVENT_PARTICIPANT_JOINED");
    expect(hook).toContain('broadcastSync("heartbeat")');
    expect(hook).toContain("registerWatchTogetherInviteHandlers");
    expect(hook).toContain("nextSession.channel_id !== inviteChannelId");
    expect(sync).toContain("classifyDrift");
    expect(sync).toContain("computeDriftSeconds");
  });
});

describe("watch together youtube control wiring", () => {
  const root = resolve(process.cwd(), "src/components/chat");
  const player = readFileSync(resolve(root, "YouTubeFloatingPlayer.tsx"), "utf8");
  const context = readFileSync(resolve(root, "youtube-player-context.tsx"), "utf8");
  const hook = readFileSync(resolve(process.cwd(), "src/lib/use-watch-together.ts"), "utf8");

  it("host pause/play call real YouTube player APIs", () => {
    expect(player).toContain("pauseVideo()");
    expect(player).toContain("playVideo()");
    expect(player).toContain("getCurrentTime()");
  });

  it("player init does not recreate iframe when isPlaying toggles", () => {
    expect(player).toMatch(/\[activeVideoId, host, mediaKind\]/);
    expect(player).toContain("Recreate only when the video identity changes");
  });

  it("remote/programmatic control skips local rebroadcast", () => {
    expect(context).toContain("silent?: boolean");
    expect(player).toContain("options?.silent");
    expect(hook).toContain("silent: true");
    expect(hook).toContain("applyingRemoteRef");
  });

  it("heartbeat reads live player time and state", () => {
    expect(hook).toContain("readLocalPlaying");
    expect(hook).toContain('broadcastSync("heartbeat")');
    expect(player).toContain("isPlayerPlaying");
  });

  it("blocks playback during waiting and disables native iframe controls", () => {
    expect(player).toContain("controls: 0");
    expect(player).toContain("canControlPlaybackRef");
    expect(hook).toContain("force-pause-waiting");
    expect(hook).toContain("waitForCinematicMount");
    expect(context).toContain("waitForCinematicMount");
  });

  it("cinematic layout mounts player into inline stage", () => {
    const cinematic = readFileSync(
      resolve(process.cwd(), "src/components/chat/WatchTogetherCinematicLayout.tsx"),
      "utf8",
    );
    const chatApp = readFileSync(resolve(process.cwd(), "src/components/chat/ChatApp.tsx"), "utf8");
    const input = readFileSync(resolve(root, "MessageInput.tsx"), "utf8");
    expect(cinematic).toContain("registerCinematicMount");
    expect(cinematic).toContain("landscapeSplit");
    expect(cinematic).toContain("min-width: 520px");
    expect(cinematic).toContain("max-width: 1024px");
    expect(chatApp).toContain("WatchTogetherCinematicLayout");
    expect(chatApp).toContain("DmWatchTogetherShell");
    expect(chatApp).toContain("WatchTogetherSessionBar");
    expect(input).toContain("useOptionalWatchTogetherComposer");
    expect(player).toContain("data-presentation=");
    expect(player).toContain('presentationMode === "cinematic"');
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
