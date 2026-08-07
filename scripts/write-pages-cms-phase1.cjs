#!/usr/bin/env node
/** One-shot writer for Pages CMS Phase 1 files (UTF-8, no BOM). */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\r?\n/g, "\n"), "utf8");
  console.log("wrote", rel);
}

write("src/lib/pages-cms/types.ts", `export type CmsPageType =
  | "static"
  | "country"
  | "state"
  | "city"
  | "category"
  | "country_category"
  | "state_category"
  | "city_category"
  | "keyword"
  | "custom_seo"
  | "hub";

export type CmsPageStatus = "draft" | "scheduled" | "published" | "archived";
export type CmsContentStatus = "empty" | "partial" | "complete";
export type DuplicateHandling = "skip" | "overwrite_metadata" | "overwrite_template" | "suffix";

export type TemplateVars = {
  brand: string;
  country: string;
  state: string;
  city: string;
  category: string;
  primary_keyword: string;
  year: string;
  [key: string]: string;
};

export const CMS_PAGE_TYPES: { value: CmsPageType; label: string }[] = [
  { value: "static", label: "Static Page" },
  { value: "country", label: "Country" },
  { value: "city", label: "City" },
  { value: "category", label: "Category" },
  { value: "custom_seo", label: "Custom SEO" },
  { value: "hub", label: "Hub Page" },
];
`);

write("src/lib/pages-cms/template-engine.ts", `import type { CmsContentStatus, TemplateVars } from "./types";

const VAR_PATTERN = /\\{([a-z_]+)\\}/gi;

export function renderTemplate(template: string, vars: TemplateVars): string {
  if (!template) return "";
  return template.replace(VAR_PATTERN, (_, key: string) => vars[key.toLowerCase()] ?? "");
}

export function buildTemplateVars(input: Partial<TemplateVars> & { brand?: string }): TemplateVars {
  return {
    brand: input.brand ?? "Yaarzo",
    country: input.country ?? "",
    state: input.state ?? "",
    city: input.city ?? "",
    category: input.category ?? "",
    primary_keyword: input.primary_keyword ?? "",
    year: String(new Date().getFullYear()),
  };
}

/** Merge optional intro/faq around canonical custom_pages.content (main body). */
export function composePageContent(parts: {
  intro?: string | null;
  content?: string | null;
  faq?: string | null;
}): string {
  return [parts.intro, parts.content, parts.faq].filter(Boolean).join("\\n");
}

export function deriveContentStatus(content: string): CmsContentStatus {
  const text = content.replace(/<[^>]+>/g, "").trim();
  if (!text) return "empty";
  if (text.length < 120) return "partial";
  return "complete";
}

export function computeSeoScore(page: {
  meta_title?: string | null;
  meta_description?: string | null;
  h1?: string | null;
  primary_keyword?: string | null;
  content?: string;
  noindex?: boolean;
}): number {
  let score = 0;
  if (page.meta_title && page.meta_title.length >= 30 && page.meta_title.length <= 60) score += 20;
  else if (page.meta_title) score += 10;
  if (page.meta_description && page.meta_description.length >= 70 && page.meta_description.length <= 160) score += 20;
  else if (page.meta_description) score += 10;
  if (page.h1) score += 15;
  if (page.primary_keyword) score += 10;
  const textLen = (page.content ?? "").replace(/<[^>]+>/g, "").trim().length;
  if (textLen >= 300) score += 20;
  else if (textLen >= 100) score += 10;
  if (!page.noindex) score += 15;
  return Math.min(100, score);
}
`);

write("src/lib/pages-cms/slug-conflicts.ts", `import { slugifyPageSlug, validatePageSlug } from "@/lib/page-slug";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type SlugConflictSource = "custom_page" | "reserved" | "redirect";

export async function findSlugConflicts(
  sb: SupabaseClient<Database>,
  rawSlug: string,
  opts?: { excludeCustomPageId?: string },
) {
  const slug = slugifyPageSlug(rawSlug);
  if (!slug) return [{ slug: rawSlug, source: "reserved" as const, message: "Invalid slug." }];

  const conflicts = [];
  const reservedErr = validatePageSlug(slug);
  if (reservedErr) conflicts.push({ slug, source: "reserved" as const, message: reservedErr });

  const [{ data: customPage }, { data: redirect }] = await Promise.all([
    sb.from("custom_pages").select("id, slug").eq("slug", slug).maybeSingle(),
    sb.from("page_redirects").select("from_slug").eq("from_slug", slug).maybeSingle(),
  ]);

  if (customPage && customPage.id !== opts?.excludeCustomPageId) {
    conflicts.push({
      slug,
      source: "custom_page" as const,
      existingId: customPage.id,
      message: \`Slug "\${slug}" is already used by a page.\`,
    });
  }
  if (redirect) {
    conflicts.push({ slug, source: "redirect" as const, message: \`Slug "\${slug}" is reserved as a redirect source.\` });
  }
  return conflicts;
}

export function resolveDuplicateSlug(baseSlug: string, attempt: number): string {
  const slug = slugifyPageSlug(baseSlug);
  if (attempt <= 0) return slug;
  const suffix = \`-\${attempt + 1}\`;
  return \`\${slug.slice(0, 80 - suffix.length)}\${suffix}\`;
}
`);

write("src/lib/pages-cms/template-engine.test.ts", `import { describe, it, expect } from "vitest";
import { renderTemplate, buildTemplateVars, computeSeoScore, deriveContentStatus } from "./template-engine";

describe("renderTemplate", () => {
  it("replaces variables", () => {
    const vars = buildTemplateVars({ brand: "Yaarzo", city: "Lahore", primary_keyword: "Lahore chat room" });
    expect(renderTemplate("{primary_keyword} | {brand}", vars)).toBe("Lahore chat room | Yaarzo");
  });
});

describe("deriveContentStatus", () => {
  it("detects empty and complete content", () => {
    expect(deriveContentStatus("")).toBe("empty");
    expect(deriveContentStatus(\`<p>\${"word ".repeat(40)}</p>\`)).toBe("complete");
  });
});

describe("computeSeoScore", () => {
  it("scores optimized pages higher", () => {
    const good = computeSeoScore({
      meta_title: "Lahore Chat Room Online Free Today Join",
      meta_description: "Join free Lahore chat rooms on Yaarzo. Meet people, make friends, and chat online with locals every day.",
      h1: "Lahore Chat Room",
      primary_keyword: "Lahore chat room",
      content: "<p>" + "content ".repeat(50) + "</p>",
      noindex: false,
    });
    expect(good).toBeGreaterThan(computeSeoScore({ content: "" }));
  });
});
`);

write("src/lib/pages-cms/slug-conflicts.test.ts", `import { describe, it, expect } from "vitest";
import { resolveDuplicateSlug } from "./slug-conflicts";

describe("resolveDuplicateSlug", () => {
  it("appends numeric suffix", () => {
    expect(resolveDuplicateSlug("lahore-chat-room", 1)).toBe("lahore-chat-room-2");
  });
});
`);

write(
  "supabase/migrations/20260807143000_pages_cms_taxonomy.sql",
  fs.readFileSync(path.join(__dirname, "pages-cms-taxonomy.sql"), "utf8"),
);

console.log("done");
