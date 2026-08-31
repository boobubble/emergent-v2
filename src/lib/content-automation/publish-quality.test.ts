import { describe, expect, it } from "vitest";
import { chatroomUrls } from "./chatroom-urls";
import {
  CANONICAL_CHATROOM_PATH,
  filterPublishedHrefs,
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
  it("rewrites /chatrooms and unpublished unwrap hrefs", () => {
    const html =
      `<a href="/chatrooms">Hub</a>` +
      `<a href="https://yaarzo.com/food-chat-room">Food</a>` +
      `<a href="https://yaarzo.com/australia-chat-room">Australia</a>` +
      `<a href="https://yaarzo.com/signup">Join</a>`;
    const out = rewritePipelineHtml(html, PUBLISHED, "https://yaarzo.com/international-chat-room");
    expect(out).not.toMatch(/\/chatrooms(\/|$|\?|"|')/i);
    expect(out).toContain(`href="${CANONICAL_CHATROOM_PATH}"`);
    expect(out).not.toContain("food-chat-room");
    expect(out).toContain("international-chat-room");
    expect(out).toContain("australia-chat-room");
    expect(out).toContain("/signup");
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
