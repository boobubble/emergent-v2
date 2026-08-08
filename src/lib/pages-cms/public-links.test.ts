import { describe, expect, it } from "vitest";
import {
  composePublicCmsHtml,
  extractRelativeCmsHrefSlugs,
  filterUnpublishedCmsLinks,
} from "./public-links";
import { customPageSitemapEntries } from "@/lib/seo/sitemap";

describe("filterUnpublishedCmsLinks", () => {
  it("unwraps anchors to draft/unpublished custom page slugs", () => {
    const html =
      `<p>See <a href="/karachi-chat-room">Karachi</a> and <a href="/rawalpindi-chat-room">Rawalpindi</a>.</p>` +
      `<p>Also <a href="/pakistan-chat-room">Pakistan hub</a> and <a href="/chatrooms">Rooms</a>.</p>`;
    const out = filterUnpublishedCmsLinks(html, ["rawalpindi-chat-room", "dating-chat-room"]);
    expect(out).toContain('href="/karachi-chat-room"');
    expect(out).toContain('href="/pakistan-chat-room"');
    expect(out).toContain('href="/chatrooms"');
    expect(out).not.toContain('href="/rawalpindi-chat-room"');
    expect(out).toContain("Rawalpindi");
  });

  it("leaves HTML unchanged when no unpublished targets", () => {
    const html = `<a href="/lahore-chat-room">Lahore</a>`;
    expect(filterUnpublishedCmsLinks(html, [])).toBe(html);
  });

  it("extracts relative cms href slugs", () => {
    expect(
      extractRelativeCmsHrefSlugs(
        `<a href="/delhi-chat-room">D</a><a href="https://yaarzo.com/x">ext</a><a href="/feed">Feed</a>`,
      ),
    ).toEqual(expect.arrayContaining(["delhi-chat-room", "feed"]));
  });
});

describe("composePublicCmsHtml", () => {
  it("joins intro and content for public render without fabricating copy", () => {
    expect(composePublicCmsHtml({ intro: "<p>Intro</p>", content: "<h2>Body</h2>" })).toContain(
      "Intro",
    );
    expect(composePublicCmsHtml({ intro: null, content: "<h2>Body</h2>" })).toBe("<h2>Body</h2>");
  });
});

describe("draft exclusion from sitemap/public resolver", () => {
  it("excludes draft/noindex pages from custom page sitemap entries", () => {
    const entries = customPageSitemapEntries(
      [
        { slug: "lahore-chat-room", noindex: false },
        { slug: "karachi-chat-room", noindex: false },
        { slug: "rawalpindi-chat-room", noindex: true },
        { slug: "dating-chat-room", noindex: true },
      ],
      new Set(),
      { canonical_domain: "yaarzo.com" } as never,
    );
    const locs = entries.map((e) => e.loc);
    expect(locs.some((l) => l.endsWith("/lahore-chat-room"))).toBe(true);
    expect(locs.some((l) => l.endsWith("/karachi-chat-room"))).toBe(true);
    expect(locs.some((l) => l.endsWith("/rawalpindi-chat-room"))).toBe(false);
    expect(locs.some((l) => l.endsWith("/dating-chat-room"))).toBe(false);
  });
});
