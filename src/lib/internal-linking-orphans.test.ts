import { describe, expect, it } from "vitest";
import {
  buildOrphanReport,
  canonicalPagePath,
  extractInternalHrefs,
  normalizeInternalHref,
  selectUnderLinkedPages,
} from "./internal-linking-orphans";

describe("normalizeInternalHref", () => {
  it("strips the yaarzo.com domain", () => {
    expect(normalizeInternalHref("https://yaarzo.com/lahore-chat-room")).toBe("/lahore-chat-room");
    expect(normalizeInternalHref("http://www.yaarzo.com/lahore-chat-room/")).toBe("/lahore-chat-room");
  });

  it("treats /p/{slug} as /{slug}", () => {
    expect(normalizeInternalHref("/p/lahore-chat-room")).toBe("/lahore-chat-room");
    expect(normalizeInternalHref("https://yaarzo.com/p/lahore-chat-room")).toBe("/lahore-chat-room");
  });

  it("strips trailing slashes and query/hash", () => {
    expect(normalizeInternalHref("/lahore-chat-room/")).toBe("/lahore-chat-room");
    expect(normalizeInternalHref("/lahore-chat-room?ref=1#x")).toBe("/lahore-chat-room");
  });

  it("keeps multi-segment internal paths", () => {
    expect(normalizeInternalHref("/blog/how-to-make-friends")).toBe("/blog/how-to-make-friends");
    expect(normalizeInternalHref("/hashtags/cricket")).toBe("/hashtags/cricket");
    expect(normalizeInternalHref("/chatroom")).toBe("/chatroom");
  });

  it("drops off-site URLs", () => {
    expect(normalizeInternalHref("https://example.com/lahore-chat-room")).toBeNull();
  });
});

describe("extractInternalHrefs", () => {
  it("accepts double-quoted, single-quoted, and absolute hrefs", () => {
    const html = [
      `<a href="/delhi-chat-room">Delhi</a>`,
      `<a href='/pakistan-chat-room'>Pakistan</a>`,
      `<a href="https://yaarzo.com/karachi-chat-room">Karachi</a>`,
      `<a href="https://yaarzo.com/p/lahore-chat-room">Lahore</a>`,
    ].join(" ");
    expect(extractInternalHrefs(html).sort()).toEqual([
      "/delhi-chat-room",
      "/karachi-chat-room",
      "/lahore-chat-room",
      "/pakistan-chat-room",
    ]);
  });
});

describe("buildOrphanReport", () => {
  const targets = [
    { url: "/p/lahore-chat-room", title: "Lahore", type: "seo_page" },
    { url: "/karachi-chat-room", title: "Karachi", type: "seo_page" },
    { url: "/pakistan-chat-room", title: "Pakistan", type: "seo_page" },
    { url: "/bahrain-chat-room", title: "Bahrain", type: "seo_page" },
    { url: "/chatroom", title: "Chatrooms", type: "community_page" },
  ];

  it("counts incoming across quote styles, domain, /p/ prefix, blogs, and graph rows", () => {
    const documents = [
      {
        canonicalUrl: canonicalPagePath("karachi-chat-room"),
        html: `<p>See <a href="/p/lahore-chat-room">Lahore</a> and <a href='/pakistan-chat-room'>Pakistan</a>.</p>
               <a href="/chatroom">Start</a>`,
      },
      {
        canonicalUrl: canonicalPagePath("islamabad-chat-room"),
        html: `<a href="https://yaarzo.com/lahore-chat-room/">Lahore rooms</a>`,
      },
      {
        canonicalUrl: "/blog/how-to-make-friends",
        html: `<a href="https://yaarzo.com/p/karachi-chat-room">Karachi</a>`,
      },
    ];
    const graphLinks = [
      { sourceUrl: "/lahore-chat-room", targetUrl: "/karachi-chat-room" },
      { sourceUrl: "/lahore-chat-room", targetUrl: "/pakistan-chat-room" },
    ];

    const report = buildOrphanReport({ targets, documents, graphLinks });

    const byUrl = Object.fromEntries(report.orphans.concat(report.lowLinks, report.wellLinked).map((r) => [normalizeInternalHref(r.url), r]));

    expect(byUrl["/lahore-chat-room"].incoming).toBe(2); // karachi HTML /p/ + islamabad absolute
    expect(byUrl["/karachi-chat-room"].incoming).toBe(2); // blog /p/ + graph from lahore
    expect(byUrl["/pakistan-chat-room"].incoming).toBe(2); // karachi HTML + graph
    expect(byUrl["/chatroom"].incoming).toBe(1);
    expect(byUrl["/bahrain-chat-room"].incoming).toBe(0);

    expect(report.orphans.map((o) => normalizeInternalHref(o.url))).toEqual(["/bahrain-chat-room"]);
    expect(report.lowLinks.map((r) => normalizeInternalHref(r.url)).sort()).toEqual([
      "/chatroom",
      "/karachi-chat-room",
      "/lahore-chat-room",
      "/pakistan-chat-room",
    ]);
    expect(report.wellLinked).toHaveLength(0);
    expect(report.total).toBe(5);
  });

  it("ignores self-links", () => {
    const report = buildOrphanReport({
      targets: [{ url: "/lahore-chat-room", title: "Lahore", type: "seo_page" }],
      documents: [
        {
          canonicalUrl: "/lahore-chat-room",
          html: `<a href="/lahore-chat-room">self</a><a href="/karachi-chat-room">peer</a>`,
        },
      ],
    });
    expect(report.orphans).toHaveLength(1);
    expect(report.orphans[0].outgoing).toBe(1);
  });
});

describe("selectUnderLinkedPages", () => {
  it("keeps orphan and low-link pages, drops well-linked, sorts by incoming then title", () => {
    const report = {
      orphans: [{ url: "/bahrain-chat-room", title: "Bahrain", type: "seo_page", incoming: 0, outgoing: 0 }],
      lowLinks: [
        { url: "/privacy-policy", title: "Privacy Policy", type: "seo_page", incoming: 1, outgoing: 0 },
        { url: "/about-us", title: "About Us", type: "seo_page", incoming: 1, outgoing: 0 },
        { url: "/australia-chat-room", title: "Australia Chat Room", type: "seo_page", incoming: 2, outgoing: 0 },
      ],
      wellLinked: [{ url: "/india-chat-room", title: "India", type: "seo_page", incoming: 12, outgoing: 4 }],
    };
    const pages = [
      { id: "in", url: "/india-chat-room", title: "India" },
      { id: "au", url: "/australia-chat-room", title: "Australia Chat Room" },
      { id: "bh", url: "/p/bahrain-chat-room", title: "Bahrain" },
      { id: "ab", url: "/about-us", title: "About Us" },
      { id: "pr", url: "/privacy-policy", title: "Privacy Policy" },
      { id: "xx", url: "/not-a-target", title: "Untracked" },
    ];
    expect(selectUnderLinkedPages(pages, report).map((p) => p.id)).toEqual(["bh", "ab", "pr", "au"]);
    expect(selectUnderLinkedPages(pages, report).map((p) => p.incoming)).toEqual([0, 1, 1, 2]);
  });
});
