import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "@/lib/pages-io";
import { summarizeContentImages } from "@/lib/content-image-seo";
import { parseCmsImageAlign, normalizeCmsImageAlign } from "./cms-image";
import { placeCmsImagesInContent } from "./cms-image-placement";

const KUWAIT_IMG =
  '<img src="https://aofjhfsecwsrcvvvcfcy.supabase.co/storage/v1/object/public/feed-media/x/pages/a.webp" alt="Kuwait chat room on Yaarzo for online conversations and making friends" width="1402" height="1122" data-optimized="true" data-bytes="186910">';

const KUWAIT_LIKE = [
  "<p>Late nights in Kuwait have a rhythm of their own.</p>",
  "<h2>Why a Kuwait Chat Room, Specifically?</h2>",
  "<p>General chat apps are fine.</p>",
  "<h2>Ready When You Are</h2>",
  "<p>There's no big commitment here.</p>",
  '<p><a target="_blank" rel="noopener noreferrer nofollow" class="custom-page-cta-button" href="/chatrooms">Start Chatting Now→</a></p>',
  "<p>Free to explore • Join when you are ready</p>",
  KUWAIT_IMG,
  "<p></p>",
].join("");

const DELHI_LIKE = [
  "<p>Delhi duniya ke sabse purane shehron mein se ek hai.</p>",
  "<h2>Har Kone Ka Apna Rang</h2>",
  "<p>Delhi ka har ilaka apni khud ki identity rakhta hai.</p>",
  "<h2>Sirf Random Chat Nahi</h2>",
  '<img src="https://example.com/delhi.png" alt="delhi chat room">',
  "<p>Delhi is India's capital.</p>",
  "<h2>Ab Shuru Karo</h2>",
  '<p><a class="custom-page-cta-button" href="/chatroom">Start Chatting Now→</a></p>',
  "<p>Free to explore • Join when you are ready</p>",
].join("");

const CHENNAI_LIKE = [
  "<p>Chennai intro paragraph about Marina Beach.</p>",
  "<h2>Local Rooms</h2>",
  '<img src="https://example.com/chennai.png" alt="chennai chat room" data-align="center">',
  "<p>More article text after the image.</p>",
  '<p><a class="custom-page-cta-button" href="/chatroom">Start Chatting Now→</a></p>',
].join("");

describe("placeCmsImagesInContent", () => {
  it("moves a post-CTA image after the lead paragraph without duplicating it", () => {
    const out = placeCmsImagesInContent(KUWAIT_LIKE);
    const imgAt = out.indexOf("<img");
    const h2At = out.indexOf("<h2");
    const ctaAt = out.indexOf("custom-page-cta-button");
    expect(imgAt).toBeGreaterThan(out.indexOf("</p>"));
    expect(imgAt).toBeLessThan(h2At);
    expect(imgAt).toBeLessThan(ctaAt);
    expect(out.match(/<img\b/gi)?.length).toBe(1);
    expect(out).toContain('alt="Kuwait chat room on Yaarzo for online conversations and making friends"');
    expect(out).toContain('data-optimized="true"');
    expect(out).toContain('data-bytes="186910"');
    expect(out.endsWith(KUWAIT_IMG)).toBe(false);
    expect(placeCmsImagesInContent(out)).toBe(out);
  });

  it("leaves an in-article image where it already is", () => {
    expect(placeCmsImagesInContent(DELHI_LIKE)).toBe(DELHI_LIKE);
    expect(placeCmsImagesInContent(CHENNAI_LIKE)).toBe(CHENNAI_LIKE);
  });

  it("does not append a second copy after related links", () => {
    const withRelated = `${KUWAIT_LIKE}\n<p>Related on Yaarzo: <a href="/india-chat-room">India</a>.</p>`;
    const out = placeCmsImagesInContent(withRelated);
    expect(out.match(/<img\b/gi)?.length).toBe(1);
    expect(out.indexOf("<img")).toBeLessThan(out.indexOf("custom-page-cta-button"));
    expect(out).toContain("Related on Yaarzo");
  });

  it("keeps image SEO status and sanitizer attrs after placement", () => {
    const placed = placeCmsImagesInContent(KUWAIT_LIKE);
    const safe = sanitizeHtml(placed);
    expect(safe).toContain('alt="Kuwait chat room on Yaarzo for online conversations and making friends"');
    expect(safe).toContain('data-optimized="true"');
    expect(safe).toContain('data-bytes="186910"');
    const status = summarizeContentImages(safe, "");
    expect(status.kind).toBe("ready");
    expect(status.total).toBe(1);
  });

  it("preserves explicit left alignment on an in-article image", () => {
    const html =
      '<p>Lead.</p><img src="https://example.com/a.webp" alt="room" data-align="left"><h2>Next</h2><p>Body</p>';
    expect(placeCmsImagesInContent(html)).toBe(html);
    expect(sanitizeHtml(html)).toContain('data-align="left"');
  });

  it("preserves lazy and eager loading attributes", () => {
    const html =
      '<p>Lead.</p><img src="https://example.com/a.webp" alt="room" loading="eager"><h2>Next</h2><img src="https://example.com/b.webp" alt="later" loading="lazy">';
    const out = placeCmsImagesInContent(html);
    expect(out).toBe(html);
    const safe = sanitizeHtml(out);
    expect(safe).toContain('loading="eager"');
    expect(safe).toContain('loading="lazy"');
  });
});

describe("cms image align", () => {
  it("defaults to center and keeps explicit left/right", () => {
    expect(normalizeCmsImageAlign(undefined)).toBe("center");
    expect(parseCmsImageAlign("", null)).toBe("center");
    expect(parseCmsImageAlign("custom-page-img custom-page-img-left", null)).toBe("left");
    expect(parseCmsImageAlign("", "right")).toBe("right");
    const centered = sanitizeHtml(
      '<img src="https://example.com/a.webp" alt="room" data-align="center" class="custom-page-img custom-page-img-center">',
    );
    expect(centered).toContain('data-align="center"');
    expect(centered).toContain("custom-page-img-center");
  });
});
