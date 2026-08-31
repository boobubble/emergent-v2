import { describe, expect, it } from "vitest";
import {
  CMS_BROKEN_HREF_REMAP,
  countWords,
  detectHashtagDump,
  detectResearchNotes,
  evaluatePageQuality,
  extractHeadingTexts,
  jaccardSimilarity,
  normalizeStoredCanonical,
  reducedPublicTags,
  resolveInternalHref,
  rewriteCmsHtml,
} from "./content-quality";

const PUBLISHED = [
  "delhi-chat-room",
  "india-chat-room",
  "girls-chat-room",
  "english-chat-room-free-online-chat",
  "chat-rooms-without-registration-2026",
  "lahore-chat-room",
  "pakistan-chat-room",
];

describe("rewriteCmsHtml", () => {
  it("strips competitor-brief sentences without deleting surrounding copy", () => {
    const html =
      `<p>Delhi is layered and busy. Competitor pages remain generic and repetitive across cities; Yaarzo's opening is leftover research.</p><p>Keep me.</p>`;
    const out = rewriteCmsHtml(html);
    expect(out).toContain("Delhi is layered");
    expect(out).toContain("Keep me.");
    expect(out.toLowerCase()).not.toContain("competitor pages");
  });

  it("strips Research Summary suffixes and empty headings", () => {
    const html =
      `<h2></h2><p>Hello</p><hr><h2>Research Summary</h2><p>Competitor analysis leftover.</p>`;
    const out = rewriteCmsHtml(html, { h1: "Delhi Chat Room", publishedSlugs: PUBLISHED });
    expect(out).toContain("Hello");
    expect(out.toLowerCase()).not.toContain("research summary");
    expect(out).not.toMatch(/<h2>\s*<\/h2>/i);
  });

  it("does not repeat the H1 as the first H2", () => {
    const html = `<h2>Lahore Chat Room</h2><p>Welcome to Lahore.</p><h2>How it works</h2>`;
    const out = rewriteCmsHtml(html, { h1: "Lahore Chat Room", publishedSlugs: PUBLISHED });
    expect(out).not.toMatch(/<h2>Lahore Chat Room<\/h2>/i);
    expect(out).toContain("How it works");
  });

  it("rewrites /chatrooms and remaps known broken hrefs without creating pages", () => {
    const html =
      `<a href="/chatrooms">Rooms</a>` +
      `<a href="https://yaarzo.com/noida-chat-room">Noida</a>` +
      `<a href="https://yaarzo.com/food-chat-room">Food chat</a>` +
      `<a href="https://yaarzo.com/english-chat-room">English</a>`;
    const out = rewriteCmsHtml(html, { publishedSlugs: PUBLISHED });
    expect(out).toContain('href="/chatroom"');
    expect(out).not.toContain("/chatrooms");
    expect(out).toContain('href="/delhi-chat-room"');
    expect(out).toContain("Food chat");
    expect(out).not.toContain("/food-chat-room");
    expect(out).toContain("/english-chat-room-free-online-chat");
  });

  it("fixes known typos without rewriting tone", () => {
    const out = rewriteCmsHtml("<p>Join this cahte room with freinds.</p>");
    expect(out).toContain("chat room");
    expect(out).toContain("friends");
    expect(out).not.toContain("cahte");
    expect(out).not.toContain("freinds");
  });

  it("cleans safe legal formatting but keeps legal-entity placeholders", () => {
    const html =
      `<h2>Page Content</h2><p><strong>Last Updated: [15-08-2026]</strong></p>` +
      `<p>operated by [INSERT LEGAL ENTITY NAME] ("Yaarzo"). Email [support@yaarzo.com].</p>`;
    const out = rewriteCmsHtml(html);
    expect(out).not.toContain("Page Content");
    expect(out).toContain("Last Updated: 15/08/2026");
    expect(out).toContain("[INSERT LEGAL ENTITY NAME]");
    expect(out).toContain("support@yaarzo.com");
    expect(out).not.toContain("[support@yaarzo.com]");
  });
});

describe("canonical normalization", () => {
  it("never stores yaarzo.com/slug concatenation sources", () => {
    expect(normalizeStoredCanonical("usa-chat-room", "yaarzo.com/usa-chat-room")).toBeNull();
    expect(normalizeStoredCanonical("usa-chat-room", "https://yaarzo.com/usa-chat-room")).toBeNull();
    expect(normalizeStoredCanonical("usa-chat-room", "")).toBeNull();
    expect(normalizeStoredCanonical("usa-chat-room", "https://yaarzo.com/uk-chat-room")).toBe(
      "https://yaarzo.com/uk-chat-room",
    );
  });
});

describe("quality evaluation", () => {
  it("warns without blocking publish semantics", () => {
    const q = evaluatePageQuality({
      slug: "usa-chat-room",
      title: "USA Chat Room",
      content: "<h2></h2><p>thin</p><p>Research Summary leftover search intent notes.</p>",
      tags: ["USA chat room", "American chat room", "free online chat", "live chat USA", "chat with strangers"],
    });
    expect(q.status).toBe("Critical");
    expect(q.warnings.some((w) => w.code === "empty_heading")).toBe(true);
    expect(q.warnings.some((w) => w.code === "research_notes")).toBe(true);
    expect(q.warnings.some((w) => w.code === "missing_meta_title")).toBe(true);
  });

  it("does not treat privacy-style tags as a chat keyword dump", () => {
    expect(
      detectHashtagDump([
        "privacy policy",
        "data protection",
        "Yaarzo privacy",
        "user data",
        "cookies policy",
        "GDPR",
        "online safety",
        "chat platform privacy",
      ]),
    ).toBe(false);
    expect(
      reducedPublicTags([
        "Delhi chat room",
        "Yaarzo",
        "NCR chat room",
        "Noida chat",
        "Gurugram chat",
        "Delhi dosti",
        "free chat room India",
        "Hindi chat room",
        "Punjabi chat room",
        "online friendship",
        "Delhi girls chat",
        "India social chat",
      ]),
    ).toEqual([]);
  });

  it("scores a complete indexable page as Excellent", () => {
    const body =
      `<p>${"word ".repeat(200)}</p><h2>How it works</h2><p><a href="/india-chat-room">India</a> and <a href="/chatroom">rooms</a>.</p>`;
    const q = evaluatePageQuality({
      slug: "delhi-chat-room",
      title: "Delhi Chat Room",
      h1: "Delhi Chat Room – Meet & Chat With People in Delhi",
      meta_title: "Delhi Chat Room Online",
      meta_description: "Chat with people in Delhi on Yaarzo. Join free rooms and make friends in NCR.",
      content: body,
      tags: ["Delhi chat"],
      publishedSlugs: PUBLISHED,
    });
    expect(q.status).toBe("Excellent");
    expect(q.warnings).toEqual([]);
  });
});

describe("link resolver and similarity", () => {
  it("maps documented broken city links to existing pages", () => {
    expect(CMS_BROKEN_HREF_REMAP["/noida-chat-room"]).toBe("/delhi-chat-room");
    expect(resolveInternalHref("/food-chat-room", new Set(PUBLISHED)).action).toBe("unwrap");
    expect(resolveInternalHref("/lahore-chat-room", new Set(PUBLISHED)).action).toBe("keep");
    expect(resolveInternalHref("/australia-chat-room", new Set(["australia-chat-room"])).action).toBe("keep");
    expect(resolveInternalHref("/bahrain-chat-room", new Set(["india-chat-room"])).action).toBe("keep");
    expect(countWords("<p>one two three</p>")).toBe(3);
    expect(extractHeadingTexts("<h2></h2><h2>Hello</h2>")[0]?.empty).toBe(true);
    expect(detectResearchNotes("<p>Pages CMS slug exists</p>").length).toBeGreaterThan(0);
    expect(jaccardSimilarity("hello city chat room friends", "hello city chat room friends")).toBe(1);
  });
});
