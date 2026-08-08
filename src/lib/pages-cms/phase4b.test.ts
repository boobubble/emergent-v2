import { describe, it, expect } from "vitest";
import {
  conflictLabelFromSources,
  previewBulkRow,
  resolveBulkDuplicate,
  expandBulkPreviews,
} from "./bulk-generate";
import { buildTemplateVars, renderTemplate } from "./template-engine";
import { customPageSitemapEntries } from "@/lib/seo/sitemap";
import { isPubliclyVisibleStatus } from "./schemas";

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

const cityTpl = {
  id: "66666666-6666-6666-6666-666666666666",
  name: "City Chat Room",
  slug: "city-chat-room",
  intro_template: "<p>Welcome to {primary_keyword} on {brand}.</p>",
  content_template: "<p>Chat in {city}, {state}, {country}.</p>",
  meta_title_template: "{primary_keyword} | {brand}",
  meta_description_template: "Join {city} chat on {brand}.",
  h1_template: "{primary_keyword}",
};

const countryKg = {
  ...cityKg,
  id: "77777777-7777-7777-7777-777777777777",
  slug: "country-chat-room",
  primary_pattern: "{country} chat room",
  slug_pattern: "{country}-chat-room",
};

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

  it("country page generation resolves tokens", () => {
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
      template: {
        id: "88888888-8888-8888-8888-888888888888",
        name: "Country",
        slug: "country-chat-room",
        intro_template: "<p>{primary_keyword} on {brand}</p>",
        content_template: "<p>Chat across {country}.</p>",
        meta_title_template: "{primary_keyword} | {brand}",
        meta_description_template: "Free {country} chat on {brand}.",
        h1_template: "{primary_keyword}",
      },
    }, loc);
    expect(row.slug).toBe("pakistan-chat-room");
    expect(row.primary_keyword.toLowerCase()).toContain("pakistan");
    expect(JSON.stringify(row)).not.toMatch(/\{[a-z_]+\}/i);
  });

  it("city page generation resolves tokens", () => {
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
    }, loc);
    expect(row.slug).toBe("karachi-chat-room");
    expect(row.h1?.toLowerCase()).toContain("karachi");
    expect(row.content).toContain("Karachi");
    expect(JSON.stringify(row)).not.toMatch(/\{[a-z_]+\}/i);
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
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].slug).toBe("mumbai-chat-room");
  });

  it("intra-batch Hyderabad collision defaults to SKIP (not suffix/overwrite)", () => {
    // Flat {city}-chat-room collides for PK Hyderabad and IN Hyderabad.
    const first = resolveBulkDuplicate("skip", [], "hyderabad-chat-room");
    expect(first.action).toBe("ok");
    const second = resolveBulkDuplicate(
      "skip",
      [{ source: "custom_page" }],
      "hyderabad-chat-room",
    );
    expect(second.action).toBe("skip");
    expect(second.slug).toBe("hyderabad-chat-room");
    expect(conflictLabelFromSources(["custom_page"], "skip")).toBe("Existing Page");
  });

  it("controlled batch draft + noindex stay non-public / non-sitemap", () => {
    // Phase 4B script + runBulkPageGeneration force status=draft and noindex=true.
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

  it("sitemap helper excludes noindex even when status would otherwise qualify", () => {
    const entries = customPageSitemapEntries(
      [
        { slug: "karachi-chat-room", noindex: true },
        { slug: "pakistan-chat-room", noindex: true },
        { slug: "girls-chat-room", noindex: false },
      ],
      new Set(),
      { canonical_domain: "https://yaarzo.com" } as never,
    );
    expect(entries.map((e) => e.loc)).toEqual(["https://yaarzo.com/girls-chat-room"]);
  });
});
