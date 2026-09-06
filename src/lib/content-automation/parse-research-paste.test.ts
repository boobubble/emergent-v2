import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  mergeParseResults,
  mergeResearchKeywords,
  parseAdditionalKeywordsPaste,
  parseKeywordClusterPaste,
  parseKeywordIdeasPaste,
} from "./parse-research-paste";
import { analyzeResearchPaste } from "./parse-research-paste";
import { buildResearchOpportunities, planResearchSave } from "./research-opportunities";
import type { InventoryKeywordRow } from "./cannibalization";

const RYROB = `Cluster: Indian Chat Room (Informational)
- indian chat room
- India chat room
- indian chat rooms
- indian online chat
- free indian chat room
- indian chat room to make friends
- https://www.example.com/ignore
- indian chat room

Cluster: Pakistan Chat Room
Primary: pakistan chat room
Secondary: pakistan chat rooms, pakistani chat
Long-tail: free pakistan chat room to make friends
`;

const NEIL_PATEL = `Keyword Ideas
Keyword	Volume	SEO Difficulty	CPC	Paid Difficulty	Intent
indian chat room	2,900	35	0.42	18	local
india chat room	1,200	28	0.31	12	local
how to make friends online	2,100	22	0.11	9	informational
`;

const UBERSUGGEST = `Keyword,Search Volume,SEO Difficulty,CPC,Competition
indian chat room,2900,35,0.42,0.41
chat with indian people,480,19,0.08,0.12
`;

const inventory: InventoryKeywordRow[] = [
  {
    content_type: "page",
    source_id: "1",
    slug: "india-chat-room",
    canonical_url: "https://yaarzo.com/india-chat-room",
    title: "India Chat Room",
    primary_keyword: "Indian chat room",
    search_intent: "local",
  },
];

describe("RyRob-style cluster parsing", () => {
  it("preserves cluster name, primary, secondary, long-tail, and source", () => {
    const parsed = parseKeywordClusterPaste(RYROB);
    expect(parsed.source).toBe("ryrob");
    expect(parsed.clusters.length).toBe(2);
    const indian = parsed.clusters.find((c) => /indian chat room/i.test(c.name));
    expect(indian?.primary.toLowerCase()).toBe("indian chat room");
    expect(indian?.secondary.some((k) => /india chat room/i.test(k))).toBe(true);
    expect(indian?.longTail.some((k) => /make friends/i.test(k))).toBe(true);
    expect(indian?.intent).toBe("informational");
    expect(parsed.keywords.some((k) => k.sources.includes("ryrob") && k.cluster)).toBe(true);
    expect(parsed.keywords.some((k) => /example.com/i.test(k.keyword))).toBe(false);
  });
});

describe("Neil Patel / Ubersuggest table parsing", () => {
  it("extracts keyword metrics from a Neil Patel-style table", () => {
    const parsed = parseKeywordIdeasPaste(NEIL_PATEL);
    expect(parsed.source).toBe("neil_patel");
    const row = parsed.keywords.find((k) => k.keyword.toLowerCase() === "indian chat room");
    expect(row?.search_volume).toBe(2900);
    expect(row?.seo_difficulty).toBe(35);
    expect(row?.cpc).toBe(0.42);
    expect(row?.paid_difficulty).toBe(18);
    expect(row?.search_intent).toBe("local");
  });

  it("parses Ubersuggest-style pasted CSV", () => {
    const parsed = parseAdditionalKeywordsPaste(UBERSUGGEST);
    expect(parsed.source).toBe("ubersuggest");
    expect(parsed.keywords.some((k) => k.keyword.toLowerCase() === "chat with indian people")).toBe(true);
    expect(parsed.keywords.find((k) => /indian chat room/i.test(k.keyword))?.search_volume).toBe(2900);
  });

  it("parses newline keyword lists and tab-separated rows", () => {
    const lines = parseAdditionalKeywordsPaste("indian chat rooms\nfree indian chat room\n\nchat with indian people");
    expect(lines.keywords).toHaveLength(3);
    const tabs = parseKeywordIdeasPaste("keyword\tvolume\tcpc\nindian online chat\t880\t0.2");
    expect(tabs.keywords[0]?.keyword.toLowerCase()).toBe("indian online chat");
    expect(tabs.keywords[0]?.search_volume).toBe(880);
  });
});

describe("normalization, duplicates, and multi-source merge", () => {
  it("detects case-insensitive duplicates and preserves metrics", () => {
    const parsed = parseKeywordClusterPaste(RYROB);
    expect(parsed.duplicatesRemoved).toBeGreaterThan(0);
    const keys = parsed.keywords.map((k) => k.keyword.toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("merges cluster + Neil Patel + Ubersuggest into one record", () => {
    const merged = mergeParseResults([
      parseKeywordClusterPaste(RYROB),
      parseKeywordIdeasPaste(NEIL_PATEL),
      parseAdditionalKeywordsPaste(UBERSUGGEST),
    ]);
    const row = merged.keywords.find((k) => k.keyword.toLowerCase() === "indian chat room");
    expect(row).toBeTruthy();
    expect(row?.cluster?.toLowerCase()).toContain("indian chat room");
    expect(row?.search_volume).toBe(2900);
    expect(row?.seo_difficulty).toBe(35);
    expect(row?.sources).toEqual(expect.arrayContaining(["ryrob", "neil_patel", "ubersuggest"]));
    expect(merged.keywords.filter((k) => k.keyword.toLowerCase() === "indian chat room")).toHaveLength(1);
  });

  it("metric merge never invents volume and keeps the first available number", () => {
    const a = mergeResearchKeywords(
      { keyword: "indian chat room", keyword_type: "primary", cluster: "Indian Chat Room", parent_keyword: null, search_volume: null, seo_difficulty: null, paid_difficulty: null, competition: null, cpc: null, search_intent: "local", sources: ["ryrob"], related_keywords: [] },
      { keyword: "Indian Chat Room", keyword_type: "secondary", cluster: null, parent_keyword: null, search_volume: 2900, seo_difficulty: 35, paid_difficulty: 18, competition: null, cpc: 0.42, search_intent: "local", sources: ["neil_patel"], related_keywords: [] },
    );
    expect(a.search_volume).toBe(2900);
    expect(a.keyword_type).toBe("primary");
    expect(a.sources).toEqual(["ryrob", "neil_patel"]);
  });
});

describe("opportunities, inventory, and cannibalization", () => {
  it("skips an exact existing primary instead of creating a new page", () => {
    const merged = mergeParseResults([parseKeywordClusterPaste(RYROB)]);
    const opps = buildResearchOpportunities({
      keywords: merged.keywords,
      clusters: merged.clusters,
      inventory,
      pending: [],
    });
    const indian = opps.find((o) => o.primaryKeyword.toLowerCase() === "indian chat room");
    expect(indian?.action).toBe("skip_cannibalization");
    const plan = planResearchSave(opps);
    expect(plan.skipCount).toBeGreaterThan(0);
    expect(plan.createIdeas.some((o) => o.primaryKeyword.toLowerCase() === "indian chat room")).toBe(false);
  });

  it("merges into a pending idea when the topic is already queued", () => {
    const merged = mergeParseResults([parseKeywordClusterPaste(RYROB)]);
    const opps = buildResearchOpportunities({
      keywords: merged.keywords,
      clusters: merged.clusters,
      inventory: [],
      pending: [{
        id: 9,
        type: "page",
        identifier: "india-chat-room",
        title: "Indian Chat Room",
        keywords: "indian chat room",
        status: "pending",
      }],
    });
    const indian = opps.find((o) => o.primaryKeyword.toLowerCase() === "indian chat room");
    expect(indian?.action).toBe("merge_existing");
    const plan = planResearchSave(opps);
    expect(plan.appendToPending.some((row) => row.id === 9)).toBe(true);
    expect(plan.newCount).toBeGreaterThanOrEqual(0);
  });

  it("creates a pending opportunity for a new cluster with no inventory match", () => {
    const merged = mergeParseResults([parseKeywordClusterPaste(`Cluster: How to Make Friends Online (Informational)
- how to make friends online
- make friends after moving
- tips to make friends online after college
`)]);
    const opps = buildResearchOpportunities({
      keywords: merged.keywords,
      clusters: merged.clusters,
      inventory,
      pending: [],
    });
    expect(opps.some((o) => o.action === "new_content" && o.contentType === "blog")).toBe(true);
    const plan = planResearchSave(opps);
    expect(plan.createIdeas.length).toBeGreaterThan(0);
    expect(plan.createIdeas[0]?.categorySlug || plan.createIdeas[0]?.section).toBeTruthy();
  });
});

describe("idempotent and malformed input", () => {
  it("repeated paste of the same research does not create extra keywords", () => {
    const first = analyzeResearchPaste({ clusterText: RYROB, ideasText: NEIL_PATEL });
    const second = mergeParseResults([
      { source: "ryrob", clusters: first.merged.clusters, keywords: first.merged.keywords, duplicatesRemoved: 0, errors: [] },
      parseKeywordClusterPaste(RYROB),
      parseKeywordIdeasPaste(NEIL_PATEL),
    ]);
    expect(second.keywords.length).toBe(first.merged.keywords.length);
    expect(second.keywords.filter((k) => k.keyword.toLowerCase() === "indian chat room")).toHaveLength(1);
  });

  it("tolerates malformed, partial, and empty input", () => {
    const messy = parseKeywordIdeasPaste("Keyword Ideas\n\nnot-a-table\nindian chat room\t\t\n   \nVolume only 99");
    expect(messy.keywords.some((k) => /indian chat room/i.test(k.keyword))).toBe(true);
    const empty = parseKeywordClusterPaste("");
    expect(empty.keywords).toHaveLength(0);
    expect(empty.errors.length).toBeGreaterThan(0);
    const blank = analyzeResearchPaste({});
    expect(blank.merged.keywords).toHaveLength(0);
  });
});

describe("admin workflow wiring", () => {
  it("adds Keyword Research Input and no longer requires the Excel template", () => {
    const admin = readFileSync(resolve(process.cwd(), "src/routes/admin.content-automation.tsx"), "utf8");
    expect(admin).toContain("KeywordResearchInput");
    expect(admin).not.toContain("yaarzo-content-ideas-import-template.xlsx");
    expect(admin).not.toContain("Import from Excel");
    expect(admin).toContain("Paste Keyword Research");
    const ui = readFileSync(resolve(process.cwd(), "src/lib/content-automation/keyword-research-input.tsx"), "utf8");
    expect(ui).toContain("Keyword Research Input");
    expect(ui).toContain("Save & Add to SEO Engine");
    expect(ui).toContain("Parse Keyword Cluster");
    expect(ui).toContain("Parse Keyword Ideas");
  });
});
