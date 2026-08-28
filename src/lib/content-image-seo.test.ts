import { describe, expect, it } from "vitest";
import {
  evaluateContentImage,
  isSafeContentImageSrc,
  isWeakAltText,
  summarizeContentImages,
} from "./content-image-seo";

describe("content image status", () => {
  it("marks posts with no images as Image Missing", () => {
    const s = summarizeContentImages("<p>Hello</p>", "");
    expect(s.kind).toBe("missing");
    expect(s.total).toBe(0);
    expect(s.label).toBe("Image Missing");
  });

  it("does not mark ready just because an img tag exists", () => {
    const s = summarizeContentImages('<img src="" alt="A cat">');
    expect(s.kind).toBe("attention");
    expect(s.images[0]?.ready).toBe(false);
    expect(s.images[0]?.issues).toContain("missing_src");
  });

  it("marks a valid optimized image with alt as Image Ready", () => {
    const s = summarizeContentImages(
      '<img src="https://yaarzo.com/storage/v1/object/public/feed-media/u/blog/cat.webp" alt="A cat waving from a balcony" width="800" height="500" data-optimized="true">',
    );
    expect(s.kind).toBe("ready");
    expect(s.label).toBe("Image Ready");
    expect(s.readyCount).toBe(1);
  });

  it("treats decorative empty alt as valid", () => {
    const s = summarizeContentImages(
      '<img src="https://yaarzo.com/x.webp" alt="" data-decorative="true" data-optimized="true">',
    );
    expect(s.kind).toBe("ready");
    expect(s.images[0]?.altOk).toBe(true);
  });

  it("needs attention when alt is missing", () => {
    const s = summarizeContentImages(
      '<img src="https://yaarzo.com/x.webp" alt="" data-optimized="true">',
    );
    expect(s.kind).toBe("attention");
    expect(s.images[0]?.issues).toContain("missing_alt");
    expect(s.label).toBe("Image Needs Attention");
  });

  it("needs attention for generic and filename-only alt", () => {
    expect(isWeakAltText("image")).toBe(true);
    expect(isWeakAltText("photo")).toBe(true);
    expect(isWeakAltText("picture")).toBe(true);
    expect(isWeakAltText("img")).toBe(true);
    expect(isWeakAltText("cat.jpg", "https://x/cat.jpg")).toBe(true);
    expect(isWeakAltText("A cat sitting on a windowsill")).toBe(false);
  });

  it("needs attention when optimization is required", () => {
    const s = summarizeContentImages(
      '<img src="https://yaarzo.com/storage/v1/object/public/feed-media/u/pages/hero.png" alt="Lahore chat room skyline at dusk">',
    );
    expect(s.kind).toBe("attention");
    expect(s.images[0]?.issues).toContain("optimization_required");
  });

  it("calculates ready / total for multiple images", () => {
    const html = `
      <img src="https://yaarzo.com/a.webp" alt="Friends chatting on Yaarzo" data-optimized="true">
      <img src="https://yaarzo.com/b.png" alt="photo">
      <img src="https://yaarzo.com/c.webp" alt="A group video call" data-optimized="true">
    `;
    const s = summarizeContentImages(html);
    expect(s.total).toBe(3);
    expect(s.readyCount).toBe(2);
    expect(s.kind).toBe("attention");
    expect(s.label).toBe("2/3 Images Ready");
  });

  it("marks all-ready multi-image copy as X/Y Images Ready", () => {
    const html = `
      <img src="https://yaarzo.com/a.webp" alt="One" data-optimized="true">
      <img src="https://yaarzo.com/b.webp" alt="Two" data-optimized="true">
    `;
    const s = summarizeContentImages(html);
    expect(s.kind).toBe("ready");
    expect(s.label).toBe("2/2 Images Ready");
  });

  it("rejects javascript and other unsafe image sources", () => {
    expect(isSafeContentImageSrc("javascript:alert(1)")).toBe(false);
    expect(isSafeContentImageSrc("data:image/png;base64,abc")).toBe(false);
    expect(evaluateContentImage({ src: "javascript:alert(1)", alt: "x" }).issues).toContain("unsafe_src");
    expect(evaluateContentImage({ src: "javascript:alert(1)", alt: "x" }).ready).toBe(false);
  });

  it("treats webp/avif URLs as optimized without a network fetch", () => {
    const s = summarizeContentImages(
      '<img src="https://yaarzo.com/feed-media/u/blog/hero.webp" alt="Karachi chat room cover">',
    );
    expect(s.images[0]?.optimization).toBe("ok");
    expect(s.kind).toBe("ready");
  });
});
