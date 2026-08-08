/**
 * Regression: real /$slug view must emit H1/body/anchors in server HTML.
 * Fails if content is only available via dehydrated JSON / helpers.
 */
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import React from "react";
import { PublicCmsPageView } from "@/components/PublicCmsPageView";
import {
  composePublicCmsHtml,
  filterUnpublishedCmsLinks,
} from "@/lib/pages-cms/public-links";
import { sanitizeHtml } from "@/lib/pages-io";
import { auditInitialCmsHtml } from "@/lib/pages-cms/public-page-ssr";

const PUBLISHED = "karachi-chat-room";
const DRAFT = "gujranwala-chat-room";

const fixturePage = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "pakistan-chat-room",
  title: "Pakistan Chat Room",
  h1: "Pakistan Chat Room – Free Online Chat",
  intro_content: "<p>Welcome to Pakistan chat on Yaarzo.</p>",
  content: [
    "<h2>About Pakistan Chat</h2>",
    "<p>Talk with people across Pakistan in English or Urdu.</p>",
    `<p><a href="/${PUBLISHED}">Karachi Chat Room</a></p>`,
    `<p><a href="/${DRAFT}">Gujranwala Chat Room</a></p>`,
    "<h2>FAQ</h2>",
    "<h3>Is it free?</h3>",
    "<p>Yes, joining is free on Yaarzo.</p>",
  ].join(""),
  excerpt: "Free Pakistan chat rooms on Yaarzo.",
  tags: ["pakistan", "chat"],
  layout: "boxed",
  sidebar_left: "none",
  sidebar_right: "none",
  meta_title: "Pakistan chat room | Free Online Chat on Yaarzo",
  meta_description: "Join free Pakistan chat rooms on Yaarzo.",
  meta_keywords: null,
  og_title: null,
  og_description: null,
  og_image: null,
  canonical_url: "https://yaarzo.com/pakistan-chat-room",
  noindex: false,
  nofollow: false,
  views: 12,
  published_at: "2026-08-08T00:00:00Z",
  redirectedFrom: null,
};

function renderPublishedFixture() {
  const composed = composePublicCmsHtml({
    intro: fixturePage.intro_content,
    content: fixturePage.content,
  });
  // Draft target suppressed; published target kept as <a>
  const publicHtml = filterUnpublishedCmsLinks(composed, [DRAFT]);
  const page = { ...fixturePage, publicHtml };
  const body = renderToString(React.createElement(PublicCmsPageView, { page }));
  // Simulate a minimal document shell like the app HTTP response body region
  const html = `<!DOCTYPE html><html><head>
    <title>${fixturePage.meta_title}</title>
    <meta name="description" content="${fixturePage.meta_description}"/>
    <meta name="robots" content="index, follow"/>
    <link rel="canonical" href="${fixturePage.canonical_url}"/>
  </head><body>${body}</body></html>`;
  return { html, body, publicHtml };
}

describe("PublicCmsPageView real SSR markup", () => {
  it("emits exactly one H1, body headings, text, and published anchors in renderToString", () => {
    const { html, body } = renderPublishedFixture();

    expect(body).not.toMatch(/Loading page/i);
    expect(body.match(/<h1\b/gi)?.length ?? 0).toBe(1);
    expect(body).toContain("Pakistan Chat Room – Free Online Chat");
    expect(body.match(/<h2\b/gi)?.length ?? 0).toBeGreaterThanOrEqual(1);
    expect(body).toContain("About Pakistan Chat");
    expect(body).toContain("Yes, joining is free");
    expect(body).toContain(`href="/${PUBLISHED}"`);
    expect(body).toContain("Karachi Chat Room");
    // Draft link unwrapped to text
    expect(body).not.toContain(`href="/${DRAFT}"`);
    expect(body).toContain("Gujranwala Chat Room");
    expect(body).toContain("custom-page-content");
    expect(body).toContain("<article");

    const audit = auditInitialCmsHtml(html, {
      expectedCanonical: fixturePage.canonical_url,
      expectIndexable: true,
    });
    expect(audit.ok).toBe(true);
    expect(audit.isPendingShellOnly).toBe(false);
    expect(audit.h1Count).toBe(1);
  });

  it("does not leave content only in a script/json payload", () => {
    const { body } = renderPublishedFixture();
    // Strip tags → still see body phrase (proves it's in markup, not only attributes/JSON)
    const text = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
    expect(text).toMatch(/Welcome to Pakistan chat/);
    expect(text).toMatch(/About Pakistan Chat/);
  });

  it("keeps a single H1 after sanitize (body uses h2+)", () => {
    const composed = composePublicCmsHtml({
      intro: fixturePage.intro_content,
      content: fixturePage.content,
    });
    const safe = sanitizeHtml(composed);
    expect(safe.match(/<h1\b/gi)?.length ?? 0).toBe(0);
    expect(safe.match(/<h2\b/gi)?.length ?? 0).toBeGreaterThanOrEqual(1);
    const { body } = renderPublishedFixture();
    expect(body.match(/<h1\b/gi)?.length ?? 0).toBe(1);
  });
});

describe("sanitizeHtml SSR module safety", () => {
  it("sanitizeHtml works without throwing when purify browser build is unavailable", () => {
    const out = sanitizeHtml('<h2>Hi</h2><p><a href="/x">x</a><script>alert(1)</script></p>');
    expect(out).toContain("<h2>");
    expect(out).toContain('href="/x"');
    expect(out).not.toContain("<script");
  });
});
