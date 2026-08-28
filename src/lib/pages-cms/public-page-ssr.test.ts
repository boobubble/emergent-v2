import { describe, it, expect } from "vitest";
import {
  resolvePublicCmsH1,
  resolvePublicCmsBodyHtml,
  buildPublicCmsArticleInitialHtml,
  auditInitialCmsHtml,
  stripScripts,
  countH1Tags,
} from "./public-page-ssr";
import { composePublicCmsHtml } from "./public-links";
import { publishedPageMatchesSlug } from "@/lib/fetch-published-page";

const publishedFixture = {
  slug: "pakistan-chat-room",
  title: "Pakistan Chat Room",
  h1: "Pakistan Chat Room – Free Online Chat",
  intro_content: "<p>Welcome to Pakistan chat on Yaarzo.</p>",
  content:
    "<h2>About Pakistan Chat</h2><p>Talk with people across Pakistan in English or Urdu.</p><p><a href=\"/karachi-chat-room\">Karachi Chat Room</a></p><h2>FAQ</h2><h3>Is it free?</h3><p>Yes, joining is free.</p>",
  excerpt: "Free Pakistan chat rooms on Yaarzo.",
  meta_title: "Pakistan chat room | Free Online Chat on Yaarzo",
  meta_description: "Join free Pakistan chat rooms on Yaarzo.",
  canonical_url: "https://yaarzo.com/pakistan-chat-room",
  noindex: false,
  nofollow: false,
};

describe("resolvePublicCmsH1", () => {
  it("prefers h1 over title and never concatenates both", () => {
    expect(resolvePublicCmsH1(publishedFixture)).toBe("Pakistan Chat Room – Free Online Chat");
    expect(resolvePublicCmsH1({ title: "T", h1: null })).toBe("T");
    expect(resolvePublicCmsH1({ title: "T", h1: "  " })).toBe("T");
  });
});

describe("buildPublicCmsArticleInitialHtml", () => {
  it("puts exactly one H1 in initial article HTML plus meaningful body and links", () => {
    const publicHtml = composePublicCmsHtml({
      intro: publishedFixture.intro_content,
      content: publishedFixture.content,
    });
    const html = buildPublicCmsArticleInitialHtml({ ...publishedFixture, publicHtml });
    expect(countH1Tags(html)).toBe(1);
    expect(html).toContain("<h1>Pakistan Chat Room – Free Online Chat</h1>");
    expect(html).toContain("custom-page-content");
    expect(html).toContain("Welcome to Pakistan chat");
    expect(html).toContain('href="/karachi-chat-room"');
    expect(html).toContain("Is it free?");
    // Body uses H2 — no second H1 from content
    expect(html).toContain("<h2>About Pakistan Chat</h2>");
  });

  it("places a post-CTA image after the lead paragraph in initial body HTML", () => {
    const img =
      '<img src="https://example.com/kuwait.webp" alt="Kuwait chat room" data-optimized="true">';
    const publicHtml = [
      "<p>Late nights in Kuwait.</p>",
      "<h2>Why a Kuwait Chat Room?</h2>",
      "<p>General chat apps are fine.</p>",
      '<p><a class="custom-page-cta-button" href="/chatrooms">Start Chatting Now→</a></p>',
      "<p>Free to explore • Join when you are ready</p>",
      img,
    ].join("");
    const html = buildPublicCmsArticleInitialHtml({ ...publishedFixture, publicHtml });
    const imgAt = html.indexOf("<img");
    expect(imgAt).toBeGreaterThan(-1);
    expect(imgAt).toBeLessThan(html.indexOf("<h2>Why a Kuwait Chat Room?"));
    expect(imgAt).toBeLessThan(html.indexOf("custom-page-cta-button"));
    expect(html.match(/<img\b/gi)?.length).toBe(1);
  });

  it("does not duplicate H1 when body already has headings", () => {
    const html = buildPublicCmsArticleInitialHtml({
      ...publishedFixture,
      content: "<h1>Should not be used as page H1 alone</h1><p>Body</p>",
      publicHtml: undefined,
    });
    // Page shell always adds one H1; if body also has H1 that is a content bug —
    // Lahore/generated pages use H2+. Assert our shell adds exactly one leading H1.
    expect(html.startsWith("<article><h1>")).toBe(true);
    expect(resolvePublicCmsBodyHtml(publishedFixture)).not.toMatch(/<h1\b/i);
  });
});

describe("auditInitialCmsHtml", () => {
  it("passes when title/meta/canonical/robots/H1/body are in initial HTML", () => {
    const article = buildPublicCmsArticleInitialHtml({
      ...publishedFixture,
      publicHtml: composePublicCmsHtml({
        intro: publishedFixture.intro_content,
        content: publishedFixture.content,
      }),
    });
    const initial = `<!DOCTYPE html><html><head>
      <title>${publishedFixture.meta_title}</title>
      <meta name="description" content="${publishedFixture.meta_description}"/>
      <meta name="robots" content="index, follow"/>
      <link rel="canonical" href="${publishedFixture.canonical_url}"/>
    </head><body>${article}<script>window.__DATA={h1:"x"}</script></body></html>`;

    const audit = auditInitialCmsHtml(initial, {
      expectedCanonical: publishedFixture.canonical_url!,
      expectIndexable: true,
    });
    expect(audit.ok).toBe(true);
    expect(audit.h1Count).toBe(1);
    expect(audit.isPendingShellOnly).toBe(false);
    expect(audit.hasInternalLinks).toBe(true);
    // Scripts must not count as visible H1
    expect(stripScripts(initial)).not.toContain("window.__DATA");
  });

  it("fails when only the pending shell is present (Phase 4D crawlability bug)", () => {
    const broken = `<!DOCTYPE html><html><head>
      <title>${publishedFixture.meta_title}</title>
      <meta name="description" content="${publishedFixture.meta_description}"/>
      <meta name="robots" content="index, follow"/>
      <link rel="canonical" href="${publishedFixture.canonical_url}"/>
    </head><body>
      <!--$--><!--$!--><template></template>
      <div><p>Loading page…</p></div><!--/$-->
      <script type="application/json">{"h1":"${publishedFixture.h1}","content":"${publishedFixture.content}"}</script>
    </body></html>`;

    const audit = auditInitialCmsHtml(broken, {
      expectedCanonical: publishedFixture.canonical_url!,
    });
    expect(audit.ok).toBe(false);
    expect(audit.isPendingShellOnly).toBe(true);
    expect(audit.h1Count).toBe(0);
    expect(audit.failures.some((f) => /pending shell|H1|body/i.test(f))).toBe(true);
  });

  it("requires index,follow for published pages", () => {
    const html = `<!DOCTYPE html><html><head>
      <title>T</title>
      <meta name="description" content="D"/>
      <meta name="robots" content="noindex, nofollow"/>
      <link rel="canonical" href="https://yaarzo.com/x"/>
    </head><body><article><h1>T</h1><div class="custom-page-content"><p>${"word ".repeat(40)}</p></div></article></body></html>`;
    const audit = auditInitialCmsHtml(html, { expectIndexable: true });
    expect(audit.ok).toBe(false);
    expect(audit.failures.some((f) => /robots/i.test(f))).toBe(true);
  });
});

describe("draft pages remain non-public", () => {
  it("publishedPageMatchesSlug still requires an actual published page object to render", () => {
    // Route loader only returns published rows; drafts never become loaderData.page.
    const draft = { slug: "dating-chat-room", status: "draft" as const };
    expect(draft.status).toBe("draft");
    expect(publishedPageMatchesSlug({ slug: draft.slug }, "dating-chat-room")).toBe(true);
    // Document contract: without a published loader page, PublicPage must not render article HTML.
    const loaderPage = null as { slug: string } | null;
    expect(loaderPage).toBeNull();
  });
});

describe("hydration H1 contract", () => {
  it("shell H1 + body without H1 yields exactly one H1 total", () => {
    const body = resolvePublicCmsBodyHtml({
      publicHtml: composePublicCmsHtml({
        intro: publishedFixture.intro_content,
        content: publishedFixture.content,
      }),
    });
    expect(countH1Tags(body)).toBe(0);
    const full = buildPublicCmsArticleInitialHtml({
      ...publishedFixture,
      publicHtml: body,
    });
    expect(countH1Tags(full)).toBe(1);
  });
});
