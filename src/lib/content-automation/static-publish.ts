/**
 * Port of automation-scripts/auto-publish-static-pages.cjs.
 * Generation logic is unchanged; the master list comes from static_page_ideas
 * and the per-run count from automation_settings.static_pages_per_day.
 *
 * CTA href uses /chatroom (canonical route). /chatrooms only redirects there.
 * Internal interest/type links are filtered to published slugs; unwrap-list
 * URLs are never inserted. Tags are not written today; sanitizePipelineTags
 * must be used if that field is added later.
 */
import Anthropic from "@anthropic-ai/sdk";
import { chatroomUrls } from "@/lib/content-automation/chatroom-urls";
import { db, getAutomationSettings, pausedResponse } from "@/lib/content-automation/db";
import { YAARZO_MASTER_SYSTEM_PROMPT } from "@/lib/content-automation/master-content-rules";
import {
  PEER_GEO_LINK_SOURCE,
  canonicalPeerHref,
  pickPeerPages,
  planPeerLinkEdges,
  peerAnchorLabel,
  type GeoPage,
} from "@/lib/content-automation/peer-geo-links";
import {
  STATIC_INTERNAL_LINK_MAX,
  STATIC_INTERNAL_LINK_MIN,
  ensurePeerGeoLinks,
  htmlHasHref,
  htmlHasPeerGeoLink,
  padInternalLinks,
  pickPublishedInternalHrefs,
  preparePublishablePage,
  ensurePlannedLinks,
  type PlannedInternalLink,
} from "@/lib/content-automation/publish-quality";
import { coherentGeneratedTitles } from "@/lib/pages-cms/coherent-titles";

export type StaticPageEntry = {
  slug: string;
  section: string;
  base_name: string;
  lookup_city: string | null;
  lookup_country_hint: string | null;
  keywords: string | null;
};

export type StaticPublishResult = {
  slug: string;
  success: boolean;
  regenerated?: boolean;
  error?: string;
};

function failureMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return String(err);
}

const CITY_SECTIONS = [
  "india_city",
  "pakistan_city",
  "us_city",
  "uk_city",
  "canada_city",
  "australia_city",
  "city_subcategory",
];

function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey });
}

function keywordGroupSlugFor(section: string) {
  if (CITY_SECTIONS.includes(section)) return "city-cluster";
  if (section === "interest") return "interest-cluster";
  return "generic-cluster";
}

function fillPattern(pattern: string, baseName: string) {
  if (!pattern) return "";
  const name = baseName.toLowerCase();
  const Name = baseName.replace(/\b\w/g, (c) => c.toUpperCase());
  return pattern.replace(/{Name}/g, Name).replace(/{name}/g, name);
}

async function getKeywordGroup(slug: string) {
  const { data } = await db()
    .from("page_keyword_groups")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data ?? null;
}

/**
 * Matches the site's own buildPageCtaHtml() output, but href is /chatroom
 * (canonical). /chatrooms is a redirect-only alias.
 */
function buildCtaHtml() {
  return [
    `<div class="custom-page-cta">`,
    `<a href="/chatroom" class="custom-page-cta-button">`,
    `<span>Start Chatting Now</span>`,
    `<span aria-hidden="true">→</span>`,
    `</a>`,
    `<p class="custom-page-cta-note">Free to explore • Join when you are ready</p>`,
    `</div>`,
    `<p></p>`,
  ].join("");
}

async function getExistingSlugs() {
  const { data } = await db().from("custom_pages").select("slug");
  return new Set((data ?? []).map((p: { slug: string }) => p.slug));
}

async function findCityId(lookupCity: string | null, countryHint: string | null) {
  if (!lookupCity) return { cityId: null, countryId: null };
  const { data } = await db().from("page_cities").select("id, country_id, name").ilike("name", lookupCity);
  if (!data || data.length === 0) return { cityId: null, countryId: null };
  if (data.length === 1) return { cityId: data[0].id, countryId: data[0].country_id };
  if (countryHint) {
    const { data: country } = await db().from("page_countries").select("id").ilike("name", countryHint).maybeSingle();
    if (country) {
      const match = data.find((c: { country_id: string }) => c.country_id === country.id);
      if (match) return { cityId: match.id, countryId: match.country_id };
    }
  }
  return { cityId: data[0].id, countryId: data[0].country_id };
}

async function findCountryId(name: string | null) {
  if (!name) return null;
  const { data } = await db().from("page_countries").select("id").ilike("name", name).maybeSingle();
  return data?.id ?? null;
}

function labelFromHref(href: string): string {
  const slug = href.replace(/^https?:\/\/(www\.)?yaarzo\.com/i, "").replace(/^\//, "").split("/")[0] || "";
  return slug.replace(/-chat-room$/i, "").replace(/-/g, " ") || "related page";
}

async function loadPublishedGeoPages(): Promise<GeoPage[]> {
  const { data } = await db()
    .from("custom_pages")
    .select("id, slug, title, h1, page_type, category, country_id, city_id, link_priority")
    .eq("status", "published");
  return (data ?? []) as GeoPage[];
}

function geoSourceFromEntry(
  entry: StaticPageEntry,
  cityId: string | null,
  countryId: string | null,
  pageId = "",
): GeoPage {
  const isCity = CITY_SECTIONS.includes(entry.section);
  return {
    id: pageId,
    slug: entry.slug,
    title: entry.base_name,
    h1: null,
    page_type: isCity ? "city" : entry.section === "country" ? "country" : null,
    category: entry.section,
    country_id: countryId,
    city_id: cityId,
    link_priority: 0,
  };
}

async function persistPeerGraph(source: GeoPage, pool: GeoPage[]) {
  if (!source.id) return;
  const withSelf = pool.some((p) => p.id === source.id) ? pool : [...pool, source];
  const edges = planPeerLinkEdges([source], withSelf, { maxPeers: 3, reciprocal: true });
  for (const edge of edges) {
    if (!edge.from.id || !edge.to.id) continue;
    const { error } = await db().from("page_internal_links").insert({
      page_id: edge.from.id,
      target_page_id: edge.to.id,
      target_url: canonicalPeerHref(edge.to.slug),
      anchor_text: peerAnchorLabel(edge.to),
      sort_order: 200,
      is_manual: true,
      source: PEER_GEO_LINK_SOURCE,
      updated_at: new Date().toISOString(),
    });
    if (error && !/duplicate|unique/i.test(error.message || "")) {
      console.error(`peer link ${edge.from.slug} → ${edge.to.slug}:`, error.message);
    }
  }
}

async function pickRelevantBlogPost(baseName: string) {
  const { data: posts } = await db().from("blog_posts").select("title, slug").eq("status", "published");
  if (!posts || posts.length === 0) return null;
  const lower = baseName.toLowerCase();
  const matched = posts.find((p: { title: string }) => p.title.toLowerCase().includes(lower));
  const chosen = matched ?? posts[Math.floor(Math.random() * posts.length)];
  return { url: `https://yaarzo.com/blog/${chosen.slug}`, title: chosen.title as string };
}

async function generatePageContent(
  entry: StaticPageEntry,
  peerPages: GeoPage[] = [],
  publishedSlugs: Set<string> = new Set(),
) {
  const contextLine = entry.section === "country_language"
    ? `This page is for people from a specific country who want to chat in a specific language: "${entry.base_name}".`
    : entry.lookup_city
    ? `This page targets people in the city of "${entry.base_name}".`
    : entry.section === "country"
    ? `This page targets people in the country "${entry.base_name}".`
    : entry.section === "india_state" || entry.section === "pakistan_province"
    ? `This page targets people in the region "${entry.base_name}".`
    : entry.section === "language"
    ? `This page is for people who want to chat in "${entry.base_name}".`
    : `This page is themed around "${entry.base_name}".`;

  const extraRooms = pickPublishedInternalHrefs(
    [...chatroomUrls.interest, ...chatroomUrls.type],
    publishedSlugs,
    { excludeSlug: entry.slug, count: 2 },
  );
  const blogPost = await pickRelevantBlogPost(entry.base_name);

  const planned: PlannedInternalLink[] = [];
  const seen = new Set<string>();
  const addPlanned = (href: string, label: string) => {
    const key = href.replace(/^https?:\/\/(www\.)?yaarzo\.com/i, "").replace(/\/+$/, "").toLowerCase() || href;
    if (!href || seen.has(key)) return;
    seen.add(key);
    planned.push({ href, label });
  };
  addPlanned("https://yaarzo.com/signup", "create your free account");
  for (const href of extraRooms) addPlanned(href, labelFromHref(href));
  if (blogPost) addPlanned(blogPost.url, "this related read");
  for (const peer of peerPages) addPlanned(canonicalPeerHref(peer.slug), peerAnchorLabel(peer));

  const linkLines = planned
    .map((item, i) => `${i + 1}. <a href="${item.href}"> — short 2-4 word natural anchor about "${item.label}". Never dump a full SEO title.`)
    .join("\n");

  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2000,
    system: YAARZO_MASTER_SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `Write SEO landing page content for Yaarzo, a free online chatroom platform, for the page: "${entry.base_name} chat room".

${contextLine}

Requirements:
- 500-750 words total
- Do NOT include an <h1> tag (rendered separately)
- Do NOT include a "join now" or "start chatting" call-to-action button or link — that is added separately as /chatroom
- HARD: Never output "/chatrooms" — the chat hub is "/chatroom". Never output "/p/{slug}" — use "/{slug}" or https://yaarzo.com/{slug}
- HARD: Only use the exact internal URLs listed below — do not invent slugs
- HARD: If peer-geography URLs are listed below, include at least one of them (country hub or sibling city/country), not only generic interest/type rooms
- HARD: Place 3-4 internal links in the body from the list (the automatic /chatroom CTA plus Related Chat Rooms and Explore widgets bring the published page to about 10-12 total). Every link must be relevant to the surrounding sentence. Varied anchors — never repeat the same link text.
- Use 2-4 <h2> subheadings
- Warm, inviting, conversational tone — written for a real visitor deciding whether to join
- If this is a city/country/region page, naturally reference local flavor (local slang, popular topics, culture) without stereotyping — keep it genuine and light. Include at least 2-3 unique local elements (opening hook, a real local detail, unique FAQ angles)
- Vary sentence rhythm — mix short and long sentences like a real writer would
- Output clean HTML only (h2, p, ul/li, strong, a, and the one HTML comment described below) — no <html>/<body>/<h1>
- Do NOT include any view counters, placeholder text, or meta-commentary in the visible content itself
- Right after the intro paragraph, insert exactly this on its own line: <!-- IMAGE: a real 5-10 word description of an image that would fit here --> (a human will manually replace this with a real image later — do not embed an actual <img> tag). If you emit <img>, alt text must be descriptive.

Allowed internal links (use 3-4 of these, each at most once, naturally placed in different sections):
${linkLines}

Do not add any other links. Do not reuse the same anchor text pattern across sentences.

After the content, on a new line, output exactly:
---META---
KEYWORDS: keyword one, keyword two, keyword three
FAQ1_Q: <a real question people would search>
FAQ1_A: <2-3 sentence answer>
FAQ2_Q: <another real question>
FAQ2_A: <2-3 sentence answer>
FAQ3_Q: <another real question>
FAQ3_A: <2-3 sentence answer>`,
    }],
  });

  const fullText = message.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const [contentHtml, metaBlock] = fullText.split("---META---");
  const get = (key: string) => metaBlock?.match(new RegExp(`${key}:\\s*(.+)`, "i"))?.[1]?.trim() ?? "";

  let linkedHtml = ensurePlannedLinks(contentHtml.trim(), planned, STATIC_INTERNAL_LINK_MAX - 1);
  linkedHtml = padInternalLinks(linkedHtml, planned, STATIC_INTERNAL_LINK_MIN - 1, STATIC_INTERNAL_LINK_MAX - 1);
  if (!htmlHasHref(linkedHtml, "/chatroom") && !htmlHasHref(linkedHtml, "https://yaarzo.com/chatroom")) {
    linkedHtml += buildCtaHtml();
  }
  linkedHtml = padInternalLinks(linkedHtml, planned, STATIC_INTERNAL_LINK_MIN, STATIC_INTERNAL_LINK_MAX);

  return {
    contentHtml: linkedHtml,
    aiKeywords: get("KEYWORDS"),
    faq: [
      { question: get("FAQ1_Q"), answer: get("FAQ1_A") },
      { question: get("FAQ2_Q"), answer: get("FAQ2_A") },
      { question: get("FAQ3_Q"), answer: get("FAQ3_A") },
    ].filter((f) => f.question && f.answer),
    linksUsed: planned.map((p) => p.href),
  };
}

async function buildRowPayload(
  entry: StaticPageEntry,
  generated: Awaited<ReturnType<typeof generatePageContent>>,
  cityId: string | null,
  countryId: string | null,
) {
  const fallbackH1 = `${entry.base_name.replace(/\b\w/g, (c) => c.toUpperCase())} Chat Room`;

  const groupSlug = keywordGroupSlugFor(entry.section);
  const group = await getKeywordGroup(groupSlug);

  const primaryKeyword = group ? fillPattern(group.primary_pattern, entry.base_name) : `${entry.base_name} chat room`;
  const titleRaw = group ? fillPattern(group.title_pattern, entry.base_name) : `${fallbackH1} | Yaarzo`;
  const metaTitle = group ? fillPattern(group.meta_title_pattern, entry.base_name) : fallbackH1;
  const metaDescription = group ? fillPattern(group.meta_description_pattern, entry.base_name) : `Join the ${entry.base_name} chat room on Yaarzo for free.`;
  const h1Raw = group ? fillPattern(group.h1_pattern, entry.base_name) : fallbackH1;
  const titles = coherentGeneratedTitles({
    metaTitle: metaTitle || titleRaw,
    h1: h1Raw,
    baseName: entry.base_name,
  });
  const { title, meta_title, og_title, h1 } = titles;
  const secondaryKeywords = group ? group.secondary_patterns.map((p: string) => fillPattern(p, entry.base_name)) : [];

  const aiKeywordList = generated.aiKeywords ? generated.aiKeywords.split(",").map((k) => k.trim()).filter(Boolean) : [];
  const providedKeywords = entry.keywords
    ? entry.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [];
  const combinedKeywords = [...new Set([primaryKeyword, ...secondaryKeywords, ...providedKeywords, ...aiKeywordList])];

  return {
    title,
    h1,
    content: generated.contentHtml,
    excerpt: metaDescription,
    category: entry.section,
    primary_keyword: primaryKeyword,
    secondary_keywords: secondaryKeywords,
    keyword_group_id: group?.id ?? null,
    meta_title,
    meta_description: metaDescription,
    meta_keywords: combinedKeywords.join(", "),
    og_title,
    og_description: metaDescription,
    canonical_url: `https://yaarzo.com/${entry.slug}`,
    faq_content: generated.faq,
    internal_links_json: generated.linksUsed,
    internal_link_count: generated.linksUsed.length,
    schema_jsonld: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: meta_title,
      description: metaDescription,
    },
    city_id: cityId,
    country_id: countryId,
    content_status: "complete",
    status: "published",
    published_at: new Date().toISOString(),
    last_refreshed_at: new Date().toISOString(),
    language: "en",
  };
}

function publishedSlugSet(geoPool: GeoPage[]): Set<string> {
  return new Set(geoPool.map((p) => p.slug.replace(/^\/+/, "").toLowerCase()));
}

function applyStaticQualityGate(
  entry: StaticPageEntry,
  payload: Awaited<ReturnType<typeof buildRowPayload>>,
  publishedSlugs: Set<string>,
  peerPages: GeoPage[] = [],
): { payload: Awaited<ReturnType<typeof buildRowPayload>>; error?: string } {
  const peers = peerPages
    .map((p) => ({ href: canonicalPeerHref(p.slug), label: peerAnchorLabel(p) }))
    .filter((p) => p.href);
  const withPeers = ensurePeerGeoLinks(payload.content, peers, STATIC_INTERNAL_LINK_MAX);
  const padded = padInternalLinks(withPeers, peers, STATIC_INTERNAL_LINK_MIN, STATIC_INTERNAL_LINK_MAX);
  const prepared = preparePublishablePage({
    slug: entry.slug,
    title: payload.title,
    h1: payload.h1,
    meta_title: payload.meta_title,
    meta_description: payload.meta_description,
    canonical_url: payload.canonical_url,
    content: padded,
    tags: [],
    publishedSlugs,
    linkCount: { min: STATIC_INTERNAL_LINK_MIN, max: STATIC_INTERNAL_LINK_MAX },
  });
  if (prepared.blocked) {
    return { payload, error: `Quality gate: ${prepared.blockReason}` };
  }
  const isGeo = CITY_SECTIONS.includes(entry.section) || entry.section === "country";
  if (isGeo && peers.length > 0 && !htmlHasPeerGeoLink(prepared.content, peers.map((p) => p.href))) {
    const reason = `Quality gate: missing peer-geo link (${peers.map((p) => p.href).join(", ")})`;
    return { payload, error: reason };
  }
  return { payload: { ...payload, content: prepared.content } };
}

type PagePublishOutcome = { success: boolean; error?: string };

async function regeneratePage(entry: StaticPageEntry): Promise<PagePublishOutcome> {
  try {
    console.log(`\n🔄 Regenerating: ${entry.slug}...`);
    const { cityId, countryId: cityCountryId } = await findCityId(entry.lookup_city, entry.lookup_country_hint);
    const directCountryId = entry.section === "country" ? await findCountryId(entry.base_name) : cityCountryId;
    const geoPool = await loadPublishedGeoPages();
    const existing = geoPool.find((p) => p.slug === entry.slug);
    const source = geoSourceFromEntry(entry, cityId, directCountryId, existing?.id ?? "");
    const peerPages = pickPeerPages(source, geoPool, { max: 2 });
    const publishedSlugs = publishedSlugSet(geoPool);
    let generated: Awaited<ReturnType<typeof generatePageContent>>;
    try {
      generated = await generatePageContent(entry, peerPages, publishedSlugs);
    } catch (err) {
      const error = failureMessage(err);
      console.error(`❌ Content generation failed for "${entry.slug}":`, error);
      return { success: false, error };
    }
    const ungated = await buildRowPayload(entry, generated, cityId, directCountryId);
    const gated = applyStaticQualityGate(entry, ungated, publishedSlugs, peerPages);
    if (gated.error) {
      console.error(`❌ ${gated.error} — skipping "${entry.slug}"`);
      return { success: false, error: gated.error };
    }
    const payload = gated.payload;

    const { error } = await db().from("custom_pages").update(payload).eq("slug", entry.slug);
    if (error) {
      console.error(`❌ Failed to update "${entry.slug}":`, error.message);
      return { success: false, error: error.message };
    }
    const pageId = existing?.id;
    if (pageId) {
      await persistPeerGraph({ ...source, id: pageId }, geoPool);
    }
    console.log(`✅ Regenerated: yaarzo.com/${entry.slug}`);
    return { success: true };
  } catch (err) {
    const error = failureMessage(err);
    console.error(`❌ regenerate "${entry.slug}":`, error);
    return { success: false, error };
  }
}

async function publishNewPage(entry: StaticPageEntry): Promise<PagePublishOutcome> {
  try {
    console.log(`\n📝 Generating: ${entry.slug}...`);
    const { cityId, countryId: cityCountryId } = await findCityId(entry.lookup_city, entry.lookup_country_hint);
    const directCountryId = entry.section === "country" ? await findCountryId(entry.base_name) : cityCountryId;
    const geoPool = await loadPublishedGeoPages();
    const source = geoSourceFromEntry(entry, cityId, directCountryId);
    const peerPages = pickPeerPages(source, geoPool, { max: 2 });
    const publishedSlugs = publishedSlugSet(geoPool);
    let generated: Awaited<ReturnType<typeof generatePageContent>>;
    try {
      generated = await generatePageContent(entry, peerPages, publishedSlugs);
    } catch (err) {
      const error = failureMessage(err);
      console.error(`❌ Content generation failed for "${entry.slug}":`, error);
      return { success: false, error };
    }
    const ungated = await buildRowPayload(entry, generated, cityId, directCountryId);
    const gated = applyStaticQualityGate(entry, ungated, publishedSlugs, peerPages);
    if (gated.error) {
      console.error(`❌ ${gated.error} — skipping "${entry.slug}"`);
      return { success: false, error: gated.error };
    }
    const payload = gated.payload;

    const { data: inserted, error } = await db()
      .from("custom_pages")
      .insert({ slug: entry.slug, ...payload })
      .select("id")
      .single();
    if (error) {
      console.error(`❌ Failed to insert "${entry.slug}":`, error.message);
      return { success: false, error: error.message };
    }
    if (inserted?.id) {
      await persistPeerGraph({ ...source, id: inserted.id }, geoPool);
    }
    console.log(`✅ Published: yaarzo.com/${entry.slug}`);
    return { success: true };
  } catch (err) {
    const error = failureMessage(err);
    console.error(`❌ "${entry.slug}":`, error);
    return { success: false, error };
  }
}

function parseRegenerateSlugs(url: URL): string[] {
  const raw = url.searchParams.get("regenerate") ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function runStaticPublish(request: Request): Promise<Response> {
  const settings = await getAutomationSettings();
  if (!settings.automation_enabled) return pausedResponse();

  const pagesPerRun = Math.max(0, Number(settings.static_pages_per_day) || 0);
  const url = new URL(request.url);
  const regenerateSlugs = parseRegenerateSlugs(url);

  const { data: ideaRows, error: ideasError } = await db()
    .from("static_page_ideas")
    .select("slug, section, base_name, lookup_city, lookup_country_hint, keywords")
    .order("created_at", { ascending: true });

  if (ideasError) {
    return Response.json({ error: ideasError.message }, { status: 500 });
  }

  const masterList: StaticPageEntry[] = (ideaRows ?? []) as StaticPageEntry[];
  const results: StaticPublishResult[] = [];

  if (regenerateSlugs.length > 0) {
    for (const slug of regenerateSlugs) {
      const entry = masterList.find((e) => e.slug === slug);
      if (!entry) {
        results.push({
          slug,
          success: false,
          regenerated: true,
          error: `Slug "${slug}" not found in static_page_ideas`,
        });
        continue;
      }
      const outcome = await regeneratePage(entry);
      results.push({ slug, success: outcome.success, regenerated: true, error: outcome.error });
    }
  }

  const existingSlugs = await getExistingSlugs();
  const pending = masterList.filter((e) => !existingSlugs.has(e.slug));
  const toPublish = pending.slice(0, pagesPerRun);

  for (const entry of toPublish) {
    const outcome = await publishNewPage(entry);
    results.push({ slug: entry.slug, success: outcome.success, error: outcome.error });
  }

  const published = results.filter((r) => r.success && !r.regenerated).length;
  return Response.json({ published, results });
}
