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

  it("strips embeddable URL only when YouTube embedding is enabled", () => {
    expect(stripEmbeddableUrlFromText(YT, mediaYoutubeOn)).toBe("");
    expect(stripEmbeddableUrlFromText(YT, mediaAllOff)).toBe(YT);
    expect(stripEmbeddableUrlFromText(`Cool vid ${YT} !`, mediaYoutubeOn)).toBe("Cool vid !");
  });

  it("keeps text when embed cannot render", () => {
    expect(messageDisplayText(YT, mediaAllOff)).toBe(YT);
    expect(messageDisplayText(`Check this video ${YT}`, mediaAllOff)).toBe(`Check this video ${YT}`);
  });

  it("keeps prefix text when YouTube embed is active", () => {
    expect(messageDisplayText(`Check this video ${YT}`, mediaYoutubeOn)).toBe("Check this video");
  });

  it("YouTube-only message never becomes empty when embed is disabled", () => {
    expect(messageDisplayText(YT, mediaAllOff)).toBe(YT);
    expect(resolveActiveMediaEmbed(YT, mediaAllOff).willRender).toBe(false);
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

describe("MediaEmbed lazy player wiring", () => {
  const mediaEmbed = readFileSync(resolve(process.cwd(), "src/components/chat/MediaEmbed.tsx"), "utf8");
  const messageList = readFileSync(resolve(process.cwd(), "src/components/chat/MessageList.tsx"), "utf8");
  const inlineImage = readFileSync(resolve(process.cwd(), "src/components/chat/InlineImageAttachment.tsx"), "utf8");

  it("lazy-loads YouTube iframe on play", () => {
    expect(mediaEmbed).toMatch(/LazyYoutubeEmbed/);
    expect(mediaEmbed).toMatch(/hqdefault\.jpg/);
    expect(mediaEmbed).toMatch(/autoplay=1/);
    expect(mediaEmbed).not.toMatch(/<iframe[\s\S]*src=\{`\$\{host\}\/embed\/\$\{ytId\}`/);
  });

  it("renders inline images with lightbox and native img", () => {
    expect(messageList).toMatch(/InlineImageAttachment/);
    expect(inlineImage).toMatch(/loading="lazy"/);
    expect(inlineImage).toMatch(/Escape/);
    expect(inlineImage).not.toMatch(/<button[\s\S]*<img/);
    expect(inlineImage).toMatch(/onClick=\{\(\) => setLightbox\(true\)\}/);
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
