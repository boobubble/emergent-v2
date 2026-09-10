import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  firstEmbeddableMediaUrl,
  firstUrlInText,
  messageDisplayText,
  resolveActiveMediaEmbed,
  stripEmbeddableUrlFromText,
} from "./media-embed-text";
import { MEDIA_DEFAULTS, parseYoutubeId } from "./media-providers-config";

const YT = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const YT_SHORT = "https://youtu.be/dQw4w9WgXcQ";
const YT_SHORTS = "https://www.youtube.com/shorts/dQw4w9WgXcQ";

const mediaYoutubeOn = { youtube: { ...MEDIA_DEFAULTS.youtube, enabled: true }, giphy: MEDIA_DEFAULTS.giphy };
const mediaAllOff = MEDIA_DEFAULTS;

describe("parseYoutubeId", () => {
  it("supports watch, youtu.be, and shorts URLs", () => {
    expect(parseYoutubeId(YT)).toBe("dQw4w9WgXcQ");
    expect(parseYoutubeId(YT_SHORT)).toBe("dQw4w9WgXcQ");
    expect(parseYoutubeId(YT_SHORTS)).toBe("dQw4w9WgXcQ");
  });

  it("rejects invalid or malicious ids", () => {
    expect(parseYoutubeId("javascript:alert(1)")).toBeNull();
    expect(parseYoutubeId("https://evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseYoutubeId("https://youtu.be/not-valid-id")).toBeNull();
  });
});

describe("media embed text helpers", () => {
  it("detects first embeddable YouTube URL", () => {
    const text = `Check this ${YT_SHORT} out`;
    expect(firstUrlInText(text)).toBe(YT_SHORT);
    expect(firstEmbeddableMediaUrl(text)).toBe(YT_SHORT);
  });

  it("strips YouTube URL when embed will render (independent of admin picker toggle)", () => {
    expect(stripEmbeddableUrlFromText(YT, mediaYoutubeOn)).toBe("");
    expect(stripEmbeddableUrlFromText(YT, mediaAllOff)).toBe("");
    expect(stripEmbeddableUrlFromText(`Cool vid ${YT} !`, mediaYoutubeOn)).toBe("Cool vid !");
    expect(stripEmbeddableUrlFromText(`Cool vid ${YT} !`, mediaAllOff)).toBe("Cool vid !");
  });

  it("keeps prefix text when YouTube embed is active", () => {
    expect(messageDisplayText(`Check this video ${YT}`, mediaYoutubeOn)).toBe("Check this video");
    expect(messageDisplayText(`Check this video ${YT}`, mediaAllOff)).toBe("Check this video");
  });

  it("YouTube-only message becomes empty when embed renders", () => {
    expect(messageDisplayText(YT, mediaAllOff)).toBe("");
    expect(resolveActiveMediaEmbed(YT, mediaAllOff).willRender).toBe(true);
  });

  it("trims trailing punctuation from pasted URLs", () => {
    const punctuated = `Watch ${YT_SHORT}.`;
    expect(firstUrlInText(punctuated)).toBe(YT_SHORT);
    expect(parseYoutubeId(firstUrlInText(punctuated)!)).toBe("dQw4w9WgXcQ");
  });

  it("leaves normal URLs in text", () => {
    const text = "See https://example.com/page";
    expect(firstEmbeddableMediaUrl(text)).toBeNull();
    expect(stripEmbeddableUrlFromText(text, mediaYoutubeOn)).toBe(text);
  });

  it("strips only supported active media", () => {
    const text = "See https://example.com/page";
    expect(stripEmbeddableUrlFromText(text, mediaYoutubeOn)).toBe(text);
    expect(resolveActiveMediaEmbed(text, mediaYoutubeOn).willRender).toBe(false);
  });
});

describe("MediaEmbed floating player wiring", () => {
  const mediaEmbed = readFileSync(resolve(process.cwd(), "src/components/chat/MediaEmbed.tsx"), "utf8");
  const messageList = readFileSync(resolve(process.cwd(), "src/components/chat/MessageList.tsx"), "utf8");
  const inlineImage = readFileSync(resolve(process.cwd(), "src/components/chat/InlineImageAttachment.tsx"), "utf8");

  it("shows YouTube preview card and opens floating player on Play", () => {
    expect(mediaEmbed).toMatch(/YoutubePreviewCard/);
    expect(mediaEmbed).toMatch(/youtubeThumbnailUrl/);
    expect(mediaEmbed).toMatch(/openPlayer/);
    expect(mediaEmbed).toMatch(/youtubeWatchUrl/);
    expect(mediaEmbed).not.toMatch(/<iframe/);
    expect(mediaEmbed).not.toMatch(/LazyYoutubeEmbed/);
  });

  it("renders inline images with lightbox, scroll lock, and native img", () => {
    expect(messageList).toMatch(/InlineImageAttachment/);
    expect(inlineImage).toMatch(/loading="lazy"/);
    expect(inlineImage).toMatch(/Escape/);
    expect(inlineImage).toMatch(/document\.body\.style\.overflow/);
    expect(inlineImage).toMatch(/createPortal/);
    expect(inlineImage).toMatch(/setLightbox\(true\)/);
    expect(inlineImage).toMatch(/assetId/);
  });

  it("shows image expired placeholder", () => {
    expect(inlineImage).toMatch(/Image expired/);
  });

  it("scrolls once after channel/session hydration", () => {
    expect(messageList).toMatch(/pendingInitialScrollRef/);
    expect(messageList).toMatch(/scrollMessageListToBottom/);
    expect(messageList).toMatch(/stickToBottomRef/);
    expect(messageList).toMatch(/MessageBubbleBody/);
  });
});
