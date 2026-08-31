import { describe, expect, it } from "vitest";
import { pageSlugFromName, parseBulkContentIdeas } from "./parse-bulk-ideas";

const SAMPLE = `Blog: How to Make Friends After College
About: Practical tips for building a social circle after graduating.
Keywords: make friends after college, social circle tips, adult friendships

Blog: Best Chatrooms for Night Owls
About: Late-night chatroom communities worth joining.

Page: Rawalpindi
Country: Pakistan
Keywords: rawalpindi chat room, pakistan chat online, rwp chat

Page: Ludhiana
Country: India

Page: Quetta Girls
Country: Pakistan
Type: girls`;

describe("parseBulkContentIdeas", () => {
  it("parses the sample mixed batch into 2 blogs and 3 pages with no errors", () => {
    const result = parseBulkContentIdeas(SAMPLE);
    expect(result.errors).toEqual([]);
    expect(result.blogItems).toHaveLength(2);
    expect(result.pageItems).toHaveLength(3);

    expect(result.blogItems[0]).toEqual({
      type: "blog",
      title: "How to Make Friends After College",
      categorySlug: "chatrooms",
      metaDescription: "Practical tips for building a social circle after graduating.",
      keywords: "make friends after college, social circle tips, adult friendships",
    });
    expect(result.blogItems[1]).toMatchObject({
      title: "Best Chatrooms for Night Owls",
      categorySlug: "chatrooms",
      metaDescription: "Late-night chatroom communities worth joining.",
      keywords: null,
    });

    expect(result.pageItems.map((p) => p.slug)).toEqual([
      "rawalpindi-chat-room",
      "ludhiana-chat-room",
      "quetta-girls-chat-room",
    ]);
    expect(result.pageItems[0]).toMatchObject({
      section: "pakistan_city",
      baseName: "Rawalpindi",
      lookupCity: "Rawalpindi",
      lookupCountryHint: "Pakistan",
    });
    expect(result.pageItems[1]).toMatchObject({
      section: "india_city",
      lookupCountryHint: "India",
    });
    expect(result.pageItems[2]).toMatchObject({
      section: "city_subcategory",
      baseName: "Quetta Girls",
      lookupCountryHint: "Pakistan",
    });
  });

  it("reports missing About on a blog block without dropping valid siblings", () => {
    const result = parseBulkContentIdeas(`Blog: Best Chatrooms for Night Owls

Page: Cricket`);
    expect(result.pageItems).toEqual([
      expect.objectContaining({
        type: "page",
        slug: "cricket-chat-room",
        section: "interest",
        baseName: "Cricket",
        lookupCity: "Cricket",
        lookupCountryHint: null,
      }),
    ]);
    expect(result.blogItems).toEqual([]);
    expect(result.errors[0]?.reason).toContain("missing \"About:\"");
    expect(result.errors[0]?.reason).toContain("Best Chatrooms for Night Owls");
  });

  it("parses a single 3-line blog block with no blank lines and no trailing newline", () => {
    const input = "Blog: Test Post For Keyword Check\nAbout: A quick test blog post to verify keyword clusters work end to end.\nKeywords: test keyword one, test keyword two, yaarzo test post";
    expect(input.includes("\n\n")).toBe(false);
    expect(input.endsWith("\n")).toBe(false);

    const result = parseBulkContentIdeas(input);
    expect(result.errors).toEqual([]);
    expect(result.blogItems).toEqual([{
      type: "blog",
      title: "Test Post For Keyword Check",
      categorySlug: "chatrooms",
      metaDescription: "A quick test blog post to verify keyword clusters work end to end.",
      keywords: "test keyword one, test keyword two, yaarzo test post",
    }]);
    expect(result.pageItems).toEqual([]);
  });

  it("parses that same single blog block with CRLF and CR-only line endings", () => {
    const lf = "Blog: Test Post For Keyword Check\nAbout: A quick test blog post to verify keyword clusters work end to end.\nKeywords: test keyword one, test keyword two, yaarzo test post";
    for (const input of [lf.replace(/\n/g, "\r\n"), lf.replace(/\n/g, "\r")]) {
      const result = parseBulkContentIdeas(input);
      expect(result.errors).toEqual([]);
      expect(result.blogItems).toHaveLength(1);
      expect(result.blogItems[0]?.title).toBe("Test Post For Keyword Check");
      expect(result.blogItems[0]?.keywords).toBe("test keyword one, test keyword two, yaarzo test post");
    }
  });

  it("does not treat Blog:/About: lines as pipe-delimited blog|title|category rows", () => {
    const exact = "Blog: Test Post For Keyword Check\nAbout: A quick test blog post to verify keyword clusters work end to end.\nKeywords: test keyword one, test keyword two, yaarzo test post";
    const pipeItems: unknown[] = [];
    for (const line of exact.split("\n").filter((l) => l.trim())) {
      const parts = line.split("|").map((s) => s.trim());
      const type = parts[0]?.toLowerCase();
      if (type === "blog" && parts[1] && parts[2]) pipeItems.push({ type: "blog", title: parts[1] });
    }
    expect(pipeItems).toEqual([]);
    expect(parseBulkContentIdeas(exact).blogItems).toHaveLength(1);
  });

  it("builds type slugs without doubling when Page already includes the type", () => {
    expect(pageSlugFromName("Quetta", "girls")).toBe("quetta-girls-chat-room");
    expect(pageSlugFromName("Quetta Girls", "girls")).toBe("quetta-girls-chat-room");
    expect(pageSlugFromName("Rawalpindi")).toBe("rawalpindi-chat-room");
  });
});
