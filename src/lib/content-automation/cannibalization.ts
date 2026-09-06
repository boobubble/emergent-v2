import { db } from "@/lib/content-automation/db";
import type { SearchIntent, SeoContentType } from "@/lib/content-automation/seo-types";

export type InventoryKeywordRow = {
  content_type: SeoContentType;
  source_id: string;
  slug: string;
  canonical_url: string;
  title: string | null;
  primary_keyword: string | null;
  search_intent?: string | null;
};

export type CannibalizationHit = {
  kind: "exact_primary" | "similar_keyword" | "same_intent_topic";
  existing: InventoryKeywordRow;
  keyword: string;
  similarity: number;
  recommended_action: "review" | "keep_separate" | "improve_differentiation" | "change_secondary_targeting";
};

export function normalizeKeyword(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string): Set<string> {
  const out = new Set<string>();
  for (const raw of normalizeKeyword(value).split(" ")) {
    if (raw.length <= 2) continue;
    out.add(raw);
    if (raw.endsWith("s") && raw.length > 3) out.add(raw.slice(0, -1));
  }
  return out;
}

export function keywordSimilarity(a: string, b: string): number {
  const na = normalizeKeyword(a);
  const nb = normalizeKeyword(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = tokens(na);
  const tb = tokens(nb);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function detectCannibalization(input: {
  keyword: string;
  intent?: SearchIntent | null;
  contentType: SeoContentType;
  excludeSlug?: string;
  inventory: InventoryKeywordRow[];
}): CannibalizationHit[] {
  const target = normalizeKeyword(input.keyword);
  if (!target) return [];
  const hits: CannibalizationHit[] = [];
  for (const row of input.inventory) {
    if (input.excludeSlug && row.slug === input.excludeSlug) continue;
    const existing = normalizeKeyword(row.primary_keyword || row.title || "");
    if (!existing) continue;
    const similarity = keywordSimilarity(target, existing);
    if (existing === target) {
      hits.push({
        kind: "exact_primary",
        existing: row,
        keyword: input.keyword,
        similarity: 1,
        recommended_action: row.content_type === input.contentType ? "review" : "improve_differentiation",
      });
      continue;
    }
    if (similarity >= 0.72) {
      const sameIntent = Boolean(input.intent && row.search_intent && input.intent === row.search_intent);
      hits.push({
        kind: sameIntent ? "same_intent_topic" : "similar_keyword",
        existing: row,
        keyword: input.keyword,
        similarity,
        recommended_action: sameIntent ? "improve_differentiation" : "change_secondary_targeting",
      });
    }
  }
  return hits.sort((a, b) => b.similarity - a.similarity);
}

export async function loadInventoryForCannibalization(): Promise<InventoryKeywordRow[]> {
  const cached = await db()
    .from("seo_content_inventory")
    .select("content_type, source_id, slug, canonical_url, title, primary_keyword, search_intent")
    .eq("status", "published");
  if (!cached.error && cached.data && cached.data.length > 0) {
    return cached.data as InventoryKeywordRow[];
  }

  const [blogs, pages] = await Promise.all([
    db().from("blog_posts").select("id, slug, title, keywords").eq("status", "published"),
    db().from("custom_pages").select("id, slug, title, h1, primary_keyword, canonical_url").eq("status", "published"),
  ]);

  const out: InventoryKeywordRow[] = [];
  for (const row of blogs.data ?? []) {
    const primary = String(row.keywords || "").split(",")[0]?.trim() || row.title;
    out.push({
      content_type: "blog",
      source_id: String(row.id),
      slug: row.slug,
      canonical_url: `https://yaarzo.com/blog/${row.slug}`,
      title: row.title,
      primary_keyword: primary,
    });
  }
  for (const row of pages.data ?? []) {
    out.push({
      content_type: "page",
      source_id: String(row.id),
      slug: row.slug,
      canonical_url: row.canonical_url || `https://yaarzo.com/${row.slug}`,
      title: row.title,
      primary_keyword: row.primary_keyword || row.h1 || row.title,
    });
  }
  return out;
}

export async function recordCannibalizationWarnings(
  hits: CannibalizationHit[],
  incoming: { type: SeoContentType; id?: string; url?: string; intent?: string | null },
) {
  for (const hit of hits.slice(0, 8)) {
    await db().from("seo_cannibalization_warnings").insert({
      content_a_type: incoming.type,
      content_a_id: incoming.id ?? "pending",
      content_a_url: incoming.url ?? null,
      content_b_type: hit.existing.content_type,
      content_b_id: hit.existing.source_id,
      content_b_url: hit.existing.canonical_url,
      overlapping_keywords: [hit.keyword, hit.existing.primary_keyword].filter(Boolean),
      intent_a: incoming.intent ?? null,
      intent_b: hit.existing.search_intent ?? null,
      similarity: hit.similarity,
      recommended_action: hit.recommended_action,
    });
  }
}

export async function listCannibalizationWarnings(limit = 50) {
  const { data, error } = await db()
    .from("seo_cannibalization_warnings")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return data ?? [];
}
