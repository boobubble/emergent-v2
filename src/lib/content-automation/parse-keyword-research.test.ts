import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { detectHashtagDump } from "@/lib/pages-cms/content-quality";
import {
  matchKeywordResearchTitle,
  matchPublishedContentTitle,
  mergeKeywords,
  parseKeywordResearch,
  prepareKeywordResearchTags,
  type KeywordResearchCandidate,
} from "./parse-keyword-research";

const SAMPLE = `How to Make Real Friends Online: 10 Proven Tips
Choosing the right apps for online friendship (commercial)

* best apps to make friends online
* apps for making new friends
* best friendship apps for adults

Finding online communities that fit your interests (informational)

* how to find online communities to make friends
* best online communities for making friends
* Best Apps to Make Friends Online
`;

const PAGE_SAMPLE = `Karachi Chat Room
Finding local chat rooms in Karachi (informational)

* karachi chat room
* chat rooms in karachi
* best karachi chat rooms

Meeting people in Karachi (commercial)

* make friends in karachi
* karachi friendship chat
`;

const BLOG_1: KeywordResearchCandidate = {
  type: "blog",
  id: 1,
  title: "How to Make Real Friends Online: 10 Proven Tips",
  keywords: null,
};

const KARACHI: KeywordResearchCandidate = {
  type: "page",
  id: 95,
  title: "karachi",
  slug: "karachi-chat-room",
  keywords: null,
};

const KARACHI_GIRLS: KeywordResearchCandidate = {
  type: "page",
  id: 180,
  title: "karachi girls",
  slug: "karachi-girls-chat-room",
  keywords: null,
};

const CANDIDATES: KeywordResearchCandidate[] = [
  BLOG_1,
  {
    type: "blog",
    id: 101,
    title: "Test Post For Keyword Check",
    keywords: "test keyword one, test keyword two, yaarzo test post",
  },
  KARACHI,
  KARACHI_GIRLS,
  { type: "page", id: 1, title: "girls", slug: "girls-chat-room", keywords: null },
];

describe("parseKeywordResearch", () => {
  it("takes the first line as the title and collects bullets from every cluster", () => {
    const parsed = parseKeywordResearch(SAMPLE);
    expect(parsed.title).toBe("How to Make Real Friends Online: 10 Proven Tips");
    expect(parsed.keywords).toEqual([
      "best apps to make friends online",
      "apps for making new friends",
      "best friendship apps for adults",
      "how to find online communities to make friends",
      "best online communities for making friends",
    ]);
    expect(parsed.joined).toBe(
      "best apps to make friends online, apps for making new friends, best friendship apps for adults, how to find online communities to make friends, best online communities for making friends",
    );
  });

  it("ignores cluster headers, blank lines, and case-insensitive duplicates", () => {
    const parsed = parseKeywordResearch(SAMPLE);
    expect(parsed.keywords).not.toContain("Choosing the right apps for online friendship (commercial)");
    expect(parsed.keywords.filter((k) => k.toLowerCase() === "best apps to make friends online")).toHaveLength(1);
  });

  it("parses a static-page paste the same way", () => {
    const parsed = parseKeywordResearch(PAGE_SAMPLE);
    expect(parsed.title).toBe("Karachi Chat Room");
    expect(parsed.keywords).toHaveLength(5);
    expect(parsed.keywords[0]).toBe("karachi chat room");
  });
});

describe("matchKeywordResearchTitle", () => {
  it("exact-matches a blog topic title to ID 1", () => {
    const match = matchKeywordResearchTitle("How to Make Real Friends Online: 10 Proven Tips", CANDIDATES);
    expect(match).toEqual({
      status: "matched",
      title: "How to Make Real Friends Online: 10 Proven Tips",
      match: BLOG_1,
      confidence: "exact",
    });
  });

  it("matches a page via base_name or derived 'Chat Room' title without grabbing sibling pages", () => {
    expect(matchKeywordResearchTitle("Karachi", CANDIDATES)).toMatchObject({
      status: "matched",
      match: { id: 95, slug: "karachi-chat-room" },
      confidence: "exact",
    });
    expect(matchKeywordResearchTitle("Karachi Chat Room", CANDIDATES)).toMatchObject({
      status: "matched",
      match: { id: 95 },
      confidence: "derived",
    });
    expect(matchKeywordResearchTitle("karachi-chat-room", CANDIDATES)).toMatchObject({
      status: "matched",
      match: { id: 95 },
    });
    expect(matchKeywordResearchTitle("Karachi Girls Chat Room", CANDIDATES)).toMatchObject({
      status: "matched",
      match: { id: 180 },
    });
  });

  it("reports no match instead of guessing a wrong row", () => {
    const match = matchKeywordResearchTitle("This Title Does Not Exist Anywhere", CANDIDATES);
    expect(match.status).toBe("none");
    if (match.status === "none") {
      expect(match.message).toBe("No matching pending item found for 'This Title Does Not Exist Anywhere'");
    }
  });

  it("flags ambiguous page titles instead of picking one", () => {
    const twins: KeywordResearchCandidate[] = [
      { type: "page", id: 10, title: "chat", slug: "chat-chat-room", keywords: null },
      { type: "page", id: 11, title: "chat", slug: "chat-room", keywords: null },
    ];
    const match = matchKeywordResearchTitle("Chat", twins);
    expect(match.status).toBe("ambiguous");
    if (match.status === "ambiguous") {
      expect(match.candidates).toHaveLength(2);
      expect(match.message).toContain("Ambiguous match");
    }
  });
});

describe("mergeKeywords", () => {
  it("replaces by default and merges unique keywords when appending", () => {
    const existing = "test keyword one, test keyword two, yaarzo test post";
    const incoming = ["test keyword two", "new keyword"];
    expect(mergeKeywords(existing, incoming, "replace")).toBe("test keyword two, new keyword");
    expect(mergeKeywords(existing, incoming, "append")).toBe(
      "test keyword one, test keyword two, yaarzo test post, new keyword",
    );
  });
});

describe("matchPublishedContentTitle", () => {
  it("matches a published blog post by exact title", () => {
    const posts: KeywordResearchCandidate[] = [
      {
        type: "blog",
        id: "post-1",
        title: "How to Find Language Exchange Partners Online",
        slug: "how-to-find-language-exchange-partners-online",
        keywords: "language exchange, chat communities",
      },
    ];
    const match = matchPublishedContentTitle("How to Find Language Exchange Partners Online", posts);
    expect(match).toMatchObject({ status: "matched", match: { id: "post-1" }, confidence: "exact" });
  });

  it("matches a published page by h1 even when title has a | Yaarzo suffix", () => {
    const pages: KeywordResearchCandidate[] = [
      {
        type: "page",
        id: "page-jaipur",
        title: "Jaipur Chat Room",
        slug: "jaipur-chat-room",
        aliases: ["Jaipur Chat Room | Yaarzo", "Jaipur Chat Room", "Jaipur Chat Room – Free Online Chat & Community"],
        keywords: null,
      },
    ];
    expect(matchPublishedContentTitle("Jaipur Chat Room", pages)).toMatchObject({
      status: "matched",
      match: { id: "page-jaipur" },
    });
    expect(matchPublishedContentTitle("Jaipur", pages)).toMatchObject({
      status: "matched",
      match: { id: "page-jaipur" },
    });
  });

  it("reports no published match instead of guessing", () => {
    const match = matchPublishedContentTitle("This Title Does Not Exist Anywhere", []);
    expect(match.status).toBe("none");
    if (match.status === "none") {
      expect(match.message).toBe("No matching published item found for 'This Title Does Not Exist Anywhere'");
    }
  });
});

describe("prepareKeywordResearchTags", () => {
  it("trims chat-heavy dumps so detectHashtagDump is false", () => {
    const dump = [
      "karachi chat room",
      "chat rooms in karachi",
      "best karachi chat rooms",
      "karachi live chat",
      "free karachi chat",
      "karachi friendship chat",
      "pakistan chat",
      "online chat karachi",
    ];
    expect(detectHashtagDump(dump)).toBe(true);
    const prep = prepareKeywordResearchTags(dump, { maxTags: 10 });
    expect(detectHashtagDump(prep.tags)).toBe(false);
    expect(prep.dumpAvoided).toBe(true);
    expect(prep.trimmed).toBe(true);
    expect(prep.warning).toContain("hashtag-dump");
  });
});

describe("content-automation keyword-research wiring", () => {
  it("keeps Paste Keyword Research dialog on published/editor surfaces; pending queue uses per-row modal", () => {
    const publishedSurfaces = [
      "src/components/blog/BlogModerateView.tsx",
      "src/routes/admin.pages.all.tsx",
      "src/components/blog/BlogEditorView.tsx",
      "src/routes/pages-editor.$id.tsx",
    ];
    for (const rel of publishedSurfaces) {
      const src = readFileSync(resolve(process.cwd(), rel), "utf8");
      expect(src, rel).toContain("Paste Keyword Research");
      expect(src, rel).toContain("PasteKeywordResearchDialog");
    }
    const admin = readFileSync(resolve(process.cwd(), "src/routes/admin.content-automation.tsx"), "utf8");
    expect(admin).toContain("PendingKeywordResearchDialog");
    expect(admin).toContain("Keyword Research");
    expect(admin).toContain("Send to Content Generation");
    expect(admin).not.toContain("PasteKeywordResearchDialog");
    const parser = readFileSync(resolve(process.cwd(), "src/lib/content-automation/parse-keyword-research.ts"), "utf8");
    expect(parser).toContain("export function parseKeywordResearch");
    expect(parser).toContain("export function matchKeywordResearchTitle");
    expect(parser).toContain("export function matchPublishedContentTitle");
    expect(parser).toContain("detectHashtagDump");
  });
});
