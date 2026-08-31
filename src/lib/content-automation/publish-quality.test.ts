import { describe, expect, it } from "vitest";
import { chatroomUrls } from "./chatroom-urls";
import { YAARZO_MASTER_SYSTEM_PROMPT } from "./master-content-rules";
import {
  BLOG_INTERNAL_LINK_MAX,
  BLOG_INTERNAL_LINK_MIN,
  CANONICAL_CHATROOM_PATH,
  STATIC_INTERNAL_LINK_MAX,
  STATIC_INTERNAL_LINK_MIN,
  canonicalizePipelineHref,
  countInternalLinks,
  ensurePeerGeoLinks,
  filterPublishedHrefs,
  hasRepeatedAnchorText,
  htmlHasPeerGeoLink,
  padInternalLinks,
  pickPublishedInternalHref,
  preparePublishablePage,
  rewritePipelineHtml,
  sanitizePipelineTags,
} from "./publish-quality";
import { detectHashtagDump, evaluatePageQuality } from "@/lib/pages-cms/content-quality";

const PUBLISHED = new Set([
  "international-chat-room",
  "friendship-chat-room",
  "australia-chat-room",
  "girls-chat-room",
  "india-chat-room",
  "pakistan-chat-room",
  "lahore-chat-room",
]);

const BODY = `<p>${"word ".repeat(200)}</p><h2>How it works</h2>`;

describe("pickPublishedInternalHref", () => {
  it("never returns unpublished interest slugs or /chatrooms", () => {
    const href = pickPublishedInternalHref(
      [...chatroomUrls.interest, ...chatroomUrls.type, "https://yaarzo.com/chatrooms"],
      PUBLISHED,
    );
    expect(href).not.toMatch(/\/chatrooms(\/|$|\?)/i);
    expect(href).not.toContain("food-chat-room");
    expect(href).not.toContain("cricket-chat-room");
    expect(href).not.toContain("gaming-chat-room");
    const slug = href.replace(/^https?:\/\/(www\.)?yaarzo\.com\//i, "").replace(/^\//, "");
    expect(PUBLISHED.has(slug)).toBe(true);
  });

  it("falls back to international/friendship when the pool is empty", () => {
    const href = pickPublishedInternalHref(["https://yaarzo.com/food-chat-room"], PUBLISHED);
    expect(href === "https://yaarzo.com/international-chat-room" || href === "https://yaarzo.com/friendship-chat-room").toBe(
      true,
    );
  });

  it("drops keyword-map misses that are not published", () => {
    expect(filterPublishedHrefs(["https://yaarzo.com/gaming-chat-room"], PUBLISHED)).toEqual([]);
    expect(filterPublishedHrefs(["https://yaarzo.com/girls-chat-room"], PUBLISHED)).toEqual([
      "https://yaarzo.com/girls-chat-room",
    ]);
  });
});

describe("rewritePipelineHtml", () => {
  it("rewrites /chatrooms, /p/{slug}, and unpublished unwrap hrefs", () => {
    const html =
      `<a href="/chatrooms">Hub</a>` +
      `<a href="/p/lahore-chat-room">Lahore via p</a>` +
      `<a href="https://yaarzo.com/food-chat-room">Food</a>` +
      `<a href="https://yaarzo.com/australia-chat-room">Australia</a>` +
      `<a href="https://yaarzo.com/signup">Join</a>`;
    const out = rewritePipelineHtml(html, PUBLISHED, "https://yaarzo.com/international-chat-room");
    expect(out).not.toMatch(/\/chatrooms(\/|$|\?|"|')/i);
    expect(out).not.toMatch(/\/p\/[a-z0-9-]+/i);
    expect(out).toContain(`href="${CANONICAL_CHATROOM_PATH}"`);
    expect(out).toContain("/lahore-chat-room");
    expect(out).not.toContain("food-chat-room");
    expect(out).toContain("international-chat-room");
    expect(out).toContain("australia-chat-room");
    expect(out).toContain("/signup");
    expect(canonicalizePipelineHref("/p/delhi-chat-room")).toBe("/delhi-chat-room");
    expect(canonicalizePipelineHref("https://yaarzo.com/chatrooms")).toBe("https://yaarzo.com/chatroom");
  });
});

describe("sanitizePipelineTags", () => {
  it("clears keyword dumps so detectHashtagDump is false", () => {
    const dump = [
      "New Zealand Chat Room",
      "New Zealand Chat",
      "NZ Chat Room",
      "New Zealand Online Chat",
      "Chat With New Zealanders",
      "New Zealand Friends",
    ];
    expect(detectHashtagDump(dump)).toBe(true);
    const cleaned = sanitizePipelineTags(dump);
    expect(detectHashtagDump(cleaned)).toBe(false);
    expect(cleaned.filter((t) => /chat/i.test(t)).length).toBeLessThanOrEqual(3);
  });
});

describe("preparePublishablePage", () => {
  it("auto-corrects a simulated pipeline page so the 3 CMS warnings stay off", () => {
    const html =
      `${BODY}` +
      `<p><a href="/chatrooms">Start chatting</a></p>` +
      `<p><a href="https://yaarzo.com/food-chat-room">Food chat</a></p>` +
      `<p><a href="https://yaarzo.com/signup">sign up on Yaarzo</a></p>` +
      `<p><a href="${CANONICAL_CHATROOM_PATH}">rooms</a></p>`;
    const dump = [
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
    ];
    const prepared = preparePublishablePage({
      slug: "delhi-chat-room",
      title: "Delhi Chat Room",
      h1: "Delhi Chat Room",
      meta_title: "Delhi Chat Room Online",
      meta_description: "Chat with people in Delhi on Yaarzo. Join free rooms and make friends in NCR.",
      content: html,
      tags: dump,
      publishedSlugs: PUBLISHED,
    });
    expect(prepared.blocked).toBe(false);
    expect(prepared.content).not.toMatch(/\/chatrooms(\/|$|\?|"|')/i);
    expect(prepared.content).not.toContain("food-chat-room");
    expect(detectHashtagDump(prepared.tags)).toBe(false);
    const q = evaluatePageQuality({
      slug: "delhi-chat-room",
      title: "Delhi Chat Room",
      h1: "Delhi Chat Room",
      meta_title: "Delhi Chat Room Online",
      meta_description: "Chat with people in Delhi on Yaarzo. Join free rooms and make friends in NCR.",
      content: prepared.content,
      tags: prepared.tags,
      publishedSlugs: PUBLISHED,
    });
    expect(q.warnings.some((w) => w.code === "broken_internal_link")).toBe(false);
    expect(q.warnings.some((w) => w.code === "chatrooms_alias")).toBe(false);
    expect(q.warnings.some((w) => w.code === "hashtag_dump")).toBe(false);
  });
});

describe("master content rules + city/country validation", () => {
  it("embeds hard technical constraints in the system prompt", () => {
    expect(YAARZO_MASTER_SYSTEM_PROMPT).toContain('Never output the path "/chatrooms"');
    expect(YAARZO_MASTER_SYSTEM_PROMPT).toContain('"/chatroom"');
    expect(YAARZO_MASTER_SYSTEM_PROMPT).toContain('Never output "/p/{slug}"');
    expect(YAARZO_MASTER_SYSTEM_PROMPT).toContain("Never invent a URL or slug");
    expect(YAARZO_MASTER_SYSTEM_PROMPT).toContain("peer-geography");
    expect(YAARZO_MASTER_SYSTEM_PROMPT).toContain("8–10 internal links");
    expect(YAARZO_MASTER_SYSTEM_PROMPT).toContain("4–5 internal links");
    expect(YAARZO_MASTER_SYSTEM_PROMPT).not.toMatch(/use \/chatrooms as the hub/i);
  });

  it("injects a peer-geo link for a city page and passes evaluatePageQuality with zero warnings", () => {
    const html =
      `<p>${"word ".repeat(200)}</p><h2>How it works</h2>` +
      `<p>Meet people in the <a href="/friendship-chat-room">friendship rooms</a> and <a href="/chatroom">the chat hub</a>.</p>` +
      `<p><a href="https://yaarzo.com/signup">sign up on Yaarzo</a>, browse the <a href="https://yaarzo.com/feed">community feed</a>, or <a href="https://yaarzo.com/find-friends">find friends</a>.</p>` +
      `<p>Visit the <a href="/girls-chat-room">girls room</a>, the <a href="/international-chat-room">international room</a>, or <a href="/poetry">poetry hub</a>.</p>`;
    const withPeers = ensurePeerGeoLinks(html, [
      { href: "/pakistan-chat-room", label: "Pakistan" },
    ]);
    expect(htmlHasPeerGeoLink(withPeers, ["/pakistan-chat-room"])).toBe(true);
    const prepared = preparePublishablePage({
      slug: "lahore-chat-room",
      title: "Lahore Chat Room",
      h1: "Lahore Chat Room – Meet People in Lahore",
      meta_title: "Lahore Chat Room Online",
      meta_description: "Chat with people in Lahore on Yaarzo. Join free rooms and make friends in Punjab.",
      content: withPeers.replace("/friendship-chat-room", "/chatrooms"),
      tags: ["Lahore", "Punjab", "Urdu", "Friendship", "Pakistan", "Yaarzo", "Online community", "Lahore chat room"],
      publishedSlugs: PUBLISHED,
      linkCount: { min: STATIC_INTERNAL_LINK_MIN, max: STATIC_INTERNAL_LINK_MAX },
    });
    expect(prepared.blocked).toBe(false);
    expect(prepared.content).not.toMatch(/\/chatrooms(\/|$|\?|"|')/i);
    expect(htmlHasPeerGeoLink(prepared.content, ["/pakistan-chat-room"])).toBe(true);
    const n = countInternalLinks(prepared.content);
    expect(n).toBeGreaterThanOrEqual(STATIC_INTERNAL_LINK_MIN);
    expect(n).toBeLessThanOrEqual(STATIC_INTERNAL_LINK_MAX);
    expect(hasRepeatedAnchorText(prepared.content)).toBe(false);
    const q = evaluatePageQuality({
      slug: "lahore-chat-room",
      title: "Lahore Chat Room",
      h1: "Lahore Chat Room – Meet People in Lahore",
      meta_title: "Lahore Chat Room Online",
      meta_description: "Chat with people in Lahore on Yaarzo. Join free rooms and make friends in Punjab.",
      content: prepared.content,
      tags: prepared.tags,
      publishedSlugs: PUBLISHED,
    });
    expect(q.warnings).toEqual([]);
  });

  it("enforces 4-5 internal links on a sample blog post", () => {
    const html =
      `<p>${"word ".repeat(200)}</p><h2>How it works</h2>` +
      `<p><a href="https://yaarzo.com/signup">create your free account</a></p>` +
      `<p>Try the <a href="/friendship-chat-room">friendship room</a> or <a href="/chatroom">the chat hub</a>.</p>` +
      `<p>See this <a href="https://yaarzo.com/blog/how-to-make-real-friends-online-10-proven-tips">related read</a>.</p>`;
    const prepared = preparePublishablePage({
      slug: "how-to-make-friends-online",
      title: "How to Make Friends Online",
      h1: "How to Make Friends Online",
      meta_title: "How to Make Friends Online",
      meta_description: "Practical ways to make friends online on Yaarzo without turning the post into an ad.",
      content: html,
      tags: ["friendship", "online community", "Yaarzo", "advice"],
      publishedSlugs: PUBLISHED,
      linkCount: { min: BLOG_INTERNAL_LINK_MIN, max: BLOG_INTERNAL_LINK_MAX },
    });
    expect(prepared.blocked).toBe(false);
    const n = countInternalLinks(prepared.content);
    expect(n).toBeGreaterThanOrEqual(BLOG_INTERNAL_LINK_MIN);
    expect(n).toBeLessThanOrEqual(BLOG_INTERNAL_LINK_MAX);
    expect(prepared.content).not.toMatch(/\/chatrooms(\/|$|\?|"|')/i);
    expect(hasRepeatedAnchorText(prepared.content)).toBe(false);
  });

  it("pads thin HTML up to the static 8-10 range", () => {
    const thin = `<p>${"word ".repeat(200)}</p><h2>How it works</h2><p><a href="/signup">join free</a></p>`;
    const extras = [
      { href: "/friendship-chat-room", label: "friendship room" },
      { href: "/international-chat-room", label: "international room" },
      { href: "/girls-chat-room", label: "girls room" },
      { href: "/chatroom", label: "chat hub" },
      { href: "/feed", label: "community feed" },
      { href: "/find-friends", label: "find friends" },
      { href: "/poetry", label: "poetry hub" },
      { href: "/pakistan-chat-room", label: "Pakistan" },
    ];
    const padded = padInternalLinks(thin, extras, STATIC_INTERNAL_LINK_MIN, STATIC_INTERNAL_LINK_MAX);
    const n = countInternalLinks(padded);
    expect(n).toBeGreaterThanOrEqual(STATIC_INTERNAL_LINK_MIN);
    expect(n).toBeLessThanOrEqual(STATIC_INTERNAL_LINK_MAX);
  });
});
