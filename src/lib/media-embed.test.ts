import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  firstEmbeddableMediaUrl,
  firstUrlInText,
  stripEmbeddableUrlFromText,
} from "./media-embed-text";
import { parseYoutubeId } from "./media-providers-config";

describe("parseYoutubeId", () => {
  it("supports watch, youtu.be, and shorts URLs", () => {
    expect(parseYoutubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseYoutubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseYoutubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("rejects invalid or malicious ids", () => {
    expect(parseYoutubeId("javascript:alert(1)")).toBeNull();
    expect(parseYoutubeId("https://evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseYoutubeId("https://youtu.be/not-valid-id")).toBeNull();
  });
});

describe("media embed text helpers", () => {
  it("detects first embeddable YouTube URL", () => {
    const text = "Check this https://youtu.be/dQw4w9WgXcQ out";
    expect(firstUrlInText(text)).toBe("https://youtu.be/dQw4w9WgXcQ");
    expect(firstEmbeddableMediaUrl(text)).toBe("https://youtu.be/dQw4w9WgXcQ");
  });

  it("strips embeddable URL from display text", () => {
    const text = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    expect(stripEmbeddableUrlFromText(text)).toBe("");
    expect(stripEmbeddableUrlFromText(`Cool vid ${text} !`)).toBe("Cool vid !");
  });

  it("leaves normal URLs in text", () => {
    const text = "See https://example.com/page";
    expect(firstEmbeddableMediaUrl(text)).toBeNull();
    expect(stripEmbeddableUrlFromText(text)).toBe(text);
  });
});

describe("MediaEmbed lazy player wiring", () => {
  const mediaEmbed = readFileSync(resolve(process.cwd(), "src/components/chat/MediaEmbed.tsx"), "utf8");
  const messageList = readFileSync(resolve(process.cwd(), "src/components/chat/MessageList.tsx"), "utf8");

  it("lazy-loads YouTube iframe on play", () => {
    expect(mediaEmbed).toMatch(/LazyYoutubeEmbed/);
    expect(mediaEmbed).toMatch(/hqdefault\.jpg/);
    expect(mediaEmbed).toMatch(/autoplay=1/);
    expect(mediaEmbed).not.toMatch(/<iframe[\s\S]*src=\{`\$\{host\}\/embed\/\$\{ytId\}`/);
  });

  it("renders inline images with lightbox", () => {
    expect(messageList).toMatch(/InlineImageAttachment/);
    expect(readFileSync(resolve(process.cwd(), "src/components/chat/InlineImageAttachment.tsx"), "utf8"))
      .toMatch(/loading="lazy"/);
    expect(readFileSync(resolve(process.cwd(), "src/components/chat/InlineImageAttachment.tsx"), "utf8"))
      .toMatch(/Escape/);
  });

  it("scrolls once after channel/session hydration", () => {
    expect(messageList).toMatch(/pendingInitialScrollRef/);
    expect(messageList).toMatch(/scrollMessageListToBottom/);
    expect(messageList).toMatch(/stickToBottomRef/);
  });
});
