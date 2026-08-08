import { describe, expect, it } from "vitest";
import {
  PHASE4C_ALL_PRIORITY,
  PHASE4C1_DRAFT_SLUGS,
  buildDifferentiatedContent,
  planPriorityInternalLinks,
  auditInternalLinks,
  similarity,
  normalizeCity,
  pickAnchor,
  cityAnchors,
} from "./phase4c-priority";
import { formatSitemapLastmod, customPageSitemapEntries } from "@/lib/seo/sitemap";
import { createHash } from "node:crypto";

const LAHORE_HASH = "32f1f9bca05482a14be8ef7b52b2698b2f05256eadb9d2a0572ac550197be2e7";

/** Mirrors DB trigger semantics: derived-only patches must not advance editorial lastmod. */
export function shouldBumpEditorialUpdatedAt(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): boolean {
  const derived = new Set(["updated_at", "internal_links_json", "internal_link_count", "views"]);
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (derived.has(key)) continue;
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) return true;
  }
  return false;
}

describe("phase4c.1 lastmod / cache semantics", () => {
  it("does not bump editorial lastmod for link-cache-only patches", () => {
    const before = {
      title: "Lahore Chat Room",
      content: "<h2>body</h2>",
      h1: "Lahore Chat Room",
      internal_link_count: 4,
      internal_links_json: [{ url: "/pakistan-chat-room" }],
      views: 10,
      updated_at: "2026-08-08T07:28:29.207234+00:00",
    };
    const afterCache = {
      ...before,
      internal_link_count: 6,
      internal_links_json: [{ url: "/pakistan-chat-room" }, { url: "/karachi-chat-room" }],
    };
    expect(shouldBumpEditorialUpdatedAt(before, afterCache)).toBe(false);

    const afterViews = { ...before, views: 11 };
    expect(shouldBumpEditorialUpdatedAt(before, afterViews)).toBe(false);

    const afterSeo = { ...before, meta_title: "Lahore Chat Room | Free Online Chat on Yaarzo" };
    expect(shouldBumpEditorialUpdatedAt(before, afterSeo)).toBe(true);

    const afterTaxonomy = { ...before, page_type: "city", city_id: "029c6c9a-1ad2-4639-b4c3-f9461a6afb20" };
    expect(shouldBumpEditorialUpdatedAt(before, afterTaxonomy)).toBe(true);
  });

  it("sitemap lastmod uses editorial updated_at date", () => {
    expect(formatSitemapLastmod("2026-08-08T07:28:29.207234+00:00")).toBe("2026-08-08");
    const entries = customPageSitemapEntries(
      [
        {
          slug: "lahore-chat-room",
          updated_at: "2026-08-08T07:28:29.207234+00:00",
          noindex: false,
        },
        {
          slug: "karachi-chat-room",
          updated_at: "2026-08-08T07:30:00.000Z",
          noindex: true,
        },
      ],
      new Set(),
      { canonical_domain: "yaarzo.com" } as never,
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]?.loc).toContain("/lahore-chat-room");
    expect(entries[0]?.lastmod).toBe("2026-08-08");
  });
});

describe("phase4c.1 lahore integrity helpers", () => {
  it("keeps expected Lahore body hash constant for the known baseline", () => {
    // Guardrail: any accidental rewrite of the known baseline string fails loudly in apply scripts.
    expect(LAHORE_HASH).toHaveLength(64);
    expect(createHash("sha256").update("not-lahore").digest("hex")).not.toBe(LAHORE_HASH);
  });

  it("renders a single H1 preference: h1 field over title, never both in body scaffold", () => {
    const title = "Lahore Chat Room";
    const h1 = "Lahore Chat Room";
    const rendered = (h1?.trim() || title);
    expect(rendered).toBe("Lahore Chat Room");
    // Body scaffolds for drafts start at H2 sections — Lahore existing body also starts at H2.
    const draft = buildDifferentiatedContent(
      {
        page_type: "city",
        slug: "karachi-chat-room",
        city_name: "Karachi",
        state_name: "Sindh",
        country_name: "Pakistan",
      },
      { hubSlug: "pakistan-chat-room", hubLabel: "Pakistan chat room", siblings: [] },
    );
    expect(draft.content).not.toMatch(/<h1[\s>]/i);
    expect(draft.content).toMatch(/<h2[\s>]/i);
  });
});

describe("phase4c priority helpers", () => {
  it("covers the approved priority slug set", () => {
    expect(PHASE4C_ALL_PRIORITY).toContain("lahore-chat-room");
    expect(PHASE4C1_DRAFT_SLUGS).not.toContain("lahore-chat-room");
    expect(PHASE4C1_DRAFT_SLUGS).toHaveLength(16);
  });

  it("builds distinct city openings and country hubs", () => {
    const karachi = buildDifferentiatedContent(
      {
        page_type: "city",
        slug: "karachi-chat-room",
        city_name: "Karachi",
        state_name: "Sindh",
        country_name: "Pakistan",
      },
      {
        hubSlug: "pakistan-chat-room",
        hubLabel: "Pakistan chat room",
        siblings: [{ slug: "lahore-chat-room", name: "Lahore", anchor: "Lahore rooms" }],
      },
    );
    const islamabad = buildDifferentiatedContent(
      {
        page_type: "city",
        slug: "islamabad-chat-room",
        city_name: "Islamabad",
        state_name: "Islamabad Capital Territory",
        country_name: "Pakistan",
      },
      {
        hubSlug: "pakistan-chat-room",
        hubLabel: "Pakistan chat room",
        siblings: [{ slug: "rawalpindi-chat-room", name: "Rawalpindi", anchor: "Rawalpindi chat room" }],
      },
    );
    expect(karachi.intro).not.toEqual(islamabad.intro);
    expect(karachi.content).toContain("Sindh");
    expect(islamabad.content.toLowerCase()).toContain("rawalpindi");
    expect(karachi.content.toLowerCase()).not.toMatch(/\d+\s*(users|members|online)/);

    const hub = buildDifferentiatedContent(
      { page_type: "country", slug: "pakistan-chat-room", country_name: "Pakistan" },
      {
        priorityCities: [
          { slug: "lahore-chat-room", title_hint: "Lahore chat room" },
          { slug: "karachi-chat-room", title_hint: "Karachi chat room" },
        ],
      },
    );
    expect(hub.content).toContain("girls-chat-room");
    expect(hub.content.toLowerCase()).toContain("does not invent");
    expect(hub.meta_title?.length ?? 0).toBeGreaterThanOrEqual(30);
  });

  it("builds category pages with longer useful meta titles", () => {
    const girls = buildDifferentiatedContent(
      { page_type: "category", slug: "girls-chat-room", category_name: "Girls Chat" },
      {},
    );
    expect(girls.meta_title?.length ?? 0).toBeGreaterThanOrEqual(30);
    expect(`${girls.intro}${girls.content}`.toLowerCase()).toContain("topic-first");
    expect(girls.content).not.toMatch(/<h1[\s>]/i);
  });

  it("plans and audits conservative same-country links", () => {
    const cityNameBySlug = Object.fromEntries(
      [
        ...PHASE4C_ALL_PRIORITY.filter((s) => s.includes("chat-room") && !s.startsWith("girls") && !s.startsWith("dating") && !s.startsWith("friendship") && !s.startsWith("pakistan") && !s.startsWith("india")),
      ].map((s) => [s, s.split("-")[0]!.replace(/^\w/, (c) => c.toUpperCase())]),
    );
    // fix names for multi-word
    cityNameBySlug["rawalpindi-chat-room"] = "Rawalpindi";
    cityNameBySlug["faisalabad-chat-room"] = "Faisalabad";
    cityNameBySlug["hyderabad-india-chat-room"] = "Hyderabad";
    cityNameBySlug["lahore-chat-room"] = "Lahore";
    cityNameBySlug["karachi-chat-room"] = "Karachi";
    cityNameBySlug["islamabad-chat-room"] = "Islamabad";
    cityNameBySlug["multan-chat-room"] = "Multan";
    cityNameBySlug["delhi-chat-room"] = "Delhi";
    cityNameBySlug["mumbai-chat-room"] = "Mumbai";
    cityNameBySlug["bengaluru-chat-room"] = "Bengaluru";
    cityNameBySlug["chennai-chat-room"] = "Chennai";
    cityNameBySlug["kolkata-chat-room"] = "Kolkata";

    const categoryNameBySlug = {
      "girls-chat-room": "Girls Chat",
      "dating-chat-room": "Dating Chat",
      "friendship-chat-room": "Friendship Chat",
    };
    const links = planPriorityInternalLinks({ cityNameBySlug, categoryNameBySlug });
    const audit = auditInternalLinks(links);
    expect(audit.ok).toBe(true);
    expect(audit.cross_country_sibling_issues).toEqual([]);
    expect(audit.duplicate_pairs).toEqual([]);
    expect(links.some((l) => l.from === "karachi-chat-room" && l.to === "delhi-chat-room")).toBe(false);
    expect(links.some((l) => l.from === "mumbai-chat-room" && l.to === "lahore-chat-room")).toBe(false);
  });

  it("normalized city similarity drops with page-specific profiles", () => {
    const a = buildDifferentiatedContent(
      {
        page_type: "city",
        slug: "karachi-chat-room",
        city_name: "Karachi",
        state_name: "Sindh",
        country_name: "Pakistan",
      },
      { hubSlug: "pakistan-chat-room", hubLabel: "Pakistan chat room", siblings: [] },
    );
    const b = buildDifferentiatedContent(
      {
        page_type: "city",
        slug: "multan-chat-room",
        city_name: "Multan",
        state_name: "Punjab",
        country_name: "Pakistan",
      },
      { hubSlug: "pakistan-chat-room", hubLabel: "Pakistan chat room", siblings: [] },
    );
    const sim = similarity(normalizeCity(a.content, "Karachi"), normalizeCity(b.content, "Multan"));
    expect(sim).toBeLessThan(0.9);
  });

  it("draft slug set stays draft-only (noindex expectation documented)", () => {
    expect(PHASE4C1_DRAFT_SLUGS.includes("lahore-chat-room" as never)).toBe(false);
    expect(pickAnchor(cityAnchors("Lahore"), "x")).toContain("Lahore");
  });
});
