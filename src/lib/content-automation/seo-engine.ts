import { buildCmsPageJsonLd, extractFaqItems, faqItemsFromStored, type FaqItem } from "@/lib/pages-cms/faq-jsonld";
import {
  detectCannibalization,
  loadInventoryForCannibalization,
  recordCannibalizationWarnings,
  type CannibalizationHit,
} from "@/lib/content-automation/cannibalization";
import { countWordsFromHtml, hashContent, nextRefreshAt, upsertInventory } from "@/lib/content-automation/content-inventory";
import { inferIntentFromText, splitKeywordBlob } from "@/lib/content-automation/keyword-targets";
import { attachPexelsImage } from "@/lib/content-automation/pexels-images";
import { isValidJsonLd } from "@/lib/content-automation/seo-audit";
import { getAutomationSettings, type AutomationSettings } from "@/lib/content-automation/db";
import { snapshotContent } from "@/lib/content-automation/versioning";
import { db } from "@/lib/content-automation/db";
import { wordFloorFor, type SeoContentType } from "@/lib/content-automation/seo-types";
import {
  applySanitizedLiveUpdate,
} from "@/lib/content-automation/publish-quality";
import {
  shouldOptimizeImageMarkup,
  shouldSnapshotVersions,
  shouldEnforceBrokenLinkAbort,
} from "@/lib/content-automation/seo-settings";

export type GenerationContext = {
  primaryKeyword: string;
  secondaryKeywords: string[];
  longTailKeywords: string[];
  searchIntent: string;
  relatedTitles: string[];
  cannibalization: CannibalizationHit[];
  wordRange: string;
};

export async function buildGenerationContext(input: {
  kind: SeoContentType;
  title: string;
  keywords?: string | null;
  primaryKeyword?: string | null;
  slug?: string;
  discoverRelated?: boolean;
}): Promise<GenerationContext> {
  const split = splitKeywordBlob(input.keywords || input.primaryKeyword || input.title);
  const primary = input.primaryKeyword || split.primary || input.title;
  const intent = inferIntentFromText(`${input.title} ${primary}`);
  const inventory = await loadInventoryForCannibalization();
  const cannibalization = detectCannibalization({
    keyword: primary,
    intent,
    contentType: input.kind,
    excludeSlug: input.slug,
    inventory,
  });
  const relatedTitles = input.discoverRelated === false
    ? []
    : inventory
      .filter((r) => r.content_type !== input.kind || r.slug !== input.slug)
      .slice(0, 8)
      .map((r) => `${r.title} (${r.canonical_url})`);
  return {
    primaryKeyword: primary,
    secondaryKeywords: split.secondary,
    longTailKeywords: split.longTail,
    searchIntent: intent,
    relatedTitles,
    cannibalization,
    wordRange: input.kind === "blog" ? "1,200–1,500" : "700–900",
  };
}

export async function loadPublishedPipelineSlugs(): Promise<Set<string>> {
  const { data } = await db().from("custom_pages").select("slug").eq("status", "published");
  return new Set((data ?? []).map((p: { slug: string }) => String(p.slug).replace(/^\/+/, "").toLowerCase()));
}

export function formatGenerationContextBlock(ctx: GenerationContext): string {
  const related = ctx.relatedTitles.length
    ? ctx.relatedTitles.map((t) => `- ${t}`).join("\n")
    : "- (none listed)";
  return `SEO context (use, do not stuff):
- Primary keyword: ${ctx.primaryKeyword}
- Secondary keywords: ${ctx.secondaryKeywords.join(", ") || "none"}
- Long-tail keywords: ${ctx.longTailKeywords.join(", ") || "none"}
- Search intent: ${ctx.searchIntent}
- Target length: ${ctx.wordRange} words. Do not pad with filler if the topic is covered well.
Existing Yaarzo content to differentiate from (do not copy; link only if the URL is in the allowed list):
${related}`;
}

export async function blockIfExactCannibalization(
  settings: AutomationSettings,
  ctx: GenerationContext,
  incoming: { type: SeoContentType; url?: string; id?: string },
): Promise<string | null> {
  if (!settings.cannibalization_check) return null;
  const exact = ctx.cannibalization.filter((h) => h.kind === "exact_primary");
  if (exact.length === 0) return null;
  await recordCannibalizationWarnings(exact, {
    type: incoming.type,
    id: incoming.id,
    url: incoming.url,
    intent: ctx.searchIntent,
  });
  const urls = exact.map((h) => h.existing.canonical_url).join(", ");
  return `Cannibalization: primary keyword already used by ${urls}`;
}

export function safeFaqJsonLd(input: {
  title: string;
  description: string;
  url: string;
  faqs: FaqItem[];
  image?: string | null;
}): Record<string, unknown> {
  const schema = buildCmsPageJsonLd({
    title: input.title,
    description: input.description,
    url: input.url,
    image: input.image,
    faqs: input.faqs.filter((f) => f.question && f.answer),
  });
  if (!isValidJsonLd(schema)) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: input.title,
      description: input.description,
      url: input.url,
    };
  }
  return schema;
}

export function collectFaqs(html: string, stored: unknown): FaqItem[] {
  const fromStore = faqItemsFromStored(stored);
  if (fromStore.length >= 2) return fromStore;
  return extractFaqItems(html);
}

export function appendVisibleFaqs(html: string, faqs: FaqItem[]): string {
  if (!faqs.length) return html;
  if (/<h2[^>]*>\s*FAQ/i.test(html) || /<strong>\s*Q\d+/i.test(html)) return html;
  const items = faqs
    .slice(0, 6)
    .map((f, i) => `<p><strong>Q${i + 1}: ${f.question}</strong></p><p>${f.answer}</p>`)
    .join("\n");
  return `${html}\n<h2>Frequently asked questions</h2>\n${items}`;
}

export async function applyPexelsIfEnabled(input: {
  settings: AutomationSettings;
  html: string;
  topic: string;
  primaryKeyword?: string | null;
  kind: SeoContentType;
  sourceId?: string;
  geo?: string | null;
}) {
  if (!input.settings.pexels_images_enabled || input.settings.images_per_content < 1) {
    return { html: input.html, imageStatus: "skipped" as const, ogImage: undefined as string | undefined, error: undefined as string | undefined, photoId: undefined as number | undefined };
  }
  const result = await attachPexelsImage({
    html: input.html,
    topic: input.topic,
    primaryKeyword: input.primaryKeyword,
    contentType: input.kind,
    sourceId: input.sourceId,
    geo: input.geo,
    preferLandscape: input.settings.prefer_landscape_images,
    preventDuplicates: input.settings.image_duplicate_prevention,
    optimizeMarkup: shouldOptimizeImageMarkup(input.settings),
  });
  return {
    html: result.html,
    imageStatus: result.imageStatus,
    ogImage: result.ogImage,
    error: result.error,
    photoId: result.photoId,
  };
}

export async function recordPublishedBundle(input: {
  kind: SeoContentType;
  sourceId: string;
  slug: string;
  title: string;
  h1?: string | null;
  html: string;
  primaryKeyword?: string | null;
  keywords?: string | null;
  secondary?: string[];
  intent?: string | null;
  imageStatus?: string;
  refreshDays: number;
}) {
  const keys = splitKeywordBlob(input.keywords || input.primaryKeyword || input.title);
  await upsertInventory({
    content_type: input.kind,
    source_id: input.sourceId,
    slug: input.slug,
    canonical_url: input.kind === "blog" ? `https://yaarzo.com/blog/${input.slug}` : `https://yaarzo.com/${input.slug}`,
    title: input.title,
    h1: input.h1 ?? input.title,
    primary_keyword: input.primaryKeyword || keys.primary,
    secondary_keywords: input.secondary ?? keys.secondary,
    long_tail_keywords: keys.longTail,
    search_intent: input.intent ?? inferIntentFromText(input.title),
    word_count: countWordsFromHtml(input.html),
    published_at: new Date().toISOString(),
    last_refreshed_at: new Date().toISOString(),
    next_refresh_at: nextRefreshAt(new Date(), input.refreshDays),
    content_hash: hashContent(input.html, [input.title]),
    image_status: (input.imageStatus as "ready" | "failed" | "pending" | "skipped" | "missing") || "pending",
    migration_status: "optimized",
    status: "published",
  });
}

export async function maybeTwoWayLink(input: {
  settings: AutomationSettings;
  kind: SeoContentType;
  newSlug: string;
  newTitle: string;
  related: Array<{ slug: string; title: string; id?: string }>;
}) {
  if (!input.settings.two_way_linking || !input.settings.auto_internal_linking) return;
  const target = input.related[0];
  if (!target?.slug || !target.id) return;
  const href = input.kind === "blog"
    ? `https://yaarzo.com/blog/${input.newSlug}`
    : `https://yaarzo.com/${input.newSlug}`;
  const table = input.kind === "blog" ? "blog_posts" : "custom_pages";
  const { data } = await db().from(table).select("id, slug, title, content, canonical_url").eq("id", target.id).maybeSingle();
  if (!data?.content || String(data.content).includes(href) || String(data.content).includes(`/${input.newSlug}`)) return;
  const published = await loadPublishedPipelineSlugs();
  if (input.kind === "page") published.add(input.newSlug.replace(/^\/+/, "").toLowerCase());
  const anchor = input.kind === "blog" ? "this related guide" : "this related chat room";
  const addition = `<p>If you want a closer look at the same topic, read about <a href="${href}">${anchor}</a>.</p>`;
  const sanitized = applySanitizedLiveUpdate(String(data.content), `${data.content}\n${addition}`, {
    slug: String(data.slug),
    title: data.title,
    publishedSlugs: published,
    enforceBrokenLinks: shouldEnforceBrokenLinkAbort(input.settings),
  });
  if (!sanitized.wrote) return;
  if (shouldSnapshotVersions(input.settings)) {
    await snapshotContent({
      content_type: input.kind,
      source_id: String(data.id),
      title: data.title,
      slug: data.slug,
      canonical_url: data.canonical_url,
      content: data.content,
      change_reason: "two_way_link",
      change_summary: `Added contextual link to ${input.newSlug}`,
    }, input.settings.max_versions);
  }
  await db()
    .from(table)
    .update({ content: sanitized.content })
    .eq("id", data.id);
}

export function thinContentError(kind: SeoContentType, html: string): string | null {
  const words = countWordsFromHtml(html);
  const floor = wordFloorFor(kind);
  if (words < floor) return `thin_content: ${words} words (floor ${floor})`;
  return null;
}

export async function engineSettings() {
  return getAutomationSettings();
}
