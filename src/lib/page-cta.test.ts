import { describe, it, expect, beforeAll } from "vitest";
import { buildPageCtaHtml, DEFAULT_PAGE_CTA_DEFAULTS, sanitizeCtaHref } from "@/lib/page-cta";
import { ALLOWED_PAGE_CONTENT_CLASSES } from "@/lib/page-content-paste";
import { sanitizeHtml } from "@/lib/pages-io";

describe("buildPageCtaHtml", () => {
  it("builds primary CTA with defaults", () => {
    const html = buildPageCtaHtml({
      buttonText: "Start Chatting Now",
      href: "/chatrooms",
      note: "Free to explore • Join when you are ready",
      style: "primary",
    });
    expect(html).toContain('class="custom-page-cta"');
    expect(html).toContain('class="custom-page-cta-button"');
    expect(html).toContain('class="custom-page-cta-note"');
    expect(html).toContain('href="/chatrooms"');
    expect(html).toContain("Start Chatting Now");
    expect(html).not.toContain("custom-page-cta-secondary");
  });

  it("builds secondary CTA style", () => {
    const html = buildPageCtaHtml({
      buttonText: "Learn More",
      href: "/welcome",
      note: "No signup required",
      style: "secondary",
    });
    expect(html).toContain("custom-page-cta-button custom-page-cta-secondary");
  });

  it("adds target blank and rel for external new-tab links", () => {
    const html = buildPageCtaHtml({
      buttonText: "Visit",
      href: "https://example.com",
      openInNewTab: true,
    });
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("includes aria-hidden arrow span", () => {
    const html = buildPageCtaHtml(DEFAULT_PAGE_CTA_DEFAULTS);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("→");
  });

  it("rejects javascript hrefs via sanitizeCtaHref", () => {
    expect(sanitizeCtaHref("javascript:alert(1)")).toBe(DEFAULT_PAGE_CTA_DEFAULTS.href);
  });
});

describe("sanitizeHtml CTA allow-list", () => {
  beforeAll(() => {
    for (const cls of [
      "custom-page-cta",
      "custom-page-cta-button",
      "custom-page-cta-note",
      "custom-page-cta-secondary",
    ]) {
      expect(ALLOWED_PAGE_CONTENT_CLASSES.has(cls)).toBe(true);
    }
  });

  it("preserves approved CTA classes", () => {
    const raw = buildPageCtaHtml({
      buttonText: "Go",
      href: "/chatrooms",
      note: "Note",
      style: "secondary",
      openInNewTab: true,
    });
    const safe = sanitizeHtml(raw);
    expect(safe).toContain('class="custom-page-cta"');
    expect(safe).toContain("custom-page-cta-secondary");
    expect(safe).toContain('rel="noopener noreferrer"');
  });

  it("strips unsafe classes and inline styles", () => {
    const raw = [
      '<div class="custom-page-cta evil-class" style="background:red">',
      '<a href="/chatrooms" class="custom-page-cta-button onclick-hook" style="color:red">',
      "<span>Go</span></a></div>",
    ].join("");
    const safe = sanitizeHtml(raw);
    expect(safe).toContain("custom-page-cta");
    expect(safe).toContain("custom-page-cta-button");
    expect(safe).not.toContain("evil-class");
    expect(safe).not.toContain("onclick-hook");
    expect(safe).not.toContain("style=");
  });

  it("preserves existing callout classes", () => {
    const raw = '<div class="callout callout-info"><p>Hi</p></div>';
    const safe = sanitizeHtml(raw);
    expect(safe).toContain("callout callout-info");
  });
});
