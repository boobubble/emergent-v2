/**
 * Port of automation-scripts/auto-publish-blog.cjs.
 * Generation logic is unchanged; topics come from blog_topic_ideas
 * and the per-run count from automation_settings.blog_posts_per_day.
 *
 * Internal chatroom links are filtered to published custom_pages slugs
 * (never /chatrooms). AI tags pass sanitizePipelineTags / detectHashtagDump
 * before insert.
 */
import Anthropic from "@anthropic-ai/sdk";
import { chatroomUrls } from "@/lib/content-automation/chatroom-urls";
import { db, getAutomationSettings, pausedResponse } from "@/lib/content-automation/db";
import { YAARZO_MASTER_SYSTEM_PROMPT } from "@/lib/content-automation/master-content-rules";
import {
  BLOG_INTERNAL_LINK_MAX,
  BLOG_INTERNAL_LINK_MIN,
  filterPublishedHrefs,
  padInternalLinks,
  pickPublishedInternalHref,
  pickPublishedInternalHrefs,
  preparePublishablePage,
  ensurePlannedLinks,
  type PlannedInternalLink,
} from "@/lib/content-automation/publish-quality";
import { claimDailyPublishSlot, finishJob, remainingPublishSlots } from "@/lib/content-automation/job-lock";
import {
  applyPexelsIfEnabled,
  blockIfExactCannibalization,
  buildGenerationContext,
  formatGenerationContextBlock,
  maybeTwoWayLink,
  recordPublishedBundle,
  thinContentError,
} from "@/lib/content-automation/seo-engine";
import { runDueRefresh } from "@/lib/content-automation/seo-refresh";
import {
  shouldEnforceThinContent,
  shouldInjectSeoContext,
  shouldDiscoverRelatedPages,
} from "@/lib/content-automation/seo-settings";
import type { SeoJobRow } from "@/lib/content-automation/job-lock";

export type BlogTopic = {
  title: string;
  category_slug: string;
  metaDescription: string;
  keywords: string | null;
};

export type PublishResult = { title: string; success: boolean; error?: string };

function failureMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return String(err);
}

function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey });
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

async function generateUniqueSlug(title: string) {
  const base = slugify(title);
  let candidate = base;
  let counter = 2;
  while (true) {
    const { data } = await db().from("blog_posts").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
}

function slugFromChatroom(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?yaarzo\.com/i, "").replace(/^\//, "").split("/")[0] || "";
}

function pickChatroomUrl(title: string, publishedSlugs: Set<string>) {
  const lower = title.toLowerCase();
  const mapped: string[] = [];
  for (const [keyword, url] of Object.entries(chatroomUrls.keywordMap)) {
    if (lower.includes(keyword)) mapped.push(url);
  }
  const preferred = filterPublishedHrefs(mapped, publishedSlugs);
  if (preferred.length > 0) return preferred[0];
  return pickPublishedInternalHref(
    [...chatroomUrls.interest, ...chatroomUrls.type],
    publishedSlugs,
  );
}

async function loadPublishedPageSlugs(): Promise<Set<string>> {
  const { data } = await db().from("custom_pages").select("slug").eq("status", "published");
  return new Set((data ?? []).map((p: { slug: string }) => String(p.slug).replace(/^\/+/, "").toLowerCase()));
}

function labelFromHref(href: string): string {
  const slug = href.replace(/^https?:\/\/(www\.)?yaarzo\.com/i, "").replace(/^\//, "").split("/")[0] || "";
  return slug.replace(/-chat-room$/i, "").replace(/-/g, " ") || "related page";
}

async function generateContent(title: string, planned: PlannedInternalLink[], seoContext = "") {
  const linkLines = planned
    .map((item, i) => `${i + 1}. <a href="${item.href}"> — short 2-5 word natural anchor about "${item.label}". Never dump a full page title.`)
    .join("\n");
  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4500,
    system: YAARZO_MASTER_SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `Write an SEO-optimized blog post for Yaarzo, a free online chatroom and social community platform, on the topic: "${title}".

Target audience: global, English-speaking.
${seoContext ? `\n${seoContext}\n` : ""}
Structure rules:
- Do NOT include an <h1>
- Use 3-5 <h2> section headings targeting natural long-tail search phrases
- Use <h3> sub-headings where it helps scannability
- Aim for 1,200–1,500 useful words. Do not pad with filler to hit the range.
- Write for humans first: specific, concrete advice, no generic filler
- Vary sentence rhythm — mix short and long sentences like a real writer would
- Output clean HTML only (h2, h3, p, ul/li, strong, a, and the one HTML comment described below) — no <html>/<body>/<h1> tags
- Right after the intro paragraph, insert exactly this on its own line: <!-- IMAGE: a real 5-10 word description of an image that would fit here --> (do not embed an actual <img> tag; a server-side image step may replace this comment)

Include 2-3 internal links from this allowed list only, naturally placed in different sections (not next to each other). Every link must be relevant. Varied anchors — never repeat the same link text.
${linkLines}

HARD: Never output "/chatrooms" (use "/chatroom" only if linking the chat hub). Never output "/p/{slug}" — use "/{slug}". Do not invent unpublished slugs — only the URLs listed above. Do not add extra links beyond this list.

After the article, on a new line, output exactly:
---META---
KEYWORDS: keyword one, keyword two, keyword three, keyword four, keyword five
TAGS: 8-12 topical tags (places, languages, cultures, themes). At most 3 tags may contain the word "chat". Do not repeat the title with minor variations.
READING_TIME: <integer minutes>`,
    }],
  });

  const fullText = message.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const [contentHtml, metaBlock] = fullText.split("---META---");

  const keywordsMatch = metaBlock?.match(/KEYWORDS:\s*(.+)/i);
  const tagsMatch = metaBlock?.match(/TAGS:\s*(.+)/i);
  const readingTimeMatch = metaBlock?.match(/READING_TIME:\s*(\d+)/i);

  let finalHtml = ensurePlannedLinks(contentHtml.trim(), planned, BLOG_INTERNAL_LINK_MAX);
  finalHtml = padInternalLinks(finalHtml, planned, BLOG_INTERNAL_LINK_MIN, BLOG_INTERNAL_LINK_MAX);

  return {
    contentHtml: finalHtml,
    keywords: keywordsMatch?.[1]?.trim() ?? "",
    tags: tagsMatch?.[1]?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
    readingTime: readingTimeMatch ? parseInt(readingTimeMatch[1], 10) : 5,
  };
}

async function getCategoryId(slug: string) {
  const { data } = await db().from("categories").select("id").eq("slug", slug).single();
  return data?.id ?? null;
}

async function getAlreadyPublishedTitles() {
  const { data } = await db().from("blog_posts").select("title");
  return new Set((data ?? []).map((p: { title: string }) => p.title.trim()));
}

async function getRelatedBlogPosts(categoryId: string, excludeSlug: string, count = 3) {
  if (!categoryId) return [];
  const { data } = await db()
    .from("blog_posts")
    .select("id, title, slug")
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("slug", excludeSlug)
    .limit(count);
  return (data ?? []) as Array<{ id: string; title: string; slug: string }>;
}

async function publishTopic(
  topic: BlogTopic,
  slot: number,
  settings: Awaited<ReturnType<typeof getAutomationSettings>>,
  existingJobId?: string,
): Promise<PublishResult> {
  let jobId = existingJobId;
  if (!jobId) {
    const claimed = await claimDailyPublishSlot({ kind: "blog", slot, title: topic.title });
    if (!claimed.ok) {
      return { title: topic.title, success: false, error: `Job ${claimed.reason}` };
    }
    jobId = claimed.job.id;
  }
  try {
    console.log(`\n📝 Generating: ${topic.title}...`);

    const ctx = await buildGenerationContext({
      kind: "blog",
      title: topic.title,
      keywords: topic.keywords,
      discoverRelated: shouldDiscoverRelatedPages(settings),
    });
    const blocked = await blockIfExactCannibalization(settings, ctx, {
      type: "blog",
      url: `pending:${topic.title}`,
    });
    if (blocked) {
      await finishJob(jobId, "skipped", { error: blocked, title: topic.title });
      return { title: topic.title, success: false, error: blocked };
    }

    const publishedSlugs = await loadPublishedPageSlugs();
    let slug: string;
    let categoryId: string | null;
    try {
      [slug, categoryId] = await Promise.all([
        generateUniqueSlug(topic.title),
        getCategoryId(topic.category_slug),
      ]);
    } catch (err) {
      const error = failureMessage(err);
      console.error(`❌ Content generation failed for "${topic.title}":`, error);
      await finishJob(jobId, "failed", { error, title: topic.title });
      return { title: topic.title, success: false, error };
    }

    if (!categoryId) {
      const error = `Category "${topic.category_slug}" not found in categories table`;
      console.error(`❌ ${error} — skipping "${topic.title}"`);
      await finishJob(jobId, "failed", { error, title: topic.title });
      return { title: topic.title, success: false, error };
    }

    const chatroomUrl = pickChatroomUrl(topic.title, publishedSlugs);
    const extraRooms = pickPublishedInternalHrefs(
      [...chatroomUrls.interest, ...chatroomUrls.type],
      publishedSlugs,
      { excludeSlug: slugFromChatroom(chatroomUrl), count: 2 },
    );
    const relatedPosts = await getRelatedBlogPosts(categoryId, slug, 1);
    const planned: PlannedInternalLink[] = [];
    const seen = new Set<string>();
    const add = (href: string, label: string) => {
      const key = href.replace(/^https?:\/\/(www\.)?yaarzo\.com/i, "").replace(/\/+$/, "").toLowerCase();
      if (!href || seen.has(key)) return;
      seen.add(key);
      planned.push({ href, label });
    };
    add("https://yaarzo.com/signup", "create your free account");
    add(chatroomUrl, labelFromHref(chatroomUrl));
    for (const href of extraRooms) add(href, labelFromHref(href));
    if (relatedPosts[0]) add(`https://yaarzo.com/blog/${relatedPosts[0].slug}`, "this related read");
    add("https://yaarzo.com/feed", "community feed");
    const linkPlan = planned.slice(0, 5);

    let generated: Awaited<ReturnType<typeof generateContent>>;
    try {
      generated = await generateContent(
        topic.title,
        linkPlan,
        shouldInjectSeoContext(settings) ? formatGenerationContextBlock(ctx) : "",
      );
    } catch (err) {
      const error = failureMessage(err);
      console.error(`❌ Content generation failed for "${topic.title}":`, error);
      await finishJob(jobId, "failed", { error, title: topic.title });
      return { title: topic.title, success: false, error };
    }

    const padded = padInternalLinks(generated.contentHtml, linkPlan, BLOG_INTERNAL_LINK_MIN, BLOG_INTERNAL_LINK_MAX);
    const prepared = preparePublishablePage({
      slug,
      title: topic.title,
      h1: topic.title,
      meta_title: topic.title,
      meta_description: topic.metaDescription,
      content: padded,
      tags: generated.tags,
      publishedSlugs,
      linkCount: { min: BLOG_INTERNAL_LINK_MIN, max: BLOG_INTERNAL_LINK_MAX },
    });
    if (prepared.blocked) {
      const error = `Quality gate: ${prepared.blockReason}`;
      console.error(`❌ ${error} — skipping "${topic.title}"`);
      await finishJob(jobId, "failed", { error, title: topic.title, slug });
      return { title: topic.title, success: false, error };
    }

    const thin = shouldEnforceThinContent(settings) ? thinContentError("blog", prepared.content) : null;
    if (thin) {
      console.error(`❌ ${thin} — skipping "${topic.title}"`);
      await finishJob(jobId, "failed", { error: thin, title: topic.title, slug });
      return { title: topic.title, success: false, error: thin };
    }

    const image = await applyPexelsIfEnabled({
      settings,
      html: prepared.content,
      topic: topic.title,
      primaryKeyword: ctx.primaryKeyword,
      kind: "blog",
    });

    const now = new Date().toISOString();
    const { data: inserted, error: insertError } = await db()
      .from("blog_posts")
      .insert({
        title: topic.title,
        slug,
        meta_description: topic.metaDescription,
        content: image.html,
        keywords: topic.keywords?.trim() || generated.keywords,
        tags: prepared.tags,
        reading_time_minutes: generated.readingTime,
        category_id: categoryId,
        author_id: null,
        published_at: now,
        last_refreshed_at: now,
        status: "published",
      })
      .select()
      .single();

    if (insertError) {
      console.error(`❌ Insert failed for "${topic.title}":`, insertError.message);
      await finishJob(jobId, "failed", { error: insertError.message, title: topic.title, slug });
      return { title: topic.title, success: false, error: insertError.message };
    }

    await recordPublishedBundle({
      kind: "blog",
      sourceId: String(inserted.id),
      slug,
      title: topic.title,
      html: image.html,
      primaryKeyword: ctx.primaryKeyword,
      keywords: topic.keywords?.trim() || generated.keywords,
      intent: ctx.searchIntent,
      imageStatus: image.imageStatus,
      refreshDays: settings.refresh_interval_days,
    });
    await maybeTwoWayLink({
      settings,
      kind: "blog",
      newSlug: slug,
      newTitle: topic.title,
      related: relatedPosts.map((p) => ({ slug: p.slug, title: p.title, id: p.id })),
    });

    await finishJob(jobId, "completed", {
      sourceId: String(inserted.id),
      slug,
      title: topic.title,
      result: { imageStatus: image.imageStatus, photoId: image.photoId },
    });
    console.log(`✅ Published: yaarzo.com/blog/${slug}`);
    return { title: topic.title, success: true };
  } catch (err) {
    const error = failureMessage(err);
    console.error(`❌ "${topic.title}":`, error);
    await finishJob(jobId, "failed", { error, title: topic.title });
    return { title: topic.title, success: false, error };
  }
}

export async function runBlogPublish(): Promise<Response> {
  const settings = await getAutomationSettings();
  if (!settings.automation_enabled) return pausedResponse();

  const quota = await remainingPublishSlots(settings);
  const postsPerRun = quota.blogs;
  if (postsPerRun === 0) {
    const refresh = settings.content_refresh_enabled ? await runDueRefresh("blog", 1) : { refreshed: 0 };
    return Response.json({
      published: 0,
      results: [] as PublishResult[],
      quota,
      refresh,
      message: "Daily blog quota already used or paused at 0.",
    });
  }

  const { data: ideaRows, error: ideasError } = await db()
    .from("blog_topic_ideas")
    .select("title, category_slug, meta_description, keywords, generation_ready")
    .order("created_at", { ascending: true });

  if (ideasError) {
    // Backward-compatible if migration not applied yet
    if (/generation_ready|schema cache|column/i.test(ideasError.message)) {
      const fallback = await db()
        .from("blog_topic_ideas")
        .select("title, category_slug, meta_description, keywords")
        .order("created_at", { ascending: true });
      if (fallback.error) return Response.json({ error: fallback.error.message }, { status: 500 });
      const allTopicsFallback: BlogTopic[] = (fallback.data ?? []).map((row: {
        title: string;
        category_slug: string;
        meta_description: string | null;
        keywords: string | null;
      }) => ({
        title: row.title,
        category_slug: row.category_slug,
        metaDescription: row.meta_description ?? "",
        keywords: row.keywords?.trim() || null,
      }));
      const publishedTitlesFb = await getAlreadyPublishedTitles();
      const pendingFb = allTopicsFallback.filter((t) => !publishedTitlesFb.has(t.title.trim()));
      if (pendingFb.length === 0) {
        return Response.json({ published: 0, results: [] as PublishResult[], message: "All topics have already been published." });
      }
      const toPublishFb = pendingFb.slice(0, postsPerRun);
      const resultsFb: PublishResult[] = [];
      for (let i = 0; i < toPublishFb.length; i++) {
        resultsFb.push(await publishTopic(toPublishFb[i], quota.blogsUsed + i + 1, settings));
      }
      const publishedFb = resultsFb.filter((r) => r.success).length;
      const refreshFb = settings.content_refresh_enabled ? await runDueRefresh("blog", 1) : { refreshed: 0 };
      return Response.json({ published: publishedFb, results: resultsFb, quota, refresh: refreshFb });
    }
    return Response.json({ error: ideasError.message }, { status: 500 });
  }

  const ranked = [...(ideaRows ?? [])].sort((a: { generation_ready?: boolean | null }, b: { generation_ready?: boolean | null }) =>
    Number(Boolean(b.generation_ready)) - Number(Boolean(a.generation_ready)),
  );

  const allTopics: BlogTopic[] = ranked.map((row: {
    title: string;
    category_slug: string;
    meta_description: string | null;
    keywords: string | null;
  }) => ({
    title: row.title,
    category_slug: row.category_slug,
    metaDescription: row.meta_description ?? "",
    keywords: row.keywords?.trim() || null,
  }));

  const publishedTitles = await getAlreadyPublishedTitles();
  const pendingTopics = allTopics.filter((t) => !publishedTitles.has(t.title.trim()));

  if (pendingTopics.length === 0) {
    return Response.json({ published: 0, results: [] as PublishResult[], message: "All topics have already been published." });
  }

  const toPublish = pendingTopics.slice(0, postsPerRun);
  const results: PublishResult[] = [];

  for (let i = 0; i < toPublish.length; i++) {
    results.push(await publishTopic(toPublish[i], quota.blogsUsed + i + 1, settings));
  }

  const published = results.filter((r) => r.success).length;
  const refresh = settings.content_refresh_enabled ? await runDueRefresh("blog", 1) : { refreshed: 0 };
  return Response.json({ published, results, quota, refresh });
}

export async function retryBlogPublishFromJob(
  job: SeoJobRow,
  settings: Awaited<ReturnType<typeof getAutomationSettings>>,
): Promise<PublishResult> {
  if (job.source_id) {
    const { data } = await db().from("blog_posts").select("id").eq("id", job.source_id).maybeSingle();
    if (data) {
      await finishJob(job.id, "completed", { result: { skipped: "already_published" }, sourceId: job.source_id });
      return { title: job.title || "", success: true };
    }
  }
  if (!job.title) {
    await finishJob(job.id, "failed", { error: "Retry missing title" });
    return { title: "", success: false, error: "Retry missing title" };
  }
  const publishedTitles = await getAlreadyPublishedTitles();
  if (publishedTitles.has(job.title.trim())) {
    await finishJob(job.id, "completed", { result: { skipped: "already_published" }, title: job.title });
    return { title: job.title, success: true };
  }
  const { data: idea } = await db()
    .from("blog_topic_ideas")
    .select("title, category_slug, meta_description, keywords")
    .eq("title", job.title)
    .maybeSingle();
  if (!idea) {
    await finishJob(job.id, "failed", { error: "Idea not found for retry", title: job.title });
    return { title: job.title, success: false, error: "Idea not found for retry" };
  }
  return publishTopic({
    title: idea.title,
    category_slug: idea.category_slug,
    metaDescription: idea.meta_description ?? "",
    keywords: idea.keywords?.trim() || null,
  }, job.slot ?? 1, settings, job.id);
}
