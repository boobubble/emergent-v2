export type BulkBlogItem = {
  type: "blog";
  title: string;
  categorySlug: string;
  metaDescription: string;
  keywords: string | null;
};

export type BulkPageItem = {
  type: "page";
  slug: string;
  section: string;
  baseName: string;
  lookupCity: string | null;
  lookupCountryHint: string | null;
  keywords: string | null;
};

export type BulkParseError = {
  block: number;
  reason: string;
};

export type BulkParseResult = {
  blogItems: BulkBlogItem[];
  pageItems: BulkPageItem[];
  errors: BulkParseError[];
};

function emptyToNull(value?: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function pageSlugFromName(pageName: string, typeValue?: string | null): string {
  const base = slugify(pageName);
  const typeSlug = typeValue ? slugify(typeValue) : "";
  let body = base;
  if (typeSlug && body !== typeSlug && !body.endsWith(`-${typeSlug}`)) {
    body = `${body}-${typeSlug}`;
  }
  return `${body}-chat-room`;
}

function inferSection(country: string | null, typeValue: string | null): string {
  if (typeValue) return "city_subcategory";
  if (!country) return "interest";
  const c = country.toLowerCase();
  if (c === "pakistan") return "pakistan_city";
  if (c === "india") return "india_city";
  return "city";
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\u2028|\u2029/g, "\n");
}

function splitBlocks(text: string): string[] {
  const normalized = normalizeNewlines(text).trim();
  if (!normalized) return [];
  return normalized
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function parseBlockFields(block: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const rawLine of normalizeNewlines(block).split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon <= 0) continue;
    const label = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (!label) continue;
    fields[label] = value;
  }
  return fields;
}

function getField(fields: Record<string, string>, label: string): string | null {
  return emptyToNull(fields[label.toLowerCase()]);
}

/**
 * Parse the admin bulk-upload textarea into topic-ideas POST items.
 * Failed blocks are reported; valid blocks are still returned.
 */
export function parseBulkContentIdeas(text: string): BulkParseResult {
  const blogItems: BulkBlogItem[] = [];
  const pageItems: BulkPageItem[] = [];
  const errors: BulkParseError[] = [];
  const blocks = splitBlocks(text);

  blocks.forEach((block, index) => {
    const n = index + 1;
    const fields = parseBlockFields(block);
    const blog = getField(fields, "blog");
    const page = getField(fields, "page");

    if (blog && page) {
      errors.push({
        block: n,
        reason: `Block ${n}: has both "Blog:" and "Page:" — use one idea per block`,
      });
      return;
    }

    if (blog) {
      const about = getField(fields, "about");
      if (!about) {
        errors.push({
          block: n,
          reason: `Block ${n}: missing "About:" line for blog idea "${blog}"`,
        });
        return;
      }
      blogItems.push({
        type: "blog",
        title: blog,
        categorySlug: getField(fields, "category") ?? "chatrooms",
        metaDescription: about,
        keywords: getField(fields, "keywords"),
      });
      return;
    }

    if (page) {
      const country = getField(fields, "country");
      const typeValue = getField(fields, "type");
      pageItems.push({
        type: "page",
        slug: pageSlugFromName(page, typeValue),
        section: inferSection(country, typeValue),
        baseName: page,
        lookupCity: page,
        lookupCountryHint: country,
        keywords: getField(fields, "keywords"),
      });
      return;
    }

    errors.push({
      block: n,
      reason: `Block ${n}: missing "Blog:" or "Page:" line`,
    });
  });

  return { blogItems, pageItems, errors };
}
