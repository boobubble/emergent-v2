import { describe, it, expect } from "vitest";
import {
  conflictLabelFromSources,
  previewBulkRow,
  resolveBulkDuplicate,
  expandBulkPreviews,
  buildAmbiguousCityIndex,
  resolveCityPageSlug,
} from "./bulk-generate";
import { buildTemplateVars, renderTemplate, renderCtaTemplate, renderFaqTemplate } from "./template-engine";
import { customPageSitemapEntries } from "@/lib/seo/sitemap";
import { isPubliclyVisibleStatus } from "./schemas";
import { disambiguateCitySlugWithCountry, isAmbiguousCity } from "./city-slug-policy";
import { extractContentBlocks, selectRelatedCities } from "./city-page-context";
import { TEMPLATES, CITY_SLUG_POLICY } from "./phase4a/taxonomy-data";

const cityKg = {
  id: "55555555-5555-5555-5555-555555555555",
  name: "City Chat Room",
  slug: "city-chat-room",
  primary_pattern: "{city} chat room",
  title_pattern: "{primary_keyword} | {brand}",
  meta_title_pattern: "{primary_keyword} | Free Online Chat on {brand}",
  meta_description_pattern: "Join free {city} chat rooms on {brand}.",
  h1_pattern: "{primary_keyword}",
  slug_pattern: "{city}-chat-room",
};

const cityTplSeed = TEMPLATES.find((t) => t.slug === "city-chat-room")!;
const countryTplSeed = TEMPLATES.find((t) => t.slug === "country-chat-room")!;
const cityTpl = {
  id: "66666666-6666-6666-6666-666666666666",
  name: cityTplSeed.name,
  slug: cityTplSeed.slug,
  intro_template: cityTplSeed.intro_template,
  content_template: cityTplSeed.content_template,
  meta_title_template: cityTplSeed.meta_title_template,
  meta_description_template: cityTplSeed.meta_description_template,
  h1_template: cityTplSeed.h1_template,
  cta_template: cityTplSeed.cta_template,
  faq_template: cityTplSeed.faq_template,
};
const countryTpl = {
  id: "88888888-8888-8888-8888-888888888888",
  name: countryTplSeed.name,
  slug: countryTplSeed.slug,
  intro_template: countryTplSeed.intro_template,
  content_template: countryTplSeed.content_template,
  meta_title_template: countryTplSeed.meta_title_template,
  meta_description_template: countryTplSeed.meta_description_template,
  h1_template: countryTplSeed.h1_template,
  cta_template: countryTplSeed.cta_template,
  faq_template: countryTplSeed.faq_template,
};

const countryKg = {
  ...cityKg,
  id: "77777777-7777-7777-7777-777777777777",
  slug: "country-chat-room",
  primary_pattern: "{country} chat room",
  slug_pattern: "{country}-chat-room",
};

const catalog = [
  { name: "Karachi", slug: "karachi", stateSlug: "sindh", countrySlug: "pakistan" },
  { name: "Hyderabad", slug: "hyderabad", stateSlug: "sindh", countrySlug: "pakistan" },
  { name: "Islamabad", slug: "islamabad", stateSlug: "islamabad-capital-territory", countrySlug: "pakistan" },
  { name: "Rawalpindi", slug: "rawalpindi", stateSlug: "punjab", countrySlug: "pakistan" },
  { name: "Hyderabad", slug: "hyderabad", stateSlug: "telangana", countrySlug: "india" },
  { name: "Mumbai", slug: "mumbai", stateSlug: "maharashtra", countrySlug: "india" },
  { name: "Delhi", slug: "delhi", stateSlug: "delhi", countrySlug: "india" },
  { name: "Bengaluru", slug: "bengaluru", stateSlug: "karnataka", countrySlug: "india" },
];

describe("Phase 4B.1 city slug collision policy", () => {
  it("marks Hyderabad as ambiguous across India and Pakistan", () => {
    const idx = buildAmbiguousCityIndex(
      catalog.map((c) => ({ name: c.name, slug: c.slug, countrySlug: c.countrySlug })),
    );
    expect(idx.names.has("hyderabad")).toBe(true);
    expect(idx.slugs.has("hyderabad")).toBe(true);
    expect(idx.names.has("karachi")).toBe(false);
    expect(idx.names.has("mumbai")).toBe(false);
  });

  it("unique cities keep {city}-chat-room", () => {
    const idx = buildAmbiguousCityIndex(
      catalog.map((c) => ({ name: c.name, slug: c.slug, countrySlug: c.countrySlug })),
    );
    const karachi = resolveCityPageSlug({
      cityName: "Karachi",
      citySlug: "karachi",
      countrySlug: "pakistan",
      renderedSlug: "karachi-chat-room",
      ambiguity: idx,
    });
    expect(karachi).toEqual({ slug: "karachi-chat-room", disambiguated: false });
    expect(CITY_SLUG_POLICY.exampleUnique).toContain("karachi-chat-room");
  });

  it("ambiguous cities use {city}-{country}-chat-room for BOTH countries", () => {
    const idx = buildAmbiguousCityIndex(
      catalog.map((c) => ({ name: c.name, slug: c.slug, countrySlug: c.countrySlug })),
    );
    const pk = resolveCityPageSlug({
      cityName: "Hyderabad",
      citySlug: "hyderabad",
      countrySlug: "pakistan",
      renderedSlug: "hyderabad-chat-room",
      ambiguity: idx,
    });
    const inn = resolveCityPageSlug({
      cityName: "Hyderabad",
      citySlug: "hyderabad",
      countrySlug: "india",
      renderedSlug: "hyderabad-chat-room",
      ambiguity: idx,
    });
    expect(pk.slug).toBe("hyderabad-pakistan-chat-room");
    expect(inn.slug).toBe("hyderabad-india-chat-room");
    expect(pk.disambiguated).toBe(true);
    expect(inn.disambiguated).toBe(true);
    expect(pk.slug).not.toBe("hyderabad-chat-room");
    expect(inn.slug).not.toBe("hyderabad-chat-room");
  });

  it("disambiguateCitySlugWithCountry works for other city-scoped patterns", () => {
    expect(disambiguateCitySlugWithCountry("hyderabad-girls-chat-room", "hyderabad", "india")).toBe(
      "hyderabad-india-girls-chat-room",
    );
  });

  it("expandBulkPreviews emits distinct Hyderabad slugs with no collision", () => {
    const locs = [
      {
        countryId: "11111111-1111-1111-1111-111111111111",
        countryName: "Pakistan",
        countrySlug: "pakistan",
        stateId: "22222222-2222-2222-2222-222222222222",
        stateName: "Sindh",
        stateSlug: "sindh",
        cityId: "33333333-3333-3333-3333-333333333333",
        cityName: "Hyderabad",
        citySlug: "hyderabad",
      },
      {
        countryId: "44444444-4444-4444-4444-444444444444",
        countryName: "India",
        countrySlug: "india",
        stateId: "55555555-5555-5555-5555-555555555555",
        stateName: "Telangana",
        stateSlug: "telangana",
        cityId: "66666666-6666-6666-6666-666666666666",
        cityName: "Hyderabad",
        citySlug: "hyderabad",
      },
    ];
    const rows = expandBulkPreviews({
      page_type: "city",
      brand: "Yaarzo",
      locations: locs,
      keywordGroup: cityKg,
      template: cityTpl,
      cityCatalog: catalog,
      language: "en",
    });
    expect(rows.map((r) => r.slug).sort()).toEqual([
      "hyderabad-india-chat-room",
      "hyderabad-pakistan-chat-room",
    ]);
    expect(new Set(rows.map((r) => r.slug)).size).toBe(2);
  });
});

describe("Phase 4B controlled generation rules", () => {
  it("Lahore duplicate resolves to SKIP (never overwrite/suffix)", () => {
    const r = resolveBulkDuplicate(
      "skip",
      [{ source: "custom_page", existingId: "e26569bc-f359-47a6-9646-2da179ee183a" }],
      "lahore-chat-room",
    );
    expect(r.action).toBe("skip");
    expect(r.slug).toBe("lahore-chat-room");
    expect(conflictLabelFromSources(["custom_page"], "skip")).toBe("Existing Page");
  });

  it("draft generation stays non-public", () => {
    expect(isPubliclyVisibleStatus("draft")).toBe(false);
    expect(isPubliclyVisibleStatus("published")).toBe(true);
  });

  it("noindex drafts are excluded from custom page sitemap helper", () => {
    const entries = customPageSitemapEntries(
      [
        { slug: "karachi-chat-room", noindex: true },
        { slug: "lahore-chat-room", noindex: false },
      ],
      new Set(),
      { canonical_domain: "https://example.com" } as never,
    );
    expect(entries.map((e) => e.loc)).toEqual(["https://example.com/lahore-chat-room"]);
  });

  it("country page generation resolves tokens and CTA/FAQ", () => {
    const loc = {
      countryId: "11111111-1111-1111-1111-111111111111",
      countryName: "Pakistan",
      countrySlug: "pakistan",
    };
    const row = previewBulkRow({
      page_type: "country",
      brand: "Yaarzo",
      locations: [loc],
      keywordGroup: countryKg,
      template: countryTpl,
      language: "en",
    }, loc);
    expect(row.slug).toBe("pakistan-chat-room");
    expect(row.cta_content?.text).toContain("Pakistan");
    expect(row.faq_content?.length).toBeGreaterThan(0);
    expect(JSON.stringify(row)).not.toMatch(/\{[a-z_]+\}/i);
  });

  it("city page generation resolves tokens, CTA/FAQ, and nearby blocks", () => {
    const loc = {
      countryId: "11111111-1111-1111-1111-111111111111",
      countryName: "Pakistan",
      countrySlug: "pakistan",
      stateId: "22222222-2222-2222-2222-222222222222",
      stateName: "Sindh",
      stateSlug: "sindh",
      cityId: "33333333-3333-3333-3333-333333333333",
      cityName: "Karachi",
      citySlug: "karachi",
    };
    const row = previewBulkRow({
      page_type: "city",
      brand: "Yaarzo",
      locations: [loc],
      keywordGroup: cityKg,
      template: cityTpl,
      cityCatalog: catalog,
      language: "en",
    }, loc);
    expect(row.slug).toBe("karachi-chat-room");
    expect(row.h1?.toLowerCase()).toContain("karachi");
    expect(row.content).toContain("Sindh");
    expect(row.content).toContain("Pakistan");
    expect(row.content).toMatch(/data-block="nearby"/);
    expect(row.cta_content?.text).toContain("Karachi");
    expect(row.faq_content?.[0]?.q).toContain("Karachi");
    expect(JSON.stringify(row)).not.toMatch(/\{[a-z_]+\}/i);
    const blocks = extractContentBlocks(row.content);
    expect(blocks.location).toContain("Sindh");
    expect(blocks.nearby.length).toBeGreaterThan(0);
    expect(blocks.country_context).toContain("Pakistan");
  });

  it("category page slug pattern resolves without leftover tokens", () => {
    const vars = buildTemplateVars({
      brand: "Yaarzo",
      category: "Girls Chat",
      primary_keyword: "Girls Chat Room",
    });
    const slug = renderTemplate("{category}-room", vars);
    expect(slug.toLowerCase()).toContain("girls");
    expect(slug).not.toMatch(/\{/);
    expect(renderTemplate("{primary_keyword} | {brand}", vars)).toBe("Girls Chat Room | Yaarzo");
  });

  it("expandBulkPreviews does not insert and keeps batch local", () => {
    const rows = expandBulkPreviews({
      page_type: "city",
      brand: "Yaarzo",
      locations: [
        {
          countryId: "11111111-1111-1111-1111-111111111111",
          countryName: "India",
          countrySlug: "india",
          cityId: "33333333-3333-3333-3333-333333333333",
          cityName: "Mumbai",
          citySlug: "mumbai",
          stateId: "22222222-2222-2222-2222-222222222222",
          stateName: "Maharashtra",
          stateSlug: "maharashtra",
        },
      ],
      keywordGroup: cityKg,
      template: cityTpl,
      cityCatalog: catalog,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].slug).toBe("mumbai-chat-room");
  });

  it("controlled batch draft + noindex stay non-public / non-sitemap", () => {
    const status = "draft" as const;
    const noindex = true;
    expect(isPubliclyVisibleStatus(status)).toBe(false);
    expect(noindex).toBe(true);
    const entries = customPageSitemapEntries(
      [{ slug: "karachi-chat-room", noindex }],
      new Set(),
      { canonical_domain: "https://yaarzo.com" } as never,
    );
    expect(entries).toHaveLength(0);
  });

  it("CTA/FAQ renderers leave no unresolved tokens", () => {
    const vars = buildTemplateVars({
      brand: "Yaarzo",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      primary_keyword: "Mumbai chat room",
      nearby_cities: "Pune, Ahmedabad",
      country_hub_label: "India chat room",
    });
    const cta = renderCtaTemplate(cityTpl.cta_template, vars);
    const faq = renderFaqTemplate(cityTpl.faq_template, vars);
    expect(JSON.stringify(cta)).not.toMatch(/\{[a-z_]+\}/i);
    expect(JSON.stringify(faq)).not.toMatch(/\{[a-z_]+\}/i);
  });

  it("related cities prefer same-state then same-country", () => {
    const related = selectRelatedCities({
      cityName: "Hyderabad",
      citySlug: "hyderabad",
      stateName: "Sindh",
      stateSlug: "sindh",
      countryName: "Pakistan",
      countrySlug: "pakistan",
      catalog,
    }, 4);
    expect(related.every((c) => c.countrySlug === "pakistan")).toBe(true);
    expect(related.some((c) => c.slug === "hyderabad")).toBe(false);
    expect(related[0]?.stateSlug).toBe("sindh");
  });

  it("isAmbiguousCity is false for unique names", () => {
    const idx = buildAmbiguousCityIndex(
      catalog.map((c) => ({ name: c.name, slug: c.slug, countrySlug: c.countrySlug })),
    );
    expect(isAmbiguousCity({ name: "Lahore", slug: "lahore" }, idx)).toBe(false);
  });

  it("never emits bare hyderabad-chat-room when both countries are present", () => {
    const locs = [
      {
        countryId: "11111111-1111-1111-1111-111111111111",
        countryName: "Pakistan",
        countrySlug: "pakistan",
        stateId: "22222222-2222-2222-2222-222222222222",
        stateName: "Sindh",
        stateSlug: "sindh",
        cityId: "33333333-3333-3333-3333-333333333333",
        cityName: "Hyderabad",
        citySlug: "hyderabad",
      },
      {
        countryId: "44444444-4444-4444-4444-444444444444",
        countryName: "India",
        countrySlug: "india",
        stateId: "55555555-5555-5555-5555-555555555555",
        stateName: "Telangana",
        stateSlug: "telangana",
        cityId: "66666666-6666-6666-6666-666666666666",
        cityName: "Hyderabad",
        citySlug: "hyderabad",
      },
    ];
    const rows = expandBulkPreviews({
      page_type: "city",
      brand: "Yaarzo",
      locations: locs,
      keywordGroup: cityKg,
      template: cityTpl,
      cityCatalog: catalog,
      language: "en",
      noindex: true,
      status: "draft",
    });
    expect(rows.every((r) => r.slug !== "hyderabad-chat-room")).toBe(true);
    expect(rows.every((r) => r.slug.includes("-india-") || r.slug.includes("-pakistan-"))).toBe(true);
  });
});
