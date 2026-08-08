import { describe, it, expect } from "vitest";
import {
  INDIA_CITIES,
  INDIA_STATES,
  PAKISTAN_CITIES,
  PAKISTAN_STATES,
  CATEGORIES,
  KEYWORD_GROUPS,
  TEMPLATES,
  LAHORE_MAPPING_PLAN,
  URL_STRATEGY_EXAMPLES,
  SEO_PRIORITY_BY_TIER,
  allCities,
} from "./taxonomy-data";
import { validatePhase4aTaxonomy, seoPriorityFor } from "./validate-taxonomy";

describe("Phase 4A taxonomy data quality", () => {
  it("validates without duplicate/spelling errors", () => {
    const res = validatePhase4aTaxonomy();
    const errors = res.issues.filter((i) => i.level === "error");
    expect(errors, JSON.stringify(errors, null, 2)).toEqual([]);
    expect(res.ok).toBe(true);
  });

  it("has expected India / Pakistan coverage counts", () => {
    expect(INDIA_STATES.length).toBe(36); // 28 states + 8 UTs
    expect(PAKISTAN_STATES.length).toBe(7);
    expect(INDIA_CITIES.length).toBeGreaterThanOrEqual(40);
    expect(PAKISTAN_CITIES.length).toBeGreaterThanOrEqual(20);
    expect(CATEGORIES.some((c) => c.slug === "chat-rooms" && c.parent_slug === null)).toBe(true);
    expect(CATEGORIES.filter((c) => c.parent_slug === "chat-rooms").length).toBeGreaterThanOrEqual(12);
    expect(KEYWORD_GROUPS.length).toBe(5);
    expect(TEMPLATES.length).toBe(4);
  });

  it("stores spelling variants as alt_names, not duplicate cities", () => {
    const cities = allCities().filter((c) => c.country === "india");
    expect(cities.some((c) => c.slug === "bangalore")).toBe(false);
    expect(cities.some((c) => c.slug === "bombay")).toBe(false);
    const bengaluru = cities.find((c) => c.slug === "bengaluru")!;
    expect(bengaluru.alt_names).toEqual(expect.arrayContaining(["Bangalore"]));
    const mumbai = cities.find((c) => c.slug === "mumbai")!;
    expect(mumbai.alt_names).toEqual(expect.arrayContaining(["Bombay"]));
  });

  it("allows same city slug across countries (Hyderabad IN vs PK)", () => {
    expect(INDIA_CITIES.some((c) => c.slug === "hyderabad")).toBe(true);
    expect(PAKISTAN_CITIES.some((c) => c.slug === "hyderabad")).toBe(true);
  });

  it("assigns SEO priority tiers without inventing search volume", () => {
    expect(SEO_PRIORITY_BY_TIER).toEqual({ 1: 90, 2: 60, 3: 30 });
    const lahore = PAKISTAN_CITIES.find((c) => c.slug === "lahore")!;
    expect(seoPriorityFor(lahore)).toBe(90);
  });

  it("plans India Punjab slug rename without recreating the row", () => {
    // Source uses canonical slug; migration renames Phase 1 punjab-in → punjab in place.
    expect(INDIA_STATES.find((s) => s.name === "Punjab")?.slug).toBe("punjab");
    expect(INDIA_STATES.filter((s) => s.name === "Punjab")).toHaveLength(1);
  });

  it("uses a single City Chat Room template slug (reuses Phase 1 default via rename)", () => {
    expect(TEMPLATES.filter((t) => /city chat room/i.test(t.name))).toHaveLength(1);
    expect(TEMPLATES.find((t) => t.name === "City Chat Room")?.slug).toBe("city-chat-room");
  });

  it("does not propose auto-saving Lahore custom_pages mapping in 4A", () => {
    expect(LAHORE_MAPPING_PLAN.slug).toBe("lahore-chat-room");
    expect(LAHORE_MAPPING_PLAN.proposed.page_type).toBe("city");
    expect(LAHORE_MAPPING_PLAN.proposed.city_slug).toBe("lahore");
    expect(LAHORE_MAPPING_PLAN.note.toLowerCase()).toContain("after explicit approval");
  });

  it("documents flat URL strategy without generating combination pages", () => {
    expect(URL_STRATEGY_EXAMPLES).toContain("/lahore-chat-room");
    expect(URL_STRATEGY_EXAMPLES).toContain("/lahore-girls-chat-room");
    expect(KEYWORD_GROUPS.find((g) => g.slug === "city-chat-room")?.slug_pattern).toBe("{city}-chat-room");
  });

  it("keeps keyword groups manageable (no near-duplicate explosion)", () => {
    expect(KEYWORD_GROUPS.length).toBeLessThanOrEqual(10);
    const slugs = KEYWORD_GROUPS.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
