import { createHash } from "node:crypto";
import { db } from "@/lib/content-automation/db";
import { inferIntentFromText, splitKeywordBlob } from "@/lib/content-automation/keyword-targets";
import type { ImageStatus, SearchIntent, SeoContentType } from "@/lib/content-automation/seo-types";

export type InventoryUpsert = {
  content_type: SeoContentType;
  source_id: string;
  slug: string;
  canonical_url: string;
  title?: string | null;
  h1?: string | null;
  primary_keyword?: string | null;
  secondary_keywords?: string[];
  long_tail_keywords?: string[];
  search_intent?: SearchIntent | string | null;
  category?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  language?: string | null;
  status?: string;
  word_count?: number;
  published_at?: string | null;
  last_optimized_at?: string | null;
  last_refreshed_at?: string | null;
  next_refresh_at?: string | null;
  content_hash?: string | null;
  seo_score?: number | null;
  image_status?: ImageStatus;
  migration_status?: string;
};

export function countWordsFromHtml(html: string | null | undefined): number {
  const text = String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 0;
  return text.split(" ").filter(Boolean).length;
}

export function hashContent(html: string, extras: string[] = []): string {
  const normalized = String(html || "")
    .replace(/\s+/g, " ")
    .trim();
  return createHash("sha256").update([normalized, ...extras].join("\n")).digest("hex");
}

export function changePercent(before: string, after: string): number {
  const a = before.replace(/\s+/g, " ").trim();
  const b = after.replace(/\s+/g, " ").trim();
  if (!a && !b) return 0;
  if (!a || !b) return 100;
  if (a === b) return 0;
  const max = Math.max(a.length, b.length);
  let same = 0;
  const limit = Math.min(a.length, b.length);
  for (let i = 0; i < limit; i++) if (a[i] === b[i]) same++;
  return Math.round((1 - same / max) * 100);
}

export function nextRefreshAt(last: Date | string | null | undefined, intervalDays: number): string {
  const base = last ? new Date(last) : new Date();
  const d = Number.isFinite(base.getTime()) ? base : new Date();
  d.setUTCDate(d.getUTCDate() + Math.max(1, intervalDays));
  return d.toISOString();
}

export async function upsertInventory(row: InventoryUpsert) {
  const now = new Date().toISOString();
  const payload = {
    ...row,
    secondary_keywords: row.secondary_keywords ?? [],
    long_tail_keywords: row.long_tail_keywords ?? [],
    status: row.status ?? "published",
    image_status: row.image_status ?? "pending",
    updated_at: now,
  };
  const { error } = await db()
    .from("seo_content_inventory")
    .upsert(payload, { onConflict: "content_type,source_id" });
  if (error && !/does not exist|schema cache/i.test(error.message)) {
    console.error("[seo-inventory] upsert failed:", error.message);
  }
}

export async function syncPublishedInventory(refreshIntervalDays = 15) {
  const [blogs, pages] = await Promise.all([
    db()
      .from("blog_posts")
      .select("id, slug, title, content, keywords, tags, status, published_at, last_refreshed_at, meta_description")
      .eq("status", "published"),
    db()
      .from("custom_pages")
      .select("id, slug, title, h1, content, primary_keyword, secondary_keywords, tags, status, published_at, last_refreshed_at, canonical_url, category, language, seo_score, city_id, country_id, og_image")
      .eq("status", "published"),
  ]);

  let synced = 0;
  for (const row of blogs.data ?? []) {
    const keys = splitKeywordBlob(row.keywords);
    const html = String(row.content || "");
    await upsertInventory({
      content_type: "blog",
      source_id: String(row.id),
      slug: row.slug,
      canonical_url: `https://yaarzo.com/blog/${row.slug}`,
      title: row.title,
      h1: row.title,
      primary_keyword: keys.primary || row.title,
      secondary_keywords: keys.secondary,
      long_tail_keywords: keys.longTail,
      search_intent: inferIntentFromText(`${row.title} ${row.keywords || ""}`),
      status: row.status,
      word_count: countWordsFromHtml(html),
      published_at: row.published_at,
      last_refreshed_at: row.last_refreshed_at,
      next_refresh_at: nextRefreshAt(row.last_refreshed_at || row.published_at, refreshIntervalDays),
      content_hash: hashContent(html, [row.title, row.meta_description || ""]),
      image_status: /<img\b/i.test(html) ? "ready" : "missing",
    });
    synced++;
  }
  for (const row of pages.data ?? []) {
    const secondary = Array.isArray(row.secondary_keywords) ? row.secondary_keywords : [];
    const html = String(row.content || "");
    await upsertInventory({
      content_type: "page",
      source_id: String(row.id),
      slug: row.slug,
      canonical_url: row.canonical_url || `https://yaarzo.com/${row.slug}`,
      title: row.title,
      h1: row.h1,
      primary_keyword: row.primary_keyword,
      secondary_keywords: secondary,
      long_tail_keywords: secondary.filter((k: string) => String(k).split(/\s+/).length >= 4),
      search_intent: inferIntentFromText(`${row.h1 || row.title} ${row.primary_keyword || ""}`),
      category: row.category,
      language: row.language,
      status: row.status,
      word_count: countWordsFromHtml(html),
      published_at: row.published_at,
      last_refreshed_at: row.last_refreshed_at,
      next_refresh_at: nextRefreshAt(row.last_refreshed_at || row.published_at, refreshIntervalDays),
      content_hash: hashContent(html, [row.title, row.h1, row.primary_keyword || ""]),
      seo_score: row.seo_score,
      image_status: row.og_image || /<img\b/i.test(html) ? "ready" : "missing",
    });
    synced++;
  }
  return { synced, blogs: blogs.data?.length ?? 0, pages: pages.data?.length ?? 0 };
}

export async function listInventory(limit = 80) {
  const { data, error } = await db()
    .from("seo_content_inventory")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function listDueRefresh(kind: SeoContentType | "all", limit = 5) {
  const now = new Date().toISOString();
  let q = db()
    .from("seo_content_inventory")
    .select("*")
    .eq("status", "published")
    .lte("next_refresh_at", now)
    .order("next_refresh_at", { ascending: true })
    .limit(limit);
  if (kind !== "all") q = q.eq("content_type", kind);
  const { data, error } = await q;
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function markInventoryImage(contentType: SeoContentType, sourceId: string, imageStatus: ImageStatus) {
  await db()
    .from("seo_content_inventory")
    .update({ image_status: imageStatus, updated_at: new Date().toISOString() })
    .eq("content_type", contentType)
    .eq("source_id", sourceId);
}
