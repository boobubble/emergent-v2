import { describe, expect, it } from "vitest";
import { blogHtmlHasBodyH1, sanitizeBlogHtml } from "./blog-sanitize";

describe("sanitizeBlogHtml", () => {
  it("demotes body H1 so the article title remains the only H1", () => {
    const out = sanitizeBlogHtml("<h1>Body title</h1><h2>Section</h2>");
    expect(out).toContain("<h2>Body title</h2>");
    expect(blogHtmlHasBodyH1(out)).toBe(false);
  });

  it("persists image src, alt, and center alignment", () => {
    const raw =
      '<p>Hi</p><img src="https://yaarzo.com/media/cat.jpg" alt="A cat waving" data-align="center" class="yz-blog-img yz-blog-img-center">';
    const out = sanitizeBlogHtml(raw);
    expect(out).toContain('src="https://yaarzo.com/media/cat.jpg"');
    expect(out).toContain('alt="A cat waving"');
    expect(out).toContain('data-align="center"');
    expect(out).toContain("yz-blog-img-center");
  });

  it("keeps left/right alignment classes after sanitize", () => {
    const out = sanitizeBlogHtml(
      '<img src="https://yaarzo.com/a.png" alt="diagram" class="yz-blog-img yz-blog-img-right">',
    );
    expect(out).toContain('data-align="right"');
    expect(out).toContain("yz-blog-img-right");
  });

  it("strips unsafe image attributes and javascript URLs", () => {
    const out = sanitizeBlogHtml(
      `<img src="javascript:alert(1)" onerror="alert(1)" style="x:1" alt="x"><img src="https://yaarzo.com/ok.jpg" alt="ok" onclick="evil()">`,
    );
    expect(out).not.toContain("javascript:");
    expect(out).not.toContain("onerror");
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("style=");
    expect(out).toContain('src="https://yaarzo.com/ok.jpg"');
    expect(out).toContain('alt="ok"');
  });

  it("lazy-loads below-fold images and preserves empty posts", () => {
    const out = sanitizeBlogHtml(
      '<img src="https://yaarzo.com/1.jpg" alt="one"><img src="https://yaarzo.com/2.jpg" alt="two">',
    );
    expect(out).toMatch(/alt="one"[^>]*loading="eager"|loading="eager"[^>]*alt="one"/);
    expect(out).toMatch(/alt="two"[^>]*loading="lazy"|loading="lazy"[^>]*alt="two"/);
    expect(sanitizeBlogHtml("<p>Hello</p>")).toContain("<p>Hello</p>");
  });

  it("keeps optimization and decorative flags", () => {
    const out = sanitizeBlogHtml(
      '<img src="https://yaarzo.com/ok.webp" alt="ok" data-optimized="true" data-bytes="12000" data-decorative="true">',
    );
    expect(out).toContain('data-optimized="true"');
    expect(out).toContain('data-bytes="12000"');
    expect(out).toContain('data-decorative="true"');
  });
});
